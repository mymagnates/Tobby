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

    <!-- 2-column Feed Layout -->
    <div v-else class="feed-shell">
      <!-- Right Rail: Stats / Tobby -->
      <aside class="feed-reminders" :class="{ 'feed-reminders--assistant': assistantRailOpen }">
        <div v-if="!assistantRailOpen" class="sp-stats-rail">
          <q-card class="stat-card-mini stat-card-rail">
            <q-card-section class="q-pa-sm">
              <q-icon name="campaign" size="20px" color="primary" />
              <div class="stat-mini-value">{{ newLeadCount }}</div>
              <div class="stat-mini-label">New Leads</div>
            </q-card-section>
          </q-card>
          <q-card class="stat-card-mini stat-card-rail">
            <q-card-section class="q-pa-sm">
              <q-icon name="gavel" size="20px" color="positive" />
              <div class="stat-mini-value">{{ totalBids }}</div>
              <div class="stat-mini-label">Bids</div>
            </q-card-section>
          </q-card>
          <q-card class="stat-card-mini stat-card-rail">
            <q-card-section class="q-pa-sm">
              <q-icon name="engineering" size="20px" color="warning" />
              <div class="stat-mini-value">{{ totalProjects }}</div>
              <div class="stat-mini-label">Projects</div>
            </q-card-section>
          </q-card>
          <q-card class="stat-card-mini stat-card-rail">
            <q-card-section class="q-pa-sm">
              <q-icon name="trending_up" size="20px" color="info" />
              <div class="stat-mini-value">{{ bidSuccessRate }}%</div>
              <div class="stat-mini-label">Win Rate</div>
            </q-card-section>
          </q-card>
          <q-card class="stat-card-mini stat-card-rail talk-card">
            <q-card-section class="q-pa-sm">
              <div class="text-subtitle2 text-weight-medium q-mb-xs">Talk to Tobby</div>
              <div class="text-caption text-grey-7 q-mb-sm">
                Open the assistant without leaving the SP workspace.
              </div>
              <q-btn unelevated color="primary" no-caps icon="chat" label="Talk to Tobby" @click="openAssistant" />
            </q-card-section>
          </q-card>
        </div>
        <q-card v-else class="sp-assistant-card">
          <q-card-section class="sp-assistant-header">
            <div>
              <div class="sp-assistant-title">
                <q-icon name="smart_toy" size="18px" class="q-mr-xs" />
                Tobby
              </div>
              <div class="sp-assistant-subtitle">SP workspace assistant</div>
            </div>
            <q-btn flat round dense icon="close" size="sm" @click="assistantRailOpen = false" />
          </q-card-section>
          <q-separator />
          <q-card-section class="sp-assistant-body">
            <div class="sp-assistant-messages">
              <div
                v-for="message in assistantMessages"
                :key="message.id"
                class="sp-assistant-message"
                :class="`sp-assistant-message--${message.role}`"
              >
                {{ message.text }}
              </div>
            </div>
            <q-input
              v-model="assistantInput"
              type="textarea"
              outlined
              autogrow
              dense
              label="Ask Tobby"
              :disable="assistantLoading"
              class="sp-assistant-input"
              @keyup.enter.exact.prevent="sendAssistantMessage"
            />
            <div class="sp-assistant-actions">
              <q-btn unelevated color="primary" label="Send" :loading="assistantLoading" @click="sendAssistantMessage" />
              <q-btn flat label="Clear" @click="resetAssistant" />
            </div>
            <div v-if="assistantError" class="text-negative text-caption">{{ assistantError }}</div>
          </q-card-section>
        </q-card>
      </aside>

      <!-- Main Feed -->
      <div class="feed-main">
        <!-- Quick Actions -->
        <q-card class="create-new-card q-mb-md">
          <q-card-section class="create-new-section">
            <div class="create-new-actions">
              <q-btn flat dense no-caps icon="campaign" label="Leads" :color="feedView === 'leads' ? 'primary' : 'grey-7'" @click="setFeedView('leads')" />
              <q-btn flat dense no-caps icon="gavel" label="Bids" :color="feedView === 'bids' ? 'primary' : 'grey-7'" @click="setFeedView('bids')" />
              <q-btn flat dense no-caps icon="engineering" label="Projects" :color="feedView === 'projects' ? 'primary' : 'grey-7'" @click="setFeedView('projects')" />
              <q-btn flat dense no-caps icon="article" label="Posts" :color="feedView === 'posts' ? 'primary' : 'grey-7'" @click="setFeedView('posts')" />
              <q-btn flat dense no-caps icon="receipt_long" label="Invoices" :color="feedView === 'invoices' ? 'primary' : 'grey-7'" @click="setFeedView('invoices')" />
              <q-btn flat dense no-caps icon="handyman" label="Services" color="grey-7" @click="goToServices" />
              <q-btn flat dense no-caps icon="token" label="Credits" color="grey-7" @click="goToCredits" />
              <q-btn flat dense no-caps icon="dashboard_customize" label="Build Handout" color="grey-7" @click="goToBuildHandout" />
              <q-btn flat dense no-caps icon="edit" label="Edit Profile" color="grey-7" @click="goToEditProfile" />
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
                      <div v-if="getLeadCityStateZip(lead) !== 'N/A'" class="post-property">
                        <q-icon name="location_on" size="12px" class="q-mr-xs" />{{ getLeadCityStateZip(lead) }}
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
                        <span class="detail-value">{{ getLeadCityStateZip(lead) }}</span>
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
                      <q-chip dense size="xs" :color="bid.status === 'accepted' ? 'green' : bid.status === 'rejected' ? 'red' : bid.status === 'expired' ? 'orange' : 'amber'" text-color="white">{{ bid.status === 'accepted' ? 'Accepted' : bid.status || 'pending' }}</q-chip>
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
                        <q-chip dense size="sm" :color="bid.status === 'accepted' ? 'green' : bid.status === 'rejected' ? 'red' : bid.status === 'expired' ? 'orange' : 'amber'" text-color="white">{{ bid.status || 'pending' }}</q-chip>
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

          <!-- Posts view -->
          <template v-else-if="feedView === 'posts'">
            <div class="posts-view-actions q-mb-sm">
              <q-btn
                unelevated
                dense
                no-caps
                color="primary"
                icon="add"
                label="Create Post"
                @click="goToCreatePost"
              />
              <q-btn
                flat
                dense
                no-caps
                color="primary"
                icon="open_in_new"
                label="Open Handout Page"
                @click="goToPostsPage"
              />
              <q-btn
                flat
                dense
                no-caps
                color="primary"
                icon="dashboard_customize"
                label="Build Handout"
                @click="goToBuildHandout"
              />
            </div>

            <q-card v-if="!sortedPosts.length" class="feed-post feed-empty-card q-mb-sm">
              <q-card-section class="q-pa-md">
                <div class="post-title q-mb-xs">No Posts Yet</div>
                <div class="post-body">Publish posts from this dashboard to build your Handout page.</div>
              </q-card-section>
            </q-card>

            <q-card
              v-for="post in sortedPosts"
              :key="post.id"
              class="feed-post feed-mini-card"
              :class="{ 'feed-post-expanded': expandedFeedId === `post-${post.id}` }"
            >
              <q-card-section class="feed-post-section feed-post-clickable" @click="toggleFeedExpand(`post-${post.id}`)">
                <div class="feed-card-row">
                  <q-avatar size="32px" color="indigo-2" text-color="white" class="feed-card-avatar">
                    <q-icon name="article" size="16px" />
                  </q-avatar>
                  <div class="feed-card-content">
                    <div class="feed-card-header">
                      <div class="post-title">{{ post.title || 'Post' }}</div>
                      <div class="post-time">{{ formatRelativeTime(post.created_at || post.updated_at) }}</div>
                    </div>
                    <div class="post-body">{{ post.content || 'Media post' }}</div>
                    <div class="feed-card-footer">
                      <q-chip
                        dense
                        size="xs"
                        :color="post.media_type === 'video' ? 'deep-purple' : post.media_type === 'image' ? 'blue' : 'grey'"
                        text-color="white"
                      >
                        {{ post.media_type || 'text' }}
                      </q-chip>
                      <span></span>
                    </div>
                  </div>
                  <q-icon :name="expandedFeedId === `post-${post.id}` ? 'expand_less' : 'expand_more'" size="18px" color="grey-5" class="feed-expand-icon" />
                </div>
              </q-card-section>
              <q-slide-transition>
                <div v-show="expandedFeedId === `post-${post.id}`" class="feed-detail-panel">
                  <q-separator />
                  <div class="feed-detail-body">
                    <div v-if="post.content" class="detail-description">
                      <span class="detail-label">Content</span>
                      <p>{{ post.content }}</p>
                    </div>
                    <div v-if="post.media_url" class="q-mt-sm">
                      <q-img v-if="post.media_type === 'image'" :src="post.media_url" class="feed-post-media" fit="cover" />
                      <video v-else-if="post.media_type === 'video'" controls class="feed-post-video">
                        <source :src="post.media_url" />
                      </video>
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

    </div>

    <SpBidDialog
      v-model="showBidDialog"
      :lead="bidTargetLead"
      @submitted="handleBidSubmitted"
    />

    <q-dialog v-model="showCreatePostDialog">
      <q-card style="min-width: 420px; max-width: 520px;">
        <q-card-section class="row items-center justify-between q-pb-none">
          <div class="text-subtitle1 text-weight-bold">Create Post</div>
          <q-btn icon="close" flat round dense @click="closeCreatePostDialog" />
        </q-card-section>
        <q-separator class="q-mt-sm" />
        <q-card-section>
          <q-input v-model="createPostForm.title" outlined dense label="Title (optional)" class="q-mb-sm" />
          <q-input
            v-model="createPostForm.content"
            outlined
            dense
            type="textarea"
            autogrow
            label="Post content"
            class="q-mb-sm"
          />
          <q-input
            v-model="createPostForm.tags"
            outlined
            dense
            label="Tags (comma separated)"
            class="q-mb-sm"
          />
          <q-file
            v-model="createPostMediaFile"
            outlined
            dense
            clearable
            accept="image/*,video/*"
            label="Attach photo or video (optional)"
          />
        </q-card-section>
        <q-card-actions align="right" class="q-px-md q-pb-md">
          <q-btn flat label="Cancel" @click="closeCreatePostDialog" />
          <q-btn
            color="primary"
            label="Publish"
            :loading="savingCreatePost"
            @click="handleCreatePost"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Notify } from 'quasar'
import { useUserDataStore } from 'src/stores/userDataStore'
import { agentApi, spPortalApi } from 'src/services/webApiClient'
import { useFirebase } from 'src/composables/useFirebase'
import { resolveSpSlug } from 'src/utils/spPosts'
import SpBidDialog from 'src/components/SpBidDialog.vue'

const userStore = useUserDataStore()
const router = useRouter()
const { getCollectionData, createDocument, uploadFile } = useFirebase()

const leads = ref([])
const bids = ref([])
const projects = ref([])
const invoices = ref([])
const posts = ref([])

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
const successfulBidCount = computed(() => bids.value.filter((r) => r.status === 'accepted').length)
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

const goToCredits = () => {
  router.push('/sp-credits')
}

const goToBuildHandout = () => {
  router.push('/sp-handout-builder')
}

const goToEditProfile = () => {
  router.push('/sp-profile')
}

const goToShowcase = () => {
  const slug = resolveSpSlug(userStore.userProfile || {}, userStore.userId || userStore.user?.uid || '')
  if (!slug) return
  window.open(`/public/handout/${slug}`, '_blank', 'noopener,noreferrer')
}

const goToPostsPage = () => {
  goToShowcase()
}

const assistantRailOpen = ref(false)
const assistantInput = ref('')
const assistantLoading = ref(false)
const assistantError = ref('')
const createAssistantMessage = (payload) => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
  ...payload,
})
const assistantMessages = ref([
  createAssistantMessage({
    role: 'assistant',
    text: 'Tell me what you need for leads, bids, projects, credits, or Handout content.',
  }),
])

const openAssistant = () => {
  assistantRailOpen.value = true
}

const resetAssistant = () => {
  assistantInput.value = ''
  assistantError.value = ''
  assistantMessages.value = [
    createAssistantMessage({
      role: 'assistant',
      text: 'Tell me what you need for leads, bids, projects, credits, or Handout content.',
    }),
  ]
}

const getAssistantResponseText = (response) => {
  if (response?.message) return response.message
  if (response?.draft) {
    const draft = response.draft
    const title = draft.title || draft.name || draft.subject || 'Draft prepared'
    const body = draft.description || draft.content || draft.summary || ''
    return body ? `${title}: ${body}` : title
  }
  return 'I reviewed the request, but no response was returned.'
}

const sendAssistantMessage = async () => {
  const text = String(assistantInput.value || '').trim()
  if (!text) {
    assistantError.value = 'Enter a message for Tobby.'
    return
  }
  assistantError.value = ''
  assistantLoading.value = true
  assistantMessages.value.push(createAssistantMessage({ role: 'user', text }))
  assistantInput.value = ''
  try {
    const response = await agentApi.intake({
      raw_text: text,
      context: {
        workspace: 'sp_dashboard',
        sp_id: String(userStore.userId || userStore.user?.uid || ''),
        feed_view: feedView.value,
        open_leads: newLeadCount.value,
        submitted_bids: totalBids.value,
        active_projects: totalProjects.value,
      },
    })
    assistantMessages.value.push(createAssistantMessage({
      role: 'assistant',
      text: getAssistantResponseText(response),
    }))
  } catch (error) {
    assistantError.value = error?.message || 'Failed to reach Tobby.'
    assistantMessages.value.push(createAssistantMessage({
      role: 'assistant',
      text: assistantError.value,
    }))
  } finally {
    assistantLoading.value = false
  }
}

const goToCreatePost = () => {
  openCreatePostDialog()
}

// Expanded feed item
const expandedFeedId = ref(null)
const toggleFeedExpand = (id) => {
  expandedFeedId.value = expandedFeedId.value === id ? null : id
}

// Bid dialog
const showBidDialog = ref(false)
const bidTargetLead = ref(null)
const showCreatePostDialog = ref(false)
const savingCreatePost = ref(false)
const createPostMediaFile = ref(null)
const createPostForm = reactive({
  title: '',
  content: '',
  tags: '',
})

const openBidDialog = (lead) => {
  bidTargetLead.value = lead
  showBidDialog.value = true
}

const toTags = (input) => {
  return String(input || '')
    .split(',')
    .map((row) => row.trim())
    .filter(Boolean)
}

const openCreatePostDialog = () => {
  createPostForm.title = ''
  createPostForm.content = ''
  createPostForm.tags = ''
  createPostMediaFile.value = null
  showCreatePostDialog.value = true
}

const closeCreatePostDialog = () => {
  showCreatePostDialog.value = false
  createPostMediaFile.value = null
}

const uploadCreatePostMedia = async (spId) => {
  const file = createPostMediaFile.value
  if (!file) {
    return {
      media_url: '',
      media_type: '',
      media_name: '',
    }
  }
  const safeName = String(file.name || 'media').replace(/[^a-zA-Z0-9_.-]/g, '-')
  const path = `media/posts/${spId}/${Date.now()}-${safeName}`
  const mediaUrl = await uploadFile(path, file)
  return {
    media_url: mediaUrl,
    media_type: String(file.type || '').startsWith('video/') ? 'video' : 'image',
    media_name: file.name || '',
  }
}

const handleCreatePost = async () => {
  const spId = String(userStore.userId || userStore.user?.uid || '').trim()
  if (!spId) return

  const hasText = Boolean(String(createPostForm.content || '').trim())
  const hasMedia = Boolean(createPostMediaFile.value)
  if (!hasText && !hasMedia) {
    Notify.create({
      type: 'warning',
      message: 'Add content or media before publishing.',
      position: 'top',
    })
    return
  }

  try {
    savingCreatePost.value = true
    const mediaPayload = await uploadCreatePostMedia(spId)
    const now = new Date().toISOString()
    const payload = {
      title: String(createPostForm.title || '').trim(),
      content: String(createPostForm.content || '').trim(),
      tags: toTags(createPostForm.tags),
      likes_count: 0,
      ...mediaPayload,
      created_at: now,
      updated_at: now,
    }

    const postId = await createDocument(`users/${spId}/posts`, payload)
    posts.value = [{ id: postId, ...payload }, ...posts.value]
    closeCreatePostDialog()
    feedView.value = 'posts'
    Notify.create({ type: 'positive', message: 'Post published.', position: 'top' })
  } catch (error) {
    Notify.create({
      type: 'negative',
      message: error.message || 'Failed to publish post.',
      position: 'top',
    })
  } finally {
    savingCreatePost.value = false
  }
}

const getLeadCityStateZip = (lead) => {
  if (!lead) return 'N/A'
  const city = String(lead.property_city || lead.city || '').trim()
  const state = String(lead.property_state || lead.state || '').trim()
  const zip = String(
    lead.property_zip ||
      lead.zip ||
      lead.zip_code ||
      lead.postal_code ||
      '',
  ).trim()
  const parts = [city, state].filter(Boolean)
  const head = parts.join(', ')
  if (zip) return head ? `${head} ${zip}` : zip
  return head || 'N/A'
}

const handleBidSubmitted = (res) => {
  const leadDocId = bidTargetLead.value?.id || bidTargetLead.value?.lead_doc_id || bidTargetLead.value?.lead_id
  const bidRow = res?.bid || res
  bids.value = [bidRow, ...bids.value]
  leads.value = leads.value.filter((row) => (row.id || row.lead_doc_id || row.lead_id) !== leadDocId)
  const remaining = res?.credits_balance
  Notify.create({
    type: 'positive',
    message: remaining === undefined ? 'Bid submitted.' : `Bid submitted. Credits left: ${remaining}`,
    position: 'top',
  })
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
const sortedPosts = computed(() => sortList(posts.value, 'created_at'))

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
    const [leadRows, bidRows, projectRows, invoiceRows, postRows] = await Promise.all([
      spPortalApi.listLeads(userStore.userId).finally(() => { leadsLoading.value = false }),
      spPortalApi.listBids(userStore.userId).finally(() => { bidsLoading.value = false }),
      spPortalApi.listProjects(userStore.userId).finally(() => { projectsLoading.value = false }),
      spPortalApi.listInvoices(userStore.userId).finally(() => { invoicesLoading.value = false }),
      getCollectionData(`users/${String(userStore.userId || '')}/posts`).catch(() => []),
    ])

    leads.value = leadRows || []
    bids.value = bidRows || []
    projects.value = projectRows || []
    invoices.value = invoiceRows || []
    posts.value = postRows || []
    if (!posts.value.length) {
      const legacyRows = await getCollectionData(`users/${String(userStore.userId || '')}/showcase_posts`).catch(() => [])
      posts.value = legacyRows || []
    }
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

/* 2-column grid */
.feed-shell {
  max-width: 1580px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 280px;
  gap: 12px;
}

.feed-reminders,
.feed-main {
  min-width: 0;
}

.feed-reminders {
  grid-column: 2;
  grid-row: 1;
}

.feed-main {
  grid-column: 1;
  grid-row: 1;
}

/* Stats */
.sp-stats-rail {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.stat-card-mini {
  border-radius: var(--border-radius-card);
  border: 1px solid var(--neutral-200);
  background: var(--bg-surface);
  transition: all 0.2s ease;
}

.stat-card-rail {
  width: 100%;
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

.feed-reminders--assistant {
  align-self: stretch;
}

.sp-assistant-card {
  height: calc(100vh - 112px);
  min-height: 620px;
  border-radius: var(--border-radius-card);
  border: 1px solid var(--neutral-200);
  background: var(--bg-surface);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sp-assistant-header {
  padding: 12px 14px !important;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
}

.sp-assistant-title {
  display: flex;
  align-items: center;
  font-size: 0.95rem;
  font-weight: 800;
  color: var(--text-primary);
}

.sp-assistant-subtitle {
  margin-top: 2px;
  font-size: 0.72rem;
  color: var(--neutral-500);
}

.sp-assistant-body {
  flex: 1;
  min-height: 0;
  padding: 12px !important;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.sp-assistant-messages {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-right: 2px;
}

.sp-assistant-message {
  max-width: 92%;
  border-radius: 12px;
  padding: 8px 10px;
  font-size: 0.78rem;
  line-height: 1.45;
  word-break: break-word;
}

.sp-assistant-message--assistant {
  align-self: flex-start;
  background: var(--neutral-100, #f1f5f9);
  color: var(--text-primary);
}

.sp-assistant-message--user {
  align-self: flex-end;
  background: var(--q-primary);
  color: white;
}

.sp-assistant-input {
  flex-shrink: 0;
}

.sp-assistant-actions {
  display: flex;
  align-items: center;
  gap: 8px;
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

.posts-view-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
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

.feed-post-media {
  width: 100%;
  max-width: 480px;
  border-radius: 8px;
}

.feed-post-video {
  width: 100%;
  max-width: 480px;
  border-radius: 8px;
  background: #0f172a;
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
    grid-template-columns: minmax(0, 1fr) 240px;
  }
}

@media (max-width: 1280px) {
  .feed-shell {
    grid-template-columns: minmax(0, 1fr) 220px;
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
  .feed-main {
    grid-column: auto;
    grid-row: auto;
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
:global(body.body--dark) .sp-assistant-card,
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
:global(body.body--dark) .sp-assistant-title,
:global(body.body--dark) .stat-mini-value {
  color: white !important;
}
</style>
