<template>
  <q-page class="sp-feed-page q-pa-sm">
    <!-- Loading State -->
    <div v-if="!dataLoaded" class="data-loading-page">
      <div class="loading-content">
        <q-spinner size="4em" color="primary" />
        <div class="text-h4 q-mt-md">Loading Dashboard</div>
        <div class="text-h6 q-mt-sm text-grey-6">Please wait while we load your data...</div>
        <div class="loading-steps q-mt-lg">
          <div class="loading-step" :class="{ active: loadingStep >= 1, completed: loadingStep > 1 }">
            <q-icon name="person" size="20px" />
            <span>Loading Profile</span>
          </div>
          <div class="loading-step" :class="{ active: loadingStep >= 2, completed: loadingStep > 2 }">
            <q-icon name="campaign" size="20px" />
            <span>Loading Leads</span>
          </div>
          <div class="loading-step" :class="{ active: loadingStep >= 3, completed: loadingStep > 3 }">
            <q-icon name="gavel" size="20px" />
            <span>Loading Bids</span>
          </div>
          <div class="loading-step" :class="{ active: loadingStep >= 4, completed: loadingStep > 4 }">
            <q-icon name="engineering" size="20px" />
            <span>Loading Projects</span>
          </div>
          <div class="loading-step" :class="{ active: loadingStep >= 5, completed: dataLoaded }">
            <q-icon name="dashboard" size="20px" />
            <span>Preparing Feed</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 3-column Feed Layout -->
    <div v-else class="feed-shell">
      <!-- Left Rail: Projects -->
      <aside class="feed-reminders">
        <q-card class="rail-card">
          <q-card-section class="q-pa-sm">
            <div class="rail-title">Active Projects</div>
            <div v-if="!openProjects.length" class="rail-empty">
              <q-icon name="engineering" size="32px" color="grey-4" />
              <div class="rail-empty-text">No active projects</div>
            </div>
            <div v-else class="project-rail-list">
              <div
                v-for="proj in openProjects"
                :key="proj.project_id"
                class="project-rail-item project-rail-clickable"
                @click="showProjectDetail(proj.project_id)"
              >
                <div class="project-rail-left">
                  <div class="project-rail-title">{{ proj.task_title || `Project ${proj.project_id}` }}</div>
                  <div class="project-rail-meta">
                    <q-icon name="location_on" size="12px" class="q-mr-xs" />{{ proj.address || 'N/A' }}
                  </div>
                </div>
                <q-chip dense size="sm" :color="proj.status === 'completed' ? 'green' : proj.status === 'in_progress' ? 'blue' : 'amber'" text-color="white" class="project-rail-status">
                  {{ proj.status || 'active' }}
                </q-chip>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </aside>

      <!-- Main Feed -->
      <div class="feed-main">
        <!-- Stats row -->
        <div class="feed-stats-row q-mb-md">
          <q-card class="stat-card-mini">
            <q-card-section class="q-pa-sm">
              <q-icon name="campaign" size="20px" color="primary" />
              <div class="stat-mini-value">{{ newLeadCount }}</div>
              <div class="stat-mini-label">New Leads</div>
            </q-card-section>
          </q-card>
          <q-card class="stat-card-mini">
            <q-card-section class="q-pa-sm">
              <q-icon name="gavel" size="20px" color="positive" />
              <div class="stat-mini-value">{{ totalBids }}</div>
              <div class="stat-mini-label">Bids</div>
            </q-card-section>
          </q-card>
          <q-card class="stat-card-mini">
            <q-card-section class="q-pa-sm">
              <q-icon name="engineering" size="20px" color="warning" />
              <div class="stat-mini-value">{{ totalProjects }}</div>
              <div class="stat-mini-label">Projects</div>
            </q-card-section>
          </q-card>
          <q-card class="stat-card-mini">
            <q-card-section class="q-pa-sm">
              <q-icon name="trending_up" size="20px" color="info" />
              <div class="stat-mini-value">{{ bidSuccessRate }}%</div>
              <div class="stat-mini-label">Win Rate</div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Quick Actions -->
        <q-card class="create-new-card q-mb-md">
          <q-card-section class="create-new-section">
            <div class="create-new-actions">
              <q-btn flat dense no-caps icon="campaign" label="Leads" :color="feedView === 'leads' ? 'primary' : 'grey-7'" @click="setFeedView('leads')" />
              <q-btn flat dense no-caps icon="gavel" label="Bids" :color="feedView === 'bids' ? 'primary' : 'grey-7'" @click="setFeedView('bids')" />
              <q-btn flat dense no-caps icon="engineering" label="Projects" :color="feedView === 'projects' ? 'primary' : 'grey-7'" @click="setFeedView('projects')" />
              <q-btn flat dense no-caps icon="receipt_long" label="Invoices" :color="feedView === 'invoices' ? 'primary' : 'grey-7'" @click="setFeedView('invoices')" />
              <q-btn flat dense no-caps icon="handyman" label="Services" color="grey-7" @click="goToServices" />
              <div class="feed-sort-group">
                <span class="feed-sort-label">Sort</span>
                <q-btn
                  flat dense no-caps
                  label="Time"
                  :icon-right="sortIcon('time')"
                  :color="feedSortField === 'time' ? 'primary' : 'grey-7'"
                  class="feed-sort-btn"
                  @click="toggleSort('time')"
                />
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Feed -->
        <div class="feed-list">
          <!-- Leads view (default) -->
          <template v-if="feedView === 'leads'">
            <q-card v-if="!sortedLeads.length" class="feed-post feed-empty-card q-mb-sm">
              <q-card-section class="q-pa-md">
                <div class="post-title q-mb-xs">No Leads Available</div>
                <div class="post-body">New leads from property managers will appear here.</div>
              </q-card-section>
            </q-card>

            <q-card
              v-for="lead in sortedLeads"
              :key="lead.lead_id"
              class="feed-post feed-mini-card"
              :class="{ 'feed-post-expanded': expandedFeedId === `lead-${lead.lead_id}` }"
            >
              <q-card-section class="feed-post-section feed-post-clickable" @click="toggleFeedExpand(`lead-${lead.lead_id}`)">
                <div class="feed-card-row">
                  <q-avatar size="32px" color="blue-2" text-color="white" class="feed-card-avatar">
                    <q-icon name="campaign" size="16px" />
                  </q-avatar>
                  <div class="feed-card-content">
                    <div class="feed-card-header">
                      <div class="post-title">{{ lead.title || 'New Lead' }}</div>
                      <div class="post-time">{{ formatRelativeTime(lead.created_at) }}</div>
                    </div>
                    <div class="post-body">{{ lead.description || lead.scope || 'No description' }}</div>
                    <div class="feed-card-footer">
                      <span v-if="lead.budget_range" class="post-amount">{{ lead.budget_range }}</span>
                      <span v-else></span>
                      <div v-if="lead.location" class="post-property">
                        <q-icon name="location_on" size="12px" class="q-mr-xs" />{{ lead.location }}
                      </div>
                    </div>
                  </div>
                  <q-icon :name="expandedFeedId === `lead-${lead.lead_id}` ? 'expand_less' : 'expand_more'" size="18px" color="grey-5" class="feed-expand-icon" />
                </div>
              </q-card-section>
              <q-slide-transition>
                <div v-show="expandedFeedId === `lead-${lead.lead_id}`" class="feed-detail-panel">
                  <q-separator />
                  <div class="feed-detail-body">
                    <div class="detail-grid">
                      <div class="detail-item">
                        <span class="detail-label">Status</span>
                        <q-chip dense size="sm" :color="lead.status === 'open' ? 'green' : 'grey'" text-color="white">{{ lead.status || 'open' }}</q-chip>
                      </div>
                      <div class="detail-item">
                        <span class="detail-label">Budget</span>
                        <span class="detail-value text-weight-bold">{{ lead.budget_range || '—' }}</span>
                      </div>
                      <div class="detail-item">
                        <span class="detail-label">Location</span>
                        <span class="detail-value">{{ lead.location || '—' }}</span>
                      </div>
                      <div class="detail-item">
                        <span class="detail-label">Posted</span>
                        <span class="detail-value">{{ formatDate(lead.created_at) }}</span>
                      </div>
                    </div>
                    <div v-if="lead.description" class="detail-description">
                      <span class="detail-label">Description</span>
                      <p>{{ lead.description }}</p>
                    </div>
                    <div v-if="lead.scope" class="detail-description">
                      <span class="detail-label">Scope</span>
                      <p>{{ lead.scope }}</p>
                    </div>
                    <div class="detail-actions">
                      <q-btn dense no-caps size="sm" icon="gavel" label="Submit Bid" color="primary" @click.stop="openBidDialog(lead)" />
                    </div>
                  </div>
                </div>
              </q-slide-transition>
            </q-card>
          </template>

          <!-- Bids view -->
          <template v-else-if="feedView === 'bids'">
            <q-card v-if="!sortedBids.length" class="feed-post feed-empty-card q-mb-sm">
              <q-card-section class="q-pa-md">
                <div class="post-title q-mb-xs">No Bids Yet</div>
                <div class="post-body">Your submitted bids will appear here.</div>
              </q-card-section>
            </q-card>

            <q-card
              v-for="bid in sortedBids"
              :key="bid.bid_id"
              class="feed-post feed-mini-card"
              :class="{ 'feed-post-expanded': expandedFeedId === `bid-${bid.bid_id}` }"
            >
              <q-card-section class="feed-post-section feed-post-clickable" @click="toggleFeedExpand(`bid-${bid.bid_id}`)">
                <div class="feed-card-row">
                  <q-avatar size="32px" color="green-2" text-color="white" class="feed-card-avatar">
                    <q-icon name="gavel" size="16px" />
                  </q-avatar>
                  <div class="feed-card-content">
                    <div class="feed-card-header">
                      <div class="post-title">{{ bid.title || 'Bid Submitted' }}</div>
                      <div class="post-time">{{ formatRelativeTime(bid.created_at) }}</div>
                    </div>
                    <div class="post-body">${{ Number(bid.amount || 0).toLocaleString() }} · {{ bid.status || 'pending' }}</div>
                    <div class="feed-card-footer">
                      <q-chip dense size="xs" :color="bid.status === 'selected' ? 'green' : bid.status === 'rejected' ? 'red' : 'amber'" text-color="white">{{ bid.status === 'selected' ? 'Won' : bid.status || 'pending' }}</q-chip>
                      <span></span>
                    </div>
                  </div>
                  <q-icon :name="expandedFeedId === `bid-${bid.bid_id}` ? 'expand_less' : 'expand_more'" size="18px" color="grey-5" class="feed-expand-icon" />
                </div>
              </q-card-section>
              <q-slide-transition>
                <div v-show="expandedFeedId === `bid-${bid.bid_id}`" class="feed-detail-panel">
                  <q-separator />
                  <div class="feed-detail-body">
                    <div class="detail-grid">
                      <div class="detail-item">
                        <span class="detail-label">Status</span>
                        <q-chip dense size="sm" :color="bid.status === 'selected' ? 'green' : bid.status === 'rejected' ? 'red' : 'amber'" text-color="white">{{ bid.status || 'pending' }}</q-chip>
                      </div>
                      <div class="detail-item">
                        <span class="detail-label">Amount</span>
                        <span class="detail-value text-weight-bold">${{ Number(bid.amount || 0).toLocaleString() }}</span>
                      </div>
                      <div class="detail-item">
                        <span class="detail-label">Lead</span>
                        <span class="detail-value">{{ bid.lead_title || bid.lead_id || '—' }}</span>
                      </div>
                      <div class="detail-item">
                        <span class="detail-label">Submitted</span>
                        <span class="detail-value">{{ formatDate(bid.created_at) }}</span>
                      </div>
                    </div>
                    <div v-if="bid.note || bid.message" class="detail-description">
                      <span class="detail-label">Note</span>
                      <p>{{ bid.note || bid.message }}</p>
                    </div>
                  </div>
                </div>
              </q-slide-transition>
            </q-card>
          </template>

          <!-- Invoices view -->
          <template v-else-if="feedView === 'invoices'">
            <q-card v-if="!sortedInvoices.length" class="feed-post feed-empty-card q-mb-sm">
              <q-card-section class="q-pa-md">
                <div class="post-title q-mb-xs">No Invoices Yet</div>
                <div class="post-body">Your invoices will appear here.</div>
              </q-card-section>
            </q-card>

            <q-card
              v-for="inv in sortedInvoices"
              :key="inv.invoice_id || inv.id"
              class="feed-post feed-mini-card"
              :class="{ 'feed-post-expanded': expandedFeedId === `inv-${inv.invoice_id || inv.id}` }"
            >
              <q-card-section class="feed-post-section feed-post-clickable" @click="toggleFeedExpand(`inv-${inv.invoice_id || inv.id}`)">
                <div class="feed-card-row">
                  <q-avatar size="32px" color="purple-2" text-color="white" class="feed-card-avatar">
                    <q-icon name="receipt_long" size="16px" />
                  </q-avatar>
                  <div class="feed-card-content">
                    <div class="feed-card-header">
                      <div class="post-title">Invoice {{ inv.invoice_id || inv.id || '' }}</div>
                      <div class="post-time">{{ formatRelativeTime(inv.created_at || inv.issued_date) }}</div>
                    </div>
                    <div class="post-body">${{ Number(inv.amount || 0).toLocaleString() }} · {{ inv.status || 'draft' }}</div>
                    <div class="feed-card-footer">
                      <q-chip dense size="xs" :color="inv.status === 'paid' ? 'green' : inv.status === 'overdue' ? 'red' : 'amber'" text-color="white">{{ inv.status || 'draft' }}</q-chip>
                      <span></span>
                    </div>
                  </div>
                  <q-icon :name="expandedFeedId === `inv-${inv.invoice_id || inv.id}` ? 'expand_less' : 'expand_more'" size="18px" color="grey-5" class="feed-expand-icon" />
                </div>
              </q-card-section>
              <q-slide-transition>
                <div v-show="expandedFeedId === `inv-${inv.invoice_id || inv.id}`" class="feed-detail-panel">
                  <q-separator />
                  <div class="feed-detail-body">
                    <div class="detail-grid">
                      <div class="detail-item">
                        <span class="detail-label">Status</span>
                        <q-chip dense size="sm" :color="inv.status === 'paid' ? 'green' : inv.status === 'overdue' ? 'red' : 'amber'" text-color="white">{{ inv.status || 'draft' }}</q-chip>
                      </div>
                      <div class="detail-item">
                        <span class="detail-label">Amount</span>
                        <span class="detail-value text-weight-bold">${{ Number(inv.amount || 0).toLocaleString() }}</span>
                      </div>
                      <div class="detail-item">
                        <span class="detail-label">Issued</span>
                        <span class="detail-value">{{ formatDate(inv.issued_date || inv.created_at) }}</span>
                      </div>
                      <div class="detail-item">
                        <span class="detail-label">Due</span>
                        <span class="detail-value">{{ formatDate(inv.due_date) }}</span>
                      </div>
                    </div>
                    <div v-if="inv.notes || inv.description" class="detail-description">
                      <span class="detail-label">Notes</span>
                      <p>{{ inv.notes || inv.description }}</p>
                    </div>
                  </div>
                </div>
              </q-slide-transition>
            </q-card>
          </template>

          <!-- Projects view -->
          <template v-else-if="feedView === 'projects'">
            <q-card v-if="!sortedProjects.length" class="feed-post feed-empty-card q-mb-sm">
              <q-card-section class="q-pa-md">
                <div class="post-title q-mb-xs">No Projects Yet</div>
                <div class="post-body">Your projects will appear here once a bid is accepted.</div>
              </q-card-section>
            </q-card>

            <q-card
              v-for="proj in sortedProjects"
              :key="proj.project_id"
              class="feed-post feed-mini-card"
              :class="{ 'feed-post-expanded': expandedFeedId === `proj-${proj.project_id}` }"
            >
              <q-card-section class="feed-post-section feed-post-clickable" @click="toggleFeedExpand(`proj-${proj.project_id}`)">
                <div class="feed-card-row">
                  <q-avatar size="32px" color="orange-2" text-color="white" class="feed-card-avatar">
                    <q-icon name="engineering" size="16px" />
                  </q-avatar>
                  <div class="feed-card-content">
                    <div class="feed-card-header">
                      <div class="post-title">{{ proj.task_title || `Project ${proj.project_id}` }}</div>
                      <div class="post-time">{{ formatRelativeTime(proj.accepted_at || proj.created_at) }}</div>
                    </div>
                    <div class="post-body">{{ proj.address || 'No address' }}</div>
                    <div class="feed-card-footer">
                      <q-chip dense size="xs" :color="proj.status === 'completed' ? 'green' : proj.status === 'in_progress' ? 'blue' : 'amber'" text-color="white">{{ proj.status || 'active' }}</q-chip>
                      <span></span>
                    </div>
                  </div>
                  <q-icon :name="expandedFeedId === `proj-${proj.project_id}` ? 'expand_less' : 'expand_more'" size="18px" color="grey-5" class="feed-expand-icon" />
                </div>
              </q-card-section>
              <q-slide-transition>
                <div v-show="expandedFeedId === `proj-${proj.project_id}`" class="feed-detail-panel">
                  <q-separator />
                  <div class="feed-detail-body">
                    <div class="detail-grid">
                      <div class="detail-item">
                        <span class="detail-label">Status</span>
                        <q-chip dense size="sm" :color="proj.status === 'completed' ? 'green' : proj.status === 'in_progress' ? 'blue' : 'amber'" text-color="white">{{ proj.status || 'active' }}</q-chip>
                      </div>
                      <div class="detail-item">
                        <span class="detail-label">Address</span>
                        <span class="detail-value">{{ proj.address || '—' }}</span>
                      </div>
                      <div class="detail-item">
                        <span class="detail-label">Task</span>
                        <span class="detail-value">{{ proj.task_title || '—' }}</span>
                      </div>
                      <div class="detail-item">
                        <span class="detail-label">Accepted</span>
                        <span class="detail-value">{{ formatDate(proj.accepted_at) }}</span>
                      </div>
                    </div>

                    <!-- Phase checklist -->
                    <div class="phase-checklist q-mt-md">
                      <div class="detail-label q-mb-xs">Project Phases</div>
                      <div
                        v-for="phase in getPhases(proj)"
                        :key="phase.key"
                        class="phase-row"
                        :class="{ 'phase-done': phase.done }"
                      >
                        <q-checkbox
                          :model-value="phase.done"
                          dense
                          size="sm"
                          color="primary"
                          @update:model-value="(val) => togglePhase(proj, phase.key, val)"
                        />
                        <div class="phase-info">
                          <div class="phase-name">{{ phase.label }}</div>
                          <div v-if="phase.completedAt" class="phase-date">{{ formatDate(phase.completedAt) }}</div>
                        </div>
                        <q-icon :name="phase.icon" size="16px" :color="phase.done ? 'positive' : 'grey-4'" />
                      </div>
                    </div>

                    <!-- Comments -->
                    <div class="phase-comments q-mt-md">
                      <div class="detail-label q-mb-xs">Comments</div>
                      <div v-if="getComments(proj).length" class="comment-list">
                        <div v-for="(c, idx) in getComments(proj)" :key="idx" class="comment-item">
                          <div class="comment-text">{{ c.text }}</div>
                          <div class="comment-meta">{{ formatRelativeTime(c.created_at) }}</div>
                        </div>
                      </div>
                      <div v-else class="comment-empty">No comments yet</div>
                      <div class="comment-input-row q-mt-xs">
                        <q-input
                          v-model="commentInputs[proj.project_id]"
                          dense
                          outlined
                          placeholder="Add a comment..."
                          class="comment-input"
                          @keyup.enter="addComment(proj)"
                        />
                        <q-btn flat dense icon="send" color="primary" :disable="!commentInputs[proj.project_id]" @click="addComment(proj)" />
                      </div>
                    </div>
                  </div>
                </div>
              </q-slide-transition>
            </q-card>
          </template>
        </div>
      </div>

      <!-- Right Rail: Ad Slot -->
      <aside class="feed-rail">
        <q-card class="rail-card">
          <q-card-section class="q-pa-sm">
            <div class="rail-title q-mb-sm">Ad Slot</div>
            <div class="ad-placeholder">Reserved for future ad placement</div>
          </q-card-section>
        </q-card>
      </aside>
    </div>

    <!-- Submit Bid Dialog -->
    <q-dialog v-model="showBidDialog">
      <q-card style="min-width: 380px; max-width: 480px;">
        <q-card-section class="row items-center justify-between q-pb-none">
          <div class="text-subtitle1 text-weight-bold">Submit Bid</div>
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-separator class="q-mt-sm" />
        <q-card-section>
          <div v-if="bidTargetLead" class="q-mb-md text-body2">
            <strong>Lead:</strong> {{ bidTargetLead.title }}<br/>
            <span class="text-grey-7">{{ bidTargetLead.location || '' }} · {{ bidTargetLead.budget_range || '' }}</span>
          </div>
          <q-input v-model="bidAmount" label="Bid Amount ($)" outlined dense type="number" class="q-mb-md" />
          <q-input v-model="bidNote" label="Message / Note" outlined dense type="textarea" autogrow />
        </q-card-section>
        <q-card-actions align="right" class="q-px-md q-pb-md">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn color="primary" label="Submit" :disable="!bidAmount" :loading="submittingBid" @click="handleSubmitBid" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Notify } from 'quasar'
import { useUserDataStore } from 'src/stores/userDataStore'
import { spPortalApi } from 'src/services/webApiClient'
import { useFirebase } from 'src/composables/useFirebase'

const userStore = useUserDataStore()
const router = useRouter()
const { createDocument } = useFirebase()

const leads = ref([])
const bids = ref([])
const projects = ref([])
const invoices = ref([])

const leadsLoading = ref(true)
const bidsLoading = ref(true)
const projectsLoading = ref(true)
const invoicesLoading = ref(true)

const loadingStep = computed(() => {
  if (!userStore.isAuthenticated) return 0
  if (leadsLoading.value && bidsLoading.value && projectsLoading.value) return 1
  if (leadsLoading.value) return 2
  if (bidsLoading.value) return 3
  if (projectsLoading.value) return 4
  return 5
})

const dataLoaded = computed(() => {
  return !leadsLoading.value && !bidsLoading.value && !projectsLoading.value && !invoicesLoading.value
})

// Stats
const newLeadCount = computed(() => leads.value.filter((r) => r.status === 'open').length)
const totalBids = computed(() => bids.value.length)
const totalProjects = computed(() => projects.value.length)
const successfulBidCount = computed(() => bids.value.filter((r) => r.status === 'selected').length)
const bidSuccessRate = computed(() => {
  if (!totalBids.value) return 0
  return Math.round((successfulBidCount.value / totalBids.value) * 100)
})

// Feed view switching
const feedView = ref('leads')
const setFeedView = (view) => {
  feedView.value = view
  expandedFeedId.value = null
}

const goToServices = () => {
  router.push('/sp-services')
}

// Expanded feed item
const expandedFeedId = ref(null)
const toggleFeedExpand = (id) => {
  expandedFeedId.value = expandedFeedId.value === id ? null : id
}

const showProjectDetail = (projectId) => {
  feedView.value = 'projects'
  expandedFeedId.value = `proj-${projectId}`
}

// Bid dialog
const showBidDialog = ref(false)
const bidTargetLead = ref(null)
const bidAmount = ref('')
const bidNote = ref('')
const submittingBid = ref(false)

const openBidDialog = (lead) => {
  bidTargetLead.value = lead
  bidAmount.value = ''
  bidNote.value = ''
  showBidDialog.value = true
}

const getSpBidCore = () => {
  const profile = userStore.userProfile || {}
  const spName =
    profile.sp_business_name ||
    profile.business_name ||
    profile.display_name ||
    profile.full_name ||
    userStore.user?.displayName ||
    userStore.user?.email ||
    'Service Provider'

  const spContact = {
    email: profile.email || userStore.user?.email || '',
    phone: profile.phone || profile.contact_phone || '',
    contact_name: profile.contact_name || profile.full_name || userStore.user?.displayName || spName,
  }

  return {
    sp_id: String(userStore.userId || ''),
    sp_name: spName,
    sp_contact: spContact,
  }
}

const handleSubmitBid = async () => {
  const leadDocId = bidTargetLead.value?.id || bidTargetLead.value?.lead_doc_id || bidTargetLead.value?.lead_id
  const leadPublicId = bidTargetLead.value?.lead_id || leadDocId
  const amount = Number(bidAmount.value)
  if (!bidTargetLead.value || !leadDocId || !Number.isFinite(amount) || amount <= 0) {
    Notify.create({ type: 'warning', message: 'Please enter a valid bid amount.', position: 'top' })
    return
  }
  submittingBid.value = true
  try {
    const bidId = `bid-${Date.now()}`
    const now = new Date().toISOString()
    const bidPayload = {
      id: bidId,
      bid_id: bidId,
      ...getSpBidCore(),
      lead_id: leadPublicId,
      lead_doc_id: leadDocId,
      mx_id: bidTargetLead.value.mx_id || bidTargetLead.value.task_id || null,
      lead_title: bidTargetLead.value.title,
      title: bidTargetLead.value.title,
      task_id: bidTargetLead.value.task_id || bidTargetLead.value.mx_id || null,
      task_doc_id: bidTargetLead.value.task_doc_id || null,
      amount,
      note: bidNote.value,
      status: 'submitted',
      created_at: now,
      updated_at: now,
    }

    await createDocument(`marketplace_leads/${leadDocId}/bids`, bidPayload, bidId)

    bids.value = [bidPayload, ...bids.value]
    leads.value = leads.value.filter((row) => (row.id || row.lead_doc_id || row.lead_id) !== leadDocId)
    Notify.create({ type: 'positive', message: 'Bid saved to Firebase.', position: 'top' })
    showBidDialog.value = false
  } catch (error) {
    Notify.create({ type: 'negative', message: error.message || 'Failed to submit bid.', position: 'top' })
  } finally {
    submittingBid.value = false
  }
}

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A'
  const d = new Date(dateStr)
  return isNaN(d.getTime()) ? 'N/A' : d.toLocaleDateString()
}

const formatRelativeTime = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return ''
  const now = new Date()
  const diffMs = now - date
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000))
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return '1d ago'
  if (diffDays < 30) return `${diffDays}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// Sort
const feedSortField = ref('time')
const feedSortAsc = ref(false)

const getTs = (dateStr) => {
  if (!dateStr) return 0
  const d = new Date(dateStr)
  return isNaN(d.getTime()) ? 0 : d.getTime()
}

const sortList = (list, dateField) => {
  const sorted = [...list]
  const asc = feedSortAsc.value
  sorted.sort((a, b) => {
    const cmp = getTs(a[dateField]) - getTs(b[dateField])
    return asc ? cmp : -cmp
  })
  return sorted
}

const sortedLeads = computed(() => sortList(leads.value, 'created_at'))
const sortedBids = computed(() => sortList(bids.value, 'created_at'))
const sortedInvoices = computed(() => sortList(invoices.value, 'created_at'))
const sortedProjects = computed(() => sortList(projects.value, 'accepted_at'))
const openProjects = computed(() => projects.value.filter((p) => p.status !== 'completed' && p.status !== 'cancelled'))

const toggleSort = (field) => {
  if (feedSortField.value === field) {
    feedSortAsc.value = !feedSortAsc.value
  } else {
    feedSortField.value = field
    feedSortAsc.value = false
  }
}

const sortIcon = (field) => {
  if (feedSortField.value !== field) return 'unfold_more'
  return feedSortAsc.value ? 'arrow_upward' : 'arrow_downward'
}

// Phase management
const phaseDefinitions = [
  { key: 'plan', label: 'Plan', icon: 'assignment' },
  { key: 'execution', label: 'Execution', icon: 'construction' },
  { key: 'payment', label: 'Payment', icon: 'payments' },
  { key: 'close', label: 'Close (Invoice)', icon: 'task_alt' },
]

const getPhases = (proj) => {
  const phases = proj.phases || {}
  return phaseDefinitions.map((def) => ({
    ...def,
    done: !!phases[def.key]?.done,
    completedAt: phases[def.key]?.completed_at || null,
  }))
}

const togglePhase = async (proj, phaseKey, val) => {
  const phases = { ...(proj.phases || {}) }
  phases[phaseKey] = {
    done: val,
    completed_at: val ? new Date().toISOString() : null,
  }
  proj.phases = phases
  try {
    await spPortalApi.updateProject(proj.project_id, { phases })
  } catch {
    Notify.create({ type: 'negative', message: 'Failed to update phase.', position: 'top' })
  }
}

const getComments = (proj) => proj.comments || []

const commentInputs = ref({})

const addComment = async (proj) => {
  const text = (commentInputs.value[proj.project_id] || '').trim()
  if (!text) return
  const comments = [...(proj.comments || []), { text, created_at: new Date().toISOString(), author: userStore.userId }]
  proj.comments = comments
  commentInputs.value[proj.project_id] = ''
  try {
    await spPortalApi.updateProject(proj.project_id, { comments })
  } catch {
    Notify.create({ type: 'negative', message: 'Failed to save comment.', position: 'top' })
  }
}

// Data loading
const loadDashboard = async () => {
  try {
    const [leadRows, bidRows, projectRows, invoiceRows] = await Promise.all([
      spPortalApi.listLeads(userStore.userId).finally(() => { leadsLoading.value = false }),
      spPortalApi.listBids(userStore.userId).finally(() => { bidsLoading.value = false }),
      spPortalApi.listProjects(userStore.userId).finally(() => { projectsLoading.value = false }),
      spPortalApi.listInvoices(userStore.userId).finally(() => { invoicesLoading.value = false }),
    ])

    leads.value = leadRows || []
    bids.value = bidRows || []
    projects.value = projectRows || []
    invoices.value = invoiceRows || []
  } catch (error) {
    leadsLoading.value = false
    bidsLoading.value = false
    projectsLoading.value = false
    invoicesLoading.value = false
    Notify.create({
      type: 'negative',
      message: error.message || 'Failed to load SP dashboard.',
      position: 'top',
    })
  }
}

onMounted(loadDashboard)
</script>

<style scoped>
.sp-feed-page {
  padding: 10px;
  background: var(--bg-secondary);
  min-height: 100vh;
}

/* Loading */
.data-loading-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 70vh;
  text-align: center;
}

.loading-content {
  max-width: 400px;
}

.loading-steps {
  display: flex;
  flex-direction: column;
  gap: 10px;
  text-align: left;
}

.loading-step {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 8px;
  background: var(--neutral-50, #f8f9fa);
  color: var(--neutral-400);
  transition: all 0.3s ease;
}

.loading-step.active {
  background: #e3f2fd;
  color: var(--primary-color, #1976d2);
  font-weight: 600;
}

.loading-step.completed {
  background: #e8f5e9;
  color: #2e7d32;
}

/* 3-column grid */
.feed-shell {
  max-width: 1580px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr) 280px;
  gap: 12px;
}

.feed-reminders,
.feed-main {
  min-width: 0;
}

/* Stats */
.feed-stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.stat-card-mini {
  border-radius: var(--border-radius-card);
  border: 1px solid var(--neutral-200);
  background: var(--bg-surface);
  transition: all 0.2s ease;
}

.stat-card-mini:hover {
  border-color: var(--neutral-400);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.stat-mini-value {
  font-size: 1rem;
  font-weight: 700;
  color: var(--neutral-900);
  margin-top: 4px;
}

.stat-mini-label {
  font-size: 0.7rem;
  color: var(--neutral-600);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Rail cards */
.rail-card {
  border-radius: var(--border-radius-card);
  border: 1px solid var(--neutral-200);
  background: var(--bg-surface);
}

.feed-reminders .rail-card {
  box-shadow: none !important;
}

.rail-title {
  font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--neutral-800);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.view-all-btn {
  font-size: 0.68rem !important;
  padding: 0 6px !important;
  min-height: 22px !important;
}

/* Project cards in left rail */
.rail-empty {
  text-align: center;
  padding: 16px 0;
}
.rail-empty-text {
  font-size: 0.78rem;
  color: var(--neutral-500);
  margin-top: 6px;
}

.project-rail-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.project-rail-item {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 6px;
  padding: 6px 4px;
  border-radius: 6px;
  transition: background 0.15s;
}
.project-rail-clickable {
  cursor: pointer;
}
.project-rail-item:hover {
  background: var(--neutral-50, #f8f9fa);
}

.project-rail-left {
  flex: 1;
  min-width: 0;
}

.project-rail-title {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--neutral-900);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.project-rail-meta {
  font-size: 0.7rem;
  color: var(--neutral-500);
  display: flex;
  align-items: center;
  margin-top: 2px;
}

.project-rail-status {
  flex-shrink: 0;
}

/* Detail actions */
.detail-actions {
  margin-top: 10px;
  display: flex;
  gap: 8px;
}

/* Quick actions */
.create-new-card {
  border-radius: var(--border-radius-card);
  border: 1px solid var(--neutral-200);
  background: var(--bg-surface);
}

.create-new-section {
  padding: 12px 16px !important;
}

.create-new-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
}

.create-new-actions > .q-btn {
  font-size: 0.8rem;
  color: var(--neutral-700) !important;
  border: none !important;
  background: transparent !important;
}

.create-new-actions > .q-btn:hover {
  background: var(--neutral-100) !important;
  color: var(--primary-color) !important;
}

.feed-sort-group {
  display: flex;
  align-items: center;
  gap: 2px;
  margin-left: auto;
}

.feed-sort-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--neutral-400);
  margin-right: 2px;
}

.feed-sort-btn {
  font-size: 0.75rem;
  padding: 2px 6px;
  min-height: 26px;
}

/* Feed list */
.feed-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.feed-context,
.feed-post,
.rail-card {
  border-radius: var(--border-radius-card);
  border: 1px solid var(--neutral-200);
  background: var(--bg-surface);
}

.feed-post-clickable {
  cursor: pointer;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.feed-post-clickable:hover {
  border-color: var(--neutral-400);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.feed-post-section {
  padding: 10px 14px !important;
}

.feed-card-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.feed-card-avatar {
  flex-shrink: 0;
  margin-top: 2px;
}

.feed-card-content {
  flex: 1;
  min-width: 0;
}

.feed-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
}

.post-title {
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--neutral-900);
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.post-time {
  font-size: 0.7rem;
  color: var(--neutral-500);
  white-space: nowrap;
  flex-shrink: 0;
}

.post-body {
  font-size: 0.8rem;
  color: var(--neutral-700);
  line-height: 1.4;
  margin-top: 2px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.feed-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 6px;
}

.post-property {
  font-size: 0.72rem;
  color: var(--neutral-500);
  display: flex;
  align-items: center;
  white-space: nowrap;
}

.post-amount {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--primary-color);
}

/* Ad placeholder */
.ad-placeholder {
  min-height: 120px;
  border-radius: 10px;
  border: 1px dashed var(--neutral-300);
  background: var(--bg-secondary);
  color: var(--neutral-500);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.82rem;
}

/* Expand icon */
.feed-expand-icon {
  flex-shrink: 0;
  margin-left: 4px;
  align-self: center;
}

.feed-post-expanded {
  border-left: 3px solid var(--q-primary);
}

.feed-detail-panel {
  overflow: hidden;
}

.feed-detail-body {
  padding: 10px 14px 12px;
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px 16px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.detail-label {
  font-size: 0.68rem;
  color: var(--neutral-500);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  font-weight: 600;
}

.detail-value {
  font-size: 0.82rem;
  color: var(--text-primary);
}

.detail-description {
  margin-top: 10px;
}
.detail-description p {
  margin: 4px 0 0;
  font-size: 0.8rem;
  color: var(--text-secondary);
  line-height: 1.45;
}

/* Phase checklist */
.phase-checklist {
  border: 1px solid var(--neutral-200);
  border-radius: 8px;
  padding: 8px 10px;
  background: var(--neutral-50, #f8f9fa);
}

.phase-row {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 0;
  border-bottom: 1px solid var(--neutral-100);
}
.phase-row:last-child {
  border-bottom: none;
}
.phase-done {
  opacity: 0.7;
}
.phase-done .phase-name {
  text-decoration: line-through;
}

.phase-info {
  flex: 1;
  min-width: 0;
}

.phase-name {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--text-primary);
}

.phase-date {
  font-size: 0.68rem;
  color: var(--neutral-500);
}

/* Comments */
.phase-comments {
  border: 1px solid var(--neutral-200);
  border-radius: 8px;
  padding: 8px 10px;
  background: var(--neutral-50, #f8f9fa);
}

.comment-list {
  max-height: 160px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.comment-item {
  padding: 4px 8px;
  border-radius: 6px;
  background: var(--bg-surface);
  border: 1px solid var(--neutral-100);
}

.comment-text {
  font-size: 0.8rem;
  color: var(--text-primary);
  line-height: 1.4;
}

.comment-meta {
  font-size: 0.66rem;
  color: var(--neutral-500);
  margin-top: 2px;
}

.comment-empty {
  font-size: 0.78rem;
  color: var(--neutral-400);
  padding: 4px 0;
}

.comment-input-row {
  display: flex;
  align-items: center;
  gap: 4px;
}
.comment-input {
  flex: 1;
}

/* Responsive */
@media (max-width: 1440px) {
  .feed-shell {
    grid-template-columns: 240px minmax(0, 1fr) 260px;
  }
}

@media (max-width: 1280px) {
  .feed-shell {
    grid-template-columns: 260px minmax(0, 1fr);
  }
  .feed-rail {
    grid-column: 1 / -1;
  }
  .feed-stats-row {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .feed-shell {
    grid-template-columns: 1fr;
  }
  .feed-reminders,
  .feed-rail {
    grid-column: auto;
  }
  .feed-list {
    gap: 8px;
  }
  .create-new-actions {
    gap: 2px;
  }
  .feed-stats-row {
    grid-template-columns: 1fr;
  }
}

/* Dark mode */
:global(body.body--dark) .sp-feed-page {
  background: #121212 !important;
}

:global(body.body--dark) .data-loading-page {
  background: rgba(18, 18, 18, 0.95) !important;
}

:global(body.body--dark) .stat-card-mini,
:global(body.body--dark) .rail-card,
:global(body.body--dark) .feed-post,
:global(body.body--dark) .create-new-card {
  background: var(--bg-surface) !important;
  border-color: var(--border-color) !important;
}

:global(body.body--dark) .project-rail-item:hover {
  background: rgba(255, 255, 255, 0.05) !important;
}

:global(body.body--dark) .phase-checklist,
:global(body.body--dark) .phase-comments {
  background: rgba(255, 255, 255, 0.04) !important;
  border-color: var(--border-color) !important;
}

:global(body.body--dark) .comment-item {
  background: rgba(255, 255, 255, 0.06) !important;
  border-color: var(--border-color) !important;
}

:global(body.body--dark) .post-title,
:global(body.body--dark) .project-rail-title,
:global(body.body--dark) .rail-title,
:global(body.body--dark) .stat-mini-value {
  color: white !important;
}
</style>
