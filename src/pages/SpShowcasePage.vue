<template>
  <q-page class="handout-page q-pa-md">
    <div class="handout-shell">
      <q-card flat bordered class="handout-header">
        <q-card-section v-if="!notFound" class="row items-start q-col-gutter-md">
          <div class="col-12">
            <div class="row items-center q-gutter-sm">
              <q-avatar size="52px" color="primary" text-color="white">{{ avatarText }}</q-avatar>
              <div>
                <div class="text-h6 text-weight-bold">{{ profile.display_name || 'Service Provider' }}</div>
                <div class="text-subtitle2 text-grey-7">
                  {{ profile.headline || 'Professional service provider' }}
                </div>
              </div>
            </div>
            <div class="handout-meta q-mt-sm">
              <span v-if="profile.service_area">{{ profile.service_area }}</span>
              <span v-if="profile.email">{{ profile.email }}</span>
              <span v-if="profile.phone">{{ profile.phone }}</span>
            </div>
            <div class="q-mt-sm" v-if="profile.website">
              <a :href="formatWebsite(profile.website)" target="_blank" rel="noopener noreferrer">
                {{ profile.website }}
              </a>
            </div>
          </div>
        </q-card-section>
        <q-card-section v-else>
          <div class="text-subtitle1 text-weight-bold">Profile not found</div>
          <div class="text-grey-7 q-mt-xs">This Handout page is unavailable.</div>
        </q-card-section>
      </q-card>

      <q-card flat bordered class="handout-card q-mt-md" v-if="!notFound">
        <q-card-section>
          <div class="text-subtitle1 text-weight-bold">Company Profile</div>
          <p class="q-mt-sm company-about">{{ profile.about || 'No company profile available yet.' }}</p>
          <div class="q-mt-sm row q-gutter-xs">
            <q-chip
              v-for="tag in profile.skills || []"
              :key="`skill-${tag}`"
              size="sm"
              dense
              color="teal"
              text-color="white"
            >
              {{ tag }}
            </q-chip>
          </div>
        </q-card-section>
      </q-card>

      <q-card flat bordered class="handout-card q-mt-md" v-if="!notFound">
        <q-card-section>
          <div class="text-subtitle1 text-weight-bold">Posts</div>
          <div class="text-caption text-grey-7">Latest updates and completed outcomes</div>
        </q-card-section>
        <q-separator />

        <q-card-section v-if="posts.length === 0" class="text-grey-7">No posts published yet.</q-card-section>
        <q-card-section v-else class="q-pt-sm">
          <div class="post-grid">
            <q-card
              v-for="row in posts"
              :key="row.id"
              flat
              bordered
              class="post-grid-card"
            >
              <q-card-section class="q-pb-sm">
                <div class="text-subtitle2 text-weight-bold">{{ row.title || 'Update' }}</div>
                <div class="text-caption text-grey-6">{{ formatDate(row.created_at || row.updated_at) }}</div>
                <div v-if="row.content" class="q-mt-xs post-content">{{ row.content }}</div>

                <div v-if="row.media_url" class="q-mt-sm post-media-wrap">
                  <q-img
                    v-if="row.media_type === 'image'"
                    :src="row.media_url"
                    class="post-media"
                    fit="contain"
                  />
                  <video v-else-if="row.media_type === 'video'" controls class="post-video">
                    <source :src="row.media_url" />
                  </video>
                </div>

                <div class="q-mt-sm row q-gutter-xs">
                  <q-chip
                    v-for="tag in row.tags || []"
                    :key="`${row.id}-${tag}`"
                    size="sm"
                    dense
                    color="secondary"
                    text-color="white"
                  >
                    {{ tag }}
                  </q-chip>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useFirebase } from 'src/composables/useFirebase'
import { resolveSpName, resolveSpSlug } from 'src/utils/spPosts'

const route = useRoute()
const { getDocument, getCollectionData } = useFirebase()

const profile = reactive({
  display_name: '',
  headline: '',
  about: '',
  service_area: '',
  website: '',
  email: '',
  phone: '',
  skills: [],
})

const posts = ref([])
const notFound = ref(false)
const targetUserId = ref('')

const routeSlug = computed(() => String(route.params.spSlug || '').trim())
const avatarText = computed(() => {
  const source = String(profile.display_name || 'SP').trim()
  return source.slice(0, 2).toUpperCase()
})

const toTags = (input) => {
  return String(input || '')
    .split(',')
    .map((row) => row.trim())
    .filter(Boolean)
}

const formatDate = (value) => {
  if (!value) return ''
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString()
}

const formatWebsite = (value) => {
  const raw = String(value || '').trim()
  if (!raw) return ''
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw
  return `https://${raw}`
}

const sortByRecent = (rows) => {
  return [...rows].sort((a, b) => {
    const left = new Date(a.updated_at || a.created_at || 0).getTime()
    const right = new Date(b.updated_at || b.created_at || 0).getTime()
    return right - left
  })
}

const hydrateProfile = (doc) => {
  profile.display_name = resolveSpName(doc, 'Service Provider')
  profile.headline = doc?.showcase_headline || doc?.headline || ''
  profile.about = doc?.showcase_about || doc?.bio || ''
  profile.service_area = doc?.service_area || ''
  profile.website = doc?.website || ''
  profile.email = doc?.email || ''
  profile.phone = doc?.phone || doc?.contact_phone || ''
  profile.skills = Array.isArray(doc?.showcase_skills)
    ? doc.showcase_skills
    : Array.isArray(doc?.services)
      ? doc.services
      : toTags(doc?.services || '')
}

const resolveUserBySlug = async () => {
  notFound.value = false
  targetUserId.value = ''
  if (!routeSlug.value) {
    notFound.value = true
    return null
  }

  const direct = await getDocument(`users/${routeSlug.value}`).catch(() => null)
  if (direct) {
    targetUserId.value = String(routeSlug.value)
    return direct
  }

  const users = await getCollectionData('users').catch(() => [])
  const match = users.find((row) => {
    const candidate = resolveSpSlug(row, row.id)
    return candidate === routeSlug.value
  })

  if (!match) {
    notFound.value = true
    return null
  }

  targetUserId.value = String(match.id || '')
  return match
}

const loadPosts = async () => {
  if (!targetUserId.value) return
  const rows = await getCollectionData(`users/${targetUserId.value}/posts`).catch(() => [])
  if (rows.length > 0) {
    posts.value = sortByRecent(rows)
    return
  }
  const legacyRows = await getCollectionData(`users/${targetUserId.value}/showcase_posts`).catch(() => [])
  posts.value = sortByRecent(legacyRows)
}

const loadPage = async () => {
  const doc = await resolveUserBySlug()
  if (!doc || !targetUserId.value) return
  hydrateProfile(doc)
  await loadPosts()
}

watch(
  () => routeSlug.value,
  async () => {
    await loadPage()
  },
  { immediate: true },
)
</script>

<style scoped>
.handout-page {
  background: linear-gradient(180deg, #f8fafc 0%, #eef3f9 100%);
  min-height: 100vh;
}

.handout-shell {
  max-width: 980px;
  margin: 0 auto;
}

.handout-header,
.handout-card {
  border-radius: 14px;
  border-color: rgba(51, 65, 85, 0.15);
  background: #ffffff;
}

.handout-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  color: #64748b;
  font-size: 0.86rem;
}

.company-about {
  color: #334155;
  line-height: 1.65;
}

.post-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
}

.post-grid-card {
  border-radius: 12px;
  border-color: rgba(100, 116, 139, 0.24);
  background: #ffffff;
}

.post-content {
  white-space: pre-wrap;
  color: #334155;
  line-height: 1.55;
}

.post-media-wrap {
  border: 1px solid rgba(100, 116, 139, 0.2);
  border-radius: 10px;
  background: #f8fafc;
  padding: 8px;
}

.post-media {
  width: 100%;
  height: 240px;
  border-radius: 8px;
}

.post-video {
  width: 100%;
  max-height: 240px;
  border-radius: 8px;
  object-fit: contain;
  background: #0f172a;
}
</style>
