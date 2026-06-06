import { computed, ref } from 'vue'
import { Notify } from 'quasar'
import { contentModerationApi } from 'src/services/contentModeration'
import { useUserDataStore } from 'src/stores/userDataStore'

const blockedUserIds = ref(new Set())
const reportedContentKeys = ref(new Set())
const blockedLoadedForUid = ref('')
const loadingBlockedUsers = ref(false)

const reportedStorageKey = (uid) => `mobile_reported_content_${uid || 'anonymous'}`

const makeContentKey = ({ content_type, content_id, content_path } = {}) =>
  [content_type || 'other', content_id || content_path || 'unknown'].map(String).join(':')

const readReportedSet = (uid) => {
  if (typeof window === 'undefined') return new Set()
  try {
    const rows = JSON.parse(window.localStorage.getItem(reportedStorageKey(uid)) || '[]')
    return new Set(Array.isArray(rows) ? rows.map(String) : [])
  } catch {
    return new Set()
  }
}

const persistReportedSet = (uid, set) => {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(reportedStorageKey(uid), JSON.stringify(Array.from(set)))
}

export const useMobileModeration = () => {
  const userDataStore = useUserDataStore()
  const currentUser = computed(() => userDataStore.user || null)
  const currentUid = computed(() => String(currentUser.value?.uid || userDataStore.userId || ''))

  const ensureReportedSet = () => {
    if (!currentUid.value) return
    if (!reportedContentKeys.value.size) {
      reportedContentKeys.value = readReportedSet(currentUid.value)
    }
  }

  const loadBlockedUsers = async ({ force = false } = {}) => {
    const uid = currentUid.value
    if (!uid || loadingBlockedUsers.value) return
    if (!force && blockedLoadedForUid.value === uid) return

    loadingBlockedUsers.value = true
    try {
      const rows = await contentModerationApi.listBlockedUsers(currentUser.value)
      blockedUserIds.value = new Set(
        rows.map((row) => String(row?.blocked_user_id || '').trim()).filter(Boolean),
      )
      blockedLoadedForUid.value = uid
      ensureReportedSet()
    } catch (error) {
      Notify.create({
        type: 'warning',
        message: error?.message || 'Unable to load blocked users.',
        position: 'top',
      })
    } finally {
      loadingBlockedUsers.value = false
    }
  }

  const isBlockedUser = (userId) => {
    const id = String(userId || '').trim()
    return Boolean(id && blockedUserIds.value.has(id))
  }

  const isReportedContent = (content) => {
    ensureReportedSet()
    return reportedContentKeys.value.has(makeContentKey(content))
  }

  const shouldHideModeratedItem = (item = {}) => {
    const moderation = item.moderation || item
    return isBlockedUser(moderation.reported_user_id || moderation.author_user_id) ||
      isReportedContent(moderation)
  }

  const markReported = (content) => {
    const uid = currentUid.value
    if (!uid) return
    const next = new Set(reportedContentKeys.value)
    next.add(makeContentKey(content))
    reportedContentKeys.value = next
    persistReportedSet(uid, next)
  }

  const reportContent = async (content = {}, { reason = 'other', note = '' } = {}) => {
    if (!String(content.content_id || content.content_path || '').trim()) {
      throw new Error('Content reference is missing.')
    }
    await contentModerationApi.reportContent(currentUser.value, {
      content_type: content.content_type || 'other',
      content_id: content.content_id || '',
      content_path: content.content_path || '',
      reported_user_id: content.reported_user_id || content.author_user_id || '',
      reason,
      note,
    })
    markReported(content)
    Notify.create({ type: 'positive', message: 'Report submitted. We will review it.', position: 'top' })
  }

  const blockUser = async (target = {}, { reason = '' } = {}) => {
    const blockedUserId = String(target.blocked_user_id || target.reported_user_id || '').trim()
    if (!blockedUserId) throw new Error('User reference is missing.')
    if (blockedUserId === currentUid.value) throw new Error('You cannot block yourself.')

    await contentModerationApi.blockUser(currentUser.value, {
      blocked_user_id: blockedUserId,
      blocked_user_display_name: target.blocked_user_display_name || target.display_name || '',
      reason,
    })
    blockedUserIds.value = new Set([...blockedUserIds.value, blockedUserId])
    Notify.create({ type: 'positive', message: 'User blocked.', position: 'top' })
  }

  return {
    blockedUserIds,
    reportedContentKeys,
    loadingBlockedUsers,
    loadBlockedUsers,
    isBlockedUser,
    isReportedContent,
    shouldHideModeratedItem,
    reportContent,
    blockUser,
  }
}
