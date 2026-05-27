<template>
  <q-page class="q-pa-sm handout-builder-page">
    <q-card flat bordered class="builder-card q-mb-sm">
      <q-card-section class="row items-start justify-between q-col-gutter-md">
        <div class="col">
          <div class="text-subtitle1 text-weight-medium">Build Handout</div>
          <div class="text-caption text-grey-7">
            Assemble your standardized Handout page. Profile and service details are managed in their source pages.
          </div>
        </div>
        <div class="col-auto row items-center q-gutter-sm">
          <q-btn flat no-caps icon="arrow_back" label="Back" @click="goBack" />
          <q-btn flat no-caps icon="visibility" label="Preview" @click="openPreview" />
          <q-btn flat no-caps icon="share" label="Share" @click="showShareDialog = true" />
          <q-btn flat no-caps icon="picture_as_pdf" label="Download PDF" @click="downloadPdf" />
          <q-btn color="primary" no-caps icon="save" label="Save" :loading="saving" @click="saveConfig" />
        </div>
      </q-card-section>
    </q-card>

    <div class="builder-grid">
      <div class="builder-main">
        <q-card flat bordered class="builder-card q-mb-sm">
          <q-card-section class="row items-center justify-between q-pb-sm">
            <div>
              <div class="section-title">Hero</div>
              <div class="section-source">Business name and contact come from Profile.</div>
            </div>
            <q-btn flat dense no-caps icon="open_in_new" label="Open Profile" @click="router.push('/sp-profile')" />
          </q-card-section>
          <q-card-section class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-input v-model="form.headline" outlined dense label="Headline" bg-color="grey-1" />
            </div>
            <div class="col-12 col-md-6">
              <q-input v-model="form.subheadline" outlined dense label="Subheadline" bg-color="grey-1" />
            </div>
            <div class="col-12">
              <q-select
                v-model="form.hero_image_url"
                :options="imageOptions"
                option-label="label"
                option-value="value"
                emit-value
                map-options
                outlined
                dense
                label="Hero Image"
                bg-color="grey-1"
              />
            </div>
            <div class="col-12">
              <div v-if="form.hero_image_url" class="hero-preview-wrap">
                <q-img :src="form.hero_image_url" class="hero-preview-image" fit="cover" />
              </div>
            </div>
            <div class="col-12">
              <div class="row q-col-gutter-md">
                <div class="col-auto"><q-checkbox v-model="form.show_phone" label="Show phone" /></div>
                <div class="col-auto"><q-checkbox v-model="form.show_email" label="Show email" /></div>
                <div class="col-auto"><q-checkbox v-model="form.show_website" label="Show website" /></div>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <q-card flat bordered class="builder-card q-mb-sm">
          <q-card-section class="row items-center justify-between q-pb-sm">
            <div>
              <div class="section-title">About</div>
              <div class="section-source">Service area and verification summary remain sourced from Profile and Services.</div>
            </div>
            <div class="row items-center q-gutter-sm">
              <q-checkbox v-model="form.section_visibility.about" label="Show section" />
              <q-btn flat dense no-caps icon="open_in_new" label="Open Profile" @click="router.push('/sp-profile')" />
            </div>
          </q-card-section>
          <q-card-section class="row q-col-gutter-md">
            <div class="col-12">
              <q-input
                v-model="form.about_text"
                type="textarea"
                autogrow
                outlined
                dense
                label="Handout About Text"
                bg-color="grey-1"
              />
            </div>
            <div class="col-auto"><q-checkbox v-model="form.show_service_area" label="Show service area" /></div>
            <div class="col-auto"><q-checkbox v-model="form.show_verification_summary" label="Show verification summary" /></div>
          </q-card-section>
        </q-card>

        <q-card flat bordered class="builder-card q-mb-sm">
          <q-card-section class="row items-center justify-between q-pb-sm">
            <div>
              <div class="section-title">Services</div>
              <div class="section-source">Descriptions come from Services page. Only display options are set here.</div>
            </div>
            <div class="row items-center q-gutter-sm">
              <q-checkbox v-model="form.section_visibility.services" label="Show section" />
              <q-btn flat dense no-caps icon="open_in_new" label="Open Services" @click="router.push('/sp-services')" />
            </div>
          </q-card-section>
          <q-card-section class="row q-col-gutter-md">
            <div class="col-12 col-md-4">
              <q-select
                v-model="form.service_display_mode"
                :options="serviceDisplayOptions"
                outlined
                dense
                emit-value
                map-options
                label="Display Mode"
                bg-color="grey-1"
              />
            </div>
            <div class="col-12 col-md-4">
              <q-input
                v-model.number="form.service_limit"
                type="number"
                min="1"
                max="12"
                outlined
                dense
                label="Max Services to Show"
                bg-color="grey-1"
              />
            </div>
          </q-card-section>
        </q-card>

        <q-card flat bordered class="builder-card q-mb-sm">
          <q-card-section class="row items-center justify-between q-pb-sm">
            <div>
              <div class="section-title">Featured Work</div>
              <div class="section-source">Choose which images and content posts appear on the Handout page.</div>
            </div>
            <q-checkbox v-model="form.section_visibility.featured_work" label="Show section" />
          </q-card-section>
          <q-card-section class="row q-col-gutter-lg">
            <div class="col-12 col-lg-6">
              <div class="text-subtitle2 q-mb-sm">Featured Content</div>
              <q-banner v-if="!postOptions.length" rounded class="bg-grey-2 text-grey-8 q-mb-sm">
                No content posts available yet. Create posts from SP Dashboard first.
              </q-banner>
              <div v-else class="selection-list">
                <label
                  v-for="option in postOptions"
                  :key="option.value"
                  class="selection-item"
                >
                  <q-checkbox
                    :model-value="form.featured_post_ids.includes(option.value)"
                    @update:model-value="toggleArraySelection(form.featured_post_ids, option.value, $event, 6)"
                  />
                  <div class="selection-copy">
                    <div class="selection-title">{{ option.label }}</div>
                    <div class="selection-meta">{{ option.meta }}</div>
                  </div>
                </label>
              </div>
            </div>
            <div class="col-12 col-lg-6">
              <div class="text-subtitle2 q-mb-sm">Featured Images</div>
              <q-banner v-if="!imageOptions.length" rounded class="bg-grey-2 text-grey-8 q-mb-sm">
                No image posts available yet.
              </q-banner>
              <div v-else class="image-selection-grid">
                <label
                  v-for="option in imageOptions"
                  :key="option.value"
                  class="image-selection-item"
                >
                  <q-img :src="option.value" class="image-selection-thumb" fit="cover" />
                  <div class="image-selection-check">
                    <q-checkbox
                      :model-value="form.featured_image_urls.includes(option.value)"
                      @update:model-value="toggleArraySelection(form.featured_image_urls, option.value, $event, 6)"
                    />
                  </div>
                </label>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <q-card flat bordered class="builder-card q-mb-sm">
          <q-card-section class="row items-center justify-between q-pb-sm">
            <div>
              <div class="section-title">Why Choose Us</div>
              <div class="section-source">Handout-only selling points.</div>
            </div>
            <q-checkbox v-model="form.section_visibility.why_choose_us" label="Show section" />
          </q-card-section>
          <q-card-section class="row q-col-gutter-md">
            <div v-for="(_, index) in form.selling_points" :key="`selling-${index}`" class="col-12 col-md-6">
              <q-input
                v-model="form.selling_points[index]"
                outlined
                dense
                :label="`Selling Point ${index + 1}`"
                bg-color="grey-1"
              />
            </div>
          </q-card-section>
        </q-card>

        <q-card flat bordered class="builder-card">
          <q-card-section class="row items-center justify-between q-pb-sm">
            <div>
              <div class="section-title">Contact / CTA</div>
              <div class="section-source">Contact info is sourced from Profile. CTA text is managed here.</div>
            </div>
            <q-checkbox v-model="form.section_visibility.contact" label="Show section" />
          </q-card-section>
          <q-card-section class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-input v-model="form.cta_text" outlined dense label="CTA Text" bg-color="grey-1" />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <aside class="builder-side">
        <q-card flat bordered class="builder-card q-mb-sm">
          <q-card-section>
            <div class="section-title">Preview Summary</div>
            <div class="text-caption text-grey-7 q-mb-sm">
              This page assembles your public Handout. Profile and service details are still maintained in source pages.
            </div>
            <div class="summary-line"><strong>Public URL</strong></div>
            <div class="summary-url">{{ shareUrl }}</div>
            <q-separator class="q-my-sm" />
            <div class="summary-line"><strong>Featured content:</strong> {{ form.featured_post_ids.length }}</div>
            <div class="summary-line"><strong>Featured images:</strong> {{ form.featured_image_urls.length }}</div>
            <div class="summary-line"><strong>Services shown:</strong> {{ effectiveServices.length }}</div>
          </q-card-section>
        </q-card>

        <q-card flat bordered class="builder-card">
          <q-card-section>
            <div class="section-title">Content Sources</div>
            <q-list dense separator>
              <q-item clickable @click="router.push('/sp-profile')">
                <q-item-section>
                  <q-item-label>Profile</q-item-label>
                  <q-item-label caption>Business name, contact, bio, website</q-item-label>
                </q-item-section>
              </q-item>
              <q-item clickable @click="router.push('/sp-services')">
                <q-item-section>
                  <q-item-label>Services</q-item-label>
                  <q-item-label caption>Service descriptions and coverage</q-item-label>
                </q-item-section>
              </q-item>
              <q-item clickable @click="router.push('/sp-dashboard')">
                <q-item-section>
                  <q-item-label>Content</q-item-label>
                  <q-item-label caption>Posts and media used in Featured Work</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </aside>
    </div>

    <q-dialog v-model="showShareDialog">
      <q-card style="min-width: 560px; max-width: 92vw">
        <q-card-section class="row items-center justify-between">
          <div class="text-h6">Share Handout</div>
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-separator />
        <q-card-section>
          <q-input v-model="shareUrl" outlined dense readonly label="Public Handout Link" />
        </q-card-section>
        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat no-caps label="Copy Link" @click="copyShareUrl" />
          <q-btn flat no-caps label="Close" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Notify } from 'quasar'
import { useFirebase } from 'src/composables/useFirebase'
import { useUserDataStore } from 'src/stores/userDataStore'
import { resolveSpSlug } from 'src/utils/spPosts'

const router = useRouter()
const userStore = useUserDataStore()
const { getDocument, getCollectionData } = useFirebase()

const saving = ref(false)
const showShareDialog = ref(false)
const posts = ref([])
const rawUserDoc = ref(null)
const loadedSpId = ref('')

const serviceDisplayOptions = [
  { label: 'Compact', value: 'compact' },
  { label: 'Expanded', value: 'expanded' },
]

const createDefaultForm = () => ({
  headline: '',
  subheadline: '',
  about_text: '',
  hero_image_url: '',
  featured_post_ids: [],
  featured_image_urls: [],
  selling_points: ['', '', ''],
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

const form = reactive(createDefaultForm())

const spSlug = computed(() => resolveSpSlug(userStore.userProfile || {}, userStore.userId || userStore.user?.uid || ''))
const shareUrl = computed(() => `${window.location.origin}/public/handout/${spSlug.value}`)
const currentSpId = computed(() => String(userStore.userId || userStore.user?.uid || '').trim())

const serviceDescriptions = computed(() => {
  const profile = rawUserDoc.value?.sp_service_profile || {}
  const seeded = Array.isArray(profile.service_descriptions) ? profile.service_descriptions : []
  if (seeded.length) return seeded
  const fallback = userStore.userProfile?.services
  if (Array.isArray(fallback)) return fallback
  if (typeof fallback === 'string') {
    return fallback.split(',').map((item) => item.trim()).filter(Boolean)
  }
  return []
})

const effectiveServices = computed(() =>
  serviceDescriptions.value.slice(0, Math.max(1, Number(form.service_limit || 6)))
)

const postOptions = computed(() =>
  posts.value.map((post) => ({
    label: post.title || 'Untitled Content',
    value: String(post.id || ''),
    meta: `${post.media_type || 'text'} · ${formatDate(post.created_at || post.updated_at)}`,
  }))
)

const imageOptions = computed(() =>
  posts.value
    .filter((post) => post.media_type === 'image' && post.media_url)
    .map((post) => ({
      label: post.title || 'Image',
      value: post.media_url,
    }))
)

const formatDate = (value) => {
  if (!value) return '-'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return '-'
  return parsed.toLocaleDateString()
}

const hydrateForm = (config = {}) => {
  const defaults = createDefaultForm()
  Object.assign(form, defaults, config)
  form.featured_post_ids = Array.isArray(config.featured_post_ids) ? [...config.featured_post_ids] : []
  form.featured_image_urls = Array.isArray(config.featured_image_urls) ? [...config.featured_image_urls] : []
  form.selling_points = Array.isArray(config.selling_points) && config.selling_points.length
    ? [...config.selling_points].slice(0, 5)
    : ['', '', '']
  while (form.selling_points.length < 3) form.selling_points.push('')
  form.section_visibility = {
    ...defaults.section_visibility,
    ...(config.section_visibility || {}),
  }
}

const loadData = async () => {
  if (!currentSpId.value && userStore.user) {
    await userStore.loadAllUserData().catch(() => {})
  }
  const spId = currentSpId.value
  if (!spId) return
  loadedSpId.value = spId
  const [userDoc, postRows, legacyPostRows] = await Promise.all([
    getDocument(`users/${spId}`).catch(() => null),
    getCollectionData(`users/${spId}/posts`).catch(() => []),
    getCollectionData(`users/${spId}/showcase_posts`).catch(() => []),
  ])
  rawUserDoc.value = userDoc || {}
  const mergedPosts = new Map()
  ;[...(legacyPostRows || []), ...(postRows || [])].forEach((post) => {
    const id = String(post?.id || post?.post_id || post?.media_url || '')
    if (id) mergedPosts.set(id, post)
  })
  posts.value = [...mergedPosts.values()].sort((a, b) => String(b.updated_at || b.created_at || '').localeCompare(String(a.updated_at || a.created_at || '')))
  hydrateForm((userDoc && userDoc.handout_config) || {})
  if (!form.hero_image_url && imageOptions.value.length) {
    form.hero_image_url = imageOptions.value[0].value
  }
}

const toggleArraySelection = (target, value, checked, max) => {
  const normalized = String(value || '')
  const next = Array.isArray(target) ? target : []
  const existingIndex = next.findIndex((item) => String(item) === normalized)
  if (checked) {
    if (existingIndex < 0 && next.length < max) next.push(normalized)
  } else if (existingIndex >= 0) {
    next.splice(existingIndex, 1)
  }
}

const sanitizePayload = () => ({
  headline: String(form.headline || '').trim(),
  subheadline: String(form.subheadline || '').trim(),
  about_text: String(form.about_text || '').trim(),
  hero_image_url: String(form.hero_image_url || '').trim(),
  featured_post_ids: form.featured_post_ids.map((item) => String(item)).filter(Boolean).slice(0, 6),
  featured_image_urls: form.featured_image_urls.map((item) => String(item)).filter(Boolean).slice(0, 6),
  selling_points: form.selling_points.map((item) => String(item || '').trim()).filter(Boolean).slice(0, 5),
  cta_text: String(form.cta_text || '').trim() || 'Contact for quote',
  show_phone: Boolean(form.show_phone),
  show_email: Boolean(form.show_email),
  show_website: Boolean(form.show_website),
  show_service_area: Boolean(form.show_service_area),
  show_verification_summary: Boolean(form.show_verification_summary),
  service_display_mode: String(form.service_display_mode || 'compact'),
  service_limit: Math.max(1, Math.min(12, Number(form.service_limit || 6))),
  section_visibility: {
    about: Boolean(form.section_visibility.about),
    services: Boolean(form.section_visibility.services),
    featured_work: Boolean(form.section_visibility.featured_work),
    why_choose_us: Boolean(form.section_visibility.why_choose_us),
    contact: Boolean(form.section_visibility.contact),
  },
  updated_at: new Date().toISOString(),
})

const saveConfig = async () => {
  saving.value = true
  try {
    await userStore.updateUserProfile({
      handout_config: sanitizePayload(),
    })
    Notify.create({ type: 'positive', message: 'Handout configuration saved.', position: 'top' })
  } catch (error) {
    Notify.create({ type: 'negative', message: error.message || 'Failed to save Handout configuration.', position: 'top' })
  } finally {
    saving.value = false
  }
}

const copyShareUrl = async () => {
  try {
    await navigator.clipboard.writeText(shareUrl.value)
    Notify.create({ type: 'positive', message: 'Handout link copied.', position: 'top' })
  } catch {
    Notify.create({ type: 'warning', message: 'Copy failed. Please copy the link manually.', position: 'top' })
  }
}

const openPreview = () => {
  window.open(shareUrl.value, '_blank', 'noopener,noreferrer')
}

const downloadPdf = () => {
  window.open(`${shareUrl.value}?print=1`, '_blank', 'noopener,noreferrer')
}

const goBack = () => {
  if (window.history.length > 1) {
    router.back()
    return
  }
  router.push('/sp-dashboard')
}

watch(
  currentSpId,
  (spId) => {
    if (spId && spId !== loadedSpId.value) loadData()
  },
  { immediate: true },
)
</script>

<style scoped>
.handout-builder-page {
  background: var(--bg-secondary);
}

.builder-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 12px;
}

.builder-card {
  border-radius: 14px;
  border: 1px solid var(--neutral-200);
  background: var(--bg-surface);
}

.builder-side {
  min-width: 0;
}

.section-title {
  font-size: 1rem;
  font-weight: 700;
}

.section-source {
  margin-top: 4px;
  font-size: 0.78rem;
  color: var(--neutral-500);
}

.selection-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.selection-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px;
  border: 1px solid var(--neutral-200);
  border-radius: 10px;
  background: #fff;
}

.selection-copy {
  min-width: 0;
}

.selection-title {
  font-weight: 600;
}

.selection-meta {
  font-size: 0.78rem;
  color: var(--neutral-500);
}

.image-selection-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.image-selection-item {
  position: relative;
  border: 1px solid var(--neutral-200);
  border-radius: 10px;
  overflow: hidden;
  background: #fff;
}

.image-selection-thumb {
  width: 100%;
  height: 140px;
}

.image-selection-check {
  position: absolute;
  top: 6px;
  right: 6px;
  background: rgba(255, 255, 255, 0.92);
  border-radius: 999px;
}

.hero-preview-wrap {
  border: 1px solid var(--neutral-200);
  border-radius: 12px;
  overflow: hidden;
}

.hero-preview-image {
  width: 100%;
  height: 220px;
}

.summary-line {
  font-size: 0.9rem;
  margin-bottom: 8px;
}

.summary-url {
  font-size: 0.8rem;
  line-height: 1.45;
  color: var(--primary-color);
  word-break: break-all;
}

@media (max-width: 1024px) {
  .builder-grid {
    grid-template-columns: 1fr;
  }
}
</style>
