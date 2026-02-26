import { onRequest } from 'firebase-functions/v2/https'
import { onDocumentCreated, onDocumentUpdated } from 'firebase-functions/v2/firestore'
import { getApps, initializeApp } from 'firebase-admin/app'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { createApiServer } from './apiServer.js'
import { extractSemanticTags } from './marketplace.js'

const { handler } = createApiServer()

export const mkpl = onRequest(
  { region: 'us-central1', cors: true },
  handler,
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
