import { onRequest } from 'firebase-functions/v2/https'
import { onDocumentCreated, onDocumentUpdated } from 'firebase-functions/v2/firestore'
import { defineSecret } from 'firebase-functions/params'
import { getApps, initializeApp } from 'firebase-admin/app'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { createApiServer } from './apiServer.js'
import { extractSemanticTags } from './marketplace.js'

const resendApiKeySecret = defineSecret('RESEND_API_KEY')
const inviteEmailFromSecret = defineSecret('INVITE_EMAIL_FROM')
const appBaseUrlSecret = defineSecret('APP_BASE_URL')
const geminiApiKeySecret = defineSecret('GEMINI_API_KEY')

let cachedHandler = null
const getHandler = () => {
  if (cachedHandler) return cachedHandler
  const { handler } = createApiServer({
    config: {
      resendApiKey: resendApiKeySecret.value() || process.env.RESEND_API_KEY || '',
      inviteEmailFrom: inviteEmailFromSecret.value() || process.env.INVITE_EMAIL_FROM || '',
      appBaseUrl: appBaseUrlSecret.value() || process.env.APP_BASE_URL || '',
      geminiApiKey:
        geminiApiKeySecret.value() ||
        process.env.GEMINI_API_KEY ||
        process.env.GOOGLE_API_KEY ||
        '',
    },
  })
  cachedHandler = handler
  return cachedHandler
}

export const mkpl = onRequest(
  {
    region: 'us-central1',
    cors: true,
    secrets: [resendApiKeySecret, inviteEmailFromSecret, appBaseUrlSecret, geminiApiKeySecret],
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
  const isPublishedToSp =
    taskData?.sp_published === true ||
    String(taskData?.sp_publish_status || '').trim().toLowerCase() === 'published'

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
    sp_published: isPublishedToSp,
    sp_publish_status: isPublishedToSp ? 'published' : 'draft',
    sp_published_at:
      taskData?.sp_published_at || currentLead.sp_published_at || null,
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
  const isPublishedToSp =
    taskData?.sp_published === true ||
    String(taskData?.sp_publish_status || '').trim().toLowerCase() === 'published'

  if (!isPublishedToSp) {
    const existingLeadSnap = await leadRef.get()
    if (existingLeadSnap.exists) {
      await leadRef.delete()
    }
    return
  }

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

const normalizeRef = (value) => String(value || '').trim()

const getLeadDocsByTaskRef = async (taskId) => {
  const ref = normalizeRef(taskId)
  if (!ref) return []

  const seen = new Map()
  for (const field of ['task_doc_id', 'mx_id', 'task_id']) {
    const snap = await db.collection('marketplace_leads').where(field, '==', ref).limit(5).get()
    snap.docs.forEach((doc) => {
      if (!seen.has(doc.id)) seen.set(doc.id, doc)
    })
  }
  return Array.from(seen.values())
}

const buildAssignedSpFromTaskSelection = ({ taskData, bidData, actorId, acceptedAt }) => ({
  sp_id: normalizeRef(taskData?.assigned_sp_id || taskData?.assigned_sp?.sp_id || bidData?.sp_id),
  sp_name: String(
    taskData?.assigned_sp?.sp_name ||
      bidData?.sp_name ||
      bidData?.sp_business_name ||
      bidData?.provider_name ||
      ''
  ).trim(),
  sp_contact: taskData?.assigned_sp?.sp_contact || bidData?.sp_contact || null,
  sp_rating: taskData?.assigned_sp?.sp_rating || bidData?.sp_rating || bidData?.sp_rating_avg || null,
  bid_id: normalizeRef(taskData?.selected_bid_id || taskData?.assigned_sp?.bid_id || bidData?.bid_id || bidData?.id),
  bid_amount: Number(taskData?.assigned_sp?.bid_amount || bidData?.amount || 0),
  assigned_at: acceptedAt,
  assigned_by: normalizeRef(taskData?.assigned_sp?.assigned_by || actorId),
})

const syncTaskSelectionToMarketplace = async ({ propertyId, taskId, beforeData = null, taskData }) => {
  const previousBidId = normalizeRef(beforeData?.selected_bid_id || beforeData?.assigned_sp?.bid_id)
  const previousSpId = normalizeRef(beforeData?.assigned_sp_id || beforeData?.assigned_sp?.sp_id)
  const selectedBidId = normalizeRef(taskData?.selected_bid_id || taskData?.assigned_sp?.bid_id)
  const assignedSpId = normalizeRef(taskData?.assigned_sp_id || taskData?.assigned_sp?.sp_id)

  if (beforeData && previousBidId === selectedBidId && previousSpId === assignedSpId) return

  const leadDocs = await getLeadDocsByTaskRef(taskId)
  if (!leadDocs.length) return
  const leadDoc = leadDocs[0]
  const leadRef = leadDoc.ref
  const leadData = leadDoc.data() || {}
  const bidsRef = leadRef.collection('bids')
  const acceptedAt =
    toIsoString(taskData?.selected_bid_at) ||
    toIsoString(taskData?.assigned_sp?.assigned_at) ||
    new Date().toISOString()

  if (!selectedBidId || !assignedSpId) {
    const bidSnap = await bidsRef.get()
    await Promise.all([
      ...bidSnap.docs.map((doc) => {
        const data = doc.data() || {}
        if (String(data.status || '').trim().toLowerCase() !== 'accepted') return Promise.resolve()
        return doc.ref.set(
          {
            status: 'submitted',
            accepted_at: null,
            project_id: null,
            project_title: null,
            updated_at: new Date().toISOString(),
          },
          { merge: true }
        )
      }),
      leadRef.set(
        {
          status: mapTaskStatusToLeadStatus(taskData?.status, 'open'),
          assigned_sp_id: null,
          assigned_bid_id: null,
          updated_at: new Date().toISOString(),
          updated_server_at: FieldValue.serverTimestamp(),
        },
        { merge: true }
      ),
      db.collection('sp_projects').doc(taskId).delete().catch(() => {}),
    ])
    return
  }

  const selectedBidSnap = await bidsRef.doc(selectedBidId).get()
  if (!selectedBidSnap.exists) return
  const selectedBidData = selectedBidSnap.data() || {}
  const assignedSp = buildAssignedSpFromTaskSelection({
    taskData,
    bidData: { id: selectedBidSnap.id, ...selectedBidData },
    actorId: leadData.creator_id || '',
    acceptedAt,
  })

  const projectTitle = String(taskData?.title || taskData?.task_title || leadData.title || 'Untitled Project').trim()
  const projectAddress = String(
    taskData?.property_address ||
      taskData?.property_id?.address ||
      leadData.address ||
      leadData.property_address_line1 ||
      ''
  ).trim()

  const bidSnap = await bidsRef.get()
  const writes = bidSnap.docs.map((doc) => {
    const data = doc.data() || {}
    const isSelected = doc.id === selectedBidId
    if (!isSelected && String(data.status || '').trim().toLowerCase() === 'withdrawn') {
      return Promise.resolve()
    }
    return doc.ref.set(
      {
        status: isSelected ? 'accepted' : 'submitted',
        accepted_at: isSelected ? acceptedAt : null,
        project_id: isSelected ? taskId : null,
        project_title: isSelected ? projectTitle : null,
        updated_at: new Date().toISOString(),
      },
      { merge: true }
    )
  })

  writes.push(
    leadRef.set(
      {
        status: 'assigned',
        assigned_sp_id: assignedSp.sp_id,
        assigned_bid_id: assignedSp.bid_id,
        updated_at: new Date().toISOString(),
        updated_server_at: FieldValue.serverTimestamp(),
      },
      { merge: true }
    )
  )

  writes.push(
    db.collection('sp_projects').doc(taskId).set(
      {
        project_id: taskId,
        mxrecord_id: taskId,
        property_id: normalizeRef(propertyId || taskData?.property_id),
        lead_id: leadDoc.id,
        selected_bid_id: assignedSp.bid_id,
        sp_id: assignedSp.sp_id,
        title: projectTitle,
        task_title: projectTitle,
        address: projectAddress,
        location: projectAddress,
        status: 'active',
        accepted_at: acceptedAt,
        assigned_sp: assignedSp,
        comments: Array.isArray(taskData?.comments) ? taskData.comments : [],
        phases: taskData?.phases && typeof taskData.phases === 'object' ? taskData.phases : {},
        created_at: toIsoString(taskData?.createAt) || acceptedAt,
        updated_at: new Date().toISOString(),
        updated_server_at: FieldValue.serverTimestamp(),
      },
      { merge: true }
    )
  )

  await Promise.all(writes)
}

export const onTaskCreatedBidSelectionSync = onDocumentCreated(
  {
    region: 'us-central1',
    document: 'properties/{propertyId}/mxrecords/{mxrecordId}',
  },
  async (event) => {
    const taskData = event.data?.data()
    if (!taskData) return
    await syncTaskSelectionToMarketplace({
      propertyId: event.params.propertyId,
      taskId: event.params.mxrecordId,
      taskData,
    })
  }
)

export const onTaskUpdatedBidSelectionSync = onDocumentUpdated(
  {
    region: 'us-central1',
    document: 'properties/{propertyId}/mxrecords/{mxrecordId}',
  },
  async (event) => {
    const beforeData = event.data?.before?.data()
    const taskData = event.data?.after?.data()
    if (!taskData) return
    await syncTaskSelectionToMarketplace({
      propertyId: event.params.propertyId,
      taskId: event.params.mxrecordId,
      beforeData,
      taskData,
    })
  }
)
