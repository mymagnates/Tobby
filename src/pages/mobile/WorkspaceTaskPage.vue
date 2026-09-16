<template>
  <main class="task-detail" :style="viewportStyle" aria-label="Task detail">
    <header class="task-header">
      <button type="button" class="task-back" aria-label="Back to records" @click="goBack">
        <q-icon name="arrow_back" size="24px" aria-hidden="true" />
      </button>
      <span>Task detail</span>
    </header>

    <div
      ref="timeline"
      class="task-scroll"
      tabindex="0"
      aria-label="Task and history"
      :aria-busy="loading"
    >
      <p v-if="loading" role="status">Loading task...</p>
      <div v-if="loadError" class="task-error" role="alert">
        <p>{{ loadError }}</p>
        <button type="button" :disabled="loading" @click="loadTask">Retry loading</button>
      </div>
      <template v-if="task">
        <section class="task-summary" aria-labelledby="task-title">
          <p class="task-eyebrow">{{ propertyLabel }}</p>
          <h1 id="task-title">{{ task.task_title || task.title || 'Untitled task' }}</h1>
          <div class="task-badges">
            <span>Status: {{ task.status || 'Not recorded' }}</span>
            <span>Priority: {{ task.priority || 'Not recorded' }}</span>
          </div>
        </section>
        <section v-if="task.description" class="task-info-card">
          <h3>Description</h3>
          <p class="task-copy">{{ task.description }}</p>
        </section>
        <section v-if="attachments(task.image_urls).length" class="task-info-card">
          <h3>Attachments</h3>
          <div v-if="attachments(task.image_urls).length" class="task-photos">
            <a
              v-for="(url, index) in attachments(task.image_urls)"
              :key="`${index}-${url}`"
              :href="url"
              target="_blank"
              rel="noopener noreferrer"
              :aria-label="`Open task photo ${index + 1} in a new tab`"
            >
              <img
                :src="url"
                :alt="`Task photo ${index + 1}`"
                loading="lazy"
                referrerpolicy="no-referrer"
              />
            </a>
          </div>
        </section>
        <section aria-labelledby="task-history-heading">
          <h2 id="task-history-heading">
            Updates &amp; history <span>{{ logs.length }}</span>
          </h2>
          <p v-if="!logs.length" class="task-muted">No updates yet.</p>
          <ol v-else class="task-timeline">
            <li v-for="(log, index) in logs" :key="log.id || log.comment_id || `legacy-${index}`">
              <article>
                <div class="task-log-heading">
                  <strong>{{ log.user_name || log.author_name || 'Author not recorded' }}</strong>
                  <span class="task-action-label">{{ actionLabel(log.action_type) }}</span>
                </div>
                <time v-if="timestamp(log)" :datetime="timestamp(log)">{{ displayTime(log) }}</time>
                <span v-else class="task-muted">Time not recorded</span>
                <p class="task-copy">{{ log.comment }}</p>
                <div v-if="attachments(log.image_urls).length" class="task-photos">
                  <a
                    v-for="(url, photoIndex) in attachments(log.image_urls)"
                    :key="`${photoIndex}-${url}`"
                    :href="url"
                    target="_blank"
                    rel="noopener noreferrer"
                    :aria-label="`Open update ${index + 1} photo ${photoIndex + 1} in a new tab`"
                  >
                    <img
                      :src="url"
                      :alt="`Update photo ${photoIndex + 1}`"
                      loading="lazy"
                      referrerpolicy="no-referrer"
                    />
                  </a>
                </div>
              </article>
            </li>
          </ol>
        </section>
      </template>
      <p v-if="sentMessage" class="task-success" role="status">{{ sentMessage }}</p>
    </div>

    <form
      v-if="task && canComment"
      class="task-composer"
      aria-label="Add a task update"
      @submit.prevent="send()"
    >
      <label for="task-comment">Add an update</label>
      <textarea
        id="task-comment"
        v-model="comment"
        rows="2"
        maxlength="10000"
        :disabled="busy || !!attempt"
        aria-describedby="task-comment-help"
      />
      <div class="task-composer-options">
        <label for="task-action">Action</label>
        <select id="task-action" v-model="action" :disabled="busy || !!attempt">
          <option value="update">Update</option>
          <option value="comment">Comment</option>
          <option value="cancel">Cancel (history only)</option>
        </select>
      </div>
      <p id="task-comment-help" class="task-help">
        {{
          attempt
            ? 'This submission is kept unchanged for a safe retry.'
            : 'Photos are optional. Send never closes the task.'
        }}
      </p>
      <RecordPhotoPicker
        :model-value="draftPhoto"
        label="Photo"
        :disabled="pending || loading || !!attempt"
        @update:model-value="setPhoto"
        @busy="pickingPhotos = $event"
        @error="sendError = $event"
      />
      <p v-if="sendError" class="task-error" role="alert">{{ sendError }}</p>
      <p v-if="pending" class="task-help" role="status">
        {{ uploadProgress || 'Sending update. Waiting for server confirmation...' }}
      </p>
      <div class="task-composer-actions">
        <button type="button" :disabled="busy || !hasDraft" @click="discardDraft">Discard</button>
        <button v-if="!closed && !attempt" type="button" :disabled="!canSend" @click="resolveTask">
          Resolve...
        </button>
        <button class="task-primary" type="submit" :disabled="!canSend">
          {{ pending ? 'Sending...' : attempt ? 'Retry send' : 'Send' }}
        </button>
      </div>
    </form>
    <aside v-else-if="task" class="task-readonly" aria-label="Read-only task">
      <strong>Read-only history</strong>
      <p>You do not currently have permission to add updates to this task.</p>
      <p v-if="hasDraft">Your unsent draft is retained while you stay on this page.</p>
      <p v-if="sendError" class="task-error" role="alert">{{ sendError }}</p>
      <button type="button" :disabled="loading" @click="loadTask">Check access again</button>
    </aside>

    <q-dialog v-model="confirmOpen" persistent @hide="finishConfirm(false)">
      <q-card class="task-confirm">
        <h2>{{ confirmTitle }}</h2>
        <p>{{ confirmMessage }}</p>
        <div class="task-confirm-actions">
          <button type="button" autofocus @click="finishConfirm(false)">Keep editing</button>
          <button type="button" class="task-primary" @click="finishConfirm(true)">
            {{ confirmAction }}
          </button>
        </div>
      </q-card>
    </q-dialog>
  </main>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'
import { onBeforeRouteLeave, onBeforeRouteUpdate, useRoute, useRouter } from 'vue-router'
import {
  createTaskCommentKey,
  getTaskComments,
  postTaskComment,
  safeTaskAttachmentUrl,
} from 'src/services/taskCommentsApi'
import RecordPhotoPicker from 'src/components/RecordPhotoPicker.vue'
import { createRecordPhotoUpload } from 'src/services/recordPhotoUpload'
import { safeMobileReturnTo } from 'src/utils/mobileHome'
const route = useRoute()
const router = useRouter()
const task = ref(null)
const canComment = ref(false)
const loading = ref(false)
const loadError = ref('')
const sendError = ref('')
const sentMessage = ref('')
const comment = ref('')
const action = ref('update')
const imageUrls = ref([])
const draftPhoto = shallowRef(null)
const uploadProgress = ref('')
const pending = ref(false)
const pickingPhotos = ref(false)
const attempt = ref(null)
const timeline = ref(null)
const viewportStyle = ref({})
const confirmOpen = ref(false)
const confirmTitle = ref('')
const confirmMessage = ref('')
const confirmAction = ref('')
let confirmCallback
let loadController
let sendController
let disposed = false
let photoUpload
const busy = computed(() => pending.value || pickingPhotos.value || loading.value)
const hasDraft = computed(
  () =>
    !!comment.value.trim() || !!draftPhoto.value || imageUrls.value.length > 0 || !!attempt.value,
)
const canSend = computed(() => canComment.value && !!comment.value.trim() && !busy.value)
const closed = computed(() =>
  ['closed', 'resolved', 'done', 'completed', 'cancelled', 'canceled'].includes(
    String(task.value?.status || '').toLowerCase(),
  ),
)
const logs = computed(() =>
  (task.value?.logs || []).filter((log) => log && typeof log === 'object'),
)
const propertyLabel = computed(() => {
  const row = task.value
  return (
    row?.property_name ||
    row?.property?.nickname ||
    row?.property?.address ||
    (typeof row?.properties === 'string'
      ? row.properties
      : row?.properties?.nickname || row?.properties?.address) ||
    `Property ${route.params.propertyId}`
  )
})
const attachments = (urls) =>
  Array.isArray(urls) ? urls.map(safeTaskAttachmentUrl).filter(Boolean) : []
const actionLabel = (value) =>
  ({ update: 'Update', comment: 'Comment', cancel: 'Cancel', resolution: 'Resolution' })[value] ||
  value ||
  'History'
function timestamp(log) {
  const value = log.log_timestamp ?? log.created_at
  if (value == null || value === '') return ''
  let date
  if (typeof value?.toDate === 'function') date = value.toDate()
  else if (typeof value === 'object' && Number.isFinite(value.seconds ?? value._seconds))
    date = new Date((value.seconds ?? value._seconds) * 1000)
  else date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : date.toISOString()
}
const displayTime = (log) =>
  new Date(timestamp(log)).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })

async function loadTask() {
  loadController?.abort()
  const controller = new AbortController()
  loadController = controller
  loading.value = true
  loadError.value = ''
  try {
    const result = await getTaskComments(
      String(route.params.propertyId || ''),
      String(route.params.taskId || ''),
      { signal: controller.signal },
    )
    if (controller.signal.aborted || disposed) return
    task.value = result.task
    canComment.value = result.can_comment === true
  } catch (error) {
    if (controller.signal.aborted || disposed) return
    loadError.value = error.message || 'Unable to load this task.'
    if ([401, 403, 404].includes(error.status)) {
      task.value = null
      canComment.value = false
    }
  } finally {
    if (loadController === controller) loading.value = false
  }
}

function ask(title, message, label) {
  if (confirmCallback) return Promise.resolve(false)
  confirmTitle.value = title
  confirmMessage.value = message
  confirmAction.value = label
  confirmOpen.value = true
  return new Promise((resolve) => {
    confirmCallback = resolve
  })
}
function finishConfirm(confirmed) {
  const resolve = confirmCallback
  confirmCallback = null
  confirmOpen.value = false
  resolve?.(confirmed)
}
function clearDraft() {
  comment.value = ''
  action.value = 'update'
  imageUrls.value = []
  draftPhoto.value = null
  photoUpload = null
  uploadProgress.value = ''
  attempt.value = null
  sendError.value = ''
}
async function discardDraft() {
  if (busy.value) return
  if (
    await ask(
      'Discard this draft?',
      attempt.value
        ? 'The last send may have reached the server. Discarding removes only this local draft, not any saved update.'
        : 'Your unsent text and photos will be removed from this draft.',
      'Discard draft',
    )
  )
    clearDraft()
}
async function allowLeave() {
  if (busy.value && (pending.value || pickingPhotos.value)) {
    sendError.value = 'Wait for the current request before leaving. Your draft is retained.'
    return false
  }
  if (!hasDraft.value) return true
  return ask(
    'Leave and discard draft?',
    'Your unsent draft will be lost. A previous send may already have reached the server; leaving does not undo it.',
    'Discard and leave',
  )
}
onBeforeRouteLeave(allowLeave)
onBeforeRouteUpdate(async (to, from) => {
  if (to.params.propertyId === from.params.propertyId && to.params.taskId === from.params.taskId)
    return true
  return allowLeave()
})
function goBack() {
  const target = safeMobileReturnTo(route.query.returnTo)
  // Preserve the original history entry (and its saved scroll) when it matches returnTo.
  if (router.options.history.state.back === target) router.back()
  else router.push(target)
}
function setPhoto(file) {
  if (pending.value || attempt.value || file === draftPhoto.value) return
  draftPhoto.value = file
  photoUpload = null
  imageUrls.value = []
  sendError.value = ''
}
async function resolveTask() {
  if (!canSend.value || closed.value || attempt.value) return
  if (
    await ask(
      'Resolve this task?',
      'This sends your draft as a resolution and closes the task. Ordinary Send only adds an update.',
      'Resolve task',
    )
  )
    await send(true)
}
async function send(resolve = false) {
  if (!canSend.value) return
  pending.value = true
  sendError.value = ''
  sentMessage.value = ''
  sendController = new AbortController()
  try {
    if (!attempt.value) {
      if (draftPhoto.value && !imageUrls.value.length) {
        photoUpload ||= createRecordPhotoUpload({
          propertyId: String(route.params.propertyId),
          file: draftPhoto.value,
          context: 'task-comments',
        })
        const url = await photoUpload.upload((message) => {
          uploadProgress.value = message
        })
        if (disposed) return
        if (!safeTaskAttachmentUrl(url))
          throw new Error(
            'The photo upload could not be confirmed. Please retry or remove the photo.',
          )
        imageUrls.value = [url]
      }
      attempt.value = {
        key: createTaskCommentKey(),
        body: {
          comment: comment.value.trim(),
          action_type: resolve ? 'resolution' : action.value,
          image_urls: [...imageUrls.value],
        },
      }
    }
    uploadProgress.value = ''
    const result = await postTaskComment(
      String(route.params.propertyId),
      String(route.params.taskId),
      attempt.value.body,
      { idempotencyKey: attempt.value.key, signal: sendController.signal },
    )
    if (disposed) return
    task.value = result.task
    canComment.value = result.can_comment === true
    sentMessage.value =
      attempt.value.body.action_type === 'resolution' ? 'Resolution saved.' : 'Update sent.'
    clearDraft()
    await nextTick()
    if (timeline.value) timeline.value.scrollTop = timeline.value.scrollHeight
  } catch (error) {
    if (disposed) return
    sendError.value =
      error.message || 'Send failed. Your draft is retained. Retry the same submission.'
    if ([401, 403].includes(error.status)) canComment.value = false
    // Validation failures are definitive; let the user correct the draft.
    if ([400, 422].includes(error.status)) attempt.value = null
  } finally {
    pending.value = false
    uploadProgress.value = ''
  }
}
function syncViewport() {
  const viewport = window.visualViewport
  viewportStyle.value = viewport
    ? { '--task-height': `${viewport.height}px`, '--task-top': `${viewport.offsetTop}px` }
    : {}
}
function beforeUnload(event) {
  if (!hasDraft.value && !pickingPhotos.value && !pending.value) return
  event.preventDefault()
  event.returnValue = ''
}
watch(
  () => JSON.stringify([route.params.propertyId, route.params.taskId]),
  () => {
    task.value = null
    canComment.value = false
    clearDraft()
    sentMessage.value = ''
    loadTask()
  },
  { immediate: true },
)
onMounted(() => {
  syncViewport()
  window.visualViewport?.addEventListener('resize', syncViewport)
  window.visualViewport?.addEventListener('scroll', syncViewport)
  window.addEventListener('beforeunload', beforeUnload)
})
onBeforeUnmount(() => {
  disposed = true
  loadController?.abort()
  sendController?.abort()
  finishConfirm(false)
  window.visualViewport?.removeEventListener('resize', syncViewport)
  window.visualViewport?.removeEventListener('scroll', syncViewport)
  window.removeEventListener('beforeunload', beforeUnload)
})
</script>

<style scoped>
.task-detail,
.task-confirm {
  --task-bg: var(--brand-canvas, #f7f8f4);
  --task-surface: var(--brand-surface, #fff);
  --task-text: var(--brand-ink, #243830);
  --task-muted: var(--brand-muted, #65756c);
  --task-line: var(--brand-border, #e0e6df);
  --task-brand: var(--brand-primary, #254b39);
  --task-on-brand: var(--brand-on-primary, #fff);
  --task-soft: var(--brand-soft, #eef3eb);
  --task-error: #9d2929;
  color: var(--task-text);
  background: var(--task-bg);
  font: inherit;
  font-size: 16px;
  line-height: 1.5;
}
:global(.body--dark) .task-detail,
:global(.body--dark) .task-confirm {
  --task-bg: #19251e;
  --task-surface: #202d26;
  --task-text: #e4efe7;
  --task-muted: #aec0b3;
  --task-line: #3a4c40;
  --task-brand: #b8dec5;
  --task-on-brand: #19251e;
  --task-soft: #2b3e31;
  --task-error: #ffb4ab;
}
.task-detail {
  position: fixed;
  z-index: 10;
  top: var(--task-top, 0px);
  left: 0;
  right: 0;
  height: var(--task-height, 100vh);
  height: var(--task-height, 100dvh);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.task-header,
.task-scroll,
.task-composer,
.task-readonly {
  width: 100%;
  max-width: 760px;
  margin-inline: auto;
  padding-inline: max(16px, env(safe-area-inset-left)) max(16px, env(safe-area-inset-right));
  box-sizing: border-box;
}
.task-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-top: env(safe-area-inset-top);
  min-height: 60px;
  flex-shrink: 0;
  font-weight: 600;
}
.task-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding-bottom: 24px;
  scroll-padding-block: 16px;
}
.task-summary {
  padding: 12px 0 20px;
}
.task-info-card {
  padding: 18px;
  margin-bottom: 14px;
  border: 1px solid var(--task-line);
  border-radius: 16px;
  background: var(--task-surface);
}
.task-info-card h3 { margin: 0 0 8px; font-size: 15px; font-weight: 600; }
.task-info-card .task-copy { margin: 0; }
.task-eyebrow,
.task-muted,
time,
.task-help {
  color: var(--task-muted);
}
.task-eyebrow {
  margin: 0 0 8px;
}
.task-detail h1 {
  margin: 0;
  font-size: 26px;
  line-height: 1.25;
  font-weight: 600;
}
.task-detail h2,
.task-confirm h2 {
  font-size: 18px;
  line-height: 1.4;
  margin: 24px 0 16px;
}
.task-detail h2 span {
  font-size: 14px;
  font-weight: 400;
  color: var(--task-muted);
  margin-left: 8px;
}
.task-detail p,
.task-detail h1,
.task-log-heading,
.task-confirm p {
  overflow-wrap: anywhere;
}
.task-copy {
  white-space: pre-wrap;
  margin: 12px 0;
}
.task-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
  font-size: 13px;
}
.task-badges span,
.task-action-label {
  padding: 4px 8px;
  background: var(--task-soft);
  border-radius: 6px;
}
.task-timeline {
  list-style: none;
  padding: 0;
  margin: 0;
}
.task-timeline li {
  border: 1px solid var(--task-line);
  border-radius: 16px;
  background: var(--task-surface);
  padding: 16px;
  margin: 0 0 12px;
}
.task-log-heading {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: baseline;
}
.task-action-label,
time {
  font-size: 13px;
}
time {
  display: block;
  margin-top: 4px;
}
.task-photos,
.task-draft-photos {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-block: 8px;
}
.task-photos a,
.task-draft-photos a {
  display: block;
  flex-shrink: 0;
}
.task-photos img,
.task-draft-photos img {
  width: 88px;
  height: 88px;
  display: block;
  border-radius: 8px;
  object-fit: cover;
  background: var(--task-soft);
}
.task-composer,
.task-readonly {
  flex-shrink: 0;
  max-height: 52%;
  overflow: auto;
  border-top: 1px solid var(--task-line);
  background: var(--task-surface);
  padding-top: 12px;
  padding-bottom: max(12px, env(safe-area-inset-bottom));
}
.task-composer > label {
  display: block;
  font-weight: 600;
  margin-bottom: 8px;
}
.task-detail textarea {
  display: block;
  width: 100%;
  box-sizing: border-box;
  min-height: 64px;
  max-height: 160px;
  padding: 10px;
  resize: vertical;
  border: 1px solid var(--task-muted);
  border-radius: 8px;
  font: inherit;
  color: inherit;
  background: var(--task-surface);
}
.task-composer-options {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
}
.task-composer-options label {
  font-size: 14px;
}
.task-detail select {
  max-width: 100%;
  min-height: 48px;
  font: inherit;
  font-size: 14px;
  color: inherit;
  background: var(--task-surface);
  border: 1px solid var(--task-muted);
  border-radius: 8px;
  padding: 4px;
}
.task-help {
  font-size: 13px;
  margin: 8px 0;
}
.task-composer-actions,
.task-confirm-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}
.task-detail button,
.task-confirm button {
  min-height: 48px;
  min-width: 48px;
  padding: 8px 12px;
  border: 1px solid var(--task-line);
  border-radius: 8px;
  background: transparent;
  color: inherit;
  font: inherit;
  cursor: pointer;
}
.task-detail .task-primary,
.task-confirm .task-primary {
  color: var(--task-on-brand);
  background: var(--task-brand);
  border-color: var(--task-brand);
  font-weight: 600;
}
.task-detail button:active,
.task-confirm button:active {
  opacity: 0.75;
}
.task-detail button:disabled,
.task-detail select:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
.task-detail :focus-visible,
.task-confirm :focus-visible {
  outline: 2px solid var(--task-brand);
  outline-offset: 2px;
}
.task-error {
  color: var(--task-error);
  border-left: 3px solid currentColor;
  padding-left: 12px;
  font-size: 14px;
}
.task-success {
  color: var(--task-brand);
}
.task-confirm {
  width: min(440px, 100%);
  border-radius: 12px;
  padding: 24px;
}
.task-confirm h2 {
  margin-top: 0;
}
@media (max-height: 480px) {
  .task-header {
    min-height: 48px;
  }
  .task-composer {
    max-height: 65%;
  }
}
</style>
