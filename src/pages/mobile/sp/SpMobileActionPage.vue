<template>
  <q-page class="mobile-page mobile-page--with-primary-action">
    <q-form id="sp-mobile-action-form" class="mobile-page-stack" @submit="onSubmit">
      <MobilePageHeader :eyebrow="eyebrow" :title="title" :description="description">
        <template #action>
          <q-btn round flat dense icon="arrow_back" @click="router.back()" />
        </template>
      </MobilePageHeader>

      <MobileCard v-if="section === 'bids' && action === 'revisions'" title="Current Bid" subtitle="Revision starts from this submitted bid.">
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

      <MobileCard v-if="section === 'bids' && action === 'revisions'" title="Revision Details" subtitle="Update the amount or message requested by PM.">
        <div class="mobile-form-stack">
          <q-input v-model="form.bid_id" label="Submitted Bid ID" outlined dense readonly :rules="[required]" />
          <q-input v-model.number="form.amount" type="number" label="Revised Amount" prefix="$" outlined dense :rules="[required, positiveAmount]" />
          <q-select v-model="form.currency" :options="currencyOptions" label="Currency" outlined dense />
          <q-input v-model="form.estimated_duration" label="Revised Estimated Duration" outlined dense />
          <q-input v-model="form.availability_date" type="date" label="Revised Available Start Date" outlined dense />
          <q-input v-model="form.note" label="Revision Note" type="textarea" autogrow outlined dense :rules="[required]" />
        </div>
      </MobileCard>

      <MobileCard v-else-if="section === 'bids'" title="Lead Summary" subtitle="Bid starts from this selected lead.">
        <div class="mobile-list">
          <div class="mobile-list-row">
            <div class="mobile-list-row__icon">
              <q-icon name="assignment" size="21px" />
            </div>
            <div class="mobile-list-row__body">
              <div class="mobile-list-row__title">{{ selectedLeadTitle }}</div>
              <div class="mobile-list-row__meta">{{ selectedLeadMeta }}</div>
            </div>
            <span v-if="selectedLeadBudget" class="mobile-chip mobile-chip--accent">{{ selectedLeadBudget }}</span>
          </div>
        </div>
      </MobileCard>

      <MobileCard v-if="section === 'bids' && action !== 'revisions'" title="Bid Details" subtitle="Match the web bid fields and include mobile scheduling details.">
        <div class="mobile-form-stack">
          <q-input v-model="form.lead_id" label="Lead ID" outlined dense readonly :rules="[required]" />
          <q-input v-model="form.lead_title" label="Lead Title" outlined dense />
          <q-input v-model.number="form.amount" type="number" label="Bid Amount" prefix="$" outlined dense :rules="[required, positiveAmount]" />
          <q-select v-model="form.currency" :options="currencyOptions" label="Currency" outlined dense />
          <q-input v-model="form.estimated_duration" label="Estimated Duration" outlined dense />
          <q-input v-model="form.availability_date" type="date" label="Available Start Date" outlined dense />
          <q-input v-model="form.note" label="Notes / Scope Message" type="textarea" autogrow outlined dense />
        </div>
      </MobileCard>

      <MobileCard v-else-if="section === 'projects' && action === 'detail'" title="Project" subtitle="Accepted project details from the SP project record.">
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

      <MobileCard v-if="section === 'projects' && action === 'detail'" title="Project Phases" subtitle="Matches the web project phase checklist.">
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

      <MobileCard v-if="section === 'projects' && action === 'detail'" title="Comments" subtitle="Saved to the project comments array.">
        <div v-if="projectComments.length" class="mobile-list q-mb-sm">
          <div v-for="(comment, index) in projectComments" :key="`${comment.created_at || 'comment'}-${index}`" class="mobile-list-row">
            <div class="mobile-list-row__icon">
              <q-icon name="chat_bubble" size="19px" />
            </div>
            <div class="mobile-list-row__body">
              <div class="mobile-list-row__title">{{ comment.text || comment.comment || 'Comment' }}</div>
              <div class="mobile-list-row__meta">{{ comment.created_at || '' }}</div>
            </div>
          </div>
        </div>
        <q-input v-model="form.comment" label="Add Comment" type="textarea" autogrow outlined dense />
      </MobileCard>

      <MobileCard v-else-if="section === 'projects'" title="Invoice" subtitle="Invoice stays attached to the selected project.">
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
          <q-input v-model.number="form.amount" type="number" label="Invoice Amount" prefix="$" outlined dense :rules="[required, positiveAmount]" />
          <q-input v-model="form.note" label="Invoice Note" type="textarea" autogrow outlined dense />
        </div>
      </MobileCard>

      <MobileCard v-else-if="section === 'handout' && action === 'preview'" title="Handout Preview" subtitle="Public handout reads profile, services, and published posts.">
        <div class="mobile-key-values">
          <div class="mobile-key-value">
            <span>Business</span>
            <strong>{{ handoutName }}</strong>
          </div>
          <div class="mobile-key-value">
            <span>Slug</span>
            <strong>{{ handoutSlug }}</strong>
          </div>
          <div class="mobile-key-value">
            <span>URL</span>
            <strong>{{ handoutUrl }}</strong>
          </div>
          <div class="mobile-key-value">
            <span>Services</span>
            <strong>{{ handoutServiceSummary }}</strong>
          </div>
          <div class="mobile-key-value">
            <span>Coverage</span>
            <strong>{{ handoutCoverageSummary }}</strong>
          </div>
          <div class="mobile-key-value">
            <span>Posts</span>
            <strong>{{ handoutPostSummary }}</strong>
          </div>
        </div>
      </MobileCard>

      <MobileCard v-else-if="section === 'handout'" title="Post" subtitle="Create handout material from the mobile app.">
        <div class="mobile-form-stack">
          <q-input v-model="form.title" label="Title" outlined dense />
          <q-input v-model="form.content" label="Content" type="textarea" autogrow outlined dense />
          <q-input v-model="form.tags" label="Tags" hint="Comma separated" outlined dense />
          <q-file v-model="selectedFile" label="Photo or video" accept="image/*,video/*" outlined dense>
            <template #prepend>
              <q-icon name="upload_file" color="primary" />
            </template>
          </q-file>
        </div>
      </MobileCard>

      <MobileCard v-else title="SP Action" subtitle="This action is not configured yet." />
    </q-form>

    <div class="mobile-primary-action">
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
import MobilePageHeader from 'components/mobile/MobilePageHeader.vue'
import { useFirebase } from 'src/composables/useFirebase'
import { useUserDataStore } from 'src/stores/userDataStore'
import { spPortalApi } from 'src/services/webApiClient'
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
const routeProjectId = computed(() => String(props.projectId || route.params.projectId || '').trim())
const isPreviewRoute = computed(() => String(route.path || '').startsWith('/mobile-preview'))
const realSpId = computed(() => String(userDataStore.userId || userDataStore.user?.uid || '').trim())
const resolvedSpId = computed(() => realSpId.value || (isPreviewRoute.value ? SP_MOBILE_PREVIEW_SP_ID : ''))
const phaseDraft = reactive({
  scheduled: false,
  in_progress: false,
  completed: false,
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

const eyebrow = computed(() => section.value === 'handout' ? 'SP Handout' : section.value === 'projects' ? 'SP Project' : 'SP Bid')
const title = computed(() => {
  if (section.value === 'handout') return action.value === 'preview' ? 'Preview' : 'Post'
  if (section.value === 'projects') return action.value === 'detail' ? 'Project' : 'Invoice'
  return action.value === 'revisions' ? 'Bid Revision' : 'Lead Bid'
})
const description = computed(() => {
  if (section.value === 'handout') return 'Create content for the public handout page.'
  if (section.value === 'projects') return action.value === 'detail' ? 'Update project phases and comments.' : 'Create a draft invoice from a project.'
  return action.value === 'revisions' ? 'Revise a bid that was already submitted.' : 'Submit a bid from a selected lead.'
})
const primaryLabel = computed(() => {
  if (section.value === 'handout') return action.value === 'preview' ? 'Open Handout' : 'Publish Post'
  if (section.value === 'projects') return action.value === 'detail' ? 'Save Project' : 'Create Invoice'
  return action.value === 'revisions' ? 'Submit Revision' : 'Submit Bid'
})
const selectedLeadTitle = computed(() => selectedLead.value?.title || form.lead_title || 'Selected lead')
const selectedLeadBudget = computed(() => selectedLead.value?.budget_range || '')
const selectedLeadMeta = computed(() => {
  const lead = selectedLead.value || {}
  return [
    lead.category || lead.trade || '',
    lead.property_address || lead.property || lead.city || lead.location || '',
    lead.due_date ? `Due ${lead.due_date}` : '',
  ].filter(Boolean).join(' - ') || 'Lead context will load when available.'
})
const selectedBidTitle = computed(() => selectedBid.value?.title || selectedBid.value?.lead_title || form.bid_id || 'Submitted bid')
const selectedBidAmount = computed(() => {
  const amount = selectedBid.value?.amount ?? selectedBid.value?.revised_amount ?? form.amount
  const numeric = Number(amount)
  return Number.isFinite(numeric) && numeric > 0 ? `$${numeric.toLocaleString()}` : 'Not loaded'
})
const selectedBidStatus = computed(() => selectedBid.value?.status || 'Submitted')
const selectedBidNote = computed(() => selectedBid.value?.note || selectedBid.value?.notes || '')
const selectedProjectTitle = computed(() => selectedProject.value?.task_title || selectedProject.value?.title || selectedProject.value?.project_title || form.project_id || 'Project')
const selectedProjectAddress = computed(() => selectedProject.value?.address || selectedProject.value?.location || selectedProject.value?.property_address || 'No address')
const selectedProjectStatus = computed(() => selectedProject.value?.status || 'active')
const selectedProjectAccepted = computed(() => selectedProject.value?.accepted_at || selectedProject.value?.created_at || 'Not available')
const projectComments = computed(() => selectedProject.value?.comments || [])
const projectPhaseRows = [
  { key: 'scheduled', label: 'Scheduled' },
  { key: 'in_progress', label: 'In progress' },
  { key: 'completed', label: 'Completed' },
]
const projectOptions = computed(() => projectRows.value.map((project) => ({
  label: project.task_title || project.title || project.project_title || project.project_id || 'Project',
  value: project.project_id || project.id,
})))
const handoutName = computed(() => {
  const profile = userDataStore.userProfile || {}
  return profile.sp_business_name || profile.business_name || profile.display_name || profile.full_name || userDataStore.user?.displayName || 'Service Provider'
})
const handoutSlug = computed(() => {
  const profile = userDataStore.userProfile || {}
  return profile.handout_slug || profile.slug || resolvedSpId.value
})
const handoutUrl = computed(() => `/public/handout/${handoutSlug.value}`)
const handoutServiceSummary = computed(() => {
  const profile = userDataStore.userProfile || {}
  const profileServices = Array.isArray(profile.services) ? profile.services : []
  const count = handoutServices.value.length || profileServices.length
  return count ? `${count} service${count === 1 ? '' : 's'}` : 'Profile services'
})
const handoutCoverageSummary = computed(() => {
  const profile = userDataStore.userProfile || {}
  const coverage = profile.coverage_area || profile.service_area || profile.service_areas || profile.coverage || ''
  if (Array.isArray(coverage)) return coverage.filter(Boolean).join(', ') || 'From SP profile'
  return String(coverage || '').trim() || 'From SP profile'
})
const handoutPostSummary = computed(() => {
  const count = handoutPosts.value.length
  return count ? `${count} published post${count === 1 ? '' : 's'}` : 'No published posts loaded'
})
const previewWriteOnly = computed(() => isPreviewRoute.value && !realSpId.value)

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
      contact_name: profile.contact_name || profile.full_name || userDataStore.user?.displayName || spName,
    },
  }
}

const loadLeadContext = async () => {
  const leadId = routeLeadId.value || form.lead_id
  if (!leadId) return
  const spId = resolvedSpId.value
  const rows = await spPortalApi.listLeads(spId).catch(() => [])
  const sourceRows = rows.length ? [...rows, ...spMobilePreviewLeads] : spMobilePreviewLeads
  const match = rows.find((lead) => {
    return [lead.id, lead.lead_doc_id, lead.lead_id].some((value) => String(value || '').trim() === leadId)
  }) || sourceRows.find((lead) => {
    return [lead.id, lead.lead_doc_id, lead.lead_id].some((value) => String(value || '').trim() === leadId)
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
    return [project.project_id, project.id].some((value) => String(value || '').trim() === projectId)
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
    } else if (section.value === 'handout' && action.value === 'preview') openHandoutPreview()
    else if (section.value === 'handout') await publishPost()
    else Notify.create({ type: 'info', message: 'This SP action is not configured yet.', position: 'top' })
  } catch (error) {
    Notify.create({ type: 'negative', message: error?.message || 'Action failed.', position: 'top' })
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
    lead_doc_id: String(selectedLead.value?.lead_doc_id || selectedLead.value?.id || form.lead_id || '').trim(),
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
    lead_title: String(form.lead_title || selectedBid.value?.lead_title || selectedBid.value?.title || '').trim(),
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
  if (!String(form.project_id || '').trim()) throw new Error('Select a project before creating an invoice.')
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
    updated = await spPortalApi.updateProject(projectId, updates)
  } catch (error) {
    if (!isPreviewRoute.value || error?.message !== 'Project not found') throw error
    updated = { ...(selectedProject.value || { id: projectId, project_id: projectId }), ...updates, updated_at: now }
  }
  selectedProject.value = { ...(selectedProject.value || {}), ...(updated || updates) }
  projectRows.value = projectRows.value.map((project) => {
    const id = String(project.project_id || project.id || '').trim()
    return id === projectId ? selectedProject.value : project
  })
  form.comment = ''
  Notify.create({ type: 'positive', message: 'Project updated.', position: 'top' })
}

const openHandoutPreview = () => {
  window.open(handoutUrl.value, '_blank', 'noopener,noreferrer')
}

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
      media_url: previewWriteOnly.value ? '' : await uploadFile(`media/posts/${spId}/${Date.now()}-${safeName}`, file),
      media_type: String(file.type || '').startsWith('video/') ? 'video' : 'image',
      media_name: file.name || '',
    }
  }

  const now = new Date().toISOString()
  const payload = {
    title: String(form.title || '').trim(),
    content: String(form.content || '').trim(),
    tags: String(form.tags || '').split(',').map((tag) => tag.trim()).filter(Boolean),
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
  loadLeadContext()
  loadBidContext()
  loadProjects()
  loadHandoutContext()
})
</script>
