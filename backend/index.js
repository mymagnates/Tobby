import { onRequest } from 'firebase-functions/v2/https'
import { onDocumentCreated, onDocumentUpdated } from 'firebase-functions/v2/firestore'
import { getApps, initializeApp } from 'firebase-admin/app'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { createApiServer } from './apiServer.js'
import { extractSemanticTags } from './marketplace.js'

let cachedHandler = null
const getHandler = () => {
  if (cachedHandler) return cachedHandler
  const { handler } = createApiServer()
  cachedHandler = handler
  return cachedHandler
}

export const mkpl = onRequest(
  {
    region: 'us-central1',
    cors: true,
  },
  (req, res) => getHandler()(req, res),
)

if (!getApps().length) initializeApp()
const db = getFirestore()

const normalizeTaskStatus = (status) => String(status || '').trim().toLowerCase()

const mapTaskStatusToLeadStatus = (taskStatus, currentLeadStatus = 'open') => {
  const normalized = normalizeTaskStatus(taskStatus)
  if (!normalized) return currentLeadStatus || 'open'
  if (['closed', 'complete', 'completed', 'resolved'].includes(normalized)) return 'closed'
  if (['cancel', 'cancelled', 'canceled'].includes(normalized)) return 'cancelled'
  if (['open', 'new', 'pending', 'in_progress', 'reopened'].includes(normalized)) {
    return currentLeadStatus === 'assigned' ? 'assigned' : 'open'
  }
  return currentLeadStatus || 'open'
}

const toIsoString = (value) => {
  if (!value) return null
  if (typeof value?.toDate === 'function') return value.toDate().toISOString()
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString()
}

const buildLeadPatchFromTask = ({ taskId, propertyId, taskData, existingLead }) => {
  const now = new Date().toISOString()
  const currentLead = existingLead || {}
  const mxId = String(taskData?.mx_id || currentLead.mx_id || taskId)
  const taskStatus = String(taskData?.status || 'open')
  const nextLeadStatus = mapTaskStatusToLeadStatus(taskStatus, currentLead.status || 'open')
  const description = String(taskData?.description || currentLead.description || '')
  const comments = Array.isArray(taskData?.comments) ? taskData.comments : (Array.isArray(currentLead.comments) ? currentLead.comments : [])
  const imageUrls = Array.isArray(taskData?.image_urls)
    ? taskData.image_urls
    : Array.isArray(taskData?.photos)
      ? taskData.photos
      : Array.isArray(currentLead.image_urls)
        ? currentLead.image_urls
        : Array.isArray(currentLead.photos)
          ? currentLead.photos
          : []
  const title = String(
    taskData?.title ||
      currentLead.title ||
      (description ? description.slice(0, 80) : 'New Task Lead')
  )

  return {
    lead_id: currentLead.lead_id || currentLead.id || `lead-task-${taskId}`,
    // mx_id is the canonical task linkage key for marketplace.
    mx_id: mxId,
    task_id: mxId,
    // Keep Firestore doc id as redundant system reference.
    task_doc_id: taskId,
    property_id: propertyId || taskData?.property_id || currentLead.property_id || null,
    property_name: String(
      taskData?.property_name ||
        taskData?.property_address_line1 ||
        currentLead.property_name ||
        currentLead.property_address_line1 ||
        '',
    ),
    property_address_line1: String(taskData?.property_address_line1 || currentLead.property_address_line1 || ''),
    property_address_line2: String(taskData?.property_address_line2 || currentLead.property_address_line2 || ''),
    property_city: String(taskData?.property_city || taskData?.city || currentLead.property_city || currentLead.city || ''),
    property_state: String(taskData?.property_state || taskData?.state || currentLead.property_state || currentLead.state || ''),
    property_zip: String(
      taskData?.property_zip ||
        taskData?.zip_code ||
        taskData?.postal_code ||
        taskData?.zip ||
        currentLead.property_zip ||
        currentLead.zip_code ||
        currentLead.postal_code ||
        currentLead.zip ||
        '',
    ),
    city: String(taskData?.city || taskData?.property_city || currentLead.city || currentLead.property_city || ''),
    state: String(taskData?.state || taskData?.property_state || currentLead.state || currentLead.property_state || ''),
    zip_code: String(
      taskData?.zip_code ||
        taskData?.property_zip ||
        taskData?.postal_code ||
        taskData?.zip ||
        currentLead.zip_code ||
        currentLead.property_zip ||
        currentLead.postal_code ||
        currentLead.zip ||
        '',
    ),
    postal_code: String(
      taskData?.postal_code ||
        taskData?.property_zip ||
        taskData?.zip_code ||
        taskData?.zip ||
        currentLead.postal_code ||
        currentLead.property_zip ||
        currentLead.zip_code ||
        currentLead.zip ||
        '',
    ),
    lease_id: taskData?.lease_id || currentLead.lease_id || null,
    creator_id: taskData?.create_id || currentLead.creator_id || null,
    creator_role: taskData?.reported_role || currentLead.creator_role || null,
    title,
    description,
    scope: description,
    location: String(taskData?.location || currentLead.location || ''),
    address: String(taskData?.address || currentLead.address || ''),
    budget_range: String(taskData?.budget_range || currentLead.budget_range || ''),
    urgency: String(taskData?.urgency || currentLead.urgency || 'normal'),
    due_date: taskData?.report_date || currentLead.due_date || null,
    semantic_tags: extractSemanticTags(`${title} ${description}`),
    status: nextLeadStatus,
    visibility_mode: currentLead.visibility_mode || 'public',
    bid_deadline: currentLead.bid_deadline || null,
    bid_count: currentLead.bid_count || 0,
    assigned_sp_id: currentLead.assigned_sp_id || null,
    assigned_bid_id: currentLead.assigned_bid_id || null,
    comments,
    comment_count: Number(taskData?.comment_count ?? comments.length ?? currentLead.comment_count ?? 0),
    image_urls: imageUrls,
    photo_count: Number(taskData?.photo_count ?? imageUrls.length ?? currentLead.photo_count ?? 0),
    source: currentLead.source || 'task-trigger',
    task_status: taskStatus,
    task_updated_at: toIsoString(taskData?.updatedAt) || now,
    created_at: currentLead.created_at || toIsoString(taskData?.createAt) || now,
    updated_at: now,
    synced_by: 'task-trigger',
    synced_at: now,
  }
}

const upsertLeadFromTask = async ({ propertyId, taskId, taskData }) => {
  const leadDocId = `task-${taskId}`
  const leadRef = db.collection('marketplace_leads').doc(leadDocId)
  const existingLeadSnap = await leadRef.get()
  const existingLead = existingLeadSnap.exists ? existingLeadSnap.data() || {} : null
  const patch = buildLeadPatchFromTask({
    taskId,
    propertyId,
    taskData,
    existingLead,
  })

  await leadRef.set(
    {
      id: leadDocId,
      ...patch,
      updated_server_at: FieldValue.serverTimestamp(),
    },
    { merge: true }
  )
}

export const onTaskCreatedLeadSync = onDocumentCreated(
  {
    region: 'us-central1',
    document: 'properties/{propertyId}/mxrecords/{mxrecordId}',
  },
  async (event) => {
    const taskData = event.data?.data()
    if (!taskData) return
    await upsertLeadFromTask({
      propertyId: event.params.propertyId,
      taskId: event.params.mxrecordId,
      taskData,
    })
  }
)

export const onTaskUpdatedLeadSync = onDocumentUpdated(
  {
    region: 'us-central1',
    document: 'properties/{propertyId}/mxrecords/{mxrecordId}',
  },
  async (event) => {
    const taskData = event.data?.after?.data()
    if (!taskData) return
    await upsertLeadFromTask({
      propertyId: event.params.propertyId,
      taskId: event.params.mxrecordId,
      taskData,
    })
  }
)
