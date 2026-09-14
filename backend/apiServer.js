import http from 'node:http'
import { createHash, createHmac, randomUUID, timingSafeEqual } from 'node:crypto'
import { getApps, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'
import { getStorage } from 'firebase-admin/storage'
import { createInMemoryStore } from './store.js'
import { createReportingAccess } from './reportingAccess.js'
import { createDepositService } from './deposits.js'
import { createInventoryService } from './inventoryService.js'
import { createTaskCommentsService } from './taskComments.js'
import {
  DEFAULT_GEMINI_MODEL,
  DEFAULT_LLM_PROVIDER,
  DEFAULT_VERTEX_LOCATION,
  DEFAULT_VERTEX_PUBLISHER,
  resolveVertexProjectId,
} from './agent/llm/modelRouter.js'
import { runFormIntakeSkill } from './agent/skills/formIntake.js'
import { runTaskInsightSkill } from './agent/skills/taskInsight.js'
import { truncateForLog } from './agent/utils/text.js'
import {
  transitionLead,
  transitionBid,
  transitionAssignment,
  extractSemanticTags,
  matchLeadToSps,
  isSpEligibleForLead,
  selectBidAndAssign,
} from './marketplace.js'

const json = (res, statusCode, payload, extraHeaders = {}) => {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers':
      'Content-Type, Authorization, X-User-Id, X-User-Role, X-User-Country, X-User-State, X-User-City, Idempotency-Key',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    ...extraHeaders,
  })
  res.end(JSON.stringify(payload))
}

const readBody = async (req) => {
  if (req && typeof req.body === 'object' && req.body !== null) return req.body
  if (typeof req?.body === 'string') {
    try {
      return req.body ? JSON.parse(req.body) : {}
    } catch {
      throw new Error('invalid_json')
    }
  }
  if (req?.rawBody && Buffer.isBuffer(req.rawBody)) {
    const raw = req.rawBody.toString('utf-8')
    try {
      return raw ? JSON.parse(raw) : {}
    } catch {
      throw new Error('invalid_json')
    }
  }

  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', (chunk) => chunks.push(chunk))
    req.on('end', () => {
      if (!chunks.length) return resolve({})
      const raw = Buffer.concat(chunks).toString('utf-8')
      try {
        resolve(raw ? JSON.parse(raw) : {})
      } catch {
        reject(new Error('invalid_json'))
      }
    })
    req.on('error', reject)
  })
}

const pathMatch = (pathname, pattern) => {
  const source = pathname.split('/').filter(Boolean)
  const target = pattern.split('/').filter(Boolean)
  if (source.length !== target.length) return null
  const params = {}
  for (let i = 0; i < target.length; i += 1) {
    const token = target[i]
    if (token.startsWith(':')) {
      params[token.slice(1)] = decodeURIComponent(source[i])
      continue
    }
    if (source[i] !== token) return null
  }
  return params
}

const withRequestId = (req) => req.headers['x-request-id'] || randomUUID()

const sendError = (res, requestId, statusCode, code, message, retryable = false, gate = null) =>
  json(res, statusCode, {
    request_id: requestId,
    error_code: code,
    message,
    retryable,
    ...(gate || {}),
  })

const ok = (res, requestId, payload) => json(res, 200, { request_id: requestId, ...payload })
const redirect = (res, location) => {
  res.writeHead(302, {
    Location: location,
    'Access-Control-Allow-Origin': '*',
  })
  res.end()
}
const notModified = (res, etag) => {
  res.writeHead(304, {
    'Access-Control-Allow-Origin': '*',
    ETag: etag,
  })
  res.end()
}
const createApiError = (status, code, message) =>
  Object.assign(new Error(message), { status, code })

const getPermissions = (role) => {
  switch (role) {
    case 'pm_po':
      return [
        'task:create',
        'task:status:update',
        'inventory:create',
        'sp:assign',
        'sp:card:write',
        'invoice:review',
        'reports:all',
        'lead:create',
        'lead:manage',
        'bid:review',
        'bid:select',
        'conversation:create',
        'conversation:read',
        'message:send',
      ]
    case 'tt':
      return ['task:create', 'task:comment', 'inventory:draft:update', 'inventory:submit']
    case 'sp':
      return [
        'task:comment',
        'invoice:create',
        'invoice:submit',
        'lead:view',
        'bid:create',
        'bid:withdraw',
        'conversation:read',
        'message:send',
        'assignment:respond',
      ]
    case 'admin':
      return ['reports:all', 'billing:read']
    default:
      return []
  }
}

const assertRole = ({ actor, allowed, res, requestId }) => {
  if (allowed.includes(actor.role)) return true
  sendError(res, requestId, 403, 'PERMISSION_DENIED', 'Role is not allowed for this action')
  return false
}

const getQuotaStatus = (used, limit) => {
  const safeUsed = Math.max(0, Number(used || 0))
  const safeLimit = Math.max(0, Number(limit || 0))
  if (safeLimit <= 0) return safeUsed > 0 ? 'blocked' : 'normal'
  const ratio = safeUsed / safeLimit
  if (ratio >= 1) return 'blocked'
  if (ratio >= 0.8) return 'warning'
  return 'normal'
}

const getQuotaGateMessage = (status, label) => {
  if (status === 'blocked') return `${label} limit reached. Upgrade required.`
  if (status === 'warning') return `${label} usage is nearing the limit.`
  return ''
}

const findFirst = (collection, predicate) => {
  for (const row of collection.values()) {
    if (predicate(row)) return row
  }
  return null
}

const TASKS_COLLECTION = 'tasks'
const LEADS_COLLECTION = 'marketplace_leads'
const LEAD_BIDS_SUBCOLLECTION = 'bids'
const SP_CREDIT_ACCOUNTS_COLLECTION = 'sp_credit_accounts'
const SP_CREDIT_LEDGER_COLLECTION = 'sp_credit_ledger'
const SP_CREDIT_ORDERS_COLLECTION = 'sp_credit_orders'
const STORAGE_UPLOAD_RESERVATIONS_COLLECTION = 'storage_upload_reservations'
const ACCOUNT_DELETION_REQUESTS_COLLECTION = 'account_deletion_requests'
const CONTENT_REPORTS_COLLECTION = 'content_reports'
const ADMIN_METRICS_DAILY_COLLECTION = 'admin_metrics_daily'
const ADMIN_EVENTS_COLLECTION = 'admin_events'
const ADMIN_ERRORS_COLLECTION = 'admin_errors'
const ADMIN_DATA_CHANGE_LOGS_COLLECTION = 'admin_data_change_logs'
const SUPPORT_TICKETS_COLLECTION = 'support_tickets'
const SUPPORT_TICKET_COMMENTS_COLLECTION = 'support_ticket_comments'
const AGENT_EVENTS_COLLECTION = 'agent_events'
const AD_POSTS_COLLECTION = 'ad_posts'
const AD_DELIVERIES_COLLECTION = 'ad_deliveries'
const AD_IMPRESSIONS_COLLECTION = 'ad_impressions'
const AD_CLICKS_COLLECTION = 'ad_clicks'
const AD_FEED_CACHE_COLLECTION = 'ad_feed_cache'
const SP_BID_CREDIT_COST = 1
const SP_INITIAL_FREE_CREDITS = 3
const SP_WEEKLY_FREE_CREDITS = 1
const SP_FREE_CREDIT_INTERVAL_MS = 7 * 24 * 60 * 60 * 1000
const SP_BID_CREDIT_SKUS = Object.freeze([
  {
    sku_code: 'sp_bid_single',
    sku_name: 'Single bid credit',
    credits: 1,
    amount_cents: 499,
    currency: 'USD',
    always_on: true,
  },
  {
    sku_code: 'sp_bid_starter_10',
    sku_name: 'Starter bid credit pack',
    credits: 10,
    amount_cents: 2999,
    currency: 'USD',
    always_on: true,
  },
])
const SP_CREDIT_ORDER_STATUSES = new Set([
  'pending',
  'created',
  'checkout_created',
  'paid',
  'credited',
  'failed',
  'canceled',
  'cancelled',
  'refunded',
])
const TASK_ADDRESS_BACKFILL_TOKEN = 'backfill-2026-04-02'
const SUPPORT_TICKET_STATUSES = new Set([
  'open',
  'triaged',
  'in_progress',
  'waiting_on_user',
  'resolved',
  'closed',
])
const SUPPORT_TICKET_CATEGORIES = new Set(['account', 'task_lead', 'payment_credit', 'bug'])
const SUPPORT_TICKET_PRIORITIES = new Set(['low', 'normal', 'high', 'urgent'])
const ADMIN_DATA_COLLECTION_ALLOWLIST = new Set([
  'users',
  ACCOUNT_DELETION_REQUESTS_COLLECTION,
  CONTENT_REPORTS_COLLECTION,
  TASKS_COLLECTION,
  LEADS_COLLECTION,
  SP_CREDIT_ACCOUNTS_COLLECTION,
  SP_CREDIT_ORDERS_COLLECTION,
  SP_CREDIT_LEDGER_COLLECTION,
  ADMIN_METRICS_DAILY_COLLECTION,
  ADMIN_EVENTS_COLLECTION,
  ADMIN_ERRORS_COLLECTION,
  SUPPORT_TICKETS_COLLECTION,
  SUPPORT_TICKET_COMMENTS_COLLECTION,
  AGENT_EVENTS_COLLECTION,
  'owner_invites',
])
let firestoreDb = null
let firebaseAuth = null
let storageBucket = null
const firebaseAdapterScopes = []
let firebaseAdapterBaseline = null

const installFirebaseAdapterScope = ({
  firestoreDb: injectedFirestoreDb,
  firebaseAuth: injectedFirebaseAuth,
  storageBucket: injectedStorageBucket,
}) => {
  if (!injectedFirestoreDb && !injectedFirebaseAuth && !injectedStorageBucket) return () => {}

  if (!firebaseAdapterScopes.length) {
    firebaseAdapterBaseline = { firestoreDb, firebaseAuth, storageBucket }
  }

  const scope = { injectedFirestoreDb, injectedFirebaseAuth, injectedStorageBucket }
  firebaseAdapterScopes.push(scope)

  const applyActiveScope = () => {
    const activeFirestore = [...firebaseAdapterScopes]
      .reverse()
      .find((entry) => entry.injectedFirestoreDb)
    const activeAuth = [...firebaseAdapterScopes]
      .reverse()
      .find((entry) => entry.injectedFirebaseAuth)
    const activeStorage = [...firebaseAdapterScopes]
      .reverse()
      .find((entry) => entry.injectedStorageBucket)
    firestoreDb =
      activeFirestore?.injectedFirestoreDb || firebaseAdapterBaseline?.firestoreDb || null
    firebaseAuth = activeAuth?.injectedFirebaseAuth || firebaseAdapterBaseline?.firebaseAuth || null
    storageBucket =
      activeStorage?.injectedStorageBucket || firebaseAdapterBaseline?.storageBucket || null
  }

  applyActiveScope()

  let disposed = false
  return () => {
    if (disposed) return
    disposed = true
    const index = firebaseAdapterScopes.indexOf(scope)
    if (index !== -1) firebaseAdapterScopes.splice(index, 1)
    applyActiveScope()
    if (!firebaseAdapterScopes.length) firebaseAdapterBaseline = null
  }
}

const DEFAULT_INVITE_EMAIL_FROM = 'onboarding@resend.dev'
const OWNER_INVITE_PENDING = 'pending'
const OWNER_INVITE_ACCEPTED = 'accepted'
const OWNER_INVITE_REVOKED = 'revoked'
const OWNER_INVITE_EXPIRED = 'expired'
const PROPERTY_ACCESS_INVITE_PENDING = 'pending'
const PROPERTY_ACCESS_INVITE_ACCEPTED = 'accepted'
const PROPERTY_ACCESS_INVITE_REVOKED = 'revoked'
const PROPERTY_ACCESS_INVITE_EXPIRED = 'expired'
const PROPERTY_ACCESS_ROLES = new Set(['owner', 'manager', 'viewer'])

const randomHex = () => randomUUID().replace(/-/g, '')
const generateOwnerInviteToken = () => `${randomHex()}${randomHex()}`
const createOwnerInviteExpiry = (days = 7) => {
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + days)
  return expiresAt
}
const normalizeEmail = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()
const normalizePropertyAccessRole = (value) => {
  const role = String(value || '')
    .trim()
    .toLowerCase()
  return PROPERTY_ACCESS_ROLES.has(role) ? role : null
}
const propertyAccessRoleLabel = (role) =>
  ({
    owner: 'Owner',
    manager: 'Property manager',
    viewer: 'View only',
  })[normalizePropertyAccessRole(role)] || 'Property access'
const propertyAccessMembershipRole = (role) =>
  ({
    owner: 'po',
    manager: 'pm',
    viewer: 'viewer',
  })[normalizePropertyAccessRole(role)] || null
const propertyAccessUserIdsField = (role) =>
  ({
    owner: 'owner_user_ids',
    manager: 'manager_user_ids',
    viewer: 'viewer_user_ids',
  })[normalizePropertyAccessRole(role)] || null
const asDate = (value) => {
  if (!value) return null
  if (typeof value?.toDate === 'function') return value.toDate()
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}
const escapeHtml = (value) =>
  String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

const normalizePropertyId = (value) => {
  if (value == null) return null
  const normalized = String(value).trim()
  return normalized || null
}

const extractPropertyId = (value) => {
  if (value == null) return null
  if (typeof value === 'string' || typeof value === 'number') {
    return normalizePropertyId(value)
  }
  if (value?.id) return normalizePropertyId(value.id)
  if (value?.property_id) return extractPropertyId(value.property_id)
  if (value?.property?.id) return normalizePropertyId(value.property.id)
  if (typeof value?.path === 'string') {
    const parts = value.path.split('/').filter(Boolean)
    return parts.length ? normalizePropertyId(parts[parts.length - 1]) : null
  }
  return null
}

const getDb = () => {
  if (firestoreDb) return firestoreDb
  if (!getApps().length) initializeApp()
  firestoreDb = getFirestore()
  return firestoreDb
}

const getFirebaseAuth = () => {
  if (firebaseAuth) return firebaseAuth
  if (!getApps().length) initializeApp()
  firebaseAuth = getAuth()
  return firebaseAuth
}

const getStorageBucket = () => {
  if (storageBucket) return storageBucket
  if (!getApps().length) initializeApp()
  storageBucket = getStorage().bucket()
  return storageBucket
}

const normalizeRole = (role) => {
  const next = String(role || '')
    .trim()
    .toLowerCase()
  if (next === 'pm' || next === 'po' || next === 'pm_po') return 'pm_po'
  if (next === 'sp') return 'sp'
  if (next === 'tt') return 'tt'
  if (next === 'admin') return 'admin'
  return null
}

const normalizeLead = (lead) => {
  if (!lead) return null
  const id = lead.id || lead.lead_id
  return { ...lead, id, lead_id: lead.lead_id || id }
}

const normalizeBid = (bid) => {
  if (!bid) return null
  const id = bid.id || bid.bid_id
  const rawStatus = String(bid.status || 'submitted')
    .trim()
    .toLowerCase()
  const validUntilValue = bid.valid_until
  const validUntilDate = validUntilValue ? new Date(validUntilValue) : null
  const isExpired = Boolean(
    validUntilDate &&
      !Number.isNaN(validUntilDate.getTime()) &&
      ['submitted', 'shortlisted'].includes(rawStatus) &&
      validUntilDate.getTime() < Date.now(),
  )
  return {
    ...bid,
    id,
    bid_id: bid.bid_id || id,
    status: rawStatus === 'selected' ? 'accepted' : isExpired ? 'expired' : rawStatus,
  }
}

const normalizeTaskStatus = (status) =>
  String(status || '')
    .trim()
    .toLowerCase()

const mapTaskStatusToLeadStatus = (taskStatus, currentLeadStatus = 'open') => {
  const normalized = normalizeTaskStatus(taskStatus)
  if (!normalized) return null

  if (['closed', 'complete', 'completed', 'resolved'].includes(normalized)) return 'closed'
  if (['cancel', 'cancelled', 'canceled'].includes(normalized)) return 'cancelled'
  if (['open', 'new', 'pending', 'in_progress', 'reopened'].includes(normalized)) {
    return currentLeadStatus === 'assigned' ? 'assigned' : 'open'
  }
  return null
}

const isMaintenanceRelated = (text = '') => {
  const value = String(text || '').toLowerCase()
  return /(leak|drip|pipe|toilet|sink|faucet|water|plumbing|electrical|outlet|breaker|power|wiring|light|ac|air\s*conditioning|hvac|heat|heater|thermostat|washer|dryer|dishwasher|fridge|refrigerator|stove|oven|clog|mold|pest|roof|window|door|lock|garage|vent|transaction|payment|paid|pay|invoice|rent|deposit|refund|fee|charge|transfer|remind|reminder|due|renewal|renew|schedule|scheduled|recurring|monthly|weekly|yearly|annual|floor|flooring|spc|paint|painting|fence|gate|garden|gardening|landscaping|service|vendor|provider|contract|company|loan|insurance|pest control|lawn|pool|cleaning|security|alarm|trash|waste|snow removal)/.test(
    value,
  )
}

const withIdempotency = ({ store, key, resolver }) => {
  if (!key) return resolver()
  if (store.idempotency.has(key)) return store.idempotency.get(key)
  const next = resolver()
  store.idempotency.set(key, next)
  return next
}

export const createApiServer = ({ store = createInMemoryStore(), config = {} } = {}) => {
  // Local contract tests can inject isolated Firebase adapters without credentials.
  const disposeFirebaseAdapters = installFirebaseAdapterScope(config)
  const routes = []
  const route = (method, pattern, handler) => routes.push({ method, pattern, handler })
  const rateLimits = new Map()
  const geminiApiKey =
    config.geminiApiKey || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || ''
  const geminiModel = config.geminiModel || process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL
  const llmProvider = config.llmProvider || process.env.LLM_PROVIDER || DEFAULT_LLM_PROVIDER
  const vertexProjectId = resolveVertexProjectId(config)
  const vertexLocation =
    config.vertexLocation || process.env.VERTEX_LOCATION || DEFAULT_VERTEX_LOCATION
  const vertexPublisher =
    config.vertexPublisher || process.env.VERTEX_PUBLISHER || DEFAULT_VERTEX_PUBLISHER
  const resendApiKey = config.resendApiKey || process.env.RESEND_API_KEY || ''
  const inviteEmailFrom = String(
    config.inviteEmailFrom || process.env.INVITE_EMAIL_FROM || DEFAULT_INVITE_EMAIL_FROM,
  ).trim()
  const appBaseUrl = String(config.appBaseUrl || process.env.APP_BASE_URL || '').trim()
  const stripeSecretKey = String(
    config.stripeSecretKey || process.env.STRIPE_SECRET_KEY || '',
  ).trim()
  const stripeWebhookSecret = String(
    config.stripeWebhookSecret || process.env.STRIPE_WEBHOOK_SECRET || '',
  ).trim()
  const agentAllowedOrigins = String(
    config.agentAllowedOrigins || process.env.AGENT_ALLOWED_ORIGINS || '',
  ).trim()
  const agentRateLimitPerMin = Number(
    config.agentRateLimitPerMin || process.env.AGENT_RATE_LIMIT_PER_MIN || 30,
  )
  const feedCacheTtlMs =
    Math.max(0, Number(config.feedCacheTtlSeconds || process.env.FEED_CACHE_TTL_SECONDS || 60)) *
    1000
  const feedRequestWindowMs =
    Math.max(
      1000,
      Number(config.feedRequestWindowSeconds || process.env.FEED_REQUEST_WINDOW_SECONDS || 30),
    ) * 1000
  const feedMaxRequestsPerWindow = Math.max(
    1,
    Number(config.feedMaxRequestsPerWindow || process.env.FEED_MAX_REQUESTS_PER_WINDOW || 20),
  )
  const feedCache = new Map()
  const feedInFlight = new Map()
  const feedRequestBuckets = new Map()

  const isAllowedOrigin = (req) => {
    if (!agentAllowedOrigins) return true
    const origin = String(req.headers.origin || '').trim()
    if (!origin) return false
    return agentAllowedOrigins
      .split(',')
      .map((v) => v.trim())
      .includes(origin)
  }

  const hitRateLimit = ({ key, limit, windowMs = 60000 }) => {
    const now = Date.now()
    const bucket = rateLimits.get(key) || { count: 0, resetAt: now + windowMs }
    if (now > bucket.resetAt) {
      bucket.count = 0
      bucket.resetAt = now + windowMs
    }
    bucket.count += 1
    rateLimits.set(key, bucket)
    return bucket.count > limit
  }
  const extractBearerToken = (req) => {
    const raw = String(req.headers.authorization || '').trim()
    if (!raw.toLowerCase().startsWith('bearer ')) return null
    return raw.slice(7).trim() || null
  }

  const resolveActorFromRequest = async (req) => {
    const fallbackId = String(req.headers['x-user-id'] || 'u-tt-1')
    const fallbackRole = normalizeRole(req.headers['x-user-role'])
    const token = extractBearerToken(req)

    if (!token) {
      const actor = store.ensureUser(fallbackId, fallbackRole)
      if (fallbackRole) {
        actor.role = fallbackRole
        actor.account_type = fallbackRole
      }
      return {
        actor,
        verified: false,
        claims: null,
      }
    }

    try {
      const claims = await getFirebaseAuth().verifyIdToken(token)
      const claimRole = normalizeRole(claims?.role || claims?.account_type || claims?.user_category)
      const hasAdminClaim =
        claims?.admin === true || (Array.isArray(claims?.roles) && claims.roles.includes('admin'))
      const resolvedRole = hasAdminClaim ? 'admin' : claimRole || fallbackRole || 'tt'
      const actor = store.ensureUser(String(claims.uid || fallbackId), resolvedRole)
      actor.role = resolvedRole
      actor.account_type = resolvedRole
      actor.last_active_at = new Date().toISOString()
      if (claims?.email) actor.email = String(claims.email)

      return {
        actor,
        verified: true,
        claims,
      }
    } catch {
      const actor = store.ensureUser(fallbackId, fallbackRole)
      if (fallbackRole) {
        actor.role = fallbackRole
        actor.account_type = fallbackRole
      }
      return {
        actor,
        verified: false,
        claims: null,
      }
    }
  }
  const listFirestoreLeads = async ({ actor }) => {
    try {
      const db = getDb()
      let query = db.collection(LEADS_COLLECTION)
      if (actor.role === 'sp') query = query.where('status', '==', 'open')
      if (actor.role === 'pm_po') query = query.where('creator_id', '==', actor.id)
      const snap = await query.get()
      let items = snap.docs
        .map((doc) => normalizeLead({ id: doc.id, ...(doc.data() || {}) }))
        .sort((a, b) => String(b.created_at || '').localeCompare(String(a.created_at || '')))
      if (actor.role === 'sp') {
        let spProfile = store.spProfiles.get(actor.id) || null
        if (!spProfile) {
          try {
            const userSnap = await db.collection('users').doc(actor.id).get()
            const userData = userSnap.exists ? userSnap.data() || {} : {}
            const nested = userData?.sp_service_profile || null
            if (nested && typeof nested === 'object') {
              spProfile = {
                id: actor.id,
                user_id: actor.id,
                ...nested,
              }
            }
          } catch {
            spProfile = null
          }
        }
        if (!spProfile) return []
        items = items.filter((lead) => {
          const explicitlyPublished =
            lead?.sp_published === true ||
            String(lead?.sp_publish_status || '')
              .trim()
              .toLowerCase() === 'published'
          if (!explicitlyPublished) return false
          return isSpEligibleForLead(lead, spProfile)
        })
      }
      return items
    } catch {
      return []
    }
  }

  const getFirestoreLeadById = async (id) => {
    try {
      const db = getDb()
      const doc = await db.collection(LEADS_COLLECTION).doc(id).get()
      if (!doc.exists) return null
      return normalizeLead({ id: doc.id, ...(doc.data() || {}) })
    } catch {
      return null
    }
  }

  const getFirestoreLeadByTaskRef = async (taskRef) => {
    const ref = String(taskRef || '').trim()
    if (!ref) return null
    try {
      const db = getDb()
      const fields = ['mx_id', 'task_id', 'task_doc_id']
      for (const field of fields) {
        const snap = await db.collection(LEADS_COLLECTION).where(field, '==', ref).limit(1).get()
        const doc = snap.docs[0]
        if (doc) return normalizeLead({ id: doc.id, ...(doc.data() || {}) })
      }
      return null
    } catch {
      return null
    }
  }

  const saveFirestoreLead = async (lead) => {
    const db = getDb()
    const normalized = normalizeLead(lead)
    await db.collection(LEADS_COLLECTION).doc(normalized.id).set(normalized, { merge: true })
    return normalized
  }

  const saveFirestoreTask = async (task) => {
    const db = getDb()
    if (!task?.id) return null
    await db.collection(TASKS_COLLECTION).doc(task.id).set(task, { merge: true })
    return task
  }

  const getFirestoreUserProfile = async (userId) => {
    if (!userId) return null
    try {
      const db = getDb()
      const doc = await db.collection('users').doc(String(userId)).get()
      if (!doc.exists) return null
      return { id: doc.id, ...(doc.data() || {}) }
    } catch {
      return null
    }
  }

  const saveAccountDeletionRequest = async ({ actor, claims, body, source = 'api' }) => {
    const actorId = String(actor?.id || claims?.uid || '').trim()
    if (!actorId) {
      throw createApiError(401, 'UNAUTHENTICATED', 'Firebase authentication is required.')
    }

    const now = new Date().toISOString()
    const email = String(claims?.email || actor?.email || body?.email || '').trim()
    const accountType = String(
      body?.account_type ||
        actor?.account_type ||
        actor?.role ||
        claims?.account_type ||
        claims?.role ||
        '',
    )
      .trim()
      .toLowerCase()
    const reason = String(body?.reason || '')
      .trim()
      .slice(0, 2000)
    const requestId = `${actorId}_account_deletion`
    const payload = {
      id: requestId,
      request_type: 'account_deletion',
      status: 'requested',
      user_id: actorId,
      email,
      account_type: accountType,
      source,
      reason,
      requested_at: now,
      updated_at: now,
    }

    const db = getDb()
    await Promise.all([
      db
        .collection('users')
        .doc(actorId)
        .collection('privacy_requests')
        .doc('account_deletion')
        .set(payload, { merge: true }),
      db
        .collection(ACCOUNT_DELETION_REQUESTS_COLLECTION)
        .doc(requestId)
        .set(payload, { merge: true }),
      db.collection('users').doc(actorId).set(
        {
          account_deletion_requested: true,
          account_deletion_status: 'requested',
          account_deletion_requested_at: now,
          updatedAt: now,
        },
        { merge: true },
      ),
    ])

    return payload
  }

  const sanitizeModerationReason = (value) => {
    const normalized = String(value || '')
      .trim()
      .toLowerCase()
    const allowed = new Set([
      'spam',
      'harassment',
      'offensive',
      'inappropriate',
      'scam',
      'privacy',
      'other',
    ])
    return allowed.has(normalized) ? normalized : 'other'
  }

  const sanitizeContentType = (value) => {
    const normalized = String(value || '')
      .trim()
      .toLowerCase()
    const allowed = new Set([
      'task_comment',
      'message',
      'sp_post',
      'bid',
      'handout_profile',
      'file',
      'lead',
      'other',
    ])
    return allowed.has(normalized) ? normalized : 'other'
  }

  const saveContentReport = async ({ actor, verified, body, req }) => {
    const contentType = sanitizeContentType(body?.content_type)
    const contentId = String(body?.content_id || '')
      .trim()
      .slice(0, 240)
    const contentPath = String(body?.content_path || '')
      .trim()
      .slice(0, 512)
    if (!contentId && !contentPath) {
      throw createApiError(
        400,
        'CONTENT_REFERENCE_REQUIRED',
        'content_id or content_path is required.',
      )
    }

    const now = new Date().toISOString()
    const reportId = randomUUID()
    const payload = {
      id: reportId,
      reporter_user_id: verified ? String(actor?.id || '').trim() || null : null,
      reporter_role: verified ? actor?.role || null : null,
      reported_user_id:
        String(body?.reported_user_id || '')
          .trim()
          .slice(0, 160) || null,
      reported_user_display_name:
        String(body?.reported_user_display_name || '')
          .trim()
          .slice(0, 240) || '',
      content_type: contentType,
      content_id: contentId,
      content_path: contentPath,
      reason: sanitizeModerationReason(body?.reason),
      note: String(body?.note || '')
        .trim()
        .slice(0, 2000),
      status: 'open',
      source:
        String(body?.source || 'web')
          .trim()
          .slice(0, 80) || 'web',
      user_agent: String(req?.headers?.['user-agent'] || '')
        .trim()
        .slice(0, 500),
      ip_address: String(req?.headers?.['x-forwarded-for'] || req?.socket?.remoteAddress || '')
        .trim()
        .slice(0, 200),
      created_at: now,
      updated_at: now,
    }

    await getDb().collection(CONTENT_REPORTS_COLLECTION).doc(reportId).set(payload, { merge: true })
    return payload
  }

  const saveBlockedUser = async ({ actor, verified, body }) => {
    if (!verified)
      throw createApiError(401, 'UNAUTHENTICATED', 'Firebase authentication is required.')
    const actorId = String(actor?.id || '').trim()
    const blockedUserId = String(body?.blocked_user_id || '').trim()
    if (!actorId)
      throw createApiError(401, 'UNAUTHENTICATED', 'Firebase authentication is required.')
    if (!blockedUserId)
      throw createApiError(400, 'BLOCKED_USER_REQUIRED', 'blocked_user_id is required.')
    if (blockedUserId === actorId)
      throw createApiError(400, 'CANNOT_BLOCK_SELF', 'You cannot block your own account.')

    const now = new Date().toISOString()
    const payload = {
      blocked_user_id: blockedUserId,
      blocked_user_display_name: String(body?.blocked_user_display_name || '')
        .trim()
        .slice(0, 240),
      reason: String(body?.reason || '')
        .trim()
        .slice(0, 1000),
      status: 'active',
      source:
        String(body?.source || 'web')
          .trim()
          .slice(0, 80) || 'web',
      created_at: now,
      updated_at: now,
    }

    await getDb()
      .collection('users')
      .doc(actorId)
      .collection('blocked_users')
      .doc(blockedUserId)
      .set(payload, { merge: true })
    return payload
  }

  const listBlockedUsers = async ({ actor, verified }) => {
    if (!verified)
      throw createApiError(401, 'UNAUTHENTICATED', 'Firebase authentication is required.')
    const actorId = String(actor?.id || '').trim()
    if (!actorId)
      throw createApiError(401, 'UNAUTHENTICATED', 'Firebase authentication is required.')
    const snap = await getDb().collection('users').doc(actorId).collection('blocked_users').get()
    return snap.docs
      .map((doc) => ({ id: doc.id, ...(doc.data() || {}) }))
      .filter((row) => String(row.status || 'active').toLowerCase() === 'active')
      .sort((a, b) => String(b.created_at || '').localeCompare(String(a.created_at || '')))
  }

  const getFirestorePropertyById = async (propertyId) => {
    const ref = String(propertyId || '').trim()
    if (!ref) return null
    try {
      const db = getDb()
      const doc = await db.collection('properties').doc(ref).get()
      if (!doc.exists) return null
      return { id: doc.id, ...(doc.data() || {}) }
    } catch {
      return null
    }
  }

  const hasPmAccessToProperty = async ({ actor, propertyId }) => {
    const normalizedPropertyId = extractPropertyId(propertyId)
    if (!normalizedPropertyId) return false
    if (actor?.role === 'admin') return true
    const actorId = String(actor?.id || '').trim()
    if (!actorId) return false
    try {
      const rolesSnap = await getDb().collection('users').doc(actorId).collection('roles').get()
      return rolesSnap.docs.some((doc) => {
        const data = doc.data() || {}
        const sameProperty = extractPropertyId(data.property_id) === normalizedPropertyId
        const active =
          String(data.status || 'active')
            .trim()
            .toLowerCase() === 'active'
        const role = String(data.role || '')
          .trim()
          .toLowerCase()
        return sameProperty && active && role === 'pm'
      })
    } catch {
      return false
    }
  }

  const hasShareAccessToProperty = async ({ actor, propertyId }) => {
    const normalizedPropertyId = extractPropertyId(propertyId)
    if (!normalizedPropertyId) return false
    if (actor?.role === 'admin') return true
    const actorId = String(actor?.id || '').trim()
    if (!actorId) return false
    try {
      const rolesSnap = await getDb().collection('users').doc(actorId).collection('roles').get()
      return rolesSnap.docs.some((doc) => {
        const data = doc.data() || {}
        const sameProperty = extractPropertyId(data.property_id) === normalizedPropertyId
        const active =
          String(data.status || 'active')
            .trim()
            .toLowerCase() === 'active'
        const role = String(data.role || '')
          .trim()
          .toLowerCase()
        return sameProperty && active && (role === 'pm' || role === 'po')
      })
    } catch {
      return false
    }
  }

  // Only operational managers and owners can change who has access. A viewer can
  // read the Property Account but must never be able to extend its access list.
  const hasPropertyAccessManagementRights = async ({ actor, propertyId }) =>
    hasShareAccessToProperty({ actor, propertyId })

  const getLeaseById = async (leaseId) => {
    const normalizedLeaseId = String(leaseId || '').trim()
    if (!normalizedLeaseId) return null
    const snapshot = await getDb().collection('leases').doc(normalizedLeaseId).get()
    return snapshot.exists ? { id: snapshot.id, ...(snapshot.data() || {}) } : null
  }

  const requirePropertyManager = async ({ actor, verified, propertyId }) => {
    requireVerifiedActor({ verified, actor })
    if (!(await hasPmAccessToProperty({ actor, propertyId }))) {
      throw createApiError(403, 'PERMISSION_DENIED', 'PM access to this property is required.')
    }
  }

  const LEASE_STATUSES = new Set([
    'Available',
    'Rented',
    'Pending',
    'Expired',
    'Terminated',
    'Archived',
  ])
  const LEASE_MUTABLE_FIELDS = new Set([
    'status',
    'lease_term',
    'lease_create_date',
    'lease_start_date',
    'lease_end_date',
    'start_date',
    'move_in_date',
    'rate_type',
    'rate_amount',
    'deposit',
    'pet_fee',
    'application_fee_per_person',
    'utilities_included',
    'furnished',
    'special_terms',
    'additional_notes',
    'archived',
    'archived_at',
  ])

  const sanitizeLeaseChanges = (input = {}) => {
    const changes = {}
    for (const [key, value] of Object.entries(input || {})) {
      if (!LEASE_MUTABLE_FIELDS.has(key)) continue
      if (key === 'status' && !LEASE_STATUSES.has(String(value || '').trim())) {
        throw createApiError(400, 'INVALID_LEASE_STATUS', 'The requested lease status is invalid.')
      }
      changes[key] = value
    }
    return changes
  }

  const requireVerifiedActor = ({ verified, actor }) => {
    if (!verified || !String(actor?.id || '').trim()) {
      throw createApiError(401, 'UNAUTHENTICATED', 'Firebase authentication is required.')
    }
  }

  const hasAiQuotaAvailable = (actor) => {
    const billing = actor?.billing || {}
    return getQuotaStatus(billing.ai_tokens_used, billing.ai_tokens_limit) !== 'blocked'
  }

  const recordAiUsage = ({ actor, input, output }) => {
    if (!actor?.billing) return 0
    const text = `${String(input || '')}${JSON.stringify(output || {})}`
    // Provider token usage is not available for every fallback path; use a consistent character estimate.
    const tokens = Math.max(1, Math.ceil(text.length / 4))
    actor.billing.ai_tokens_used = Math.max(0, Number(actor.billing.ai_tokens_used || 0)) + tokens
    actor.billing.history.push({
      id: `hist-${randomUUID()}`,
      type: 'ai_usage',
      tokens,
      created_at: new Date().toISOString(),
    })
    return tokens
  }

  const getPmUploadPropertyId = async (storagePath) => {
    const path = String(storagePath || '').replace(/^\/+/, '')
    const propertyMatch = path.match(/^(?:images\/(?!leases\/)[^/]+|properties)\/([^/]+)\//)
    if (propertyMatch) return extractPropertyId(propertyMatch[1])
    const leaseMatch = path.match(/^images\/leases\/([^/]+)\//)
    if (!leaseMatch) return null
    const lease = await getLeaseById(leaseMatch[1])
    return extractPropertyId(lease?.property_string_id || lease?.property_id)
  }

  const getPersistentStorageUrl = ({ bucketName, storagePath, downloadToken }) =>
    `https://firebasestorage.googleapis.com/v0/b/${encodeURIComponent(bucketName)}/o/${encodeURIComponent(storagePath)}?alt=media&token=${encodeURIComponent(downloadToken)}`

  const isExpiredOwnerInvite = (invite, now = Date.now()) => {
    const expiresAt = asDate(invite?.expires_at)
    return !expiresAt || expiresAt.getTime() <= now
  }

  const isExpiredPropertyAccessInvite = (invite, now = Date.now()) => {
    const expiresAt = asDate(invite?.expires_at)
    return !expiresAt || expiresAt.getTime() <= now
  }

  const sanitizeOwnerInvite = ({ invite, property }) => ({
    invite: {
      invite_id: invite.invite_id || invite.id,
      status: OWNER_INVITE_PENDING,
      expires_at: invite.expires_at,
      owner_email_masked: String(invite.owner_email || '').replace(/^(.{1,2}).*(@.*)$/, '$1***$2'),
    },
    property: {
      id: property.id,
      nickname: property.nickname || null,
      address: property.address || null,
      city: property.city || null,
      state: property.state || null,
    },
  })

  const sanitizeOwnerInviteForPropertyMember = (invite) => ({
    invite_id: invite.invite_id || invite.id,
    property_id: invite.property_id,
    owner_email: invite.owner_email || null,
    owner_name: invite.owner_name || null,
    status: invite.status || null,
    expires_at: invite.expires_at || null,
    accepted_at: invite.accepted_at || null,
    accepted_by_user_id: invite.accepted_by_user_id || null,
    revoked_at: invite.revoked_at || null,
    revoked_by_user_id: invite.revoked_by_user_id || null,
    created_at: invite.created_at || null,
    updated_at: invite.updated_at || null,
  })

  const sanitizePropertyAccessInvite = ({ invite, property }) => ({
    invite: {
      invite_id: invite.invite_id || invite.id,
      status: PROPERTY_ACCESS_INVITE_PENDING,
      access_role: normalizePropertyAccessRole(invite.access_role),
      access_label: propertyAccessRoleLabel(invite.access_role),
      expires_at: invite.expires_at,
      invited_email_masked: String(invite.invited_email || '').replace(
        /^(.{1,2}).*(@.*)$/,
        '$1***$2',
      ),
    },
    property: {
      id: property.id,
      nickname: property.nickname || null,
      address: property.address || null,
      city: property.city || null,
      state: property.state || null,
    },
  })

  const sanitizePropertyAccessInviteForManager = (invite) => ({
    invite_id: invite.invite_id || invite.id,
    property_id: invite.property_id,
    invited_email: invite.invited_email || null,
    access_role: normalizePropertyAccessRole(invite.access_role),
    access_label: propertyAccessRoleLabel(invite.access_role),
    status: invite.status || null,
    expires_at: invite.expires_at || null,
    accepted_at: invite.accepted_at || null,
    accepted_by_user_id: invite.accepted_by_user_id || null,
    revoked_at: invite.revoked_at || null,
    revoked_by_user_id: invite.revoked_by_user_id || null,
    created_at: invite.created_at || null,
    updated_at: invite.updated_at || null,
  })

  const ownerRoleDocId = (propertyId) => `po_${propertyId}`
  const propertyAccessRoleDocId = ({ propertyId, accessRole }) =>
    `${propertyAccessMembershipRole(accessRole)}_${propertyId}`
  const ownerHistoryEventRef = ({ db, propertyId, eventType }) =>
    db
      .collection('properties')
      .doc(propertyId)
      .collection('history_events')
      .doc(`${eventType}_${randomUUID()}`)

  const LEASE_APPLICATION_PRIVATE_DOC_ID = 'profile'
  const LEASE_APPLICATION_ACCESS_LOGS_COLLECTION = 'lease_application_access_logs'

  const sanitizeFileName = (value, fallback = 'document') => {
    const raw = String(value || '').trim()
    if (!raw) return fallback
    const cleaned = raw.replace(/[^a-zA-Z0-9._-]+/g, '_').replace(/_+/g, '_')
    return cleaned.slice(0, 160) || fallback
  }

  const hashLeaseApplicationAccessToken = (token) =>
    createHash('sha256')
      .update(String(token || ''))
      .digest('hex')

  const createLeaseApplicationAccessToken = () =>
    `${randomUUID().replace(/-/g, '')}${randomUUID().replace(/-/g, '')}`

  const parseBase64PayloadToBuffer = (payload) => {
    const raw = String(payload || '').trim()
    if (!raw) throw createApiError(400, 'INVALID_FILE_PAYLOAD', 'File payload is missing.')
    const normalized = raw.includes('base64,') ? raw.slice(raw.indexOf('base64,') + 7) : raw
    return Buffer.from(normalized, 'base64')
  }

  const buildLeaseApplicationDocumentRecord = ({
    documentId,
    fileName,
    description,
    originalFilename,
    contentType,
    size,
    storagePath,
    uploadedByUid = null,
  }) => ({
    id: documentId,
    name: String(fileName || '').trim() || 'Document',
    description: String(description || '').trim(),
    file_name: String(originalFilename || '').trim() || 'document',
    content_type: String(contentType || 'application/octet-stream').trim(),
    file_size: Number(size || 0),
    storage_path: storagePath,
    uploaded_at: new Date().toISOString(),
    uploaded_by_uid: uploadedByUid || null,
  })

  const maskPhone = (value) => {
    const digits = String(value || '').replace(/\D/g, '')
    if (digits.length < 4) return ''
    return `(***) ***-${digits.slice(-4)}`
  }

  const buildLeaseApplicationSummary = ({
    id,
    application,
    documents = [],
    submittedBy = null,
    now,
  }) => {
    const applicant = application?.applicant || {}
    const firstName = String(applicant.first_name || '').trim()
    const lastName = String(applicant.last_name || '').trim()
    return {
      id,
      schema_version: 2,
      property_id: application?.property_id || null,
      lease_id: application?.lease_id || null,
      desired_move_in_date: application?.desired_move_in_date || null,
      number_of_occupants: Number(application?.number_of_occupants || 0) || 0,
      applicant_display_name: [firstName, lastName].filter(Boolean).join(' ').trim() || 'Applicant',
      applicant_email_masked: maskEmail(applicant.email),
      applicant_phone_masked: maskPhone(applicant.phone),
      status:
        String(application?.status || 'pending')
          .trim()
          .toLowerCase() || 'pending',
      document_count: Array.isArray(documents) ? documents.length : 0,
      has_documents: Array.isArray(documents) && documents.length > 0,
      submitted_at: application?.submitted_at || now,
      submitted_by: submittedBy || null,
      created_at: application?.created_at || now,
      updated_at: now,
      pii_location: 'private',
    }
  }

  const buildLeaseApplicationPrivatePayload = ({
    summary,
    application,
    documents = [],
    accessTokenHash = '',
    now,
  }) => ({
    schema_version: 2,
    property_id: summary.property_id || null,
    lease_id: summary.lease_id || null,
    applicant: application?.applicant || {},
    vehicles: Array.isArray(application?.vehicles) ? application.vehicles : [],
    pets: Array.isArray(application?.pets) ? application.pets : [],
    co_applicants: Array.isArray(application?.co_applicants) ? application.co_applicants : [],
    additional_notes: String(application?.additional_notes || '').trim(),
    documents,
    access_token_hash: accessTokenHash,
    desired_move_in_date: summary.desired_move_in_date || null,
    number_of_occupants: summary.number_of_occupants || 0,
    submitted_at: summary.submitted_at || now,
    created_at: summary.created_at || now,
    updated_at: now,
  })

  const getLeaseApplicationSummaryAndPrivate = async (applicationId) => {
    const ref = String(applicationId || '').trim()
    if (!ref) return { summary: null, privateData: null }
    const db = getDb()
    const summarySnap = await db.collection('lease_applications').doc(ref).get()
    if (!summarySnap.exists) return { summary: null, privateData: null }
    const summary = { id: summarySnap.id, ...(summarySnap.data() || {}) }
    const privateSnap = await db
      .collection('lease_applications')
      .doc(ref)
      .collection('private')
      .doc(LEASE_APPLICATION_PRIVATE_DOC_ID)
      .get()
    const privateData = privateSnap.exists
      ? { id: privateSnap.id, ...(privateSnap.data() || {}) }
      : null
    return { summary, privateData }
  }

  const buildLeaseApplicationResponse = ({ summary, privateData }) => {
    if (!summary) return null
    const legacyApplicant = summary?.applicant || {}
    const legacyDocuments = Array.isArray(summary?.documents) ? summary.documents : []
    const sourcePrivate = privateData || {}
    return {
      ...summary,
      applicant: sourcePrivate.applicant || legacyApplicant || null,
      vehicles: Array.isArray(sourcePrivate.vehicles)
        ? sourcePrivate.vehicles
        : Array.isArray(summary?.vehicles)
          ? summary.vehicles
          : [],
      pets: Array.isArray(sourcePrivate.pets)
        ? sourcePrivate.pets
        : Array.isArray(summary?.pets)
          ? summary.pets
          : [],
      co_applicants: Array.isArray(sourcePrivate.co_applicants)
        ? sourcePrivate.co_applicants
        : Array.isArray(summary?.co_applicants)
          ? summary.co_applicants
          : [],
      additional_notes:
        sourcePrivate.additional_notes != null
          ? sourcePrivate.additional_notes
          : String(summary?.additional_notes || '').trim(),
      documents: Array.isArray(sourcePrivate.documents) ? sourcePrivate.documents : legacyDocuments,
    }
  }

  const assertLeaseApplicationAccess = async ({
    actor,
    verified,
    applicationId,
    accessToken = '',
  }) => {
    const { summary, privateData } = await getLeaseApplicationSummaryAndPrivate(applicationId)
    if (!summary) throw createApiError(404, 'APPLICATION_NOT_FOUND', 'Application not found.')

    const propertyId = extractPropertyId(summary.property_id)
    const tokenHash = hashLeaseApplicationAccessToken(accessToken)
    const storedHash = String(privateData?.access_token_hash || '').trim()

    if (storedHash && tokenHash && storedHash === tokenHash) {
      return {
        summary,
        privateData,
        mode: 'token',
      }
    }

    if (verified && actor?.id) {
      if (actor.role === 'admin') {
        return { summary, privateData, mode: 'admin' }
      }

      if (propertyId && (await hasShareAccessToProperty({ actor, propertyId }))) {
        return { summary, privateData, mode: 'property-role' }
      }

      if (
        String(summary.submitted_by || '').trim() &&
        String(summary.submitted_by).trim() === String(actor.id).trim()
      ) {
        return { summary, privateData, mode: 'owner' }
      }
    }

    throw createApiError(403, 'PERMISSION_DENIED', 'You do not have access to this application.')
  }

  const normalizeTenantPayload = (tenant = {}) => ({
    personal_info:
      tenant?.personal_info && typeof tenant.personal_info === 'object' ? tenant.personal_info : {},
    current_address:
      tenant?.current_address && typeof tenant.current_address === 'object'
        ? tenant.current_address
        : {},
    employment:
      tenant?.employment && typeof tenant.employment === 'object' ? tenant.employment : null,
    emergency_contact:
      tenant?.emergency_contact && typeof tenant.emergency_contact === 'object'
        ? tenant.emergency_contact
        : null,
    co_applicants: Array.isArray(tenant?.co_applicants) ? tenant.co_applicants : [],
    vehicles: Array.isArray(tenant?.vehicles) ? tenant.vehicles : [],
    pets: Array.isArray(tenant?.pets) ? tenant.pets : [],
    documents: Array.isArray(tenant?.documents) ? tenant.documents : [],
    notes: String(tenant?.notes || '').trim(),
    status:
      String(tenant?.status || 'active')
        .trim()
        .toLowerCase() || 'active',
  })

  const assertPmPropertyAccess = async ({ actor, propertyId }) => {
    const normalizedPropertyId = extractPropertyId(propertyId)
    if (
      !normalizedPropertyId ||
      !(await hasPmAccessToProperty({ actor, propertyId: normalizedPropertyId }))
    ) {
      throw createApiError(403, 'PERMISSION_DENIED', 'PM access to this property is required.')
    }
    return normalizedPropertyId
  }

  const assertLeaseBelongsToProperty = async ({ db, leaseId, propertyId }) => {
    const normalizedLeaseId = String(leaseId || '').trim()
    if (!normalizedLeaseId) return null
    const leaseRef = db.collection('leases').doc(normalizedLeaseId)
    const leaseSnap = await leaseRef.get()
    if (!leaseSnap.exists) throw createApiError(404, 'LEASE_NOT_FOUND', 'Lease not found.')
    if (extractPropertyId(leaseSnap.data()?.property_id) !== propertyId) {
      throw createApiError(
        403,
        'LEASE_PROPERTY_MISMATCH',
        'Lease does not belong to this property.',
      )
    }
    return { ref: leaseRef, data: leaseSnap.data() || {} }
  }

  const uploadLeaseApplicationDocumentFile = async ({
    applicationId,
    filePayload,
    documentName,
    description,
    uploadedByUid = null,
  }) => {
    const documentId = randomUUID()
    const contentType = String(filePayload?.content_type || 'application/octet-stream').trim()
    const originalFilename = sanitizeFileName(filePayload?.original_filename || 'document')
    const buffer = parseBase64PayloadToBuffer(filePayload?.data_base64)
    const safeName = sanitizeFileName(originalFilename)
    const storagePath = `secure/lease_applications/${applicationId}/${documentId}/${safeName}`
    const bucket = getStorageBucket()
    const file = bucket.file(storagePath)

    await file.save(buffer, {
      resumable: false,
      metadata: {
        contentType,
        metadata: {
          application_id: String(applicationId),
          document_id: documentId,
          uploaded_by_uid: String(uploadedByUid || ''),
        },
      },
    })

    return buildLeaseApplicationDocumentRecord({
      documentId,
      fileName: documentName,
      description,
      originalFilename,
      contentType,
      size: Number(filePayload?.size || buffer.length || 0),
      storagePath,
      uploadedByUid,
    })
  }

  const createLeaseApplicationSignedReadUrl = async (storagePath) => {
    const [url] = await getStorageBucket()
      .file(String(storagePath || '').trim())
      .getSignedUrl({
        action: 'read',
        expires: Date.now() + 5 * 60 * 1000,
        version: 'v4',
      })
    return url
  }

  const buildOwnerInviteUrl = ({ origin, token }) => {
    const baseUrl = String(appBaseUrl || origin || '')
      .trim()
      .replace(/\/$/, '')
    if (!baseUrl) return `/public/owner-invite/${token}`
    return `${baseUrl}/public/owner-invite/${token}`
  }

  const buildPropertyAccessInviteUrl = ({ origin, token }) => {
    const baseUrl = String(appBaseUrl || origin || '')
      .trim()
      .replace(/\/$/, '')
    if (!baseUrl) return `/public/property-access-invite/${token}`
    return `${baseUrl}/public/property-access-invite/${token}`
  }

  const renderOwnerInviteEmail = ({ inviteUrl, propertyName, propertyAddress, inviterName }) => {
    const safePropertyName = escapeHtml(propertyName || 'this property')
    const safePropertyAddress = escapeHtml(propertyAddress || '')
    const safeInviterName = escapeHtml(inviterName || 'A property manager')
    return {
      subject: `You’ve been invited to access ${propertyName || 'a property'} in HANDOUT`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;padding:24px;color:#111827;">
          <h2 style="margin:0 0 16px;">Property Access Invitation</h2>
          <p style="margin:0 0 12px;">${safeInviterName} invited you to access <strong>${safePropertyName}</strong> in HANDOUT.</p>
          ${safePropertyAddress ? `<p style="margin:0 0 20px;color:#4b5563;">${safePropertyAddress}</p>` : ''}
          <p style="margin:0 0 24px;">Use the button below to accept the invitation.</p>
          <p style="margin:0 0 24px;">
            <a href="${escapeHtml(inviteUrl)}" style="display:inline-block;padding:12px 20px;background:#1976d2;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;">
              Accept Invitation
            </a>
          </p>
          <p style="margin:0 0 8px;color:#4b5563;">If the button does not work, use this link:</p>
          <p style="word-break:break-all;margin:0;color:#1976d2;">${escapeHtml(inviteUrl)}</p>
        </div>
      `,
      text: [
        `${inviterName || 'A property manager'} invited you to access ${propertyName || 'this property'} in HANDOUT.`,
        propertyAddress ? `Property: ${propertyAddress}` : null,
        '',
        `Accept invitation: ${inviteUrl}`,
      ]
        .filter(Boolean)
        .join('\n'),
    }
  }

  const sendOwnerInviteEmail = async ({
    to,
    inviteUrl,
    propertyName,
    propertyAddress,
    inviterName,
  }) => {
    if (!resendApiKey) {
      return { emailSent: false, reason: 'missing_resend_api_key' }
    }
    if (!inviteEmailFrom) {
      return { emailSent: false, reason: 'missing_invite_email_from' }
    }
    if (inviteEmailFrom === DEFAULT_INVITE_EMAIL_FROM) {
      return { emailSent: false, reason: 'invite_email_sender_not_configured' }
    }

    const payload = renderOwnerInviteEmail({
      inviteUrl,
      propertyName,
      propertyAddress,
      inviterName,
    })

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: inviteEmailFrom,
          to: [to],
          subject: payload.subject,
          html: payload.html,
          text: payload.text,
        }),
      })
      const responsePayload = await response.json().catch(() => ({}))
      if (!response.ok) {
        return {
          emailSent: false,
          reason: responsePayload?.message || responsePayload?.error || `resend_${response.status}`,
        }
      }
      return {
        emailSent: true,
        messageId: responsePayload?.id || null,
      }
    } catch (error) {
      return {
        emailSent: false,
        reason: error?.message || 'resend_request_failed',
      }
    }
  }

  const parseLegacyAddressParts = (rawAddress) => {
    const text = String(rawAddress || '').trim()
    if (!text) return { city: '', state: '', zip: '' }
    const parts = text
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
    if (parts.length < 2) return { city: '', state: '', zip: '' }
    const city = parts[parts.length - 2] || ''
    const stateZip = parts[parts.length - 1] || ''
    const stateZipMatch = stateZip.match(/^([A-Za-z]{2,})\s+(\S+)$/)
    if (stateZipMatch) {
      return {
        city,
        state: stateZipMatch[1],
        zip: stateZipMatch[2],
      }
    }
    return {
      city,
      state: stateZip,
      zip: '',
    }
  }

  const normalizePropertyAddress = (property) => {
    const source = property && typeof property === 'object' ? property : {}
    const address = source.address && typeof source.address === 'object' ? source.address : {}
    const legacy =
      typeof source.address === 'string'
        ? parseLegacyAddressParts(source.address)
        : { city: '', state: '', zip: '' }
    const line1 = String(
      address.street ||
        address.street1 ||
        address.line1 ||
        address.address1 ||
        source.street ||
        source.address_line1 ||
        source.address1 ||
        '',
    ).trim()
    const line2 = String(
      address.line2 || address.unit || source.address_line2 || source.unit || '',
    ).trim()
    const city = String(address.city || source.city || source.city_name || legacy.city || '').trim()
    const state = String(
      address.state || source.state || source.state_code || legacy.state || '',
    ).trim()
    const zip = String(
      address.zip ||
        address.zipCode ||
        address.postal_code ||
        source.zip ||
        source.zip_code ||
        source.postal_code ||
        legacy.zip ||
        '',
    ).trim()
    return { line1, line2, city, state, zip }
  }

  const buildMxRecordFromTask = ({ task, actor, profile, property, now }) => {
    const createdAt = task?.created_at || now
    const reporterName =
      profile?.full_name ||
      profile?.user_name ||
      profile?.displayName ||
      actor?.email ||
      actor?.id ||
      'Unknown User'
    const reporterRole = actor?.role || profile?.role || task?.created_by_role || 'Unknown Role'
    const mxId = task?.mx_id || task?.id || `mx_${Date.now()}`
    return {
      create_id: task?.creator_user_id || actor?.id || null,
      createAt: createdAt,
      report_date: task?.report_date || createdAt,
      description: task?.description || task?.task_description || task?.title || '',
      status: task?.status || 'open',
      logs: [
        {
          log_timestamp: createdAt,
          comment: 'Initial report submitted',
          user_id: actor?.id || task?.creator_user_id || null,
          user_name: reporterName,
          user_role: reporterRole,
        },
      ],
      mx_id: mxId,
      property_id: task?.property_id || null,
      ...(() => {
        const propertyAddress = normalizePropertyAddress(property)
        const propertyName = String(
          propertyAddress.line1 ||
            property?.displayName ||
            property?.name ||
            task?.property_name ||
            '',
        ).trim()
        return {
          property_name: propertyName,
          property_address_line1: propertyAddress.line1,
          property_address_line2: propertyAddress.line2,
          property_city: propertyAddress.city,
          property_state: propertyAddress.state,
          property_zip: propertyAddress.zip,
          city: propertyAddress.city,
          state: propertyAddress.state,
          zip_code: propertyAddress.zip,
          postal_code: propertyAddress.zip,
        }
      })(),
      reported_by: reporterName,
      reported_by_id: actor?.id || task?.creator_user_id || null,
      reported_role: reporterRole,
      created_by: task?.creator_user_id || actor?.id || null,
      created_by_name: reporterName,
      created_by_role: reporterRole,
      image_urls: Array.isArray(task?.photos) ? task.photos : task?.image_urls || [],
      updatedAt: createdAt,
      task_id: task?.id || null,
      task_doc_id: task?.id || null,
      task_category: task?.task_category || task?.category || null,
      task_priority: task?.task_priority || task?.priority || null,
    }
  }

  const saveFirestoreMxRecordFromTask = async ({ task, actor }) => {
    if (!task?.id || !task?.property_id) return null
    try {
      const db = getDb()
      const profile = await getFirestoreUserProfile(actor?.id || task?.creator_user_id)
      const property = await getFirestorePropertyById(task.property_id)
      const now = new Date().toISOString()
      const mxRecord = buildMxRecordFromTask({ task, actor, profile, property, now })
      await db
        .collection('properties')
        .doc(String(task.property_id))
        .collection('mxrecords')
        .doc(String(task.id))
        .set(mxRecord, { merge: true })
      return mxRecord
    } catch {
      return null
    }
  }

  const syncMxRecordStatusFromTask = async ({ task }) => {
    if (!task?.id || !task?.property_id) return
    try {
      const db = getDb()
      await db
        .collection('properties')
        .doc(String(task.property_id))
        .collection('mxrecords')
        .doc(String(task.id))
        .set(
          {
            status: task.status,
            updatedAt: new Date().toISOString(),
          },
          { merge: true },
        )
    } catch {
      // no-op
    }
  }

  const getFirestoreTaskById = async (id) => {
    const seededTask = store.tasks.get(id)
    if (seededTask) return seededTask
    try {
      const db = getDb()
      const doc = await db.collection(TASKS_COLLECTION).doc(id).get()
      if (!doc.exists) return null
      return { id: doc.id, ...(doc.data() || {}) }
    } catch {
      return null
    }
  }

  const listFirestoreProperties = async () => {
    try {
      const db = getDb()
      const snap = await db.collection('properties').get()
      return snap.docs.map((doc) => ({ id: doc.id, ...(doc.data() || {}) }))
    } catch {
      return []
    }
  }

  const listFirestoreMxRecordsForProperty = async (propertyId) => {
    const ref = String(propertyId || '').trim()
    if (!ref) return []
    try {
      const db = getDb()
      const snap = await db.collection('properties').doc(ref).collection('mxrecords').get()
      return snap.docs.map((doc) => ({ id: doc.id, ...(doc.data() || {}) }))
    } catch {
      return []
    }
  }

  const getLeadFromAnyStore = async (leadId) => {
    const firestoreLead = await getFirestoreLeadById(leadId)
    if (firestoreLead) return { lead: firestoreLead, source: 'firestore' }
    const memoryLead = store.leads.get(leadId)
    if (memoryLead) return { lead: normalizeLead(memoryLead), source: 'memory' }
    return { lead: null, source: null }
  }

  const listFirestoreLeadBids = async (leadId) => {
    try {
      const db = getDb()
      const snap = await db
        .collection(LEADS_COLLECTION)
        .doc(leadId)
        .collection(LEAD_BIDS_SUBCOLLECTION)
        .get()
      return snap.docs
        .map((doc) => normalizeBid({ id: doc.id, ...(doc.data() || {}) }))
        .sort((a, b) => String(b.created_at || '').localeCompare(String(a.created_at || '')))
    } catch {
      return []
    }
  }

  const listFirestoreSpBids = async (spId) => {
    try {
      const db = getDb()
      const snap = await db
        .collectionGroup(LEAD_BIDS_SUBCOLLECTION)
        .where('sp_id', '==', spId)
        .get()
      return snap.docs
        .map((doc) => normalizeBid({ id: doc.id, ...(doc.data() || {}) }))
        .sort((a, b) => String(b.created_at || '').localeCompare(String(a.created_at || '')))
    } catch {
      return []
    }
  }

  const normalizeSpProject = (row = {}) => {
    const projectId = String(row.project_id || row.id || row.mxrecord_id || '')
    const taskTitle = String(row.task_title || row.title || row.name || 'Untitled Project').trim()
    const address = String(row.address || row.property_address || row.location || '').trim()
    return {
      ...row,
      id: projectId,
      project_id: projectId,
      mxrecord_id: String(row.mxrecord_id || projectId),
      property_id: String(row.property_id || ''),
      lead_id: String(row.lead_id || ''),
      selected_bid_id: String(row.selected_bid_id || ''),
      sp_id: String(row.sp_id || row.assigned_sp_id || row.assigned_sp?.sp_id || ''),
      title: taskTitle,
      task_title: taskTitle,
      address,
      location: String(row.location || address).trim(),
      status:
        String(row.status || 'active')
          .trim()
          .toLowerCase() || 'active',
      accepted_at: row.accepted_at || row.selected_bid_at || row.created_at || null,
      comments: Array.isArray(row.comments) ? row.comments : [],
      phases: row.phases && typeof row.phases === 'object' ? row.phases : {},
    }
  }

  const listFirestoreAssignedProjectsForSp = async (spId) => {
    const targetSpId = String(spId || '').trim()
    if (!targetSpId) return []

    const mapSnapshot = (snap) =>
      snap.docs
        .map((doc) => {
          const data = doc.data() || {}
          const propertyId = String(doc.ref?.parent?.parent?.id || '').trim()
          const assignedSpId = String(data.assigned_sp_id || data.assigned_sp?.sp_id || '').trim()
          if (assignedSpId !== targetSpId) return null
          return normalizeSpProject({
            ...data,
            id: doc.id,
            project_id: doc.id,
            mxrecord_id: doc.id,
            property_id: propertyId,
            assigned_sp_id: assignedSpId,
            sp_id: assignedSpId,
            selected_bid_id: data.selected_bid_id || data.assigned_sp?.bid_id || '',
            accepted_at:
              data.selected_bid_at ||
              data.assigned_sp?.assigned_at ||
              data.updatedAt ||
              data.updated_at ||
              data.created_at ||
              null,
            address: data.property_address || data.property_id?.address || '',
            location: data.property_address || data.property_id?.address || '',
            task_title: data.title || data.task_title || data.name || '',
            title: data.title || data.task_title || data.name || '',
          })
        })
        .filter(Boolean)

    try {
      const db = getDb()
      const rows = []

      try {
        const projectsSnap = await db
          .collection('sp_projects')
          .where('sp_id', '==', targetSpId)
          .get()
        rows.push(
          ...projectsSnap.docs.map((doc) =>
            normalizeSpProject({
              id: doc.id,
              ...(doc.data() || {}),
            }),
          ),
        )
      } catch (error) {
        void error
      }

      try {
        const directSnap = await db
          .collectionGroup('mxrecords')
          .where('assigned_sp_id', '==', targetSpId)
          .get()
        rows.push(...mapSnapshot(directSnap))
      } catch (error) {
        void error
      }

      try {
        const nestedSnap = await db
          .collectionGroup('mxrecords')
          .where('assigned_sp.sp_id', '==', targetSpId)
          .get()
        rows.push(...mapSnapshot(nestedSnap))
      } catch (error) {
        void error
      }

      const merged = new Map()
      rows.forEach((row) => {
        const key = String(row.project_id || row.id || '').trim()
        if (!key) return
        merged.set(key, { ...(merged.get(key) || {}), ...row })
      })

      return Array.from(merged.values()).sort((a, b) =>
        String(b.accepted_at || b.created_at || '').localeCompare(
          String(a.accepted_at || a.created_at || ''),
        ),
      )
    } catch {
      return []
    }
  }

  const saveFirestoreSpProject = async (project) => {
    const normalized = normalizeSpProject(project)
    if (!normalized.project_id) return null
    const db = getDb()
    await db.collection('sp_projects').doc(normalized.project_id).set(normalized, { merge: true })
    return normalized
  }

  const applyAcceptedProjectStateToBids = async (spId, rows = []) => {
    const projects = await listFirestoreAssignedProjectsForSp(spId)
    if (!projects.length) return rows.map((row) => normalizeBid(row))

    const byBidId = new Map()
    projects.forEach((project) => {
      const bidId = String(project.selected_bid_id || '').trim()
      if (bidId) byBidId.set(bidId, project)
    })

    return rows.map((row) => {
      const normalized = normalizeBid(row)
      const project = byBidId.get(String(normalized.bid_id || normalized.id || '').trim())
      if (!project) return normalized
      return {
        ...normalized,
        status: 'accepted',
        accepted_at: project.accepted_at || normalized.accepted_at || null,
        project_id: project.project_id || '',
        project_title: project.title || project.task_title || '',
      }
    })
  }

  const toNumber = (value, fallback = 0) => {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : fallback
  }

  const listSpBidCreditSkus = () => SP_BID_CREDIT_SKUS.map((sku) => ({ ...sku }))

  const findSpBidCreditSku = (skuCode) =>
    SP_BID_CREDIT_SKUS.find((sku) => sku.sku_code === String(skuCode || '').trim()) || null

  const normalizeCreditOrderStatus = (value, fallback = 'created') => {
    const next = String(value || fallback)
      .trim()
      .toLowerCase()
    if (next === 'cancelled') return 'canceled'
    return SP_CREDIT_ORDER_STATUSES.has(next) ? next : fallback
  }

  const buildSpCreditAccountSnapshot = (spId, data = {}, now = new Date().toISOString()) => ({
    ...buildDefaultSpCreditAccount(spId, data?.created_at || now),
    ...(data || {}),
    sp_id: spId,
    balance: toNumber(data?.balance, 0),
    lifetime_purchased: toNumber(data?.lifetime_purchased, 0),
    lifetime_used: toNumber(data?.lifetime_used, 0),
    lifetime_refunded: toNumber(data?.lifetime_refunded, 0),
    lifetime_granted: toNumber(data?.lifetime_granted, 0),
    last_free_credit_at: data?.last_free_credit_at || null,
  })

  const buildSpCreditOrderFromSku = ({ actor, body = {}, now = new Date().toISOString() }) => {
    const sku = findSpBidCreditSku(body?.sku_code || body?.package_id)
    const allowLegacyManualOrder =
      String(body?.provider || '').trim() === 'manual_placeholder' ||
      String(body?.provider || '').trim() === 'manual'

    const resolvedSku =
      sku ||
      (allowLegacyManualOrder &&
      Number(body?.credits) > 0 &&
      (Number(body?.amount_cents) > 0 || Number(body?.amount) > 0)
        ? {
            sku_code: String(body?.sku_code || body?.package_id || `manual-${randomUUID()}`),
            sku_name: String(body?.sku_name || body?.package_name || 'Manual bid credit pack'),
            credits: Math.max(1, Number(body?.credits || 1)),
            amount_cents:
              Number(body?.amount_cents) > 0
                ? Math.round(Number(body.amount_cents))
                : Math.max(1, Math.round(Number(body.amount || 0) * 100)),
            currency: String(body?.currency || 'USD').trim() || 'USD',
            always_on: false,
          }
        : null)

    if (!resolvedSku) {
      throw createApiError(
        400,
        'INVALID_SKU',
        'sku_code must be sp_bid_single or sp_bid_starter_10',
      )
    }

    const amountDollars = Number((resolvedSku.amount_cents / 100).toFixed(2))
    return {
      id: `credit-order-${randomUUID()}`,
      sp_id: actor.id,
      sku_code: resolvedSku.sku_code,
      sku_name: resolvedSku.sku_name,
      package_id: resolvedSku.sku_code,
      credits: resolvedSku.credits,
      amount: amountDollars,
      amount_cents: resolvedSku.amount_cents,
      currency: resolvedSku.currency,
      status: allowLegacyManualOrder ? 'pending' : 'created',
      provider: body?.provider || 'stripe',
      provider_order_id: null,
      provider_txn_id: null,
      provider_checkout_session_id: null,
      provider_payment_intent_id: null,
      provider_customer_id: null,
      created_at: now,
      updated_at: now,
      paid_at: null,
      failed_at: null,
      canceled_at: null,
      refunded_at: null,
      fulfilled_at: null,
      metadata: body?.metadata && typeof body.metadata === 'object' ? body.metadata : {},
    }
  }

  const createStripeCheckoutSessionPlaceholder = ({
    order,
    body = {},
    now = new Date().toISOString(),
  }) => {
    const successUrl =
      String(body?.success_url || body?.successUrl || '').trim() ||
      (appBaseUrl ? `${appBaseUrl.replace(/\/$/, '')}/sp-credits?checkout=success` : null)
    const cancelUrl =
      String(body?.cancel_url || body?.cancelUrl || '').trim() ||
      (appBaseUrl ? `${appBaseUrl.replace(/\/$/, '')}/sp-credits?checkout=cancel` : null)
    const sessionId = `checkout-session-${randomUUID()}`
    return {
      id: sessionId,
      order_id: order.id,
      stripe_configured: Boolean(stripeSecretKey),
      checkout_url: null,
      success_url: successUrl,
      cancel_url: cancelUrl,
      created_at: now,
      message: stripeSecretKey
        ? 'Stripe secret is configured; install Stripe SDK to create a live Checkout Session.'
        : 'Stripe is not configured yet. Order was created but no live Checkout URL is available.',
    }
  }

  const createStripeCheckoutSession = async ({
    order,
    body = {},
    now = new Date().toISOString(),
  }) => {
    if (!stripeSecretKey) {
      return createStripeCheckoutSessionPlaceholder({ order, body, now })
    }

    const successUrl =
      String(body?.success_url || body?.successUrl || '').trim() ||
      (appBaseUrl ? `${appBaseUrl.replace(/\/$/, '')}/sp-credits?checkout=success` : null)
    const cancelUrl =
      String(body?.cancel_url || body?.cancelUrl || '').trim() ||
      (appBaseUrl ? `${appBaseUrl.replace(/\/$/, '')}/sp-credits?checkout=cancel` : null)
    if (!successUrl || !cancelUrl) {
      throw createApiError(
        400,
        'MISSING_CHECKOUT_REDIRECTS',
        'success_url and cancel_url are required when APP_BASE_URL is not configured.',
      )
    }

    const params = new URLSearchParams()
    params.set('mode', 'payment')
    params.set('success_url', successUrl)
    params.set('cancel_url', cancelUrl)
    params.set('client_reference_id', order.id)
    params.set('metadata[order_id]', order.id)
    params.set('metadata[sp_id]', order.sp_id)
    params.set('metadata[sku_code]', order.sku_code || '')
    params.set('metadata[source]', 'handout_sp_credit')
    params.set('line_items[0][quantity]', '1')
    params.set('line_items[0][price_data][currency]', String(order.currency || 'USD').toLowerCase())
    params.set('line_items[0][price_data][unit_amount]', String(Number(order.amount_cents || 0)))
    params.set(
      'line_items[0][price_data][product_data][name]',
      String(order.sku_name || order.sku_code),
    )
    params.set('payment_method_types[0]', 'card')
    params.set('allow_promotion_codes', 'false')

    const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    })
    const payload = await response.json().catch(() => ({}))
    if (!response.ok) {
      throw createApiError(
        502,
        'STRIPE_CHECKOUT_SESSION_FAILED',
        payload?.error?.message || 'Failed to create Stripe Checkout Session',
      )
    }

    return {
      id: payload.id,
      order_id: order.id,
      stripe_configured: true,
      checkout_url: payload.url || null,
      success_url: payload.success_url || successUrl,
      cancel_url: payload.cancel_url || cancelUrl,
      created_at: now,
      message: 'Stripe Checkout Session created successfully.',
      provider_payload: {
        id: payload.id,
        url: payload.url || null,
        payment_status: payload.payment_status || null,
      },
    }
  }

  const verifyStripeWebhookSignature = ({ req, rawPayload, webhookSecret }) => {
    const signatureHeader = String(req?.headers?.['stripe-signature'] || '').trim()
    if (!signatureHeader) {
      throw createApiError(401, 'MISSING_STRIPE_SIGNATURE', 'Stripe signature is required')
    }

    const rawValue = String(rawPayload || '')
    const parts = signatureHeader.split(',').reduce((acc, part) => {
      const [key, value] = String(part || '').split('=', 2)
      if (key && value) acc[key.trim()] = value.trim()
      return acc
    }, {})
    const timestamp = parts.t
    const signatures = Object.entries(parts)
      .filter(([key]) => key === 'v1')
      .map(([, value]) => value)

    if (!timestamp || !signatures.length) {
      throw createApiError(401, 'INVALID_STRIPE_SIGNATURE', 'Stripe signature header is invalid')
    }

    const signedPayload = `${timestamp}.${rawValue}`
    const expected = createHmac('sha256', webhookSecret).update(signedPayload).digest('hex')
    const expectedBuffer = Buffer.from(expected, 'hex')
    const isValid = signatures.some((signature) => {
      try {
        const candidate = Buffer.from(signature, 'hex')
        return (
          candidate.length === expectedBuffer.length && timingSafeEqual(candidate, expectedBuffer)
        )
      } catch {
        return false
      }
    })

    if (!isValid) {
      throw createApiError(401, 'INVALID_STRIPE_SIGNATURE', 'Stripe signature verification failed')
    }

    const toleranceSeconds = 300
    const eventTimestamp = Number(timestamp)
    if (
      Number.isFinite(eventTimestamp) &&
      Math.abs(Math.floor(Date.now() / 1000) - eventTimestamp) > toleranceSeconds
    ) {
      throw createApiError(401, 'STALE_STRIPE_SIGNATURE', 'Stripe signature timestamp is too old')
    }
  }

  const getTaskAddressPatch = (task, property) => {
    const sourceTask = task && typeof task === 'object' ? task : {}
    const sourceProperty = property && typeof property === 'object' ? property : {}
    const propertyAddress = normalizePropertyAddress(sourceProperty)
    const taskAddress = normalizePropertyAddress(sourceTask)

    const line1 =
      taskAddress.line1 || propertyAddress.line1 || String(sourceTask.property_name || '').trim()
    const line2 = taskAddress.line2 || propertyAddress.line2
    const city = taskAddress.city || propertyAddress.city
    const state = taskAddress.state || propertyAddress.state
    const zip = taskAddress.zip || propertyAddress.zip

    return {
      property_name:
        line1 ||
        String(
          sourceProperty.displayName || sourceProperty.name || sourceTask.property_name || '',
        ).trim(),
      property_address_line1: line1,
      property_address_line2: line2,
      property_city: city,
      property_state: state,
      property_zip: zip,
      city,
      state,
      zip_code: zip,
      postal_code: zip,
    }
  }

  const buildDefaultSpCreditAccount = (spId, now = new Date().toISOString()) => ({
    sp_id: spId,
    balance: 0,
    lifetime_purchased: 0,
    lifetime_used: 0,
    lifetime_refunded: 0,
    lifetime_granted: 0,
    last_free_credit_at: null,
    created_at: now,
    updated_at: now,
  })

  const applySpFreeCreditPolicy = (account, now = new Date().toISOString()) => {
    const next = {
      ...account,
      balance: toNumber(account?.balance, 0),
      lifetime_purchased: toNumber(account?.lifetime_purchased, 0),
      lifetime_used: toNumber(account?.lifetime_used, 0),
      lifetime_refunded: toNumber(account?.lifetime_refunded, 0),
      lifetime_granted: toNumber(account?.lifetime_granted, 0),
      last_free_credit_at: account?.last_free_credit_at || null,
    }

    let granted = 0
    let grantType = null

    if (!next.last_free_credit_at) {
      granted = SP_INITIAL_FREE_CREDITS
      grantType = 'starter'
      next.last_free_credit_at = now
    } else {
      const lastMs = Date.parse(next.last_free_credit_at)
      const nowMs = Date.parse(now)
      if (Number.isFinite(lastMs) && Number.isFinite(nowMs)) {
        const elapsedWeeks = Math.floor((nowMs - lastMs) / SP_FREE_CREDIT_INTERVAL_MS)
        if (elapsedWeeks > 0) {
          granted = elapsedWeeks * SP_WEEKLY_FREE_CREDITS
          grantType = 'weekly'
          next.last_free_credit_at = now
        }
      }
    }

    if (granted > 0) {
      next.balance += granted
      next.lifetime_granted += granted
      next.updated_at = now
    }

    return { account: next, granted, grantType }
  }

  const ensureFirestoreSpCreditAccount = async (spId, now = new Date().toISOString()) => {
    try {
      const db = getDb()
      const ref = db.collection(SP_CREDIT_ACCOUNTS_COLLECTION).doc(spId)
      return await db.runTransaction(async (tx) => {
        const snap = await tx.get(ref)
        const baseAccount = snap.exists
          ? buildSpCreditAccountSnapshot(spId, snap.data() || {}, now)
          : buildDefaultSpCreditAccount(spId, now)

        const granted = applySpFreeCreditPolicy(baseAccount, now)
        if (granted.granted > 0 || !snap.exists) {
          tx.set(
            ref,
            {
              ...granted.account,
              sp_id: spId,
              created_at: baseAccount.created_at || now,
              updated_at: granted.account.updated_at || now,
            },
            { merge: true },
          )
        }
        if (granted.granted > 0) {
          const ledgerId = `credit-ledger-${randomUUID()}`
          tx.set(db.collection(SP_CREDIT_LEDGER_COLLECTION).doc(ledgerId), {
            id: ledgerId,
            sp_id: spId,
            entry_type: 'adjustment',
            delta: granted.granted,
            balance_after: granted.account.balance,
            source_type: 'free_credit',
            source_id: granted.grantType || 'starter',
            provider: null,
            provider_ref: null,
            created_at: now,
            created_by: 'system',
            note: `Automatic ${granted.grantType || 'starter'} bid credit grant`,
            meta: {
              grant_type: granted.grantType || 'starter',
            },
          })
        }
        return granted.account
      })
    } catch {
      return null
    }
  }

  const listFirestoreSpCreditLedger = async (spId, limit = 100) => {
    try {
      const db = getDb()
      const snap = await db.collection(SP_CREDIT_LEDGER_COLLECTION).where('sp_id', '==', spId).get()
      return snap.docs
        .map((doc) => ({ id: doc.id, ...(doc.data() || {}) }))
        .sort((a, b) => String(b.created_at || '').localeCompare(String(a.created_at || '')))
        .slice(0, Math.max(1, Math.min(Number(limit) || 100, 200)))
    } catch {
      return []
    }
  }

  const listFirestoreSpCreditOrders = async (spId, limit = 100) => {
    try {
      const db = getDb()
      const snap = await db.collection(SP_CREDIT_ORDERS_COLLECTION).where('sp_id', '==', spId).get()
      return snap.docs
        .map((doc) => ({ id: doc.id, ...(doc.data() || {}) }))
        .sort((a, b) => String(b.created_at || '').localeCompare(String(a.created_at || '')))
        .slice(0, Math.max(1, Math.min(Number(limit) || 100, 200)))
    } catch {
      return []
    }
  }

  const ensureSpCreditAccountMemory = (spId) => {
    if (!store.spCreditAccounts) store.spCreditAccounts = new Map()
    if (!store.spCreditLedger) store.spCreditLedger = new Map()
    if (!store.spCreditOrders) store.spCreditOrders = new Map()
    const now = new Date().toISOString()
    const existing = store.spCreditAccounts.get(spId)
    const baseAccount = existing
      ? {
          ...existing,
          balance: toNumber(existing.balance, 0),
          lifetime_purchased: toNumber(existing.lifetime_purchased, 0),
          lifetime_used: toNumber(existing.lifetime_used, 0),
          lifetime_refunded: toNumber(existing.lifetime_refunded, 0),
          lifetime_granted: toNumber(existing.lifetime_granted, 0),
          last_free_credit_at: existing.last_free_credit_at || null,
        }
      : buildDefaultSpCreditAccount(spId, now)
    const granted = applySpFreeCreditPolicy(baseAccount, now)
    store.spCreditAccounts.set(spId, granted.account)
    if (granted.granted > 0) {
      const ledgerId = `credit-ledger-${randomUUID()}`
      appendSpCreditLedgerMemory({
        id: ledgerId,
        sp_id: spId,
        entry_type: 'adjustment',
        delta: granted.granted,
        balance_after: granted.account.balance,
        source_type: 'free_credit',
        source_id: granted.grantType || 'starter',
        provider: null,
        provider_ref: null,
        created_at: now,
        created_by: 'system',
        note: `Automatic ${granted.grantType || 'starter'} bid credit grant`,
        meta: {
          grant_type: granted.grantType || 'starter',
        },
      })
    }
    return granted.account
  }

  const appendSpCreditLedgerMemory = (entry) => {
    if (!store.spCreditLedger) store.spCreditLedger = new Map()
    store.spCreditLedger.set(entry.id, entry)
    return entry
  }

  const createBidWithCreditInFirestore = async ({ actor, leadId, body }) => {
    const db = getDb()
    const now = new Date().toISOString()
    const bidsRef = db.collection(LEADS_COLLECTION).doc(leadId).collection(LEAD_BIDS_SUBCOLLECTION)
    const accountRef = db.collection(SP_CREDIT_ACCOUNTS_COLLECTION).doc(actor.id)

    const result = await db.runTransaction(async (tx) => {
      const leadRef = db.collection(LEADS_COLLECTION).doc(leadId)
      const leadSnap = await tx.get(leadRef)
      if (!leadSnap.exists) throw createApiError(404, 'LEAD_NOT_FOUND', 'Lead not found')
      const leadData = normalizeLead({ id: leadSnap.id, ...(leadSnap.data() || {}) })
      if (leadData.status !== 'open') {
        throw createApiError(400, 'LEAD_NOT_OPEN', 'Lead is not accepting bids')
      }

      const existingSnap = await tx.get(bidsRef.where('sp_id', '==', actor.id))
      const existingRows = existingSnap.docs.map((doc) => ({ id: doc.id, ...(doc.data() || {}) }))
      const latestVersion = existingRows.reduce(
        (max, row) => Math.max(max, Number(row.version_number || 0)),
        0,
      )
      const previousBid = [...existingRows].sort((a, b) =>
        String(b.created_at || '').localeCompare(String(a.created_at || '')),
      )[0]

      const accountSnap = await tx.get(accountRef)
      const accountData = accountSnap.exists
        ? buildSpCreditAccountSnapshot(actor.id, accountSnap.data() || {}, now)
        : buildDefaultSpCreditAccount(actor.id, now)
      const granted = applySpFreeCreditPolicy(accountData, now)
      if (granted.granted > 0 || !accountSnap.exists) {
        tx.set(
          accountRef,
          {
            ...granted.account,
            sp_id: actor.id,
            created_at: accountData.created_at || now,
            updated_at: granted.account.updated_at || now,
          },
          { merge: true },
        )
      }
      if (granted.granted > 0) {
        const ledgerId = `credit-ledger-${randomUUID()}`
        tx.set(db.collection(SP_CREDIT_LEDGER_COLLECTION).doc(ledgerId), {
          id: ledgerId,
          sp_id: actor.id,
          entry_type: 'adjustment',
          delta: granted.granted,
          balance_after: granted.account.balance,
          source_type: 'free_credit',
          source_id: granted.grantType || 'starter',
          provider: null,
          provider_ref: null,
          created_at: now,
          created_by: 'system',
          note: `Automatic ${granted.grantType || 'starter'} bid credit grant`,
          meta: {
            grant_type: granted.grantType || 'starter',
          },
        })
      }
      const currentBalance = toNumber(granted.account.balance, 0)
      if (currentBalance < SP_BID_CREDIT_COST) {
        throw createApiError(
          402,
          'INSUFFICIENT_CREDITS',
          'Insufficient credits. Your free credit will refresh next week.',
        )
      }

      const bidId = `bid-${randomUUID()}`
      const bid = normalizeBid({
        id: bidId,
        lead_id: leadId,
        mx_id: leadData.mx_id || body?.mx_id || leadData.task_id || body?.task_id || null,
        task_id: leadData.task_id || body?.task_id || null,
        task_doc_id: leadData.task_doc_id || body?.task_doc_id || null,
        sp_id: actor.id,
        amount: Number(body.amount),
        currency: body?.currency || 'USD',
        note: body?.note || '',
        message_to_pm: body?.message_to_pm || body?.note || '',
        pricing_type: body?.pricing_type || 'one_time',
        included_scope: body?.included_scope || '',
        exclusions: body?.exclusions || '',
        estimated_start_date: body?.estimated_start_date || body?.availability_date || null,
        estimated_duration: body?.estimated_duration || '',
        availability_date: body?.availability_date || body?.estimated_start_date || null,
        materials_included: body?.materials_included || '',
        materials_note: body?.materials_note || '',
        valid_until: body?.valid_until || null,
        warranty: body?.warranty || '',
        attachments: Array.isArray(body?.attachments) ? body.attachments : [],
        upfront_payment_expected: body?.upfront_payment_expected || 'no',
        upfront_payment_amount:
          body?.upfront_payment_amount != null ? Number(body.upfront_payment_amount) : null,
        upfront_payment_timing: body?.upfront_payment_timing || '',
        upfront_payment_timing_note: body?.upfront_payment_timing_note || '',
        remaining_payment_expectation: body?.remaining_payment_expectation || '',
        payment_note: body?.payment_note || '',
        disclaimer_acknowledged: Boolean(body?.disclaimer_acknowledged),
        disclaimer_text: body?.disclaimer_text || '',
        version_number: latestVersion + 1,
        bid_thread_id: `${leadId}-${actor.id}`,
        previous_bid_id: previousBid?.bid_id || previousBid?.id || '',
        status: 'submitted',
        status_changed_by: null,
        created_at: now,
        updated_at: now,
      })

      const nextBalance = currentBalance - SP_BID_CREDIT_COST
      const nextLifetimeUsed = toNumber(accountData.lifetime_used, 0) + SP_BID_CREDIT_COST

      tx.set(bidsRef.doc(bidId), bid, { merge: true })
      tx.set(
        accountRef,
        {
          ...accountData,
          sp_id: actor.id,
          balance: nextBalance,
          lifetime_used: nextLifetimeUsed,
          updated_at: now,
          created_at: accountData.created_at || now,
        },
        { merge: true },
      )

      const ledgerId = `credit-ledger-${randomUUID()}`
      tx.set(db.collection(SP_CREDIT_LEDGER_COLLECTION).doc(ledgerId), {
        id: ledgerId,
        sp_id: actor.id,
        entry_type: 'consume',
        delta: -SP_BID_CREDIT_COST,
        balance_after: nextBalance,
        source_type: 'bid',
        source_id: bidId,
        lead_id: leadId,
        task_id: bid.task_id || null,
        provider: null,
        provider_ref: null,
        created_at: now,
        created_by: actor.id,
        note: 'Bid submitted successfully',
        meta: {
          bid_amount: bid.amount,
          currency: bid.currency,
        },
      })

      return { bid, balance: nextBalance, credit_cost: SP_BID_CREDIT_COST }
    })

    store.bids.set(result.bid.id, result.bid)
    return result
  }

  const createBidForLead = async ({ actor, leadId, body }) => {
    const found = await getLeadFromAnyStore(leadId)
    const lead = found.lead
    if (!lead) return { ok: false, status: 404, code: 'LEAD_NOT_FOUND', message: 'Lead not found' }
    if (lead.status !== 'open') {
      return {
        ok: false,
        status: 400,
        code: 'LEAD_NOT_OPEN',
        message: 'Lead is not accepting bids',
      }
    }

    const spProfile = store.spProfiles.get(actor.id)
    if (!spProfile) {
      return {
        ok: false,
        status: 404,
        code: 'SP_PROFILE_NOT_FOUND',
        message: 'SP profile not found',
      }
    }
    if (!isSpEligibleForLead(lead, spProfile)) {
      return {
        ok: false,
        status: 403,
        code: 'NOT_ELIGIBLE',
        message: 'You are not eligible to bid on this lead',
      }
    }
    if (!body?.amount || Number(body.amount) <= 0) {
      return {
        ok: false,
        status: 400,
        code: 'INVALID_AMOUNT',
        message: 'Bid amount must be a positive number',
      }
    }
    if (!String(body?.included_scope || '').trim()) {
      return {
        ok: false,
        status: 400,
        code: 'MISSING_INCLUDED_SCOPE',
        message: 'Included scope is required',
      }
    }
    if (!String(body?.estimated_start_date || body?.availability_date || '').trim()) {
      return {
        ok: false,
        status: 400,
        code: 'MISSING_ESTIMATED_START_DATE',
        message: 'Estimated start date is required',
      }
    }
    if (!String(body?.estimated_duration || '').trim()) {
      return {
        ok: false,
        status: 400,
        code: 'MISSING_ESTIMATED_DURATION',
        message: 'Estimated duration is required',
      }
    }
    if (!String(body?.valid_until || '').trim()) {
      return {
        ok: false,
        status: 400,
        code: 'MISSING_VALID_UNTIL',
        message: 'Bid valid-until date is required',
      }
    }
    if (!body?.disclaimer_acknowledged) {
      return {
        ok: false,
        status: 400,
        code: 'DISCLAIMER_REQUIRED',
        message: 'Bid disclaimer must be acknowledged',
      }
    }

    if (found.source === 'firestore') {
      try {
        const txResult = await createBidWithCreditInFirestore({ actor, leadId, body })
        return {
          ok: true,
          bid: txResult.bid,
          credits_balance: txResult.balance,
          credit_cost: txResult.credit_cost,
        }
      } catch (error) {
        if (error?.code && error?.status) {
          return {
            ok: false,
            status: error.status,
            code: error.code,
            message: error.message || 'Failed to submit bid',
          }
        }
        return {
          ok: false,
          status: 500,
          code: 'BID_SUBMIT_FAILED',
          message: 'Unable to submit bid right now',
        }
      }
    }

    const creditAccount = ensureSpCreditAccountMemory(actor.id)
    if (toNumber(creditAccount.balance, 0) < SP_BID_CREDIT_COST) {
      return {
        ok: false,
        status: 402,
        code: 'INSUFFICIENT_CREDITS',
        message: 'Insufficient credits. Your free credit will refresh next week.',
      }
    }

    const bid = store.createBid({ actor, lead, body })
    const nextBalance = toNumber(creditAccount.balance, 0) - SP_BID_CREDIT_COST
    creditAccount.balance = nextBalance
    creditAccount.lifetime_used = toNumber(creditAccount.lifetime_used, 0) + SP_BID_CREDIT_COST
    creditAccount.updated_at = new Date().toISOString()
    appendSpCreditLedgerMemory({
      id: `credit-ledger-${randomUUID()}`,
      sp_id: actor.id,
      entry_type: 'consume',
      delta: -SP_BID_CREDIT_COST,
      balance_after: nextBalance,
      source_type: 'bid',
      source_id: bid.id,
      lead_id: lead.id,
      task_id: bid.task_id || null,
      provider: null,
      provider_ref: null,
      created_at: new Date().toISOString(),
      created_by: actor.id,
      note: 'Bid submitted successfully',
      meta: { bid_amount: bid.amount, currency: bid.currency || 'USD' },
    })
    return {
      ok: true,
      bid: normalizeBid(bid),
      credits_balance: nextBalance,
      credit_cost: SP_BID_CREDIT_COST,
    }
  }

  const parseDateOrNull = (value) => {
    if (!value) return null
    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) return null
    return parsed
  }

  const inRange = (value, fromDate, toDate) => {
    const parsed = parseDateOrNull(value)
    if (!parsed) return false
    if (fromDate && parsed < fromDate) return false
    if (toDate && parsed > toDate) return false
    return true
  }

  const buildRange = (query) => {
    const fromRaw = query.get('from')
    const toRaw = query.get('to')
    const fromDate = parseDateOrNull(fromRaw)
    const toDate = parseDateOrNull(toRaw)
    return { fromDate, toDate, fromRaw, toRaw }
  }

  const paginateRows = (rows, query) => {
    const page = Math.max(1, Number(query.get('page') || 1))
    const pageSize = Math.max(1, Math.min(Number(query.get('page_size') || 20), 200))
    const start = (page - 1) * pageSize
    return {
      page,
      page_size: pageSize,
      total: rows.length,
      items: rows.slice(start, start + pageSize),
    }
  }

  const maskEmail = (email) => {
    const value = String(email || '').trim()
    const atIndex = value.indexOf('@')
    if (atIndex <= 1) return value
    const name = value.slice(0, atIndex)
    const domain = value.slice(atIndex + 1)
    return `${name[0]}***${name.slice(-1)}@${domain}`
  }

  const appendAdminEvent = async ({
    eventType,
    actor,
    requestId,
    entityType = null,
    entityId = null,
    metadata = {},
  }) => {
    const now = new Date().toISOString()
    const id = `admin-event-${randomUUID()}`
    const row = {
      id,
      event_type: eventType,
      user_id: actor?.id || null,
      role: actor?.role || null,
      entity_type: entityType,
      entity_id: entityId,
      request_id: requestId,
      metadata: metadata || {},
      created_at: now,
    }
    if (store.adminEvents) store.adminEvents.set(id, row)
    try {
      const db = getDb()
      await db.collection(ADMIN_EVENTS_COLLECTION).doc(id).set(row, { merge: true })
    } catch {
      // Keep memory write only when Firestore is unavailable.
    }
    return row
  }

  const appendAdminError = async (payload = {}) => {
    const now = new Date().toISOString()
    const id = payload.id || `admin-error-${randomUUID()}`
    const row = {
      id,
      request_id: payload.request_id || null,
      route: payload.route || null,
      error_code: payload.error_code || 'UNKNOWN_ERROR',
      message: payload.message || payload.error_code || 'error',
      retryable: Boolean(payload.retryable),
      user_id: payload.user_id || null,
      role: payload.role || null,
      created_at: payload.created_at || now,
    }
    if (store.adminErrors) store.adminErrors.set(id, row)
    try {
      const db = getDb()
      await db.collection(ADMIN_ERRORS_COLLECTION).doc(id).set(row, { merge: true })
    } catch {
      // Keep memory write only when Firestore is unavailable.
    }
    return row
  }

  const appendAgentEvent = async ({ eventType, actor, requestId, metadata = {} }) => {
    const now = new Date().toISOString()
    const id = `agent-event-${randomUUID()}`
    const row = {
      id,
      event_type: eventType,
      user_id: actor?.id || null,
      role: actor?.role || null,
      request_id: requestId,
      metadata: metadata || {},
      created_at: now,
    }
    if (store.agentEvents) store.agentEvents.set(id, row)
    try {
      const db = getDb()
      await db.collection(AGENT_EVENTS_COLLECTION).doc(id).set(row, { merge: true })
    } catch {
      // Keep memory write only when Firestore is unavailable.
    }
    return row
  }

  const getAdminMetricsRows = async () => {
    try {
      const db = getDb()
      const snap = await db.collection(ADMIN_METRICS_DAILY_COLLECTION).get()
      if (!snap.empty) {
        return snap.docs
          .map((doc) => ({ id: doc.id, ...(doc.data() || {}) }))
          .sort((a, b) => String(a.date || '').localeCompare(String(b.date || '')))
      }
    } catch {
      // fallback to memory
    }
    return [...(store.adminMetricsDaily?.values?.() || [])].sort((a, b) =>
      String(a.date || '').localeCompare(String(b.date || '')),
    )
  }

  const getAdminEventsRows = async () => {
    try {
      const db = getDb()
      const snap = await db.collection(ADMIN_EVENTS_COLLECTION).get()
      if (!snap.empty) {
        return snap.docs
          .map((doc) => ({ id: doc.id, ...(doc.data() || {}) }))
          .sort((a, b) => String(b.created_at || '').localeCompare(String(a.created_at || '')))
      }
    } catch {
      // fallback to memory
    }
    return [...(store.adminEvents?.values?.() || [])].sort((a, b) =>
      String(b.created_at || '').localeCompare(String(a.created_at || '')),
    )
  }

  const getAdminErrorRows = async () => {
    try {
      const db = getDb()
      const snap = await db.collection(ADMIN_ERRORS_COLLECTION).get()
      if (!snap.empty) {
        return snap.docs
          .map((doc) => ({ id: doc.id, ...(doc.data() || {}) }))
          .sort((a, b) => String(b.created_at || '').localeCompare(String(a.created_at || '')))
      }
    } catch {
      // fallback to memory
    }
    return [...(store.adminErrors?.values?.() || [])].sort((a, b) =>
      String(b.created_at || '').localeCompare(String(a.created_at || '')),
    )
  }

  const normalizeAdminDataCollection = (value) => String(value || '').trim()

  const assertAdminDataCollectionAllowed = (collectionName) =>
    ADMIN_DATA_COLLECTION_ALLOWLIST.has(collectionName)

  const toJsonClone = (value) => {
    try {
      return JSON.parse(JSON.stringify(value ?? null))
    } catch {
      return null
    }
  }

  const appendAdminDataChangeLog = async ({
    actor,
    requestId,
    action,
    collectionName,
    docId,
    beforeData,
    afterData,
    reason,
  }) => {
    const now = new Date().toISOString()
    const id = `admin-change-${randomUUID()}`
    const row = {
      id,
      action,
      collection: collectionName,
      doc_id: docId,
      before_data: toJsonClone(beforeData),
      after_data: toJsonClone(afterData),
      reason: String(reason || ''),
      actor_id: actor.id,
      actor_role: actor.role,
      request_id: requestId,
      created_at: now,
      rollback_available: action !== 'rollback',
    }
    try {
      const db = getDb()
      await db.collection(ADMIN_DATA_CHANGE_LOGS_COLLECTION).doc(id).set(row, { merge: true })
    } catch {
      // Admin data edits rely on Firestore; log write failure is ignored to keep action responsive.
    }
    await appendAdminEvent({
      eventType: 'admin_data_changed',
      actor,
      requestId,
      entityType: collectionName,
      entityId: docId,
      metadata: { change_id: id, action, reason: String(reason || '') },
    })
    return row
  }

  const listAdminDataChangeLogs = async ({ collectionName, docId, limit = 100 }) => {
    try {
      const db = getDb()
      let query = db.collection(ADMIN_DATA_CHANGE_LOGS_COLLECTION)
      if (collectionName) query = query.where('collection', '==', collectionName)
      if (docId) query = query.where('doc_id', '==', docId)
      const snap = await query.get()
      return snap.docs
        .map((doc) => ({ id: doc.id, ...(doc.data() || {}) }))
        .sort((a, b) => String(b.created_at || '').localeCompare(String(a.created_at || '')))
        .slice(0, Math.max(1, Math.min(Number(limit) || 100, 500)))
    } catch {
      return []
    }
  }

  const normalizeSupportStatus = (value, fallback = 'open') => {
    const normalized = String(value || '')
      .trim()
      .toLowerCase()
    return SUPPORT_TICKET_STATUSES.has(normalized) ? normalized : fallback
  }

  const normalizeSupportCategory = (value, fallback = 'bug') => {
    const normalized = String(value || '')
      .trim()
      .toLowerCase()
    return SUPPORT_TICKET_CATEGORIES.has(normalized) ? normalized : fallback
  }

  const normalizeSupportPriority = (value, fallback = 'normal') => {
    const normalized = String(value || '')
      .trim()
      .toLowerCase()
    return SUPPORT_TICKET_PRIORITIES.has(normalized) ? normalized : fallback
  }

  const normalizeSupportAttachments = (value) => {
    if (!Array.isArray(value)) return []
    return value
      .map((item) => {
        if (typeof item === 'string')
          return { url: item, name: item.split('/').pop() || 'attachment' }
        if (!item || typeof item !== 'object') return null
        return {
          name: String(item.name || item.file_name || 'attachment').slice(0, 160),
          url: String(item.url || item.download_url || '').slice(0, 2000),
          content_type: String(item.content_type || item.type || '').slice(0, 120),
        }
      })
      .filter((item) => item && item.url)
      .slice(0, 10)
  }

  const buildSupportTicketPatch = (body = {}, now = new Date().toISOString()) => ({
    category: normalizeSupportCategory(body.category),
    subject: String(body.subject || '')
      .trim()
      .slice(0, 180),
    description: String(body.description || '')
      .trim()
      .slice(0, 5000),
    attachments: normalizeSupportAttachments(body.attachments),
    priority: normalizeSupportPriority(body.priority),
    related_entity_type:
      String(body.related_entity_type || '')
        .trim()
        .slice(0, 80) || null,
    related_entity_id:
      String(body.related_entity_id || '')
        .trim()
        .slice(0, 160) || null,
    status: 'open',
    assigned_to: null,
    admin_notes: '',
    created_at: now,
    updated_at: now,
    resolved_at: null,
    closed_at: null,
    last_response_at: null,
    needs_billing_review: Boolean(body.needs_billing_review),
    needs_backend_fix: Boolean(body.needs_backend_fix),
    needs_frontend_fix: Boolean(body.needs_frontend_fix),
    needs_ios_fix: Boolean(body.needs_ios_fix),
  })

  const listSupportTicketComments = async (ticketId, limit = 100) => {
    try {
      const snap = await getDb()
        .collection(SUPPORT_TICKET_COMMENTS_COLLECTION)
        .where('ticket_id', '==', ticketId)
        .get()
      return snap.docs
        .map((doc) => ({ id: doc.id, ...(doc.data() || {}) }))
        .sort((a, b) => String(a.created_at || '').localeCompare(String(b.created_at || '')))
        .slice(0, Math.max(1, Math.min(Number(limit) || 100, 300)))
    } catch {
      return []
    }
  }

  const appendSupportComment = async ({
    ticketId,
    authorType,
    authorId,
    body,
    attachments = [],
    internal = false,
  }) => {
    const now = new Date().toISOString()
    const id = `support-comment-${randomUUID()}`
    const row = {
      id,
      ticket_id: ticketId,
      author_type: authorType,
      author_id: authorId,
      body: String(body || '')
        .trim()
        .slice(0, 5000),
      attachments: normalizeSupportAttachments(attachments),
      internal: Boolean(internal),
      created_at: now,
    }
    await getDb().collection(SUPPORT_TICKET_COMMENTS_COLLECTION).doc(id).set(row, { merge: true })
    return row
  }

  const listFirestoreRows = async (collectionName) => {
    try {
      const db = getDb()
      const snap = await db.collection(collectionName).get()
      return snap.docs.map((doc) => ({ id: doc.id, ...(doc.data() || {}) }))
    } catch {
      return []
    }
  }

  const toEpoch = (value) => {
    const parsed = parseDateOrNull(value)
    return parsed ? parsed.getTime() : 0
  }

  const betweenRange = (value, fromDate, toDate) => {
    const parsed = parseDateOrNull(value)
    if (!parsed) return false
    if (fromDate && parsed < fromDate) return false
    if (toDate && parsed > toDate) return false
    return true
  }

  const aggregateAdSlotStats = async ({ fromDate, toDate, slotId = '', serviceType = '' }) => {
    const [persistedPosts, persistedDeliveries, persistedImpressions, persistedClicks] =
      await Promise.all([
        listFirestoreAdPosts(),
        listFirestoreRows(AD_DELIVERIES_COLLECTION),
        listFirestoreRows(AD_IMPRESSIONS_COLLECTION),
        listFirestoreRows(AD_CLICKS_COLLECTION),
      ])

    const memoryPosts = [...(store.adPosts?.values?.() || [])]
    const memoryDeliveries = [...(store.adDeliveryLogs?.values?.() || [])]
    const memoryImpressions = [...(store.adImpressionEvents?.values?.() || [])]
    const memoryClicks = [...(store.adClickEvents?.values?.() || [])]

    const postById = new Map()
    for (const row of [...persistedPosts, ...memoryPosts]) {
      const id = String(row?.post_id || row?.id || '').trim()
      if (!id) continue
      postById.set(id, {
        ...postById.get(id),
        ...row,
      })
    }

    const deliveryByToken = new Map()
    for (const row of [...persistedDeliveries, ...memoryDeliveries]) {
      const token = String(row?.impression_token || '').trim()
      if (!token) continue
      deliveryByToken.set(token, {
        ...deliveryByToken.get(token),
        ...row,
      })
    }

    const uniqueImpressions = new Map()
    for (const row of [...persistedImpressions, ...memoryImpressions]) {
      const token = String(row?.impression_token || '').trim()
      if (!token) continue
      uniqueImpressions.set(token, {
        ...uniqueImpressions.get(token),
        ...row,
      })
    }

    const uniqueClicks = new Map()
    for (const row of [...persistedClicks, ...memoryClicks]) {
      const token = String(row?.impression_token || '').trim()
      if (!token) continue
      uniqueClicks.set(token, {
        ...uniqueClicks.get(token),
        ...row,
      })
    }

    const normalizedSlot = String(slotId || '')
      .trim()
      .toLowerCase()
    const normalizedService = String(serviceType || '')
      .trim()
      .toLowerCase()

    const deliveryRows = [...deliveryByToken.values()].filter((row) => {
      if (!betweenRange(row.served_at, fromDate, toDate)) return false
      if (normalizedSlot && String(row.slot_id || '').toLowerCase() !== normalizedSlot) return false
      const post = postById.get(String(row.post_id || ''))
      if (
        normalizedService &&
        String(post?.service_type || row.service_type || '').toLowerCase() !== normalizedService
      ) {
        return false
      }
      return true
    })

    const deliveryTokenSet = new Set(
      deliveryRows.map((row) => String(row.impression_token || '').trim()).filter(Boolean),
    )
    const impressionRows = [...uniqueImpressions.values()].filter(
      (row) =>
        deliveryTokenSet.has(String(row.impression_token || '').trim()) &&
        betweenRange(row.event_time, fromDate, toDate),
    )
    const clickRows = [...uniqueClicks.values()].filter(
      (row) =>
        deliveryTokenSet.has(String(row.impression_token || '').trim()) &&
        betweenRange(row.event_time, fromDate, toDate),
    )

    const impressionsByToken = new Set(
      impressionRows.map((row) => String(row.impression_token || '').trim()).filter(Boolean),
    )
    const clicksByToken = new Set(
      clickRows.map((row) => String(row.impression_token || '').trim()).filter(Boolean),
    )

    const slotMap = new Map()
    const typeMap = new Map()
    for (const row of deliveryRows) {
      const token = String(row.impression_token || '').trim()
      const slot = String(row.slot_id || 'unknown')
      const post = postById.get(String(row.post_id || ''))
      const type = String(post?.service_type || row.service_type || 'unknown')
      const hasImpression = impressionsByToken.has(token) ? 1 : 0
      const hasClick = clicksByToken.has(token) ? 1 : 0

      const slotAgg = slotMap.get(slot) || { slot_id: slot, served: 0, impressions: 0, clicks: 0 }
      slotAgg.served += 1
      slotAgg.impressions += hasImpression
      slotAgg.clicks += hasClick
      slotMap.set(slot, slotAgg)

      const typeAgg = typeMap.get(type) || {
        service_type: type,
        served: 0,
        impressions: 0,
        clicks: 0,
      }
      typeAgg.served += 1
      typeAgg.impressions += hasImpression
      typeAgg.clicks += hasClick
      typeMap.set(type, typeAgg)
    }

    const bySlot = [...slotMap.values()]
      .map((row) => ({
        ...row,
        ctr: row.impressions > 0 ? Number(((row.clicks / row.impressions) * 100).toFixed(2)) : 0,
      }))
      .sort((a, b) => b.served - a.served)

    const byServiceType = [...typeMap.values()]
      .map((row) => ({
        ...row,
        ctr: row.impressions > 0 ? Number(((row.clicks / row.impressions) * 100).toFixed(2)) : 0,
      }))
      .sort((a, b) => b.served - a.served)

    const dailyMap = new Map()
    for (const row of deliveryRows) {
      const token = String(row.impression_token || '').trim()
      const ts = toEpoch(row.served_at)
      if (!ts) continue
      const day = new Date(ts).toISOString().slice(0, 10)
      const dailyAgg = dailyMap.get(day) || { date: day, served: 0, impressions: 0, clicks: 0 }
      dailyAgg.served += 1
      if (impressionsByToken.has(token)) dailyAgg.impressions += 1
      if (clicksByToken.has(token)) dailyAgg.clicks += 1
      dailyMap.set(day, dailyAgg)
    }
    const daily = [...dailyMap.values()]
      .map((row) => ({
        ...row,
        ctr: row.impressions > 0 ? Number(((row.clicks / row.impressions) * 100).toFixed(2)) : 0,
      }))
      .sort((a, b) => String(a.date).localeCompare(String(b.date)))

    const served = deliveryRows.length
    const impressions = impressionRows.length
    const clicks = clickRows.length
    return {
      summary: {
        served,
        impressions,
        clicks,
        ctr: impressions > 0 ? Number(((clicks / impressions) * 100).toFixed(2)) : 0,
      },
      by_slot: bySlot,
      by_service_type: byServiceType,
      daily,
    }
  }

  const nowIso = () => new Date().toISOString()

  const toUpper = (value) =>
    String(value || '')
      .trim()
      .toUpperCase()

  const ensureAdStore = () => {
    if (!store.spSources) store.spSources = new Map()
    if (!store.adPosts) store.adPosts = new Map()
    if (!store.adPostTargetRegions) store.adPostTargetRegions = new Map()
    if (!store.adPostSourceIndex) store.adPostSourceIndex = new Map()
    if (!store.adSlotConfigs) store.adSlotConfigs = new Map()
    if (!store.adDeliveryLogs) store.adDeliveryLogs = new Map()
    if (!store.adDeliveryByToken) store.adDeliveryByToken = new Map()
    if (!store.adImpressionEvents) store.adImpressionEvents = new Map()
    if (!store.adClickEvents) store.adClickEvents = new Map()
    if (!store.userRegionProfiles) store.userRegionProfiles = new Map()
    if (!store.promoCampaigns) store.promoCampaigns = new Map()
  }

  const ensureDefaultSlotConfig = (slotId) => {
    ensureAdStore()
    const normalizedSlotId = String(slotId || 'pm_feed_top').trim() || 'pm_feed_top'
    const existing = store.adSlotConfigs.get(normalizedSlotId)
    if (existing) return existing
    const created = {
      slot_id: normalizedSlotId,
      status: 'active',
      card_width_px: 320,
      card_height_px: 180,
      image_aspect_ratio: '16:9',
      max_items: 1,
      sponsored_ratio_numerator: 1,
      sponsored_ratio_denominator: 5,
      frequency_cap_window_hours: 24,
      frequency_cap_per_post: 1,
      fallback_post_id: null,
      updated_at: nowIso(),
    }
    store.adSlotConfigs.set(normalizedSlotId, created)
    return created
  }

  const normalizeRegionLevel = (level) => {
    const next = String(level || '')
      .trim()
      .toLowerCase()
    if (next === 'country' || next === 'state' || next === 'city') return next
    return null
  }

  const normalizeTargetRegions = (regions) =>
    (Array.isArray(regions) ? regions : [])
      .map((row) => ({
        region_level: normalizeRegionLevel(row?.region_level),
        region_code: toUpper(row?.region_code),
      }))
      .filter((row) => row.region_level && row.region_code)

  const resolveUserRegion = ({ req, actor }) => {
    ensureAdStore()
    const headerCountry = toUpper(req.headers['x-user-country'])
    const headerState = toUpper(req.headers['x-user-state'])
    const headerCity = toUpper(req.headers['x-user-city'])
    const cached = store.userRegionProfiles.get(actor.id)

    const resolved = {
      user_id: actor.id,
      country_code: headerCountry || cached?.country_code || 'US',
      state_code: headerState || cached?.state_code || 'CA',
      city_code: headerCity || cached?.city_code || 'US-CA-SJC',
      updated_at: nowIso(),
    }
    store.userRegionProfiles.set(actor.id, resolved)
    return resolved
  }

  const deriveRegionCandidates = (userRegion) => {
    const countrySet = new Set()
    const stateSet = new Set()
    const citySet = new Set()

    const country = toUpper(userRegion?.country_code)
    const state = toUpper(userRegion?.state_code)
    const city = toUpper(userRegion?.city_code)

    if (country) countrySet.add(country)
    if (state) {
      stateSet.add(state)
      if (country && !state.startsWith(`${country}-`)) {
        stateSet.add(`${country}-${state}`)
      }
      const split = state.split('-')
      if (split.length >= 2) {
        countrySet.add(split[0])
        stateSet.add(split[split.length - 1])
      }
    }
    if (city) {
      citySet.add(city)
      const split = city.split('-')
      if (split.length >= 2) {
        countrySet.add(split[0])
        stateSet.add(`${split[0]}-${split[1]}`)
      }
      if (split.length >= 3) {
        stateSet.add(`${split[0]}-${split[1]}`)
      }
    }
    return {
      country: [...countrySet],
      state: [...stateSet],
      city: [...citySet],
    }
  }

  const resolveRegionMatchLevel = ({ userRegion, targetRegions }) => {
    const normalizedTargets = normalizeTargetRegions(targetRegions)
    if (!normalizedTargets.length) return null
    const candidates = deriveRegionCandidates(userRegion)
    const hasCity = normalizedTargets.some(
      (row) => row.region_level === 'city' && candidates.city.includes(row.region_code),
    )
    if (hasCity) return 'city'
    const hasState = normalizedTargets.some(
      (row) => row.region_level === 'state' && candidates.state.includes(row.region_code),
    )
    if (hasState) return 'state'
    const hasCountry = normalizedTargets.some(
      (row) => row.region_level === 'country' && candidates.country.includes(row.region_code),
    )
    if (hasCountry) return 'country'
    return null
  }

  const isPostInServingWindow = (post, nowDate) => {
    const startsAt = parseDateOrNull(post?.starts_at)
    const endsAt = parseDateOrNull(post?.ends_at)
    if (startsAt && nowDate < startsAt) return false
    if (endsAt && nowDate > endsAt) return false
    return true
  }

  const isFrequencyCapped = ({ slotConfig, actorId, postId, slotId, nowDate }) => {
    const maxTimes = Math.max(1, Number(slotConfig?.frequency_cap_per_post || 1))
    const windowHours = Math.max(1, Number(slotConfig?.frequency_cap_window_hours || 24))
    const fromTs = nowDate.getTime() - windowHours * 60 * 60 * 1000
    let servedCount = 0
    for (const row of store.adDeliveryLogs.values()) {
      if (row.user_id !== actorId) continue
      if (row.post_id !== postId) continue
      if (row.slot_id !== slotId) continue
      const servedAt = parseDateOrNull(row.served_at)
      if (!servedAt) continue
      if (servedAt.getTime() < fromTs) continue
      servedCount += 1
      if (servedCount >= maxTimes) return true
    }
    return false
  }

  const computeAdScore = (post, nowDate) => {
    const priority = Number(post?.priority || 0)
    const quality = Number(post?.quality_score || 0.5)
    const createdAt = parseDateOrNull(post?.created_at) || nowDate
    const ageHours = Math.max(0, (nowDate.getTime() - createdAt.getTime()) / (1000 * 60 * 60))
    const freshness = Math.max(0, 1 - ageHours / (24 * 14))
    return priority + quality * 10 + freshness
  }

  const createImpressionToken = () => `itk_${randomUUID().replace(/-/g, '')}`

  const resolveLandingUrl = ({ post, impressionToken }) => {
    const template = String(post?.landing_url_template || '').trim()
    if (!template) return '/'
    const sourcePostId = String(post?.source_post_id || post?.post_id || '').trim()
    const canonicalPostId = String(post?.post_id || '').trim()
    return template
      .replaceAll('{post_id}', encodeURIComponent(sourcePostId || canonicalPostId))
      .replaceAll('{source_post_id}', encodeURIComponent(sourcePostId))
      .replaceAll('{canonical_post_id}', encodeURIComponent(canonicalPostId))
      .replaceAll('{impression_token}', encodeURIComponent(impressionToken || ''))
  }

  const sponsoredEnabled =
    String(
      config.adsSponsoredEnabled || process.env.ADS_SPONSORED_ENABLED || 'false',
    ).toLowerCase() === 'true'

  const buildFeedCacheKey = ({ actor, slotId, userRegion, limit }) =>
    [
      actor.id,
      slotId,
      String(limit || 1),
      toUpper(userRegion?.country_code),
      toUpper(userRegion?.state_code),
      toUpper(userRegion?.city_code),
      sponsoredEnabled ? 'sponsored:on' : 'sponsored:off',
    ].join('|')

  const touchFeedBucket = ({ actorId, slotId }) => {
    const now = Date.now()
    const key = `${actorId}|${slotId}`
    const bucket = feedRequestBuckets.get(key) || { count: 0, resetAt: now + feedRequestWindowMs }
    if (now > bucket.resetAt) {
      bucket.count = 0
      bucket.resetAt = now + feedRequestWindowMs
    }
    bucket.count += 1
    feedRequestBuckets.set(key, bucket)
    return {
      overloaded: bucket.count > feedMaxRequestsPerWindow,
      remaining: Math.max(0, feedMaxRequestsPerWindow - bucket.count),
    }
  }

  const getFeedCacheEntry = ({ key, allowStale = false }) => {
    const entry = feedCache.get(key)
    if (!entry) return null
    const now = Date.now()
    const isFresh = now <= entry.expiresAt
    if (isFresh) return { ...entry, stale: false }
    if (!allowStale) return null
    const staleBudgetMs = Math.max(feedCacheTtlMs, 10000)
    if (now - entry.expiresAt > staleBudgetMs) return null
    return { ...entry, stale: true }
  }

  const computeFeedEtag = (payload) => {
    const digest = createHash('sha1').update(JSON.stringify(payload)).digest('hex').slice(0, 16)
    return `W/"${digest}"`
  }

  const getOrBuildFeedPayload = async ({ key, build }) => {
    if (feedInFlight.has(key)) return feedInFlight.get(key)
    const task = Promise.resolve()
      .then(build)
      .finally(() => {
        feedInFlight.delete(key)
      })
    feedInFlight.set(key, task)
    return task
  }

  const hashValue = (value) =>
    createHash('sha1')
      .update(String(value || ''))
      .digest('hex')

  const buildDeterministicPostId = (sourceCode, sourcePostId) =>
    `adp-${hashValue(`${String(sourceCode || '').toLowerCase()}::${String(sourcePostId || '')}`).slice(0, 24)}`

  const getFirestoreFeedCacheDocId = (cacheKey) => `cache-${hashValue(cacheKey).slice(0, 32)}`

  const saveFirestoreAdPost = async (post, targetRegions = []) => {
    try {
      const db = getDb()
      await db
        .collection(AD_POSTS_COLLECTION)
        .doc(String(post.post_id))
        .set(
          {
            ...post,
            target_regions: normalizeTargetRegions(targetRegions),
            updated_server_at: nowIso(),
          },
          { merge: true },
        )
    } catch {
      // keep memory write when Firestore is unavailable
    }
  }

  const listFirestoreAdPosts = async () => {
    try {
      const db = getDb()
      const snap = await db.collection(AD_POSTS_COLLECTION).get()
      return snap.docs.map((doc) => ({ post_id: doc.id, ...(doc.data() || {}) }))
    } catch {
      return []
    }
  }

  const getFirestoreAdPostById = async (postId) => {
    try {
      const db = getDb()
      const doc = await db.collection(AD_POSTS_COLLECTION).doc(String(postId)).get()
      if (!doc.exists) return null
      return { post_id: doc.id, ...(doc.data() || {}) }
    } catch {
      return null
    }
  }

  const hydrateAdPostsFromFirestore = async () => {
    const rows = await listFirestoreAdPosts()
    if (!rows.length) return
    ensureAdStore()
    for (const row of rows) {
      const sourceCode = String(row.source_code || '').toLowerCase()
      const sourcePostId = String(row.source_post_id || '')
      const post = {
        ...row,
        post_id: row.post_id,
      }
      store.adPosts.set(post.post_id, post)
      store.adPostTargetRegions.set(post.post_id, normalizeTargetRegions(row.target_regions || []))
      if (sourceCode && sourcePostId) {
        store.adPostSourceIndex.set(`${sourceCode}::${sourcePostId}`, post.post_id)
      }
    }
  }

  const saveFirestoreAdDelivery = async (row) => {
    try {
      const db = getDb()
      await db
        .collection(AD_DELIVERIES_COLLECTION)
        .doc(String(row.impression_token))
        .set(
          {
            ...row,
            updated_server_at: nowIso(),
          },
          { merge: true },
        )
    } catch {
      // keep memory write when Firestore is unavailable
    }
  }

  const getFirestoreAdDeliveryByToken = async (impressionToken) => {
    try {
      const db = getDb()
      const doc = await db.collection(AD_DELIVERIES_COLLECTION).doc(String(impressionToken)).get()
      if (!doc.exists) return null
      return doc.data() || null
    } catch {
      return null
    }
  }

  const getFirestoreAdImpressionByToken = async (impressionToken) => {
    try {
      const db = getDb()
      const doc = await db.collection(AD_IMPRESSIONS_COLLECTION).doc(String(impressionToken)).get()
      if (!doc.exists) return null
      return doc.data() || null
    } catch {
      return null
    }
  }

  const saveFirestoreAdImpression = async (row) => {
    try {
      const db = getDb()
      await db.collection(AD_IMPRESSIONS_COLLECTION).doc(String(row.impression_token)).set(row, {
        merge: true,
      })
    } catch {
      // keep memory write when Firestore is unavailable
    }
  }

  const getFirestoreAdClickByToken = async (impressionToken) => {
    try {
      const db = getDb()
      const doc = await db.collection(AD_CLICKS_COLLECTION).doc(String(impressionToken)).get()
      if (!doc.exists) return null
      return doc.data() || null
    } catch {
      return null
    }
  }

  const saveFirestoreAdClick = async (row) => {
    try {
      const db = getDb()
      await db.collection(AD_CLICKS_COLLECTION).doc(String(row.impression_token)).set(row, {
        merge: true,
      })
    } catch {
      // keep memory write when Firestore is unavailable
    }
  }

  const getFirestoreFeedCache = async (cacheKey, allowStale = false) => {
    try {
      const db = getDb()
      const doc = await db
        .collection(AD_FEED_CACHE_COLLECTION)
        .doc(getFirestoreFeedCacheDocId(cacheKey))
        .get()
      if (!doc.exists) return null
      const row = doc.data() || {}
      const expiresAtDate = parseDateOrNull(row.expires_at)
      if (!expiresAtDate) return null
      const now = Date.now()
      const expiresAt = expiresAtDate.getTime()
      if (now <= expiresAt) {
        return { payload: row.payload || null, etag: row.etag || null, expiresAt, stale: false }
      }
      if (!allowStale) return null
      const staleBudgetMs = Math.max(feedCacheTtlMs, 10000)
      if (now - expiresAt > staleBudgetMs) return null
      return { payload: row.payload || null, etag: row.etag || null, expiresAt, stale: true }
    } catch {
      return null
    }
  }

  const saveFirestoreFeedCache = async (cacheKey, payload, etag, expiresAtMs) => {
    try {
      const db = getDb()
      await db
        .collection(AD_FEED_CACHE_COLLECTION)
        .doc(getFirestoreFeedCacheDocId(cacheKey))
        .set(
          {
            cache_key_hash: hashValue(cacheKey),
            payload,
            etag,
            expires_at: new Date(expiresAtMs).toISOString(),
            updated_at: nowIso(),
          },
          { merge: true },
        )
    } catch {
      // keep memory write when Firestore is unavailable
    }
  }

  const clearFirestoreFeedCache = async () => {
    try {
      const db = getDb()
      while (true) {
        const snap = await db.collection(AD_FEED_CACHE_COLLECTION).limit(200).get()
        if (snap.empty) break
        const batch = db.batch()
        for (const doc of snap.docs) {
          batch.delete(doc.ref)
        }
        await batch.commit()
      }
    } catch {
      // keep memory clear when Firestore is unavailable
    }
  }

  route('GET', '/admin/overview', async ({ actor, query, res, requestId }) => {
    if (!assertRole({ actor, allowed: ['admin'], res, requestId })) return

    const { fromDate, toDate } = buildRange(query)
    const rows = await getAdminMetricsRows()
    const filtered = rows.filter((row) => {
      const metricDate = parseDateOrNull(`${row.date || ''}T00:00:00.000Z`)
      if (!metricDate) return false
      if (fromDate && metricDate < fromDate) return false
      if (toDate && metricDate > toDate) return false
      return true
    })
    const target = filtered.length ? filtered[filtered.length - 1] : rows[rows.length - 1]
    const latest = target || {}
    const totalRoleCount = Object.values(latest.role_active_counts || {}).reduce(
      (sum, value) => sum + toNumber(value, 0),
      0,
    )
    const roleShare = totalRoleCount
      ? Object.fromEntries(
          Object.entries(latest.role_active_counts || {}).map(([key, value]) => [
            key,
            Number(((toNumber(value, 0) / totalRoleCount) * 100).toFixed(2)),
          ]),
        )
      : {}
    const alertCards = {
      error_spike_24h: toNumber(latest.frontend_errors, 0) >= 8 ? 'warning' : 'ok',
      callback_failure_rate:
        toNumber(latest.function_invocations, 0) > 0 &&
        toNumber(latest.frontend_errors, 0) / toNumber(latest.function_invocations, 1) > 0.01
          ? 'warning'
          : 'ok',
      negative_credit_balance: [...(store.spCreditAccounts?.values?.() || [])].some(
        (row) => toNumber(row.balance, 0) < 0,
      )
        ? 'critical'
        : 'ok',
    }

    await appendAdminEvent({
      eventType: 'admin_overview_viewed',
      actor,
      requestId,
      entityType: 'dashboard',
      entityId: 'overview',
    })

    return ok(res, requestId, {
      range: {
        from: query.get('from') || null,
        to: query.get('to') || null,
      },
      kpis: {
        dau: toNumber(latest.dau, 0),
        wau: toNumber(latest.wau, 0),
        retention_7d: toNumber(latest.retention_7d, 0),
        role_active_share: roleShare,
      },
      funnel: latest.funnel_counts || {},
      system_health: {
        api_success_rate: toNumber(latest.api_success_rate, 0),
        p95_ms: toNumber(latest.p95_ms, 0),
        frontend_errors: toNumber(latest.frontend_errors, 0),
        function_failures: toNumber(latest.function_failures, 0),
      },
      cost_overview: {
        firestore_reads: toNumber(latest.firestore_reads, 0),
        firestore_writes: toNumber(latest.firestore_writes, 0),
        storage_gb: toNumber(latest.storage_gb, 0),
        function_invocations: toNumber(latest.function_invocations, 0),
        cost_estimate_usd: toNumber(latest.cost_estimate_usd, 0),
      },
      alerts: alertCards,
      daily_points: filtered.slice(-30),
    })
  })

  route('GET', '/admin/users', async ({ actor, query, res, requestId }) => {
    if (!assertRole({ actor, allowed: ['admin'], res, requestId })) return
    const role = String(query.get('role') || '')
      .trim()
      .toLowerCase()
    const status = String(query.get('status') || '')
      .trim()
      .toLowerCase()
    const paid = query.get('paid')
    const { fromDate, toDate } = buildRange(query)
    const rows = [...store.users.values()]
      .map((user) => ({
        user_id: user.id,
        email: user.email || `${user.id}@handout.local`,
        account_type: user.account_type || user.role,
        role: user.role,
        status: user.status || 'active',
        is_paid: Boolean(user.is_paid || user.billing?.plan_name !== 'free'),
        last_active_at: user.last_active_at || null,
        created_at: user.created_at || null,
      }))
      .filter((row) => {
        if (role && String(row.role || '').toLowerCase() !== role) return false
        if (status && String(row.status || '').toLowerCase() !== status) return false
        if (paid !== null && paid !== '' && String(row.is_paid) !== String(paid === 'true'))
          return false
        if ((fromDate || toDate) && !inRange(row.last_active_at, fromDate, toDate)) return false
        return true
      })
      .sort((a, b) => String(b.last_active_at || '').localeCompare(String(a.last_active_at || '')))

    await appendAdminEvent({
      eventType: 'admin_users_list_viewed',
      actor,
      requestId,
      entityType: 'users',
      entityId: 'list',
      metadata: { total: rows.length },
    })
    return ok(res, requestId, paginateRows(rows, query))
  })

  route('GET', '/admin/users/:id', async ({ actor, params, res, requestId }) => {
    if (!assertRole({ actor, allowed: ['admin'], res, requestId })) return
    const user = store.users.get(params.id)
    if (!user) return sendError(res, requestId, 404, 'USER_NOT_FOUND', 'User not found')

    const now = new Date()
    const events = (await getAdminEventsRows())
      .filter((row) => row.user_id === params.id)
      .sort((a, b) => String(b.created_at || '').localeCompare(String(a.created_at || '')))
      .slice(0, 100)
    const assets = {
      properties: Math.max(0, Math.floor((params.id.length + 3) % 7)),
      tasks: [...store.tasks.values()].filter((task) => task.creator_user_id === params.id).length,
      leases: Math.max(0, Math.floor((params.id.length + 5) % 4)),
    }
    const detail = {
      user_id: user.id,
      email: user.email || `${user.id}@handout.local`,
      email_masked: maskEmail(user.email || `${user.id}@handout.local`),
      account_type: user.account_type || user.role,
      status: user.status || 'active',
      role: user.role,
      is_paid: Boolean(user.is_paid || user.billing?.plan_name !== 'free'),
      created_at: user.created_at || now.toISOString(),
      last_active_at: user.last_active_at || null,
      linked_assets: assets,
      recent_timeline: events,
    }
    await appendAdminEvent({
      eventType: 'admin_user_detail_viewed',
      actor,
      requestId,
      entityType: 'user',
      entityId: user.id,
    })
    return ok(res, requestId, detail)
  })

  route('POST', '/admin/users/:id/freeze', async ({ actor, params, body, res, requestId }) => {
    if (!assertRole({ actor, allowed: ['admin'], res, requestId })) return
    const user = store.users.get(params.id)
    if (!user) return sendError(res, requestId, 404, 'USER_NOT_FOUND', 'User not found')
    user.status = 'frozen'
    user.updated_at = new Date().toISOString()
    await appendAdminEvent({
      eventType: 'admin_user_frozen',
      actor,
      requestId,
      entityType: 'user',
      entityId: user.id,
      metadata: { reason: String(body?.reason || '') },
    })
    return ok(res, requestId, {
      user_id: user.id,
      status: user.status,
      updated_at: user.updated_at,
    })
  })

  route('POST', '/admin/users/:id/unfreeze', async ({ actor, params, body, res, requestId }) => {
    if (!assertRole({ actor, allowed: ['admin'], res, requestId })) return
    const user = store.users.get(params.id)
    if (!user) return sendError(res, requestId, 404, 'USER_NOT_FOUND', 'User not found')
    user.status = 'active'
    user.updated_at = new Date().toISOString()
    await appendAdminEvent({
      eventType: 'admin_user_unfrozen',
      actor,
      requestId,
      entityType: 'user',
      entityId: user.id,
      metadata: { reason: String(body?.reason || '') },
    })
    return ok(res, requestId, {
      user_id: user.id,
      status: user.status,
      updated_at: user.updated_at,
    })
  })

  route('GET', '/admin/billing/summary', async ({ actor, query, res, requestId }) => {
    if (!assertRole({ actor, allowed: ['admin'], res, requestId })) return
    const { fromDate, toDate } = buildRange(query)
    const users = [...store.users.values()]
    const planCounts = users.reduce((acc, user) => {
      const plan = String(user.billing?.plan_name || 'free').toLowerCase()
      acc[plan] = (acc[plan] || 0) + 1
      return acc
    }, {})
    const paidCount = users.filter(
      (user) => String(user.billing?.plan_name || 'free') !== 'free',
    ).length
    const conversionRate = users.length ? Number(((paidCount / users.length) * 100).toFixed(2)) : 0
    const orders = [...(store.spCreditOrders?.values?.() || [])].filter((row) =>
      fromDate || toDate ? inRange(row.created_at, fromDate, toDate) : true,
    )
    const ledger = [...(store.spCreditLedger?.values?.() || [])].filter((row) =>
      fromDate || toDate ? inRange(row.created_at, fromDate, toDate) : true,
    )
    const accounts = [...(store.spCreditAccounts?.values?.() || [])]
    const totalPurchased = orders
      .filter((row) => ['paid', 'credited'].includes(normalizeCreditOrderStatus(row.status)))
      .reduce((sum, row) => sum + toNumber(row.credits, 0), 0)
    const totalUsed = ledger
      .filter((row) =>
        ['bid_use', 'consume', 'usage'].includes(String(row.entry_type || '').toLowerCase()),
      )
      .reduce((sum, row) => sum + Math.abs(toNumber(row.delta, 0)), 0)
    const totalBalance = accounts.reduce((sum, row) => sum + toNumber(row.balance, 0), 0)
    const sourceDistribution = ledger.reduce((acc, row) => {
      const key = String(row.source_type || 'unknown')
      acc[key] = (acc[key] || 0) + Math.abs(toNumber(row.delta, 0))
      return acc
    }, {})

    await appendAdminEvent({
      eventType: 'admin_billing_summary_viewed',
      actor,
      requestId,
      entityType: 'billing',
      entityId: 'summary',
    })
    return ok(res, requestId, {
      plan_overview: {
        counts: planCounts,
        mrr_estimate_usd: paidCount * 39,
        conversion_rate: conversionRate,
      },
      sp_credit_overview: {
        total_purchased: totalPurchased,
        total_used: totalUsed,
        total_balance: totalBalance,
        usage_source_distribution: sourceDistribution,
      },
    })
  })

  route('GET', '/admin/credits/accounts', async ({ actor, query, res, requestId }) => {
    if (!assertRole({ actor, allowed: ['admin'], res, requestId })) return
    const spId = String(query.get('sp_id') || '').trim()
    const rows = [...(store.spCreditAccounts?.values?.() || [])]
      .filter((row) => (spId ? String(row.sp_id) === spId : true))
      .map((row) => ({
        sp_id: row.sp_id,
        balance: toNumber(row.balance, 0),
        lifetime_purchased: toNumber(row.lifetime_purchased, 0),
        lifetime_used: toNumber(row.lifetime_used, 0),
        lifetime_refunded: toNumber(row.lifetime_refunded, 0),
        updated_at: row.updated_at || row.created_at || null,
      }))
      .sort((a, b) => String(b.updated_at || '').localeCompare(String(a.updated_at || '')))
    return ok(res, requestId, paginateRows(rows, query))
  })

  route('GET', '/admin/credits/orders', async ({ actor, query, res, requestId }) => {
    if (!assertRole({ actor, allowed: ['admin'], res, requestId })) return
    const spId = String(query.get('sp_id') || '').trim()
    const status = String(query.get('status') || '')
      .trim()
      .toLowerCase()
    const { fromDate, toDate } = buildRange(query)
    const rows = [...(store.spCreditOrders?.values?.() || [])]
      .filter((row) => {
        if (spId && String(row.sp_id) !== spId) return false
        if (status && String(row.status || '').toLowerCase() !== status) return false
        if ((fromDate || toDate) && !inRange(row.created_at, fromDate, toDate)) return false
        return true
      })
      .sort((a, b) => String(b.created_at || '').localeCompare(String(a.created_at || '')))
    return ok(res, requestId, { items: rows })
  })

  route('GET', '/admin/credits/ledger', async ({ actor, query, res, requestId }) => {
    if (!assertRole({ actor, allowed: ['admin'], res, requestId })) return
    const spId = String(query.get('sp_id') || '').trim()
    const entryType = String(query.get('entry_type') || '')
      .trim()
      .toLowerCase()
    const { fromDate, toDate } = buildRange(query)
    const rows = [...(store.spCreditLedger?.values?.() || [])]
      .filter((row) => {
        if (spId && String(row.sp_id) !== spId) return false
        if (entryType && String(row.entry_type || '').toLowerCase() !== entryType) return false
        if ((fromDate || toDate) && !inRange(row.created_at, fromDate, toDate)) return false
        return true
      })
      .sort((a, b) => String(b.created_at || '').localeCompare(String(a.created_at || '')))
    return ok(res, requestId, { items: rows })
  })

  route('POST', '/admin/credits/adjust', async ({ actor, body, res, requestId }) => {
    if (!assertRole({ actor, allowed: ['admin'], res, requestId })) return
    const spId = String(body?.sp_id || '').trim()
    const delta = Number(body?.delta || 0)
    const reason = String(body?.reason || '').trim()
    const confirmToken = String(body?.confirm_token || '').trim()
    if (!spId) return sendError(res, requestId, 400, 'MISSING_SP_ID', 'sp_id is required')
    if (!Number.isFinite(delta) || delta === 0) {
      return sendError(res, requestId, 400, 'INVALID_DELTA', 'delta must be a non-zero number')
    }
    if (!reason) {
      await appendAdminError({
        request_id: requestId,
        route: '/admin/credits/adjust',
        error_code: 'MISSING_REASON',
        retryable: false,
        user_id: actor.id,
        role: actor.role,
      })
      return sendError(res, requestId, 400, 'MISSING_REASON', 'reason is required')
    }
    if (confirmToken !== 'CONFIRM') {
      await appendAdminError({
        request_id: requestId,
        route: '/admin/credits/adjust',
        error_code: 'SECOND_CONFIRM_REQUIRED',
        retryable: false,
        user_id: actor.id,
        role: actor.role,
      })
      return sendError(
        res,
        requestId,
        400,
        'SECOND_CONFIRM_REQUIRED',
        'confirm_token must be CONFIRM for manual credit adjustment',
      )
    }

    const account = ensureSpCreditAccountMemory(spId)
    const now = new Date().toISOString()
    const balanceAfter = toNumber(account.balance, 0) + delta
    if (balanceAfter < 0) {
      return sendError(
        res,
        requestId,
        400,
        'NEGATIVE_CREDIT_BALANCE',
        'Credit balance cannot be negative',
      )
    }
    account.balance = balanceAfter
    if (delta > 0) {
      account.lifetime_purchased = toNumber(account.lifetime_purchased, 0) + delta
    } else {
      account.lifetime_used = toNumber(account.lifetime_used, 0) + Math.abs(delta)
    }
    account.updated_at = now

    const ledgerRow = appendSpCreditLedgerMemory({
      id: `credit-ledger-${randomUUID()}`,
      sp_id: spId,
      entry_type: 'adjustment',
      delta,
      balance_after: balanceAfter,
      source_type: 'admin_adjustment',
      source_id: requestId,
      provider: null,
      provider_ref: null,
      created_at: now,
      created_by: actor.id,
      note: reason,
      meta: {
        reason,
        actor_id: actor.id,
      },
    })
    await appendAdminEvent({
      eventType: 'admin_credit_adjusted',
      actor,
      requestId,
      entityType: 'sp_credit_account',
      entityId: spId,
      metadata: { delta, reason, balance_after: balanceAfter },
    })

    return ok(res, requestId, {
      sp_id: spId,
      delta,
      balance_after: balanceAfter,
      ledger_entry: ledgerRow,
    })
  })

  route('GET', '/admin/logs/events', async ({ actor, query, res, requestId }) => {
    if (!assertRole({ actor, allowed: ['admin'], res, requestId })) return
    const eventType = String(query.get('event_type') || '')
      .trim()
      .toLowerCase()
    const userId = String(query.get('user_id') || '').trim()
    const requestFilter = String(query.get('request_id') || '').trim()
    const entityFilters = {
      task_id: String(query.get('task_id') || '').trim(),
      lead_id: String(query.get('lead_id') || '').trim(),
      order_id: String(query.get('order_id') || '').trim(),
    }
    const { fromDate, toDate } = buildRange(query)
    const rows = (await getAdminEventsRows()).filter((row) => {
      if (eventType && String(row.event_type || '').toLowerCase() !== eventType) return false
      if (userId && String(row.user_id || '') !== userId) return false
      if (requestFilter && String(row.request_id || '') !== requestFilter) return false
      if (entityFilters.task_id && String(row.entity_id || '') !== entityFilters.task_id)
        return false
      if (entityFilters.lead_id && String(row.entity_id || '') !== entityFilters.lead_id)
        return false
      if (entityFilters.order_id && String(row.entity_id || '') !== entityFilters.order_id)
        return false
      if ((fromDate || toDate) && !inRange(row.created_at, fromDate, toDate)) return false
      return true
    })
    return ok(res, requestId, { items: rows.slice(0, 500) })
  })

  route('GET', '/admin/logs/errors', async ({ actor, query, res, requestId }) => {
    if (!assertRole({ actor, allowed: ['admin'], res, requestId })) return
    const errorCode = String(query.get('error_code') || '')
      .trim()
      .toLowerCase()
    const routeFilter = String(query.get('route') || '')
      .trim()
      .toLowerCase()
    const requestFilter = String(query.get('request_id') || '').trim()
    const { fromDate, toDate } = buildRange(query)
    const rows = (await getAdminErrorRows()).filter((row) => {
      if (errorCode && String(row.error_code || '').toLowerCase() !== errorCode) return false
      if (
        routeFilter &&
        !String(row.route || '')
          .toLowerCase()
          .includes(routeFilter)
      )
        return false
      if (requestFilter && String(row.request_id || '') !== requestFilter) return false
      if ((fromDate || toDate) && !inRange(row.created_at, fromDate, toDate)) return false
      return true
    })
    return ok(res, requestId, { items: rows.slice(0, 500) })
  })

  route('POST', '/support/tickets', async ({ actor, body, res, requestId }) => {
    const now = new Date().toISOString()
    const ticketPatch = buildSupportTicketPatch(body, now)
    if (!ticketPatch.subject || !ticketPatch.description) {
      return sendError(
        res,
        requestId,
        400,
        'MISSING_FIELDS',
        'subject and description are required',
      )
    }
    try {
      const id = `support-ticket-${randomUUID()}`
      const userId = String(body?.user_id || actor.id || '').trim()
      const ticket = {
        id,
        user_id: userId,
        user_role: normalizeRole(body?.user_role) || actor.role || null,
        ...ticketPatch,
      }
      await getDb().collection(SUPPORT_TICKETS_COLLECTION).doc(id).set(ticket, { merge: true })
      await appendSupportComment({
        ticketId: id,
        authorType: 'user',
        authorId: userId,
        body: ticket.description,
        attachments: ticket.attachments,
      })
      return ok(res, requestId, { ticket })
    } catch {
      return sendError(
        res,
        requestId,
        500,
        'SUPPORT_TICKET_CREATE_FAILED',
        'Unable to create support ticket',
        true,
      )
    }
  })

  route('GET', '/support/tickets/:id', async ({ actor, params, res, requestId }) => {
    try {
      const snap = await getDb().collection(SUPPORT_TICKETS_COLLECTION).doc(params.id).get()
      if (!snap.exists)
        return sendError(res, requestId, 404, 'TICKET_NOT_FOUND', 'Support ticket not found')
      const ticket = { id: snap.id, ...(snap.data() || {}) }
      if (actor.role !== 'admin' && String(ticket.user_id || '') !== String(actor.id || '')) {
        return sendError(
          res,
          requestId,
          403,
          'PERMISSION_DENIED',
          'Ticket is not visible to this user',
        )
      }
      const comments = (await listSupportTicketComments(ticket.id)).filter(
        (row) => actor.role === 'admin' || !row.internal,
      )
      return ok(res, requestId, { ticket, comments })
    } catch {
      return sendError(
        res,
        requestId,
        500,
        'SUPPORT_TICKET_READ_FAILED',
        'Unable to read support ticket',
        true,
      )
    }
  })

  route('GET', '/admin/support/tickets', async ({ actor, query, res, requestId }) => {
    if (!assertRole({ actor, allowed: ['admin'], res, requestId })) return
    const status = String(query.get('status') || '')
      .trim()
      .toLowerCase()
    const category = String(query.get('category') || '')
      .trim()
      .toLowerCase()
    const priority = String(query.get('priority') || '')
      .trim()
      .toLowerCase()
    const assignedTo = String(query.get('assigned_to') || '').trim()
    const search = String(query.get('q') || '')
      .trim()
      .toLowerCase()
    const limit = Math.max(1, Math.min(Number(query.get('limit') || 100), 300))
    try {
      const snap = await getDb().collection(SUPPORT_TICKETS_COLLECTION).get()
      const items = snap.docs
        .map((doc) => ({ id: doc.id, ...(doc.data() || {}) }))
        .filter((row) => {
          if (status && String(row.status || '') !== status) return false
          if (category && String(row.category || '') !== category) return false
          if (priority && String(row.priority || '') !== priority) return false
          if (assignedTo && String(row.assigned_to || '') !== assignedTo) return false
          if (search) {
            const haystack =
              `${row.id || ''} ${row.subject || ''} ${row.description || ''} ${row.user_id || ''}`.toLowerCase()
            if (!haystack.includes(search)) return false
          }
          return true
        })
        .sort((a, b) => String(b.updated_at || '').localeCompare(String(a.updated_at || '')))
        .slice(0, limit)

      const counters = items.reduce((acc, row) => {
        const key = normalizeSupportStatus(row.status)
        acc[key] = (acc[key] || 0) + 1
        return acc
      }, {})

      return ok(res, requestId, { items, counters })
    } catch {
      return sendError(
        res,
        requestId,
        500,
        'SUPPORT_TICKET_LIST_FAILED',
        'Unable to list support tickets',
        true,
      )
    }
  })

  route('GET', '/admin/support/tickets/:id', async ({ actor, params, res, requestId }) => {
    if (!assertRole({ actor, allowed: ['admin'], res, requestId })) return
    try {
      const snap = await getDb().collection(SUPPORT_TICKETS_COLLECTION).doc(params.id).get()
      if (!snap.exists)
        return sendError(res, requestId, 404, 'TICKET_NOT_FOUND', 'Support ticket not found')
      const ticket = { id: snap.id, ...(snap.data() || {}) }
      const comments = await listSupportTicketComments(ticket.id)
      await appendAdminEvent({
        eventType: 'admin_support_ticket_viewed',
        actor,
        requestId,
        entityType: 'support_ticket',
        entityId: ticket.id,
      })
      return ok(res, requestId, { ticket, comments })
    } catch {
      return sendError(
        res,
        requestId,
        500,
        'SUPPORT_TICKET_READ_FAILED',
        'Unable to read support ticket',
        true,
      )
    }
  })

  route(
    'POST',
    '/admin/support/tickets/:id/update',
    async ({ actor, params, body, res, requestId }) => {
      if (!assertRole({ actor, allowed: ['admin'], res, requestId })) return
      try {
        const db = getDb()
        const ref = db.collection(SUPPORT_TICKETS_COLLECTION).doc(params.id)
        const snap = await ref.get()
        if (!snap.exists)
          return sendError(res, requestId, 404, 'TICKET_NOT_FOUND', 'Support ticket not found')

        const before = { id: snap.id, ...(snap.data() || {}) }
        const now = new Date().toISOString()
        const status =
          body?.status === undefined
            ? before.status
            : normalizeSupportStatus(body.status, before.status)
        const patch = {
          status,
          category:
            body?.category === undefined
              ? before.category
              : normalizeSupportCategory(body.category, before.category),
          priority:
            body?.priority === undefined
              ? before.priority
              : normalizeSupportPriority(body.priority, before.priority),
          assigned_to:
            body?.assigned_to === undefined
              ? before.assigned_to || null
              : String(body.assigned_to || '').trim() || null,
          related_entity_type:
            body?.related_entity_type === undefined
              ? before.related_entity_type || null
              : String(body.related_entity_type || '').trim() || null,
          related_entity_id:
            body?.related_entity_id === undefined
              ? before.related_entity_id || null
              : String(body.related_entity_id || '').trim() || null,
          needs_billing_review:
            body?.needs_billing_review === undefined
              ? Boolean(before.needs_billing_review)
              : Boolean(body.needs_billing_review),
          needs_backend_fix:
            body?.needs_backend_fix === undefined
              ? Boolean(before.needs_backend_fix)
              : Boolean(body.needs_backend_fix),
          needs_frontend_fix:
            body?.needs_frontend_fix === undefined
              ? Boolean(before.needs_frontend_fix)
              : Boolean(body.needs_frontend_fix),
          needs_ios_fix:
            body?.needs_ios_fix === undefined
              ? Boolean(before.needs_ios_fix)
              : Boolean(body.needs_ios_fix),
          updated_at: now,
          resolved_at:
            status === 'resolved' ? before.resolved_at || now : before.resolved_at || null,
          closed_at: status === 'closed' ? before.closed_at || now : before.closed_at || null,
        }
        await ref.set(patch, { merge: true })
        const afterSnap = await ref.get()
        const ticket = { id: afterSnap.id, ...(afterSnap.data() || {}) }
        await appendAdminEvent({
          eventType: 'admin_support_ticket_updated',
          actor,
          requestId,
          entityType: 'support_ticket',
          entityId: ticket.id,
          metadata: { before_status: before.status, status: ticket.status },
        })
        return ok(res, requestId, { ticket })
      } catch {
        return sendError(
          res,
          requestId,
          500,
          'SUPPORT_TICKET_UPDATE_FAILED',
          'Unable to update support ticket',
          true,
        )
      }
    },
  )

  route(
    'POST',
    '/admin/support/tickets/:id/comment',
    async ({ actor, params, body, res, requestId }) => {
      if (!assertRole({ actor, allowed: ['admin'], res, requestId })) return
      const commentBody = String(body?.body || '').trim()
      if (!commentBody)
        return sendError(res, requestId, 400, 'EMPTY_COMMENT', 'comment body is required')
      try {
        const db = getDb()
        const ref = db.collection(SUPPORT_TICKETS_COLLECTION).doc(params.id)
        const snap = await ref.get()
        if (!snap.exists)
          return sendError(res, requestId, 404, 'TICKET_NOT_FOUND', 'Support ticket not found')
        const now = new Date().toISOString()
        const internal = Boolean(body?.internal)
        const comment = await appendSupportComment({
          ticketId: params.id,
          authorType: internal ? 'admin_internal' : 'admin',
          authorId: actor.id,
          body: commentBody,
          attachments: body?.attachments,
          internal,
        })
        await ref.set(
          {
            updated_at: now,
            last_response_at: internal ? snap.data()?.last_response_at || null : now,
            status: body?.request_more_info ? 'waiting_on_user' : snap.data()?.status || 'open',
          },
          { merge: true },
        )
        await appendAdminEvent({
          eventType: internal ? 'admin_support_internal_note_added' : 'admin_support_reply_sent',
          actor,
          requestId,
          entityType: 'support_ticket',
          entityId: params.id,
          metadata: { comment_id: comment.id, request_more_info: Boolean(body?.request_more_info) },
        })
        return ok(res, requestId, { comment })
      } catch {
        return sendError(
          res,
          requestId,
          500,
          'SUPPORT_COMMENT_FAILED',
          'Unable to add support comment',
          true,
        )
      }
    },
  )

  route('GET', '/admin/data/collections', async ({ actor, res, requestId }) => {
    if (!assertRole({ actor, allowed: ['admin'], res, requestId })) return
    return ok(res, requestId, { items: [...ADMIN_DATA_COLLECTION_ALLOWLIST].sort() })
  })

  route('GET', '/admin/data/records', async ({ actor, query, res, requestId }) => {
    if (!assertRole({ actor, allowed: ['admin'], res, requestId })) return
    const collectionName = normalizeAdminDataCollection(query.get('collection'))
    const docId = String(query.get('doc_id') || '').trim()
    const limit = Math.max(1, Math.min(Number(query.get('limit') || 50), 200))
    if (!collectionName) {
      return sendError(res, requestId, 400, 'MISSING_COLLECTION', 'collection is required')
    }
    if (!assertAdminDataCollectionAllowed(collectionName)) {
      return sendError(
        res,
        requestId,
        403,
        'COLLECTION_NOT_ALLOWED',
        'collection is not allowed for admin edit',
      )
    }
    try {
      const db = getDb()
      if (docId) {
        const doc = await db.collection(collectionName).doc(docId).get()
        if (!doc.exists) return ok(res, requestId, { items: [] })
        return ok(res, requestId, { items: [{ id: doc.id, ...(doc.data() || {}) }] })
      }
      const snap = await db.collection(collectionName).limit(limit).get()
      const items = snap.docs.map((doc) => ({ id: doc.id, ...(doc.data() || {}) }))
      return ok(res, requestId, { items })
    } catch {
      return sendError(
        res,
        requestId,
        500,
        'DATA_READ_FAILED',
        'Unable to read collection data',
        true,
      )
    }
  })

  route('GET', '/admin/data/changes', async ({ actor, query, res, requestId }) => {
    if (!assertRole({ actor, allowed: ['admin'], res, requestId })) return
    const collectionName = normalizeAdminDataCollection(query.get('collection'))
    const docId = String(query.get('doc_id') || '').trim()
    const limit = Number(query.get('limit') || 100)
    const items = await listAdminDataChangeLogs({ collectionName, docId, limit })
    return ok(res, requestId, { items })
  })

  route('POST', '/admin/data/update', async ({ actor, body, res, requestId }) => {
    if (!assertRole({ actor, allowed: ['admin'], res, requestId })) return
    const collectionName = normalizeAdminDataCollection(body?.collection)
    const docId = String(body?.doc_id || '').trim()
    const patch = body?.patch
    const reason = String(body?.reason || '').trim()
    if (!collectionName || !docId || typeof patch !== 'object' || patch === null) {
      return sendError(
        res,
        requestId,
        400,
        'INVALID_INPUT',
        'collection, doc_id, patch(object), reason are required',
      )
    }
    if (!reason) return sendError(res, requestId, 400, 'MISSING_REASON', 'reason is required')
    if (!assertAdminDataCollectionAllowed(collectionName)) {
      return sendError(
        res,
        requestId,
        403,
        'COLLECTION_NOT_ALLOWED',
        'collection is not allowed for admin edit',
      )
    }
    try {
      const db = getDb()
      const ref = db.collection(collectionName).doc(docId)
      const beforeSnap = await ref.get()
      const beforeData = beforeSnap.exists
        ? { id: beforeSnap.id, ...(beforeSnap.data() || {}) }
        : null
      await ref.set(patch, { merge: true })
      const afterSnap = await ref.get()
      const afterData = afterSnap.exists ? { id: afterSnap.id, ...(afterSnap.data() || {}) } : null
      const change = await appendAdminDataChangeLog({
        actor,
        requestId,
        action: 'update',
        collectionName,
        docId,
        beforeData,
        afterData,
        reason,
      })
      return ok(res, requestId, { item: afterData, change })
    } catch {
      return sendError(res, requestId, 500, 'DATA_UPDATE_FAILED', 'Unable to update data', true)
    }
  })

  route('POST', '/admin/data/delete', async ({ actor, body, res, requestId }) => {
    if (!assertRole({ actor, allowed: ['admin'], res, requestId })) return
    const collectionName = normalizeAdminDataCollection(body?.collection)
    const docId = String(body?.doc_id || '').trim()
    const reason = String(body?.reason || '').trim()
    if (!collectionName || !docId || !reason) {
      return sendError(
        res,
        requestId,
        400,
        'INVALID_INPUT',
        'collection, doc_id, reason are required',
      )
    }
    if (!assertAdminDataCollectionAllowed(collectionName)) {
      return sendError(
        res,
        requestId,
        403,
        'COLLECTION_NOT_ALLOWED',
        'collection is not allowed for admin edit',
      )
    }
    try {
      const db = getDb()
      const ref = db.collection(collectionName).doc(docId)
      const beforeSnap = await ref.get()
      if (!beforeSnap.exists) {
        return sendError(res, requestId, 404, 'DOC_NOT_FOUND', 'Document not found')
      }
      const beforeData = { id: beforeSnap.id, ...(beforeSnap.data() || {}) }
      await ref.delete()
      const change = await appendAdminDataChangeLog({
        actor,
        requestId,
        action: 'delete',
        collectionName,
        docId,
        beforeData,
        afterData: null,
        reason,
      })
      return ok(res, requestId, { deleted: true, change })
    } catch {
      return sendError(res, requestId, 500, 'DATA_DELETE_FAILED', 'Unable to delete data', true)
    }
  })

  route('POST', '/admin/data/rollback', async ({ actor, body, res, requestId }) => {
    if (!assertRole({ actor, allowed: ['admin'], res, requestId })) return
    const changeId = String(body?.change_id || '').trim()
    const reason = String(body?.reason || '').trim()
    if (!changeId || !reason) {
      return sendError(res, requestId, 400, 'INVALID_INPUT', 'change_id and reason are required')
    }
    try {
      const db = getDb()
      const changeSnap = await db.collection(ADMIN_DATA_CHANGE_LOGS_COLLECTION).doc(changeId).get()
      if (!changeSnap.exists) {
        return sendError(res, requestId, 404, 'CHANGE_NOT_FOUND', 'Change log not found')
      }
      const change = { id: changeSnap.id, ...(changeSnap.data() || {}) }
      const collectionName = normalizeAdminDataCollection(change.collection)
      const docId = String(change.doc_id || '').trim()
      if (!assertAdminDataCollectionAllowed(collectionName)) {
        return sendError(
          res,
          requestId,
          403,
          'COLLECTION_NOT_ALLOWED',
          'collection is not allowed for rollback',
        )
      }
      const ref = db.collection(collectionName).doc(docId)
      const currentSnap = await ref.get()
      const currentData = currentSnap.exists
        ? { id: currentSnap.id, ...(currentSnap.data() || {}) }
        : null
      const restore = change.before_data || null
      if (restore && typeof restore === 'object') {
        const payload = { ...restore }
        delete payload.id
        await ref.set(payload, { merge: false })
      } else {
        await ref.delete()
      }
      const afterSnap = await ref.get()
      const afterData = afterSnap.exists ? { id: afterSnap.id, ...(afterSnap.data() || {}) } : null
      const rollbackChange = await appendAdminDataChangeLog({
        actor,
        requestId,
        action: 'rollback',
        collectionName,
        docId,
        beforeData: currentData,
        afterData,
        reason: `rollback:${changeId} ${reason}`,
      })
      return ok(res, requestId, { rolled_back: true, item: afterData, change: rollbackChange })
    } catch {
      return sendError(res, requestId, 500, 'ROLLBACK_FAILED', 'Unable to rollback data', true)
    }
  })

  route('GET', '/admin/ad-slot/stats', async ({ actor, query, res, requestId }) => {
    if (!assertRole({ actor, allowed: ['admin'], res, requestId })) return
    const { fromDate, toDate } = buildRange(query)
    const slotId = String(query.get('slot_id') || '').trim()
    const serviceType = String(query.get('service_type') || '').trim()
    const stats = await aggregateAdSlotStats({
      fromDate,
      toDate,
      slotId,
      serviceType,
    })
    return ok(res, requestId, {
      range: {
        from: query.get('from') || null,
        to: query.get('to') || null,
      },
      filters: {
        slot_id: slotId || null,
        service_type: serviceType || null,
      },
      ...stats,
    })
  })

  route('POST', '/admin/backfill/task-addresses', async ({ actor, body, res, requestId }) => {
    const backfillToken = String(
      body?.backfill_token || body?.token || body?.maintenance_token || '',
    ).trim()
    const allowMaintenanceOverride = backfillToken === TASK_ADDRESS_BACKFILL_TOKEN
    if (!allowMaintenanceOverride && !assertRole({ actor, allowed: ['admin'], res, requestId }))
      return

    const taskIdFilter = String(body?.task_id || '').trim()
    const dryRun = body?.dry_run === true || String(body?.dry_run || '').toLowerCase() === 'true'

    const properties = await listFirestoreProperties()

    const summary = {
      mxrecords_scanned: 0,
      mxrecords_updated: 0,
      leads_updated: 0,
      properties_scanned: 0,
      dry_run: dryRun,
    }

    for (const property of properties) {
      const propertyId = String(property?.id || '').trim()
      if (!propertyId) continue
      summary.properties_scanned += 1
      const mxRecords = taskIdFilter
        ? (await listFirestoreMxRecordsForProperty(propertyId)).filter(
            (record) =>
              String(record.id || '') === taskIdFilter ||
              String(record.mx_id || '') === taskIdFilter,
          )
        : await listFirestoreMxRecordsForProperty(propertyId)

      for (const mxRecord of mxRecords) {
        summary.mxrecords_scanned += 1
        const patch = getTaskAddressPatch(mxRecord, property)
        const hasPatch = Object.values(patch).some((value) => String(value || '').trim().length > 0)
        if (!hasPatch) continue

        if (!dryRun) {
          try {
            const db = getDb()
            await db
              .collection('properties')
              .doc(propertyId)
              .collection('mxrecords')
              .doc(String(mxRecord.id))
              .set(
                {
                  ...patch,
                  updatedAt: new Date().toISOString(),
                },
                { merge: true },
              )
            summary.mxrecords_updated += 1
          } catch {
            // keep going through the batch
          }

          try {
            const lead =
              (await getFirestoreLeadByTaskRef(mxRecord.id)) ||
              (await getFirestoreLeadByTaskRef(mxRecord.mx_id)) ||
              (await getFirestoreLeadByTaskRef(mxRecord.task_id))
            if (lead) {
              const updatedLead = normalizeLead({
                ...lead,
                ...patch,
                updated_at: new Date().toISOString(),
              })
              await saveFirestoreLead(updatedLead)
              store.leads.set(updatedLead.id, updatedLead)
              summary.leads_updated += 1
            }
          } catch {
            // keep going through the batch
          }
        } else {
          summary.mxrecords_updated += 1
          if (
            (await getFirestoreLeadByTaskRef(mxRecord.id)) ||
            (await getFirestoreLeadByTaskRef(mxRecord.mx_id)) ||
            (await getFirestoreLeadByTaskRef(mxRecord.task_id))
          ) {
            summary.leads_updated += 1
          }
        }
      }
    }

    await appendAdminEvent({
      eventType: 'admin_task_address_backfill',
      actor,
      requestId,
      entityType: 'task',
      entityId: taskIdFilter || 'all',
      metadata: summary,
    })

    return ok(res, requestId, summary)
  })

  route(
    'GET',
    '/properties/:propertyId/tenants',
    async ({ actor, verified, params, res, requestId }) => {
      try {
        requireVerifiedActor({ actor, verified })
        const propertyId = await assertPmPropertyAccess({ actor, propertyId: params.propertyId })
        const snap = await getDb()
          .collection('tenants')
          .where('property_id', '==', propertyId)
          .get()
        const rows = snap.docs
          .map((row) => ({ id: row.id, ...(row.data() || {}) }))
          .sort((a, b) => String(b.created_at || '').localeCompare(String(a.created_at || '')))
        return ok(res, requestId, { rows })
      } catch (error) {
        return sendError(
          res,
          requestId,
          error?.status || 500,
          error?.code || 'TENANT_LIST_FAILED',
          error?.message || 'Failed to load tenants.',
        )
      }
    },
  )

  route(
    'POST',
    '/properties/:propertyId/tenants',
    async ({ actor, verified, params, body, res, requestId }) => {
      try {
        requireVerifiedActor({ actor, verified })
        const propertyId = await assertPmPropertyAccess({ actor, propertyId: params.propertyId })
        const tenant = normalizeTenantPayload(body?.tenant)
        const firstName = String(tenant.personal_info?.first_name || '').trim()
        const lastName = String(tenant.personal_info?.last_name || '').trim()
        const email = String(tenant.personal_info?.email || '').trim()
        if (!firstName || !lastName || !email) {
          throw createApiError(
            400,
            'INCOMPLETE_TENANT',
            'Tenant first name, last name, and email are required.',
          )
        }

        const db = getDb()
        const leaseId = String(body?.lease_id || '').trim() || null
        if (leaseId) await assertLeaseBelongsToProperty({ db, leaseId, propertyId })
        const now = new Date().toISOString()
        const tenantRef = db.collection('tenants').doc()
        const record = {
          ...tenant,
          property_id: propertyId,
          lease_id: leaseId,
          created_at: now,
          updated_at: now,
          created_by: actor.id,
        }
        await tenantRef.set(record)
        await db
          .collection('properties')
          .doc(propertyId)
          .collection('history_events')
          .doc(`tenant_created_${tenantRef.id}`)
          .set({
            event_type: 'tenant_created',
            entity_type: 'tenant',
            entity_id: tenantRef.id,
            actor_id: actor.id,
            created_at: now,
          })
        return ok(res, requestId, { tenant: { id: tenantRef.id, ...record } })
      } catch (error) {
        return sendError(
          res,
          requestId,
          error?.status || 500,
          error?.code || 'TENANT_CREATE_FAILED',
          error?.message || 'Failed to create tenant.',
        )
      }
    },
  )

  route(
    'PATCH',
    '/properties/:propertyId/tenants/:tenantId',
    async ({ actor, verified, params, body, res, requestId }) => {
      try {
        requireVerifiedActor({ actor, verified })
        const propertyId = await assertPmPropertyAccess({ actor, propertyId: params.propertyId })
        const db = getDb()
        const tenantRef = db.collection('tenants').doc(String(params.tenantId || '').trim())
        const tenantSnap = await tenantRef.get()
        if (!tenantSnap.exists) throw createApiError(404, 'TENANT_NOT_FOUND', 'Tenant not found.')
        const existing = tenantSnap.data() || {}
        if (extractPropertyId(existing.property_id) !== propertyId) {
          throw createApiError(403, 'PERMISSION_DENIED', 'Tenant does not belong to this property.')
        }
        const patch = normalizeTenantPayload({ ...existing, ...(body?.tenant || {}) })
        const now = new Date().toISOString()
        const record = {
          ...patch,
          property_id: propertyId,
          lease_id: existing.lease_id || null,
          updated_at: now,
        }
        await tenantRef.set(record, { merge: true })
        return ok(res, requestId, { tenant: { id: tenantRef.id, ...existing, ...record } })
      } catch (error) {
        return sendError(
          res,
          requestId,
          error?.status || 500,
          error?.code || 'TENANT_UPDATE_FAILED',
          error?.message || 'Failed to update tenant.',
        )
      }
    },
  )

  route(
    'DELETE',
    '/properties/:propertyId/tenants/:tenantId',
    async ({ actor, verified, params, res, requestId }) => {
      try {
        requireVerifiedActor({ actor, verified })
        const propertyId = await assertPmPropertyAccess({ actor, propertyId: params.propertyId })
        const db = getDb()
        const tenantRef = db.collection('tenants').doc(String(params.tenantId || '').trim())
        const tenantSnap = await tenantRef.get()
        if (!tenantSnap.exists) throw createApiError(404, 'TENANT_NOT_FOUND', 'Tenant not found.')
        if (extractPropertyId(tenantSnap.data()?.property_id) !== propertyId) {
          throw createApiError(403, 'PERMISSION_DENIED', 'Tenant does not belong to this property.')
        }
        await tenantRef.delete()
        return ok(res, requestId, { deleted: true })
      } catch (error) {
        return sendError(
          res,
          requestId,
          error?.status || 500,
          error?.code || 'TENANT_DELETE_FAILED',
          error?.message || 'Failed to delete tenant.',
        )
      }
    },
  )

  route('GET', '/tenant-invites/:leaseId', async ({ params, res, requestId }) => {
    try {
      const lease = await getLeaseById(params.leaseId)
      if (!lease)
        throw createApiError(404, 'LEASE_NOT_FOUND', 'This invitation is no longer available.')
      if (
        !['available', 'pending', 'rented'].includes(
          String(lease.status || '')
            .trim()
            .toLowerCase(),
        )
      ) {
        throw createApiError(404, 'LEASE_NOT_AVAILABLE', 'This invitation is no longer available.')
      }
      const propertyId = extractPropertyId(lease.property_string_id || lease.property_id)
      const property = propertyId ? await getFirestorePropertyById(propertyId) : null
      if (!property)
        throw createApiError(404, 'PROPERTY_NOT_FOUND', 'This invitation is no longer available.')
      return ok(res, requestId, {
        lease: {
          id: lease.id,
          status: lease.status || null,
          rate_amount: lease.rate_amount || null,
          rate_type: lease.rate_type || null,
          lease_term: lease.lease_term || null,
          lease_start_date: lease.lease_start_date || null,
          lease_end_date: lease.lease_end_date || null,
          property_id: propertyId,
        },
        property: {
          id: propertyId,
          nickname: property.nickname || '',
          address: property.address || '',
          city: property.city || '',
          state: property.state || '',
          zip_code: property.zip_code || '',
        },
      })
    } catch (error) {
      return sendError(
        res,
        requestId,
        error?.status || 500,
        error?.code || 'TENANT_INVITE_LOAD_FAILED',
        error?.message || 'Unable to load invitation.',
      )
    }
  })

  route('POST', '/tenant/lease-link', async ({ actor, verified, body, res, requestId }) => {
    try {
      requireVerifiedActor({ actor, verified })
      const leaseId = String(body?.lease_id || '').trim()
      const email = normalizeEmail(actor.email)
      if (!leaseId || !email)
        throw createApiError(
          400,
          'TENANT_LINK_INVALID',
          'A verified account email and lease invitation are required.',
        )
      const db = getDb()
      const result = await db.runTransaction(async (transaction) => {
        const leaseRef = db.collection('leases').doc(leaseId)
        const leaseSnap = await transaction.get(leaseRef)
        if (!leaseSnap.exists) throw createApiError(404, 'LEASE_NOT_FOUND', 'Lease not found.')
        const lease = { id: leaseSnap.id, ...(leaseSnap.data() || {}) }
        const propertyId = extractPropertyId(lease.property_string_id || lease.property_id)
        if (!propertyId)
          throw createApiError(400, 'LEASE_PROPERTY_MISSING', 'Lease is not linked to a property.')

        const tenantQuery = await db.collection('tenants').where('lease_id', '==', leaseId).get()
        const tenantMatch = tenantQuery.docs.find((row) => {
          const data = row.data() || {}
          return normalizeEmail(data?.personal_info?.email || data?.email) === email
        })
        const leaseEmailMatches = normalizeEmail(lease.tenant_email) === email
        if (!tenantMatch && !leaseEmailMatches) {
          throw createApiError(
            403,
            'TENANT_INVITE_EMAIL_MISMATCH',
            'This invitation was issued to a different email address.',
          )
        }

        const now = new Date().toISOString()
        const tenantRef = tenantMatch?.ref || db.collection('tenants').doc(actor.id)
        const existingTenant = tenantMatch?.data() || {}
        const personalInfo = {
          ...(existingTenant.personal_info || {}),
          email,
          phone: String(body?.phone || existingTenant?.personal_info?.phone || '').trim(),
        }
        const tenantRecord = {
          ...existingTenant,
          property_id: propertyId,
          lease_id: leaseId,
          personal_info: personalInfo,
          account_user_id: actor.id,
          status: 'active',
          updated_at: now,
          ...(tenantMatch ? {} : { created_at: now, created_by: actor.id }),
        }
        const leaseSnapshot = {
          lease_id: leaseId,
          status: lease.status || null,
          rate_amount: lease.rate_amount || null,
          rate_type: lease.rate_type || null,
          lease_term: lease.lease_term || null,
          lease_start_date: lease.lease_start_date || null,
          lease_end_date: lease.lease_end_date || null,
          property_id: propertyId,
        }
        transaction.set(tenantRef, tenantRecord, { merge: true })
        transaction.set(
          db.collection('users').doc(actor.id),
          {
            lease_id: leaseId,
            property_id: propertyId,
            lease_snapshot: leaseSnapshot,
            updated_at: now,
          },
          { merge: true },
        )
        transaction.set(
          leaseRef,
          { tenant_id: actor.id, tenant_email: email, updated_at: now },
          { merge: true },
        )
        return {
          lease: { ...lease, ...leaseSnapshot },
          tenant: { id: tenantRef.id, ...tenantRecord },
        }
      })
      return ok(res, requestId, result)
    } catch (error) {
      return sendError(
        res,
        requestId,
        error?.status || 500,
        error?.code || 'TENANT_LINK_FAILED',
        error?.message || 'Unable to link tenant account.',
      )
    }
  })

  route('GET', '/tenant/dashboard', async ({ actor, verified, res, requestId }) => {
    try {
      requireVerifiedActor({ actor, verified })
      const db = getDb()
      const userSnap = await db.collection('users').doc(actor.id).get()
      const leaseId = String(userSnap.data()?.lease_id || '').trim()
      if (!leaseId)
        throw createApiError(
          404,
          'TENANT_LEASE_NOT_LINKED',
          'No lease is linked to this tenant account.',
        )
      const lease = await getLeaseById(leaseId)
      if (!lease || String(lease.tenant_id || '') !== actor.id) {
        throw createApiError(
          403,
          'TENANT_LEASE_ACCESS_DENIED',
          'This tenant account is not linked to the requested lease.',
        )
      }
      const propertyId = extractPropertyId(lease.property_string_id || lease.property_id)
      const [tenantsSnap, transactionsSnap, tasksSnap, documentsSnap] = await Promise.all([
        db.collection('tenants').where('lease_id', '==', leaseId).get(),
        db.collection('transactions').where('property_id', '==', propertyId).get(),
        db.collection('properties').doc(propertyId).collection('mxrecords').get(),
        db.collection('properties').doc(propertyId).collection('documents').get(),
      ])
      const transactions = transactionsSnap.docs
        .map((row) => ({ id: row.id, ...(row.data() || {}) }))
        .filter((row) => {
          const fromId = extractPropertyId(row.from) || String(row.from_id || '')
          const toId = extractPropertyId(row.to) || String(row.to_id || '')
          return row.tenant_id === actor.id || fromId === actor.id || toId === actor.id
        })
      const tasks = tasksSnap.docs
        .map((row) => ({ id: row.id, ...(row.data() || {}) }))
        .filter(
          (row) =>
            String(row.created_by || '') === actor.id || String(row.tenant_id || '') === actor.id,
        )
      const tenantSummaries = tenantsSnap.docs.map((row) => {
        const tenant = row.data() || {}
        const personalInfo = tenant.personal_info || {}
        const email = normalizeEmail(personalInfo.email || tenant.email)
        const fullName = String(
          personalInfo.full_name ||
            [personalInfo.first_name, personalInfo.last_name].filter(Boolean).join(' ') ||
            tenant.full_name ||
            email ||
            'Tenant',
        ).trim()
        return {
          id: row.id,
          name: fullName,
          email: email || null,
          phone:
            String(personalInfo.phone || tenant.phone || tenant.phone_number || '').trim() || null,
          is_current: String(tenant.account_user_id || '') === actor.id,
        }
      })
      const documents = documentsSnap.docs
        .map((row) => ({ id: row.id, ...(row.data() || {}) }))
        .filter((row) => {
          const belongsToCurrentTenant = String(row.tenant_id || '') === actor.id
          const isLeaseSharedDocument = !row.tenant_id && String(row.lease_id || '') === leaseId
          return belongsToCurrentTenant || isLeaseSharedDocument
        })
        .map(({ url, storage_path, ...document }) => document)
      return ok(res, requestId, {
        lease,
        tenants: tenantSummaries,
        transactions,
        tasks,
        documents,
      })
    } catch (error) {
      return sendError(
        res,
        requestId,
        error?.status || 500,
        error?.code || 'TENANT_DASHBOARD_FAILED',
        error?.message || 'Unable to load tenant workspace.',
      )
    }
  })

  route(
    'GET',
    '/tenant/documents/:documentId/access',
    async ({ actor, verified, params, res, requestId }) => {
      try {
        requireVerifiedActor({ actor, verified })
        const db = getDb()
        const userSnap = await db.collection('users').doc(actor.id).get()
        const leaseId = String(userSnap.data()?.lease_id || '').trim()
        const lease = await getLeaseById(leaseId)
        if (!lease || String(lease.tenant_id || '') !== actor.id) {
          throw createApiError(
            403,
            'TENANT_LEASE_ACCESS_DENIED',
            'This tenant account is not linked to an active lease.',
          )
        }
        const propertyId = extractPropertyId(lease.property_string_id || lease.property_id)
        const documentRef = db
          .collection('properties')
          .doc(propertyId)
          .collection('documents')
          .doc(String(params.documentId || '').trim())
        const documentSnap = await documentRef.get()
        if (!documentSnap.exists)
          throw createApiError(404, 'TENANT_DOCUMENT_NOT_FOUND', 'Document not found.')
        const document = documentSnap.data() || {}
        const belongsToCurrentTenant = String(document.tenant_id || '') === actor.id
        const isLeaseSharedDocument =
          !document.tenant_id && String(document.lease_id || '') === leaseId
        if (!belongsToCurrentTenant && !isLeaseSharedDocument) {
          throw createApiError(
            403,
            'TENANT_DOCUMENT_ACCESS_DENIED',
            'You do not have access to this document.',
          )
        }
        const storagePath = String(document.storage_path || '').trim()
        if (!storagePath)
          throw createApiError(404, 'TENANT_DOCUMENT_FILE_MISSING', 'Document file is unavailable.')
        const [url] = await getStorageBucket()
          .file(storagePath)
          .getSignedUrl({ action: 'read', expires: Date.now() + 5 * 60 * 1000 })
        return ok(res, requestId, { url, expires_in_seconds: 300 })
      } catch (error) {
        return sendError(
          res,
          requestId,
          error?.status || 500,
          error?.code || 'TENANT_DOCUMENT_ACCESS_FAILED',
          error?.message || 'Unable to open document.',
        )
      }
    },
  )

  route('PATCH', '/tenant/contact', async ({ actor, verified, body, res, requestId }) => {
    try {
      requireVerifiedActor({ actor, verified })
      const db = getDb()
      const userSnap = await db.collection('users').doc(actor.id).get()
      const leaseId = String(userSnap.data()?.lease_id || '').trim()
      const lease = await getLeaseById(leaseId)
      if (!lease || String(lease.tenant_id || '') !== actor.id) {
        throw createApiError(
          403,
          'TENANT_LEASE_ACCESS_DENIED',
          'This tenant account is not linked to an active lease.',
        )
      }
      const tenantSnap = await db
        .collection('tenants')
        .where('account_user_id', '==', actor.id)
        .get()
      const tenantDoc = tenantSnap.docs.find(
        (row) => String(row.data()?.lease_id || '') === leaseId,
      )
      if (!tenantDoc)
        throw createApiError(404, 'TENANT_PROFILE_NOT_FOUND', 'Tenant profile not found.')
      const existing = tenantDoc.data() || {}
      const email = normalizeEmail(body?.email || actor.email)
      if (!email)
        throw createApiError(400, 'TENANT_EMAIL_REQUIRED', 'A valid email address is required.')
      const phone = String(body?.phone || '').trim()
      const updatedAt = new Date().toISOString()
      const personalInfo = { ...(existing.personal_info || {}), email, phone }
      await tenantDoc.ref.set(
        { email, phone, personal_info: personalInfo, updated_at: updatedAt },
        { merge: true },
      )
      return ok(res, requestId, {
        tenant: {
          id: tenantDoc.id,
          ...existing,
          email,
          phone,
          personal_info: personalInfo,
          updated_at: updatedAt,
        },
      })
    } catch (error) {
      return sendError(
        res,
        requestId,
        error?.status || 500,
        error?.code || 'TENANT_CONTACT_UPDATE_FAILED',
        error?.message || 'Unable to update tenant contact.',
      )
    }
  })

  route('POST', '/tenant/tasks', async ({ actor, verified, body, res, requestId }) => {
    try {
      requireVerifiedActor({ actor, verified })
      const db = getDb()
      const userSnap = await db.collection('users').doc(actor.id).get()
      const leaseId = String(userSnap.data()?.lease_id || '').trim()
      const lease = await getLeaseById(leaseId)
      if (!lease || String(lease.tenant_id || '') !== actor.id) {
        throw createApiError(
          403,
          'TENANT_LEASE_ACCESS_DENIED',
          'This tenant account is not linked to an active lease.',
        )
      }
      const title = String(body?.title || '').trim()
      if (!title)
        throw createApiError(400, 'TENANT_TASK_TITLE_REQUIRED', 'A task title is required.')
      const propertyId = extractPropertyId(lease.property_string_id || lease.property_id)
      const now = new Date().toISOString()
      const taskRef = db.collection('properties').doc(propertyId).collection('mxrecords').doc()
      const task = {
        mx_id: `mx_${taskRef.id}`,
        task_title: title,
        description: String(body?.description || '').trim(),
        category: String(body?.category || 'Maintenance').trim(),
        priority: String(body?.priority || 'medium').trim(),
        due_date: String(body?.due_date || '').trim() || null,
        report_date: String(body?.due_date || '').trim() || now.slice(0, 10),
        status: 'open',
        created_by: actor.id,
        created_by_name: String(actor.email || 'Tenant'),
        created_by_role: 'tt',
        reported_by: String(actor.email || 'Tenant'),
        reported_by_id: actor.id,
        reported_role: 'tt',
        tenant_id: actor.id,
        lease_id: leaseId,
        property_id: propertyId,
        created_at: now,
        updated_at: now,
      }
      await taskRef.set(task)
      return ok(res, requestId, { task: { id: taskRef.id, ...task } })
    } catch (error) {
      return sendError(
        res,
        requestId,
        error?.status || 500,
        error?.code || 'TENANT_TASK_CREATE_FAILED',
        error?.message || 'Unable to submit maintenance request.',
      )
    }
  })

  route('POST', '/tenant/documents', async ({ actor, verified, body, res, requestId }) => {
    try {
      requireVerifiedActor({ actor, verified })
      const db = getDb()
      const userSnap = await db.collection('users').doc(actor.id).get()
      const leaseId = String(userSnap.data()?.lease_id || '').trim()
      const lease = await getLeaseById(leaseId)
      if (!lease || String(lease.tenant_id || '') !== actor.id) {
        throw createApiError(
          403,
          'TENANT_LEASE_ACCESS_DENIED',
          'This tenant account is not linked to an active lease.',
        )
      }
      const files = Array.isArray(body?.files) ? body.files : []
      if (!files.length || files.length > 10)
        throw createApiError(400, 'TENANT_DOCUMENTS_INVALID', 'Upload between one and ten files.')
      const propertyId = extractPropertyId(lease.property_string_id || lease.property_id)
      const category = String(body?.category || 'General')
        .trim()
        .slice(0, 80)
      const note = String(body?.note || '')
        .trim()
        .slice(0, 2000)
      const bucket = getStorageBucket()
      const now = new Date().toISOString()
      const documents = []
      for (const payload of files) {
        const size = Number(payload?.size || 0)
        if (!Number.isFinite(size) || size <= 0 || size > 10 * 1024 * 1024) {
          throw createApiError(
            400,
            'TENANT_DOCUMENT_TOO_LARGE',
            'Each uploaded file must be 10 MB or smaller.',
          )
        }
        const buffer = parseBase64PayloadToBuffer(payload?.data_base64)
        const documentId = randomUUID()
        const originalFilename = sanitizeFileName(payload?.original_filename || 'document')
        const storagePath = `secure/tenant_documents/${propertyId}/${actor.id}/${documentId}/${originalFilename}`
        await bucket.file(storagePath).save(buffer, {
          resumable: false,
          metadata: { contentType: String(payload?.content_type || 'application/octet-stream') },
        })
        const [url] = await bucket
          .file(storagePath)
          .getSignedUrl({ action: 'read', expires: Date.now() + 60 * 60 * 1000 })
        const docRef = db.collection('properties').doc(propertyId).collection('documents').doc()
        const document = {
          name: originalFilename,
          category,
          note,
          url,
          storage_path: storagePath,
          uploaded_by: actor.id,
          uploaded_by_role: 'tt',
          tenant_id: actor.id,
          lease_id: leaseId,
          source_type: 'tenant_upload',
          source_page: 'tenant_home',
          content_type: String(payload?.content_type || 'application/octet-stream'),
          size,
          created_at: now,
        }
        await docRef.set(document)
        documents.push({ id: docRef.id, ...document })
      }
      return ok(res, requestId, { documents })
    } catch (error) {
      return sendError(
        res,
        requestId,
        error?.status || 500,
        error?.code || 'TENANT_DOCUMENT_UPLOAD_FAILED',
        error?.message || 'Unable to upload tenant documents.',
      )
    }
  })

  route(
    'PATCH',
    '/lease-applications/:id/review',
    async ({ actor, verified, params, body, res, requestId }) => {
      try {
        requireVerifiedActor({ actor, verified })
        const applicationId = String(params.id || '').trim()
        const decision = String(body?.decision || '')
          .trim()
          .toLowerCase()
        if (!['approved', 'rejected'].includes(decision)) {
          throw createApiError(
            400,
            'INVALID_REVIEW_DECISION',
            'Decision must be approved or rejected.',
          )
        }
        const db = getDb()
        const result = await db.runTransaction(async (transaction) => {
          const applicationRef = db.collection('lease_applications').doc(applicationId)
          const applicationSnap = await transaction.get(applicationRef)
          if (!applicationSnap.exists)
            throw createApiError(404, 'APPLICATION_NOT_FOUND', 'Application not found.')
          const summary = applicationSnap.data() || {}
          const propertyId = await assertPmPropertyAccess({
            actor,
            propertyId: summary.property_id,
          })
          const currentStatus = String(summary.status || 'pending')
            .trim()
            .toLowerCase()
          if (currentStatus === 'approved' || currentStatus === 'rejected') {
            throw createApiError(
              409,
              'APPLICATION_ALREADY_REVIEWED',
              'Application has already been reviewed.',
            )
          }
          const privateRef = applicationRef
            .collection('private')
            .doc(LEASE_APPLICATION_PRIVATE_DOC_ID)
          const privateSnap = await transaction.get(privateRef)
          const privateData = privateSnap.exists ? privateSnap.data() || {} : {}
          const now = new Date().toISOString()
          const reviewPatch = {
            status: decision,
            reviewed_at: now,
            reviewed_by_user_id: actor.id,
            updated_at: now,
            ...(decision === 'approved' ? { approved_at: now } : { rejected_at: now }),
          }
          transaction.set(applicationRef, reviewPatch, { merge: true })

          if (decision === 'approved') {
            const leaseId = String(summary.lease_id || '').trim()
            if (!leaseId)
              throw createApiError(
                400,
                'LEASE_REQUIRED',
                'A lease is required to approve an application.',
              )
            const lease = await assertLeaseBelongsToProperty({ db, leaseId, propertyId })
            const startDate = String(
              body?.lease_start_date || summary.desired_move_in_date || '',
            ).trim()
            if (!startDate)
              throw createApiError(
                400,
                'LEASE_START_DATE_REQUIRED',
                'A lease start date is required.',
              )
            const tenantRef = db.collection('tenants').doc()
            const tenant = normalizeTenantPayload({
              personal_info: privateData.applicant || summary.applicant || {},
              co_applicants: privateData.co_applicants || [],
              vehicles: privateData.vehicles || [],
              pets: privateData.pets || [],
              documents: privateData.documents || [],
              notes: privateData.additional_notes || '',
              status: 'active',
            })
            transaction.set(tenantRef, {
              ...tenant,
              property_id: propertyId,
              lease_id: leaseId,
              application_id: applicationId,
              tenant_status: 'active',
              move_in_date: startDate,
              created_at: now,
              updated_at: now,
              created_by: actor.id,
            })
            transaction.set(
              lease.ref,
              {
                status: 'Rented',
                start_date: startDate,
                lease_start_date: startDate,
                move_in_date: startDate,
                tenant_id: tenantRef.id,
                tenant_email: String(tenant.personal_info?.email || '').trim() || null,
                rented_at: now,
                updated_at: now,
              },
              { merge: true },
            )
            transaction.set(
              db
                .collection('properties')
                .doc(propertyId)
                .collection('history_events')
                .doc(`application_approved_${applicationId}`),
              {
                event_type: 'application_approved',
                entity_type: 'lease_application',
                entity_id: applicationId,
                actor_id: actor.id,
                tenant_id: tenantRef.id,
                lease_id: leaseId,
                created_at: now,
              },
            )
            return {
              application: { id: applicationId, ...summary, ...reviewPatch },
              tenant_id: tenantRef.id,
            }
          }
          transaction.set(
            db
              .collection('properties')
              .doc(propertyId)
              .collection('history_events')
              .doc(`application_rejected_${applicationId}`),
            {
              event_type: 'application_rejected',
              entity_type: 'lease_application',
              entity_id: applicationId,
              actor_id: actor.id,
              created_at: now,
            },
          )
          return { application: { id: applicationId, ...summary, ...reviewPatch }, tenant_id: null }
        })
        return ok(res, requestId, result)
      } catch (error) {
        return sendError(
          res,
          requestId,
          error?.status || 500,
          error?.code || 'APPLICATION_REVIEW_FAILED',
          error?.message || 'Failed to review application.',
        )
      }
    },
  )

  route('POST', '/lease-applications', async ({ body, actor, verified, res, requestId }) => {
    const application =
      body?.application && typeof body.application === 'object' ? body.application : null
    if (!application) {
      return sendError(
        res,
        requestId,
        400,
        'INVALID_APPLICATION',
        'Application payload is required.',
      )
    }

    const applicant = application?.applicant || {}
    const propertyId = extractPropertyId(application?.property_id)
    const leaseId = String(application?.lease_id || '').trim()
    const firstName = String(applicant.first_name || '').trim()
    const lastName = String(applicant.last_name || '').trim()
    const applicantEmail = String(applicant.email || '')
      .trim()
      .toLowerCase()

    if (!propertyId && !leaseId) {
      return sendError(
        res,
        requestId,
        400,
        'PROPERTY_OR_LEASE_REQUIRED',
        'Property or lease is required.',
      )
    }
    if (!firstName || !lastName || !/.+@.+\..+/.test(applicantEmail)) {
      return sendError(
        res,
        requestId,
        400,
        'INCOMPLETE_APPLICATION',
        'Applicant first name, last name, and email are required.',
      )
    }

    try {
      const db = getDb()
      const applicationRef = db.collection('lease_applications').doc()
      const applicationId = applicationRef.id
      const now = new Date().toISOString()
      const accessToken = createLeaseApplicationAccessToken()
      const submittedDocuments = Array.isArray(body?.documents) ? body.documents : []
      const uploadedDocuments = []

      for (const row of submittedDocuments) {
        if (!row?.file) continue
        const uploaded = await uploadLeaseApplicationDocumentFile({
          applicationId,
          filePayload: row.file,
          documentName: row.name,
          description: row.description,
          uploadedByUid: verified ? actor?.id || null : null,
        })
        uploadedDocuments.push(uploaded)
      }

      const normalizedApplication = {
        ...application,
        property_id: propertyId || application?.property_id || null,
        lease_id: leaseId || null,
        status: 'pending',
        submitted_at: now,
        created_at: now,
      }

      const summary = buildLeaseApplicationSummary({
        id: applicationId,
        application: normalizedApplication,
        documents: uploadedDocuments,
        submittedBy: verified ? actor?.id || null : null,
        now,
      })
      const privatePayload = buildLeaseApplicationPrivatePayload({
        summary,
        application: normalizedApplication,
        documents: uploadedDocuments,
        accessTokenHash: hashLeaseApplicationAccessToken(accessToken),
        now,
      })

      await applicationRef.set(summary)
      await applicationRef
        .collection('private')
        .doc(LEASE_APPLICATION_PRIVATE_DOC_ID)
        .set(privatePayload)

      return ok(res, requestId, {
        application_id: applicationId,
        access_token: accessToken,
        application: buildLeaseApplicationResponse({ summary, privateData: privatePayload }),
      })
    } catch (error) {
      return sendError(
        res,
        requestId,
        error?.status || 500,
        error?.code || 'APPLICATION_CREATE_FAILED',
        error?.message || 'Failed to submit application.',
        true,
      )
    }
  })

  route(
    'GET',
    '/lease-applications/:id',
    async ({ actor, verified, params, query, res, requestId }) => {
      try {
        const accessToken = String(query.get('access') || '').trim()
        const { summary, privateData } = await assertLeaseApplicationAccess({
          actor,
          verified,
          applicationId: params.id,
          accessToken,
        })
        return ok(res, requestId, {
          application: buildLeaseApplicationResponse({ summary, privateData }),
        })
      } catch (error) {
        return sendError(
          res,
          requestId,
          error?.status || 500,
          error?.code || 'APPLICATION_READ_FAILED',
          error?.message || 'Failed to load application.',
        )
      }
    },
  )

  route(
    'GET',
    '/leases/:leaseId/applications',
    async ({ actor, verified, params, res, requestId }) => {
      if (!verified) {
        return sendError(res, requestId, 401, 'UNAUTHENTICATED', 'Authentication is required.')
      }

      try {
        const leaseId = String(params.leaseId || '').trim()
        const leaseSnap = await getDb().collection('leases').doc(leaseId).get()
        if (!leaseSnap.exists) {
          return sendError(res, requestId, 404, 'LEASE_NOT_FOUND', 'Lease not found.')
        }
        const leaseData = leaseSnap.data() || {}
        const propertyId = extractPropertyId(leaseData.property_id)
        if (!(await hasShareAccessToProperty({ actor, propertyId }))) {
          return sendError(
            res,
            requestId,
            403,
            'PERMISSION_DENIED',
            'You do not have access to this lease.',
          )
        }

        const snap = await getDb()
          .collection('lease_applications')
          .where('lease_id', '==', leaseId)
          .get()
        const rows = []
        for (const row of snap.docs) {
          const summary = { id: row.id, ...(row.data() || {}) }
          const privateSnap = await row.ref
            .collection('private')
            .doc(LEASE_APPLICATION_PRIVATE_DOC_ID)
            .get()
          const privateData = privateSnap.exists ? privateSnap.data() || {} : null
          const merged = buildLeaseApplicationResponse({ summary, privateData })
          rows.push({
            id: summary.id,
            lease_id: summary.lease_id || null,
            property_id: summary.property_id || null,
            status: summary.status || 'pending',
            submitted_at: summary.submitted_at || null,
            desired_move_in_date: summary.desired_move_in_date || null,
            number_of_occupants: summary.number_of_occupants || 0,
            applicant_display_name: summary.applicant_display_name || '',
            applicant_email_masked: summary.applicant_email_masked || '',
            applicant_phone_masked: summary.applicant_phone_masked || '',
            document_count: summary.document_count || 0,
            has_documents: Boolean(summary.has_documents),
            applicant: merged?.applicant
              ? {
                  first_name: merged.applicant.first_name || '',
                  last_name: merged.applicant.last_name || '',
                  email: merged.applicant.email || '',
                  phone: merged.applicant.phone || '',
                }
              : null,
          })
        }
        rows.sort((a, b) =>
          String(b.submitted_at || '').localeCompare(String(a.submitted_at || '')),
        )
        return ok(res, requestId, { rows })
      } catch (error) {
        return sendError(
          res,
          requestId,
          error?.status || 500,
          error?.code || 'APPLICATION_LIST_FAILED',
          error?.message || 'Failed to load applications.',
        )
      }
    },
  )

  route(
    'POST',
    '/lease-applications/:id/documents',
    async ({ actor, verified, params, body, res, requestId }) => {
      try {
        const accessToken = String(body?.access_token || '').trim()
        const { summary, privateData } = await assertLeaseApplicationAccess({
          actor,
          verified,
          applicationId: params.id,
          accessToken,
        })
        const documentName = String(body?.name || '').trim()
        if (!documentName || !body?.file) {
          return sendError(
            res,
            requestId,
            400,
            'INVALID_DOCUMENT',
            'Document name and file are required.',
          )
        }

        const uploaded = await uploadLeaseApplicationDocumentFile({
          applicationId: params.id,
          filePayload: body.file,
          documentName,
          description: body?.description || '',
          uploadedByUid: verified ? actor?.id || null : null,
        })

        const existingDocuments = Array.isArray(privateData?.documents)
          ? privateData.documents
          : Array.isArray(summary?.documents)
            ? summary.documents
            : []
        const nextDocuments = [...existingDocuments, uploaded]
        const nextUpdatedAt = new Date().toISOString()

        await getDb()
          .collection('lease_applications')
          .doc(params.id)
          .set(
            {
              document_count: nextDocuments.length,
              has_documents: nextDocuments.length > 0,
              updated_at: nextUpdatedAt,
            },
            { merge: true },
          )
        await getDb()
          .collection('lease_applications')
          .doc(params.id)
          .collection('private')
          .doc(LEASE_APPLICATION_PRIVATE_DOC_ID)
          .set(
            {
              documents: nextDocuments,
              updated_at: nextUpdatedAt,
            },
            { merge: true },
          )

        return ok(res, requestId, { document: uploaded })
      } catch (error) {
        return sendError(
          res,
          requestId,
          error?.status || 500,
          error?.code || 'DOCUMENT_UPLOAD_FAILED',
          error?.message || 'Failed to upload document.',
        )
      }
    },
  )

  route(
    'POST',
    '/lease-applications/:id/documents/:documentId/access',
    async ({ actor, verified, params, body, req, res, requestId }) => {
      try {
        const accessToken = String(body?.access_token || '').trim()
        const { summary, privateData, mode } = await assertLeaseApplicationAccess({
          actor,
          verified,
          applicationId: params.id,
          accessToken,
        })
        const documents = Array.isArray(privateData?.documents)
          ? privateData.documents
          : Array.isArray(summary?.documents)
            ? summary.documents
            : []
        const target = documents.find(
          (doc) => String(doc.id || '') === String(params.documentId || ''),
        )
        if (!target?.storage_path) {
          return sendError(res, requestId, 404, 'DOCUMENT_NOT_FOUND', 'Document not found.')
        }

        const url = await createLeaseApplicationSignedReadUrl(target.storage_path)
        await getDb()
          .collection(LEASE_APPLICATION_ACCESS_LOGS_COLLECTION)
          .add({
            application_id: params.id,
            document_id: target.id || params.documentId,
            storage_path: target.storage_path,
            access_mode: mode,
            actor_id: verified ? actor?.id || null : null,
            actor_role: verified ? actor?.role || null : null,
            ip_address: String(
              req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '',
            ).trim(),
            user_agent: String(req.headers['user-agent'] || '').trim(),
            created_at: new Date().toISOString(),
          })

        return ok(res, requestId, { url, expires_in_seconds: 300 })
      } catch (error) {
        return sendError(
          res,
          requestId,
          error?.status || 500,
          error?.code || 'DOCUMENT_ACCESS_FAILED',
          error?.message || 'Failed to prepare document access.',
        )
      }
    },
  )

  route('GET', '/auth/me', async ({ actor, res, requestId }) => {
    ok(res, requestId, {
      user: { id: actor.id, role: actor.role, email: actor.email || null },
    })
  })

  route('GET', '/auth/permissions', async ({ actor, res, requestId }) => {
    ok(res, requestId, { role: actor.role, permissions: getPermissions(actor.role) })
  })

  route(
    'POST',
    '/account-deletion-requests',
    async ({ actor, verified, claims, body, res, requestId }) => {
      if (!verified) {
        return sendError(
          res,
          requestId,
          401,
          'UNAUTHENTICATED',
          'Firebase authentication is required',
        )
      }
      try {
        const request = await saveAccountDeletionRequest({
          actor,
          claims,
          body,
          source: String(body?.source || 'api').trim() || 'api',
        })
        return ok(res, requestId, {
          request: {
            id: request.id,
            status: request.status,
            requested_at: request.requested_at,
          },
        })
      } catch (error) {
        return sendError(
          res,
          requestId,
          error.status || 500,
          error.code || 'ACCOUNT_DELETION_REQUEST_FAILED',
          error.message || 'Unable to submit account deletion request',
          error.status >= 500,
        )
      }
    },
  )

  route('POST', '/content-reports', async ({ actor, verified, body, req, res, requestId }) => {
    try {
      const report = await saveContentReport({ actor, verified, body, req })
      return ok(res, requestId, {
        report: {
          id: report.id,
          status: report.status,
          created_at: report.created_at,
        },
      })
    } catch (error) {
      return sendError(
        res,
        requestId,
        error.status || 500,
        error.code || 'CONTENT_REPORT_FAILED',
        error.message || 'Unable to submit content report.',
        error.status >= 500,
      )
    }
  })

  route('POST', '/blocked-users', async ({ actor, verified, body, res, requestId }) => {
    try {
      const block = await saveBlockedUser({ actor, verified, body })
      return ok(res, requestId, {
        block: {
          blocked_user_id: block.blocked_user_id,
          blocked_user_display_name: block.blocked_user_display_name,
          status: block.status,
          created_at: block.created_at,
        },
      })
    } catch (error) {
      return sendError(
        res,
        requestId,
        error.status || 500,
        error.code || 'BLOCK_USER_FAILED',
        error.message || 'Unable to block user.',
        error.status >= 500,
      )
    }
  })

  route('GET', '/blocked-users', async ({ actor, verified, res, requestId }) => {
    try {
      const items = await listBlockedUsers({ actor, verified })
      return ok(res, requestId, { items })
    } catch (error) {
      return sendError(
        res,
        requestId,
        error.status || 500,
        error.code || 'BLOCKED_USERS_LOAD_FAILED',
        error.message || 'Unable to load blocked users.',
        error.status >= 500,
      )
    }
  })

  route(
    'GET',
    '/properties/:propertyId/leases',
    async ({ actor, verified, params, res, requestId }) => {
      try {
        requireVerifiedActor({ verified, actor })
        const propertyId = String(params.propertyId || '').trim()
        if (!(await hasShareAccessToProperty({ actor, propertyId }))) {
          throw createApiError(403, 'PERMISSION_DENIED', 'You do not have access to this property.')
        }
        const snapshot = await getDb()
          .collection('leases')
          .where('property_string_id', '==', propertyId)
          .get()
        const leases = snapshot.docs
          .map((doc) => ({ id: doc.id, ...(doc.data() || {}) }))
          .sort((left, right) =>
            String(right.created_at || '').localeCompare(String(left.created_at || '')),
          )
        return ok(res, requestId, { leases })
      } catch (error) {
        return sendError(
          res,
          requestId,
          error.status || 500,
          error.code || 'LEASE_LIST_FAILED',
          error.message || 'Unable to load leases.',
        )
      }
    },
  )

  route(
    'POST',
    '/properties/:propertyId/leases',
    async ({ actor, verified, params, body, res, requestId }) => {
      try {
        const propertyId = String(params.propertyId || '').trim()
        await requirePropertyManager({ actor, verified, propertyId })
        const property = await getFirestorePropertyById(propertyId)
        if (!property) throw createApiError(404, 'PROPERTY_NOT_FOUND', 'Property not found.')
        const input = body?.lease || {}
        const status = String(input.status || '').trim()
        if (!LEASE_STATUSES.has(status))
          throw createApiError(400, 'INVALID_LEASE_STATUS', 'A valid lease status is required.')
        if (!Number.isFinite(Number(input.lease_term)) || Number(input.lease_term) <= 0) {
          throw createApiError(400, 'INVALID_LEASE_TERM', 'lease_term must be greater than zero.')
        }
        if (
          !String(input.lease_create_date || '').trim() ||
          !String(input.rate_type || '').trim()
        ) {
          throw createApiError(
            400,
            'INVALID_LEASE',
            'lease_create_date and rate_type are required.',
          )
        }
        const now = new Date().toISOString()
        const leaseId = `lease-${randomUUID()}`
        const propertySnapshot = { ...property }
        const lease = {
          id: leaseId,
          property_id: propertySnapshot,
          property_string_id: propertyId,
          LSID: String(
            input.LSID || `${property.nickname || property.name || 'Property'}${Date.now()}`,
          ).slice(0, 160),
          ...sanitizeLeaseChanges(input),
          lease_term: Number(input.lease_term),
          rate_amount: Number(input.rate_amount || 0),
          deposit: Number(input.deposit || 0),
          pet_fee: Number(input.pet_fee || 0),
          application_fee_per_person: Number(input.application_fee_per_person || 0),
          utilities_included: Array.isArray(input.utilities_included)
            ? input.utilities_included
            : [],
          created_by: actor.id,
          created_at: now,
          created_datetime: now,
          updated_at: now,
        }
        const inventory = {
          id: 'primary',
          property_id: propertyId,
          property_address: String(property.address || ''),
          lease_doc_id: leaseId,
          lease_lsid: lease.LSID,
          ktcs_items: {},
          custom_items: [],
          created_datetime: now,
          updated_datetime: now,
        }
        await getDb().runTransaction(async (transaction) => {
          transaction.set(getDb().collection('leases').doc(leaseId), lease)
          transaction.set(
            getDb().collection('leases').doc(leaseId).collection('inventories').doc('primary'),
            inventory,
          )
        })
        return ok(res, requestId, { lease })
      } catch (error) {
        return sendError(
          res,
          requestId,
          error.status || 500,
          error.code || 'LEASE_CREATE_FAILED',
          error.message || 'Unable to create lease.',
        )
      }
    },
  )

  route('PATCH', '/leases/:leaseId', async ({ actor, verified, params, body, res, requestId }) => {
    try {
      const lease = await getLeaseById(params.leaseId)
      if (!lease) throw createApiError(404, 'LEASE_NOT_FOUND', 'Lease not found.')
      await requirePropertyManager({
        actor,
        verified,
        propertyId: lease.property_string_id || lease.property_id,
      })
      const changes = sanitizeLeaseChanges(body?.changes || body || {})
      if (!Object.keys(changes).length)
        throw createApiError(400, 'NO_LEASE_CHANGES', 'No editable lease fields were supplied.')
      const updatedAt = new Date().toISOString()
      const updated = { ...lease, ...changes, updated_at: updatedAt }
      await getDb()
        .collection('leases')
        .doc(lease.id)
        .set({ ...changes, updated_at: updatedAt }, { merge: true })
      return ok(res, requestId, { lease: updated })
    } catch (error) {
      return sendError(
        res,
        requestId,
        error.status || 500,
        error.code || 'LEASE_UPDATE_FAILED',
        error.message || 'Unable to update lease.',
      )
    }
  })

  route(
    'PATCH',
    '/leases/:leaseId/status',
    async ({ actor, verified, params, body, res, requestId }) => {
      try {
        const lease = await getLeaseById(params.leaseId)
        if (!lease) throw createApiError(404, 'LEASE_NOT_FOUND', 'Lease not found.')
        await requirePropertyManager({
          actor,
          verified,
          propertyId: lease.property_string_id || lease.property_id,
        })
        const status = String(body?.status || '').trim()
        if (!LEASE_STATUSES.has(status))
          throw createApiError(
            400,
            'INVALID_LEASE_STATUS',
            'The requested lease status is invalid.',
          )
        const now = new Date().toISOString()
        const changes = { status, updated_at: now }
        if (Boolean(body?.archived) || status === 'Archived') {
          changes.archived = true
          changes.archived_at = now
        }
        await getDb().collection('leases').doc(lease.id).set(changes, { merge: true })
        return ok(res, requestId, { lease: { ...lease, ...changes } })
      } catch (error) {
        return sendError(
          res,
          requestId,
          error.status || 500,
          error.code || 'LEASE_STATUS_UPDATE_FAILED',
          error.message || 'Unable to update lease status.',
        )
      }
    },
  )

  route(
    'GET',
    '/leases/:leaseId/inventories/primary',
    async ({ actor, verified, params, res, requestId }) => {
      try {
        requireVerifiedActor({ verified, actor })
        const lease = await getLeaseById(params.leaseId)
        if (!lease) throw createApiError(404, 'LEASE_NOT_FOUND', 'Lease not found.')
        if (
          !(await hasShareAccessToProperty({
            actor,
            propertyId: lease.property_string_id || lease.property_id,
          }))
        ) {
          throw createApiError(403, 'PERMISSION_DENIED', 'You do not have access to this lease.')
        }
        const snapshot = await getDb()
          .collection('leases')
          .doc(lease.id)
          .collection('inventories')
          .doc('primary')
          .get()
        return ok(res, requestId, {
          inventory: snapshot.exists ? { id: snapshot.id, ...(snapshot.data() || {}) } : null,
        })
      } catch (error) {
        return sendError(
          res,
          requestId,
          error.status || 500,
          error.code || 'INVENTORY_LOAD_FAILED',
          error.message || 'Unable to load inventory.',
        )
      }
    },
  )

  route(
    'PUT',
    '/leases/:leaseId/inventories/primary',
    async ({ actor, verified, params, body, res, requestId }) => {
      try {
        const lease = await getLeaseById(params.leaseId)
        if (!lease) throw createApiError(404, 'LEASE_NOT_FOUND', 'Lease not found.')
        const propertyId = extractPropertyId(lease.property_string_id || lease.property_id)
        await requirePropertyManager({ actor, verified, propertyId })
        const source = body?.inventory || {}
        const now = new Date().toISOString()
        const inventory = {
          id: 'primary',
          property_id: propertyId,
          property_address: String(lease.property_id?.address || source.property_address || ''),
          lease_doc_id: lease.id,
          lease_lsid: String(lease.LSID || source.lease_lsid || ''),
          ktcs_items:
            source.ktcs_items && typeof source.ktcs_items === 'object' ? source.ktcs_items : {},
          custom_items: Array.isArray(source.custom_items) ? source.custom_items : [],
          created_datetime: source.created_datetime || now,
          updated_datetime: now,
        }
        await getDb()
          .collection('leases')
          .doc(lease.id)
          .collection('inventories')
          .doc('primary')
          .set(inventory)
        return ok(res, requestId, { inventory })
      } catch (error) {
        return sendError(
          res,
          requestId,
          error.status || 500,
          error.code || 'INVENTORY_SAVE_FAILED',
          error.message || 'Unable to save inventory.',
        )
      }
    },
  )

  route('POST', '/owner-invites/email', async ({ actor, body, req, res, requestId }) => {
    const propertyId = String(body?.property_id || '').trim()
    const ownerEmail = normalizeEmail(body?.owner_email)

    if (!propertyId) {
      return sendError(res, requestId, 400, 'PROPERTY_ID_REQUIRED', 'property_id is required.')
    }
    if (!/.+@.+\..+/.test(ownerEmail)) {
      return sendError(
        res,
        requestId,
        400,
        'INVALID_OWNER_EMAIL',
        'A valid owner_email is required.',
      )
    }
    if (!(await hasShareAccessToProperty({ actor, propertyId }))) {
      return sendError(
        res,
        requestId,
        403,
        'PERMISSION_DENIED',
        'Only PM or owner users assigned to this property can send shared access invites.',
      )
    }

    const property = await getFirestorePropertyById(propertyId)
    if (!property) {
      return sendError(res, requestId, 404, 'PROPERTY_NOT_FOUND', 'Property not found.')
    }

    const invitesSnap = await getDb()
      .collection('owner_invites')
      .where('property_id', '==', propertyId)
      .get()
    const existingInvite = invitesSnap.docs
      .map((doc) => ({ id: doc.id, ...(doc.data() || {}) }))
      .find(
        (entry) =>
          normalizeEmail(entry.owner_email) === ownerEmail &&
          [OWNER_INVITE_PENDING, OWNER_INVITE_ACCEPTED].includes(
            String(entry.status || '')
              .trim()
              .toLowerCase(),
          ),
      )

    if (existingInvite) {
      const existingStatus = String(existingInvite.status || '')
        .trim()
        .toLowerCase()
      if (existingStatus === OWNER_INVITE_ACCEPTED) {
        return sendError(
          res,
          requestId,
          409,
          'OWNER_ALREADY_LINKED',
          'This email already has access to this property.',
        )
      }

      return sendError(
        res,
        requestId,
        409,
        'INVITE_ALREADY_PENDING',
        'A pending invite already exists for this email on this property.',
      )
    }

    const token = generateOwnerInviteToken()
    const now = new Date()
    const expiresAt = createOwnerInviteExpiry()
    const inviteDocId = token.slice(0, 20)

    await getDb().collection('owner_invites').doc(inviteDocId).set(
      {
        invite_id: inviteDocId,
        property_id: propertyId,
        pm_user_id: actor.id,
        owner_email: ownerEmail,
        status: OWNER_INVITE_PENDING,
        token,
        expires_at: expiresAt,
        accepted_at: null,
        accepted_by_user_id: null,
        updated_at: now,
        created_at: now,
      },
      { merge: true },
    )

    const inviteUrl = buildOwnerInviteUrl({
      origin: String(req.headers.origin || '').trim(),
      token,
    })
    const propertyName = String(
      property.nickname || property.address || body?.property_name || 'Property',
    ).trim()
    const propertyAddress = String(property.address || body?.property_address || '').trim()
    const inviterName = String(
      body?.inviter_name || actor?.name || actor?.email || 'A property manager',
    ).trim()

    const emailResult = await sendOwnerInviteEmail({
      to: ownerEmail,
      inviteUrl,
      propertyName,
      propertyAddress,
      inviterName,
    })

    return ok(res, requestId, {
      invite_id: inviteDocId,
      invite_url: inviteUrl,
      email_sent: emailResult.emailSent,
      email_message_id: emailResult.messageId || null,
      fallback_reason: emailResult.emailSent ? null : emailResult.reason || 'email_delivery_failed',
    })
  })

  route('GET', '/owner-invites/:token', async ({ params, res, requestId }) => {
    const token = String(params.token || '').trim()
    if (!token) return sendError(res, requestId, 404, 'INVITE_NOT_FOUND', 'Invite not found.')

    const inviteSnap = await getDb()
      .collection('owner_invites')
      .where('token', '==', token)
      .limit(1)
      .get()
    const inviteDoc = inviteSnap.docs[0]
    if (!inviteDoc) return sendError(res, requestId, 404, 'INVITE_NOT_FOUND', 'Invite not found.')

    const invite = { id: inviteDoc.id, ...(inviteDoc.data() || {}) }
    if (
      String(invite.status || '').toLowerCase() !== OWNER_INVITE_PENDING ||
      isExpiredOwnerInvite(invite)
    ) {
      return sendError(res, requestId, 404, 'INVITE_NOT_FOUND', 'Invite not found.')
    }

    const property = await getFirestorePropertyById(invite.property_id)
    if (!property) return sendError(res, requestId, 404, 'INVITE_NOT_FOUND', 'Invite not found.')
    return ok(res, requestId, sanitizeOwnerInvite({ invite, property }))
  })

  route(
    'GET',
    '/properties/:propertyId/owner-invites',
    async ({ actor, verified, params, res, requestId }) => {
      try {
        requireVerifiedActor({ verified, actor })
        const propertyId = String(params.propertyId || '').trim()
        if (!propertyId)
          throw createApiError(400, 'PROPERTY_ID_REQUIRED', 'Property id is required.')
        if (!(await hasShareAccessToProperty({ actor, propertyId }))) {
          throw createApiError(
            403,
            'PERMISSION_DENIED',
            'You cannot view owner invites for this property.',
          )
        }
        const property = await getFirestorePropertyById(propertyId)
        if (!property) throw createApiError(404, 'PROPERTY_NOT_FOUND', 'Property not found.')
        const snap = await getDb()
          .collection('owner_invites')
          .where('property_id', '==', propertyId)
          .get()
        const invites = snap.docs
          .map((doc) => sanitizeOwnerInviteForPropertyMember({ id: doc.id, ...(doc.data() || {}) }))
          .sort((a, b) =>
            String(b.updated_at || b.created_at || '').localeCompare(
              String(a.updated_at || a.created_at || ''),
            ),
          )
        return ok(res, requestId, { property_id: propertyId, invites })
      } catch (error) {
        return sendError(
          res,
          requestId,
          error.status || 500,
          error.code || 'OWNER_INVITES_LOAD_FAILED',
          error.message || 'Unable to load owner invites.',
          error.status >= 500,
        )
      }
    },
  )

  route(
    'POST',
    '/owner-invites/:token/accept',
    async ({ actor, verified, params, res, requestId }) => {
      try {
        requireVerifiedActor({ verified, actor })
        const token = String(params.token || '').trim()
        if (!token) throw createApiError(404, 'INVITE_NOT_FOUND', 'Invite not found.')
        const actorEmail = normalizeEmail(actor.email)
        if (!actorEmail) {
          throw createApiError(
            400,
            'ACCOUNT_EMAIL_REQUIRED',
            'Your authenticated account must have an email.',
          )
        }

        const db = getDb()
        const result = await db.runTransaction(async (tx) => {
          const inviteQuery = db.collection('owner_invites').where('token', '==', token).limit(1)
          const inviteQuerySnap = await tx.get(inviteQuery)
          const inviteDoc = inviteQuerySnap.docs[0]
          if (!inviteDoc) throw createApiError(404, 'INVITE_NOT_FOUND', 'Invite not found.')

          const invite = { id: inviteDoc.id, ...(inviteDoc.data() || {}) }
          const inviteStatus = String(invite.status || '')
            .trim()
            .toLowerCase()
          if (normalizeEmail(invite.owner_email) !== actorEmail) {
            throw createApiError(
              403,
              'INVITE_EMAIL_MISMATCH',
              'This invite was issued for a different email address.',
            )
          }
          if (inviteStatus === OWNER_INVITE_ACCEPTED) {
            if (String(invite.accepted_by_user_id || '') !== actor.id) {
              throw createApiError(
                409,
                'INVITE_ALREADY_ACCEPTED',
                'This invite has already been accepted.',
              )
            }
            return { propertyId: invite.property_id, idempotent: true }
          }
          if (inviteStatus !== OWNER_INVITE_PENDING || isExpiredOwnerInvite(invite)) {
            throw createApiError(
              410,
              'INVITE_EXPIRED_OR_UNAVAILABLE',
              'This invite is no longer available.',
            )
          }

          const propertyRef = db.collection('properties').doc(String(invite.property_id))
          const roleRef = db
            .collection('users')
            .doc(actor.id)
            .collection('roles')
            .doc(ownerRoleDocId(invite.property_id))
          const [propertySnap, roleSnap] = await Promise.all([tx.get(propertyRef), tx.get(roleRef)])
          if (!propertySnap.exists)
            throw createApiError(404, 'PROPERTY_NOT_FOUND', 'Property not found.')

          const now = new Date()
          const property = propertySnap.data() || {}
          const ownerIds = [
            ...new Set([
              ...(Array.isArray(property.owner_user_ids) ? property.owner_user_ids : []),
              actor.id,
            ]),
          ]
          tx.set(
            roleRef,
            {
              property_id: String(invite.property_id),
              user_id: actor.id,
              role: 'po',
              status: 'active',
              relationship_type: 'owner',
              invite_id: invite.invite_id || invite.id,
              granted_by: invite.invited_by_user_id || invite.pm_user_id || null,
              created_at: roleSnap.exists ? roleSnap.data()?.created_at || now : now,
              updated_at: now,
            },
            { merge: true },
          )
          tx.set(
            propertyRef,
            {
              owner_user_ids: ownerIds,
              primary_owner_user_id: property.primary_owner_user_id || actor.id,
              updated_by_user_id: actor.id,
              updated_at: now,
            },
            { merge: true },
          )
          tx.set(
            inviteDoc.ref,
            {
              status: OWNER_INVITE_ACCEPTED,
              accepted_at: now,
              accepted_by_user_id: actor.id,
              updated_at: now,
            },
            { merge: true },
          )
          tx.set(
            ownerHistoryEventRef({
              db,
              propertyId: invite.property_id,
              eventType: 'owner_invite_accepted',
            }),
            {
              event_type: 'owner_invite_accepted',
              property_id: String(invite.property_id),
              invite_id: invite.invite_id || invite.id,
              actor_user_id: actor.id,
              subject_user_id: actor.id,
              created_at: now,
            },
          )
          return { propertyId: invite.property_id, idempotent: false }
        })

        return ok(res, requestId, {
          property_id: result.propertyId,
          status: OWNER_INVITE_ACCEPTED,
          accepted: true,
          idempotent: result.idempotent,
          already_accepted: result.idempotent,
        })
      } catch (error) {
        return sendError(
          res,
          requestId,
          error.status || 500,
          error.code || 'OWNER_INVITE_ACCEPT_FAILED',
          error.message || 'Unable to accept owner invite.',
          error.status >= 500,
        )
      }
    },
  )

  route(
    'POST',
    '/properties/:propertyId/owner-invites/:inviteId/revoke',
    async ({ actor, verified, params, res, requestId }) => {
      try {
        requireVerifiedActor({ verified, actor })
        const propertyId = String(params.propertyId || '').trim()
        const inviteId = String(params.inviteId || '').trim()
        if (!propertyId || !inviteId)
          throw createApiError(400, 'INVITE_ID_REQUIRED', 'Invite id is required.')
        if (!(await hasShareAccessToProperty({ actor, propertyId }))) {
          throw createApiError(
            403,
            'PERMISSION_DENIED',
            'You cannot manage owner invites for this property.',
          )
        }

        const db = getDb()
        const result = await db.runTransaction(async (tx) => {
          const propertyRef = db.collection('properties').doc(propertyId)
          const inviteRef = db.collection('owner_invites').doc(inviteId)
          const [propertySnap, inviteSnap] = await Promise.all([
            tx.get(propertyRef),
            tx.get(inviteRef),
          ])
          if (!propertySnap.exists)
            throw createApiError(404, 'PROPERTY_NOT_FOUND', 'Property not found.')
          if (!inviteSnap.exists || String(inviteSnap.data()?.property_id || '') !== propertyId) {
            throw createApiError(404, 'INVITE_NOT_FOUND', 'Invite not found.')
          }
          const invite = inviteSnap.data() || {}
          const status = String(invite.status || '').toLowerCase()
          if (status === 'revoked') return { idempotent: true }
          if (status !== OWNER_INVITE_PENDING) {
            throw createApiError(
              409,
              'INVITE_NOT_PENDING',
              'Only pending owner invites can be revoked.',
            )
          }

          const now = new Date()
          tx.set(
            inviteRef,
            { status: 'revoked', revoked_at: now, revoked_by_user_id: actor.id, updated_at: now },
            { merge: true },
          )
          tx.set(ownerHistoryEventRef({ db, propertyId, eventType: 'owner_invite_revoked' }), {
            event_type: 'owner_invite_revoked',
            property_id: propertyId,
            invite_id: inviteId,
            actor_user_id: actor.id,
            created_at: now,
          })
          return { idempotent: false }
        })
        return ok(res, requestId, {
          invite_id: inviteId,
          status: 'revoked',
          idempotent: result.idempotent,
          already_revoked: result.idempotent,
        })
      } catch (error) {
        return sendError(
          res,
          requestId,
          error.status || 500,
          error.code || 'OWNER_INVITE_REVOKE_FAILED',
          error.message || 'Unable to revoke owner invite.',
          error.status >= 500,
        )
      }
    },
  )

  route(
    'DELETE',
    '/properties/:propertyId/owners/:ownerUserId',
    async ({ actor, verified, params, res, requestId }) => {
      try {
        requireVerifiedActor({ verified, actor })
        const propertyId = String(params.propertyId || '').trim()
        const ownerUserId = String(params.ownerUserId || '').trim()
        if (!propertyId || !ownerUserId)
          throw createApiError(400, 'OWNER_ID_REQUIRED', 'Owner id is required.')
        const actorIsPm = await hasPmAccessToProperty({ actor, propertyId })
        const actorHasAccess = actorIsPm || (await hasShareAccessToProperty({ actor, propertyId }))
        if (!actorHasAccess)
          throw createApiError(
            403,
            'PERMISSION_DENIED',
            'You cannot manage owners for this property.',
          )

        const db = getDb()
        const result = await db.runTransaction(async (tx) => {
          const propertyRef = db.collection('properties').doc(propertyId)
          const rolesQuery = db
            .collection('users')
            .doc(ownerUserId)
            .collection('roles')
            .where('property_id', '==', propertyId)
          const invitesQuery = db.collection('owner_invites').where('property_id', '==', propertyId)
          const [propertySnap, rolesSnap, invitesSnap] = await Promise.all([
            tx.get(propertyRef),
            tx.get(rolesQuery),
            tx.get(invitesQuery),
          ])
          if (!propertySnap.exists)
            throw createApiError(404, 'PROPERTY_NOT_FOUND', 'Property not found.')
          const property = propertySnap.data() || {}
          const ownerIds = [
            ...new Set(Array.isArray(property.owner_user_ids) ? property.owner_user_ids : []),
          ]
          if (!ownerIds.includes(ownerUserId))
            return { idempotent: true, primaryOwnerUserId: property.primary_owner_user_id || null }
          if (
            !actorIsPm &&
            actor.id !== ownerUserId &&
            String(property.primary_owner_user_id || '') !== actor.id
          ) {
            throw createApiError(
              403,
              'PERMISSION_DENIED',
              'Only a PM, the primary owner, or the owner themselves can remove this access.',
            )
          }
          if (ownerIds.length <= 1) {
            throw createApiError(
              409,
              'LAST_OWNER_REMOVAL_FORBIDDEN',
              'Assign another owner before removing the last owner.',
            )
          }

          const nextOwnerIds = ownerIds.filter((id) => id !== ownerUserId)
          const nextPrimaryOwnerId = nextOwnerIds.includes(property.primary_owner_user_id)
            ? property.primary_owner_user_id
            : nextOwnerIds[0]
          const now = new Date()
          for (const roleDoc of rolesSnap.docs) {
            if (String(roleDoc.data()?.role || '').toLowerCase() === 'po') tx.delete(roleDoc.ref)
          }
          for (const inviteDoc of invitesSnap.docs) {
            const invite = inviteDoc.data() || {}
            if (
              String(invite.status || '').toLowerCase() === OWNER_INVITE_ACCEPTED &&
              String(invite.accepted_by_user_id || '') === ownerUserId
            ) {
              tx.set(
                inviteDoc.ref,
                {
                  status: 'revoked',
                  revoked_at: now,
                  revoked_by_user_id: actor.id,
                  accepted_by_user_id: null,
                  updated_at: now,
                },
                { merge: true },
              )
            }
          }
          tx.set(
            propertyRef,
            {
              owner_user_ids: nextOwnerIds,
              primary_owner_user_id: nextPrimaryOwnerId,
              ownership_mode: nextOwnerIds.length ? 'self_owned' : 'managed_for_owner',
              updated_by_user_id: actor.id,
              updated_at: now,
            },
            { merge: true },
          )
          tx.set(ownerHistoryEventRef({ db, propertyId, eventType: 'owner_access_removed' }), {
            event_type: 'owner_access_removed',
            property_id: propertyId,
            actor_user_id: actor.id,
            subject_user_id: ownerUserId,
            created_at: now,
          })
          return { idempotent: false, primaryOwnerUserId: nextPrimaryOwnerId }
        })
        return ok(res, requestId, {
          owner_user_id: ownerUserId,
          removed: !result.idempotent,
          idempotent: result.idempotent,
          primary_owner_user_id: result.primaryOwnerUserId,
        })
      } catch (error) {
        return sendError(
          res,
          requestId,
          error.status || 500,
          error.code || 'OWNER_REMOVAL_FAILED',
          error.message || 'Unable to remove owner access.',
          error.status >= 500,
        )
      }
    },
  )

  route(
    'POST',
    '/property-access-invites/email',
    async ({ actor, verified, body, req, res, requestId }) => {
      try {
        requireVerifiedActor({ verified, actor })
        const propertyId = String(body?.property_id || '').trim()
        const invitedEmail = normalizeEmail(body?.invited_email)
        const accessRole = normalizePropertyAccessRole(body?.access_role)
        if (!propertyId)
          throw createApiError(400, 'PROPERTY_ID_REQUIRED', 'property_id is required.')
        if (!/.+@.+\..+/.test(invitedEmail)) {
          throw createApiError(400, 'INVALID_INVITED_EMAIL', 'A valid invited_email is required.')
        }
        if (!accessRole) {
          throw createApiError(
            400,
            'INVALID_ACCESS_ROLE',
            'access_role must be owner, manager, or viewer.',
          )
        }
        if (!(await hasPropertyAccessManagementRights({ actor, propertyId }))) {
          throw createApiError(
            403,
            'PERMISSION_DENIED',
            'Only a property manager or owner can invite access.',
          )
        }

        const property = await getFirestorePropertyById(propertyId)
        if (!property) throw createApiError(404, 'PROPERTY_NOT_FOUND', 'Property not found.')
        const existingInvites = await getDb()
          .collection('property_access_invites')
          .where('property_id', '==', propertyId)
          .get()
        const existing = existingInvites.docs
          .map((doc) => ({ id: doc.id, ...(doc.data() || {}) }))
          .find(
            (invite) =>
              normalizeEmail(invite.invited_email) === invitedEmail &&
              normalizePropertyAccessRole(invite.access_role) === accessRole &&
              [PROPERTY_ACCESS_INVITE_PENDING, PROPERTY_ACCESS_INVITE_ACCEPTED].includes(
                String(invite.status || '')
                  .trim()
                  .toLowerCase(),
              ),
          )
        if (existing) {
          const accepted =
            String(existing.status || '')
              .trim()
              .toLowerCase() === PROPERTY_ACCESS_INVITE_ACCEPTED
          throw createApiError(
            409,
            accepted ? 'ACCESS_ALREADY_GRANTED' : 'ACCESS_INVITE_ALREADY_PENDING',
            accepted
              ? 'This email already has this level of access to the property.'
              : 'A matching access invite is already pending for this email.',
          )
        }

        const token = generateOwnerInviteToken()
        const now = new Date()
        const inviteId = token.slice(0, 20)
        await getDb().collection('property_access_invites').doc(inviteId).set({
          invite_id: inviteId,
          property_id: propertyId,
          invited_email: invitedEmail,
          access_role: accessRole,
          invited_by_user_id: actor.id,
          status: PROPERTY_ACCESS_INVITE_PENDING,
          token,
          expires_at: createOwnerInviteExpiry(),
          accepted_at: null,
          accepted_by_user_id: null,
          revoked_at: null,
          revoked_by_user_id: null,
          created_at: now,
          updated_at: now,
        })

        const inviteUrl = buildPropertyAccessInviteUrl({
          origin: String(req.headers.origin || '').trim(),
          token,
        })
        const emailResult = await sendOwnerInviteEmail({
          to: invitedEmail,
          inviteUrl,
          propertyName: String(property.nickname || property.address || 'Property').trim(),
          propertyAddress: String(property.address || '').trim(),
          inviterName: String(
            body?.inviter_name || actor?.name || actor?.email || 'A property member',
          ).trim(),
        })
        return ok(res, requestId, {
          invite_id: inviteId,
          invite_url: inviteUrl,
          access_role: accessRole,
          email_sent: emailResult.emailSent,
          email_message_id: emailResult.messageId || null,
          fallback_reason: emailResult.emailSent
            ? null
            : emailResult.reason || 'email_delivery_failed',
        })
      } catch (error) {
        return sendError(
          res,
          requestId,
          error.status || 500,
          error.code || 'PROPERTY_ACCESS_INVITE_CREATE_FAILED',
          error.message || 'Unable to create property access invite.',
          error.status >= 500,
        )
      }
    },
  )

  route('GET', '/property-access-invites/:token', async ({ params, res, requestId }) => {
    const token = String(params.token || '').trim()
    if (!token) return sendError(res, requestId, 404, 'INVITE_NOT_FOUND', 'Invite not found.')
    const inviteSnap = await getDb()
      .collection('property_access_invites')
      .where('token', '==', token)
      .limit(1)
      .get()
    const inviteDoc = inviteSnap.docs[0]
    if (!inviteDoc) return sendError(res, requestId, 404, 'INVITE_NOT_FOUND', 'Invite not found.')
    const invite = { id: inviteDoc.id, ...(inviteDoc.data() || {}) }
    if (
      String(invite.status || '').toLowerCase() !== PROPERTY_ACCESS_INVITE_PENDING ||
      isExpiredPropertyAccessInvite(invite)
    ) {
      return sendError(res, requestId, 404, 'INVITE_NOT_FOUND', 'Invite not found.')
    }
    const property = await getFirestorePropertyById(invite.property_id)
    if (!property) return sendError(res, requestId, 404, 'INVITE_NOT_FOUND', 'Invite not found.')
    return ok(res, requestId, sanitizePropertyAccessInvite({ invite, property }))
  })

  route(
    'POST',
    '/property-access-invites/:token/accept',
    async ({ actor, verified, params, res, requestId }) => {
      try {
        requireVerifiedActor({ verified, actor })
        const token = String(params.token || '').trim()
        const actorEmail = normalizeEmail(actor.email)
        if (!token) throw createApiError(404, 'INVITE_NOT_FOUND', 'Invite not found.')
        if (!actorEmail)
          throw createApiError(
            400,
            'ACCOUNT_EMAIL_REQUIRED',
            'Your authenticated account must have an email.',
          )

        const db = getDb()
        const result = await db.runTransaction(async (tx) => {
          const inviteQuery = db
            .collection('property_access_invites')
            .where('token', '==', token)
            .limit(1)
          const inviteSnap = await tx.get(inviteQuery)
          const inviteDoc = inviteSnap.docs[0]
          if (!inviteDoc) throw createApiError(404, 'INVITE_NOT_FOUND', 'Invite not found.')
          const invite = { id: inviteDoc.id, ...(inviteDoc.data() || {}) }
          const accessRole = normalizePropertyAccessRole(invite.access_role)
          if (!accessRole)
            throw createApiError(
              409,
              'INVALID_ACCESS_ROLE',
              'This invite has an unsupported access role.',
            )
          if (normalizeEmail(invite.invited_email) !== actorEmail) {
            throw createApiError(
              403,
              'INVITE_EMAIL_MISMATCH',
              'This invite was issued for a different email address.',
            )
          }
          const status = String(invite.status || '')
            .trim()
            .toLowerCase()
          if (status === PROPERTY_ACCESS_INVITE_ACCEPTED) {
            if (String(invite.accepted_by_user_id || '') !== actor.id) {
              throw createApiError(
                409,
                'INVITE_ALREADY_ACCEPTED',
                'This invite has already been accepted.',
              )
            }
            return { propertyId: invite.property_id, accessRole, idempotent: true }
          }
          if (status !== PROPERTY_ACCESS_INVITE_PENDING || isExpiredPropertyAccessInvite(invite)) {
            throw createApiError(
              410,
              'INVITE_EXPIRED_OR_UNAVAILABLE',
              'This invite is no longer available.',
            )
          }

          const propertyRef = db.collection('properties').doc(String(invite.property_id))
          const membershipRole = propertyAccessMembershipRole(accessRole)
          const roleRef = db
            .collection('users')
            .doc(actor.id)
            .collection('roles')
            .doc(propertyAccessRoleDocId({ propertyId: invite.property_id, accessRole }))
          const [propertySnap, roleSnap] = await Promise.all([tx.get(propertyRef), tx.get(roleRef)])
          if (!propertySnap.exists)
            throw createApiError(404, 'PROPERTY_NOT_FOUND', 'Property not found.')
          const property = propertySnap.data() || {}
          const memberField = propertyAccessUserIdsField(accessRole)
          const memberIds = [
            ...new Set([
              ...(Array.isArray(property[memberField]) ? property[memberField] : []),
              actor.id,
            ]),
          ]
          const now = new Date()
          tx.set(
            roleRef,
            {
              property_id: String(invite.property_id),
              user_id: actor.id,
              role: membershipRole,
              status: 'active',
              relationship_type: accessRole,
              invite_id: invite.invite_id || invite.id,
              granted_by: invite.invited_by_user_id || null,
              created_at: roleSnap.exists ? roleSnap.data()?.created_at || now : now,
              updated_at: now,
            },
            { merge: true },
          )
          const propertyUpdate = {
            [memberField]: memberIds,
            updated_by_user_id: actor.id,
            updated_at: now,
          }
          if (accessRole === 'owner') {
            propertyUpdate.primary_owner_user_id = property.primary_owner_user_id || actor.id
            propertyUpdate.ownership_mode = 'self_owned'
          }
          tx.set(propertyRef, propertyUpdate, { merge: true })
          tx.set(
            inviteDoc.ref,
            {
              status: PROPERTY_ACCESS_INVITE_ACCEPTED,
              accepted_at: now,
              accepted_by_user_id: actor.id,
              updated_at: now,
            },
            { merge: true },
          )
          tx.set(
            ownerHistoryEventRef({
              db,
              propertyId: invite.property_id,
              eventType: 'property_access_granted',
            }),
            {
              event_type: 'property_access_granted',
              property_id: String(invite.property_id),
              invite_id: invite.invite_id || invite.id,
              access_role: accessRole,
              actor_user_id: actor.id,
              subject_user_id: actor.id,
              created_at: now,
            },
          )
          return { propertyId: invite.property_id, accessRole, idempotent: false }
        })
        return ok(res, requestId, {
          property_id: result.propertyId,
          access_role: result.accessRole,
          status: PROPERTY_ACCESS_INVITE_ACCEPTED,
          accepted: true,
          already_accepted: result.idempotent,
        })
      } catch (error) {
        return sendError(
          res,
          requestId,
          error.status || 500,
          error.code || 'PROPERTY_ACCESS_INVITE_ACCEPT_FAILED',
          error.message || 'Unable to accept property access invite.',
          error.status >= 500,
        )
      }
    },
  )

  route(
    'GET',
    '/properties/:propertyId/access',
    async ({ actor, verified, params, res, requestId }) => {
      try {
        requireVerifiedActor({ verified, actor })
        const propertyId = String(params.propertyId || '').trim()
        if (!propertyId)
          throw createApiError(400, 'PROPERTY_ID_REQUIRED', 'Property id is required.')
        if (!(await hasPropertyAccessManagementRights({ actor, propertyId }))) {
          throw createApiError(
            403,
            'PERMISSION_DENIED',
            'You cannot manage access for this property.',
          )
        }
        const property = await getFirestorePropertyById(propertyId)
        if (!property) throw createApiError(404, 'PROPERTY_NOT_FOUND', 'Property not found.')
        const members = []
        for (const [accessRole, field] of [
          ['owner', 'owner_user_ids'],
          ['manager', 'manager_user_ids'],
          ['viewer', 'viewer_user_ids'],
        ]) {
          for (const userId of [
            ...new Set(Array.isArray(property[field]) ? property[field] : []),
          ]) {
            const profileSnap = await getDb().collection('users').doc(String(userId)).get()
            const profile = profileSnap.exists ? profileSnap.data() || {} : {}
            members.push({
              user_id: String(userId),
              access_role: accessRole,
              access_label: propertyAccessRoleLabel(accessRole),
              is_primary_owner:
                accessRole === 'owner' &&
                String(property.primary_owner_user_id || '') === String(userId),
              name: profile.full_name || profile.user_name || profile.display_name || null,
              email: profile.email || null,
            })
          }
        }
        const invitesSnap = await getDb()
          .collection('property_access_invites')
          .where('property_id', '==', propertyId)
          .get()
        const invites = invitesSnap.docs
          .map((doc) =>
            sanitizePropertyAccessInviteForManager({ id: doc.id, ...(doc.data() || {}) }),
          )
          .sort((a, b) =>
            String(b.updated_at || b.created_at || '').localeCompare(
              String(a.updated_at || a.created_at || ''),
            ),
          )
        return ok(res, requestId, { property_id: propertyId, members, invites })
      } catch (error) {
        return sendError(
          res,
          requestId,
          error.status || 500,
          error.code || 'PROPERTY_ACCESS_LOAD_FAILED',
          error.message || 'Unable to load property access.',
          error.status >= 500,
        )
      }
    },
  )

  route(
    'POST',
    '/properties/:propertyId/property-access-invites/:inviteId/revoke',
    async ({ actor, verified, params, res, requestId }) => {
      try {
        requireVerifiedActor({ verified, actor })
        const propertyId = String(params.propertyId || '').trim()
        const inviteId = String(params.inviteId || '').trim()
        if (!propertyId || !inviteId)
          throw createApiError(400, 'INVITE_ID_REQUIRED', 'Invite id is required.')
        if (!(await hasPropertyAccessManagementRights({ actor, propertyId }))) {
          throw createApiError(
            403,
            'PERMISSION_DENIED',
            'You cannot manage access for this property.',
          )
        }
        const inviteRef = getDb().collection('property_access_invites').doc(inviteId)
        const inviteSnap = await inviteRef.get()
        if (!inviteSnap.exists || String(inviteSnap.data()?.property_id || '') !== propertyId) {
          throw createApiError(404, 'INVITE_NOT_FOUND', 'Invite not found.')
        }
        const invite = inviteSnap.data() || {}
        const status = String(invite.status || '').toLowerCase()
        if (status === PROPERTY_ACCESS_INVITE_REVOKED)
          return ok(res, requestId, { invite_id: inviteId, already_revoked: true })
        if (status !== PROPERTY_ACCESS_INVITE_PENDING) {
          throw createApiError(409, 'INVITE_NOT_PENDING', 'Only a pending invite can be cancelled.')
        }
        const now = new Date()
        await inviteRef.set(
          {
            status: PROPERTY_ACCESS_INVITE_REVOKED,
            revoked_at: now,
            revoked_by_user_id: actor.id,
            updated_at: now,
          },
          { merge: true },
        )
        return ok(res, requestId, {
          invite_id: inviteId,
          status: PROPERTY_ACCESS_INVITE_REVOKED,
          already_revoked: false,
        })
      } catch (error) {
        return sendError(
          res,
          requestId,
          error.status || 500,
          error.code || 'PROPERTY_ACCESS_INVITE_REVOKE_FAILED',
          error.message || 'Unable to cancel property access invite.',
          error.status >= 500,
        )
      }
    },
  )

  route(
    'DELETE',
    '/properties/:propertyId/access/:userId',
    async ({ actor, verified, params, body, res, requestId }) => {
      try {
        requireVerifiedActor({ verified, actor })
        const propertyId = String(params.propertyId || '').trim()
        const userId = String(params.userId || '').trim()
        const accessRole = normalizePropertyAccessRole(body?.access_role)
        if (!propertyId || !userId || !accessRole) {
          throw createApiError(
            400,
            'ACCESS_MEMBER_REQUIRED',
            'property id, user id, and access_role are required.',
          )
        }
        if (!(await hasPropertyAccessManagementRights({ actor, propertyId }))) {
          throw createApiError(
            403,
            'PERMISSION_DENIED',
            'You cannot manage access for this property.',
          )
        }
        const db = getDb()
        const result = await db.runTransaction(async (tx) => {
          const propertyRef = db.collection('properties').doc(propertyId)
          const propertySnap = await tx.get(propertyRef)
          if (!propertySnap.exists)
            throw createApiError(404, 'PROPERTY_NOT_FOUND', 'Property not found.')
          const property = propertySnap.data() || {}
          const field = propertyAccessUserIdsField(accessRole)
          const currentIds = [...new Set(Array.isArray(property[field]) ? property[field] : [])]
          if (!currentIds.includes(userId))
            return { idempotent: true, primaryOwnerUserId: property.primary_owner_user_id || null }
          const nextIds = currentIds.filter((id) => id !== userId)
          const now = new Date()
          const update = { [field]: nextIds, updated_by_user_id: actor.id, updated_at: now }
          if (accessRole === 'owner') {
            if (!nextIds.length) {
              throw createApiError(
                409,
                'LAST_OWNER_REMOVAL_FORBIDDEN',
                'Assign another owner before removing the last owner.',
              )
            }
            const currentPrimary = String(property.primary_owner_user_id || '')
            const requestedPrimary = String(body?.next_primary_owner_user_id || '').trim()
            if (currentPrimary === userId) {
              if (requestedPrimary && !nextIds.includes(requestedPrimary)) {
                throw createApiError(
                  400,
                  'INVALID_PRIMARY_OWNER',
                  'The next primary owner must already be an owner.',
                )
              }
              update.primary_owner_user_id = requestedPrimary || nextIds[0]
            }
            update.ownership_mode = 'self_owned'
          }
          tx.set(propertyRef, update, { merge: true })
          tx.delete(
            db
              .collection('users')
              .doc(userId)
              .collection('roles')
              .doc(propertyAccessRoleDocId({ propertyId, accessRole })),
          )
          tx.set(ownerHistoryEventRef({ db, propertyId, eventType: 'property_access_removed' }), {
            event_type: 'property_access_removed',
            property_id: propertyId,
            access_role: accessRole,
            actor_user_id: actor.id,
            subject_user_id: userId,
            created_at: now,
          })
          return {
            idempotent: false,
            primaryOwnerUserId:
              update.primary_owner_user_id || property.primary_owner_user_id || null,
          }
        })
        return ok(res, requestId, {
          user_id: userId,
          access_role: accessRole,
          removed: !result.idempotent,
          already_removed: result.idempotent,
          primary_owner_user_id: result.primaryOwnerUserId,
        })
      } catch (error) {
        return sendError(
          res,
          requestId,
          error.status || 500,
          error.code || 'PROPERTY_ACCESS_REMOVE_FAILED',
          error.message || 'Unable to remove property access.',
          error.status >= 500,
        )
      }
    },
  )

  route('POST', '/sp/posts/ingest', async ({ actor, body, req, res, requestId }) => {
    if (!assertRole({ actor, allowed: ['sp', 'admin'], res, requestId })) return
    ensureAdStore()

    const sourceCode = String(body?.source_code || '').trim()
    const sourcePostId = String(body?.source_post_id || '').trim()
    const title = String(body?.title || '').trim()
    const landingUrlTemplate = String(body?.landing_url_template || '').trim()
    if (!sourceCode) {
      return sendError(res, requestId, 400, 'MISSING_SOURCE_CODE', 'source_code is required')
    }
    if (!sourcePostId) {
      return sendError(res, requestId, 400, 'MISSING_SOURCE_POST_ID', 'source_post_id is required')
    }
    if (!title) {
      return sendError(res, requestId, 400, 'MISSING_TITLE', 'title is required')
    }
    if (!landingUrlTemplate) {
      return sendError(
        res,
        requestId,
        400,
        'MISSING_LANDING_URL',
        'landing_url_template is required',
      )
    }

    const targetRegions = normalizeTargetRegions(body?.target_regions)
    if (!targetRegions.length) {
      return sendError(
        res,
        requestId,
        400,
        'MISSING_TARGET_REGIONS',
        'target_regions with valid region_level and region_code is required',
      )
    }

    const idempotencyKey = String(req.headers['idempotency-key'] || '').trim()
    const result = withIdempotency({
      store,
      key: idempotencyKey,
      resolver: () => {
        const now = nowIso()
        const sourceKey = sourceCode.toLowerCase()
        let source = store.spSources.get(sourceKey)
        if (!source) {
          source = {
            source_id: `src-${randomUUID()}`,
            source_code: sourceCode,
            source_name: String(body?.source_name || sourceCode),
            source_type: String(body?.source_type || 'webhook'),
            status: 'active',
            created_at: now,
            updated_at: now,
          }
          store.spSources.set(sourceKey, source)
        }

        const postKey = `${sourceKey}::${sourcePostId}`
        const existingPostId = store.adPostSourceIndex.get(postKey)
        const existing = existingPostId ? store.adPosts.get(existingPostId) : null
        const postId = existing?.post_id || buildDeterministicPostId(sourceCode, sourcePostId)
        const deliveryType = ['organic', 'sponsored'].includes(String(body?.delivery_type || ''))
          ? String(body.delivery_type)
          : 'organic'
        const upsertedPost = {
          post_id: postId,
          source_id: source.source_id,
          source_code: sourceCode,
          source_post_id: sourcePostId,
          service_type: String(body?.service_type || 'general'),
          service_type_label: String(body?.service_type_label || body?.service_type || 'General'),
          title,
          summary: String(body?.summary || ''),
          image_url: String(body?.image_url || ''),
          thumbnail_url: String(body?.thumbnail_url || body?.image_url || ''),
          card_width_px: Number(body?.card_width_px || 320),
          card_height_px: Number(body?.card_height_px || 180),
          image_aspect_ratio: String(body?.image_aspect_ratio || '16:9'),
          label_position: 'bottom_left',
          landing_url_template: landingUrlTemplate,
          handout_id: body?.handout_id || null,
          source_payload: body?.source_payload || {},
          status: String(body?.status || 'active'),
          moderation_status: String(body?.moderation_status || 'approved'),
          starts_at: body?.starts_at || now,
          ends_at: body?.ends_at || null,
          priority: Number(body?.priority || 0),
          quality_score: Number(body?.quality_score || 0.5),
          delivery_type: deliveryType,
          campaign_id: body?.campaign_id || null,
          created_at: existing?.created_at || now,
          updated_at: now,
        }
        store.adPosts.set(postId, upsertedPost)
        store.adPostTargetRegions.set(postId, targetRegions)
        store.adPostSourceIndex.set(postKey, postId)
        return {
          postId,
          sourceId: source.source_id,
          created: !existing,
          post: upsertedPost,
          targetRegions,
        }
      },
    })
    // Simple invalidation strategy: clear feed cache on any post upsert.
    feedCache.clear()
    await Promise.all([
      saveFirestoreAdPost(result.post, result.targetRegions),
      clearFirestoreFeedCache(),
    ])

    return ok(res, requestId, {
      post_id: result.postId,
      source_id: result.sourceId,
      upserted: true,
      created: result.created,
    })
  })

  route('GET', '/ad-slots/:slot_id/feed', async ({ actor, req, params, query, res, requestId }) => {
    if (!assertRole({ actor, allowed: ['pm_po'], res, requestId })) return
    ensureAdStore()
    const slotId = String(params.slot_id || 'pm_feed_top').trim() || 'pm_feed_top'
    const slotConfig = ensureDefaultSlotConfig(slotId)
    if (slotConfig.status !== 'active') {
      return ok(res, requestId, { slot_id: slotId, items: [] })
    }

    const userRegion = resolveUserRegion({ req, actor })
    const hardLimit = Math.max(1, Number(query.get('limit') || slotConfig.max_items || 1))
    const maxItems = Math.min(hardLimit, 20)
    const clientEtag = String(req.headers['if-none-match'] || '').trim()
    const cacheKey = buildFeedCacheKey({ actor, slotId, userRegion, limit: maxItems })
    const pressure = touchFeedBucket({ actorId: actor.id, slotId })

    const cachedFresh = getFeedCacheEntry({ key: cacheKey, allowStale: false })
    if (cachedFresh) {
      if (clientEtag && clientEtag === cachedFresh.etag) return notModified(res, cachedFresh.etag)
      return json(
        res,
        200,
        { request_id: requestId, ...cachedFresh.payload },
        {
          ETag: cachedFresh.etag,
          'X-Feed-Cache': 'HIT',
          'X-Feed-Rate-Remaining': String(pressure.remaining),
        },
      )
    }

    const persistedFresh = await getFirestoreFeedCache(cacheKey, false)
    if (persistedFresh?.payload && persistedFresh?.etag) {
      feedCache.set(cacheKey, {
        payload: persistedFresh.payload,
        etag: persistedFresh.etag,
        expiresAt: persistedFresh.expiresAt,
      })
      if (clientEtag && clientEtag === persistedFresh.etag)
        return notModified(res, persistedFresh.etag)
      return json(
        res,
        200,
        { request_id: requestId, ...persistedFresh.payload },
        {
          ETag: persistedFresh.etag,
          'X-Feed-Cache': 'HIT_PERSISTED',
          'X-Feed-Rate-Remaining': String(pressure.remaining),
        },
      )
    }

    if (pressure.overloaded) {
      const cachedStale = getFeedCacheEntry({ key: cacheKey, allowStale: true })
      if (cachedStale) {
        if (clientEtag && clientEtag === cachedStale.etag) return notModified(res, cachedStale.etag)
        return json(
          res,
          200,
          { request_id: requestId, ...cachedStale.payload },
          {
            ETag: cachedStale.etag,
            'X-Feed-Cache': 'STALE',
            'X-Feed-Rate-Remaining': String(pressure.remaining),
          },
        )
      }
      const persistedStale = await getFirestoreFeedCache(cacheKey, true)
      if (persistedStale?.payload && persistedStale?.etag) {
        feedCache.set(cacheKey, {
          payload: persistedStale.payload,
          etag: persistedStale.etag,
          expiresAt: persistedStale.expiresAt,
        })
        if (clientEtag && clientEtag === persistedStale.etag)
          return notModified(res, persistedStale.etag)
        return json(
          res,
          200,
          { request_id: requestId, ...persistedStale.payload },
          {
            ETag: persistedStale.etag,
            'X-Feed-Cache': 'STALE_PERSISTED',
            'X-Feed-Rate-Remaining': String(pressure.remaining),
          },
        )
      }
      return sendError(
        res,
        requestId,
        429,
        'FEED_RATE_LIMITED',
        'Too many feed requests in a short time window',
        true,
      )
    }

    const payload = await getOrBuildFeedPayload({
      key: cacheKey,
      build: async () => {
        const nowDate = new Date()
        await hydrateAdPostsFromFirestore()
        const sponsoredNumerator = Math.max(0, Number(slotConfig.sponsored_ratio_numerator || 0))
        const sponsoredDenominator = Math.max(
          1,
          Number(slotConfig.sponsored_ratio_denominator || 1),
        )
        const sponsoredCap = sponsoredEnabled
          ? Math.max(0, Math.ceil((maxItems * sponsoredNumerator) / sponsoredDenominator))
          : 0

        const candidates = []
        for (const post of store.adPosts.values()) {
          if (String(post.status || '').toLowerCase() !== 'active') continue
          if (String(post.moderation_status || '').toLowerCase() !== 'approved') continue
          if (!isPostInServingWindow(post, nowDate)) continue
          if (!sponsoredEnabled && String(post.delivery_type || 'organic') === 'sponsored') continue
          const targetRegions = store.adPostTargetRegions.get(post.post_id) || []
          const regionMatchLevel = resolveRegionMatchLevel({ userRegion, targetRegions })
          if (!regionMatchLevel) continue
          if (
            isFrequencyCapped({
              slotConfig,
              actorId: actor.id,
              postId: post.post_id,
              slotId,
              nowDate,
            })
          ) {
            continue
          }
          candidates.push({
            post,
            regionMatchLevel,
            rankScore: computeAdScore(post, nowDate),
          })
        }

        candidates.sort((a, b) => b.rankScore - a.rankScore)

        const selected = []
        let sponsoredCount = 0
        for (const row of candidates) {
          if (selected.length >= maxItems) break
          const isSponsored = String(row.post.delivery_type || 'organic') === 'sponsored'
          if (isSponsored && sponsoredCount >= sponsoredCap) continue
          selected.push(row)
          if (isSponsored) sponsoredCount += 1
        }

        if (!selected.length && slotConfig.fallback_post_id) {
          const fallback = store.adPosts.get(slotConfig.fallback_post_id)
          if (
            fallback &&
            String(fallback.status || '').toLowerCase() === 'active' &&
            String(fallback.moderation_status || '').toLowerCase() === 'approved' &&
            isPostInServingWindow(fallback, nowDate)
          ) {
            selected.push({
              post: fallback,
              regionMatchLevel: 'country',
              rankScore: computeAdScore(fallback, nowDate),
            })
          }
        }

        const persistDeliveryTasks = []
        const items = selected.map((row) => {
          const deliveryId = `ad-delivery-${randomUUID()}`
          const impressionToken = createImpressionToken()
          const deliveryType = String(row.post.delivery_type || 'organic')
          const deliveryRecord = {
            delivery_id: deliveryId,
            request_id: requestId,
            slot_id: slotId,
            user_id: actor.id,
            post_id: row.post.post_id,
            delivery_type: deliveryType,
            campaign_id: row.post.campaign_id || null,
            region_match_level: row.regionMatchLevel,
            rank_score: Number(row.rankScore.toFixed(5)),
            impression_token: impressionToken,
            served_at: nowIso(),
          }
          store.adDeliveryLogs.set(deliveryId, deliveryRecord)
          store.adDeliveryByToken.set(impressionToken, deliveryId)
          persistDeliveryTasks.push(saveFirestoreAdDelivery(deliveryRecord))

          return {
            delivery_id: deliveryId,
            impression_token: impressionToken,
            post_id: row.post.post_id,
            delivery_type: deliveryType,
            campaign_id: row.post.campaign_id || null,
            title: row.post.title,
            summary: row.post.summary,
            image_url: row.post.thumbnail_url || row.post.image_url,
            service_type: row.post.service_type,
            service_type_label: row.post.service_type_label,
            label_position: 'bottom_left',
            card_spec: {
              width_px: Number(row.post.card_width_px || slotConfig.card_width_px || 320),
              height_px: Number(row.post.card_height_px || slotConfig.card_height_px || 180),
              image_aspect_ratio: String(
                row.post.image_aspect_ratio || slotConfig.image_aspect_ratio || '16:9',
              ),
            },
            tracking: {
              impression_url: '/api/ad-events/impression',
              click_url: `/api/ad-events/click/${encodeURIComponent(impressionToken)}`,
            },
          }
        })
        if (persistDeliveryTasks.length) {
          await Promise.all(persistDeliveryTasks)
        }

        return {
          slot_id: slotId,
          items,
        }
      },
    })

    const etag = computeFeedEtag(payload)
    if (feedCacheTtlMs > 0) {
      const expiresAtMs = Date.now() + feedCacheTtlMs
      feedCache.set(cacheKey, {
        payload,
        etag,
        expiresAt: expiresAtMs,
      })
      await saveFirestoreFeedCache(cacheKey, payload, etag, expiresAtMs)
    }
    if (clientEtag && clientEtag === etag) return notModified(res, etag)

    return json(
      res,
      200,
      { request_id: requestId, ...payload },
      {
        ETag: etag,
        'X-Feed-Cache': 'MISS',
        'X-Feed-Rate-Remaining': String(pressure.remaining),
      },
    )
  })

  route('POST', '/ad-events/impression', async ({ actor, body, req, res, requestId }) => {
    ensureAdStore()
    const impressionToken = String(body?.impression_token || '').trim()
    if (!impressionToken) {
      return sendError(
        res,
        requestId,
        400,
        'MISSING_IMPRESSION_TOKEN',
        'impression_token is required',
      )
    }

    let deliveryId = store.adDeliveryByToken.get(impressionToken)
    let delivery = deliveryId ? store.adDeliveryLogs.get(deliveryId) : null
    if (!delivery) {
      const persistedDelivery = await getFirestoreAdDeliveryByToken(impressionToken)
      if (persistedDelivery) {
        delivery = persistedDelivery
        deliveryId = persistedDelivery.delivery_id
        if (deliveryId) store.adDeliveryLogs.set(deliveryId, persistedDelivery)
        if (deliveryId) store.adDeliveryByToken.set(impressionToken, deliveryId)
      }
    }
    if (!deliveryId || !delivery) {
      return sendError(
        res,
        requestId,
        404,
        'INVALID_IMPRESSION_TOKEN',
        'Impression token not found',
      )
    }

    const existingMemory = store.adImpressionEvents.get(impressionToken)
    if (existingMemory) {
      return ok(res, requestId, { recorded: false, impression_id: existingMemory.impression_id })
    }
    const existingPersisted = await getFirestoreAdImpressionByToken(impressionToken)
    if (existingPersisted) {
      store.adImpressionEvents.set(impressionToken, existingPersisted)
      return ok(res, requestId, { recorded: false, impression_id: existingPersisted.impression_id })
    }

    const row = {
      impression_id: `ad-impr-${randomUUID()}`,
      impression_token: impressionToken,
      delivery_id: delivery.delivery_id,
      user_id: delivery.user_id || actor.id,
      post_id: delivery.post_id,
      slot_id: delivery.slot_id,
      event_time: nowIso(),
      viewport_ratio: body?.viewport_ratio != null ? Number(body.viewport_ratio) : null,
      dwell_ms: body?.dwell_ms != null ? Number(body.dwell_ms) : null,
      user_agent: String(req.headers['user-agent'] || ''),
      ip_hash: null,
    }
    store.adImpressionEvents.set(impressionToken, row)
    await saveFirestoreAdImpression(row)
    return ok(res, requestId, { recorded: true, impression_id: row.impression_id })
  })

  route(
    'GET',
    '/ad-events/click/:impression_token',
    async ({ actor, req, params, res, requestId }) => {
      ensureAdStore()
      const impressionToken = String(params.impression_token || '').trim()
      if (!impressionToken) {
        return sendError(
          res,
          requestId,
          400,
          'MISSING_IMPRESSION_TOKEN',
          'impression_token is required',
        )
      }

      let deliveryId = store.adDeliveryByToken.get(impressionToken)
      let delivery = deliveryId ? store.adDeliveryLogs.get(deliveryId) : null
      if (!delivery) {
        const persistedDelivery = await getFirestoreAdDeliveryByToken(impressionToken)
        if (persistedDelivery) {
          delivery = persistedDelivery
          deliveryId = persistedDelivery.delivery_id
          if (deliveryId) store.adDeliveryLogs.set(deliveryId, persistedDelivery)
          if (deliveryId) store.adDeliveryByToken.set(impressionToken, deliveryId)
        }
      }
      if (!deliveryId || !delivery) {
        return sendError(
          res,
          requestId,
          404,
          'INVALID_IMPRESSION_TOKEN',
          'Impression token not found',
        )
      }

      let post = store.adPosts.get(delivery.post_id)
      if (!post) {
        const persistedPost = await getFirestoreAdPostById(delivery.post_id)
        if (persistedPost) {
          post = persistedPost
          store.adPosts.set(post.post_id, post)
          store.adPostTargetRegions.set(
            post.post_id,
            normalizeTargetRegions(post.target_regions || []),
          )
        }
      }
      if (!post) {
        return sendError(res, requestId, 404, 'POST_NOT_FOUND', 'Post not found for click token')
      }

      let clickRow = store.adClickEvents.get(impressionToken)
      if (!clickRow) {
        const persistedClick = await getFirestoreAdClickByToken(impressionToken)
        if (persistedClick) {
          clickRow = persistedClick
          store.adClickEvents.set(impressionToken, persistedClick)
        }
      }

      if (!clickRow) {
        clickRow = {
          click_id: `ad-click-${randomUUID()}`,
          impression_token: impressionToken,
          delivery_id: delivery.delivery_id,
          user_id: delivery.user_id || actor.id,
          post_id: delivery.post_id,
          slot_id: delivery.slot_id,
          event_time: nowIso(),
          referer: String(req.headers.referer || req.headers.referrer || ''),
          user_agent: String(req.headers['user-agent'] || ''),
          ip_hash: null,
        }
        store.adClickEvents.set(impressionToken, clickRow)
        await saveFirestoreAdClick(clickRow)
      }

      const location = resolveLandingUrl({ post, impressionToken })
      return redirect(res, location)
    },
  )

  route('POST', '/internal/promo-campaigns', async ({ actor, body, res, requestId }) => {
    if (!assertRole({ actor, allowed: ['admin'], res, requestId })) return
    if (!sponsoredEnabled) {
      return sendError(
        res,
        requestId,
        403,
        'SPONSORED_DISABLED',
        'Sponsored promotion is disabled by feature flag',
      )
    }
    ensureAdStore()
    const advertiserSpId = String(body?.advertiser_sp_id || '').trim()
    const campaignName = String(body?.campaign_name || '').trim()
    if (!advertiserSpId) {
      return sendError(
        res,
        requestId,
        400,
        'MISSING_ADVERTISER_SP_ID',
        'advertiser_sp_id is required',
      )
    }
    if (!campaignName) {
      return sendError(res, requestId, 400, 'MISSING_CAMPAIGN_NAME', 'campaign_name is required')
    }
    const now = nowIso()
    const campaign = {
      campaign_id: `camp-${randomUUID()}`,
      advertiser_sp_id: advertiserSpId,
      campaign_name: campaignName,
      status: String(body?.status || 'draft'),
      objective: String(body?.objective || 'traffic'),
      budget_total_cents: body?.budget_total_cents != null ? Number(body.budget_total_cents) : null,
      budget_daily_cents: body?.budget_daily_cents != null ? Number(body.budget_daily_cents) : null,
      bid_mode: String(body?.bid_mode || 'cpc'),
      bid_amount_cents: body?.bid_amount_cents != null ? Number(body.bid_amount_cents) : null,
      starts_at: body?.starts_at || null,
      ends_at: body?.ends_at || null,
      created_at: now,
      updated_at: now,
    }
    store.promoCampaigns.set(campaign.campaign_id, campaign)
    return ok(res, requestId, { campaign })
  })

  route('POST', '/agent/intake', async ({ actor, body, req, res, requestId }) => {
    if (!isAllowedOrigin(req)) {
      return sendError(res, requestId, 403, 'ORIGIN_NOT_ALLOWED', 'Origin is not allowed')
    }
    const rateKey = `agent:intake:${actor?.id || 'anonymous'}`
    if (hitRateLimit({ key: rateKey, limit: agentRateLimitPerMin })) {
      return sendError(res, requestId, 429, 'RATE_LIMITED', 'Too many requests', true)
    }

    const rawTextInput = String(body?.raw_text || body?.text || '').trim()
    if (!rawTextInput || rawTextInput.length < 3) {
      return sendError(res, requestId, 400, 'INVALID_INPUT', 'raw_text is required')
    }
    if (!isMaintenanceRelated(rawTextInput)) {
      return ok(res, requestId, {
        capability: 'out_of_scope',
        message:
          'I can help with maintenance issue understanding, task creation, transaction entry, reminder setup, and finding service providers.',
      })
    }
    if (!hasAiQuotaAvailable(actor)) {
      return sendError(
        res,
        requestId,
        402,
        'AI_CREDIT_EXHAUSTED',
        'AI credit used up. Add credits or upgrade to continue.',
      )
    }

    const idempotencyKey = String(req.headers['idempotency-key'] || '')
    const result = await Promise.resolve(
      withIdempotency({
        store,
        key: idempotencyKey,
        resolver: () => {
          const rawText = rawTextInput
          const context = body?.context || {}
          return { rawText, context }
        },
      }),
    )

    const output = await runFormIntakeSkill({
      rawText: String(result?.rawText || '').trim(),
      context: result?.context || {},
      photos: body?.photos,
      videos: body?.videos,
      attachments: body?.attachments,
      llmConfig: {
        geminiApiKey,
        model: geminiModel,
        provider: llmProvider,
        vertexProjectId,
        vertexLocation,
        vertexPublisher,
      },
    })

    await appendAgentEvent({
      eventType: 'agent_intake',
      actor,
      requestId,
      metadata: {
        capability: output?.capability || null,
        ai_tokens_charged: recordAiUsage({ actor, input: rawTextInput, output }),
      },
    })

    ok(res, requestId, output)
  })

  route('POST', '/agent/task-insight', async ({ actor, body, req, res, requestId }) => {
    if (!isAllowedOrigin(req)) {
      return sendError(res, requestId, 403, 'ORIGIN_NOT_ALLOWED', 'Origin is not allowed')
    }
    const rateKey = `agent:task-insight:${actor?.id || 'anonymous'}`
    if (hitRateLimit({ key: rateKey, limit: agentRateLimitPerMin })) {
      return sendError(res, requestId, 429, 'RATE_LIMITED', 'Too many requests', true)
    }

    const task = body?.task || {}
    const description = String(task?.description || '').trim()
    if (!description || description.length < 3) {
      return sendError(res, requestId, 400, 'INVALID_INPUT', 'task.description is required')
    }
    if (!isMaintenanceRelated(description)) {
      return ok(res, requestId, {
        capability: 'out_of_scope',
        message:
          'I can help explain maintenance tasks and suggest whether contacting a service provider makes sense.',
      })
    }
    if (!hasAiQuotaAvailable(actor)) {
      return sendError(
        res,
        requestId,
        402,
        'AI_CREDIT_EXHAUSTED',
        'AI credit used up. Add credits or upgrade to continue.',
      )
    }

    const insightResult = await runTaskInsightSkill({
      task,
      llmConfig: {
        geminiApiKey,
        model: geminiModel,
        provider: llmProvider,
        vertexProjectId,
        vertexLocation,
        vertexPublisher,
      },
    })
    const modelResult = insightResult.modelResult
    const normalized = insightResult.normalized
    const output = insightResult.output

    console.log(
      JSON.stringify({
        tag: 'task_insight_debug',
        request_id: requestId,
        task_id: task?.id || null,
        description: truncateForLog(description, 240),
        model_status: modelResult?.status ?? null,
        model_ok: modelResult?.ok ?? false,
        model_error_text: modelResult?.error_text || '',
        model_raw_text: truncateForLog(modelResult?.raw_text || '', 2000),
        model_parsed: modelResult?.parsed || null,
        fallback_reason: normalized.fallback_reason,
        final_output: output,
      }),
    )

    await appendAgentEvent({
      eventType: 'agent_task_insight',
      actor,
      requestId,
      metadata: {
        task_id: task?.id || null,
        fallback_reason: normalized.fallback_reason,
        ai_tokens_charged: recordAiUsage({ actor, input: description, output }),
      },
    })

    ok(res, requestId, output)
  })

  route('POST', '/agent/submit', async ({ actor, body, req, res, requestId }) => {
    if (!assertRole({ actor, allowed: ['tt', 'pm_po'], res, requestId })) return
    if (!isAllowedOrigin(req)) {
      return sendError(res, requestId, 403, 'ORIGIN_NOT_ALLOWED', 'Origin is not allowed')
    }
    const rateKey = `agent:submit:${actor?.id || 'anonymous'}`
    if (hitRateLimit({ key: rateKey, limit: agentRateLimitPerMin })) {
      return sendError(res, requestId, 429, 'RATE_LIMITED', 'Too many requests', true)
    }

    const payload = body?.payload || body || {}
    if (!payload?.title || !payload?.description) {
      return sendError(res, requestId, 400, 'INVALID_PAYLOAD', 'title and description are required')
    }
    if (!isMaintenanceRelated(`${payload.title} ${payload.description}`)) {
      return sendError(res, requestId, 400, 'OUT_OF_SCOPE', 'Input is not a maintenance issue')
    }

    const idempotencyKey = String(req.headers['idempotency-key'] || '')
    const task = withIdempotency({
      store,
      key: idempotencyKey,
      resolver: () => store.createTask({ actor, body: payload }),
    })
    try {
      await saveFirestoreTask(task)
      await saveFirestoreMxRecordFromTask({ task, actor })
    } catch {
      // Keep in-memory task if Firestore write fails.
    }

    await appendAgentEvent({
      eventType: 'agent_submit_task',
      actor,
      requestId,
      metadata: { task_id: task?.id || null },
    })

    ok(res, requestId, {
      task_id: task.id,
      status: task.status,
      created_at: task.created_at,
    })
  })

  route('POST', '/tasks', async ({ actor, body, req, res, requestId }) => {
    const idempotencyKey = String(req.headers['idempotency-key'] || '')
    const task = withIdempotency({
      store,
      key: idempotencyKey,
      resolver: () => store.createTask({ actor, body }),
    })
    try {
      await saveFirestoreTask(task)
      await saveFirestoreMxRecordFromTask({ task, actor })
    } catch {
      // Keep in-memory task if Firestore write fails.
    }
    ok(res, requestId, task)
  })

  route('GET', '/tasks/:id', async ({ params, res, requestId }) => {
    const task = (await getFirestoreTaskById(params.id)) || store.tasks.get(params.id)
    if (!task) return sendError(res, requestId, 404, 'TASK_NOT_FOUND', 'Task not found')
    ok(res, requestId, task)
  })

  route('PATCH', '/tasks/:id/status', async ({ actor, params, body, res, requestId }) => {
    const task = (await getFirestoreTaskById(params.id)) || store.tasks.get(params.id)
    if (!task) return sendError(res, requestId, 404, 'TASK_NOT_FOUND', 'Task not found')
    if (task.creator_user_id !== actor.id) {
      return sendError(
        res,
        requestId,
        403,
        'TASK_STATUS_LOCKED',
        'Only task creator can update status.',
        false,
        { gate_status: 'blocked', plan_required: null, upgrade_hint: null },
      )
    }
    task.status = String(body?.status || task.status)
    task.updated_at = new Date().toISOString()

    // Task lifecycle drives lead lifecycle when a linked lead exists.
    const mappedLeadStatus = mapTaskStatusToLeadStatus(task.status)
    const linkedLead = task.lead_id
      ? (await getFirestoreLeadById(task.lead_id)) || store.leads.get(task.lead_id)
      : null
    if (linkedLead) {
      linkedLead.task_status = task.status
      linkedLead.task_updated_at = task.updated_at
      if (mappedLeadStatus) linkedLead.status = mappedLeadStatus
      linkedLead.updated_at = task.updated_at
      try {
        await saveFirestoreLead(normalizeLead(linkedLead))
      } catch {
        // Keep in-memory lead updated even if Firestore write fails.
      }
    }
    try {
      await saveFirestoreTask(task)
      await syncMxRecordStatusFromTask({ task })
    } catch {
      // Keep in-memory task updated if Firestore write fails.
    }

    return ok(res, requestId, { gate_status: 'ok', task })
  })

  route('POST', '/tasks/:id/comments', async ({ actor, params, body, req, res, requestId }) => {
    const task = (await getFirestoreTaskById(params.id)) || store.tasks.get(params.id)
    if (!task) return sendError(res, requestId, 404, 'TASK_NOT_FOUND', 'Task not found')
    const idempotencyKey = String(req.headers['idempotency-key'] || '')
    const comment = withIdempotency({
      store,
      key: idempotencyKey,
      resolver: () => ({
        id: `cmt-${randomUUID()}`,
        task_id: params.id,
        author_id: actor.id,
        body: body?.body || '',
        created_at: new Date().toISOString(),
      }),
    })
    if (!Array.isArray(task.comments)) task.comments = []
    if (!task.comments.some((row) => row.id === comment.id)) task.comments.push(comment)
    task.updated_at = new Date().toISOString()
    try {
      await saveFirestoreTask(task)
    } catch {
      // Keep in-memory task updated if Firestore write fails.
    }
    ok(res, requestId, comment)
  })

  route(
    'POST',
    '/leases/:lease_id/inventories',
    async ({ actor, params, body, res, requestId }) => {
      if (!assertRole({ actor, allowed: ['pm_po'], res, requestId })) return
      const record = store.createInventory({ actor, leaseId: params.lease_id, body })
      ok(res, requestId, record)
    },
  )

  route('GET', '/inventories/:id', async ({ params, res, requestId }) => {
    const inventory = store.inventories.get(params.id)
    if (!inventory)
      return sendError(res, requestId, 404, 'INVENTORY_NOT_FOUND', 'Inventory not found')
    ok(res, requestId, inventory)
  })

  route('PATCH', '/inventories/:id/draft', async ({ actor, params, body, res, requestId }) => {
    const inventory = store.inventories.get(params.id)
    if (!inventory)
      return sendError(res, requestId, 404, 'INVENTORY_NOT_FOUND', 'Inventory not found')
    if (actor.role !== 'tt' || inventory.assigned_tt_id !== actor.id) {
      return sendError(
        res,
        requestId,
        403,
        'PERMISSION_DENIED',
        'Only assigned TT can update draft.',
      )
    }
    inventory.draft = { ...(inventory.draft || {}), ...(body?.draft || {}) }
    inventory.updated_at = new Date().toISOString()
    ok(res, requestId, inventory)
  })

  route('POST', '/inventories/:id/submit', async ({ actor, params, res, requestId }) => {
    const inventory = store.inventories.get(params.id)
    if (!inventory)
      return sendError(res, requestId, 404, 'INVENTORY_NOT_FOUND', 'Inventory not found')
    if (actor.role !== 'tt' || inventory.assigned_tt_id !== actor.id) {
      return sendError(
        res,
        requestId,
        403,
        'PERMISSION_DENIED',
        'Only assigned TT can submit draft.',
      )
    }
    inventory.status = 'submitted'
    inventory.submitted_at = new Date().toISOString()
    inventory.updated_at = new Date().toISOString()
    ok(res, requestId, inventory)
  })

  route('GET', '/tasks/:id/recommended-sps', async ({ params, res, requestId }) => {
    const task = (await getFirestoreTaskById(params.id)) || store.tasks.get(params.id)
    if (!task) {
      return sendError(res, requestId, 404, 'TASK_NOT_FOUND', 'Task not found')
    }
    ok(res, requestId, {
      items: [
        { sp_id: 'sp-101', sp_name: 'FixFast Plumbing', score: 0.93 },
        { sp_id: 'sp-102', sp_name: 'Prime Electric', score: 0.88 },
      ],
    })
  })

  route(
    'POST',
    '/tasks/:id/sp-actions/contact',
    async ({ actor, params, body, res, requestId }) => {
      const task = (await getFirestoreTaskById(params.id)) || store.tasks.get(params.id)
      if (!task) {
        return sendError(res, requestId, 404, 'TASK_NOT_FOUND', 'Task not found')
      }
      ok(res, requestId, {
        task_id: params.id,
        action: 'contact',
        by: actor.id,
        sp_id: body?.sp_id || null,
        result: 'queued',
      })
    },
  )

  route('POST', '/tasks/:id/sp-actions/quote', async ({ actor, params, body, res, requestId }) => {
    const task = (await getFirestoreTaskById(params.id)) || store.tasks.get(params.id)
    if (!task) {
      return sendError(res, requestId, 404, 'TASK_NOT_FOUND', 'Task not found')
    }
    ok(res, requestId, {
      task_id: params.id,
      action: 'quote',
      by: actor.id,
      sp_id: body?.sp_id || null,
      result: 'queued',
    })
  })

  route('POST', '/tasks/:id/assign-sp', async ({ actor, params, body, res, requestId }) => {
    if (!assertRole({ actor, allowed: ['pm_po'], res, requestId })) return
    const task = (await getFirestoreTaskById(params.id)) || store.tasks.get(params.id)
    if (!task) return sendError(res, requestId, 404, 'TASK_NOT_FOUND', 'Task not found')
    task.assigned_sp_id = body?.sp_id || null
    task.updated_at = new Date().toISOString()
    try {
      await saveFirestoreTask(task)
    } catch {
      // Keep in-memory task updated if Firestore write fails.
    }
    ok(res, requestId, { task_id: task.id, assigned_sp_id: task.assigned_sp_id })
  })

  route('POST', '/tasks/:id/select-bid', async ({ actor, params, body, res, requestId }) => {
    if (!assertRole({ actor, allowed: ['pm_po'], res, requestId })) return

    const taskId = String(params.id || '').trim()
    const propertyId = String(body?.property_id || '').trim()
    const bidId = String(body?.bid_id || '').trim()
    const leadId = String(body?.lead_id || '').trim()

    if (!taskId) return sendError(res, requestId, 400, 'TASK_ID_REQUIRED', 'task id is required')
    if (!propertyId)
      return sendError(res, requestId, 400, 'PROPERTY_ID_REQUIRED', 'property_id is required')
    if (!bidId) return sendError(res, requestId, 400, 'BID_ID_REQUIRED', 'bid_id is required')
    if (!(await hasPmAccessToProperty({ actor, propertyId }))) {
      return sendError(
        res,
        requestId,
        403,
        'PERMISSION_DENIED',
        'You do not have permission to manage this property',
      )
    }

    const db = getDb()
    const mxRecordRef = db
      .collection('properties')
      .doc(propertyId)
      .collection('mxrecords')
      .doc(taskId)
    const mxRecordSnap = await mxRecordRef.get()
    if (!mxRecordSnap.exists) {
      return sendError(res, requestId, 404, 'TASK_NOT_FOUND', 'Task record not found')
    }
    const mxRecord = { id: mxRecordSnap.id, ...(mxRecordSnap.data() || {}) }

    const lead =
      (leadId ? await getFirestoreLeadById(leadId) : null) ||
      (await getFirestoreLeadByTaskRef(taskId))
    if (!lead?.id) {
      return sendError(res, requestId, 404, 'LEAD_NOT_FOUND', 'Lead not found for this task')
    }

    const bidsRef = db.collection(LEADS_COLLECTION).doc(lead.id).collection(LEAD_BIDS_SUBCOLLECTION)
    const selectedBidSnap = await bidsRef.doc(bidId).get()
    if (!selectedBidSnap.exists) {
      return sendError(res, requestId, 404, 'BID_NOT_FOUND', 'Selected bid not found')
    }
    const selectedBid = normalizeBid({ id: selectedBidSnap.id, ...(selectedBidSnap.data() || {}) })
    if (!selectedBid?.sp_id) {
      return sendError(res, requestId, 400, 'INVALID_BID', 'Selected bid is missing sp_id')
    }

    const acceptedAt = new Date().toISOString()
    const assignedSp = {
      sp_id: String(selectedBid.sp_id || ''),
      sp_name: String(
        selectedBid.sp_name ||
          selectedBid.sp_business_name ||
          selectedBid.provider_name ||
          body?.sp_name ||
          '',
      ).trim(),
      sp_contact: selectedBid.sp_contact || body?.sp_contact || null,
      sp_rating: selectedBid.sp_rating || selectedBid.sp_rating_avg || body?.sp_rating || null,
      bid_id: selectedBid.bid_id,
      bid_amount: Number(selectedBid.amount || 0),
      assigned_at: acceptedAt,
      assigned_by: String(actor.id || ''),
    }

    const projectId = String(mxRecord.id || taskId)
    const projectPayload = normalizeSpProject({
      project_id: projectId,
      mxrecord_id: taskId,
      property_id: propertyId,
      lead_id: lead.id,
      selected_bid_id: selectedBid.bid_id,
      sp_id: assignedSp.sp_id,
      status: 'active',
      accepted_at: acceptedAt,
      created_at: mxRecord.created_at || acceptedAt,
      updated_at: acceptedAt,
      title: mxRecord.title || mxRecord.task_title || lead.title || 'Untitled Project',
      task_title: mxRecord.title || mxRecord.task_title || lead.title || 'Untitled Project',
      address:
        mxRecord.property_address ||
        mxRecord.property_id?.address ||
        lead.address ||
        lead.property_address_line1 ||
        '',
      location:
        mxRecord.property_address ||
        mxRecord.property_id?.address ||
        lead.address ||
        lead.property_address_line1 ||
        '',
      comments: Array.isArray(mxRecord.comments) ? mxRecord.comments : [],
      phases: mxRecord.phases && typeof mxRecord.phases === 'object' ? mxRecord.phases : {},
    })

    const bidSnap = await bidsRef.get()
    const bidWrites = bidSnap.docs.map((doc) => {
      const isSelected = doc.id === bidId
      const payload = {
        status: isSelected ? 'accepted' : 'submitted',
        updated_at: acceptedAt,
      }
      if (isSelected) {
        payload.accepted_at = acceptedAt
        payload.project_id = projectId
        payload.project_title = projectPayload.title
      }
      return bidsRef.doc(doc.id).set(payload, { merge: true })
    })

    await Promise.all([
      ...bidWrites,
      db.collection(LEADS_COLLECTION).doc(lead.id).set(
        {
          status: 'assigned',
          assigned_sp_id: assignedSp.sp_id,
          assigned_bid_id: selectedBid.bid_id,
          updated_at: acceptedAt,
        },
        { merge: true },
      ),
      mxRecordRef.set(
        {
          assigned_sp: assignedSp,
          assigned_sp_id: assignedSp.sp_id,
          selected_bid_id: selectedBid.bid_id,
          selected_bid_at: acceptedAt,
          updatedAt: acceptedAt,
        },
        { merge: true },
      ),
      saveFirestoreSpProject(projectPayload),
    ])

    return ok(res, requestId, {
      bid: {
        ...selectedBid,
        status: 'accepted',
        accepted_at: acceptedAt,
        project_id: projectId,
        project_title: projectPayload.title,
      },
      project: projectPayload,
      assigned_sp: assignedSp,
      lead: {
        ...lead,
        status: 'assigned',
        assigned_sp_id: assignedSp.sp_id,
        assigned_bid_id: selectedBid.bid_id,
      },
    })
  })

  route('POST', '/sp-cards', async ({ actor, body, res, requestId }) => {
    if (!assertRole({ actor, allowed: ['pm_po'], res, requestId })) return
    const record = store.createSpCard({ actor, body })
    ok(res, requestId, record)
  })

  route('PATCH', '/sp-cards/:id/note', async ({ actor, params, body, res, requestId }) => {
    if (!assertRole({ actor, allowed: ['pm_po'], res, requestId })) return
    const card = store.spCards.get(params.id)
    if (!card) return sendError(res, requestId, 404, 'SP_CARD_NOT_FOUND', 'SP card not found')
    card.owner_note = String(body?.note || '')
    card.updated_at = new Date().toISOString()
    ok(res, requestId, card)
  })

  route('GET', '/sp-cards', async ({ actor, query, res, requestId }) => {
    const ownerId = query.get('owner_id') || actor.id
    const items = [...store.spCards.values()].filter((row) => row.owner_id === ownerId)
    ok(res, requestId, { items })
  })

  // -----------------------------------------------------------------------
  // Lead endpoints
  // -----------------------------------------------------------------------

  route('POST', '/leads/from-task', async ({ actor, body, res, requestId }) => {
    if (!assertRole({ actor, allowed: ['pm_po', 'tt'], res, requestId })) return

    const mxId = String(body?.mx_id || body?.task_id || '').trim()
    const taskDocId = String(body?.task_doc_id || body?.system_task_id || '').trim()
    if (!mxId) return sendError(res, requestId, 400, 'MISSING_MX_ID', 'mx_id is required')

    const existing =
      (await getFirestoreLeadByTaskRef(mxId)) || (await getFirestoreLeadByTaskRef(taskDocId))
    if (existing) {
      const comments = Array.isArray(body?.comments)
        ? body.comments
        : Array.isArray(existing.comments)
          ? existing.comments
          : []
      const imageUrls = Array.isArray(body?.image_urls)
        ? body.image_urls
        : Array.isArray(existing.image_urls)
          ? existing.image_urls
          : Array.isArray(body?.photos)
            ? body.photos
            : Array.isArray(existing.photos)
              ? existing.photos
              : []
      const updated = normalizeLead({
        ...existing,
        property_id: body?.property_id || existing.property_id || null,
        property_name:
          body?.property_name ||
          body?.property_address_line1 ||
          existing.property_name ||
          existing.property_address_line1 ||
          '',
        property_address_line1:
          body?.property_address_line1 || existing.property_address_line1 || '',
        property_address_line2:
          body?.property_address_line2 || existing.property_address_line2 || '',
        property_city:
          body?.property_city || body?.city || existing.property_city || existing.city || '',
        property_state:
          body?.property_state || body?.state || existing.property_state || existing.state || '',
        property_zip:
          body?.property_zip ||
          body?.zip_code ||
          body?.postal_code ||
          body?.zip ||
          existing.property_zip ||
          existing.zip_code ||
          existing.postal_code ||
          existing.zip ||
          '',
        city: body?.city || body?.property_city || existing.city || existing.property_city || '',
        state:
          body?.state || body?.property_state || existing.state || existing.property_state || '',
        zip_code:
          body?.zip_code ||
          body?.property_zip ||
          body?.postal_code ||
          body?.zip ||
          existing.zip_code ||
          existing.property_zip ||
          existing.postal_code ||
          existing.zip ||
          '',
        postal_code:
          body?.postal_code ||
          body?.property_zip ||
          body?.zip_code ||
          body?.zip ||
          existing.postal_code ||
          existing.property_zip ||
          existing.zip_code ||
          existing.zip ||
          '',
        lease_id: body?.lease_id || existing.lease_id || null,
        creator_id: existing.creator_id || actor.id,
        creator_role: existing.creator_role || actor.role,
        title: String(body?.title || existing.title || 'New Task Lead'),
        description: String(body?.description || existing.description || ''),
        scope: String(body?.scope || existing.scope || body?.description || ''),
        location: String(body?.location || existing.location || ''),
        address: String(body?.address || existing.address || ''),
        budget_range: String(body?.budget_range || existing.budget_range || ''),
        urgency: String(body?.urgency || existing.urgency || 'normal'),
        due_date: body?.due_date || existing.due_date || null,
        semantic_tags:
          Array.isArray(body?.semantic_tags) && body.semantic_tags.length
            ? body.semantic_tags
            : existing.semantic_tags ||
              extractSemanticTags(
                `${body?.title || existing.title || ''} ${body?.description || existing.description || ''} ${body?.scope || existing.scope || ''}`,
              ),
        comments,
        comment_count: Number(
          body?.comment_count ?? comments.length ?? existing.comment_count ?? 0,
        ),
        visibility_mode: body?.visibility_mode || existing.visibility_mode || 'public',
        sp_published: true,
        sp_publish_status: 'published',
        sp_published_at: body?.sp_published_at || existing.sp_published_at || now,
        bid_deadline: body?.bid_deadline || existing.bid_deadline || null,
        image_urls: imageUrls,
        photo_count: Number(body?.photo_count ?? imageUrls.length ?? existing.photo_count ?? 0),
        source: existing.source || 'task-bridge',
        task_status: body?.task_status || existing.task_status || null,
        task_updated_at: body?.task_updated_at || existing.task_updated_at || null,
        updated_at: now,
      })
      try {
        await saveFirestoreLead(updated)
      } catch {
        // Continue with in-memory fallback below.
      }
      store.leads.set(updated.id, updated)
      return ok(res, requestId, { lead: updated, created: false, storage: 'firestore' })
    }

    const now = new Date().toISOString()
    const comments = Array.isArray(body?.comments) ? body.comments : []
    const imageUrls = Array.isArray(body?.image_urls)
      ? body.image_urls
      : Array.isArray(body?.photos)
        ? body.photos
        : []
    const leadPayload = {
      id: `lead-${randomUUID()}`,
      mx_id: mxId,
      task_id: mxId,
      task_doc_id: taskDocId || null,
      property_id: body?.property_id || null,
      property_name: body?.property_name || body?.property_address_line1 || '',
      property_address_line1: body?.property_address_line1 || '',
      property_address_line2: body?.property_address_line2 || '',
      property_city: body?.property_city || body?.city || '',
      property_state: body?.property_state || body?.state || '',
      property_zip: body?.property_zip || body?.zip_code || body?.postal_code || body?.zip || '',
      city: body?.city || body?.property_city || '',
      state: body?.state || body?.property_state || '',
      zip_code: body?.zip_code || body?.property_zip || body?.postal_code || body?.zip || '',
      postal_code: body?.postal_code || body?.property_zip || body?.zip_code || body?.zip || '',
      lease_id: body?.lease_id || null,
      creator_id: actor.id,
      creator_role: actor.role,
      title: String(body?.title || 'New Task Lead'),
      description: String(body?.description || ''),
      scope: String(body?.scope || body?.description || ''),
      location: String(body?.location || ''),
      address: String(body?.address || ''),
      budget_range: String(body?.budget_range || ''),
      urgency: String(body?.urgency || 'normal'),
      due_date: body?.due_date || null,
      semantic_tags: extractSemanticTags(
        `${body?.title || ''} ${body?.description || ''} ${body?.scope || ''}`,
      ),
      comments,
      comment_count: Number(body?.comment_count ?? comments.length ?? 0),
      image_urls: imageUrls,
      photo_count: Number(body?.photo_count ?? imageUrls.length ?? 0),
      status: 'open',
      visibility_mode: 'public',
      sp_published: true,
      sp_publish_status: 'published',
      sp_published_at: body?.sp_published_at || now,
      bid_deadline: body?.bid_deadline || null,
      bid_count: 0,
      assigned_sp_id: null,
      assigned_bid_id: null,
      source: 'task-bridge',
      created_at: body?.created_at || now,
      updated_at: now,
    }
    const lead = normalizeLead(leadPayload)

    try {
      const saved = await saveFirestoreLead(lead)
      store.leads.set(saved.id, saved)
      return ok(res, requestId, { lead: saved, created: true, storage: 'firestore' })
    } catch {
      store.leads.set(lead.id, lead)
      return ok(res, requestId, { lead, created: true, storage: 'memory' })
    }
  })

  route('POST', '/leads/sync-task-status', async ({ actor, body, res, requestId }) => {
    if (!assertRole({ actor, allowed: ['pm_po', 'tt'], res, requestId })) return

    const mxId = String(body?.mx_id || body?.task_id || '').trim()
    const taskDocId = String(body?.task_doc_id || body?.system_task_id || '').trim()
    const taskStatus = String(body?.task_status || '').trim()
    if (!mxId || !taskStatus) {
      return sendError(res, requestId, 400, 'MISSING_FIELDS', 'mx_id and task_status are required')
    }

    const now = new Date().toISOString()
    const taskUpdatedAt = body?.task_updated_at || now
    const directLeadStatus = mapTaskStatusToLeadStatus(taskStatus)

    const firestoreLead =
      (await getFirestoreLeadByTaskRef(mxId)) || (await getFirestoreLeadByTaskRef(taskDocId))
    if (firestoreLead) {
      const nextStatus = directLeadStatus || firestoreLead.status || 'open'
      const updated = normalizeLead({
        ...firestoreLead,
        task_status: taskStatus,
        task_updated_at: taskUpdatedAt,
        status: nextStatus,
        updated_at: now,
      })
      try {
        await saveFirestoreLead(updated)
      } catch {
        // Keep returning in-memory updated record if Firestore write fails.
      }
      store.leads.set(updated.id, updated)
      return ok(res, requestId, { lead: updated, updated: true, storage: 'firestore' })
    }

    const memoryLead = findFirst(
      store.leads,
      (lead) =>
        String(lead.mx_id || '') === mxId ||
        String(lead.task_id || '') === mxId ||
        (taskDocId && String(lead.task_doc_id || '') === taskDocId),
    )
    if (!memoryLead) {
      return ok(res, requestId, { updated: false, reason: 'LEAD_NOT_FOUND', mx_id: mxId })
    }

    const nextStatus = directLeadStatus || memoryLead.status || 'open'
    memoryLead.task_status = taskStatus
    memoryLead.task_updated_at = taskUpdatedAt
    memoryLead.status = nextStatus
    memoryLead.updated_at = now
    return ok(res, requestId, { lead: normalizeLead(memoryLead), updated: true, storage: 'memory' })
  })

  route('POST', '/leads', async ({ actor, body, req, res, requestId }) => {
    if (!assertRole({ actor, allowed: ['pm_po'], res, requestId })) return
    const taskId = body?.task_id
    if (!taskId) return sendError(res, requestId, 400, 'MISSING_TASK_ID', 'task_id is required')
    const task = (await getFirestoreTaskById(taskId)) || store.tasks.get(taskId)
    if (!task) return sendError(res, requestId, 404, 'TASK_NOT_FOUND', 'Task not found')
    if (task.creator_user_id !== actor.id) {
      return sendError(
        res,
        requestId,
        403,
        'PERMISSION_DENIED',
        'Only task creator can publish a lead',
      )
    }
    if (task.lead_id) {
      return sendError(
        res,
        requestId,
        409,
        'LEAD_ALREADY_EXISTS',
        'Task already has a lead published',
      )
    }

    const semanticTags = extractSemanticTags(
      `${task.title} ${task.description} ${body?.scope || ''}`,
    )
    const comments = Array.isArray(body?.comments) ? body.comments : []
    const leadBody = {
      ...body,
      semantic_tags: semanticTags,
      comments,
      comment_count: Number(body?.comment_count ?? comments.length ?? 0),
    }

    const idempotencyKey = String(req.headers['idempotency-key'] || '')
    const lead = withIdempotency({
      store,
      key: idempotencyKey,
      resolver: () => store.createLead({ actor, task, body: leadBody }),
    })

    try {
      await saveFirestoreLead(normalizeLead(lead))
    } catch {
      // Keep marketplace operational with in-memory fallback.
    }
    try {
      await saveFirestoreTask(task)
    } catch {
      // Keep in-memory task updated if Firestore write fails.
    }

    const matchedSps = matchLeadToSps(lead, store.spProfiles)
    ok(res, requestId, { lead, matched_sp_count: matchedSps.length })
  })

  route('GET', '/leads', async ({ actor, query, res, requestId }) => {
    const firestoreItems = await listFirestoreLeads({ actor })
    if (firestoreItems.length) {
      return ok(res, requestId, { items: firestoreItems })
    }

    const items = []

    if (actor.role === 'sp') {
      const spProfile = store.spProfiles.get(actor.id)
      if (!spProfile)
        return sendError(res, requestId, 404, 'SP_PROFILE_NOT_FOUND', 'SP profile not found')
      for (const lead of store.leads.values()) {
        if (isSpEligibleForLead(lead, spProfile)) {
          items.push(lead)
        }
      }
    } else if (actor.role === 'pm_po') {
      const creatorFilter = query.get('creator_id') || actor.id
      for (const lead of store.leads.values()) {
        if (lead.creator_id === creatorFilter) items.push(lead)
      }
    } else {
      for (const lead of store.leads.values()) items.push(lead)
    }

    items.sort((a, b) => b.created_at.localeCompare(a.created_at))
    ok(res, requestId, { items: items.map((lead) => normalizeLead(lead)) })
  })

  route('GET', '/leads/:id', async ({ actor, params, res, requestId }) => {
    let lead = await getFirestoreLeadById(params.id)
    if (!lead) lead = store.leads.get(params.id)
    if (!lead) return sendError(res, requestId, 404, 'LEAD_NOT_FOUND', 'Lead not found')

    if (actor.role === 'sp') {
      const spProfile = store.spProfiles.get(actor.id)
      if (!spProfile || !isSpEligibleForLead(lead, spProfile)) {
        return sendError(
          res,
          requestId,
          403,
          'LEAD_NOT_VISIBLE',
          'This lead is not available to you',
        )
      }
    }

    ok(res, requestId, { lead: normalizeLead(lead) })
  })

  route('PATCH', '/leads/:id/status', async ({ actor, params, body, res, requestId }) => {
    if (!assertRole({ actor, allowed: ['pm_po'], res, requestId })) return
    const lead = store.leads.get(params.id)
    if (!lead) return sendError(res, requestId, 404, 'LEAD_NOT_FOUND', 'Lead not found')
    if (lead.creator_id !== actor.id) {
      return sendError(
        res,
        requestId,
        403,
        'PERMISSION_DENIED',
        'Only lead creator can change status',
      )
    }
    const nextStatus = String(body?.status || '')
    const result = transitionLead(lead, nextStatus, actor.id)
    if (!result.ok) return sendError(res, requestId, 400, result.code, result.message)
    ok(res, requestId, { lead: result.lead })
  })

  route('GET', '/leads/:id/matched-sps', async ({ actor, params, res, requestId }) => {
    if (!assertRole({ actor, allowed: ['pm_po'], res, requestId })) return
    const lead = store.leads.get(params.id)
    if (!lead) return sendError(res, requestId, 404, 'LEAD_NOT_FOUND', 'Lead not found')
    const matched = matchLeadToSps(lead, store.spProfiles)
    ok(res, requestId, { items: matched })
  })

  // -----------------------------------------------------------------------
  // Bid endpoints
  // -----------------------------------------------------------------------

  route('POST', '/leads/:id/bids', async ({ actor, params, body, req, res, requestId }) => {
    if (!assertRole({ actor, allowed: ['sp'], res, requestId })) return
    const idempotencyKey = String(req.headers['idempotency-key'] || '')
    const result = withIdempotency({
      store,
      key: idempotencyKey,
      resolver: () => createBidForLead({ actor, leadId: params.id, body }),
    })
    const resolved = await Promise.resolve(result)
    if (!resolved.ok) {
      return sendError(res, requestId, resolved.status || 400, resolved.code, resolved.message)
    }
    ok(res, requestId, {
      bid: normalizeBid(resolved.bid),
      credits_balance: resolved.credits_balance,
      credit_cost: resolved.credit_cost,
    })
  })

  route('GET', '/leads/:id/bids', async ({ actor, params, res, requestId }) => {
    if (!assertRole({ actor, allowed: ['pm_po'], res, requestId })) return
    const found = await getLeadFromAnyStore(params.id)
    const lead = found.lead
    if (!lead) return sendError(res, requestId, 404, 'LEAD_NOT_FOUND', 'Lead not found')
    if (lead.creator_id !== actor.id) {
      return sendError(
        res,
        requestId,
        403,
        'PERMISSION_DENIED',
        'Only lead creator can view all bids',
      )
    }

    let items = []
    if (found.source === 'firestore') {
      items = await listFirestoreLeadBids(params.id)
    } else {
      items = [...store.bids.values()]
        .filter((b) => b.lead_id === params.id)
        .sort((a, b) => b.created_at.localeCompare(a.created_at))
    }

    const enriched = items.map((bid) => {
      const sp = store.spProfiles.get(bid.sp_id)
      return {
        ...bid,
        sp_business_name: sp?.business_name || null,
        sp_rating_avg: sp?.rating_avg || null,
        sp_total_jobs: sp?.total_jobs_completed || 0,
      }
    })

    ok(res, requestId, { items: enriched })
  })

  route('GET', '/bids', async ({ actor, query, res, requestId }) => {
    if (!assertRole({ actor, allowed: ['sp'], res, requestId })) return
    const spId = query.get('sp_id') || actor.id
    if (spId !== actor.id) {
      return sendError(res, requestId, 403, 'PERMISSION_DENIED', 'Can only view your own bids')
    }
    const firestoreItems = await listFirestoreSpBids(spId)
    if (firestoreItems.length) {
      const enriched = await applyAcceptedProjectStateToBids(spId, firestoreItems)
      return ok(res, requestId, { items: enriched })
    }
    const items = [...store.bids.values()]
      .filter((b) => b.sp_id === spId)
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
    const enriched = await applyAcceptedProjectStateToBids(
      spId,
      items.map((row) => normalizeBid(row)),
    )
    ok(res, requestId, { items: enriched })
  })

  // Alias for frontend compatibility: SP bid list
  route('GET', '/sp/bids', async ({ actor, query, res, requestId }) => {
    if (!assertRole({ actor, allowed: ['sp'], res, requestId })) return
    const spId = query.get('sp_id') || actor.id
    if (spId !== actor.id) {
      return sendError(res, requestId, 403, 'PERMISSION_DENIED', 'Can only view your own bids')
    }
    const firestoreItems = await listFirestoreSpBids(spId)
    if (firestoreItems.length) {
      const enriched = await applyAcceptedProjectStateToBids(spId, firestoreItems)
      return ok(res, requestId, { items: enriched })
    }
    const items = [...store.bids.values()]
      .filter((b) => b.sp_id === spId)
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
    const enriched = await applyAcceptedProjectStateToBids(
      spId,
      items.map((row) => normalizeBid(row)),
    )
    ok(res, requestId, { items: enriched })
  })

  route('GET', '/sp/projects', async ({ actor, query, res, requestId }) => {
    if (!assertRole({ actor, allowed: ['sp'], res, requestId })) return
    const spId = query.get('sp_id') || actor.id
    if (spId !== actor.id) {
      return sendError(res, requestId, 403, 'PERMISSION_DENIED', 'Can only view your own projects')
    }
    const items = await listFirestoreAssignedProjectsForSp(spId)
    return ok(res, requestId, { items })
  })

  // Alias for frontend compatibility: SP create bid from lead_id in body
  route('POST', '/sp/bids', async ({ actor, body, req, res, requestId }) => {
    if (!assertRole({ actor, allowed: ['sp'], res, requestId })) return
    const leadId = String(body?.lead_id || '').trim()
    if (!leadId) return sendError(res, requestId, 400, 'MISSING_LEAD_ID', 'lead_id is required')
    const idempotencyKey = String(req.headers['idempotency-key'] || '')
    const result = withIdempotency({
      store,
      key: idempotencyKey,
      resolver: () => createBidForLead({ actor, leadId, body }),
    })
    const resolved = await Promise.resolve(result)
    if (!resolved.ok) {
      return sendError(res, requestId, resolved.status || 400, resolved.code, resolved.message)
    }
    ok(res, requestId, {
      bid: normalizeBid(resolved.bid),
      credits_balance: resolved.credits_balance,
      credit_cost: resolved.credit_cost,
    })
  })

  route('PATCH', '/bids/:id/withdraw', async ({ actor, params, res, requestId }) => {
    if (!assertRole({ actor, allowed: ['sp'], res, requestId })) return
    const bid = store.bids.get(params.id)
    if (!bid) return sendError(res, requestId, 404, 'BID_NOT_FOUND', 'Bid not found')
    if (bid.sp_id !== actor.id) {
      return sendError(res, requestId, 403, 'PERMISSION_DENIED', 'Only bid owner can withdraw')
    }
    const result = transitionBid(bid, 'withdrawn', actor.id)
    if (!result.ok) return sendError(res, requestId, 400, result.code, result.message)

    const lead = store.leads.get(bid.lead_id)
    if (lead) {
      lead.bid_count = Math.max(0, (lead.bid_count || 1) - 1)
      lead.updated_at = new Date().toISOString()
    }

    ok(res, requestId, { bid: result.bid })
  })

  route('PATCH', '/bids/:id/shortlist', async ({ actor, params, res, requestId }) => {
    if (!assertRole({ actor, allowed: ['pm_po'], res, requestId })) return
    const bid = store.bids.get(params.id)
    if (!bid) return sendError(res, requestId, 404, 'BID_NOT_FOUND', 'Bid not found')
    const lead = store.leads.get(bid.lead_id)
    if (!lead || lead.creator_id !== actor.id) {
      return sendError(
        res,
        requestId,
        403,
        'PERMISSION_DENIED',
        'Only lead creator can shortlist bids',
      )
    }
    const result = transitionBid(bid, 'shortlisted', actor.id)
    if (!result.ok) return sendError(res, requestId, 400, result.code, result.message)
    ok(res, requestId, { bid: result.bid })
  })

  route('POST', '/bids/:id/select', async ({ actor, params, res, requestId }) => {
    if (!assertRole({ actor, allowed: ['pm_po'], res, requestId })) return
    const bid = store.bids.get(params.id)
    if (!bid) return sendError(res, requestId, 404, 'BID_NOT_FOUND', 'Bid not found')
    const lead = store.leads.get(bid.lead_id)
    if (!lead) return sendError(res, requestId, 404, 'LEAD_NOT_FOUND', 'Lead not found')
    if (lead.creator_id !== actor.id) {
      return sendError(
        res,
        requestId,
        403,
        'PERMISSION_DENIED',
        'Only lead creator can select a bid',
      )
    }

    const result = selectBidAndAssign({ store, lead, winningBid: bid, actorId: actor.id })
    if (!result.ok) return sendError(res, requestId, 400, result.code, result.message)

    ok(res, requestId, {
      bid: result.bid,
      lead: result.lead,
      assignment: result.assignment,
    })
  })

  // -----------------------------------------------------------------------
  // Conversation & messaging endpoints
  // -----------------------------------------------------------------------

  route('POST', '/conversations', async ({ actor, body, res, requestId }) => {
    if (!assertRole({ actor, allowed: ['pm_po'], res, requestId })) return
    const leadId = body?.lead_id
    const spId = body?.sp_id
    if (!leadId || !spId) {
      return sendError(res, requestId, 400, 'MISSING_FIELDS', 'lead_id and sp_id are required')
    }
    const lead = store.leads.get(leadId)
    if (!lead) return sendError(res, requestId, 404, 'LEAD_NOT_FOUND', 'Lead not found')
    if (lead.creator_id !== actor.id) {
      return sendError(
        res,
        requestId,
        403,
        'PERMISSION_DENIED',
        'Only lead creator can start conversations',
      )
    }

    const existing = findFirst(
      store.conversations,
      (c) => c.lead_id === leadId && c.pm_id === actor.id && c.sp_id === spId,
    )
    if (existing) {
      return ok(res, requestId, { conversation: existing, created: false })
    }

    const conversation = store.createConversation({ actor, lead, spId })
    ok(res, requestId, { conversation, created: true })
  })

  route('GET', '/conversations', async ({ actor, query, res, requestId }) => {
    const leadId = query.get('lead_id')
    const items = [...store.conversations.values()].filter((c) => {
      if (!c.participants.includes(actor.id)) return false
      if (leadId && c.lead_id !== leadId) return false
      return true
    })
    items.sort((a, b) =>
      (b.last_message_at || b.created_at).localeCompare(a.last_message_at || a.created_at),
    )

    const enriched = items.map((conv) => {
      const sp = store.spProfiles.get(conv.sp_id)
      const pmUser = store.users.get(conv.pm_id)
      return {
        ...conv,
        sp_business_name: sp?.business_name || null,
        pm_display: pmUser?.id || null,
      }
    })

    ok(res, requestId, { items: enriched })
  })

  route('POST', '/conversations/:id/messages', async ({ actor, params, body, res, requestId }) => {
    const conversation = store.conversations.get(params.id)
    if (!conversation)
      return sendError(res, requestId, 404, 'CONVERSATION_NOT_FOUND', 'Conversation not found')
    if (!conversation.participants.includes(actor.id)) {
      return sendError(
        res,
        requestId,
        403,
        'PERMISSION_DENIED',
        'Not a participant in this conversation',
      )
    }
    if (conversation.status !== 'active') {
      return sendError(res, requestId, 400, 'CONVERSATION_ARCHIVED', 'Conversation is archived')
    }
    if (!body?.body && body?.message_type !== 'system') {
      return sendError(res, requestId, 400, 'EMPTY_MESSAGE', 'Message body is required')
    }

    const message = store.createMessage({ actor, conversation, body })
    ok(res, requestId, { message })
  })

  route('GET', '/conversations/:id/messages', async ({ actor, params, res, requestId }) => {
    const conversation = store.conversations.get(params.id)
    if (!conversation)
      return sendError(res, requestId, 404, 'CONVERSATION_NOT_FOUND', 'Conversation not found')
    if (!conversation.participants.includes(actor.id)) {
      return sendError(
        res,
        requestId,
        403,
        'PERMISSION_DENIED',
        'Not a participant in this conversation',
      )
    }

    const allMessages = store.messages.get(conversation.id) || []
    const isPm = actor.id === conversation.pm_id

    const visible = allMessages.filter((msg) => {
      if (msg.visibility === 'all') return true
      if (msg.visibility === 'pm_only' && isPm) return true
      return false
    })

    ok(res, requestId, { items: visible })
  })

  // -----------------------------------------------------------------------
  // Assignment endpoints
  // -----------------------------------------------------------------------

  route('GET', '/assignments', async ({ actor, res, requestId }) => {
    const items = [...store.assignments.values()].filter((a) => {
      if (actor.role === 'sp') return a.sp_id === actor.id
      if (actor.role === 'pm_po') return a.pm_id === actor.id
      return false
    })
    items.sort((a, b) => b.created_at.localeCompare(a.created_at))
    ok(res, requestId, { items })
  })

  route('POST', '/assignments/:id/accept', async ({ actor, params, res, requestId }) => {
    if (!assertRole({ actor, allowed: ['sp'], res, requestId })) return
    const assignment = store.assignments.get(params.id)
    if (!assignment)
      return sendError(res, requestId, 404, 'ASSIGNMENT_NOT_FOUND', 'Assignment not found')
    if (assignment.sp_id !== actor.id) {
      return sendError(res, requestId, 403, 'PERMISSION_DENIED', 'Only assigned SP can accept')
    }
    const result = transitionAssignment(assignment, 'active')
    if (!result.ok) return sendError(res, requestId, 400, result.code, result.message)
    ok(res, requestId, { assignment: result.assignment })
  })

  route('POST', '/assignments/:id/decline', async ({ actor, params, res, requestId }) => {
    if (!assertRole({ actor, allowed: ['sp'], res, requestId })) return
    const assignment = store.assignments.get(params.id)
    if (!assignment)
      return sendError(res, requestId, 404, 'ASSIGNMENT_NOT_FOUND', 'Assignment not found')
    if (assignment.sp_id !== actor.id) {
      return sendError(res, requestId, 403, 'PERMISSION_DENIED', 'Only assigned SP can decline')
    }
    const result = transitionAssignment(assignment, 'declined')
    if (!result.ok) return sendError(res, requestId, 400, result.code, result.message)

    // Re-open the lead so PM/PO can select another SP
    const lead = store.leads.get(assignment.lead_id)
    if (lead && lead.status === 'assigned') {
      lead.status = 'open'
      lead.assigned_sp_id = null
      lead.assigned_bid_id = null
      lead.updated_at = new Date().toISOString()
    }

    ok(res, requestId, { assignment: result.assignment })
  })

  route('POST', '/assignments/:id/revoke', async ({ actor, params, res, requestId }) => {
    if (!assertRole({ actor, allowed: ['pm_po'], res, requestId })) return
    const assignment = store.assignments.get(params.id)
    if (!assignment)
      return sendError(res, requestId, 404, 'ASSIGNMENT_NOT_FOUND', 'Assignment not found')
    if (assignment.pm_id !== actor.id) {
      return sendError(
        res,
        requestId,
        403,
        'PERMISSION_DENIED',
        'Only the PM/PO who created this lead can revoke',
      )
    }
    const result = transitionAssignment(assignment, 'revoked')
    if (!result.ok) return sendError(res, requestId, 400, result.code, result.message)

    const lead = store.leads.get(assignment.lead_id)
    if (lead && lead.status === 'assigned') {
      lead.status = 'open'
      lead.assigned_sp_id = null
      lead.assigned_bid_id = null
      lead.updated_at = new Date().toISOString()
    }

    ok(res, requestId, { assignment: result.assignment })
  })

  route('POST', '/assignments/:id/complete', async ({ actor, params, res, requestId }) => {
    if (!assertRole({ actor, allowed: ['pm_po'], res, requestId })) return
    const assignment = store.assignments.get(params.id)
    if (!assignment)
      return sendError(res, requestId, 404, 'ASSIGNMENT_NOT_FOUND', 'Assignment not found')
    if (assignment.pm_id !== actor.id) {
      return sendError(
        res,
        requestId,
        403,
        'PERMISSION_DENIED',
        'Only the lead PM/PO can mark complete',
      )
    }
    const result = transitionAssignment(assignment, 'completed')
    if (!result.ok) return sendError(res, requestId, 400, result.code, result.message)

    const lead = store.leads.get(assignment.lead_id)
    if (lead) transitionLead(lead, 'closed', actor.id)

    ok(res, requestId, { assignment: result.assignment })
  })

  // -----------------------------------------------------------------------
  // SP profile endpoints
  // -----------------------------------------------------------------------

  route('GET', '/sp/services/profile', async ({ actor, query, res, requestId }) => {
    const requestedSpId = String(query.get('sp_id') || actor.id || '').trim()
    if (!requestedSpId) {
      return sendError(res, requestId, 400, 'MISSING_SP_ID', 'sp_id is required')
    }
    if (actor.role === 'sp' && actor.id !== requestedSpId) {
      return sendError(
        res,
        requestId,
        403,
        'PERMISSION_DENIED',
        'Can only read your own service profile',
      )
    }

    try {
      const db = getDb()
      const doc = await db.collection('users').doc(requestedSpId).get()
      const userData = doc.exists ? doc.data() || {} : {}
      const nested = userData?.sp_service_profile || null
      if (!nested) {
        return ok(res, requestId, {
          item: {
            sp_id: requestedSpId,
            service_descriptions: [],
            service_zip_codes: [],
            service_area_shape: null,
            service_map_view: null,
          },
        })
      }
      return ok(res, requestId, { item: { sp_id: requestedSpId, ...nested } })
    } catch {
      return sendError(
        res,
        requestId,
        500,
        'SP_SERVICE_PROFILE_READ_FAILED',
        'Failed to read service profile from Firestore.',
        true,
      )
    }
  })

  route('PUT', '/sp/services/profile', async ({ actor, body, res, requestId }) => {
    const requestedSpId = String(body?.sp_id || actor.id || '').trim()
    if (!requestedSpId) {
      return sendError(res, requestId, 400, 'MISSING_SP_ID', 'sp_id is required')
    }
    if (actor.role === 'sp' && actor.id !== requestedSpId) {
      return sendError(
        res,
        requestId,
        403,
        'PERMISSION_DENIED',
        'Can only update your own service profile',
      )
    }

    const descriptions = Array.isArray(body?.service_descriptions)
      ? body.service_descriptions
          .map((item) =>
            String(item || '')
              .trim()
              .replace(/\s+/g, ' '),
          )
          .filter((item) => item.length > 0)
      : []

    const zipCodes = Array.isArray(body?.service_zip_codes)
      ? [...new Set(body.service_zip_codes.map((zip) => String(zip || '').trim()))].filter((zip) =>
          /^\d{5}$/.test(zip),
        )
      : []

    const payload = {
      sp_id: requestedSpId,
      service_descriptions: descriptions,
      service_zip_codes: zipCodes,
      service_area_shape: body?.service_area_shape || null,
      service_map_view: body?.service_map_view || null,
      updated_at: new Date().toISOString(),
    }

    try {
      const db = getDb()
      const ref = db.collection('users').doc(requestedSpId)
      const existing = await ref.get()
      const existingProfile = existing.exists ? existing.data()?.sp_service_profile : null
      payload.created_at = existingProfile?.created_at || new Date().toISOString()
      await ref.set({ sp_service_profile: payload }, { merge: true })
      return ok(res, requestId, payload)
    } catch {
      return sendError(
        res,
        requestId,
        500,
        'SP_SERVICE_PROFILE_WRITE_FAILED',
        'Failed to write service profile to Firestore.',
        true,
      )
    }
  })

  route('GET', '/sp/profile', async ({ actor, res, requestId }) => {
    if (!assertRole({ actor, allowed: ['sp'], res, requestId })) return
    const profile = store.spProfiles.get(actor.id)
    if (!profile)
      return sendError(res, requestId, 404, 'SP_PROFILE_NOT_FOUND', 'SP profile not found')
    ok(res, requestId, { profile })
  })

  route('PATCH', '/sp/profile', async ({ actor, body, res, requestId }) => {
    if (!assertRole({ actor, allowed: ['sp'], res, requestId })) return
    let profile = store.spProfiles.get(actor.id)
    if (!profile) {
      return sendError(
        res,
        requestId,
        404,
        'SP_PROFILE_NOT_FOUND',
        'SP profile not found. Complete signup first.',
      )
    }

    const updatableFields = [
      'business_name',
      'service_categories',
      'service_area',
      'service_area_radius_km',
      'license_number',
      'budget_band',
      'urgency_capability',
    ]
    for (const field of updatableFields) {
      if (body?.[field] !== undefined) profile[field] = body[field]
    }
    if (body?.match_preferences) {
      profile.match_preferences = { ...profile.match_preferences, ...body.match_preferences }
    }

    // Re-extract semantic tags when description-relevant fields change
    const descText = `${profile.business_name} ${(profile.service_categories || []).join(' ')}`
    profile.semantic_tags = extractSemanticTags(descText)
    profile.updated_at = new Date().toISOString()

    ok(res, requestId, { profile })
  })

  // -----------------------------------------------------------------------
  // Existing invoice endpoints (unchanged)
  // -----------------------------------------------------------------------

  route('POST', '/invoices', async ({ actor, body, req, res, requestId }) => {
    if (!assertRole({ actor, allowed: ['sp'], res, requestId })) return
    const idempotencyKey = String(req.headers['idempotency-key'] || '')
    const invoice = withIdempotency({
      store,
      key: idempotencyKey,
      resolver: () => store.createInvoice({ actor, body }),
    })
    ok(res, requestId, invoice)
  })

  route('POST', '/invoices/:id/submit', async ({ actor, params, res, requestId }) => {
    if (!assertRole({ actor, allowed: ['sp'], res, requestId })) return
    const invoice = store.invoices.get(params.id)
    if (!invoice) return sendError(res, requestId, 404, 'INVOICE_NOT_FOUND', 'Invoice not found')
    if (invoice.created_by !== actor.id) {
      return sendError(
        res,
        requestId,
        403,
        'PERMISSION_DENIED',
        'Only owner SP can submit invoice.',
      )
    }
    invoice.status = 'submitted'
    invoice.updated_at = new Date().toISOString()
    ok(res, requestId, invoice)
  })

  route('POST', '/invoices/:id/review', async ({ actor, params, body, res, requestId }) => {
    if (!assertRole({ actor, allowed: ['pm_po'], res, requestId })) return
    const invoice = store.invoices.get(params.id)
    if (!invoice) return sendError(res, requestId, 404, 'INVOICE_NOT_FOUND', 'Invoice not found')
    const nextStatus = String(body?.status || '')
    if (!['changes_requested', 'approved', 'rejected'].includes(nextStatus)) {
      return sendError(
        res,
        requestId,
        400,
        'INVALID_REVIEW_STATUS',
        'Invalid invoice review status.',
      )
    }
    invoice.status = nextStatus
    invoice.review_note = body?.note || null
    invoice.updated_at = new Date().toISOString()
    ok(res, requestId, invoice)
  })

  route('GET', '/tasks/:id/invoices', async ({ params, res, requestId }) => {
    const task = (await getFirestoreTaskById(params.id)) || store.tasks.get(params.id)
    if (!task) {
      return sendError(res, requestId, 404, 'TASK_NOT_FOUND', 'Task not found')
    }
    const items = [...store.invoices.values()].filter((invoice) => invoice.task_id === params.id)
    ok(res, requestId, { items })
  })

  route(
    'POST',
    '/storage/upload-reservations',
    async ({ actor, verified, body, res, requestId }) => {
      try {
        requireVerifiedActor({ actor, verified })
        if (!assertRole({ actor, allowed: ['pm_po', 'admin'], res, requestId })) return
        const storagePath = String(body?.storage_path || '').replace(/^\/+/, '')
        const sizeBytes = Number(body?.size_bytes || 0)
        const contentType = String(body?.content_type || 'application/octet-stream')
        if (
          !storagePath ||
          !Number.isFinite(sizeBytes) ||
          sizeBytes <= 0 ||
          sizeBytes > 25 * 1024 * 1024
        ) {
          throw createApiError(
            400,
            'INVALID_UPLOAD',
            'A storage path and file up to 25 MB are required.',
          )
        }
        const propertyId = await getPmUploadPropertyId(storagePath)
        if (!propertyId)
          throw createApiError(
            400,
            'INVALID_STORAGE_PATH',
            'Uploads must target a property or lease path.',
          )
        await assertPmPropertyAccess({ actor, propertyId })
        const sizeMb = sizeBytes / (1024 * 1024)
        if (
          Number(actor.billing.storage_used_mb || 0) + sizeMb >
          Number(actor.billing.storage_limit_mb || 0)
        ) {
          return sendError(
            res,
            requestId,
            402,
            'STORAGE_CREDIT_EXHAUSTED',
            'Storage limit reached. Delete files or upgrade to continue.',
          )
        }
        const id = `upload-${randomUUID()}`
        const downloadToken = randomUUID()
        const bucket = getStorageBucket()
        const file = bucket.file(storagePath)
        const [uploadUrl] = await file.getSignedUrl({
          version: 'v4',
          action: 'write',
          expires: Date.now() + 10 * 60 * 1000,
          contentType,
          extensionHeaders: { 'x-goog-meta-firebaseStorageDownloadTokens': downloadToken },
        })
        const reservation = {
          id,
          user_id: actor.id,
          property_id: propertyId,
          storage_path: storagePath,
          size_bytes: sizeBytes,
          content_type: contentType,
          download_token: downloadToken,
          status: 'reserved',
          expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
          created_at: new Date().toISOString(),
        }
        await getDb().collection(STORAGE_UPLOAD_RESERVATIONS_COLLECTION).doc(id).set(reservation)
        return ok(res, requestId, {
          reservation_id: id,
          upload_url: uploadUrl,
          download_token: downloadToken,
        })
      } catch (error) {
        return sendError(
          res,
          requestId,
          error?.status || 500,
          error?.code || 'UPLOAD_RESERVATION_FAILED',
          error?.message || 'Unable to reserve upload.',
        )
      }
    },
  )

  route(
    'POST',
    '/storage/upload-reservations/:id/commit',
    async ({ actor, verified, params, res, requestId }) => {
      try {
        requireVerifiedActor({ actor, verified })
        const ref = getDb().collection(STORAGE_UPLOAD_RESERVATIONS_COLLECTION).doc(params.id)
        const snap = await ref.get()
        if (!snap.exists)
          throw createApiError(404, 'UPLOAD_RESERVATION_NOT_FOUND', 'Upload reservation not found.')
        const reservation = snap.data() || {}
        if (reservation.user_id !== actor.id)
          throw createApiError(403, 'UPLOAD_RESERVATION_INVALID', 'Upload reservation is not available.')
        await assertPmPropertyAccess({ actor, propertyId: reservation.property_id })
        const committedResponse = (row) => ({
          storage_path: row.storage_path,
          size_bytes: row.actual_size_bytes,
          url: getPersistentStorageUrl({
            bucketName: getStorageBucket().name,
            storagePath: row.storage_path,
            downloadToken: row.download_token,
          }),
        })
        if (reservation.status === 'committed') return ok(res, requestId, committedResponse(reservation))
        if (
          reservation.status !== 'reserved' ||
          Date.parse(reservation.expires_at) < Date.now()
        )
          throw createApiError(
            403,
            'UPLOAD_RESERVATION_INVALID',
            'Upload reservation is no longer valid.',
          )
        const [metadata] = await getStorageBucket().file(reservation.storage_path).getMetadata()
        const sizeBytes = Number(metadata?.size || 0)
        if (!sizeBytes || sizeBytes > Number(reservation.size_bytes || 0))
          throw createApiError(
            400,
            'UPLOAD_SIZE_MISMATCH',
            'Uploaded file exceeds its reserved size.',
          )
        const sizeMb = sizeBytes / (1024 * 1024)
        if (
          Number(actor.billing.storage_used_mb || 0) + sizeMb >
          Number(actor.billing.storage_limit_mb || 0)
        )
          throw createApiError(402, 'STORAGE_CREDIT_EXHAUSTED', 'Storage limit reached.')
        // A lost commit response must not charge or commit the same reservation twice.
        const commit = await getDb().runTransaction(async (tx) => {
          const current = await tx.get(ref)
          const row = current.exists ? current.data() : null
          if (!row || row.user_id !== actor.id)
            throw createApiError(403, 'UPLOAD_RESERVATION_INVALID', 'Upload reservation is not available.')
          if (row.status === 'committed') return { row, fresh: false }
          if (row.status !== 'reserved' || Date.parse(row.expires_at) < Date.now())
            throw createApiError(403, 'UPLOAD_RESERVATION_INVALID', 'Upload reservation is no longer valid.')
          const changes = {
            status: 'committed',
            committed_at: new Date().toISOString(),
            actual_size_bytes: sizeBytes,
          }
          tx.set(ref, changes, { merge: true })
          return { row: { ...row, ...changes }, fresh: true }
        })
        if (commit.fresh) {
          actor.billing.storage_used_mb = Number(actor.billing.storage_used_mb || 0) + sizeMb
          actor.billing.history.push({
            id: `hist-${params.id}`, type: 'storage_usage', size_bytes: sizeBytes,
            storage_path: reservation.storage_path, created_at: commit.row.committed_at,
          })
        }
        return ok(res, requestId, committedResponse(commit.row))
      } catch (error) {
        return sendError(
          res,
          requestId,
          error?.status || 500,
          error?.code || 'UPLOAD_COMMIT_FAILED',
          error?.message || 'Unable to commit upload.',
        )
      }
    },
  )

  route('GET', '/billing/profile-summary', async ({ actor, res, requestId }) => {
    const aiStatus = getQuotaStatus(actor.billing.ai_tokens_used, actor.billing.ai_tokens_limit)
    const storageStatus = getQuotaStatus(
      actor.billing.storage_used_mb,
      actor.billing.storage_limit_mb,
    )
    ok(res, requestId, {
      plan_name: actor.billing.plan_name,
      subscription_status: actor.billing.subscription_status,
      next_renewal_date: actor.billing.next_renewal_date,
      gate_status: [aiStatus, storageStatus].includes('blocked') ? 'blocked' : 'ok',
    })
  })

  route('GET', '/billing/usage', async ({ actor, res, requestId }) => {
    const aiTokensUsed = Number(actor.billing.ai_tokens_used || 0)
    const aiTokensLimit = Number(actor.billing.ai_tokens_limit || 0)
    const storageUsedMb = Number(actor.billing.storage_used_mb || 0)
    const storageLimitMb = Number(actor.billing.storage_limit_mb || 0)
    const aiStatus = getQuotaStatus(aiTokensUsed, aiTokensLimit)
    const storageStatus = getQuotaStatus(storageUsedMb, storageLimitMb)
    ok(res, requestId, {
      properties_used: actor.billing.properties_used,
      properties_limit: actor.billing.properties_limit,
      ai_tokens_used: aiTokensUsed,
      ai_tokens_limit: aiTokensLimit,
      ai_tokens_status: aiStatus,
      ai_tokens_message: getQuotaGateMessage(aiStatus, 'AI token'),
      voice_used: actor.billing.voice_used,
      voice_limit: actor.billing.voice_limit,
      storage_used_mb: storageUsedMb,
      storage_limit_mb: storageLimitMb,
      storage_status: storageStatus,
      storage_message: getQuotaGateMessage(storageStatus, 'Storage'),
      gate_status: [aiStatus, storageStatus].includes('blocked') ? 'blocked' : 'ok',
    })
  })

  route('GET', '/billing/credits', async ({ actor, res, requestId }) => {
    ok(res, requestId, { balance: actor.billing.credits })
  })

  route('POST', '/billing/upgrade', async ({ actor, body, res, requestId }) => {
    actor.billing.plan_name = body?.plan_name || 'pro'
    actor.billing.properties_limit = actor.billing.plan_name === 'pro' ? 50 : 3
    actor.billing.ai_tokens_limit = actor.billing.plan_name === 'pro' ? 5000 : 500
    actor.billing.voice_limit = actor.billing.plan_name === 'pro' ? 500 : 0
    actor.billing.storage_limit_mb = actor.billing.plan_name === 'pro' ? 5120 : 512
    actor.billing.history.push({
      id: `hist-${randomUUID()}`,
      type: 'upgrade',
      amount: Number(body?.amount || 0),
      created_at: new Date().toISOString(),
    })
    ok(res, requestId, { gate_status: 'ok', plan_name: actor.billing.plan_name })
  })

  route('POST', '/billing/addon/purchase', async ({ actor, body, res, requestId }) => {
    const credits = Number(body?.credits || 0)
    actor.billing.credits += credits
    actor.billing.history.push({
      id: `hist-${randomUUID()}`,
      type: 'addon_purchase',
      credits,
      amount: Number(body?.amount || 0),
      created_at: new Date().toISOString(),
    })
    ok(res, requestId, { gate_status: 'ok', credits_balance: actor.billing.credits })
  })

  route('GET', '/billing/history', async ({ actor, res, requestId }) => {
    ok(res, requestId, { items: actor.billing.history })
  })

  route('GET', '/sp/credits/skus', async ({ actor, res, requestId }) => {
    if (!assertRole({ actor, allowed: ['sp'], res, requestId })) return
    return ok(res, requestId, { items: listSpBidCreditSkus() })
  })

  route('GET', '/sp/credits/summary', async ({ actor, res, requestId }) => {
    if (!assertRole({ actor, allowed: ['sp'], res, requestId })) return

    const firestoreAccount = await ensureFirestoreSpCreditAccount(actor.id)
    if (firestoreAccount) {
      return ok(res, requestId, {
        sp_id: actor.id,
        balance: toNumber(firestoreAccount.balance, 0),
        lifetime_purchased: toNumber(firestoreAccount.lifetime_purchased, 0),
        lifetime_used: toNumber(firestoreAccount.lifetime_used, 0),
        lifetime_refunded: toNumber(firestoreAccount.lifetime_refunded, 0),
        lifetime_granted: toNumber(firestoreAccount.lifetime_granted, 0),
        skus: listSpBidCreditSkus(),
        storage: 'firestore',
      })
    }

    const account = ensureSpCreditAccountMemory(actor.id)
    return ok(res, requestId, {
      sp_id: actor.id,
      balance: toNumber(account.balance, 0),
      lifetime_purchased: toNumber(account.lifetime_purchased, 0),
      lifetime_used: toNumber(account.lifetime_used, 0),
      lifetime_refunded: toNumber(account.lifetime_refunded, 0),
      lifetime_granted: toNumber(account.lifetime_granted, 0),
      skus: listSpBidCreditSkus(),
      storage: 'memory',
    })
  })

  route('GET', '/sp/credits/history', async ({ actor, query, res, requestId }) => {
    if (!assertRole({ actor, allowed: ['sp'], res, requestId })) return
    const limit = Number(query.get('limit') || 100)

    const firestoreAccount = await ensureFirestoreSpCreditAccount(actor.id)
    if (firestoreAccount) {
      const firestoreLedger = await listFirestoreSpCreditLedger(actor.id, limit)
      const firestoreOrders = await listFirestoreSpCreditOrders(actor.id, limit)
      if (firestoreLedger.length || firestoreOrders.length) {
        return ok(res, requestId, {
          items: firestoreLedger,
          orders: firestoreOrders,
          storage: 'firestore',
        })
      }
    }

    const ledger = [...(store.spCreditLedger?.values?.() || [])]
      .filter((row) => row.sp_id === actor.id)
      .sort((a, b) => String(b.created_at || '').localeCompare(String(a.created_at || '')))
      .slice(0, Math.max(1, Math.min(limit || 100, 200)))
    const orders = [...(store.spCreditOrders?.values?.() || [])]
      .filter((row) => row.sp_id === actor.id)
      .sort((a, b) => String(b.created_at || '').localeCompare(String(a.created_at || '')))
      .slice(0, Math.max(1, Math.min(limit || 100, 200)))
    return ok(res, requestId, { items: ledger, orders, storage: 'memory' })
  })

  route('POST', '/sp/credits/orders', async ({ actor, body, req, res, requestId }) => {
    if (!assertRole({ actor, allowed: ['sp'], res, requestId })) return
    const idempotencyKey = String(req.headers['idempotency-key'] || '')
    const now = new Date().toISOString()

    const createOrder = async () => {
      const order = buildSpCreditOrderFromSku({ actor, body, now })

      try {
        const db = getDb()
        await db.collection(SP_CREDIT_ORDERS_COLLECTION).doc(order.id).set(order, { merge: true })
        return { ...order, storage: 'firestore' }
      } catch {
        if (!store.spCreditOrders) store.spCreditOrders = new Map()
        store.spCreditOrders.set(order.id, order)
        return { ...order, storage: 'memory' }
      }
    }

    const result = await Promise.resolve(
      withIdempotency({
        store,
        key: idempotencyKey,
        resolver: () => createOrder(),
      }),
    )

    return ok(res, requestId, {
      order: result,
      skus: listSpBidCreditSkus(),
      checkout_hint:
        'Create a Checkout Session for this order before redirecting the SP to Stripe.',
    })
  })

  route(
    'POST',
    '/sp/credits/orders/:orderId/checkout-session',
    async ({ actor, params, body, res, requestId }) => {
      if (!assertRole({ actor, allowed: ['sp'], res, requestId })) return
      const orderId = String(params.orderId || '').trim()
      const now = new Date().toISOString()

      try {
        const db = getDb()
        const orderRef = db.collection(SP_CREDIT_ORDERS_COLLECTION).doc(orderId)
        const orderSnap = await orderRef.get()
        if (!orderSnap.exists) {
          return sendError(res, requestId, 404, 'ORDER_NOT_FOUND', 'Credit order not found')
        }
        const order = { id: orderSnap.id, ...(orderSnap.data() || {}) }
        if (String(order.sp_id || '') !== actor.id) {
          return sendError(
            res,
            requestId,
            403,
            'ORDER_FORBIDDEN',
            'Credit order does not belong to this SP',
          )
        }
        const status = normalizeCreditOrderStatus(order.status)
        if (!['created', 'checkout_created'].includes(status)) {
          return sendError(
            res,
            requestId,
            409,
            'ORDER_NOT_CHECKOUTABLE',
            'Order is not eligible for checkout',
          )
        }
        const session = await createStripeCheckoutSession({ order, body, now })
        await orderRef.set(
          {
            status: 'checkout_created',
            provider: 'stripe',
            provider_checkout_session_id: order.provider_checkout_session_id || session.id,
            updated_at: now,
          },
          { merge: true },
        )
        return ok(res, requestId, {
          order_id: order.id,
          checkout_session: session,
          storage: 'firestore',
        })
      } catch (error) {
        if (error?.code && error?.status) {
          return sendError(res, requestId, error.status, error.code, error.message)
        }
        if (!store.spCreditOrders) store.spCreditOrders = new Map()
        const order = store.spCreditOrders.get(orderId)
        if (!order)
          return sendError(res, requestId, 404, 'ORDER_NOT_FOUND', 'Credit order not found')
        if (String(order.sp_id || '') !== actor.id) {
          return sendError(
            res,
            requestId,
            403,
            'ORDER_FORBIDDEN',
            'Credit order does not belong to this SP',
          )
        }
        const status = normalizeCreditOrderStatus(order.status)
        if (!['created', 'checkout_created'].includes(status)) {
          return sendError(
            res,
            requestId,
            409,
            'ORDER_NOT_CHECKOUTABLE',
            'Order is not eligible for checkout',
          )
        }
        const session = await createStripeCheckoutSession({ order, body, now })
        order.status = 'checkout_created'
        order.provider = 'stripe'
        order.provider_checkout_session_id = order.provider_checkout_session_id || session.id
        order.updated_at = now
        return ok(res, requestId, {
          order_id: order.id,
          checkout_session: session,
          storage: 'memory',
        })
      }
    },
  )

  route('POST', '/billing/stripe/checkout-session', async ({ actor, body, res, requestId }) => {
    if (!assertRole({ actor, allowed: ['sp'], res, requestId })) return
    const orderId = String(body?.order_id || '').trim()
    if (orderId) {
      return routes
        .find(
          (row) =>
            row.method === 'POST' && row.pattern === '/sp/credits/orders/:orderId/checkout-session',
        )
        ?.handler({
          actor,
          body,
          res,
          requestId,
          params: { orderId },
          query: new URLSearchParams(),
        })
    }

    const now = new Date().toISOString()
    const order = buildSpCreditOrderFromSku({ actor, body, now })
    const session = await createStripeCheckoutSession({ order, body, now })
    order.status = 'checkout_created'
    order.provider = 'stripe'
    order.provider_checkout_session_id = session.id
    order.updated_at = now

    try {
      const db = getDb()
      await db.collection(SP_CREDIT_ORDERS_COLLECTION).doc(order.id).set(order, { merge: true })
      return ok(res, requestId, { order, checkout_session: session, storage: 'firestore' })
    } catch {
      if (!store.spCreditOrders) store.spCreditOrders = new Map()
      store.spCreditOrders.set(order.id, order)
      return ok(res, requestId, { order, checkout_session: session, storage: 'memory' })
    }
  })

  route('POST', '/sp/credits/payments/callback', async ({ body, res, requestId }) => {
    const orderId = String(body?.order_id || '').trim()
    if (!orderId) {
      return sendError(res, requestId, 400, 'MISSING_ORDER_ID', 'order_id is required')
    }
    const status = normalizeCreditOrderStatus(body?.status)
    if (!['paid', 'failed', 'canceled', 'refunded'].includes(status)) {
      return sendError(
        res,
        requestId,
        400,
        'INVALID_STATUS',
        'status must be paid, failed, canceled, or refunded',
      )
    }

    const now = new Date().toISOString()
    try {
      const db = getDb()
      const result = await db.runTransaction(async (tx) => {
        const orderRef = db.collection(SP_CREDIT_ORDERS_COLLECTION).doc(orderId)
        const orderSnap = await tx.get(orderRef)
        if (!orderSnap.exists)
          throw createApiError(404, 'ORDER_NOT_FOUND', 'Credit order not found')
        const order = { id: orderSnap.id, ...(orderSnap.data() || {}) }

        const previousStatus = normalizeCreditOrderStatus(order.status)
        const alreadyCredited = previousStatus === 'credited' || Boolean(order.fulfilled_at)
        const alreadyRefunded = previousStatus === 'refunded'
        const patch = {
          status,
          provider_txn_id: body?.provider_txn_id || order.provider_txn_id || null,
          provider_payment_intent_id:
            body?.provider_payment_intent_id || order.provider_payment_intent_id || null,
          provider_customer_id: body?.provider_customer_id || order.provider_customer_id || null,
          updated_at: now,
          paid_at: status === 'paid' ? body?.paid_at || now : order.paid_at || null,
          failed_at: status === 'failed' ? body?.failed_at || now : order.failed_at || null,
          canceled_at: status === 'canceled' ? body?.canceled_at || now : order.canceled_at || null,
          refunded_at: status === 'refunded' ? body?.refunded_at || now : order.refunded_at || null,
        }
        tx.set(orderRef, patch, { merge: true })

        let credited = 0
        let refunded = 0
        let balanceAfter = null
        if (status === 'paid' && !alreadyCredited) {
          const credits = Math.max(1, Number(order.credits || 1))
          const accountRef = db.collection(SP_CREDIT_ACCOUNTS_COLLECTION).doc(order.sp_id)
          const accountSnap = await tx.get(accountRef)
          const account = accountSnap.exists
            ? buildSpCreditAccountSnapshot(order.sp_id, accountSnap.data() || {}, now)
            : buildDefaultSpCreditAccount(order.sp_id, now)
          const granted = applySpFreeCreditPolicy(account, now)
          if (granted.granted > 0 || !accountSnap.exists) {
            tx.set(
              accountRef,
              {
                ...granted.account,
                sp_id: order.sp_id,
                created_at: account.created_at || now,
                updated_at: granted.account.updated_at || now,
              },
              { merge: true },
            )
          }
          if (granted.granted > 0) {
            const grantLedgerId = `credit-ledger-${randomUUID()}`
            tx.set(db.collection(SP_CREDIT_LEDGER_COLLECTION).doc(grantLedgerId), {
              id: grantLedgerId,
              sp_id: order.sp_id,
              entry_type: 'adjustment',
              delta: granted.granted,
              balance_after: granted.account.balance,
              source_type: 'free_credit',
              source_id: granted.grantType || 'starter',
              provider: null,
              provider_ref: null,
              created_at: now,
              created_by: 'system',
              note: `Automatic ${granted.grantType || 'starter'} bid credit grant`,
              meta: {
                grant_type: granted.grantType || 'starter',
              },
            })
          }
          const currentBalance = toNumber(granted.account.balance, 0)
          balanceAfter = currentBalance + credits
          tx.set(
            accountRef,
            {
              ...granted.account,
              sp_id: order.sp_id,
              balance: balanceAfter,
              lifetime_purchased: toNumber(granted.account.lifetime_purchased, 0) + credits,
              updated_at: now,
              created_at: granted.account.created_at || now,
            },
            { merge: true },
          )
          const ledgerId = `credit-ledger-${randomUUID()}`
          tx.set(db.collection(SP_CREDIT_LEDGER_COLLECTION).doc(ledgerId), {
            id: ledgerId,
            sp_id: order.sp_id,
            entry_type: 'purchase',
            delta: credits,
            balance_after: balanceAfter,
            source_type: 'credit_order',
            source_id: order.id,
            provider: order.provider || 'stripe',
            provider_ref: body?.provider_txn_id || order.provider_txn_id || null,
            created_at: now,
            created_by: 'provider_callback',
            note: 'Credit order paid and fulfilled',
            meta: {
              amount: Number(order.amount || 0),
              amount_cents: Number(order.amount_cents || 0),
              currency: order.currency || 'USD',
              provider: order.provider || 'stripe',
            },
          })
          tx.set(
            orderRef,
            {
              status: 'paid',
              fulfilled_at: now,
              updated_at: now,
            },
            { merge: true },
          )
          credited = credits
        } else if (status === 'refunded' && !alreadyRefunded) {
          const credits = Math.max(1, Number(order.credits || 1))
          const accountRef = db.collection(SP_CREDIT_ACCOUNTS_COLLECTION).doc(order.sp_id)
          const accountSnap = await tx.get(accountRef)
          const account = accountSnap.exists
            ? buildSpCreditAccountSnapshot(order.sp_id, accountSnap.data() || {}, now)
            : buildDefaultSpCreditAccount(order.sp_id, now)
          const balanceBefore = toNumber(account.balance, 0)
          balanceAfter = Math.max(0, balanceBefore - credits)
          const actualRefundCredits = balanceBefore - balanceAfter
          tx.set(
            accountRef,
            {
              ...account,
              sp_id: order.sp_id,
              balance: balanceAfter,
              lifetime_refunded: toNumber(account.lifetime_refunded, 0) + credits,
              updated_at: now,
              created_at: account.created_at || now,
            },
            { merge: true },
          )
          const ledgerId = `credit-ledger-${randomUUID()}`
          tx.set(db.collection(SP_CREDIT_LEDGER_COLLECTION).doc(ledgerId), {
            id: ledgerId,
            sp_id: order.sp_id,
            entry_type: 'refund',
            delta: -actualRefundCredits,
            balance_after: balanceAfter,
            source_type: 'credit_order',
            source_id: order.id,
            provider: order.provider || 'stripe',
            provider_ref: body?.provider_txn_id || order.provider_txn_id || null,
            created_at: now,
            created_by: 'provider_callback',
            note: 'Credit order refunded',
            meta: {
              credits,
              amount_cents: Number(order.amount_cents || 0),
              currency: order.currency || 'USD',
            },
          })
          refunded = credits
        }

        return {
          order_id: order.id,
          sp_id: order.sp_id,
          status: status === 'paid' && credited > 0 ? 'paid' : status,
          credited,
          refunded,
          balance_after: balanceAfter,
        }
      })
      return ok(res, requestId, { ...result, storage: 'firestore' })
    } catch (error) {
      if (error?.code && error?.status) {
        return sendError(res, requestId, error.status, error.code, error.message)
      }

      if (!store.spCreditOrders) store.spCreditOrders = new Map()
      const order = store.spCreditOrders.get(orderId)
      if (!order) return sendError(res, requestId, 404, 'ORDER_NOT_FOUND', 'Credit order not found')

      const wasCredited =
        normalizeCreditOrderStatus(order.status) === 'credited' || Boolean(order.fulfilled_at)
      const wasRefunded = normalizeCreditOrderStatus(order.status) === 'refunded'
      order.status = status
      order.provider_txn_id = body?.provider_txn_id || order.provider_txn_id || null
      order.provider_payment_intent_id =
        body?.provider_payment_intent_id || order.provider_payment_intent_id || null
      order.provider_customer_id = body?.provider_customer_id || order.provider_customer_id || null
      order.updated_at = now
      if (status === 'paid') order.paid_at = body?.paid_at || now
      if (status === 'failed') order.failed_at = body?.failed_at || now
      if (status === 'canceled') order.canceled_at = body?.canceled_at || now
      if (status === 'refunded') order.refunded_at = body?.refunded_at || now

      let credited = 0
      let refunded = 0
      let balanceAfter = null
      if (status === 'paid' && !wasCredited) {
        const credits = Math.max(1, Number(order.credits || 1))
        const account = ensureSpCreditAccountMemory(order.sp_id)
        balanceAfter = toNumber(account.balance, 0) + credits
        account.balance = balanceAfter
        account.lifetime_purchased = toNumber(account.lifetime_purchased, 0) + credits
        account.updated_at = now
        order.status = 'paid'
        order.fulfilled_at = now
        appendSpCreditLedgerMemory({
          id: `credit-ledger-${randomUUID()}`,
          sp_id: order.sp_id,
          entry_type: 'purchase',
          delta: credits,
          balance_after: balanceAfter,
          source_type: 'credit_order',
          source_id: order.id,
          provider: order.provider || 'stripe',
          provider_ref: body?.provider_txn_id || order.provider_txn_id || null,
          created_at: now,
          created_by: 'provider_callback',
          note: 'Credit order paid and fulfilled',
          meta: {
            amount: Number(order.amount || 0),
            amount_cents: Number(order.amount_cents || 0),
            currency: order.currency || 'USD',
            provider: order.provider || 'stripe',
          },
        })
        credited = credits
      } else if (status === 'refunded' && !wasRefunded) {
        const credits = Math.max(1, Number(order.credits || 1))
        const account = ensureSpCreditAccountMemory(order.sp_id)
        const balanceBefore = toNumber(account.balance, 0)
        balanceAfter = Math.max(0, balanceBefore - credits)
        const actualRefundCredits = balanceBefore - balanceAfter
        account.balance = balanceAfter
        account.lifetime_refunded = toNumber(account.lifetime_refunded, 0) + credits
        account.updated_at = now
        appendSpCreditLedgerMemory({
          id: `credit-ledger-${randomUUID()}`,
          sp_id: order.sp_id,
          entry_type: 'refund',
          delta: -actualRefundCredits,
          balance_after: balanceAfter,
          source_type: 'credit_order',
          source_id: order.id,
          provider: order.provider || 'stripe',
          provider_ref: body?.provider_txn_id || order.provider_txn_id || null,
          created_at: now,
          created_by: 'provider_callback',
          note: 'Credit order refunded',
          meta: {
            credits,
            amount_cents: Number(order.amount_cents || 0),
            currency: order.currency || 'USD',
          },
        })
        refunded = credits
      }

      return ok(res, requestId, {
        order_id: order.id,
        sp_id: order.sp_id,
        status: order.status,
        credited,
        refunded,
        balance_after: balanceAfter,
        storage: 'memory',
      })
    }
  })

  route('POST', '/billing/stripe/webhook', async ({ body, req, res, requestId }) => {
    const eventType = String(body?.type || body?.event_type || '').trim()
    const eventId = String(body?.id || body?.event_id || '').trim()
    const dataObject =
      body?.data?.object && typeof body.data.object === 'object' ? body.data.object : body
    const orderId = String(
      dataObject?.metadata?.order_id || dataObject?.client_reference_id || body?.order_id || '',
    ).trim()

    if (!stripeWebhookSecret) {
      // Keep this endpoint non-destructive until Stripe signature verification is configured.
      return sendError(
        res,
        requestId,
        503,
        'STRIPE_WEBHOOK_NOT_CONFIGURED',
        'Stripe webhook secret is not configured; refusing to fulfill credits from unsigned webhook payload.',
      )
    }
    if (!orderId) {
      return sendError(
        res,
        requestId,
        400,
        'MISSING_ORDER_ID',
        'Stripe event must include order_id metadata',
      )
    }

    const rawPayload =
      req?.rawBody && Buffer.isBuffer(req.rawBody)
        ? req.rawBody.toString('utf-8')
        : typeof req?.body === 'string'
          ? req.body
          : JSON.stringify(body || {})
    verifyStripeWebhookSignature({ req, rawPayload, webhookSecret: stripeWebhookSecret })

    const statusByEvent = {
      'checkout.session.completed': 'paid',
      'checkout.session.expired': 'canceled',
      'payment_intent.payment_failed': 'failed',
      'charge.refunded': 'refunded',
    }
    const mappedStatus = statusByEvent[eventType]
    if (!mappedStatus) {
      return ok(res, requestId, {
        ignored: true,
        event_id: eventId || null,
        event_type: eventType || null,
      })
    }

    return routes
      .find((row) => row.method === 'POST' && row.pattern === '/sp/credits/payments/callback')
      ?.handler({
        body: {
          order_id: orderId,
          status: mappedStatus,
          provider_txn_id: dataObject?.id || null,
          provider_checkout_session_id: eventType.startsWith('checkout.')
            ? dataObject?.id || null
            : null,
          provider_payment_intent_id: dataObject?.payment_intent || dataObject?.id || null,
          provider_customer_id: dataObject?.customer || null,
          paid_at:
            mappedStatus === 'paid' && dataObject?.created
              ? new Date(Number(dataObject.created) * 1000).toISOString()
              : undefined,
          refunded_at:
            mappedStatus === 'refunded' && dataObject?.created
              ? new Date(Number(dataObject.created) * 1000).toISOString()
              : undefined,
        },
        res,
        requestId,
      })
  })

  const reporting = createReportingAccess({ getDb })
  const reportRoute = (fn, resource = 'Reports') => async (context) => {
    try {
      ok(context.res, context.requestId, await fn(context))
    } catch (error) {
      const status = Number(error.status) || 503
      if (status >= 500) console.error('Resource request failed', { requestId, resource, code: error.code || null, name: error.name || 'Error' })
      sendError(
        context.res, context.requestId, status, error.code || 'REPORT_UNAVAILABLE',
        status < 500 ? error.message : `${resource} could not be confirmed. Please refresh before retrying or contact support.`,
        status >= 500,
      )
    }
  }
  route('GET', '/reports/options', reportRoute(reporting.options))
  const taskComments = createTaskCommentsService({ getDb })
  route('GET', '/properties/:propertyId/mxrecords/:taskId/comments', reportRoute(taskComments.get, 'Task comments'))
  route('POST', '/properties/:propertyId/mxrecords/:taskId/comments', reportRoute(taskComments.append, 'Task comments'))
  const deposits = createDepositService({ getDb })
  const inventoryWorkflow = createInventoryService({ getDb })
  route('GET', '/leases/:leaseId/inventory-workflow', reportRoute(inventoryWorkflow.get, 'Inventory'))
  route('GET', '/leases/:leaseId/inventory-workflow/history', reportRoute(inventoryWorkflow.history, 'Inventory'))
  route('POST', '/leases/:leaseId/inventory-workflow/commands', reportRoute(inventoryWorkflow.command, 'Inventory'))
  route('GET', '/properties/:propertyId/deposits', reportRoute(deposits.getProperty, 'Deposits'))
  route('GET', '/properties/:propertyId/leases/:leaseId/deposit', reportRoute(deposits.getLease, 'Deposits'))
  route('POST', '/properties/:propertyId/leases/:leaseId/deposit/entries', reportRoute(deposits.postEntry, 'Deposits'))
  route('GET', '/reports/workspace', reportRoute(reporting.workspace))
  route('GET', '/reports/participants', reportRoute(reporting.participants))
  route('POST', '/properties/:propertyId/report-transactions', reportRoute(reporting.createTransaction))
  // Preserve useful legacy URLs, but never return sample or unscoped production data.
  for (const [path, type] of [
    ['/reports/task-status', 'tasks'],
    ['/reports/income-expense', 'pnl'],
  ]) {
    route('GET', path, reportRoute((context) => {
        const query = new URLSearchParams(context.query)
        query.set('type', type)
        return reporting.workspace({ ...context, query })
      }),
    )
  }
  for (const path of ['/reports/occupancy-lease', '/reports/annual-tax-finance']) {
    route('GET', path, async ({ res, requestId }) =>
      sendError(res, requestId, 410, 'REPORT_RETIRED', 'This report has been retired. Use the property reporting workspace.'),
    )
  }

  const handler = async (req, res) => {
    const requestId = withRequestId(req)
    if (req.method === 'OPTIONS') return json(res, 204, { request_id: requestId })
    try {
      const rawUrl = (req.url || '/').replace(/^\/api/, '') || '/'
      const url = new URL(rawUrl, 'http://localhost')
      const requestBodyForAuthBypass = ['POST', 'PUT', 'PATCH'].includes(req.method || '')
        ? await readBody(req)
        : {}
      const authContext = await resolveActorFromRequest(req)
      const isAdminPath = url.pathname.startsWith('/admin/')
      const hasAdminClaim =
        authContext?.claims?.admin === true ||
        (Array.isArray(authContext?.claims?.roles) && authContext.claims.roles.includes('admin'))
      const backfillToken = String(
        requestBodyForAuthBypass?.backfill_token || requestBodyForAuthBypass?.token || '',
      ).trim()
      const allowBackfillBypass =
        url.pathname === '/admin/backfill/task-addresses' &&
        backfillToken === TASK_ADDRESS_BACKFILL_TOKEN
      if (isAdminPath && !allowBackfillBypass && (!authContext.verified || !hasAdminClaim)) {
        return sendError(
          res,
          requestId,
          401,
          'UNAUTHENTICATED',
          'Admin Firebase authentication is required',
        )
      }
      const actor = authContext.actor
      const body = requestBodyForAuthBypass
      for (const row of routes) {
        if (row.method !== req.method) continue
        const params = pathMatch(url.pathname, row.pattern)
        if (!params) continue
        return row.handler({
          req,
          res,
          requestId,
          actor,
          verified: authContext?.verified === true,
          claims: authContext?.claims || null,
          params,
          body,
          query: url.searchParams,
        })
      }
      return sendError(res, requestId, 404, 'NOT_FOUND', 'API route not found')
    } catch (error) {
      if (error.message === 'invalid_json') {
        return sendError(res, requestId, 400, 'INVALID_JSON', 'Request body is not valid JSON.')
      }
      return sendError(res, requestId, 500, 'INTERNAL_ERROR', 'Unexpected server error.', true)
    }
  }

  const server = http.createServer(handler)
  server.once('close', disposeFirebaseAdapters)
  return { server, handler, store, dispose: disposeFirebaseAdapters }
}
