import { createHash } from 'node:crypto'

const fail = (status, code, message) => {
  throw Object.assign(new Error(message), { status, code })
}
const validId = (value) => typeof value === 'string' && /^[A-Za-z0-9_-]{1,128}$/.test(value)
const has = (values, id) => Array.isArray(values) && values.includes(id)
const writable = (property, id) =>
  has(property.manager_user_ids, id) || has(property.owner_user_ids, id)
const readable = (property, id) => writable(property, id) || has(property.viewer_user_ids, id)
const hash = (value) => createHash('sha256').update(value).digest('hex')
const view = (task, propertyId, taskId) => ({
  id: taskId,
  property_id: propertyId,
  task_title: task.task_title || task.title || task.name || 'Task',
  description: task.description || '',
  status: task.status || 'open',
  priority: task.priority || '',
  due_date: task.due_date || '',
  image_urls: Array.isArray(task.image_urls) ? task.image_urls : [],
  picture_url: task.picture_url || '',
  logs: Array.isArray(task.logs) ? task.logs : [],
})

export function createTaskCommentsService({ getDb }) {
  const scope = (context) => {
    if (!context.verified || !validId(context.actor?.id))
      fail(401, 'UNAUTHENTICATED', 'Sign in to view this task.')
    const { propertyId, taskId } = context.params || {}
    if (!validId(propertyId) || !validId(taskId))
      fail(400, 'INVALID_TASK_SCOPE', 'Choose a valid property and task.')
    const db = getDb()
    const property = db.collection('properties').doc(propertyId)
    return { db, property, task: property.collection('mxrecords').doc(taskId), propertyId, taskId }
  }
  const authorize = (snap, actor, write = false) => {
    if (!snap.exists || !(write ? writable : readable)(snap.data() || {}, actor.id))
      fail(403, 'TASK_ACCESS_DENIED', write ? 'Owner or manager access is required to comment.' : 'This task is not available to your account.')
    return snap.data()
  }
  const get = async (context) => {
    const refs = scope(context)
    return refs.db.runTransaction(async (tx) => {
      const property = authorize(await tx.get(refs.property), context.actor)
      const snap = await tx.get(refs.task)
      if (!snap.exists) fail(404, 'TASK_NOT_FOUND', 'Task no longer exists.')
      return { task: { ...view(snap.data(), refs.propertyId, refs.taskId), property_name: property.nickname || property.address || refs.propertyId }, can_comment: writable(property, context.actor.id) }
    })
  }
  const append = async (context) => {
    const refs = scope(context)
    const input = context.body || {}
    const commentText = typeof input.comment === 'string' ? input.comment.trim() : ''
    if (!commentText || commentText.length > 10000)
      fail(400, 'INVALID_COMMENT', 'Enter a comment of up to 10,000 characters.')
    const action = input.action_type || 'update'
    if (!['update', 'comment', 'cancel', 'resolution'].includes(action))
      fail(400, 'INVALID_COMMENT_ACTION', 'Choose a valid comment action.')
    const key = context.req?.headers?.['idempotency-key']
    if (typeof key !== 'string' || !/^[A-Za-z0-9_-]{8,128}$/.test(key))
      fail(400, 'IDEMPOTENCY_KEY_REQUIRED', 'Retry with a valid submission identifier.')
    const images = input.image_urls === undefined ? [] : input.image_urls
    if (!Array.isArray(images) || images.length > 5 || images.some((url) => typeof url !== 'string' || url.length > 2048))
      fail(400, 'INVALID_COMMENT_IMAGES', 'Attach up to five uploaded photos.')
    const urls = [...new Set(images)]
    const fingerprint = hash(JSON.stringify({ comment: commentText, action, urls }))
    const commentId = `cmt-${hash(`${context.actor.id}:${key}`)}`
    const submission = refs.task.collection('comment_submissions').doc(commentId)
    const profileRef = refs.db.collection('users').doc(context.actor.id)
    return refs.db.runTransaction(async (tx) => {
      const property = authorize(await tx.get(refs.property), context.actor, true)
      const snap = await tx.get(refs.task)
      if (!snap.exists) fail(404, 'TASK_NOT_FOUND', 'Task no longer exists.')
      const task = snap.data() || {}
      const previous = await tx.get(submission)
      if (previous.exists) {
        if (previous.data().fingerprint !== fingerprint)
          fail(409, 'IDEMPOTENCY_CONFLICT', 'This submission was already used for a different comment.')
        return { task: view(task, refs.propertyId, refs.taskId), comment: previous.data().comment, can_comment: true }
      }
      const profile = (await tx.get(profileRef)).data() || {}
      // Only attach completed uploads belonging to this actor and this property.
      for (const url of urls) {
        let parsed, storagePath
        try {
          parsed = new URL(url)
          const match = parsed.pathname.match(/^\/v0\/b\/[^/]+\/o\/(.+)$/)
          storagePath = match ? decodeURIComponent(match[1]) : ''
        } catch { fail(400, 'INVALID_COMMENT_IMAGES', 'Choose a successfully uploaded photo.') }
        if (parsed.protocol !== 'https:' || parsed.hostname !== 'firebasestorage.googleapis.com' || !storagePath)
          fail(400, 'INVALID_COMMENT_IMAGES', 'Choose a successfully uploaded photo.')
        const uploads = await tx.get(refs.db.collection('storage_upload_reservations').where('storage_path', '==', storagePath).limit(10))
        if (!uploads.docs.some((doc) => {
          const upload = doc.data()
          return upload.status === 'committed' && upload.property_id === refs.propertyId &&
            upload.user_id === context.actor.id && upload.download_token === parsed.searchParams.get('token') &&
            String(upload.content_type).startsWith('image/')
        })) fail(403, 'COMMENT_IMAGE_ACCESS_DENIED', 'This photo is not an uploaded image for this property.')
      }
      const entry = {
        id: commentId,
        log_timestamp: new Date().toISOString(),
        comment: commentText,
        action_type: action,
        image_urls: urls,
        user_id: context.actor.id,
        user_name: String(profile.display_name || profile.full_name || profile.user_name || profile.name || 'Member').slice(0, 160),
        user_role: has(property.manager_user_ids, context.actor.id) ? 'pm' : 'po',
      }
      const logs = [...(Array.isArray(task.logs) ? task.logs : []), entry]
      if (logs.length > 500 || Buffer.byteLength(JSON.stringify(logs)) > 700000)
        fail(422, 'TASK_HISTORY_FULL', 'This task history is too large. Contact support before adding more updates.')
      const changes = { logs, updatedAt: entry.log_timestamp }
      if (action === 'resolution') changes.status = 'closed'
      tx.update(refs.task, changes)
      tx.set(submission, { fingerprint, comment: entry })
      return { task: view({ ...task, ...changes }, refs.propertyId, refs.taskId), comment: entry, can_comment: true }
    })
  }
  return { get, append }
}
