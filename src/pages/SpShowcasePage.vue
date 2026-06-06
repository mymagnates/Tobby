<template>
  <q-page class="handout-page q-pa-md">
    <div class="handout-shell">
      <q-card flat bordered class="handout-header" v-if="!notFound">
        <q-card-section class="row items-start q-col-gutter-lg">
          <div class="col-12 col-lg-7">
            <div class="text-caption text-uppercase handout-kicker">Handout</div>
            <div class="text-h4 text-weight-bold q-mt-xs">{{ businessName }}</div>
            <div class="text-subtitle1 text-grey-8 q-mt-sm">
              {{ handoutConfig.headline || profile.headline || 'Professional service provider' }}
            </div>
            <div v-if="handoutConfig.subheadline" class="text-body1 text-grey-7 q-mt-sm handout-subheadline">
              {{ handoutConfig.subheadline }}
            </div>
            <div class="handout-meta q-mt-md">
              <span v-if="showServiceArea && profile.service_area">{{ profile.service_area }}</span>
              <span v-if="showVerificationSummary">{{ verificationSummary }}</span>
            </div>
            <div class="handout-contact q-mt-md" v-if="showContactSection">
              <span v-if="handoutConfig.show_phone && profile.phone">{{ profile.phone }}</span>
              <span v-if="handoutConfig.show_email && profile.email">{{ profile.email }}</span>
              <a
                v-if="handoutConfig.show_website && profile.website"
                :href="formatWebsite(profile.website)"
                target="_blank"
                rel="noopener noreferrer"
              >
                {{ profile.website }}
              </a>
            </div>
            <div v-if="showContactSection" class="q-mt-lg">
              <q-btn unelevated color="primary" no-caps :label="handoutConfig.cta_text || 'Contact for quote'" />
            </div>
            <div class="q-mt-md row q-gutter-sm">
              <q-btn
                outline
                dense
                no-caps
                color="grey-7"
                icon="flag"
                label="Report"
                @click="openReportHandout"
              />
              <q-btn
                outline
                dense
                no-caps
                color="negative"
                icon="block"
                label="Block"
                @click="openBlockProvider"
              />
            </div>
          </div>
          <div class="col-12 col-lg-5">
            <q-img
              v-if="heroImageUrl"
              :src="heroImageUrl"
              class="handout-hero-image"
              fit="cover"
            />
            <div v-else class="handout-hero-fallback">
              <q-avatar size="88px" color="primary" text-color="white">{{ avatarText }}</q-avatar>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <q-card flat bordered class="handout-card q-mt-md" v-else>
        <q-card-section>
          <div class="text-subtitle1 text-weight-bold">Handout not found</div>
          <div class="text-grey-7 q-mt-xs">This public Handout page is unavailable.</div>
        </q-card-section>
      </q-card>

      <q-card flat bordered class="handout-card q-mt-md" v-if="!notFound && handoutConfig.section_visibility.about">
        <q-card-section>
          <div class="section-title">About</div>
          <p class="section-copy q-mt-sm">{{ handoutConfig.about_text || profile.about || 'No company introduction yet.' }}</p>
        </q-card-section>
      </q-card>

      <q-card flat bordered class="handout-card q-mt-md" v-if="!notFound && handoutConfig.section_visibility.services">
        <q-card-section>
          <div class="section-title">Services</div>
          <div class="text-caption text-grey-7">Managed from Services page</div>
          <div class="services-grid q-mt-md">
            <q-card
              v-for="(service, index) in visibleServices"
              :key="`${service}-${index}`"
              flat
              bordered
              class="service-card"
            >
              <q-card-section class="q-pa-sm">
                <div class="service-title">{{ service }}</div>
              </q-card-section>
            </q-card>
          </div>
        </q-card-section>
      </q-card>

      <q-card flat bordered class="handout-card q-mt-md" v-if="!notFound && handoutConfig.section_visibility.featured_work">
        <q-card-section>
          <div class="section-title">Featured Work</div>
          <div class="text-caption text-grey-7">Selected content and images</div>
        </q-card-section>
        <q-separator />
        <q-card-section v-if="!featuredPosts.length && !featuredImages.length" class="text-grey-7">
          No featured work selected yet.
        </q-card-section>
        <q-card-section v-else class="q-pt-sm">
          <div v-if="featuredImages.length" class="featured-images-grid q-mb-md">
            <q-img
              v-for="(imageUrl, index) in featuredImages"
              :key="`${imageUrl}-${index}`"
              :src="imageUrl"
              class="featured-image"
              fit="cover"
            />
          </div>
          <div class="post-grid" v-if="featuredPosts.length">
            <q-card
              v-for="row in featuredPosts"
              :key="row.id"
              flat
              bordered
              class="post-grid-card"
            >
              <q-card-section class="q-pb-sm">
                <div class="text-subtitle2 text-weight-bold">{{ row.title || 'Content' }}</div>
                <div class="text-caption text-grey-6">{{ formatDate(row.created_at || row.updated_at) }}</div>
                <div v-if="row.content" class="q-mt-xs post-content">{{ row.content }}</div>
                <div v-if="row.media_url" class="q-mt-sm post-media-wrap">
                  <q-img
                    v-if="row.media_type === 'image'"
                    :src="row.media_url"
                    class="post-media"
                    fit="cover"
                  />
                  <video v-else-if="row.media_type === 'video'" controls class="post-video">
                    <source :src="row.media_url" />
                  </video>
                </div>
                <div class="q-mt-sm">
                  <q-btn
                    flat
                    dense
                    no-caps
                    color="grey-7"
                    icon="flag"
                    label="Report"
                    @click="openReportPost(row)"
                  />
                </div>
              </q-card-section>
            </q-card>
          </div>
        </q-card-section>
      </q-card>

      <q-card flat bordered class="handout-card q-mt-md" v-if="!notFound && handoutConfig.section_visibility.why_choose_us && sellingPoints.length">
        <q-card-section>
          <div class="section-title">Why Choose Us</div>
          <div class="selling-points-grid q-mt-md">
            <q-card
              v-for="(point, index) in sellingPoints"
              :key="`${point}-${index}`"
              flat
              bordered
              class="selling-point-card"
            >
              <q-card-section class="q-pa-sm">
                <div class="selling-point-copy">{{ point }}</div>
              </q-card-section>
            </q-card>
          </div>
        </q-card-section>
      </q-card>

      <q-card flat bordered class="handout-card q-mt-md" v-if="!notFound && showContactSection && handoutConfig.section_visibility.contact">
        <q-card-section>
          <div class="section-title">Contact</div>
          <div class="contact-grid q-mt-md">
            <div v-if="handoutConfig.show_phone && profile.phone" class="contact-item">
              <div class="contact-label">Phone</div>
              <div class="contact-value">{{ profile.phone }}</div>
            </div>
            <div v-if="handoutConfig.show_email && profile.email" class="contact-item">
              <div class="contact-label">Email</div>
              <div class="contact-value">{{ profile.email }}</div>
            </div>
            <div v-if="handoutConfig.show_website && profile.website" class="contact-item">
              <div class="contact-label">Website</div>
              <div class="contact-value">{{ profile.website }}</div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <ReportContentDialog
      v-model="moderationDialog"
      :mode="moderationMode"
      :content="moderationContent"
      @reported="handleContentReported"
      @blocked="handleUserBlocked"
    />
  </q-page>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import ReportContentDialog from 'src/components/ReportContentDialog.vue'
import { useFirebase } from 'src/composables/useFirebase'
import { listBlockedUsers } from 'src/services/contentModeration'
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
  verification_status: '',
})

const handoutConfig = reactive({
  headline: '',
  subheadline: '',
  about_text: '',
  hero_image_url: '',
  featured_post_ids: [],
  featured_image_urls: [],
  selling_points: [],
  cta_text: 'Contact for quote',
  show_phone: true,
  show_email: true,
  show_website: true,
  show_service_area: true,
  show_verification_summary: true,
  service_display_mode: 'compact',
  service_limit: 6,
  section_visibility: {
    about: true,
    services: true,
    featured_work: true,
    why_choose_us: true,
    contact: true,
  },
})

const posts = ref([])
const serviceDescriptions = ref([])
const notFound = ref(false)
const targetUserId = ref('')
const moderationDialog = ref(false)
const moderationMode = ref('report')
const moderationContent = ref({})
const reportedContentIds = ref(new Set())
const blockedUserIds = ref(new Set())

const routeSlug = computed(() => String(route.params.spSlug || '').trim())
const avatarText = computed(() => String(businessName.value || 'SP').slice(0, 2).toUpperCase())
const businessName = computed(() => profile.display_name || 'Service Provider')
const heroImageUrl = computed(() => handoutConfig.hero_image_url || featuredImages.value[0] || '')
const showServiceArea = computed(() => handoutConfig.show_service_area)
const showVerificationSummary = computed(() => handoutConfig.show_verification_summary && verificationSummary.value !== 'Unverified')
const verificationSummary = computed(() => {
  const normalized = String(profile.verification_status || '').trim()
  return normalized ? `Verification: ${normalized}` : 'Unverified'
})
const visibleServices = computed(() =>
  serviceDescriptions.value.slice(0, Math.max(1, Number(handoutConfig.service_limit || 6)))
)
const featuredPosts = computed(() => {
  const selectedIds = handoutConfig.featured_post_ids.map((item) => String(item))
  const visibleRows = posts.value.filter((row) => !reportedContentIds.value.has(`sp_post:${row.id}`))
  if (!selectedIds.length) return visibleRows.slice(0, 3)
  return visibleRows.filter((row) => selectedIds.includes(String(row.id || '')))
})
const featuredImages = computed(() => {
  const selected = handoutConfig.featured_image_urls.filter(Boolean)
  if (selected.length) return selected
  return posts.value
    .filter((row) => row.media_type === 'image' && row.media_url)
    .slice(0, 3)
    .map((row) => row.media_url)
})
const sellingPoints = computed(() =>
  handoutConfig.selling_points.map((item) => String(item || '').trim()).filter(Boolean)
)
const showContactSection = computed(() =>
  (handoutConfig.show_phone && profile.phone) ||
  (handoutConfig.show_email && profile.email) ||
  (handoutConfig.show_website && profile.website)
)

const providerModerationPayload = computed(() => ({
  content_type: 'handout_profile',
  content_id: targetUserId.value || routeSlug.value,
  content_path: targetUserId.value ? `users/${targetUserId.value}` : '',
  reported_user_id: targetUserId.value,
  reported_user_display_name: businessName.value,
  source: 'public_handout',
}))

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

const sortByRecent = (rows) =>
  [...rows].sort((a, b) => {
    const left = new Date(a.updated_at || a.created_at || 0).getTime()
    const right = new Date(b.updated_at || b.created_at || 0).getTime()
    return right - left
  })

const hydrateProfile = (doc) => {
  profile.display_name = resolveSpName(doc, 'Service Provider')
  profile.headline = doc?.headline || ''
  profile.about = doc?.bio || ''
  profile.service_area = doc?.service_area || ''
  profile.website = doc?.website || ''
  profile.email = doc?.email || ''
  profile.phone = doc?.phone || doc?.contact_phone || ''
  profile.verification_status = doc?.verification_status || doc?.sp_service_profile?.verification_status || ''
}

const hydrateHandoutConfig = (doc) => {
  const next = doc?.handout_config || {}
  handoutConfig.headline = next.headline || ''
  handoutConfig.subheadline = next.subheadline || ''
  handoutConfig.about_text = next.about_text || ''
  handoutConfig.hero_image_url = next.hero_image_url || ''
  handoutConfig.featured_post_ids = Array.isArray(next.featured_post_ids) ? next.featured_post_ids : []
  handoutConfig.featured_image_urls = Array.isArray(next.featured_image_urls) ? next.featured_image_urls : []
  handoutConfig.selling_points = Array.isArray(next.selling_points) ? next.selling_points : []
  handoutConfig.cta_text = next.cta_text || 'Contact for quote'
  handoutConfig.show_phone = next.show_phone !== false
  handoutConfig.show_email = next.show_email !== false
  handoutConfig.show_website = next.show_website !== false
  handoutConfig.show_service_area = next.show_service_area !== false
  handoutConfig.show_verification_summary = next.show_verification_summary !== false
  handoutConfig.service_display_mode = next.service_display_mode || 'compact'
  handoutConfig.service_limit = Number(next.service_limit || 6)
  handoutConfig.section_visibility = {
    about: next.section_visibility?.about !== false,
    services: next.section_visibility?.services !== false,
    featured_work: next.section_visibility?.featured_work !== false,
    why_choose_us: next.section_visibility?.why_choose_us !== false,
    contact: next.section_visibility?.contact !== false,
  }
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
  const match = users.find((row) => resolveSpSlug(row, row.id) === routeSlug.value)
  if (!match) {
    notFound.value = true
    return null
  }

  targetUserId.value = String(match.id || '')
  return match
}

const loadPosts = async () => {
  if (!targetUserId.value) return
  if (blockedUserIds.value.has(targetUserId.value)) {
    posts.value = []
    return
  }
  const rows = await getCollectionData(`users/${targetUserId.value}/posts`).catch(() => [])
  posts.value = sortByRecent(rows)
}

const loadBlockedUsers = async () => {
  try {
    const response = await listBlockedUsers()
    const ids = (response?.items || []).map((item) => String(item.blocked_user_id || '').trim()).filter(Boolean)
    blockedUserIds.value = new Set(ids)
  } catch {
    blockedUserIds.value = new Set()
  }
}

const openReportHandout = () => {
  moderationMode.value = 'report'
  moderationContent.value = providerModerationPayload.value
  moderationDialog.value = true
}

const openBlockProvider = () => {
  moderationMode.value = 'block'
  moderationContent.value = providerModerationPayload.value
  moderationDialog.value = true
}

const openReportPost = (post) => {
  moderationMode.value = 'report'
  moderationContent.value = {
    content_type: 'sp_post',
    content_id: post?.id || '',
    content_path: targetUserId.value && post?.id ? `users/${targetUserId.value}/posts/${post.id}` : '',
    reported_user_id: targetUserId.value,
    reported_user_display_name: businessName.value,
    source: 'public_handout',
  }
  moderationDialog.value = true
}

const handleContentReported = () => {
  const content = moderationContent.value || {}
  if (content.content_type && content.content_id) {
    reportedContentIds.value = new Set(reportedContentIds.value).add(`${content.content_type}:${content.content_id}`)
  }
}

const handleUserBlocked = () => {
  const blockedUserId = moderationContent.value?.reported_user_id || ''
  if (!blockedUserId) return
  blockedUserIds.value = new Set(blockedUserIds.value).add(blockedUserId)
  posts.value = []
}

const loadPage = async () => {
  await loadBlockedUsers()
  const doc = await resolveUserBySlug()
  if (!doc || !targetUserId.value) return
  hydrateProfile(doc)
  hydrateHandoutConfig(doc)
  serviceDescriptions.value = Array.isArray(doc?.sp_service_profile?.service_descriptions)
    ? doc.sp_service_profile.service_descriptions
    : []
  await loadPosts()
  if (String(route.query.print || '') === '1') {
    setTimeout(() => window.print(), 400)
  }
}

watch(
  () => [routeSlug.value, route.query.print],
  async () => {
    await loadPage()
  },
  { immediate: true },
)
</script>

<style scoped>
.handout-page {
  background: linear-gradient(180deg, #f7fafc 0%, #eef3f8 100%);
  min-height: 100vh;
}

.handout-shell {
  max-width: 1120px;
  margin: 0 auto;
}

.handout-header,
.handout-card {
  border-radius: 16px;
  border-color: rgba(51, 65, 85, 0.14);
  background: #ffffff;
}

.handout-kicker {
  letter-spacing: 0.18em;
  color: #64748b;
}

.handout-subheadline {
  line-height: 1.6;
}

.handout-meta,
.handout-contact {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  color: #64748b;
  font-size: 0.9rem;
}

.handout-hero-image {
  width: 100%;
  height: 320px;
  border-radius: 14px;
}

.handout-hero-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 320px;
  border-radius: 14px;
  background: linear-gradient(135deg, #dbeafe 0%, #eff6ff 100%);
}

.section-title {
  font-size: 1rem;
  font-weight: 700;
}

.section-copy {
  line-height: 1.7;
  color: #334155;
}

.services-grid,
.selling-points-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
}

.service-card,
.selling-point-card {
  border-radius: 12px;
  border-color: rgba(100, 116, 139, 0.2);
}

.service-title,
.selling-point-copy {
  font-weight: 600;
  line-height: 1.5;
}

.featured-images-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.featured-image {
  width: 100%;
  height: 190px;
  border-radius: 12px;
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
  height: 220px;
  border-radius: 8px;
}

.post-video {
  width: 100%;
  max-height: 220px;
  border-radius: 8px;
  object-fit: cover;
  background: #0f172a;
}

.contact-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
}

.contact-label {
  font-size: 0.78rem;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.contact-value {
  margin-top: 6px;
  font-weight: 600;
  color: #0f172a;
}

@media print {
  .q-page {
    padding: 0 !important;
  }

  .handout-page {
    background: #ffffff !important;
  }

  .handout-shell {
    max-width: none;
  }

  .handout-header,
  .handout-card {
    box-shadow: none !important;
    break-inside: avoid;
  }
}
</style>
