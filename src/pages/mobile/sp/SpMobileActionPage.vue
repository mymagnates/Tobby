<template>
  <q-page class="mobile-page mobile-page--with-primary-action">
    <q-form id="sp-mobile-action-form" class="mobile-page-stack" @submit="onSubmit">
      <MobilePageHeader :eyebrow="eyebrow" :title="title" :description="description">
        <template #action>
          <q-btn round flat dense icon="arrow_back" @click="router.back()" />
        </template>
      </MobilePageHeader>

      <MobileCard
        v-if="section === 'bids' && action === 'revisions'"
        title="Current Bid"
        subtitle="Revision starts from this submitted bid."
      >
        <template #headerAction>
          <MobileModerationMenu
            v-if="selectedBidModeration"
            v-bind="selectedBidModeration"
            @reported="router.back()"
            @blocked="router.back()"
          />
        </template>
        <div class="mobile-key-values">
          <div class="mobile-key-value">
            <span>Bid</span>
            <strong>{{ selectedBidTitle }}</strong>
          </div>
          <div class="mobile-key-value">
            <span>Current amount</span>
            <strong>{{ selectedBidAmount }}</strong>
          </div>
          <div class="mobile-key-value">
            <span>Status</span>
            <strong>{{ selectedBidStatus }}</strong>
          </div>
        </div>
        <div v-if="selectedBidNote" class="mobile-note-box">{{ selectedBidNote }}</div>
      </MobileCard>

      <MobileCard
        v-if="section === 'bids' && action === 'revisions'"
        title="Revision Details"
        subtitle="Update the amount or message requested by PM."
      >
        <div class="mobile-form-stack">
          <q-input
            v-model="form.bid_id"
            label="Submitted Bid ID"
            outlined
            dense
            readonly
            :rules="[required]"
          />
          <q-input
            v-model.number="form.amount"
            type="number"
            label="Revised Amount"
            prefix="$"
            outlined
            dense
            :rules="[required, positiveAmount]"
          />
          <q-select
            v-model="form.currency"
            :options="currencyOptions"
            label="Currency"
            outlined
            dense
          />
          <q-input
            v-model="form.estimated_duration"
            label="Revised Estimated Duration"
            outlined
            dense
          />
          <q-input
            v-model="form.availability_date"
            type="date"
            label="Revised Available Start Date"
            outlined
            dense
          />
          <q-input
            v-model="form.note"
            label="Revision Note"
            type="textarea"
            autogrow
            outlined
            dense
            :rules="[required]"
          />
        </div>
      </MobileCard>

      <MobileCard
        v-else-if="section === 'bids'"
        title="Lead Summary"
        subtitle="Bid starts from this selected lead."
      >
        <div class="mobile-list">
          <div class="mobile-list-row">
            <div class="mobile-list-row__icon">
              <q-icon name="assignment" size="21px" />
            </div>
            <div class="mobile-list-row__body">
              <div class="mobile-list-row__title">{{ selectedLeadTitle }}</div>
              <div class="mobile-list-row__meta">{{ selectedLeadMeta }}</div>
            </div>
            <span v-if="selectedLeadBudget" class="mobile-chip mobile-chip--accent">{{
              selectedLeadBudget
            }}</span>
          </div>
        </div>
      </MobileCard>

      <MobileCard
        v-if="section === 'bids' && action !== 'revisions'"
        title="Bid Details"
        subtitle="Match the web bid fields and include mobile scheduling details."
      >
        <div class="mobile-form-stack">
          <q-input
            v-model="form.lead_id"
            label="Lead ID"
            outlined
            dense
            readonly
            :rules="[required]"
          />
          <q-input v-model="form.lead_title" label="Lead Title" outlined dense />
          <q-input
            v-model.number="form.amount"
            type="number"
            label="Bid Amount"
            prefix="$"
            outlined
            dense
            :rules="[required, positiveAmount]"
          />
          <q-select
            v-model="form.currency"
            :options="currencyOptions"
            label="Currency"
            outlined
            dense
          />
          <q-input v-model="form.estimated_duration" label="Estimated Duration" outlined dense />
          <q-input
            v-model="form.availability_date"
            type="date"
            label="Available Start Date"
            outlined
            dense
          />
          <q-input
            v-model="form.note"
            label="Notes / Scope Message"
            type="textarea"
            autogrow
            outlined
            dense
          />
        </div>
      </MobileCard>

      <MobileCard
        v-else-if="section === 'projects' && action === 'detail'"
        title="Project"
        subtitle="Accepted project details from the SP project record."
      >
        <div class="mobile-key-values">
          <div class="mobile-key-value">
            <span>Project</span>
            <strong>{{ selectedProjectTitle }}</strong>
          </div>
          <div class="mobile-key-value">
            <span>Address</span>
            <strong>{{ selectedProjectAddress }}</strong>
          </div>
          <div class="mobile-key-value">
            <span>Status</span>
            <strong>{{ selectedProjectStatus }}</strong>
          </div>
          <div class="mobile-key-value">
            <span>Accepted</span>
            <strong>{{ selectedProjectAccepted }}</strong>
          </div>
        </div>
      </MobileCard>

      <MobileCard
        v-if="section === 'projects' && action === 'detail'"
        title="Project Phases"
        subtitle="Matches the web project phase checklist."
      >
        <div class="mobile-check-list">
          <q-checkbox
            v-for="phase in projectPhaseRows"
            :key="phase.key"
            v-model="phaseDraft[phase.key]"
            dense
            :label="phase.label"
          />
        </div>
      </MobileCard>

      <MobileCard
        v-if="section === 'projects' && action === 'detail'"
        title="Comments"
        subtitle="Saved to the project comments array."
      >
        <div v-if="projectComments.length" class="mobile-list q-mb-sm">
          <div
            v-for="comment in visibleProjectComments"
            :key="projectCommentKey(comment)"
            class="mobile-list-row"
          >
            <div class="mobile-list-row__icon">
              <q-icon name="chat_bubble" size="19px" />
            </div>
            <div class="mobile-list-row__body">
              <div class="mobile-list-row__title">
                {{ comment.text || comment.comment || 'Comment' }}
              </div>
              <div class="mobile-list-row__meta">{{ comment.created_at || '' }}</div>
            </div>
            <MobileModerationMenu
              v-bind="projectCommentModeration(comment)"
              @reported="onProjectCommentModerated"
              @blocked="onProjectCommentModerated"
            />
          </div>
        </div>
        <q-input
          v-model="form.comment"
          label="Add Comment"
          type="textarea"
          autogrow
          outlined
          dense
        />
      </MobileCard>

      <MobileCard
        v-else-if="section === 'projects'"
        title="Invoice"
        subtitle="Invoice stays attached to the selected project."
      >
        <div class="mobile-form-stack">
          <q-select
            v-model="form.project_id"
            :options="projectOptions"
            option-label="label"
            option-value="value"
            emit-value
            map-options
            label="Project"
            outlined
            dense
            :rules="[required]"
          />
          <q-input
            v-model.number="form.amount"
            type="number"
            label="Invoice Amount"
            prefix="$"
            outlined
            dense
            :rules="[required, positiveAmount]"
          />
          <q-input
            v-model="form.note"
            label="Invoice Note"
            type="textarea"
            autogrow
            outlined
            dense
          />
        </div>
      </MobileCard>

      <section v-else-if="section === 'handout' && action === 'preview'" class="sp-handout-preview">
        <div class="sp-handout-preview__hero">
          <div class="sp-handout-preview__moderation">
            <MobileModerationMenu
              v-bind="handoutProfileModeration"
              @reported="onHandoutModerated"
              @blocked="onHandoutModerated"
            />
          </div>
          <div class="sp-handout-preview__identity">
            <div class="sp-handout-preview__avatar">{{ handoutInitials }}</div>
            <div class="sp-handout-preview__identity-body">
              <h2>{{ handoutName }}</h2>
              <p>{{ handoutHeadline }}</p>
            </div>
          </div>
          <p class="sp-handout-preview__bio">{{ handoutBio }}</p>
          <div class="sp-handout-preview__chips">
            <span v-for="service in handoutServiceChips" :key="service">{{ service }}</span>
          </div>
        </div>

        <div class="sp-handout-preview__stats">
          <div v-for="stat in handoutStats" :key="stat.label" class="sp-handout-preview__stat">
            <strong>{{ stat.value }}</strong>
            <span>{{ stat.label }}</span>
          </div>
        </div>

        <div class="sp-handout-preview__panel">
          <div class="sp-handout-preview__panel-title">Contact</div>
          <div class="sp-handout-preview__contact-list">
            <div
              v-for="item in handoutContactRows"
              :key="item.label"
              class="sp-handout-preview__contact"
            >
              <q-icon :name="item.icon" size="16px" />
              <span>
                <strong>{{ item.label }}</strong>
                <small>{{ item.value }}</small>
              </span>
            </div>
          </div>
        </div>

        <div class="sp-handout-preview__panel">
          <div class="sp-handout-preview__panel-title">Recent Work</div>
          <div class="sp-handout-preview__post-list">
            <article
              v-for="post in handoutPostCards"
              :key="post.id"
              class="sp-handout-preview__post"
            >
              <div
                :class="[
                  'sp-handout-preview__post-media',
                  { 'sp-handout-preview__post-media--empty': !post.media_url },
                ]"
                :style="post.media_url ? { backgroundImage: `url(${post.media_url})` } : null"
              >
                <q-icon v-if="!post.media_url" name="image" size="18px" />
              </div>
              <div class="sp-handout-preview__post-body">
                <strong>{{ post.title }}</strong>
                <span>{{ post.summary }}</span>
              </div>
              <MobileModerationMenu
                v-bind="post.moderation"
                @reported="onHandoutModerated"
                @blocked="onHandoutModerated"
              />
            </article>
          </div>
        </div>

        <div class="sp-handout-preview__actions">
          <button type="button" class="sp-handout-preview__action" @click="shareHandoutLink">
            <q-icon name="ios_share" size="17px" />
            <span>Share Link</span>
          </button>
          <button type="button" class="sp-handout-preview__action" @click="shareHandoutImage">
            <q-icon name="image" size="17px" />
            <span>Share Image</span>
          </button>
        </div>
      </section>

      <MobileCard
        v-else-if="section === 'handout'"
        title="Post"
        subtitle="Create handout material from the mobile app."
      >
        <div class="mobile-form-stack">
          <q-input v-model="form.title" label="Title" outlined dense />
          <q-input v-model="form.content" label="Content" type="textarea" autogrow outlined dense />
          <q-input v-model="form.tags" label="Tags" hint="Comma separated" outlined dense />
          <q-file
            v-model="selectedFile"
            label="Photo or video"
            accept="image/*,video/*"
            outlined
            dense
          >
            <template #prepend>
              <q-icon name="upload_file" color="primary" />
            </template>
          </q-file>
        </div>
      </MobileCard>

      <MobileCard v-else title="SP Action" subtitle="This action is not configured yet." />
    </q-form>

    <div v-if="showPrimaryAction" class="mobile-primary-action">
      <q-btn
        unelevated
        no-caps
        color="primary"
        class="full-width"
        type="submit"
        form="sp-mobile-action-form"
        :label="primaryLabel"
        :loading="saving"
      />
    </div>
  </q-page>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Notify } from 'quasar'
import MobileCard from 'components/mobile/MobileCard.vue'
import MobileModerationMenu from 'components/mobile/MobileModerationMenu.vue'
import MobilePageHeader from 'components/mobile/MobilePageHeader.vue'
import { useFirebase } from 'src/composables/useFirebase'
import { useUserDataStore } from 'src/stores/userDataStore'
import { spPortalApi } from 'src/services/webApiClient'
import { useMobileModeration } from 'src/pages/mobile/useMobileModeration'
import {
  SP_MOBILE_PREVIEW_SP_ID,
  spMobilePreviewBids,
  spMobilePreviewLeads,
  spMobilePreviewProjects,
} from './spMobileData'

const route = useRoute()
const router = useRouter()
const userDataStore = useUserDataStore()
const { createDocument, getCollectionData, uploadFile } = useFirebase()
const { loadBlockedUsers, shouldHideModeratedItem } = useMobileModeration()

const props = defineProps({
  section: {
    type: String,
    default: '',
  },
  action: {
    type: String,
    default: '',
  },
  leadId: {
    type: String,
    default: '',
  },
  bidId: {
    type: String,
    default: '',
  },
  projectId: {
    type: String,
    default: '',
  },
})

const saving = ref(false)
const selectedFile = ref(null)
const selectedLead = ref(null)
const selectedBid = ref(null)
const selectedProject = ref(null)
const projectRows = ref([])
const handoutServices = ref([])
const handoutPosts = ref([])
const section = computed(() => String(props.section || route.params.section || ''))
const action = computed(() => String(props.action || route.params.action || ''))
const routeLeadId = computed(() => String(props.leadId || route.params.leadId || '').trim())
const routeBidId = computed(() => String(props.bidId || route.params.bidId || '').trim())
const routeProjectId = computed(() =>
  String(props.projectId || route.params.projectId || '').trim(),
)
const isPreviewRoute = computed(() => String(route.path || '').startsWith('/mobile-preview'))
const realSpId = computed(() =>
  String(userDataStore.userId || userDataStore.user?.uid || '').trim(),
)
const resolvedSpId = computed(
  () => realSpId.value || (isPreviewRoute.value ? SP_MOBILE_PREVIEW_SP_ID : ''),
)
const phaseDraft = reactive({
  plan: false,
  execution: false,
  payment: false,
  close: false,
})

const form = reactive({
  lead_id: '',
  lead_title: '',
  bid_id: '',
  amount: null,
  currency: 'USD',
  estimated_duration: '',
  availability_date: '',
  note: '',
  project_id: '',
  comment: '',
  title: '',
  content: '',
  tags: '',
})

const currencyOptions = ['USD']

const eyebrow = computed(() =>
  section.value === 'handout'
    ? 'SP Handout'
    : section.value === 'projects'
      ? 'SP Project'
      : 'SP Bid',
)
const title = computed(() => {
  if (section.value === 'handout') return action.value === 'preview' ? 'Preview' : 'Post'
  if (section.value === 'projects') return action.value === 'detail' ? 'Project' : 'Invoice'
  return action.value === 'revisions' ? 'Bid Revision' : 'Lead Bid'
})
const description = computed(() => {
  if (section.value === 'handout') return 'Create content for the public handout page.'
  if (section.value === 'projects')
    return action.value === 'detail'
      ? 'Update project phases and comments.'
      : 'Create a draft invoice from a project.'
  return action.value === 'revisions'
    ? 'Revise a bid that was already submitted.'
    : 'Submit a bid from a selected lead.'
})
const primaryLabel = computed(() => {
  if (section.value === 'handout') return 'Publish Post'
  if (section.value === 'projects')
    return action.value === 'detail' ? 'Save Project' : 'Create Invoice'
  return action.value === 'revisions' ? 'Submit Revision' : 'Submit Bid'
})
const showPrimaryAction = computed(() => !(section.value === 'handout' && action.value === 'preview'))
const selectedLeadTitle = computed(
  () => selectedLead.value?.title || form.lead_title || 'Selected lead',
)
const selectedLeadBudget = computed(() => selectedLead.value?.budget_range || '')
const selectedLeadMeta = computed(() => {
  const lead = selectedLead.value || {}
  return (
    [
      lead.category || lead.trade || '',
      lead.property_address || lead.property || lead.city || lead.location || '',
      lead.due_date ? `Due ${lead.due_date}` : '',
    ]
      .filter(Boolean)
      .join(' - ') || 'Lead context will load when available.'
  )
})
const selectedBidTitle = computed(
  () => selectedBid.value?.title || selectedBid.value?.lead_title || form.bid_id || 'Submitted bid',
)
const selectedBidAmount = computed(() => {
  const amount = selectedBid.value?.amount ?? selectedBid.value?.revised_amount ?? form.amount
  const numeric = Number(amount)
  return Number.isFinite(numeric) && numeric > 0 ? `$${numeric.toLocaleString()}` : 'Not loaded'
})
const selectedBidStatus = computed(() => selectedBid.value?.status || 'Submitted')
const selectedBidNote = computed(() => selectedBid.value?.note || selectedBid.value?.notes || '')
const selectedProjectTitle = computed(
  () =>
    selectedProject.value?.task_title ||
    selectedProject.value?.title ||
    selectedProject.value?.project_title ||
    form.project_id ||
    'Project',
)
const selectedProjectAddress = computed(
  () =>
    selectedProject.value?.address ||
    selectedProject.value?.location ||
    selectedProject.value?.property_address ||
    'No address',
)
const selectedProjectStatus = computed(() => selectedProject.value?.status || 'active')
const selectedProjectAccepted = computed(
  () => selectedProject.value?.accepted_at || selectedProject.value?.created_at || 'Not available',
)
const projectComments = computed(() => selectedProject.value?.comments || [])
const firstText = (...values) => values.map((value) => String(value || '').trim()).find(Boolean) || ''
const projectCommentKey = (comment = {}) =>
  firstText(comment.id, comment.comment_id, comment.created_at, comment.text, comment.comment, 'comment')
const projectCommentModeration = (comment = {}) => ({
  contentType: 'task_comment',
  contentId: firstText(comment.id, comment.comment_id, comment.created_at),
  contentPath: form.project_id
    ? `sp_projects/${form.project_id}/comments/${firstText(comment.id, comment.comment_id, comment.created_at)}`
    : '',
  reportedUserId: firstText(comment.author_user_id, comment.user_id, comment.author),
  reportedUserDisplayName: firstText(comment.author_name, comment.user_name),
})
const visibleProjectComments = computed(() =>
  projectComments.value.filter(
    (comment) => !shouldHideModeratedItem({ moderation: projectCommentModeration(comment) }),
  ),
)
const projectPhaseRows = [
  { key: 'plan', label: 'Plan' },
  { key: 'execution', label: 'Execution' },
  { key: 'payment', label: 'Payment' },
  { key: 'close', label: 'Close' },
]
const projectOptions = computed(() =>
  projectRows.value.map((project) => ({
    label:
      project.task_title ||
      project.title ||
      project.project_title ||
      project.project_id ||
      'Project',
    value: project.project_id || project.id,
  })),
)
const handoutName = computed(() => {
  const profile = userDataStore.userProfile || {}
  return (
    profile.sp_business_name ||
    profile.business_name ||
    profile.display_name ||
    profile.full_name ||
    userDataStore.user?.displayName ||
    'Service Provider'
  )
})
const handoutInitials = computed(() => {
  const source = String(handoutName.value || 'SP').trim()
  const words = source.split(/\s+/).filter(Boolean)
  if (words.length >= 2) return `${words[0][0]}${words[1][0]}`.toUpperCase()
  return source.slice(0, 2).toUpperCase()
})
const handoutHeadline = computed(() => {
  const profile = userDataStore.userProfile || {}
  return (
    profile.showcase_headline ||
    profile.headline ||
    profile.category ||
    'Trusted home service provider'
  )
})
const handoutBio = computed(() => {
  const profile = userDataStore.userProfile || {}
  return (
    profile.showcase_about ||
    profile.bio ||
    profile.about ||
    'A concise service handout for customers to understand your work, coverage, and recent outcomes.'
  )
})
const handoutSlug = computed(() => {
  const profile = userDataStore.userProfile || {}
  return profile.handout_slug || profile.slug || resolvedSpId.value
})
const handoutUrl = computed(() => `/public/handout/${handoutSlug.value}`)
const handoutWebOrigin = computed(() => {
  if (typeof window === 'undefined') return 'https://tobbythebutler.com'
  const origin = String(window.location.origin || '').replace(/\/$/, '')
  if (/^https?:\/\//i.test(origin)) return origin
  return String(import.meta.env.VITE_PUBLIC_WEB_ORIGIN || 'https://tobbythebutler.com').replace(/\/$/, '')
})
const handoutAbsoluteUrl = computed(() => {
  return new URL(handoutUrl.value, handoutWebOrigin.value).toString()
})
const formatServiceLabel = (value) =>
  String(value || '')
    .replace(/[_-]+/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase())
const normalizeServiceList = (value) => {
  if (Array.isArray(value)) return value.map(formatServiceLabel).filter(Boolean)
  return String(value || '')
    .split(',')
    .map(formatServiceLabel)
    .filter(Boolean)
}
const handoutServiceChips = computed(() => {
  const profile = userDataStore.userProfile || {}
  const serviceRows = handoutServices.value.map(
    (service) => service.service_type || service.name || service.title || service.category,
  )
  const profileRows = [
    ...normalizeServiceList(profile.services),
    ...normalizeServiceList(profile.showcase_skills),
  ]
  const rows = [...serviceRows.map(formatServiceLabel), ...profileRows].filter(Boolean)
  return [...new Set(rows)].slice(0, 6).length
    ? [...new Set(rows)].slice(0, 6)
    : ['Maintenance', 'Repair', 'Inspection']
})
const handoutCoverageSummary = computed(() => {
  const profile = userDataStore.userProfile || {}
  const coverage =
    profile.coverage_area || profile.service_area || profile.service_areas || profile.coverage || ''
  if (Array.isArray(coverage)) return coverage.filter(Boolean).join(', ') || 'From SP profile'
  return String(coverage || '').trim() || 'From SP profile'
})
const handoutContactRows = computed(() => {
  const profile = userDataStore.userProfile || {}
  return [
    { icon: 'place', label: 'Coverage', value: handoutCoverageSummary.value },
    {
      icon: 'mail',
      label: 'Email',
      value: profile.email || userDataStore.user?.email || 'Add email in profile',
    },
    {
      icon: 'call',
      label: 'Phone',
      value:
        profile.phone || profile.contact_phone || profile.mobile_phone || 'Add phone in profile',
    },
    { icon: 'language', label: 'Website', value: profile.website || handoutUrl.value },
  ]
})
const handoutStats = computed(() => [
  { label: 'Services', value: String(handoutServiceChips.value.length) },
  { label: 'Posts', value: String(handoutPosts.value.length) },
  { label: 'Coverage', value: handoutCoverageSummary.value === 'From SP profile' ? 'Set' : 'Live' },
])
const handoutPostCards = computed(() => {
  const rows = handoutPosts.value
    .map((post, index) => {
      const id = String(post.id || post.post_id || `post-${index}`)
      const ownerId = firstText(post.sp_id, post.user_id, post.author_user_id, resolvedSpId.value)
      return {
        id,
        title: post.title || 'Recent work',
        summary: post.content || post.summary || post.description || 'Published handout update',
        media_url: post.media_url || post.image_url || post.photo_url || '',
        moderation: {
          contentType: 'sp_post',
          contentId: id,
          contentPath: ownerId ? `users/${ownerId}/posts/${id}` : '',
          reportedUserId: ownerId,
          reportedUserDisplayName: firstText(post.author_name, post.sp_name, handoutName.value),
        },
      }
    })
    .filter((post) => !shouldHideModeratedItem({ moderation: post.moderation }))
    .slice(0, 3)
  return rows.length
    ? rows
    : [
        {
          id: 'empty-work-preview',
          title: 'Add your first work example',
          summary:
            'Publish a post to show before-and-after work, project notes, or customer-facing proof.',
          media_url: '',
          moderation: {
            contentType: 'sp_post',
            contentId: 'empty-work-preview',
            contentPath: '',
            reportedUserId: resolvedSpId.value,
            reportedUserDisplayName: handoutName.value,
          },
        },
      ]
})
const previewWriteOnly = computed(() => isPreviewRoute.value && !realSpId.value)
const selectedBidModeration = computed(() => {
  const bid = selectedBid.value
  if (!bid) return null
  const id = firstText(bid.bid_id, bid.id, form.bid_id)
  return {
    contentType: 'bid',
    contentId: id,
    contentPath: bid.lead_doc_id ? `marketplace_leads/${bid.lead_doc_id}/bids/${id}` : '',
    reportedUserId: firstText(bid.pm_id, bid.reviewed_by, bid.owner_id),
    reportedUserDisplayName: firstText(bid.pm_name, bid.reviewer_name, bid.owner_name),
  }
})
const handoutProfileModeration = computed(() => ({
  contentType: 'handout_profile',
  contentId: handoutSlug.value || resolvedSpId.value,
  contentPath: resolvedSpId.value ? `users/${resolvedSpId.value}` : '',
  reportedUserId: resolvedSpId.value,
  reportedUserDisplayName: handoutName.value,
}))

const required = (val) => !!String(val ?? '').trim() || 'Required'
const positiveAmount = (val) => Number(val) > 0 || 'Enter an amount greater than 0'

const getSpBidCore = () => {
  const profile = userDataStore.userProfile || {}
  const spName =
    profile.sp_business_name ||
    profile.business_name ||
    profile.display_name ||
    profile.full_name ||
    userDataStore.user?.displayName ||
    userDataStore.user?.email ||
    'Service Provider'

  return {
    sp_id: resolvedSpId.value,
    sp_name: spName,
    sp_contact: {
      email: profile.email || userDataStore.user?.email || '',
      phone: profile.phone || profile.contact_phone || '',
      contact_name:
        profile.contact_name || profile.full_name || userDataStore.user?.displayName || spName,
    },
  }
}

const loadLeadContext = async () => {
  const leadId = routeLeadId.value || form.lead_id
  if (!leadId) return
  const spId = resolvedSpId.value
  const rows = await spPortalApi.listLeads(spId).catch(() => [])
  const sourceRows = rows.length ? [...rows, ...spMobilePreviewLeads] : spMobilePreviewLeads
  const match =
    rows.find((lead) => {
      return [lead.id, lead.lead_doc_id, lead.lead_id].some(
        (value) => String(value || '').trim() === leadId,
      )
    }) ||
    sourceRows.find((lead) => {
      return [lead.id, lead.lead_doc_id, lead.lead_id].some(
        (value) => String(value || '').trim() === leadId,
      )
    })
  selectedLead.value = match || {
    id: leadId,
    lead_doc_id: leadId,
    lead_id: leadId,
    title: form.lead_title || leadId,
    task_title: form.lead_title || leadId,
  }
  if (match) {
    form.lead_id = String(match.id || match.lead_doc_id || match.lead_id || leadId)
    form.lead_title = match.title || match.task_title || form.lead_title
  } else {
    form.lead_id = leadId
    form.lead_title = form.lead_title || selectedLead.value.title
  }
}

const loadBidContext = async () => {
  const bidId = routeBidId.value || form.bid_id
  if (!bidId) return
  const spId = resolvedSpId.value
  const rows = await spPortalApi.listBids(spId).catch(() => [])
  const sourceRows = rows.length ? [...rows, ...spMobilePreviewBids] : spMobilePreviewBids
  const match = sourceRows.find((bid) => {
    return [bid.bid_id, bid.id].some((value) => String(value || '').trim() === bidId)
  })
  selectedBid.value = match || null
  if (match) {
    form.bid_id = String(match.bid_id || match.id || bidId)
    form.lead_id = String(match.lead_id || match.lead_doc_id || form.lead_id || '')
    form.lead_title = match.lead_title || match.title || form.lead_title
    form.amount = Number(match.amount || match.revised_amount || form.amount || 0) || null
    form.currency = match.currency || form.currency || 'USD'
    form.estimated_duration = match.estimated_duration || form.estimated_duration
    form.availability_date = match.availability_date || form.availability_date
    form.note = match.note || match.notes || form.note
  }
}

const loadProjects = async () => {
  const spId = resolvedSpId.value
  const rows = await spPortalApi.listProjects(spId).catch(() => [])
  projectRows.value = rows?.length ? [...rows, ...spMobilePreviewProjects] : spMobilePreviewProjects
  const projectId = routeProjectId.value || form.project_id
  if (!projectId) {
    const firstProject = projectRows.value[0]
    form.project_id = String(firstProject?.project_id || firstProject?.id || '')
    selectedProject.value = firstProject || null
    return
  }
  const match = projectRows.value.find((project) => {
    return [project.project_id, project.id].some(
      (value) => String(value || '').trim() === projectId,
    )
  })
  selectedProject.value = match || {
    id: projectId,
    project_id: projectId,
    title: projectId,
    project_title: projectId,
    status: 'active',
    phases: {},
    comments: [],
  }
  form.project_id = String(match?.project_id || match?.id || projectId)
  const phases = selectedProject.value?.phases || {}
  projectPhaseRows.forEach((phase) => {
    phaseDraft[phase.key] = Boolean(phases[phase.key]?.done)
  })
}

const loadHandoutContext = async () => {
  if (section.value !== 'handout') return
  if (previewWriteOnly.value) {
    handoutServices.value = [
      { id: 'preview-service-plumbing', service_type: 'plumbing' },
      { id: 'preview-service-hvac', service_type: 'hvac' },
    ]
    handoutPosts.value = [
      { id: 'preview-post-1', title: 'Recent repair example' },
      { id: 'preview-post-2', title: 'Before and after work' },
    ]
    return
  }
  const spId = resolvedSpId.value
  if (!spId) return
  const [services, posts, showcasePosts] = await Promise.all([
    getCollectionData(`users/${spId}/services`).catch(() => []),
    getCollectionData(`users/${spId}/posts`).catch(() => []),
    getCollectionData(`users/${spId}/showcase_posts`).catch(() => []),
  ])
  handoutServices.value = services || []
  handoutPosts.value = (posts?.length ? posts : showcasePosts) || []
}

watch(
  routeLeadId,
  (value) => {
    if (value) {
      form.lead_id = value
      loadLeadContext()
    }
  },
  { immediate: true },
)

watch(
  routeBidId,
  (value) => {
    if (value) {
      form.bid_id = value
      loadBidContext()
    }
  },
  { immediate: true },
)

watch(
  routeProjectId,
  (value) => {
    if (value) {
      form.project_id = value
      loadProjects()
    }
  },
  { immediate: true },
)

const onSubmit = async () => {
  saving.value = true
  try {
    if (section.value === 'bids') await submitBid()
    else if (section.value === 'projects') {
      if (action.value === 'detail') await saveProject()
      else await createInvoice()
    } else if (section.value === 'handout') await publishPost()
    else
      Notify.create({
        type: 'info',
        message: 'This SP action is not configured yet.',
        position: 'top',
      })
  } catch (error) {
    Notify.create({
      type: 'negative',
      message: error?.message || 'Action failed.',
      position: 'top',
    })
  } finally {
    saving.value = false
  }
}

const submitBid = async () => {
  if (action.value === 'revisions') {
    await submitBidRevision()
    return
  }
  if (!String(form.lead_id || '').trim()) {
    throw new Error('Select a lead before submitting a bid.')
  }
  const amount = Number(form.amount)
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error('Enter a valid bid amount.')
  }
  await spPortalApi.createBid({
    ...getSpBidCore(),
    sp_id: resolvedSpId.value,
    lead_id: String(form.lead_id || '').trim(),
    lead_doc_id: String(
      selectedLead.value?.lead_doc_id || selectedLead.value?.id || form.lead_id || '',
    ).trim(),
    mx_id: selectedLead.value?.mx_id || selectedLead.value?.task_id || null,
    task_id: selectedLead.value?.task_id || selectedLead.value?.mx_id || null,
    task_doc_id: selectedLead.value?.task_doc_id || null,
    lead_title: String(form.lead_title || '').trim(),
    title: String(form.lead_title || '').trim() || 'Mobile bid',
    amount,
    currency: form.currency || 'USD',
    estimated_duration: String(form.estimated_duration || '').trim(),
    availability_date: form.availability_date || null,
    note: String(form.note || '').trim(),
  })
  Notify.create({ type: 'positive', message: 'Bid submitted.', position: 'top' })
}

const submitBidRevision = async () => {
  const spId = resolvedSpId.value
  if (!spId) throw new Error('SP profile is not ready.')
  const amount = Number(form.amount)
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error('Enter a valid revised amount.')
  }
  const payload = {
    bid_id: String(form.bid_id || '').trim(),
    lead_id: String(form.lead_id || selectedBid.value?.lead_id || '').trim(),
    lead_title: String(
      form.lead_title || selectedBid.value?.lead_title || selectedBid.value?.title || '',
    ).trim(),
    previous_amount: Number(selectedBid.value?.amount || 0) || null,
    revised_amount: amount,
    currency: form.currency || 'USD',
    estimated_duration: String(form.estimated_duration || '').trim(),
    availability_date: form.availability_date || null,
    note: String(form.note || '').trim(),
    status: 'submitted',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  if (!previewWriteOnly.value) {
    await createDocument(`users/${spId}/bid_revisions`, payload)
  }
  Notify.create({ type: 'positive', message: 'Bid revision submitted.', position: 'top' })
}

const createInvoice = async () => {
  const amount = Number(form.amount)
  if (!String(form.project_id || '').trim())
    throw new Error('Select a project before creating an invoice.')
  if (!Number.isFinite(amount) || amount <= 0) throw new Error('Enter a valid invoice amount.')
  await spPortalApi.createInvoice({
    sp_id: resolvedSpId.value,
    project_id: String(form.project_id || '').trim(),
    amount,
    note: String(form.note || '').trim(),
  })
  Notify.create({ type: 'positive', message: 'Draft invoice created.', position: 'top' })
}

const saveProject = async () => {
  const projectId = String(form.project_id || routeProjectId.value || '').trim()
  if (!projectId) throw new Error('Project is not ready.')
  const now = new Date().toISOString()
  const currentPhases = selectedProject.value?.phases || {}
  const phases = {}
  projectPhaseRows.forEach((phase) => {
    const done = Boolean(phaseDraft[phase.key])
    phases[phase.key] = {
      done,
      completed_at: done ? currentPhases[phase.key]?.completed_at || now : null,
    }
  })
  const updates = { phases }
  const commentText = String(form.comment || '').trim()
  if (commentText) {
    updates.comments = [
      ...(selectedProject.value?.comments || []),
      { text: commentText, created_at: now, author: resolvedSpId.value },
    ]
  }
  let updated
  try {
    updated = await spPortalApi.updateProject(projectId, updates, resolvedSpId.value)
  } catch (error) {
    if (!isPreviewRoute.value || error?.message !== 'Project not found') throw error
    updated = {
      ...(selectedProject.value || { id: projectId, project_id: projectId }),
      ...updates,
      updated_at: now,
    }
  }
  selectedProject.value = { ...(selectedProject.value || {}), ...(updated || updates) }
  projectRows.value = projectRows.value.map((project) => {
    const id = String(project.project_id || project.id || '').trim()
    return id === projectId ? selectedProject.value : project
  })
  form.comment = ''
  Notify.create({ type: 'positive', message: 'Project updated.', position: 'top' })
}

const wrapCanvasText = (context, text, x, y, maxWidth, lineHeight, maxLines = 3) => {
  const words = String(text || '')
    .split(/\s+/)
    .filter(Boolean)
  const lines = []
  let currentLine = ''

  words.forEach((word) => {
    const testLine = currentLine ? `${currentLine} ${word}` : word
    if (context.measureText(testLine).width <= maxWidth) {
      currentLine = testLine
      return
    }
    if (currentLine) lines.push(currentLine)
    currentLine = word
  })
  if (currentLine) lines.push(currentLine)

  const visibleLines = lines.slice(0, maxLines)
  visibleLines.forEach((line, index) => {
    const suffix = index === maxLines - 1 && lines.length > maxLines ? '...' : ''
    context.fillText(`${line}${suffix}`, x, y + index * lineHeight)
  })
  return y + visibleLines.length * lineHeight
}

const createHandoutImageFile = async () => {
  const canvas = document.createElement('canvas')
  const width = 1080
  const height = 1350
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')

  context.fillStyle = '#f7f9fc'
  context.fillRect(0, 0, width, height)

  const gradient = context.createLinearGradient(80, 80, width - 80, 520)
  gradient.addColorStop(0, '#0f172a')
  gradient.addColorStop(1, '#205460')
  context.fillStyle = gradient
  context.roundRect(80, 80, width - 160, 560, 44)
  context.fill()

  context.strokeStyle = 'rgba(255,255,255,0.24)'
  context.lineWidth = 3
  context.beginPath()
  context.arc(width - 100, 560, 220, 0, Math.PI * 2)
  context.stroke()

  context.fillStyle = 'rgba(255,255,255,0.16)'
  context.roundRect(130, 130, 124, 124, 30)
  context.fill()
  context.fillStyle = '#ffffff'
  context.font = '700 44px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.fillText(handoutInitials.value, 192, 192)
  context.textAlign = 'left'
  context.textBaseline = 'alphabetic'

  context.fillStyle = '#ffffff'
  context.font = '700 58px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
  wrapCanvasText(context, handoutName.value, 130, 330, width - 260, 66, 2)

  context.fillStyle = 'rgba(255,255,255,0.78)'
  context.font = '400 30px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
  wrapCanvasText(context, handoutHeadline.value, 130, 430, width - 260, 40, 2)

  context.fillStyle = 'rgba(255,255,255,0.84)'
  context.font = '400 28px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
  wrapCanvasText(context, handoutBio.value, 130, 520, width - 260, 38, 3)

  const chips = handoutServiceChips.value.slice(0, 5)
  let chipX = 100
  let chipY = 700
  context.font = '600 26px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
  chips.forEach((chip) => {
    const textWidth = context.measureText(chip).width
    const chipWidth = Math.min(textWidth + 42, width - 200)
    if (chipX + chipWidth > width - 100) {
      chipX = 100
      chipY += 58
    }
    context.fillStyle = '#ffffff'
    context.roundRect(chipX, chipY, chipWidth, 42, 21)
    context.fill()
    context.fillStyle = '#0f172a'
    context.fillText(chip, chipX + 21, chipY + 29)
    chipX += chipWidth + 14
  })

  context.fillStyle = '#ffffff'
  context.roundRect(80, 820, width - 160, 250, 36)
  context.fill()
  context.fillStyle = '#0f172a'
  context.font = '700 34px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
  context.fillText('Contact', 130, 890)

  context.fillStyle = '#475569'
  context.font = '400 28px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
  const contactRows = handoutContactRows.value.slice(0, 3)
  contactRows.forEach((item, index) => {
    context.fillStyle = '#0f172a'
    context.font = '700 24px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    context.fillText(item.label, 130, 940 + index * 54)
    context.fillStyle = '#475569'
    context.font = '400 24px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    context.fillText(String(item.value || '').slice(0, 46), 300, 940 + index * 54)
  })

  context.fillStyle = '#0f172a'
  context.font = '700 30px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
  context.fillText('View handout', 130, 1160)
  context.fillStyle = '#475569'
  context.font = '400 28px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
  wrapCanvasText(context, handoutAbsoluteUrl.value, 130, 1210, width - 260, 36, 2)

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png', 0.92))
  if (!blob) throw new Error('Unable to create handout image.')
  return new File([blob], 'handout-card.png', { type: 'image/png' })
}

const shareHandoutLink = async () => {
  const shareData = {
    title: handoutName.value,
    text: `${handoutName.value} handout`,
    url: handoutAbsoluteUrl.value,
  }
  try {
    if (navigator.share) {
      await navigator.share(shareData)
      return
    }
    await navigator.clipboard?.writeText(handoutAbsoluteUrl.value)
    Notify.create({ type: 'positive', message: 'Handout link copied.', position: 'top' })
  } catch (error) {
    if (error?.name === 'AbortError') return
    Notify.create({
      type: 'negative',
      message: error?.message || 'Unable to share link.',
      position: 'top',
    })
  }
}

const shareHandoutImage = async () => {
  try {
    const imageFile = await createHandoutImageFile()
    if (navigator.canShare?.({ files: [imageFile] }) && navigator.share) {
      await navigator.share({
        title: handoutName.value,
        text: `${handoutName.value} handout`,
        files: [imageFile],
      })
      return
    }

    const url = URL.createObjectURL(imageFile)
    const link = document.createElement('a')
    link.href = url
    link.download = imageFile.name
    link.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    Notify.create({ type: 'positive', message: 'Handout image created.', position: 'top' })
  } catch (error) {
    if (error?.name === 'AbortError') return
    Notify.create({
      type: 'negative',
      message: error?.message || 'Unable to share image.',
      position: 'top',
    })
  }
}

const onProjectCommentModerated = () => {}
const onHandoutModerated = () => {}

const publishPost = async () => {
  const spId = resolvedSpId.value
  if (!spId) throw new Error('SP profile is not ready.')
  const hasText = Boolean(String(form.content || '').trim())
  const hasMedia = Boolean(selectedFile.value)
  if (!hasText && !hasMedia) throw new Error('Add content or media before publishing.')

  let mediaPayload = { media_url: '', media_type: '', media_name: '' }
  if (selectedFile.value) {
    const file = selectedFile.value
    const safeName = String(file.name || 'media').replace(/[^a-zA-Z0-9_.-]/g, '-')
    mediaPayload = {
      media_url: previewWriteOnly.value
        ? ''
        : await uploadFile(`media/posts/${spId}/${Date.now()}-${safeName}`, file),
      media_type: String(file.type || '').startsWith('video/') ? 'video' : 'image',
      media_name: file.name || '',
    }
  }

  const now = new Date().toISOString()
  const payload = {
    title: String(form.title || '').trim(),
    content: String(form.content || '').trim(),
    tags: String(form.tags || '')
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean),
    likes_count: 0,
    ...mediaPayload,
    created_at: now,
    updated_at: now,
  }
  if (!previewWriteOnly.value) {
    await createDocument(`users/${spId}/posts`, payload)
  }
  selectedFile.value = null
  Notify.create({ type: 'positive', message: 'Post published.', position: 'top' })
}

onMounted(() => {
  loadBlockedUsers()
  loadLeadContext()
  loadBidContext()
  loadProjects()
  loadHandoutContext()
})
</script>

<style scoped>
.sp-handout-preview {
  display: grid;
  gap: 12px;
}

.sp-handout-preview__hero {
  position: relative;
  overflow: hidden;
  padding: 18px;
  border: 1px solid var(--mobile-border);
  border-radius: 18px;
  color: #ffffff;
  background:
    linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(32, 84, 96, 0.94)), var(--mobile-primary);
}

.sp-handout-preview__hero::after {
  position: absolute;
  right: -44px;
  bottom: -62px;
  width: 150px;
  height: 150px;
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 50%;
  content: '';
}

.sp-handout-preview__identity {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 12px;
}

.sp-handout-preview__avatar {
  display: grid;
  flex: 0 0 54px;
  width: 54px;
  height: 54px;
  place-items: center;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.16);
  font-size: 18px;
  font-weight: 700;
}

.sp-handout-preview__identity-body {
  min-width: 0;
}

.sp-handout-preview__identity-body h2 {
  overflow: hidden;
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  letter-spacing: 0;
  line-height: 1.12;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sp-handout-preview__identity-body p {
  overflow: hidden;
  margin: 5px 0 0;
  color: rgba(255, 255, 255, 0.76);
  font-size: 12px;
  line-height: 1.25;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sp-handout-preview__bio {
  position: relative;
  z-index: 1;
  display: -webkit-box;
  overflow: hidden;
  margin: 14px 0 0;
  color: rgba(255, 255, 255, 0.82);
  font-size: 13px;
  line-height: 1.45;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}

.sp-handout-preview__chips {
  position: relative;
  z-index: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin-top: 14px;
}

.sp-handout-preview__chips span {
  display: inline-flex;
  min-height: 24px;
  align-items: center;
  padding: 4px 8px;
  border-radius: 999px;
  color: #0f172a;
  background: rgba(255, 255, 255, 0.86);
  font-size: 11px;
  font-weight: 600;
  line-height: 1;
}

.sp-handout-preview__stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.sp-handout-preview__stat {
  min-width: 0;
  padding: 12px 10px;
  border: 1px solid var(--mobile-border);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.78);
}

.sp-handout-preview__stat strong,
.sp-handout-preview__stat span {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sp-handout-preview__stat strong {
  color: var(--mobile-text);
  font-size: 17px;
  font-weight: 700;
  line-height: 1;
}

.sp-handout-preview__stat span {
  margin-top: 6px;
  color: var(--mobile-muted);
  font-size: 11px;
  line-height: 1.15;
}

.sp-handout-preview__panel {
  padding: 14px;
  border: 1px solid var(--mobile-border);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.78);
}

.sp-handout-preview__panel-title {
  margin-bottom: 10px;
  color: var(--mobile-text);
  font-size: 14px;
  font-weight: 700;
  line-height: 1.2;
}

.sp-handout-preview__contact-list,
.sp-handout-preview__post-list {
  display: grid;
  gap: 10px;
}

.sp-handout-preview__contact {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  min-width: 0;
  color: var(--mobile-primary);
}

.sp-handout-preview__contact span {
  display: grid;
  min-width: 0;
  gap: 2px;
}

.sp-handout-preview__contact strong,
.sp-handout-preview__contact small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sp-handout-preview__contact strong {
  color: var(--mobile-text);
  font-size: 12px;
  font-weight: 700;
  line-height: 1.2;
}

.sp-handout-preview__contact small {
  color: var(--mobile-muted);
  font-size: 12px;
  line-height: 1.25;
}

.sp-handout-preview__post {
  display: grid;
  grid-template-columns: 52px minmax(0, 1fr);
  gap: 10px;
  align-items: center;
}

.sp-handout-preview__post-media {
  display: grid;
  width: 52px;
  height: 52px;
  place-items: center;
  border-radius: 12px;
  background-color: var(--neutral-100, #eef3f8);
  background-position: center;
  background-size: cover;
  color: var(--mobile-muted);
}

.sp-handout-preview__post-media--empty {
  border: 1px dashed var(--mobile-border-strong);
}

.sp-handout-preview__post-body {
  display: grid;
  min-width: 0;
  gap: 4px;
}

.sp-handout-preview__post-body strong,
.sp-handout-preview__post-body span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sp-handout-preview__post-body strong {
  color: var(--mobile-text);
  font-size: 13px;
  font-weight: 700;
  line-height: 1.2;
}

.sp-handout-preview__post-body span {
  color: var(--mobile-muted);
  font-size: 12px;
  line-height: 1.25;
}

.sp-handout-preview__actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 9px;
}

.sp-handout-preview__action {
  display: flex;
  min-width: 0;
  align-items: center;
  justify-content: center;
  gap: 7px;
  min-height: 44px;
  padding: 10px 12px;
  border: 1px solid var(--mobile-border);
  border-radius: 12px;
  color: var(--mobile-primary);
  background: rgba(255, 255, 255, 0.64);
  cursor: pointer;
  font: inherit;
  font-size: 12px;
  font-weight: 600;
}

.sp-handout-preview__action:active {
  background: var(--neutral-50, #f7fafc);
  transform: translateY(1px);
}

.sp-handout-preview__action span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
