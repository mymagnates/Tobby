import http from 'node:http'
import { createHash, randomUUID } from 'node:crypto'
import { getApps, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'
import { createInMemoryStore } from './store.js'
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
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, OPTIONS',
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
const createApiError = (status, code, message) => Object.assign(new Error(message), { status, code })

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

const checkPlanGate = ({ actor, action }) => {
  if (action === 'advanced_reports' && actor.billing.plan_name !== 'pro') {
    return {
      blocked: true,
      response: {
        gate_status: 'blocked',
        plan_required: 'pro',
        upgrade_hint: 'Upgrade to Pro to access advanced reports.',
      },
    }
  }
  return { blocked: false, response: { gate_status: 'ok' } }
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
const ADMIN_METRICS_DAILY_COLLECTION = 'admin_metrics_daily'
const ADMIN_EVENTS_COLLECTION = 'admin_events'
const ADMIN_ERRORS_COLLECTION = 'admin_errors'
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
const TASK_ADDRESS_BACKFILL_TOKEN = 'backfill-2026-04-02'
let firestoreDb = null
let firebaseAuth = null

const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash'
const DEFAULT_INVITE_EMAIL_FROM = 'onboarding@resend.dev'
const OWNER_INVITE_PENDING = 'pending'

const randomHex = () => randomUUID().replace(/-/g, '')
const generateOwnerInviteToken = () => `${randomHex()}${randomHex()}`
const createOwnerInviteExpiry = (days = 7) => {
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + days)
  return expiresAt
}
const normalizeEmail = (value) => String(value || '').trim().toLowerCase()
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

const normalizeRole = (role) => {
  const next = String(role || '').trim().toLowerCase()
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
  return { ...bid, id, bid_id: bid.bid_id || id }
}

const normalizeTaskStatus = (status) => String(status || '').trim().toLowerCase()

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

const classifyIssueCategory = (text = '') => {
  const value = String(text || '').toLowerCase()
  if (/leak|drip|pipe|toilet|sink|faucet|water|plumbing/.test(value)) return 'plumbing'
  if (/sparks|outlet|breaker|power|electrical|wiring|light/.test(value)) return 'electrical'
  if (/ac|air\s*conditioning|hvac|heat|heater|thermostat/.test(value)) return 'hvac'
  if (/washer|dryer|dishwasher|fridge|refrigerator|stove|oven/.test(value)) return 'appliance'
  return 'general_maintenance'
}

const classifyUrgency = (text = '') => {
  const value = String(text || '').toLowerCase()
  if (/fire|smoke|gas|sparks|flood|no power|electrical shock/.test(value)) return 'high'
  if (/leak|broken|not working|failed|overflow|clog/.test(value)) return 'medium'
  return 'low'
}

const detectEntityType = (text = '') => {
  const value = String(text || '').toLowerCase()
  if (/(remind|reminder|due|renewal|renew|schedule|scheduled|recurring|monthly|weekly|yearly|annual)/.test(value)) {
    return 'reminder'
  }
  if (/(transaction|payment|paid|pay|invoice|rent|deposit|refund|fee|charge|transfer)/.test(value)) {
    return 'transaction'
  }
  if (/(asset|appliance|equipment|serial|model|warranty|install|installed|purchase|purchased)/.test(value)) {
    return 'asset'
  }
  return 'task'
}

const detectTransactionType = (text = '') => {
  const value = String(text || '').toLowerCase()
  if (/rent/.test(value)) return 'Rent'
  if (/deposit/.test(value)) return 'Deposit'
  if (/tax/.test(value)) return 'Tax'
  if (/insurance/.test(value)) return 'Insurance'
  if (/utility|electric|water|gas|trash|sewer/.test(value)) return 'Utility'
  if (/maintenance|repair|fix/.test(value)) return 'Maintenance'
  if (/labor|service/.test(value)) return 'Labor'
  if (/hoa/.test(value)) return 'HOA'
  if (/refund/.test(value)) return 'Refund'
  if (/fee|charge/.test(value)) return 'Fee'
  return 'Other'
}

const detectAssetType = (text = '') => {
  const value = String(text || '').toLowerCase()
  if (/water heater|heater|ac|hvac|furnace|thermostat|air handler|compressor/.test(value)) return 'HVAC'
  if (/dishwasher|washer|dryer|fridge|refrigerator|stove|oven|microwave|appliance/.test(value)) return 'Appliance'
  if (/outlet|breaker|panel|switch|electrical|light|wiring/.test(value)) return 'Electrical'
  if (/toilet|sink|faucet|pipe|plumbing|drain|garbage disposal/.test(value)) return 'Plumbing'
  if (/camera|alarm|detector|safety|sensor|extinguisher/.test(value)) return 'Safety'
  if (/gate|door|window|roof|gutter|fence|garage/.test(value)) return 'Exterior'
  if (/sofa|chair|table|bed|furniture/.test(value)) return 'Furniture'
  if (/pool|spa|hot tub/.test(value)) return 'Pool/Spa'
  return 'Other'
}

const detectAssetLocation = (text = '') => {
  const value = String(text || '').toLowerCase()
  const knownLocations = [
    'kitchen',
    'laundry room',
    'garage',
    'basement',
    'bathroom',
    'primary bathroom',
    'guest bathroom',
    'living room',
    'dining room',
    'main bedroom',
    'office',
    'patio',
    'deck',
    'roof',
    'back yard',
    'front yard',
    'hvac closet',
    'utility room',
    'mechanical room',
    'water heater closet',
  ]
  const match = knownLocations.find((location) => value.includes(location))
  if (!match) return ''
  return match
    .split(' ')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

const extractTaggedValue = (text = '', pattern) => {
  const match = String(text || '').match(pattern)
  return match?.[1]?.trim() || ''
}

const detectReminderCategory = (text = '') => {
  const value = String(text || '').toLowerCase()
  if (/rent/.test(value)) return 'rent'
  if (/hoa/.test(value)) return 'hoa'
  if (/tax/.test(value)) return 'tax'
  if (/maintenance|repair|fix/.test(value)) return 'maintenance'
  if (/labor|service/.test(value)) return 'labor'
  if (/fee|charge/.test(value)) return 'fee'
  return 'other'
}

const detectReminderRepeat = (text = '') => {
  const value = String(text || '').toLowerCase()
  if (/daily|every day/.test(value)) return 'daily'
  if (/weekly|every week/.test(value)) return 'weekly'
  if (/monthly|every month/.test(value)) return 'monthly'
  if (/yearly|annual|annually|every year/.test(value)) return 'yearly'
  return 'one-time'
}

const extractAmount = (text = '') => {
  const match = String(text || '').match(
    /(?:\$|\b)(\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?|\d+(?:\.\d{1,2})?)(?:\b|$)/
  )
  if (!match) return null
  const normalized = match[1].replace(/,/g, '')
  const value = Number.parseFloat(normalized)
  return Number.isNaN(value) ? null : value
}

const isMaintenanceRelated = (text = '') => {
  const value = String(text || '').toLowerCase()
  return /(leak|drip|pipe|toilet|sink|faucet|water|plumbing|electrical|outlet|breaker|power|wiring|light|ac|air\s*conditioning|hvac|heat|heater|thermostat|washer|dryer|dishwasher|fridge|refrigerator|stove|oven|clog|mold|pest|roof|window|door|lock|garage|vent|transaction|payment|paid|pay|invoice|rent|deposit|refund|fee|charge|transfer|remind|reminder|due|renewal|renew|schedule|scheduled|recurring|monthly|weekly|yearly|annual)/.test(
    value
  )
}

const buildAgentIntakePrompt = ({ rawText, context }) => {
  const payload = {
    raw_text: rawText,
    context: {
      property_id: context?.property_id || null,
      lease_id: context?.lease_id || null,
      unit_id: context?.unit_id || null,
      property_list: Array.isArray(context?.property_list) ? context.property_list : [],
      transaction_type_hint: context?.transaction_type_hint || null,
      transaction_type_options: Array.isArray(context?.transaction_type_options)
        ? context.transaction_type_options
        : [],
      transaction_role_options: Array.isArray(context?.transaction_role_options)
        ? context.transaction_role_options
        : [],
      asset_type_hint: context?.asset_type_hint || null,
      asset_type_options: Array.isArray(context?.asset_type_options)
        ? context.asset_type_options
        : [],
      asset_location_hint: context?.asset_location_hint || null,
      reminder_category_hint: context?.reminder_category_hint || null,
      reminder_category_options: Array.isArray(context?.reminder_category_options)
        ? context.reminder_category_options
        : [],
      reminder_repeat_hint: context?.reminder_repeat_hint || null,
    },
  }

  return [
    'You are a task-intake agent for property maintenance.',
    'Return JSON only. No markdown, no extra text.',
    'Do not provide DIY instructions. Only summarize the issue and draft a record.',
    'Output schema:',
    '{',
    '  "entity_type": "task"|"transaction"|"asset"|"reminder",',
    '  "draft": object,',
    '  "missing_fields": string[]',
    '}',
    'If entity_type is "task", draft fields:',
    '{ title, description, task_category, task_priority, status, property_id, lease_id, unit_id, photos, videos, attachments }',
    'If entity_type is "transaction", draft fields:',
    '{ property_id, transac_type, transac_from, transac_to, amount, transac_date, note }',
    'If entity_type is "asset", draft fields:',
    '{ property_id, nickname, type, location, brand, model, serial, mfg_date, acquired_date, notes }',
    'If entity_type is "reminder", draft fields:',
    '{ property_id, category, start_date, due_date, repeat_by, amount, note, status }',
    'Use property_list to choose the most relevant property_id when possible.',
    'If entity_type is "transaction", use transaction_type_options and transaction_type_hint.',
    'If entity_type is "transaction", transac_from and transac_to must be one of transaction_role_options.',
    'Rules for transaction roles: rent/deposit => from Tenant to Property Owner. Other types default from Property Owner unless input says otherwise. Refund/fee depend on the input text.',
    'If entity_type is "asset", use asset_type_options and asset_type_hint when relevant.',
    'If entity_type is "reminder", use reminder_category_options and reminder_category_hint when relevant.',
    'If entity_type is "reminder", use reminder_repeat_hint when relevant.',
    '',
    'User input:',
    JSON.stringify(payload),
  ].join('\n')
}

const parseJsonLoose = (value) => {
  if (!value) return null
  if (typeof value === 'object') return value
  const text = String(value)
  try {
    return JSON.parse(text)
  } catch {
    const start = text.indexOf('{')
    const end = text.lastIndexOf('}')
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(text.slice(start, end + 1))
      } catch {
        return null
      }
    }
    return null
  }
}

const callGeminiIntake = async ({ rawText, context, apiKey, model }) => {
  if (!apiKey) return null
  const prompt = buildAgentIntakePrompt({ rawText, context })
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
      model || DEFAULT_GEMINI_MODEL
    )}:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 512 },
      }),
    }
  )
  if (!response.ok) return null
  const data = await response.json().catch(() => null)
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || ''
  return parseJsonLoose(text)
}

const withIdempotency = ({ store, key, resolver }) => {
  if (!key) return resolver()
  if (store.idempotency.has(key)) return store.idempotency.get(key)
  const next = resolver()
  store.idempotency.set(key, next)
  return next
}

export const createApiServer = ({ store = createInMemoryStore(), config = {} } = {}) => {
  const routes = []
  const route = (method, pattern, handler) => routes.push({ method, pattern, handler })
  const rateLimits = new Map()
  const geminiApiKey = config.geminiApiKey || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || ''
  const geminiModel = config.geminiModel || process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL
  const resendApiKey = config.resendApiKey || process.env.RESEND_API_KEY || ''
  const inviteEmailFrom = String(
    config.inviteEmailFrom || process.env.INVITE_EMAIL_FROM || DEFAULT_INVITE_EMAIL_FROM,
  ).trim()
  const appBaseUrl = String(config.appBaseUrl || process.env.APP_BASE_URL || '').trim()
  const agentAllowedOrigins = String(
    config.agentAllowedOrigins || process.env.AGENT_ALLOWED_ORIGINS || ''
  ).trim()
  const agentRateLimitPerMin = Number(
    config.agentRateLimitPerMin || process.env.AGENT_RATE_LIMIT_PER_MIN || 30
  )
  const feedCacheTtlMs = Math.max(
    0,
    Number(config.feedCacheTtlSeconds || process.env.FEED_CACHE_TTL_SECONDS || 60)
  ) * 1000
  const feedRequestWindowMs = Math.max(
    1000,
    Number(config.feedRequestWindowSeconds || process.env.FEED_REQUEST_WINDOW_SECONDS || 30)
  ) * 1000
  const feedMaxRequestsPerWindow = Math.max(
    1,
    Number(config.feedMaxRequestsPerWindow || process.env.FEED_MAX_REQUESTS_PER_WINDOW || 20)
  )
  const feedCache = new Map()
  const feedInFlight = new Map()
  const feedRequestBuckets = new Map()

  const isAllowedOrigin = (req) => {
    if (!agentAllowedOrigins) return true
    const origin = String(req.headers.origin || '').trim()
    if (!origin) return false
    return agentAllowedOrigins.split(',').map((v) => v.trim()).includes(origin)
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
        claims?.admin === true ||
        (Array.isArray(claims?.roles) && claims.roles.includes('admin'))
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
      return snap.docs
        .map((doc) => normalizeLead({ id: doc.id, ...(doc.data() || {}) }))
        .sort((a, b) => String(b.created_at || '').localeCompare(String(a.created_at || '')))
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
        const active = String(data.status || 'active').trim().toLowerCase() === 'active'
        const role = String(data.role || '').trim().toLowerCase()
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
        const active = String(data.status || 'active').trim().toLowerCase() === 'active'
        const role = String(data.role || '').trim().toLowerCase()
        return sameProperty && active && (role === 'pm' || role === 'po')
      })
    } catch {
      return false
    }
  }

  const buildOwnerInviteUrl = ({ origin, token }) => {
    const baseUrl = String(appBaseUrl || origin || '').trim().replace(/\/$/, '')
    if (!baseUrl) return `/public/owner-invite/${token}`
    return `${baseUrl}/public/owner-invite/${token}`
  }

  const renderOwnerInviteEmail = ({ inviteUrl, propertyName, propertyAddress, inviterName }) => {
    const safePropertyName = escapeHtml(propertyName || 'this property')
    const safePropertyAddress = escapeHtml(propertyAddress || '')
    const safeInviterName = escapeHtml(inviterName || 'A property manager')
    return {
      subject: `You’ve been invited to access ${propertyName || 'a property'} in Tobby`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;padding:24px;color:#111827;">
          <h2 style="margin:0 0 16px;">Property Access Invitation</h2>
          <p style="margin:0 0 12px;">${safeInviterName} invited you to access <strong>${safePropertyName}</strong> in Tobby.</p>
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
        `${inviterName || 'A property manager'} invited you to access ${propertyName || 'this property'} in Tobby.`,
        propertyAddress ? `Property: ${propertyAddress}` : null,
        '',
        `Accept invitation: ${inviteUrl}`,
      ].filter(Boolean).join('\n'),
    }
  }

  const sendOwnerInviteEmail = async ({ to, inviteUrl, propertyName, propertyAddress, inviterName }) => {
    if (!resendApiKey) {
      return { emailSent: false, reason: 'missing_resend_api_key' }
    }
    if (!inviteEmailFrom) {
      return { emailSent: false, reason: 'missing_invite_email_from' }
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
    const parts = text.split(',').map((item) => item.trim()).filter(Boolean)
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
    const legacy = typeof source.address === 'string' ? parseLegacyAddressParts(source.address) : { city: '', state: '', zip: '' }
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
    const line2 = String(address.line2 || address.unit || source.address_line2 || source.unit || '').trim()
    const city = String(address.city || source.city || source.city_name || legacy.city || '').trim()
    const state = String(address.state || source.state || source.state_code || legacy.state || '').trim()
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
          { merge: true }
        )
    } catch {
      // no-op
    }
  }

  const getFirestoreTaskById = async (id) => {
    try {
      const db = getDb()
      const doc = await db.collection(TASKS_COLLECTION).doc(id).get()
      if (!doc.exists) return null
      return { id: doc.id, ...(doc.data() || {}) }
    } catch {
      return null
    }
  }

  const listFirestoreTasks = async () => {
    try {
      const db = getDb()
      const snap = await db.collection(TASKS_COLLECTION).get()
      return snap.docs.map((doc) => ({ id: doc.id, ...(doc.data() || {}) }))
    } catch {
      return []
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

  const toNumber = (value, fallback = 0) => {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : fallback
  }

  const getTaskAddressPatch = (task, property) => {
    const sourceTask = task && typeof task === 'object' ? task : {}
    const sourceProperty = property && typeof property === 'object' ? property : {}
    const propertyAddress = normalizePropertyAddress(sourceProperty)
    const taskAddress = normalizePropertyAddress(sourceTask)

    const line1 = taskAddress.line1 || propertyAddress.line1 || String(sourceTask.property_name || '').trim()
    const line2 = taskAddress.line2 || propertyAddress.line2
    const city = taskAddress.city || propertyAddress.city
    const state = taskAddress.state || propertyAddress.state
    const zip = taskAddress.zip || propertyAddress.zip

    return {
      property_name: line1 || String(sourceProperty.displayName || sourceProperty.name || sourceTask.property_name || '').trim(),
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
          ? {
              ...buildDefaultSpCreditAccount(spId, snap.data()?.created_at || now),
              ...(snap.data() || {}),
              sp_id: spId,
              balance: toNumber(snap.data()?.balance, 0),
              lifetime_purchased: toNumber(snap.data()?.lifetime_purchased, 0),
              lifetime_used: toNumber(snap.data()?.lifetime_used, 0),
              lifetime_granted: toNumber(snap.data()?.lifetime_granted, 0),
              last_free_credit_at: snap.data()?.last_free_credit_at || null,
            }
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
            { merge: true }
          )
        }
        if (granted.granted > 0) {
          const ledgerId = `credit-ledger-${randomUUID()}`
          tx.set(db.collection(SP_CREDIT_LEDGER_COLLECTION).doc(ledgerId), {
            id: ledgerId,
            sp_id: spId,
            entry_type: 'grant',
            delta: granted.granted,
            balance_after: granted.account.balance,
            source_type: 'free_credit',
            source_id: granted.grantType || 'starter',
            created_at: now,
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
        entry_type: 'grant',
        delta: granted.granted,
        balance_after: granted.account.balance,
        source_type: 'free_credit',
        source_id: granted.grantType || 'starter',
        created_at: now,
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
      const hasActive = existingSnap.docs.some((doc) => {
        const row = doc.data() || {}
        return row.status !== 'withdrawn'
      })
      if (hasActive) {
        throw createApiError(409, 'DUPLICATE_BID', 'You already have an active bid on this lead')
      }

      const accountSnap = await tx.get(accountRef)
      const accountData = accountSnap.exists
        ? {
            ...buildDefaultSpCreditAccount(actor.id, accountSnap.data()?.created_at || now),
            ...(accountSnap.data() || {}),
            sp_id: actor.id,
            balance: toNumber(accountSnap.data()?.balance, 0),
            lifetime_purchased: toNumber(accountSnap.data()?.lifetime_purchased, 0),
            lifetime_used: toNumber(accountSnap.data()?.lifetime_used, 0),
            lifetime_granted: toNumber(accountSnap.data()?.lifetime_granted, 0),
            last_free_credit_at: accountSnap.data()?.last_free_credit_at || null,
          }
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
          { merge: true }
        )
      }
      if (granted.granted > 0) {
        const ledgerId = `credit-ledger-${randomUUID()}`
        tx.set(db.collection(SP_CREDIT_LEDGER_COLLECTION).doc(ledgerId), {
          id: ledgerId,
          sp_id: actor.id,
          entry_type: 'grant',
          delta: granted.granted,
          balance_after: granted.account.balance,
          source_type: 'free_credit',
          source_id: granted.grantType || 'starter',
          created_at: now,
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
          'Insufficient credits. Your free credit will refresh next week.'
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
        estimated_duration: body?.estimated_duration || '',
        availability_date: body?.availability_date || null,
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
        { merge: true }
      )

      const ledgerId = `credit-ledger-${randomUUID()}`
      tx.set(db.collection(SP_CREDIT_LEDGER_COLLECTION).doc(ledgerId), {
        id: ledgerId,
        sp_id: actor.id,
        entry_type: 'bid_use',
        delta: -SP_BID_CREDIT_COST,
        balance_after: nextBalance,
        source_type: 'bid',
        source_id: bidId,
        lead_id: leadId,
        task_id: bid.task_id || null,
        created_at: now,
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
      return { ok: false, status: 400, code: 'LEAD_NOT_OPEN', message: 'Lead is not accepting bids' }
    }

    const spProfile = store.spProfiles.get(actor.id)
    if (!spProfile) {
      return { ok: false, status: 404, code: 'SP_PROFILE_NOT_FOUND', message: 'SP profile not found' }
    }
    if (!isSpEligibleForLead(lead, spProfile)) {
      return { ok: false, status: 403, code: 'NOT_ELIGIBLE', message: 'You are not eligible to bid on this lead' }
    }
    if (!body?.amount || Number(body.amount) <= 0) {
      return { ok: false, status: 400, code: 'INVALID_AMOUNT', message: 'Bid amount must be a positive number' }
    }

    if (found.source === 'firestore') {
      try {
        const txResult = await createBidWithCreditInFirestore({ actor, leadId, body })
        return { ok: true, bid: txResult.bid, credits_balance: txResult.balance, credit_cost: txResult.credit_cost }
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

    const existingBid = findFirst(
      store.bids,
      (b) => b.lead_id === lead.id && b.sp_id === actor.id && b.status !== 'withdrawn'
    )
    if (existingBid) {
      return {
        ok: false,
        status: 409,
        code: 'DUPLICATE_BID',
        message: 'You already have an active bid on this lead',
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
      entry_type: 'bid_use',
      delta: -SP_BID_CREDIT_COST,
      balance_after: nextBalance,
      source_type: 'bid',
      source_id: bid.id,
      lead_id: lead.id,
      task_id: bid.task_id || null,
      created_at: new Date().toISOString(),
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

  const appendAgentEvent = async ({
    eventType,
    actor,
    requestId,
    metadata = {},
  }) => {
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
      String(a.date || '').localeCompare(String(b.date || ''))
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
      String(b.created_at || '').localeCompare(String(a.created_at || ''))
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
      String(b.created_at || '').localeCompare(String(a.created_at || ''))
    )
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
    const [persistedPosts, persistedDeliveries, persistedImpressions, persistedClicks] = await Promise.all([
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

    const normalizedSlot = String(slotId || '').trim().toLowerCase()
    const normalizedService = String(serviceType || '').trim().toLowerCase()

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
      deliveryRows.map((row) => String(row.impression_token || '').trim()).filter(Boolean)
    )
    const impressionRows = [...uniqueImpressions.values()].filter(
      (row) =>
        deliveryTokenSet.has(String(row.impression_token || '').trim()) &&
        betweenRange(row.event_time, fromDate, toDate)
    )
    const clickRows = [...uniqueClicks.values()].filter(
      (row) =>
        deliveryTokenSet.has(String(row.impression_token || '').trim()) &&
        betweenRange(row.event_time, fromDate, toDate)
    )

    const impressionsByToken = new Set(
      impressionRows.map((row) => String(row.impression_token || '').trim()).filter(Boolean)
    )
    const clicksByToken = new Set(
      clickRows.map((row) => String(row.impression_token || '').trim()).filter(Boolean)
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

      const typeAgg = typeMap.get(type) || { service_type: type, served: 0, impressions: 0, clicks: 0 }
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

  const toUpper = (value) => String(value || '').trim().toUpperCase()

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
    const next = String(level || '').trim().toLowerCase()
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
      (row) => row.region_level === 'city' && candidates.city.includes(row.region_code)
    )
    if (hasCity) return 'city'
    const hasState = normalizedTargets.some(
      (row) => row.region_level === 'state' && candidates.state.includes(row.region_code)
    )
    if (hasState) return 'state'
    const hasCountry = normalizedTargets.some(
      (row) => row.region_level === 'country' && candidates.country.includes(row.region_code)
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

  const sponsoredEnabled = String(
    config.adsSponsoredEnabled || process.env.ADS_SPONSORED_ENABLED || 'false'
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
    const digest = createHash('sha1')
      .update(JSON.stringify(payload))
      .digest('hex')
      .slice(0, 16)
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

  const hashValue = (value) => createHash('sha1').update(String(value || '')).digest('hex')

  const buildDeterministicPostId = (sourceCode, sourcePostId) =>
    `adp-${hashValue(`${String(sourceCode || '').toLowerCase()}::${String(sourcePostId || '')}`).slice(0, 24)}`

  const getFirestoreFeedCacheDocId = (cacheKey) => `cache-${hashValue(cacheKey).slice(0, 32)}`

  const saveFirestoreAdPost = async (post, targetRegions = []) => {
    try {
      const db = getDb()
      await db.collection(AD_POSTS_COLLECTION).doc(String(post.post_id)).set(
        {
          ...post,
          target_regions: normalizeTargetRegions(targetRegions),
          updated_server_at: nowIso(),
        },
        { merge: true }
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
      await db.collection(AD_DELIVERIES_COLLECTION).doc(String(row.impression_token)).set(
        {
          ...row,
          updated_server_at: nowIso(),
        },
        { merge: true }
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
          { merge: true }
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
      0
    )
    const roleShare = totalRoleCount
      ? Object.fromEntries(
          Object.entries(latest.role_active_counts || {}).map(([key, value]) => [
            key,
            Number(((toNumber(value, 0) / totalRoleCount) * 100).toFixed(2)),
          ])
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
        (row) => toNumber(row.balance, 0) < 0
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
    const role = String(query.get('role') || '').trim().toLowerCase()
    const status = String(query.get('status') || '').trim().toLowerCase()
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
        if (paid !== null && paid !== '' && String(row.is_paid) !== String(paid === 'true')) return false
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
    const paidCount = users.filter((user) => String(user.billing?.plan_name || 'free') !== 'free').length
    const conversionRate = users.length ? Number(((paidCount / users.length) * 100).toFixed(2)) : 0
    const orders = [...(store.spCreditOrders?.values?.() || [])].filter((row) =>
      fromDate || toDate ? inRange(row.created_at, fromDate, toDate) : true
    )
    const ledger = [...(store.spCreditLedger?.values?.() || [])].filter((row) =>
      fromDate || toDate ? inRange(row.created_at, fromDate, toDate) : true
    )
    const accounts = [...(store.spCreditAccounts?.values?.() || [])]
    const totalPurchased = orders.reduce((sum, row) => sum + toNumber(row.credits, 0), 0)
    const totalUsed = ledger
      .filter((row) => ['bid_use', 'consume', 'usage'].includes(String(row.entry_type || '').toLowerCase()))
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
        updated_at: row.updated_at || row.created_at || null,
      }))
      .sort((a, b) => String(b.updated_at || '').localeCompare(String(a.updated_at || '')))
    return ok(res, requestId, paginateRows(rows, query))
  })

  route('GET', '/admin/credits/orders', async ({ actor, query, res, requestId }) => {
    if (!assertRole({ actor, allowed: ['admin'], res, requestId })) return
    const spId = String(query.get('sp_id') || '').trim()
    const status = String(query.get('status') || '').trim().toLowerCase()
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
    const entryType = String(query.get('entry_type') || '').trim().toLowerCase()
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
        'confirm_token must be CONFIRM for manual credit adjustment'
      )
    }

    const account = ensureSpCreditAccountMemory(spId)
    const now = new Date().toISOString()
    const balanceAfter = toNumber(account.balance, 0) + delta
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
      entry_type: delta > 0 ? 'manual_add' : 'manual_deduct',
      delta,
      balance_after: balanceAfter,
      source_type: 'admin_adjustment',
      source_id: requestId,
      created_at: now,
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
    const eventType = String(query.get('event_type') || '').trim().toLowerCase()
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
      if (entityFilters.task_id && String(row.entity_id || '') !== entityFilters.task_id) return false
      if (entityFilters.lead_id && String(row.entity_id || '') !== entityFilters.lead_id) return false
      if (entityFilters.order_id && String(row.entity_id || '') !== entityFilters.order_id) return false
      if ((fromDate || toDate) && !inRange(row.created_at, fromDate, toDate)) return false
      return true
    })
    return ok(res, requestId, { items: rows.slice(0, 500) })
  })

  route('GET', '/admin/logs/errors', async ({ actor, query, res, requestId }) => {
    if (!assertRole({ actor, allowed: ['admin'], res, requestId })) return
    const errorCode = String(query.get('error_code') || '').trim().toLowerCase()
    const routeFilter = String(query.get('route') || '').trim().toLowerCase()
    const requestFilter = String(query.get('request_id') || '').trim()
    const { fromDate, toDate } = buildRange(query)
    const rows = (await getAdminErrorRows()).filter((row) => {
      if (errorCode && String(row.error_code || '').toLowerCase() !== errorCode) return false
      if (routeFilter && !String(row.route || '').toLowerCase().includes(routeFilter)) return false
      if (requestFilter && String(row.request_id || '') !== requestFilter) return false
      if ((fromDate || toDate) && !inRange(row.created_at, fromDate, toDate)) return false
      return true
    })
    return ok(res, requestId, { items: rows.slice(0, 500) })
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
    if (!allowMaintenanceOverride && !assertRole({ actor, allowed: ['admin'], res, requestId })) return

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
            (record) => String(record.id || '') === taskIdFilter || String(record.mx_id || '') === taskIdFilter,
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
              { merge: true }
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

  route('GET', '/auth/me', async ({ actor, res, requestId }) => {
    ok(res, requestId, {
      user: { id: actor.id, role: actor.role, email: actor.email || null },
    })
  })

  route('GET', '/auth/permissions', async ({ actor, res, requestId }) => {
    ok(res, requestId, { role: actor.role, permissions: getPermissions(actor.role) })
  })

  route('POST', '/owner-invites/email', async ({ actor, body, req, res, requestId }) => {
    const propertyId = String(body?.property_id || '').trim()
    const ownerEmail = normalizeEmail(body?.owner_email)

    if (!propertyId) {
      return sendError(res, requestId, 400, 'PROPERTY_ID_REQUIRED', 'property_id is required.')
    }
    if (!/.+@.+\..+/.test(ownerEmail)) {
      return sendError(res, requestId, 400, 'INVALID_OWNER_EMAIL', 'A valid owner_email is required.')
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

    const invitesSnap = await getDb().collection('owner_invites').where('property_id', '==', propertyId).get()
    const existingPendingInvite = invitesSnap.docs
      .map((doc) => ({ id: doc.id, ...(doc.data() || {}) }))
      .find((entry) =>
        normalizeEmail(entry.owner_email) === ownerEmail &&
        String(entry.status || '').trim().toLowerCase() === OWNER_INVITE_PENDING,
      )

    const token = generateOwnerInviteToken()
    const now = new Date()
    const expiresAt = createOwnerInviteExpiry()
    const inviteDocId = existingPendingInvite?.id || token.slice(0, 20)

    await getDb().collection('owner_invites').doc(inviteDocId).set(
      {
        invite_id: existingPendingInvite?.invite_id || inviteDocId,
        property_id: propertyId,
        pm_user_id: actor.id,
        owner_email: ownerEmail,
        status: OWNER_INVITE_PENDING,
        token,
        expires_at: expiresAt,
        accepted_at: null,
        accepted_by_user_id: null,
        updated_at: now,
        ...(existingPendingInvite ? {} : { created_at: now }),
      },
      { merge: true },
    )

    const inviteUrl = buildOwnerInviteUrl({
      origin: String(req.headers.origin || '').trim(),
      token,
    })
    const propertyName = String(property.nickname || property.address || body?.property_name || 'Property').trim()
    const propertyAddress = String(property.address || body?.property_address || '').trim()
    const inviterName = String(body?.inviter_name || actor?.name || actor?.email || 'A property manager').trim()

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
      return sendError(res, requestId, 400, 'MISSING_LANDING_URL', 'landing_url_template is required')
    }

    const targetRegions = normalizeTargetRegions(body?.target_regions)
    if (!targetRegions.length) {
      return sendError(
        res,
        requestId,
        400,
        'MISSING_TARGET_REGIONS',
        'target_regions with valid region_level and region_code is required'
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
        }
      )
    }

    const persistedFresh = await getFirestoreFeedCache(cacheKey, false)
    if (persistedFresh?.payload && persistedFresh?.etag) {
      feedCache.set(cacheKey, {
        payload: persistedFresh.payload,
        etag: persistedFresh.etag,
        expiresAt: persistedFresh.expiresAt,
      })
      if (clientEtag && clientEtag === persistedFresh.etag) return notModified(res, persistedFresh.etag)
      return json(
        res,
        200,
        { request_id: requestId, ...persistedFresh.payload },
        {
          ETag: persistedFresh.etag,
          'X-Feed-Cache': 'HIT_PERSISTED',
          'X-Feed-Rate-Remaining': String(pressure.remaining),
        }
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
          }
        )
      }
      const persistedStale = await getFirestoreFeedCache(cacheKey, true)
      if (persistedStale?.payload && persistedStale?.etag) {
        feedCache.set(cacheKey, {
          payload: persistedStale.payload,
          etag: persistedStale.etag,
          expiresAt: persistedStale.expiresAt,
        })
        if (clientEtag && clientEtag === persistedStale.etag) return notModified(res, persistedStale.etag)
        return json(
          res,
          200,
          { request_id: requestId, ...persistedStale.payload },
          {
            ETag: persistedStale.etag,
            'X-Feed-Cache': 'STALE_PERSISTED',
            'X-Feed-Rate-Remaining': String(pressure.remaining),
          }
        )
      }
      return sendError(
        res,
        requestId,
        429,
        'FEED_RATE_LIMITED',
        'Too many feed requests in a short time window',
        true
      )
    }

    const payload = await getOrBuildFeedPayload({
      key: cacheKey,
      build: async () => {
        const nowDate = new Date()
        await hydrateAdPostsFromFirestore()
        const sponsoredNumerator = Math.max(0, Number(slotConfig.sponsored_ratio_numerator || 0))
        const sponsoredDenominator = Math.max(1, Number(slotConfig.sponsored_ratio_denominator || 1))
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
                row.post.image_aspect_ratio || slotConfig.image_aspect_ratio || '16:9'
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
      }
    )
  })

  route('POST', '/ad-events/impression', async ({ actor, body, req, res, requestId }) => {
    ensureAdStore()
    const impressionToken = String(body?.impression_token || '').trim()
    if (!impressionToken) {
      return sendError(res, requestId, 400, 'MISSING_IMPRESSION_TOKEN', 'impression_token is required')
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
      return sendError(res, requestId, 404, 'INVALID_IMPRESSION_TOKEN', 'Impression token not found')
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

  route('GET', '/ad-events/click/:impression_token', async ({ actor, req, params, res, requestId }) => {
    ensureAdStore()
    const impressionToken = String(params.impression_token || '').trim()
    if (!impressionToken) {
      return sendError(res, requestId, 400, 'MISSING_IMPRESSION_TOKEN', 'impression_token is required')
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
      return sendError(res, requestId, 404, 'INVALID_IMPRESSION_TOKEN', 'Impression token not found')
    }

    let post = store.adPosts.get(delivery.post_id)
    if (!post) {
      const persistedPost = await getFirestoreAdPostById(delivery.post_id)
      if (persistedPost) {
        post = persistedPost
        store.adPosts.set(post.post_id, post)
        store.adPostTargetRegions.set(post.post_id, normalizeTargetRegions(post.target_regions || []))
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
  })

  route('POST', '/internal/promo-campaigns', async ({ actor, body, res, requestId }) => {
    if (!assertRole({ actor, allowed: ['admin'], res, requestId })) return
    if (!sponsoredEnabled) {
      return sendError(
        res,
        requestId,
        403,
        'SPONSORED_DISABLED',
        'Sponsored promotion is disabled by feature flag'
      )
    }
    ensureAdStore()
    const advertiserSpId = String(body?.advertiser_sp_id || '').trim()
    const campaignName = String(body?.campaign_name || '').trim()
    if (!advertiserSpId) {
      return sendError(res, requestId, 400, 'MISSING_ADVERTISER_SP_ID', 'advertiser_sp_id is required')
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
        message: 'I can help with maintenance issue understanding, task creation, transaction entry, reminder setup, and finding service providers.',
      })
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
      })
    )

    let output = null
    if (result?.rawText) {
      try {
        output = await callGeminiIntake({
          rawText: result.rawText,
          context: result.context,
          apiKey: geminiApiKey,
          model: geminiModel,
        })
      } catch {
        output = null
      }
    }

    if (!output) {
      const rawText = String(result?.rawText || '').trim()
      const entityType = detectEntityType(rawText)
      const missingFields = []

      if (entityType === 'transaction') {
        const draft = {
          property_id: result?.context?.property_id || null,
          transac_type: detectTransactionType(rawText),
          transac_from: '',
          transac_to: '',
          amount: extractAmount(rawText),
          transac_date: new Date().toISOString().split('T')[0],
          note: rawText || '',
        }
        if (!draft.property_id) missingFields.push('property_id')
        if (!draft.transac_type) missingFields.push('transac_type')
        output = { entity_type: 'transaction', draft, missing_fields: missingFields }
      } else if (entityType === 'asset') {
        const draft = {
          property_id: result?.context?.property_id || null,
          nickname: rawText.slice(0, 80) || 'New asset',
          type: result?.context?.asset_type_hint || detectAssetType(rawText),
          location: result?.context?.asset_location_hint || detectAssetLocation(rawText),
          brand: extractTaggedValue(rawText, /\b(?:brand|manufacturer)\s*[:#-]?\s*([A-Za-z0-9 ./_-]+)/i),
          model: extractTaggedValue(rawText, /\b(?:model|mod)\s*[:#-]?\s*([A-Za-z0-9 ./_-]+)/i),
          serial: extractTaggedValue(rawText, /\b(?:serial|s\/n|sn)\s*[:#-]?\s*([A-Za-z0-9 ./_-]+)/i),
          mfg_date: '',
          acquired_date: '',
          notes: rawText || '',
        }
        if (!draft.property_id) missingFields.push('property_id')
        if (!draft.nickname) missingFields.push('nickname')
        output = { entity_type: 'asset', draft, missing_fields: missingFields }
      } else if (entityType === 'reminder') {
        const startDate = new Date().toISOString().split('T')[0]
        const draft = {
          property_id: result?.context?.property_id || null,
          category: result?.context?.reminder_category_hint || detectReminderCategory(rawText),
          start_date: startDate,
          due_date: startDate,
          repeat_by: result?.context?.reminder_repeat_hint || detectReminderRepeat(rawText),
          amount: extractAmount(rawText),
          note: rawText || '',
          status: true,
        }
        if (!draft.property_id) missingFields.push('property_id')
        if (!draft.category) missingFields.push('category')
        output = { entity_type: 'reminder', draft, missing_fields: missingFields }
      } else {
        const category = classifyIssueCategory(rawText)
        const urgency = classifyUrgency(rawText)
        const draft = {
          title: rawText.slice(0, 120) || 'Untitled task',
          description: rawText || '',
          task_category: category,
          task_priority: urgency === 'high' ? 'high' : urgency === 'medium' ? 'medium' : 'low',
          status: 'open',
          property_id: result?.context?.property_id || null,
          lease_id: result?.context?.lease_id || null,
          unit_id: result?.context?.unit_id || null,
          photos: Array.isArray(body?.photos) ? body.photos : [],
          videos: Array.isArray(body?.videos) ? body.videos : [],
          attachments: Array.isArray(body?.attachments) ? body.attachments : [],
        }
        if (!draft.property_id) missingFields.push('property_id')
        if (!draft.description) missingFields.push('description')
        output = {
          entity_type: 'task',
          draft,
          missing_fields: missingFields,
        }
      }
    }

    await appendAgentEvent({
      eventType: 'agent_intake',
      actor,
      requestId,
      metadata: { capability: output?.capability || null },
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
        { gate_status: 'blocked', plan_required: null, upgrade_hint: null }
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

  route('POST', '/leases/:lease_id/inventories', async ({ actor, params, body, res, requestId }) => {
    if (!assertRole({ actor, allowed: ['pm_po'], res, requestId })) return
    const record = store.createInventory({ actor, leaseId: params.lease_id, body })
    ok(res, requestId, record)
  })

  route('GET', '/inventories/:id', async ({ params, res, requestId }) => {
    const inventory = store.inventories.get(params.id)
    if (!inventory) return sendError(res, requestId, 404, 'INVENTORY_NOT_FOUND', 'Inventory not found')
    ok(res, requestId, inventory)
  })

  route('PATCH', '/inventories/:id/draft', async ({ actor, params, body, res, requestId }) => {
    const inventory = store.inventories.get(params.id)
    if (!inventory) return sendError(res, requestId, 404, 'INVENTORY_NOT_FOUND', 'Inventory not found')
    if (actor.role !== 'tt' || inventory.assigned_tt_id !== actor.id) {
      return sendError(res, requestId, 403, 'PERMISSION_DENIED', 'Only assigned TT can update draft.')
    }
    inventory.draft = { ...(inventory.draft || {}), ...(body?.draft || {}) }
    inventory.updated_at = new Date().toISOString()
    ok(res, requestId, inventory)
  })

  route('POST', '/inventories/:id/submit', async ({ actor, params, res, requestId }) => {
    const inventory = store.inventories.get(params.id)
    if (!inventory) return sendError(res, requestId, 404, 'INVENTORY_NOT_FOUND', 'Inventory not found')
    if (actor.role !== 'tt' || inventory.assigned_tt_id !== actor.id) {
      return sendError(res, requestId, 403, 'PERMISSION_DENIED', 'Only assigned TT can submit draft.')
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

  route('POST', '/tasks/:id/sp-actions/contact', async ({ actor, params, body, res, requestId }) => {
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
  })

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

    const existing = (await getFirestoreLeadByTaskRef(mxId)) || (await getFirestoreLeadByTaskRef(taskDocId))
    if (existing) {
      const comments = Array.isArray(body?.comments) ? body.comments : Array.isArray(existing.comments) ? existing.comments : []
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
        property_name: body?.property_name || body?.property_address_line1 || existing.property_name || existing.property_address_line1 || '',
        property_address_line1: body?.property_address_line1 || existing.property_address_line1 || '',
        property_address_line2: body?.property_address_line2 || existing.property_address_line2 || '',
        property_city: body?.property_city || body?.city || existing.property_city || existing.city || '',
        property_state: body?.property_state || body?.state || existing.property_state || existing.state || '',
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
        state: body?.state || body?.property_state || existing.state || existing.property_state || '',
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
        semantic_tags: Array.isArray(body?.semantic_tags) && body.semantic_tags.length
          ? body.semantic_tags
          : existing.semantic_tags || extractSemanticTags(`${body?.title || existing.title || ''} ${body?.description || existing.description || ''} ${body?.scope || existing.scope || ''}`),
        comments,
        comment_count: Number(body?.comment_count ?? comments.length ?? existing.comment_count ?? 0),
        visibility_mode: body?.visibility_mode || existing.visibility_mode || 'public',
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
        `${body?.title || ''} ${body?.description || ''} ${body?.scope || ''}`
      ),
      comments,
      comment_count: Number(body?.comment_count ?? comments.length ?? 0),
      image_urls: imageUrls,
      photo_count: Number(body?.photo_count ?? imageUrls.length ?? 0),
      status: 'open',
      visibility_mode: 'public',
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

    const firestoreLead = (await getFirestoreLeadByTaskRef(mxId)) || (await getFirestoreLeadByTaskRef(taskDocId))
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
        (taskDocId && String(lead.task_doc_id || '') === taskDocId)
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
      return sendError(res, requestId, 403, 'PERMISSION_DENIED', 'Only task creator can publish a lead')
    }
    if (task.lead_id) {
      return sendError(res, requestId, 409, 'LEAD_ALREADY_EXISTS', 'Task already has a lead published')
    }

    const semanticTags = extractSemanticTags(`${task.title} ${task.description} ${body?.scope || ''}`)
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
      if (!spProfile) return sendError(res, requestId, 404, 'SP_PROFILE_NOT_FOUND', 'SP profile not found')
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
        return sendError(res, requestId, 403, 'LEAD_NOT_VISIBLE', 'This lead is not available to you')
      }
    }

    ok(res, requestId, { lead: normalizeLead(lead) })
  })

  route('PATCH', '/leads/:id/status', async ({ actor, params, body, res, requestId }) => {
    if (!assertRole({ actor, allowed: ['pm_po'], res, requestId })) return
    const lead = store.leads.get(params.id)
    if (!lead) return sendError(res, requestId, 404, 'LEAD_NOT_FOUND', 'Lead not found')
    if (lead.creator_id !== actor.id) {
      return sendError(res, requestId, 403, 'PERMISSION_DENIED', 'Only lead creator can change status')
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
      return sendError(res, requestId, 403, 'PERMISSION_DENIED', 'Only lead creator can view all bids')
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
    if (firestoreItems.length) return ok(res, requestId, { items: firestoreItems })
    const items = [...store.bids.values()]
      .filter((b) => b.sp_id === spId)
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
    ok(res, requestId, { items: items.map((row) => normalizeBid(row)) })
  })

  // Alias for frontend compatibility: SP bid list
  route('GET', '/sp/bids', async ({ actor, query, res, requestId }) => {
    if (!assertRole({ actor, allowed: ['sp'], res, requestId })) return
    const spId = query.get('sp_id') || actor.id
    if (spId !== actor.id) {
      return sendError(res, requestId, 403, 'PERMISSION_DENIED', 'Can only view your own bids')
    }
    const firestoreItems = await listFirestoreSpBids(spId)
    if (firestoreItems.length) return ok(res, requestId, { items: firestoreItems })
    const items = [...store.bids.values()]
      .filter((b) => b.sp_id === spId)
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
    ok(res, requestId, { items: items.map((row) => normalizeBid(row)) })
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
      return sendError(res, requestId, 403, 'PERMISSION_DENIED', 'Only lead creator can shortlist bids')
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
      return sendError(res, requestId, 403, 'PERMISSION_DENIED', 'Only lead creator can select a bid')
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
      return sendError(res, requestId, 403, 'PERMISSION_DENIED', 'Only lead creator can start conversations')
    }

    const existing = findFirst(
      store.conversations,
      (c) => c.lead_id === leadId && c.pm_id === actor.id && c.sp_id === spId
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
    items.sort((a, b) => (b.last_message_at || b.created_at).localeCompare(a.last_message_at || a.created_at))

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
    if (!conversation) return sendError(res, requestId, 404, 'CONVERSATION_NOT_FOUND', 'Conversation not found')
    if (!conversation.participants.includes(actor.id)) {
      return sendError(res, requestId, 403, 'PERMISSION_DENIED', 'Not a participant in this conversation')
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
    if (!conversation) return sendError(res, requestId, 404, 'CONVERSATION_NOT_FOUND', 'Conversation not found')
    if (!conversation.participants.includes(actor.id)) {
      return sendError(res, requestId, 403, 'PERMISSION_DENIED', 'Not a participant in this conversation')
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
    if (!assignment) return sendError(res, requestId, 404, 'ASSIGNMENT_NOT_FOUND', 'Assignment not found')
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
    if (!assignment) return sendError(res, requestId, 404, 'ASSIGNMENT_NOT_FOUND', 'Assignment not found')
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
    if (!assignment) return sendError(res, requestId, 404, 'ASSIGNMENT_NOT_FOUND', 'Assignment not found')
    if (assignment.pm_id !== actor.id) {
      return sendError(res, requestId, 403, 'PERMISSION_DENIED', 'Only the PM/PO who created this lead can revoke')
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
    if (!assignment) return sendError(res, requestId, 404, 'ASSIGNMENT_NOT_FOUND', 'Assignment not found')
    if (assignment.pm_id !== actor.id) {
      return sendError(res, requestId, 403, 'PERMISSION_DENIED', 'Only the lead PM/PO can mark complete')
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
      return sendError(res, requestId, 403, 'PERMISSION_DENIED', 'Can only read your own service profile')
    }

    try {
      const db = getDb()
      const doc = await db.collection('users').doc(requestedSpId).get()
      const userData = doc.exists ? (doc.data() || {}) : {}
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
        true
      )
    }
  })

  route('PUT', '/sp/services/profile', async ({ actor, body, res, requestId }) => {
    const requestedSpId = String(body?.sp_id || actor.id || '').trim()
    if (!requestedSpId) {
      return sendError(res, requestId, 400, 'MISSING_SP_ID', 'sp_id is required')
    }
    if (actor.role === 'sp' && actor.id !== requestedSpId) {
      return sendError(res, requestId, 403, 'PERMISSION_DENIED', 'Can only update your own service profile')
    }

    const descriptions = Array.isArray(body?.service_descriptions)
      ? body.service_descriptions
          .map((item) => String(item || '').trim().replace(/\s+/g, ' '))
          .filter((item) => item.length > 0)
      : []

    const zipCodes = Array.isArray(body?.service_zip_codes)
      ? [...new Set(body.service_zip_codes.map((zip) => String(zip || '').trim()))].filter((zip) =>
          /^\d{5}$/.test(zip)
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
        true
      )
    }
  })

  route('GET', '/sp/profile', async ({ actor, res, requestId }) => {
    if (!assertRole({ actor, allowed: ['sp'], res, requestId })) return
    const profile = store.spProfiles.get(actor.id)
    if (!profile) return sendError(res, requestId, 404, 'SP_PROFILE_NOT_FOUND', 'SP profile not found')
    ok(res, requestId, { profile })
  })

  route('PATCH', '/sp/profile', async ({ actor, body, res, requestId }) => {
    if (!assertRole({ actor, allowed: ['sp'], res, requestId })) return
    let profile = store.spProfiles.get(actor.id)
    if (!profile) {
      return sendError(res, requestId, 404, 'SP_PROFILE_NOT_FOUND', 'SP profile not found. Complete signup first.')
    }

    const updatableFields = [
      'business_name', 'service_categories', 'service_area',
      'service_area_radius_km', 'license_number', 'budget_band',
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
      return sendError(res, requestId, 403, 'PERMISSION_DENIED', 'Only owner SP can submit invoice.')
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
      return sendError(res, requestId, 400, 'INVALID_REVIEW_STATUS', 'Invalid invoice review status.')
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

  route('GET', '/billing/profile-summary', async ({ actor, res, requestId }) => {
    ok(res, requestId, {
      plan_name: actor.billing.plan_name,
      subscription_status: actor.billing.subscription_status,
      next_renewal_date: actor.billing.next_renewal_date,
      gate_status: 'ok',
    })
  })

  route('GET', '/billing/usage', async ({ actor, res, requestId }) => {
    ok(res, requestId, {
      properties_used: actor.billing.properties_used,
      properties_limit: actor.billing.properties_limit,
      voice_used: actor.billing.voice_used,
      voice_limit: actor.billing.voice_limit,
      storage_used_mb: actor.billing.storage_used_mb,
      storage_limit_mb: actor.billing.storage_limit_mb,
    })
  })

  route('GET', '/billing/credits', async ({ actor, res, requestId }) => {
    ok(res, requestId, { balance: actor.billing.credits })
  })

  route('POST', '/billing/upgrade', async ({ actor, body, res, requestId }) => {
    actor.billing.plan_name = body?.plan_name || 'pro'
    actor.billing.properties_limit = actor.billing.plan_name === 'pro' ? 50 : 3
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

  route('GET', '/sp/credits/summary', async ({ actor, res, requestId }) => {
    if (!assertRole({ actor, allowed: ['sp'], res, requestId })) return

    const firestoreAccount = await ensureFirestoreSpCreditAccount(actor.id)
    if (firestoreAccount) {
      return ok(res, requestId, {
        sp_id: actor.id,
        balance: toNumber(firestoreAccount.balance, 0),
        lifetime_purchased: toNumber(firestoreAccount.lifetime_purchased, 0),
        lifetime_used: toNumber(firestoreAccount.lifetime_used, 0),
        lifetime_granted: toNumber(firestoreAccount.lifetime_granted, 0),
        storage: 'firestore',
      })
    }

    const account = ensureSpCreditAccountMemory(actor.id)
    return ok(res, requestId, {
      sp_id: actor.id,
      balance: toNumber(account.balance, 0),
      lifetime_purchased: toNumber(account.lifetime_purchased, 0),
      lifetime_used: toNumber(account.lifetime_used, 0),
      lifetime_granted: toNumber(account.lifetime_granted, 0),
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
    const credits = Math.max(1, Number(body?.credits || 1))
    const amount = Math.max(0, Number(body?.amount || 0))
    const now = new Date().toISOString()

    const createOrder = async () => {
      const order = {
        id: `credit-order-${randomUUID()}`,
        sp_id: actor.id,
        package_id: body?.package_id || null,
        credits,
        amount,
        currency: body?.currency || 'USD',
        status: 'pending',
        provider: body?.provider || 'manual_placeholder',
        provider_order_id: null,
        provider_txn_id: null,
        created_at: now,
        updated_at: now,
        paid_at: null,
      }

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
      })
    )

    return ok(res, requestId, {
      order: result,
      checkout_hint: 'Use payment provider callback to confirm and credit the account.',
    })
  })

  route('POST', '/sp/credits/payments/callback', async ({ body, res, requestId }) => {
    const orderId = String(body?.order_id || '').trim()
    if (!orderId) {
      return sendError(res, requestId, 400, 'MISSING_ORDER_ID', 'order_id is required')
    }
    const status = String(body?.status || '').trim().toLowerCase()
    if (!['paid', 'failed', 'cancelled'].includes(status)) {
      return sendError(res, requestId, 400, 'INVALID_STATUS', 'status must be paid, failed, or cancelled')
    }

    const now = new Date().toISOString()
    try {
      const db = getDb()
      const result = await db.runTransaction(async (tx) => {
        const orderRef = db.collection(SP_CREDIT_ORDERS_COLLECTION).doc(orderId)
        const orderSnap = await tx.get(orderRef)
        if (!orderSnap.exists) throw createApiError(404, 'ORDER_NOT_FOUND', 'Credit order not found')
        const order = { id: orderSnap.id, ...(orderSnap.data() || {}) }

        const alreadyPaid = String(order.status || '').toLowerCase() === 'paid'
        const patch = {
          status,
          provider_txn_id: body?.provider_txn_id || order.provider_txn_id || null,
          updated_at: now,
          paid_at: status === 'paid' ? (body?.paid_at || now) : order.paid_at || null,
        }
        tx.set(orderRef, patch, { merge: true })

        let credited = 0
        let balanceAfter = null
        if (status === 'paid' && !alreadyPaid) {
          const credits = Math.max(1, Number(order.credits || 1))
          const accountRef = db.collection(SP_CREDIT_ACCOUNTS_COLLECTION).doc(order.sp_id)
          const accountSnap = await tx.get(accountRef)
          const account = accountSnap.exists
            ? {
                ...buildDefaultSpCreditAccount(order.sp_id, accountSnap.data()?.created_at || now),
                ...(accountSnap.data() || {}),
                sp_id: order.sp_id,
                balance: toNumber(accountSnap.data()?.balance, 0),
                lifetime_purchased: toNumber(accountSnap.data()?.lifetime_purchased, 0),
                lifetime_used: toNumber(accountSnap.data()?.lifetime_used, 0),
                lifetime_granted: toNumber(accountSnap.data()?.lifetime_granted, 0),
                last_free_credit_at: accountSnap.data()?.last_free_credit_at || null,
              }
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
              { merge: true }
            )
          }
          if (granted.granted > 0) {
            const grantLedgerId = `credit-ledger-${randomUUID()}`
            tx.set(db.collection(SP_CREDIT_LEDGER_COLLECTION).doc(grantLedgerId), {
              id: grantLedgerId,
              sp_id: order.sp_id,
              entry_type: 'grant',
              delta: granted.granted,
              balance_after: granted.account.balance,
              source_type: 'free_credit',
              source_id: granted.grantType || 'starter',
              created_at: now,
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
            { merge: true }
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
            created_at: now,
            meta: {
              amount: Number(order.amount || 0),
              currency: order.currency || 'USD',
              provider: order.provider || 'manual_placeholder',
            },
          })
          credited = credits
        }

        return { order_id: order.id, sp_id: order.sp_id, status, credited, balance_after: balanceAfter }
      })
      return ok(res, requestId, { ...result, storage: 'firestore' })
    } catch (error) {
      if (error?.code && error?.status) {
        return sendError(res, requestId, error.status, error.code, error.message)
      }

      if (!store.spCreditOrders) store.spCreditOrders = new Map()
      const order = store.spCreditOrders.get(orderId)
      if (!order) return sendError(res, requestId, 404, 'ORDER_NOT_FOUND', 'Credit order not found')

      const wasPaid = String(order.status || '').toLowerCase() === 'paid'
      order.status = status
      order.provider_txn_id = body?.provider_txn_id || order.provider_txn_id || null
      order.updated_at = now
      if (status === 'paid') order.paid_at = body?.paid_at || now

      let credited = 0
      let balanceAfter = null
      if (status === 'paid' && !wasPaid) {
        const credits = Math.max(1, Number(order.credits || 1))
        const account = ensureSpCreditAccountMemory(order.sp_id)
        balanceAfter = toNumber(account.balance, 0) + credits
        account.balance = balanceAfter
        account.lifetime_purchased = toNumber(account.lifetime_purchased, 0) + credits
        account.updated_at = now
        appendSpCreditLedgerMemory({
          id: `credit-ledger-${randomUUID()}`,
          sp_id: order.sp_id,
          entry_type: 'purchase',
          delta: credits,
          balance_after: balanceAfter,
          source_type: 'credit_order',
          source_id: order.id,
          created_at: now,
          meta: {
            amount: Number(order.amount || 0),
            currency: order.currency || 'USD',
            provider: order.provider || 'manual_placeholder',
          },
        })
        credited = credits
      }

      return ok(res, requestId, {
        order_id: order.id,
        sp_id: order.sp_id,
        status,
        credited,
        balance_after: balanceAfter,
        storage: 'memory',
      })
    }
  })

  route('GET', '/reports/task-status', async ({ res, requestId }) => {
    const firestoreTasks = await listFirestoreTasks()
    const source = firestoreTasks.length ? firestoreTasks : [...store.tasks.values()]
    const rows = source.map((task) => ({
      task_id: task.id,
      status: task.status,
      updated_at: task.updated_at,
    }))
    ok(res, requestId, { rows })
  })

  route('GET', '/reports/occupancy-lease', async ({ res, requestId }) => {
    ok(res, requestId, {
      rows: [
        { property_id: 'prop-1', occupied_units: 9, total_units: 10 },
        { property_id: 'prop-2', occupied_units: 14, total_units: 20 },
      ],
    })
  })

  route('GET', '/reports/income-expense', async ({ actor, res, requestId }) => {
    const gate = checkPlanGate({ actor, action: 'advanced_reports' })
    if (gate.blocked) {
      return sendError(
        res,
        requestId,
        403,
        'PLAN_NOT_ELIGIBLE',
        'Current plan cannot access this report.',
        false,
        gate.response
      )
    }
    ok(res, requestId, {
      gate_status: gate.response.gate_status,
      rows: [{ period: '2026-01', income: 12000, expense: 4600 }],
    })
  })

  route('GET', '/reports/annual-tax-finance', async ({ actor, query, res, requestId }) => {
    const gate = checkPlanGate({ actor, action: 'advanced_reports' })
    if (gate.blocked) {
      return sendError(
        res,
        requestId,
        403,
        'PLAN_NOT_ELIGIBLE',
        'Current plan cannot access annual tax finance report.',
        false,
        gate.response
      )
    }
    const year = Number(query.get('year') || new Date().getFullYear())
    ok(res, requestId, {
      gate_status: gate.response.gate_status,
      year,
      revenue_total: 146000,
      expense_total: 61200,
      net_total: 84800,
    })
  })

  const handler = async (req, res) => {
    const requestId = withRequestId(req)
    if (req.method === 'OPTIONS') return json(res, 204, { request_id: requestId })
    try {
      const rawUrl = (req.url || '/').replace(/^\/api/, '') || '/'
      const url = new URL(rawUrl, 'http://localhost')
      const requestBodyForAuthBypass =
        ['POST', 'PUT', 'PATCH'].includes(req.method || '') ? await readBody(req) : {}
      const authContext = await resolveActorFromRequest(req)
      const isAdminPath = url.pathname.startsWith('/admin/')
      const hasAdminClaim =
        authContext?.claims?.admin === true ||
        (Array.isArray(authContext?.claims?.roles) && authContext.claims.roles.includes('admin'))
      const backfillToken = String(
        requestBodyForAuthBypass?.backfill_token || requestBodyForAuthBypass?.token || '',
      ).trim()
      const allowBackfillBypass =
        url.pathname === '/admin/backfill/task-addresses' && backfillToken === TASK_ADDRESS_BACKFILL_TOKEN
      if (isAdminPath && !allowBackfillBypass && (!authContext.verified || !hasAdminClaim)) {
        return sendError(res, requestId, 401, 'UNAUTHENTICATED', 'Admin Firebase authentication is required')
      }
      const actor = authContext.actor
      const body = requestBodyForAuthBypass
      for (const row of routes) {
        if (row.method !== req.method) continue
        const params = pathMatch(url.pathname, row.pattern)
        if (!params) continue
        return row.handler({ req, res, requestId, actor, params, body, query: url.searchParams })
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
  return { server, handler, store }
}
