import { randomUUID } from 'node:crypto'

const nowIso = () => new Date().toISOString()

const createUser = (id, role, plan = 'free') => ({
  id,
  role,
  email: `${id}@handout.local`,
  account_type: role,
  status: 'active',
  is_paid: plan !== 'free',
  last_active_at: nowIso(),
  created_at: nowIso(),
  billing: {
    plan_name: plan,
    subscription_status: 'active',
    next_renewal_date: null,
    properties_used: 0,
    properties_limit: plan === 'pro' ? 50 : 3,
    voice_used: 0,
    voice_limit: plan === 'pro' ? 500 : 0,
    storage_used_mb: 0,
    storage_limit_mb: plan === 'pro' ? 5120 : 512,
    credits: plan === 'pro' ? 20 : 0,
    history: [],
  },
})

const resolvePlanForRole = (role) => (role === 'pm_po' || role === 'admin' ? 'pro' : 'free')

const seedSpProfile = (id, overrides = {}) => ({
  id,
  user_id: id,
  business_name: overrides.business_name || 'Default SP Business',
  service_categories: overrides.service_categories || ['plumbing'],
  service_area: overrides.service_area || 'San Jose, CA',
  service_area_radius_km: overrides.service_area_radius_km || 50,
  semantic_tags: overrides.semantic_tags || ['plumbing', 'pipe-repair', 'water-heater'],
  budget_band: overrides.budget_band || 'mid',
  urgency_capability: overrides.urgency_capability || 'normal',
  license_number: overrides.license_number || 'LIC-0001',
  verification_status: overrides.verification_status || 'approved',
  rating_avg: overrides.rating_avg || 4.5,
  total_jobs_completed: overrides.total_jobs_completed || 12,
  match_preferences: overrides.match_preferences || {
    min_budget: null,
    max_distance_km: 50,
    categories: ['plumbing'],
    urgency_accept: ['normal', 'urgent'],
    availability: 'available',
  },
  extraction_hash: overrides.extraction_hash || null,
  created_at: nowIso(),
  updated_at: nowIso(),
})

export const createInMemoryStore = () => {
  const users = new Map()

  const tasks = new Map()
  const inventories = new Map()
  const spCards = new Map()
  const invoices = new Map()
  const idempotency = new Map()

  const leads = new Map()
  const bids = new Map()
  const conversations = new Map()
  const messages = new Map()
  const assignments = new Map()
  const spCreditAccounts = new Map()
  const spCreditLedger = new Map()
  const spCreditOrders = new Map()
  const spProfiles = new Map()
  const adminMetricsDaily = new Map()
  const adminEvents = new Map()
  const adminErrors = new Map()
  const agentEvents = new Map()
  const spSources = new Map()
  const adPosts = new Map()
  const adPostTargetRegions = new Map()
  const adPostSourceIndex = new Map()
  const adSlotConfigs = new Map()
  const adDeliveryLogs = new Map()
  const adDeliveryByToken = new Map()
  const adImpressionEvents = new Map()
  const adClickEvents = new Map()
  const userRegionProfiles = new Map()
  const promoCampaigns = new Map()

  const ensureUser = (id = 'u-tt-1', roleHint = null) => {
    const existing = users.get(id)
    if (existing) return existing

    const normalizedRole = ['pm_po', 'tt', 'sp', 'admin'].includes(roleHint) ? roleHint : 'tt'
    const created = createUser(id, normalizedRole, resolvePlanForRole(normalizedRole))
    users.set(id, created)

    if (normalizedRole === 'sp' && !spProfiles.has(id)) {
      spProfiles.set(
        id,
        seedSpProfile(id, {
          business_name: `SP ${id.slice(0, 8)}`,
        })
      )
    }

    return created
  }

  const ensureUserRegion = (userId, fallback = {}) => {
    const existing = userRegionProfiles.get(userId)
    if (existing) return existing
    const created = {
      user_id: userId,
      country_code: String(fallback.country_code || 'US').toUpperCase(),
      state_code: String(fallback.state_code || 'CA').toUpperCase(),
      city_code: String(fallback.city_code || 'US-CA-SJC').toUpperCase(),
      updated_at: nowIso(),
    }
    userRegionProfiles.set(userId, created)
    return created
  }

  const createTask = ({ actor, body }) => {
    const title = body?.title || body?.task_title || 'Untitled task'
    const description = body?.description || body?.task_description || ''
    const category = body?.task_category || body?.category || null
    const priority = body?.task_priority || body?.priority || null
    const unitId = body?.unit_id || null
    const photos = Array.isArray(body?.photos) ? body.photos : []
    const videos = Array.isArray(body?.videos) ? body.videos : []
    const attachments = Array.isArray(body?.attachments) ? body.attachments : []
    const now = nowIso()
    const id = `task-${randomUUID()}`
    const record = {
      id,
      title,
      task_title: title,
      description,
      task_description: description,
      task_category: category,
      task_priority: priority,
      status: body?.status || 'open',
      creator_user_id: actor.id,
      lease_id: body?.lease_id || null,
      property_id: body?.property_id || null,
      unit_id: unitId,
      photos,
      photo_count: photos.length,
      videos,
      attachments,
      comments: [],
      assigned_sp_id: null,
      lead_id: null,
      created_at: now,
      updated_at: now,
    }
    tasks.set(id, record)
    return record
  }

  const createLead = ({ actor, task, body }) => {
    const id = `lead-${randomUUID()}`
    const mxId = body?.mx_id || task.mx_id || task.id
    const comments = Array.isArray(body?.comments) ? body.comments : []
    const imageUrls = Array.isArray(body?.image_urls)
      ? body.image_urls
      : Array.isArray(body?.photos)
        ? body.photos
        : Array.isArray(task?.photos)
          ? task.photos
          : Array.isArray(task?.image_urls)
            ? task.image_urls
            : []
    const record = {
      id,
      mx_id: mxId,
      task_id: mxId,
      task_doc_id: task.id,
      property_id: task.property_id || body?.property_id || null,
      property_name:
        body?.property_name ||
        body?.property_address_line1 ||
        task.property_name ||
        task.property_address_line1 ||
        task.property?.address?.street ||
        task.property?.address?.line1 ||
        task.property?.name ||
        '',
      property_address_line1: body?.property_address_line1 || task.property_address_line1 || task.property?.address?.street || task.property?.address?.line1 || task.property?.address?.address1 || '',
      property_address_line2: body?.property_address_line2 || task.property_address_line2 || task.property?.address?.line2 || task.property?.address?.unit || '',
      property_city: body?.property_city || body?.city || task.property_city || task.city || task.property?.address?.city || task.property?.city || '',
      property_state: body?.property_state || body?.state || task.property_state || task.state || task.property?.address?.state || task.property?.state || '',
      property_zip: body?.property_zip || body?.zip_code || body?.postal_code || body?.zip || task.property_zip || task.zip || task.zip_code || task.postal_code || task.property?.address?.zip || task.property?.zip || '',
      city: body?.city || body?.property_city || task.city || task.property_city || task.property?.address?.city || task.property?.city || '',
      state: body?.state || body?.property_state || task.state || task.property_state || task.property?.address?.state || task.property?.state || '',
      zip_code: body?.zip_code || body?.property_zip || body?.postal_code || body?.zip || task.zip_code || task.property_zip || task.postal_code || task.zip || task.property?.address?.zip || task.property?.zip || '',
      postal_code: body?.postal_code || body?.property_zip || body?.zip_code || body?.zip || task.postal_code || task.property_zip || task.zip_code || task.zip || task.property?.address?.zip || task.property?.zip || '',
      creator_id: actor.id,
      title: body?.title || task.title,
      description: body?.description || task.description,
      scope: body?.scope || '',
      location: body?.location || '',
      service_area: body?.service_area || '',
      budget_range: body?.budget_range || '',
      urgency: body?.urgency || 'normal',
      due_date: body?.due_date || null,
      semantic_tags: body?.semantic_tags || [],
      image_urls: imageUrls,
      photo_count: Number(body?.photo_count ?? imageUrls.length ?? 0),
      comments,
      comment_count: Number(body?.comment_count ?? comments.length ?? 0),
      status: 'open',
      visibility_mode: body?.visibility_mode || 'public',
      bid_deadline: body?.bid_deadline || null,
      bid_count: 0,
      assigned_sp_id: null,
      assigned_bid_id: null,
      created_at: nowIso(),
      updated_at: nowIso(),
    }
    leads.set(id, record)
    task.lead_id = id
    task.updated_at = nowIso()
    return record
  }

  const createBid = ({ actor, lead, body }) => {
    const id = `bid-${randomUUID()}`
    const record = {
      id,
      lead_id: lead.id,
      mx_id: lead.mx_id || lead.task_id || null,
      task_id: lead.task_id,
      task_doc_id: lead.task_doc_id || null,
      sp_id: actor.id,
      amount: Number(body?.amount || 0),
      currency: body?.currency || 'USD',
      note: body?.note || '',
      estimated_duration: body?.estimated_duration || '',
      availability_date: body?.availability_date || null,
      status: 'submitted',
      status_changed_by: null,
      created_at: nowIso(),
      updated_at: nowIso(),
    }
    bids.set(id, record)
    lead.bid_count = (lead.bid_count || 0) + 1
    lead.updated_at = nowIso()
    return record
  }

  const createConversation = ({ actor, lead, spId }) => {
    const id = `conv-${randomUUID()}`
    const record = {
      id,
      lead_id: lead.id,
      task_id: lead.task_id,
      type: 'pm_sp_direct',
      participants: [actor.id, spId],
      pm_id: actor.id,
      sp_id: spId,
      status: 'active',
      last_message_at: null,
      created_at: nowIso(),
    }
    conversations.set(id, record)
    return record
  }

  const createMessage = ({ actor, conversation, body }) => {
    const id = `msg-${randomUUID()}`
    const record = {
      id,
      conversation_id: conversation.id,
      sender_id: actor.id,
      sender_role: actor.role === 'sp' ? 'sp' : 'pm_po',
      body: body?.body || '',
      message_type: body?.message_type || 'text',
      quote_data: body?.message_type === 'quote' ? (body?.quote_data || null) : null,
      visibility: body?.message_type === 'quote' ? 'pm_only' : (body?.visibility || 'all'),
      read_by: [actor.id],
      created_at: nowIso(),
    }

    if (!messages.has(conversation.id)) {
      messages.set(conversation.id, [])
    }
    messages.get(conversation.id).push(record)
    conversation.last_message_at = record.created_at
    return record
  }

  const createAssignment = ({ lead, bid, spId }) => {
    const id = `asgn-${randomUUID()}`
    const record = {
      id,
      lead_id: lead.id,
      task_id: lead.task_id,
      bid_id: bid.id,
      sp_id: spId,
      pm_id: lead.creator_id,
      status: 'pending_acceptance',
      created_at: nowIso(),
      updated_at: nowIso(),
    }
    assignments.set(id, record)
    return record
  }

  const createInventory = ({ actor, leaseId, body }) => {
    const id = `inv-${randomUUID()}`
    const record = {
      id,
      lease_id: leaseId,
      created_by: actor.id,
      assigned_tt_id: body?.assigned_tt_id || null,
      status: 'draft',
      draft: body?.draft || {},
      submitted_at: null,
      created_at: nowIso(),
      updated_at: nowIso(),
    }
    inventories.set(id, record)
    return record
  }

  const createSpCard = ({ actor, body }) => {
    const id = `spc-${randomUUID()}`
    const record = {
      id,
      owner_id: body?.owner_id || actor.id,
      sp_id: body?.sp_id || null,
      sp_name_snapshot: body?.sp_name_snapshot || '',
      owner_note: body?.owner_note || '',
      tags: Array.isArray(body?.tags) ? body.tags : [],
      created_at: nowIso(),
      updated_at: nowIso(),
    }
    spCards.set(id, record)
    return record
  }

  const createInvoice = ({ actor, body }) => {
    const id = `invoc-${randomUUID()}`
    const subtotal = Number(body?.subtotal || 0)
    const tax = Number(body?.tax || 0)
    const discount = Number(body?.discount || 0)
    const total = subtotal + tax - discount
    const record = {
      id,
      task_id: body?.task_id || null,
      created_by: actor.id,
      line_items: Array.isArray(body?.line_items) ? body.line_items : [],
      subtotal,
      tax,
      discount,
      total,
      currency: body?.currency || 'USD',
      status: 'draft',
      review_note: null,
      created_at: nowIso(),
      updated_at: nowIso(),
    }
    invoices.set(id, record)
    return record
  }

  adSlotConfigs.set('pm_feed_top', {
    slot_id: 'pm_feed_top',
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
  })

  ensureUserRegion('u-pm-1', { country_code: 'US', state_code: 'CA', city_code: 'US-CA-SJC' })
  ensureUserRegion('u-po-1', { country_code: 'US', state_code: 'CA', city_code: 'US-CA-SJC' })
  ensureUserRegion('u-tt-1', { country_code: 'US', state_code: 'CA', city_code: 'US-CA-SJC' })
  ensureUserRegion('u-sp-1', { country_code: 'US', state_code: 'CA', city_code: 'US-CA-SJC' })
  ensureUserRegion('u-sp-2', { country_code: 'US', state_code: 'TX', city_code: 'US-TX-AUS' })
  ensureUserRegion('u-sp-3', { country_code: 'US', state_code: 'CA', city_code: 'US-CA-SFO' })

  return {
    users,
    tasks,
    inventories,
    spCards,
    invoices,
    idempotency,
    leads,
    bids,
    conversations,
    messages,
    assignments,
    spCreditAccounts,
    spCreditLedger,
    spCreditOrders,
    spProfiles,
    adminMetricsDaily,
    adminEvents,
    adminErrors,
    agentEvents,
    spSources,
    adPosts,
    adPostTargetRegions,
    adPostSourceIndex,
    adSlotConfigs,
    adDeliveryLogs,
    adDeliveryByToken,
    adImpressionEvents,
    adClickEvents,
    userRegionProfiles,
    promoCampaigns,
    ensureUser,
    ensureUserRegion,
    createTask,
    createLead,
    createBid,
    createConversation,
    createMessage,
    createAssignment,
    createInventory,
    createSpCard,
    createInvoice,
  }
}
