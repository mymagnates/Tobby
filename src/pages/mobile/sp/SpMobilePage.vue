<template>
  <RoleWorkflowPage :content="content" :loading="loading" />
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import RoleWorkflowPage from 'src/pages/mobile/RoleWorkflowPage.vue'
import { spPortalApi } from 'src/services/webApiClient'
import { useUserDataStore } from 'src/stores/userDataStore'
import { useFirebase } from 'src/composables/useFirebase'
import { spMobilePages } from './spMobileData'

const props = defineProps({
  pageKey: {
    type: String,
    required: true,
  },
})

const route = useRoute()
const userDataStore = useUserDataStore()
const { getCollectionData } = useFirebase()
const leads = ref([])
const bids = ref([])
const projects = ref([])
const invoices = ref([])
const posts = ref([])
const loading = ref(false)

const spId = computed(() => String(userDataStore.userId || userDataStore.user?.uid || '').trim())
const mobileBase = computed(() => String(route.path || '').startsWith('/mobile-preview') ? '/mobile-preview' : '/mobile')
const normalizeMobileLink = (to) => String(to || '').replace(/^\/mobile(?=\/sp)/, mobileBase.value)
const localizeItems = (items = []) => items.map((item) => ({
  ...item,
  to: item.to ? normalizeMobileLink(item.to) : item.to,
}))
const localizeContent = (content) => ({
  ...content,
  actionGroups: (content.actionGroups || []).map((group) => ({
    ...group,
    actions: localizeItems(group.actions || []),
  })),
  sections: (content.sections || []).map((section) => ({
    ...section,
    items: localizeItems(section.items || []),
  })),
})
const fallbackContent = computed(() => localizeContent(spMobilePages[props.pageKey] || spMobilePages.home))

const getLeadId = (lead) => String(lead?.id || lead?.lead_doc_id || lead?.lead_id || '').trim()
const getBidId = (bid) => String(bid?.bid_id || bid?.id || '').trim()
const getProjectId = (project) => String(project?.project_id || project?.id || '').trim()
const firstText = (...values) => values.map((value) => String(value || '').trim()).find(Boolean) || ''
const money = (value) => `$${Number(value || 0).toLocaleString()}`
const statusTone = (status) => {
  const normalized = String(status || '').toLowerCase()
  if (['new', 'open', 'submitted', 'selected', 'active'].includes(normalized)) return 'accent'
  if (['revision_requested', 'revise', 'pending'].includes(normalized)) return 'warning'
  if (['rejected', 'cancelled', 'withdrawn'].includes(normalized)) return 'danger'
  return ''
}

const leadItems = computed(() => leads.value.map((lead) => {
  const id = getLeadId(lead)
  return {
    icon: lead.category_icon || 'construction',
    title: lead.title || lead.task_title || 'Lead',
    meta: [lead.category, lead.city || lead.location, lead.budget_range].filter(Boolean).join(' - ') || 'Open lead',
    status: 'Bid',
    tone: 'accent',
    to: id ? `${mobileBase.value}/sp/leads/${id}/bid` : '',
    moderation: {
      contentType: 'other',
      contentId: id,
      contentPath: id ? `marketplace_leads/${id}` : '',
      reportedUserId: firstText(lead.pm_id, lead.owner_id, lead.created_by_user_id, lead.user_id),
      reportedUserDisplayName: firstText(lead.pm_name, lead.owner_name, lead.created_by_name),
    },
  }
}))

const bidItems = computed(() => bids.value.map((bid) => {
  const id = getBidId(bid)
  const normalizedStatus = String(bid.status || 'submitted')
  return {
    icon: normalizedStatus.toLowerCase().includes('revision') || normalizedStatus.toLowerCase() === 'revise' ? 'rate_review' : 'request_quote',
    title: bid.title || bid.lead_title || 'Submitted bid',
    meta: `${money(bid.amount)} - ${normalizedStatus}`,
    status: normalizedStatus,
    tone: statusTone(normalizedStatus),
    to: id ? `${mobileBase.value}/sp/bids/${id}/revision` : '',
    moderation: {
      contentType: 'bid',
      contentId: id,
      contentPath: bid.lead_doc_id
        ? `marketplace_leads/${bid.lead_doc_id}/bids/${id}`
        : '',
      reportedUserId: firstText(bid.pm_id, bid.reviewed_by, bid.owner_id),
      reportedUserDisplayName: firstText(bid.pm_name, bid.reviewer_name, bid.owner_name),
    },
  }
}))

const projectItems = computed(() => projects.value.map((project) => {
  const id = getProjectId(project)
  return {
    icon: 'work',
    title: project.task_title || project.title || project.project_title || project.project_id || 'Project',
    meta: [project.address || project.location || project.property_address, project.accepted_at ? `Accepted ${project.accepted_at}` : 'Accepted project'].filter(Boolean).join(' - '),
    status: project.status || 'Active',
    tone: statusTone(project.status || 'active'),
    to: id ? `${mobileBase.value}/sp/projects/${id}/detail` : '',
    moderation: {
      contentType: 'other',
      contentId: id,
      contentPath: id ? `sp_projects/${id}` : '',
      reportedUserId: firstText(project.pm_id, project.owner_id, project.created_by_user_id),
      reportedUserDisplayName: firstText(project.pm_name, project.owner_name, project.created_by_name),
    },
  }
}))

const projectInvoiceItems = computed(() => projects.value.map((project) => {
  const id = getProjectId(project)
  return {
    icon: 'receipt_long',
    title: `Invoice ${project.task_title || project.title || id || 'project'}`,
    meta: [project.address || project.location || project.property_address, 'Draft invoice from project'].filter(Boolean).join(' - '),
    status: 'Create',
    tone: 'accent',
    to: id ? `${mobileBase.value}/sp/projects/${id}/invoice` : `${mobileBase.value}/sp/projects/invoice`,
  }
}))

const invoiceItems = computed(() => invoices.value.map((invoice) => ({
  icon: 'receipt_long',
  title: `Invoice ${invoice.invoice_id || invoice.id || ''}`.trim(),
  meta: `${money(invoice.amount)} - ${invoice.status || 'draft'}`,
  status: invoice.status || 'Draft',
  tone: statusTone(invoice.status || 'draft'),
})))

const postItems = computed(() => posts.value.map((post) => ({
  icon: post.media_type === 'video' ? 'smart_display' : post.media_url ? 'image' : 'article',
  title: post.title || 'Handout post',
  meta: [post.content ? String(post.content).slice(0, 72) : 'Media post', post.created_at || post.updated_at].filter(Boolean).join(' - '),
  status: 'Post',
  moderation: {
    contentType: 'sp_post',
    contentId: String(post.id || post.post_id || ''),
    contentPath: resolvedPostPath(post),
    reportedUserId: firstText(post.author_user_id, post.user_id, post.sp_id, spId.value),
    reportedUserDisplayName: firstText(post.author_name, post.display_name, post.sp_name),
  },
})))

const resolvedPostPath = (post) => {
  const id = String(post?.id || post?.post_id || '').trim()
  const ownerId = firstText(post?.sp_id, post?.user_id, spId.value)
  return ownerId && id ? `users/${ownerId}/posts/${id}` : ''
}

const content = computed(() => {
  const base = fallbackContent.value

  if (props.pageKey === 'home' && leadItems.value.length) {
    return {
      ...base,
      metrics: [],
      sections: [{ title: 'Leads', items: leadItems.value }],
    }
  }

  if (props.pageKey === 'bids' && bidItems.value.length) {
    return {
      ...base,
      sections: [{ title: 'Submitted', items: bidItems.value }],
    }
  }

  if (props.pageKey === 'projects' && (projectItems.value.length || invoiceItems.value.length)) {
    return {
      ...base,
      sections: [
        { title: 'Active Projects', items: projectItems.value },
        {
          title: 'Project Invoices',
          items: [
            ...projectInvoiceItems.value,
            ...invoiceItems.value,
          ],
        },
      ],
    }
  }

  if (props.pageKey === 'handout' && postItems.value.length) {
    return {
      ...base,
      sections: [
        { title: 'Published Posts', items: postItems.value },
        ...(base.sections || []),
      ],
    }
  }

  return base
})

const loadSpData = async () => {
  const id = spId.value
  loading.value = true
  try {
    const [leadRows, bidRows, projectRows, invoiceRows, postRows] = await Promise.all([
      spPortalApi.listLeads(id).catch(() => []),
      spPortalApi.listBids(id).catch(() => []),
      spPortalApi.listProjects(id).catch(() => []),
      spPortalApi.listInvoices(id).catch(() => []),
      id ? getCollectionData(`users/${id}/posts`).catch(() => []) : [],
    ])
    leads.value = leadRows || []
    bids.value = bidRows || []
    projects.value = projectRows || []
    invoices.value = invoiceRows || []
    posts.value = postRows || []
    if (!posts.value.length && id) {
      posts.value = await getCollectionData(`users/${id}/showcase_posts`).catch(() => [])
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadSpData()
})
</script>
