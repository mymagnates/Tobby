<template>
  <q-page class="pm-po-feed-page q-pa-sm">
    <!-- Loading State -->
    <div v-if="!dataLoaded && isIndexHome" class="data-loading-page">
      <div class="loading-content">
        <q-spinner size="4em" color="primary" />
        <div class="text-h4 q-mt-md">Loading Dashboard</div>
        <div class="text-h6 q-mt-sm text-grey-6">Please wait while we load your data...</div>
        <div class="loading-steps q-mt-lg">
          <div
            class="loading-step"
            :class="{ active: loadingStep >= 1, completed: loadingStep > 1 }"
          >
            <q-icon name="person" size="20px" />
            <span>Loading User Profile</span>
          </div>
          <div
            class="loading-step"
            :class="{ active: loadingStep >= 2, completed: loadingStep > 2 }"
          >
            <q-icon name="home" size="20px" />
            <span>Loading Properties</span>
          </div>
          <div
            class="loading-step"
            :class="{ active: loadingStep >= 3, completed: loadingStep > 3 }"
          >
            <q-icon name="receipt" size="20px" />
            <span>Loading Transactions</span>
          </div>
          <div
            class="loading-step"
            :class="{ active: loadingStep >= 4, completed: loadingStep > 4 }"
          >
            <q-icon name="build" size="20px" />
            <span>Loading Tasks</span>
          </div>
          <div
            class="loading-step"
            :class="{ active: loadingStep >= 5, completed: loadingStep > 5 }"
          >
            <q-icon name="assignment" size="20px" />
            <span>Loading Leases</span>
          </div>
          <div class="loading-step" :class="{ active: loadingStep >= 6, completed: dataLoaded }">
            <q-icon name="dashboard" size="20px" />
            <span>Preparing Feed</span>
          </div>
        </div>
      </div>
    </div>

    <!-- PM/PO Feed Layout: outer layout provides the property and status rails. -->
    <div v-else class="feed-shell feed-shell--no-reminders">
      <Teleport v-if="isIndexHome" to="#index-reminders-slot">
        <aside class="feed-reminders">
        <button class="mobile-column-toggle" type="button" @click="toggleMobileColumn('reminders')">
          <span>Reminders</span>
          <span class="mobile-column-count">{{ filteredReminderItems.length }}</span>
          <q-icon :name="mobileColumnOpenIcon('reminders')" size="18px" />
        </button>
        <div class="mobile-collapsible-column" :class="{ 'is-collapsed': isMobileColumnCollapsed('reminders') }">
          <q-card class="rail-card">
            <q-card-section class="q-pa-sm">
              <div class="reminder-section-header">
                <div class="rail-title">Reminders</div>
                <q-btn
                  flat
                  dense
                  no-caps
                  size="xs"
                  color="primary"
                  label="View All"
                  class="reminder-view-all-btn"
                  @click="$router.push('/reminders')"
                />
              </div>
              <q-card
                v-if="!filteredReminderItems.length"
                flat
                bordered
                class="reminder-card feed-empty-card q-mb-sm"
              >
                <q-card-section class="q-pa-sm">
                  <div class="reminder-title q-mb-xs">No Reminders Yet</div>
                  <div class="reminder-brief">
                    Reminder cards will appear here when due, updated, or created.
                  </div>
                </q-card-section>
              </q-card>
              <div v-else class="reminder-list">
                <q-card
                  v-for="item in filteredReminderItems"
                  :key="item.id"
                  flat
                  bordered
                  class="reminder-card reminder-card-compact q-mb-xs"
                  :class="{ 'reminder-overdue': item.daysDue !== null && item.daysDue < 0 }"
                  clickable
                  @click="openReminderDetail(item)"
                >
                  <q-card-section class="reminder-compact-section">
                    <div class="reminder-compact-row">
                      <div class="reminder-compact-left">
                        <div class="reminder-title">{{ item.title }}</div>
                        <div class="reminder-property-name">
                          <q-icon name="home" size="12px" class="q-mr-xs" />{{ item.propertyName }}
                        </div>
                      </div>
                      <div
                        v-if="item.dueLabel"
                        class="reminder-due-badge"
                        :class="{
                          'due-overdue': item.daysDue < 0,
                          'due-today': item.daysDue === 0,
                          'due-soon': item.daysDue > 0,
                        }"
                      >
                        {{ item.dueLabel }}
                      </div>
                    </div>
                  </q-card-section>
                </q-card>
              </div>
            </q-card-section>
          </q-card>
        </div>
        </aside>
      </Teleport>

      <div class="feed-main">
        <button
          v-if="isIndexHome"
          class="mobile-column-toggle"
          type="button"
          @click="toggleMobileColumn('feed')"
        >
          <span>Activity Feed</span>
          <span class="mobile-column-count">{{ visibleFeedItems.length }}</span>
          <q-icon :name="mobileColumnOpenIcon('feed')" size="18px" />
        </button>
        <div
          v-if="isIndexHome"
          class="mobile-collapsible-column"
          :class="{ 'is-collapsed': isMobileColumnCollapsed('feed') }"
        >
          <!-- Create + Sort Banner -->
          <q-card class="create-new-card q-mb-md">
            <q-card-section class="create-new-section">
              <div class="create-new-actions">
                <q-btn
                  unelevated
                  dense
                  no-caps
                  color="primary"
                  icon="receipt_long"
                  label="+Transaction"
                  class="create-inline-btn"
                  @click="openCreateTransactionDialog"
                />
                <q-btn
                  unelevated
                  dense
                  no-caps
                  color="primary"
                  icon="dns"
                  label="+Task"
                  class="create-inline-btn"
                  @click="openCreateTaskDialog"
                />
                <q-btn
                  unelevated
                  dense
                  no-caps
                  color="primary"
                  icon="inventory_2"
                  label="+Asset"
                  class="create-inline-btn"
                  @click="openCreateAssetDialog"
                />
                <q-btn
                  unelevated
                  dense
                  no-caps
                  color="primary"
                  icon="description"
                  label="+Document"
                  class="create-inline-btn"
                  @click="openCreateDocumentDialog"
                />
                <div class="feed-controls-right">
                  <div class="feed-sort-group">
                    <span class="feed-sort-label"></span>
                    <q-btn-dropdown
                      flat
                      dense
                      no-caps
                      :label="currentSortLabel"
                      :icon-right="currentSortIcon"
                      color="primary"
                      class="feed-sort-btn feed-sort-dropdown"
                      dropdown-icon="expand_more"
                      no-icon-animation
                    >
                      <q-list dense class="feed-sort-menu">
                        <q-item clickable v-close-popup @click="toggleSort('time')">
                          <q-item-section>Time</q-item-section>
                          <q-item-section side>
                            <q-icon :name="sortIcon('time')" :color="feedSortField === 'time' ? 'primary' : 'grey-5'" />
                          </q-item-section>
                        </q-item>
                        <q-item clickable v-close-popup @click="toggleSort('type')">
                          <q-item-section>Type</q-item-section>
                          <q-item-section side>
                            <q-icon :name="sortIcon('type')" :color="feedSortField === 'type' ? 'primary' : 'grey-5'" />
                          </q-item-section>
                        </q-item>
                        <q-item clickable v-close-popup @click="toggleSort('property')">
                          <q-item-section>Property</q-item-section>
                          <q-item-section side>
                            <q-icon :name="sortIcon('property')" :color="feedSortField === 'property' ? 'primary' : 'grey-5'" />
                          </q-item-section>
                        </q-item>
                      </q-list>
                    </q-btn-dropdown>
                  </div>
                  <div class="feed-view-group">
                    <q-btn-dropdown
                      flat
                      dense
                      no-caps
                      :label="currentViewLabel"
                      :icon="currentViewIcon"
                      color="primary"
                      class="feed-sort-btn feed-view-btn"
                      dropdown-icon="expand_more"
                      no-icon-animation
                    >
                      <q-list dense class="feed-sort-menu">
                        <q-item clickable v-close-popup @click="feedViewMode = 'list'">
                          <q-item-section avatar>
                            <q-icon name="view_agenda" :color="feedViewMode === 'list' ? 'primary' : 'grey-5'" />
                          </q-item-section>
                          <q-item-section>List</q-item-section>
                        </q-item>
                        <q-item clickable v-close-popup @click="feedViewMode = 'tile'">
                          <q-item-section avatar>
                            <q-icon name="grid_view" :color="feedViewMode === 'tile' ? 'primary' : 'grey-5'" />
                          </q-item-section>
                          <q-item-section>Tile</q-item-section>
                        </q-item>
                      </q-list>
                    </q-btn-dropdown>
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>

          <!-- Feed -->
          <div v-if="feedViewMode === 'list'" class="feed-list">
            <q-card v-if="isMainFeedEmpty" class="feed-post feed-empty-card q-mb-sm">
              <q-card-section class="q-pa-md">
                <div class="post-title q-mb-xs">No Events Yet</div>
                <div class="post-body">
                  This area shows timeline updates from tasks, leases, transactions, and reminders.
                  Create or update records to populate this feed stream.
                </div>
              </q-card-section>
            </q-card>

            <q-card
              v-for="post in visibleFeedItems"
              :key="post.eventId || post.id"
              class="feed-post feed-post-clickable feed-mini-card"
              clickable
              @click="openFeedPreview(post)"
            >
              <q-card-section class="feed-post-section">
                <div class="feed-card-row">
                  <q-avatar
                    size="32px"
                    :color="post.avatarColor"
                    text-color="white"
                    class="feed-card-avatar"
                  >
                    <q-icon :name="post.avatarIcon" size="16px" />
                  </q-avatar>
                  <div class="feed-card-content">
                    <div class="feed-card-header">
                      <div class="post-title">{{ post.title }}</div>
                      <div class="post-time">{{ formatEventTime(post) }}</div>
                    </div>
                    <div class="post-body">{{ post.brief }}</div>
                    <div
                      v-if="post.type === 'task' && post.bidCount > 0"
                      class="post-body text-purple-8 q-mt-xs"
                    >
                      {{ post.latestBidSummary }}
                    </div>
                    <div class="feed-card-footer">
                      <span v-if="post.amount" class="post-amount">{{ post.amount }}</span>
                      <span v-else></span>
                      <div class="post-property">
                        <q-icon name="home" size="12px" class="q-mr-xs" />{{ post.property }}
                      </div>
                    </div>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>

          <div v-else class="feed-grid">
            <q-card
              v-if="isMainFeedEmpty"
              class="feed-post feed-empty-card feed-grid-empty q-mb-sm"
            >
              <q-card-section class="q-pa-md">
                <div class="post-title q-mb-xs">No Events Yet</div>
                <div class="post-body">
                  This area shows timeline updates from tasks, leases, transactions, and reminders.
                  Create or update records to populate this feed stream.
                </div>
              </q-card-section>
            </q-card>

            <q-card
              v-for="post in visibleFeedItems"
              :key="`tile-${post.eventId || post.id}`"
              class="feed-post feed-post-clickable feed-mini-card feed-tile-card"
              :class="feedTileClasses(post)"
              clickable
              @click="openFeedPreview(post)"
            >
              <q-card-section class="feed-tile-section">
                <q-img
                  v-if="post.thumbnailUrl"
                  :src="post.thumbnailUrl"
                  class="feed-tile-thumb"
                  fit="cover"
                  spinner-color="primary"
                />
                <div class="feed-tile-body">
                  <div class="feed-tile-top">
                    <span class="feed-tile-type" :class="`feed-tile-type--${post.type}`">{{
                      formatFeedType(post.type)
                    }}</span>
                    <div class="post-time">{{ formatEventTime(post) }}</div>
                  </div>
                  <div class="feed-tile-title">{{ post.title }}</div>
                  <div class="feed-tile-brief">{{ post.brief }}</div>
                  <div
                    v-if="post.type === 'task' && post.bidCount > 0"
                    class="feed-tile-brief text-purple-8"
                  >
                    {{ post.latestBidSummary }}
                  </div>
                  <div class="feed-tile-meta">
                    <span v-if="post.amount" class="post-amount">{{ post.amount }}</span>
                    <span v-else></span>
                    <div class="post-property">
                      <q-icon name="home" size="12px" class="q-mr-xs" />{{ post.property }}
                    </div>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
          <div v-if="showMoreFeedButton" class="feed-more-row">
            <q-btn
              unelevated
              color="primary"
              text-color="white"
              no-caps
              label="More Feed"
              class="feed-more-btn"
              @click="loadMoreFeed"
            />
          </div>
        </div>
        <template v-else>
          <div class="feed-main-router">
            <router-view />
          </div>
        </template>
      </div>
    </div>

    <!-- Contacts Dialog -->
    <q-dialog v-model="showContactsDialog">
      <q-card style="min-width: 420px">
        <q-card-section class="row items-center justify-between">
          <div class="text-h6">Contacts</div>
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-separator />
        <q-card-section>
          <q-list separator>
            <q-item v-for="contact in contacts" :key="contact.id" clickable>
              <q-item-section avatar>
                <q-avatar color="blue-1" text-color="primary">{{ contact.initials }}</q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ contact.name }}</q-item-label>
                <q-item-label caption>{{ contact.role }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Quick Actions Grid Dialog -->
    <q-dialog v-model="showQuickActions">
      <q-card class="quick-actions-dialog">
        <q-card-section class="quick-actions-header">
          <div class="text-subtitle1 text-weight-bold">Go To Create Page</div>
          <q-btn icon="close" flat round dense size="sm" v-close-popup />
        </q-card-section>
        <q-card-section class="quick-actions-grid-section">
          <div class="quick-actions-grid">
            <button v-if="!isPoUser" class="grid-action-item" @click="goToCreateTaskPage">
              <div class="grid-action-icon" style="background: rgba(33, 150, 243, 0.1)">
                <q-icon name="dns" size="24px" color="primary" />
              </div>
              <span class="grid-action-label">Task</span>
            </button>
            <button class="grid-action-item" @click="goToCreateTransactionPage">
              <div class="grid-action-icon" style="background: rgba(76, 175, 80, 0.1)">
                <q-icon name="receipt_long" size="24px" color="positive" />
              </div>
              <span class="grid-action-label">Transaction</span>
            </button>
            <button v-if="!isPoUser" class="grid-action-item" @click="goToCreateLeasePage">
              <div class="grid-action-icon" style="background: rgba(255, 152, 0, 0.1)">
                <q-icon name="event" size="24px" color="warning" />
              </div>
              <span class="grid-action-label">Lease</span>
            </button>
            <button v-if="!isPoUser" class="grid-action-item" @click="goToCreatePropertyPage">
              <div class="grid-action-icon" style="background: rgba(156, 39, 176, 0.1)">
                <q-icon name="home" size="24px" color="purple" />
              </div>
              <span class="grid-action-label">Property</span>
            </button>
            <button v-if="!isPoUser" class="grid-action-item" @click="openCreateReminderDialog">
              <div class="grid-action-icon" style="background: rgba(244, 67, 54, 0.1)">
                <q-icon name="alarm" size="24px" color="negative" />
              </div>
              <span class="grid-action-label">Reminder</span>
            </button>
            <button class="grid-action-item" @click="goToDocumentsPage">
              <div class="grid-action-icon" style="background: rgba(0, 150, 136, 0.1)">
                <q-icon name="description" size="24px" color="teal" />
              </div>
              <span class="grid-action-label">Document</span>
            </button>
            <button class="grid-action-item" @click="goToAssetsPage">
              <div class="grid-action-icon" style="background: rgba(121, 85, 72, 0.1)">
                <q-icon name="inventory_2" size="24px" color="brown" />
              </div>
              <span class="grid-action-label">Asset</span>
            </button>
            <button class="grid-action-item" @click="goToCreateTenantPage">
              <div class="grid-action-icon" style="background: rgba(63, 81, 181, 0.1)">
                <q-icon name="person_add" size="24px" color="indigo" />
              </div>
              <span class="grid-action-label">Tenant</span>
            </button>
            <button class="grid-action-item" @click="goToReportsPage">
              <div class="grid-action-icon" style="background: rgba(96, 125, 139, 0.1)">
                <q-icon name="analytics" size="24px" color="blue-grey" />
              </div>
              <span class="grid-action-label">Report</span>
            </button>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <DetailShell
      v-model="showReminderDetail"
      title="Reminder Details"
      :subtitle="
        selectedReminder
          ? `${resolvePropertyName(selectedReminder.property_id)} • ${selectedReminder.category || 'Reminder'}`
          : ''
      "
      @close="closeReminderDetail"
    >
      <div v-if="selectedReminder" class="reminder-detail-body">
        <div v-if="canManageReminderRecords" class="reminder-detail-actions">
          <q-btn
            color="primary"
            unelevated
            icon="refresh"
            label="Renew"
            @click="renewReminderFromDetail"
          />
        </div>
        <div class="reminder-detail-grid">
          <div class="detail-block">
            <div class="detail-label">Property</div>
            <div class="detail-value">{{ resolvePropertyName(selectedReminder.property_id) }}</div>
          </div>
          <div class="detail-block">
            <div class="detail-label">Category</div>
            <div class="detail-value">{{ selectedReminder.category || 'N/A' }}</div>
          </div>
          <div class="detail-block">
            <div class="detail-label">Status</div>
            <div class="detail-value">
              <q-chip
                :color="selectedReminder.status ? 'positive' : 'negative'"
                text-color="white"
                size="sm"
              >
                {{ selectedReminder.status ? 'Active' : 'Inactive' }}
              </q-chip>
            </div>
          </div>
          <div class="detail-block">
            <div class="detail-label">Start Date</div>
            <div class="detail-value">{{ formatReminderDate(selectedReminder.start_date) }}</div>
          </div>
          <div class="detail-block">
            <div class="detail-label">Due</div>
            <div class="detail-value">{{ getReminderDueStatusLabel(selectedReminder) }}</div>
          </div>
          <div class="detail-block">
            <div class="detail-label">Repeat</div>
            <div class="detail-value">{{ selectedReminder.repeat_by || 'One-time' }}</div>
          </div>
          <div class="detail-block">
            <div class="detail-label">Amount</div>
            <div class="detail-value">
              {{ selectedReminder.amount ? `$${formatCurrency(selectedReminder.amount)}` : 'N/A' }}
            </div>
          </div>
          <div class="detail-block full-width">
            <div class="detail-label">Note</div>
            <div class="detail-value">
              {{ selectedReminder.note || selectedReminder.title || 'No notes added.' }}
            </div>
          </div>
          <div class="detail-block">
            <div class="detail-label">Created</div>
            <div class="detail-value">
              {{ formatReminderDate(selectedReminder.created_date || selectedReminder.start_date) }}
            </div>
          </div>
          <div class="detail-block">
            <div class="detail-label">Renewals</div>
            <div class="detail-value">
              {{ selectedReminder.renewals ? selectedReminder.renewals.length : 0 }}
            </div>
          </div>
        </div>
      </div>
    </DetailShell>

    <DetailShell
      v-model="showFeedPreview"
      :title="selectedFeedItem?.title || 'Feed Preview'"
      :subtitle="feedPreviewSubtitle"
      centered
      @close="closeFeedPreview"
    >
      <template #actions>
        <q-btn
          dense
          no-caps
          color="primary"
          icon="open_in_new"
          label="View Detail"
          :disable="!canOpenSelectedFeedDetail"
          @click="openSelectedFeedDetail"
        />
      </template>

      <div v-if="selectedFeedItem" class="feed-preview-body">
        <q-img
          v-if="selectedFeedItem.thumbnailUrl"
          :src="selectedFeedItem.thumbnailUrl"
          class="feed-preview-image"
          fit="contain"
          spinner-color="primary"
        />

        <div class="feed-preview-header">
          <q-chip dense class="feed-preview-type-chip">
            {{ formatFeedType(selectedFeedItem.type) }}
          </q-chip>
          <div class="feed-preview-time">{{ formatEventTime(selectedFeedItem) }}</div>
        </div>

        <div class="feed-preview-main-text">{{ selectedFeedItem.brief || 'No description.' }}</div>

        <div
          v-if="selectedFeedItem.type === 'task' && selectedFeedItem.bidCount > 0"
          class="feed-preview-bid"
        >
          {{ selectedFeedItem.latestBidSummary }}
        </div>

        <div
          v-if="!['task', 'bid'].includes(String(selectedFeedItem.type || '').toLowerCase())"
          class="feed-preview-section"
        >
          <div class="feed-preview-section-title">{{ feedPreviewSourceTitle }}</div>
          <div v-if="!feedPreviewSourceFields.length" class="feed-preview-empty">
            No detailed source fields available.
          </div>
          <div v-else class="feed-preview-section-grid">
            <div
              v-for="field in feedPreviewSourceFields"
              :key="`source-${field.key}`"
              class="feed-preview-section-field"
            >
              <div class="feed-preview-section-label">{{ field.label }}</div>
              <div class="feed-preview-section-value">
                <span>{{ field.value }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DetailShell>

    <!-- Create Task Dialog -->
    <q-dialog
      v-model="showCreateTaskDialog"
      persistent
      maximized
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card class="create-fullscreen-card">
        <q-card-section class="create-fullscreen-body">
          <CreateMxRecord
            @mxrecord-created="onTaskCreated"
            @cancel="showCreateTaskDialog = false"
          />
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Create Transaction Dialog -->
    <q-dialog
      v-model="showCreateTransactionDialog"
      persistent
      maximized
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card class="create-fullscreen-card">
        <q-card-section class="create-fullscreen-body">
          <CreateTransaction
            @transaction-created="onTransactionCreated"
            @cancel="showCreateTransactionDialog = false"
          />
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Create Lease Dialog -->
    <q-dialog
      v-model="showCreateLeaseDialog"
      persistent
      maximized
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card class="create-fullscreen-card">
        <q-btn
          flat
          round
          dense
          icon="close"
          class="create-fullscreen-close"
          @click="showCreateLeaseDialog = false"
        />
        <div class="create-lease-dialog-scroll">
          <CreateLease @lease-created="onLeaseCreated" @cancel="showCreateLeaseDialog = false" />
        </div>
      </q-card>
    </q-dialog>

    <!-- Create Asset Dialog -->
    <q-dialog
      v-model="showCreateAssetDialog"
      persistent
      maximized
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card class="create-fullscreen-card">
        <q-card-section class="create-fullscreen-body">
          <CreateAsset @asset-created="onAssetCreated" @cancel="showCreateAssetDialog = false" />
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Create Document Dialog -->
    <q-dialog
      v-model="showCreateDocumentDialog"
      persistent
      maximized
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card class="create-fullscreen-card">
        <q-card-section class="create-fullscreen-body">
          <CreateDocument
            @document-created="onDocumentCreated"
            @cancel="showCreateDocumentDialog = false"
          />
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Create Reminder Dialog -->
    <q-dialog
      v-model="showCreateReminderDialog"
      persistent
      maximized
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card class="create-fullscreen-card">
        <q-card-section class="create-fullscreen-body">
          <CreateReminder
            @reminder-saved="onReminderCreated"
            @cancel="showCreateReminderDialog = false"
          />
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Renewal History Dialog -->
    <q-dialog v-model="showRenewalHistoryDialog" persistent>
      <q-card style="min-width: 600px; max-width: 800px">
        <q-card-section class="dialog-header">
          <div class="row items-center justify-between">
            <div class="text-h6">
              <q-icon name="history" class="q-mr-sm" />
              Renewal History
            </div>
            <q-btn
              flat
              round
              dense
              icon="close"
              color="primary"
              @click="closeRenewalHistoryDialog"
              class="dialog-close-btn"
            />
          </div>
        </q-card-section>

        <q-card-section v-if="selectedReminderForHistory">
          <!-- Reminder Info -->
          <div class="renewal-reminder-info q-mb-md">
            <div class="text-subtitle1 text-weight-medium">
              {{ selectedReminderForHistory.property_name }}
            </div>
            <div class="text-caption text-grey-6">
              {{ selectedReminderForHistory.title }}
            </div>
            <div class="text-caption text-grey-6">
              Current Due Date: {{ formatReminderDate(selectedReminderForHistory.due_date) }}
            </div>
          </div>

          <!-- Renewal History Timeline -->
          <div
            v-if="
              selectedReminderForHistory.renewals && selectedReminderForHistory.renewals.length > 0
            "
          >
            <div class="text-subtitle2 q-mb-md">
              Total Renewals: {{ selectedReminderForHistory.renewals.length }}
            </div>

            <q-timeline color="primary" layout="comfortable">
              <q-timeline-entry
                v-for="(renewal, index) in sortedRenewals"
                :key="index"
                :title="`Renewal #${selectedReminderForHistory.renewals.length - index}`"
                :subtitle="formatReminderDate(renewal.renewed_at)"
                icon="refresh"
                :color="index === 0 ? 'positive' : 'primary'"
              >
                <div class="renewal-details">
                  <div class="renewal-detail-item">
                    <span class="detail-label">Renewed On:</span>
                    <span class="detail-value">{{ formatDateTime(renewal.renewed_at) }}</span>
                  </div>
                  <div class="renewal-detail-item">
                    <span class="detail-label">Previous Due Date:</span>
                    <span class="detail-value">{{
                      formatReminderDate(renewal.previous_due_date)
                    }}</span>
                  </div>
                  <div class="renewal-detail-item">
                    <span class="detail-label">New Due Date:</span>
                    <span class="detail-value">{{ formatReminderDate(renewal.new_due_date) }}</span>
                  </div>
                  <q-chip
                    v-if="index === 0"
                    color="positive"
                    text-color="white"
                    size="sm"
                    icon="check_circle"
                    class="q-mt-xs"
                  >
                    Most Recent
                  </q-chip>
                </div>
              </q-timeline-entry>

              <!-- Initial Creation -->
              <q-timeline-entry
                title="Initial Creation"
                :subtitle="
                  formatReminderDate(
                    selectedReminderForHistory.created_date || selectedReminderForHistory.due_date,
                  )
                "
                icon="add_circle"
                color="primary"
              >
                <div class="renewal-details">
                  <div class="renewal-detail-item">
                    <span class="detail-label">Original Due Date:</span>
                    <span class="detail-value">
                      {{
                        formatReminderDate(
                          selectedReminderForHistory.created_date ||
                            selectedReminderForHistory.due_date,
                        )
                      }}
                    </span>
                  </div>
                </div>
              </q-timeline-entry>
            </q-timeline>
          </div>

          <!-- No Renewals State -->
          <div v-else class="text-center q-pa-lg">
            <q-icon name="history" size="48px" color="grey-4" />
            <div class="text-body2 text-grey-6 q-mt-sm">No renewal history</div>
            <div class="text-caption text-grey-5">This reminder has not been renewed yet</div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Close" color="primary" @click="closeRenewalHistoryDialog" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Due Soon Reminders Alert -->
    <q-dialog v-model="showDueReminderAlert" persistent>
      <q-card class="due-reminder-dialog" style="min-width: 520px; max-width: 720px">
        <q-card-section class="dialog-header">
          <div class="row items-center justify-between">
            <div class="text-h6">
              <q-icon name="warning_amber" color="warning" class="q-mr-sm" />
              Reminders Due In 7 Days
            </div>
          </div>
        </q-card-section>

        <q-card-section>
          <div class="text-body2 text-grey-7 q-mb-md">Please review the reminders below.</div>
          <q-list bordered separator class="rounded-borders">
            <q-item v-for="reminder in dueSoonReminders" :key="`due-${reminder.id}`">
              <q-item-section>
                <q-item-label class="text-weight-medium">{{ reminder.title }}</q-item-label>
                <q-item-label caption>
                  {{ reminder.property_name || 'Unknown Property' }} •
                  {{ formatReminderDate(reminder.due_date) }}
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-chip
                  :color="getDueReminderChipColor(reminder)"
                  text-color="white"
                  size="sm"
                  dense
                >
                  {{ getDueReminderChipLabel(reminder) }}
                </q-chip>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            color="primary"
            text-color="white"
            label="I Understand"
            @click="closeDueReminderAlert"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter, isNavigationFailure, NavigationFailureType } from 'vue-router'
import { useUserDataStore } from '../stores/userDataStore'
import { useFirebase } from '../composables/useFirebase'
import { Notify } from 'quasar'
import { marketplaceApi } from '../services/webApiClient'
import CreateMxRecord from '../components/CreateMxRecord.vue'
import CreateTransaction from '../components/CreateTransaction.vue'
import CreateLease from '../components/CreateLease.vue'
import CreateAsset from '../components/CreateAsset.vue'
import CreateDocument from '../components/CreateDocument.vue'
import CreateReminder from '../components/CreateReminder.vue'
import DetailShell from '../components/details/DetailShell.vue'

const router = useRouter()
const route = useRoute()
const { getCollectionData, updateDocument } = useFirebase()
const isIndexHome = computed(() => route.path === '/' || route.path === '/pm-po-feed')
const isPoUser = computed(() => !!userDataStore?.hasPoMembership && !userDataStore?.hasPmMembership)
const canManageReminderRecords = computed(() => {
  const accountType = String(
    userDataStore?.accountType || userDataStore?.userCategory || '',
  ).toLowerCase()
  return ['pm', 'po', 'admin'].includes(accountType)
})
const isMobileFeedLayout = ref(false)
const mobileCollapsedColumns = ref({
  reminders: true,
  feed: true,
})
let mobileFeedLayoutQuery = null
let mobileFeedLayoutHandler = null

const setMobileFeedLayout = (matches) => {
  const enteringMobile = matches && !isMobileFeedLayout.value
  isMobileFeedLayout.value = matches
  if (enteringMobile) {
    mobileCollapsedColumns.value = {
      reminders: true,
      feed: true,
    }
  }
}

const toggleMobileColumn = (key) => {
  if (!isMobileFeedLayout.value) return
  mobileCollapsedColumns.value = {
    ...mobileCollapsedColumns.value,
    [key]: !mobileCollapsedColumns.value[key],
  }
}

const isMobileColumnCollapsed = (key) =>
  isMobileFeedLayout.value && mobileCollapsedColumns.value[key]

const mobileColumnOpenIcon = (key) =>
  isMobileColumnCollapsed(key) ? 'keyboard_arrow_down' : 'keyboard_arrow_up'

// Initialize userDataStore with error handling
let userDataStore
try {
  userDataStore = useUserDataStore()
  console.log('UserDataStore initialized successfully')
} catch (error) {
  console.error('Failed to initialize userDataStore:', error)
  // Create a fallback store object
  userDataStore = {
    isAuthenticated: false,
    userId: null,
    userAccessibleProperties: [],
    userAccessibleMxRecords: [],
    userAccessibleTransactions: [],
    userAccessibleLeases: [],
    loadUserRoles: () => Promise.resolve(),
    loadProperties: () => Promise.resolve(),
    loadTransactions: () => Promise.resolve(),
    loadMxRecords: () => Promise.resolve(),
    loadLeases: () => Promise.resolve(),
  }
}

// Reactive data
const recentMxRecords = ref([])
const recentTransactions = ref([])
const recentBids = ref([])
const taskBidSummaries = ref({})
const showQuickActions = ref(false)
const showContactsDialog = ref(false)
const showReminderDetail = ref(false)
const selectedReminder = ref(null)
const showFeedPreview = ref(false)
const selectedFeedItem = ref(null)

// Reminders data
const reminders = ref([])
const propertyReminders = ref([])
const showDueReminderAlert = ref(false)
const initialLoadTriggered = ref(false)

const allCoreLoaded = computed(() => {
  return (
    userDataStore.isAuthenticated &&
    !userDataStore.profileLoading &&
    !userDataStore.propertiesLoading &&
    !userDataStore.mxRecordsLoading &&
    !userDataStore.transactionsLoading &&
    !userDataStore.leasesLoading
  )
})

const dataLoaded = computed(() => {
  if (!initialLoadTriggered.value) return false
  return allCoreLoaded.value
})

const loadingStep = computed(() => {
  if (!userDataStore.isAuthenticated) return 0
  if (userDataStore.profileLoading) return 1
  if (userDataStore.propertiesLoading) return 2
  if (userDataStore.transactionsLoading) return 3
  if (userDataStore.mxRecordsLoading) return 4
  if (userDataStore.leasesLoading) return 5
  return 6
})

const contacts = []

// Dialog states for create forms
const showCreateTaskDialog = ref(false)
const showCreateTransactionDialog = ref(false)
const showCreateLeaseDialog = ref(false)
const showCreateAssetDialog = ref(false)
const showCreateDocumentDialog = ref(false)
const showCreateReminderDialog = ref(false)

// Renewal history dialog
const showRenewalHistoryDialog = ref(false)
const selectedReminderForHistory = ref(null)

const loadBidFeedItems = async () => {
  try {
    const tasks = userDataStore.userAccessibleMxRecords || []
    if (!tasks.length || !userDataStore.userId) {
      recentBids.value = []
      taskBidSummaries.value = {}
      return
    }

    const summaryByTask = {}
    const rowsByTask = await Promise.all(
      tasks.map(async (task) => {
        const taskRef = normalizeId(task?.mx_id, task?.task_id, task?.id)
        if (!taskRef) return []
        try {
          const rows = await marketplaceApi.getTaskBids(taskRef, {
            actor_id: userDataStore.userId,
            actor_role: 'pm_po',
          })
          const taskDataId = normalizeId(task?.id, task?.mx_id, task?.task_id, taskRef)
          const latestBid = Array.isArray(rows) && rows.length ? rows[0] : null
          if (taskDataId) {
            summaryByTask[taskDataId] = {
              bidCount: Array.isArray(rows) ? rows.length : 0,
              latestBidAmount: latestBid?.amount || null,
              latestBidStatus: latestBid?.status || 'submitted',
              latestBidSpName: latestBid?.sp_business_name || latestBid?.sp_name || 'SP',
              latestBidAt: latestBid?.created_at || null,
            }
          }
          return (rows || []).map((bid) => ({
            eventId: makeEventId('bid', normalizeId(bid?.id, bid?.bid_id)),
            id: `bid-${normalizeId(bid?.id, bid?.bid_id)}`,
            type: 'bid',
            avatarColor: 'purple-2',
            avatarIcon: 'gavel',
            title: `Bid received for ${task?.task_title || task?.title || `Task ${taskRef}`}`,
            property: resolvePropertyName(task?.property_id),
            propertyId: normalizePropertyId(task?.property_id),
            brief: `$${Number(bid?.amount || 0).toLocaleString()} · ${bid?.status || 'submitted'} · ${
              bid?.sp_business_name || bid?.sp_name || 'SP'
            }`,
            detailPath: '/mx-records',
            dataType: 'bid',
            dataId: normalizeId(bid?.id, bid?.bid_id),
            taskId: taskDataId,
            thumbnailUrl: resolveThumbnailUrl(
              bid,
              task,
              resolvePropertyThumbnail(task?.property_id),
            ),
            eventDate: bid?.created_at,
          }))
        } catch {
          return []
        }
      }),
    )

    recentBids.value = rowsByTask
      .flat()
      .filter(Boolean)
      .sort((a, b) => getEventTimestamp(b) - getEventTimestamp(a))
      .slice(0, 5)
    taskBidSummaries.value = summaryByTask
  } catch (error) {
    console.error('Failed to load bid feed items:', error)
    recentBids.value = []
    taskBidSummaries.value = {}
  }
}

// Feed helpers (PM/PO design)
const normalizeId = (...values) => {
  for (const value of values) {
    if (value === null || value === undefined) continue
    const parsed = String(value).trim()
    if (!parsed || parsed.toLowerCase() === 'undefined' || parsed.toLowerCase() === 'null') continue
    return parsed
  }
  return ''
}
const normalizePropertyId = (propertyId) => {
  if (!propertyId) return ''
  if (typeof propertyId === 'string' || typeof propertyId === 'number') return String(propertyId)
  if (typeof propertyId === 'object') {
    return normalizeId(propertyId.id, propertyId.property_id, propertyId._id)
  }
  return ''
}
const dashboardPropertyId = computed(() => normalizePropertyId(route.query.propertyId))
const matchesDashboardProperty = (propertyId) =>
  !dashboardPropertyId.value || normalizePropertyId(propertyId) === dashboardPropertyId.value
const makeEventId = (type, dataId) => `${type}-${dataId}`
const toDateSafe = (value) => {
  if (!value) return null
  if (value?.toDate && typeof value.toDate === 'function') return value.toDate()
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}
const getEventTimestamp = (item) => {
  const date =
    toDateSafe(item?.eventDate) ||
    toDateSafe(item?.created_datetime) ||
    toDateSafe(item?.created_date) ||
    toDateSafe(item?.report_date) ||
    toDateSafe(item?.transac_date) ||
    toDateSafe(item?.lease_create_date) ||
    toDateSafe(item?.start_date)
  return date ? date.getTime() : 0
}
const getEventDate = (item) =>
  toDateSafe(item?.eventDate) ||
  toDateSafe(item?.created_datetime) ||
  toDateSafe(item?.created_date) ||
  toDateSafe(item?.report_date) ||
  toDateSafe(item?.transac_date) ||
  toDateSafe(item?.lease_create_date) ||
  toDateSafe(item?.start_date)
const formatEventTime = (item) => {
  const eventDate = getEventDate(item)
  if (!eventDate) return 'Created: N/A'
  const eventDay = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate())
  const today = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())
  const diffDays = Math.floor((today - eventDay) / (24 * 60 * 60 * 1000))
  let relativeLabel = 'Today'
  if (diffDays === 1) relativeLabel = '1 day ago'
  if (diffDays > 1) relativeLabel = `${diffDays} days ago`
  return `Created: ${eventDate.toLocaleDateString()} • ${relativeLabel}`
}

const MEDIA_OBJECT_KEYS = [
  'image_thumbnail_url',
  'image_thumb_url',
  'compressed_image_url',
  'thumbnail_url',
  'thumbnail',
  'thumb_url',
  'thumb',
  'picture_url',
  'image_url',
  'photo_url',
  'file_url',
  'url',
  'media_url',
]

const MEDIA_ARRAY_KEYS = ['image_urls', 'images', 'photos', 'attachments', 'files', 'media']

const sanitizeMediaUrl = (value) => {
  if (typeof value !== 'string') return ''
  const trimmed = value.trim()
  if (!trimmed) return ''
  const lowered = trimmed.toLowerCase()
  if (lowered === 'null' || lowered === 'undefined') return ''
  return trimmed
}

const extractMediaUrl = (value, depth = 0) => {
  if (!value || depth > 3) return ''
  if (typeof value === 'string') return sanitizeMediaUrl(value)
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = extractMediaUrl(item, depth + 1)
      if (found) return found
    }
    return ''
  }
  if (typeof value !== 'object') return ''

  for (const key of MEDIA_OBJECT_KEYS) {
    const found = extractMediaUrl(value[key], depth + 1)
    if (found) return found
  }
  for (const key of MEDIA_ARRAY_KEYS) {
    const found = extractMediaUrl(value[key], depth + 1)
    if (found) return found
  }
  return ''
}

const resolveThumbnailUrl = (...sources) => {
  for (const source of sources) {
    const found = extractMediaUrl(source)
    if (found) return found
  }
  return ''
}

const DAYS_30_MS = 30 * 24 * 60 * 60 * 1000
const isWithinLastDays = (eventDate, daysMs) => {
  if (!eventDate || isNaN(eventDate.getTime())) return false
  const now = new Date()
  const windowStart = new Date(now.getTime() - daysMs)
  return eventDate >= windowStart && eventDate <= now
}

const resolvePropertyName = (propertyId) => {
  const normalizedPropertyId = normalizePropertyId(propertyId)
  if (!normalizedPropertyId) return 'Unknown Property'
  const prop = (userDataStore.userAccessibleProperties || []).find(
    (p) => String(p.id) === normalizedPropertyId,
  )
  return prop ? prop.nickname || prop.address || 'Unknown Property' : 'Unknown Property'
}

const resolvePropertyRecord = (propertyId) => {
  const normalizedPropertyId = normalizePropertyId(propertyId)
  if (!normalizedPropertyId) return null
  return (userDataStore.userAccessibleProperties || []).find(
    (property) => String(property.id) === normalizedPropertyId,
  )
}

const resolvePropertyThumbnail = (propertyId) => {
  const property = resolvePropertyRecord(propertyId)
  return resolveThumbnailUrl(property)
}

const getTaskBidSummary = (task) => {
  const taskId = normalizeId(task?.id, task?.mx_id, task?.task_id)
  if (!taskId) return null
  return taskBidSummaries.value[taskId] || null
}

const normalizeTaskLogAction = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()

const getTaskLogCommentText = (log) => {
  if (typeof log === 'string') return String(log || '').trim()
  if (!log || typeof log !== 'object') return ''
  const raw = log.comment ?? log.note ?? log.description ?? log.message ?? log.text ?? ''
  return String(raw || '').trim()
}

const getTaskLogTimestamp = (task, log = {}) =>
  toDateSafe(log?.log_timestamp) ||
  toDateSafe(log?.created_at) ||
  toDateSafe(log?.createdAt) ||
  toDateSafe(log?.timestamp) ||
  toDateSafe(task?.updatedAt) ||
  toDateSafe(task?.createAt) ||
  toDateSafe(task?.report_date)

const getTaskLogStatusLabel = (task, log = {}, actionType = '') => {
  const explicitStatus =
    log?.new_status || log?.to_status || log?.status_to || log?.next_status || log?.status || ''
  const explicitLabel = String(explicitStatus || '').trim()
  if (explicitLabel) return explicitLabel
  if (actionType === 'resolution') return 'closed'
  if (actionType === 'cancel') return 'cancelled'
  return String(task?.status || 'updated').trim() || 'updated'
}

const isTaskStatusChangeLog = (task, log = {}, actionType = '') => {
  if (['resolution', 'cancel', 'status'].includes(actionType)) return true
  const hasStatusFields = [
    log?.new_status,
    log?.to_status,
    log?.status_to,
    log?.next_status,
    log?.previous_status,
    log?.from_status,
    log?.status_from,
  ].some((value) => String(value || '').trim().length > 0)
  if (hasStatusFields) return true

  if (actionType !== 'update') return false
  const taskStatus = String(task?.status || '')
    .trim()
    .toLowerCase()
  return Boolean(taskStatus && taskStatus !== 'open')
}

const taskActivityFeedItems = computed(() =>
  (userDataStore.userAccessibleMxRecords || []).flatMap((task) => {
    const taskId = normalizeId(task?.id, task?.mx_id, task?.task_id)
    if (!taskId) return []
    const taskLabel = `Task ${task?.mx_id || `#${task?.id}`}`
    const propertyName = resolvePropertyName(task?.property_id)
    const propertyThumbnail = resolvePropertyThumbnail(task?.property_id)
    const logs = Array.isArray(task?.logs) ? task.logs : []

    const events = logs
      .map((entry, index) => {
        const log = entry && typeof entry === 'object' ? entry : { comment: String(entry || '') }
        const actionType = normalizeTaskLogAction(log?.action_type)
        const commentText = getTaskLogCommentText(log)
        const isInitialSystemLog = commentText.toLowerCase() === 'initial report submitted'
        const statusLabel = getTaskLogStatusLabel(task, log, actionType)
        const statusEvent = isTaskStatusChangeLog(task, log, actionType)
        const commentEvent = Boolean(commentText) && !isInitialSystemLog
        const eventDate = getTaskLogTimestamp(task, log)
        if (!eventDate || !isWithinLastDays(eventDate, DAYS_30_MS)) return []

        const baseSnapshot = { ...task, ...log, logs: [log] }
        const eventRows = []
        if (statusEvent) {
          eventRows.push({
            eventId: makeEventId('task-status', `${taskId}-${eventDate.getTime()}-${index}`),
            id: `task-status-${taskId}-${index}`,
            type: 'task',
            avatarColor: 'deep-purple-2',
            avatarIcon: 'sync_alt',
            title: `${taskLabel} status changed`,
            property: propertyName,
            propertyId: normalizePropertyId(task?.property_id),
            brief: `Status changed to ${statusLabel}.`,
            detailPath: '/mx-records',
            dataType: 'task',
            dataId: taskId,
            thumbnailUrl: resolveThumbnailUrl(log, task, propertyThumbnail),
            eventDate,
            snapshot: baseSnapshot,
          })
        }
        if (commentEvent && !statusEvent) {
          eventRows.push({
            eventId: makeEventId('task-comment', `${taskId}-${eventDate.getTime()}-${index}`),
            id: `task-comment-${taskId}-${index}`,
            type: 'task',
            avatarColor: 'cyan-2',
            avatarIcon: 'chat',
            title: `New comment on ${taskLabel}`,
            property: propertyName,
            propertyId: normalizePropertyId(task?.property_id),
            brief: commentText,
            detailPath: '/mx-records',
            dataType: 'task',
            dataId: taskId,
            thumbnailUrl: resolveThumbnailUrl(log, task, propertyThumbnail),
            eventDate,
            snapshot: baseSnapshot,
          })
        }
        return eventRows
      })
      .flat()

    const hasStatusEvent = events.some((event) =>
      String(event?.eventId || '').startsWith('task-status-'),
    )
    if (!hasStatusEvent) {
      const fallbackStatus = String(task?.status || '').trim()
      const fallbackStatusLower = fallbackStatus.toLowerCase()
      const updatedAt = toDateSafe(task?.updatedAt)
      const createdAt = toDateSafe(task?.createAt) || toDateSafe(task?.report_date)
      if (
        fallbackStatus &&
        !['open', 'new'].includes(fallbackStatusLower) &&
        updatedAt &&
        isWithinLastDays(updatedAt, DAYS_30_MS) &&
        (!createdAt || updatedAt.getTime() > createdAt.getTime() + 1000)
      ) {
        events.push({
          eventId: makeEventId('task-status', `${taskId}-${updatedAt.getTime()}-fallback`),
          id: `task-status-${taskId}-fallback`,
          type: 'task',
          avatarColor: 'deep-purple-2',
          avatarIcon: 'sync_alt',
          title: `${taskLabel} status changed`,
          property: propertyName,
          propertyId: normalizePropertyId(task?.property_id),
          brief: `Status changed to ${fallbackStatus}.`,
          detailPath: '/mx-records',
          dataType: 'task',
          dataId: taskId,
          thumbnailUrl: resolveThumbnailUrl(task, propertyThumbnail),
          eventDate: updatedAt,
          snapshot: { ...task },
        })
      }
    }

    return events
  }),
)

const taskFeedItems = computed(() =>
  (userDataStore.userAccessibleMxRecords || []).map((task) => {
    const taskId = normalizeId(task.id, task.mx_id)
    const bidSummary = getTaskBidSummary(task)
    return {
      eventId: makeEventId('task', taskId),
      id: `task-${task.id}`,
      type: 'task',
      avatarColor: 'blue-2',
      avatarIcon: 'build',
      title: `Task ${task.mx_id || `#${task.id}`}`,
      property: resolvePropertyName(task.property_id),
      propertyId: normalizePropertyId(task.property_id),
      brief: task.description || 'Task has new updates.',
      bidCount: bidSummary?.bidCount || 0,
      latestBidAmount: bidSummary?.latestBidAmount || null,
      latestBidStatus: bidSummary?.latestBidStatus || null,
      latestBidSpName: bidSummary?.latestBidSpName || null,
      latestBidAt: bidSummary?.latestBidAt || null,
      latestBidSummary:
        bidSummary && bidSummary.bidCount > 0
          ? `${bidSummary.bidCount} bid${bidSummary.bidCount > 1 ? 's' : ''} · Latest ${
              bidSummary.latestBidSpName
            } $${Number(bidSummary.latestBidAmount || 0).toLocaleString()}`
          : '',
      detailPath: '/mx-records',
      dataType: 'task',
      dataId: taskId,
      thumbnailUrl: resolveThumbnailUrl(task, resolvePropertyThumbnail(task?.property_id)),
      eventDate: task.updatedAt || task.createAt || task.report_date,
      snapshot: { ...task },
    }
  }),
)

const transactionFeedItems = computed(() =>
  (userDataStore.userAccessibleTransactions || [])
    .filter((transaction) => {
      const eventDate =
        toDateSafe(transaction.created_datetime) ||
        toDateSafe(transaction.transac_date) ||
        toDateSafe(transaction.date)
      return isWithinLastDays(eventDate, DAYS_30_MS)
    })
    .map((transaction) => ({
      eventId: makeEventId('transaction', normalizeId(transaction.id, transaction.transac_id)),
      id: `txn-${transaction.id}`,
      type: 'transaction',
      avatarColor: 'green-2',
      avatarIcon: 'receipt_long',
      title: `${transaction.transac_type || 'Transaction'}`,
      property: resolvePropertyName(transaction.property_id),
      propertyId: normalizePropertyId(transaction.property_id),
      brief: transaction.note || transaction.description || 'Transaction record updated.',
      amount: transaction.amount ? `$${parseFloat(transaction.amount).toLocaleString()}` : null,
      detailPath: '/transactions',
      dataType: 'transaction',
      dataId: normalizeId(transaction.id, transaction.transac_id),
      thumbnailUrl: resolveThumbnailUrl(
        transaction,
        resolvePropertyThumbnail(transaction?.property_id),
      ),
      eventDate: transaction.created_datetime || transaction.transac_date || transaction.date,
      snapshot: { ...transaction },
    })),
)

const leaseFeedItems = computed(() =>
  (userDataStore.userAccessibleLeases || []).map((lease) => {
    const leasePropertyId = lease.property?.id || lease.property_id?.id || lease.property_id
    return {
      eventId: makeEventId('lease', normalizeId(lease.id, lease.lease_id, lease.LSID)),
      id: `lease-${lease.id}`,
      type: 'lease',
      avatarColor: 'orange-2',
      avatarIcon: 'event',
      title: `Lease ${lease.LSID || `#${lease.id}`}`,
      property: resolvePropertyName(leasePropertyId),
      propertyId: normalizePropertyId(leasePropertyId),
      brief: lease.status ? `Status: ${lease.status}` : 'Lease details updated.',
      detailPath: '/leases',
      dataType: 'lease',
      dataId: normalizeId(lease.id, lease.lease_id, lease.LSID),
      thumbnailUrl: resolveThumbnailUrl(lease, resolvePropertyThumbnail(leasePropertyId)),
      eventDate: lease.updatedAt || lease.created_datetime || lease.lease_create_date,
    }
  }),
)

// Sort state
const feedSortField = ref('time')
const feedSortAsc = ref(false)
const feedViewMode = ref('list')
const FEED_VIEW_MODE_STORAGE_KEY = 'index_feed_view_mode_v1'
const FEED_PAGE_SIZE = 15
const visibleFeedCount = ref(FEED_PAGE_SIZE)

const allFeedItems = computed(() => {
  const items = [
    ...taskActivityFeedItems.value,
    ...taskFeedItems.value,
    ...recentBids.value,
    ...transactionFeedItems.value,
    ...leaseFeedItems.value,
  ].filter((item) => matchesDashboardProperty(item.propertyId))
  const field = feedSortField.value
  const asc = feedSortAsc.value
  items.sort((a, b) => {
    let cmp = 0
    if (field === 'time') {
      cmp = getEventTimestamp(a) - getEventTimestamp(b)
    } else if (field === 'type') {
      cmp = a.type.localeCompare(b.type)
    } else if (field === 'property') {
      cmp = (a.property || '').localeCompare(b.property || '')
    }
    return asc ? cmp : -cmp
  })
  return items
})
const visibleFeedItems = computed(() => allFeedItems.value.slice(0, visibleFeedCount.value))
const showMoreFeedButton = computed(
  () => isIndexHome.value && allFeedItems.value.length > visibleFeedItems.value.length,
)
const isMainFeedEmpty = computed(() => allFeedItems.value.length === 0)

const resetVisibleFeedCount = () => {
  visibleFeedCount.value = FEED_PAGE_SIZE
}

const loadMoreFeed = () => {
  visibleFeedCount.value += FEED_PAGE_SIZE
}

const toggleSort = (field) => {
  if (feedSortField.value === field) {
    feedSortAsc.value = !feedSortAsc.value
  } else {
    feedSortField.value = field
    feedSortAsc.value = field === 'time' ? false : true
  }
}
const sortIcon = (field) => {
  if (feedSortField.value !== field) return 'unfold_more'
  return feedSortAsc.value ? 'arrow_upward' : 'arrow_downward'
}
const currentSortLabel = computed(() => {
  if (feedSortField.value === 'type') return 'Type'
  if (feedSortField.value === 'property') return 'Property'
  return 'Time'
})
const currentSortIcon = computed(() => sortIcon(feedSortField.value))
const currentViewLabel = computed(() => (feedViewMode.value === 'tile' ? 'View: Tile' : 'View: List'))
const currentViewIcon = computed(() => (feedViewMode.value === 'tile' ? 'grid_view' : 'view_agenda'))

const formatFeedType = (type) => {
  const normalized = String(type || 'event')
    .trim()
    .toLowerCase()
  if (!normalized) return 'Event'
  return normalized.charAt(0).toUpperCase() + normalized.slice(1)
}

const feedTileClasses = (post) => {
  const classes = []
  if (!post) return classes

  if (post.thumbnailUrl) classes.push('feed-tile--with-image')
  if (post.type === 'task') {
    classes.push('feed-tile--task')
    classes.push(post.thumbnailUrl ? 'feed-tile--feature' : 'feed-tile--wide')
  }
  if (post.type === 'transaction') classes.push('feed-tile--compact')
  if (post.type === 'lease' || post.type === 'bid') classes.push('feed-tile--compact')

  return classes
}

// Reminder items for left rail
const MS_PER_DAY = 24 * 60 * 60 * 1000
const toMidnight = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate())
const toValidMidnight = (value) => {
  if (!value) return null
  const date = value instanceof Date ? new Date(value) : new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return toMidnight(date)
}
const toIsoDate = (value) => {
  const date = toValidMidnight(value)
  return date ? date.toISOString().split('T')[0] : ''
}
const normalizeReminderRepeat = (value) =>
  String(value || 'one-time')
    .trim()
    .toLowerCase()
const getReminderDueDateValue = (reminder) => reminder?.due_date || reminder?.start_date
const calculateReminderNextDueDate = (baseDateValue, repeatBy) => {
  const repeatValue = normalizeReminderRepeat(repeatBy)
  const base = toValidMidnight(baseDateValue) || toValidMidnight(new Date())
  const next = new Date(base)
  if (repeatValue === 'daily') next.setDate(next.getDate() + 1)
  else if (repeatValue === 'weekly') next.setDate(next.getDate() + 7)
  else if (repeatValue === 'monthly') next.setMonth(next.getMonth() + 1)
  else if (repeatValue === 'yearly') next.setFullYear(next.getFullYear() + 1)
  else next.setDate(next.getDate() + 30)
  return toIsoDate(next)
}
const getReminderDueStatusLabel = (reminder) => {
  const dueDate = toValidMidnight(getReminderDueDateValue(reminder))
  if (!dueDate) return 'Due: N/A'
  const today = toValidMidnight(new Date())
  const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / MS_PER_DAY)
  if (diffDays < 0) return `${Math.abs(diffDays)}d overdue`
  if (diffDays === 0) return 'Due today'
  return `Due in ${diffDays} day${diffDays === 1 ? '' : 's'}`
}

const propertyReminderItems = computed(() =>
  (propertyReminders.value || []).filter((reminder) => matchesDashboardProperty(reminder.property_id)).map((reminder) => {
    const propId = reminder.property_id?.id || reminder.property_id
    const propertyName = resolvePropertyName(propId)
    const today = toMidnight(new Date())
    let daysDue = null
    let dueLabel = ''
    const dueDate = toValidMidnight(getReminderDueDateValue(reminder))
    if (dueDate) {
      daysDue = Math.floor((dueDate.getTime() - today.getTime()) / MS_PER_DAY)
      if (daysDue < 0) dueLabel = `${Math.abs(daysDue)}d overdue`
      else if (daysDue === 0) dueLabel = 'Due today'
      else dueLabel = `Due in ${daysDue} day${daysDue === 1 ? '' : 's'}`
    }
    return {
      eventId: makeEventId('reminder', normalizeId(reminder.id, reminder.reminder_id)),
      id: normalizeId(reminder.id, reminder.reminder_id),
      type: 'reminder',
      avatarColor: reminder.status ? 'purple-2' : 'grey-4',
      avatarIcon: reminder.status ? 'notifications_active' : 'notifications_off',
      title: `${String(reminder.category || 'Reminder').toUpperCase()} reminder`,
      propertyName,
      daysDue,
      dueLabel,
      detailPath: '/reminders',
      dataType: 'reminder',
      dataId: normalizeId(reminder.id, reminder.reminder_id),
      eventDate: reminder.created_date || reminder.due_date || reminder.start_date,
    }
  }),
)

const reminderItems = computed(() => [...propertyReminderItems.value])
const filteredReminderItems = computed(() =>
  reminderItems.value.filter((item) => normalizeId(item.dataId, item.targetId)),
)

const feedPreviewSubtitle = computed(() => {
  if (!selectedFeedItem.value) return ''
  const post = selectedFeedItem.value
  const typeLabel = formatFeedType(post.type)
  const property = post.property || 'Unknown Property'
  return `${typeLabel} • ${property}`
})

const capitalizeFirst = (value) => {
  const text = String(value || '').trim()
  if (!text) return ''
  return text.charAt(0).toUpperCase() + text.slice(1)
}

const getValueByPath = (source, path) => {
  if (!source || !path) return undefined
  const segments = String(path).split('.').filter(Boolean)
  let current = source
  for (const segment of segments) {
    if (current === null || current === undefined) return undefined
    current = current[segment]
  }
  return current
}

const pickFirstValue = (source, paths = []) => {
  for (const path of paths) {
    const value = getValueByPath(source, path)
    if (value === null || value === undefined) continue
    const text = typeof value === 'string' ? value.trim() : String(value).trim()
    if (text) return value
  }
  return null
}

const formatDetailDate = (value) => {
  const date = toDateSafe(value)
  if (!date) return 'N/A'
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

const formatDetailCurrency = (value) => {
  const normalized = typeof value === 'string' ? value.replace(/[^0-9.-]/g, '') : value
  const amount = Number(normalized)
  if (!Number.isFinite(amount)) return 'N/A'
  return `$${amount.toLocaleString('en-US', { maximumFractionDigits: 2 })}`
}

const safeDisplay = (value) => {
  if (value === null || value === undefined) return 'N/A'
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  const text = String(value).trim()
  return text || 'N/A'
}

const getTaskCommentsSummary = (task) => {
  const logs = Array.isArray(task?.logs) ? task.logs : []
  const directComments = Array.isArray(task?.comments) ? task.comments : []
  const merged = [...logs, ...directComments]
  const comments = merged
    .map((item) => {
      if (typeof item === 'string') return item
      return pickFirstValue(item, ['comment', 'note', 'description', 'message', 'text'])
    })
    .filter((item) => {
      const text = safeDisplay(item)
      return text !== 'N/A'
    })
    .map((item) => safeDisplay(item))

  if (!comments.length) return { count: 0, latest: 'No comments yet' }
  return {
    count: comments.length,
    latest: comments[comments.length - 1],
  }
}

const feedPreviewSourceTitle = computed(() => {
  const type = String(selectedFeedItem.value?.type || '').toLowerCase()
  if (type === 'transaction') return 'Transaction Details'
  if (type === 'task') return 'Task Details'
  if (type === 'lease') return 'Lease Details'
  if (type === 'bid') return 'Bid Details'
  return 'Source Details'
})

const feedPreviewSourceFields = computed(() => {
  const post = selectedFeedItem.value
  if (!post) return []
  const type = String(post.type || '').toLowerCase()

  if (type === 'transaction') {
    const tx = post.snapshot || {}
    const propertyId = tx.property_id || tx.propertyId || post.property_id
    return [
      { key: 'property', label: 'Property', value: safeDisplay(post.property || resolvePropertyName(propertyId)) },
      { key: 'date', label: 'Date', value: formatDetailDate(tx.transac_date || tx.date || post.eventDate) },
      { key: 'from', label: 'From', value: safeDisplay(capitalizeFirst(tx.transac_from)) },
      { key: 'to', label: 'To', value: safeDisplay(capitalizeFirst(tx.transac_to)) },
      { key: 'amount', label: 'Amount', value: formatDetailCurrency(tx.amount ?? post.amount) },
      { key: 'type', label: 'Type', value: safeDisplay(tx.transac_type) },
      { key: 'note', label: 'Note', value: safeDisplay(tx.note || tx.description || post.brief) },
    ]
  }

  if (type === 'task') {
    const task = post.snapshot || {}
    const comments = getTaskCommentsSummary(task)
    return [
      {
        key: 'description',
        label: 'Task Description',
        value: safeDisplay(task.description || post.brief),
      },
      { key: 'comment_count', label: 'Comments', value: String(comments.count) },
      { key: 'latest_comment', label: 'Latest Comment', value: comments.latest },
    ]
  }

  if (type === 'lease') {
    const lease = post.snapshot || {}
    const moveInDate = pickFirstValue(lease, ['start_date', 'lease_start_date', 'move_in_date'])
    return [
      { key: 'movein', label: 'Move-In Date', value: formatDetailDate(moveInDate) },
      {
        key: 'term',
        label: 'Term',
        value: lease.lease_term ? `${lease.lease_term} months` : 'N/A',
      },
      { key: 'rate', label: 'Rate', value: formatDetailCurrency(lease.rate_amount) },
      {
        key: 'rate_type',
        label: 'Rate Type',
        value: safeDisplay(lease.rate_type ? capitalizeFirst(lease.rate_type) : 'N/A'),
      },
    ]
  }

  if (type === 'bid') {
    const bid = post.snapshot?.bid || {}
    return [
      {
        key: 'sp',
        label: 'Service Provider',
        value: safeDisplay(pickFirstValue(bid, ['sp_business_name', 'sp_name', 'sp_display_name'])),
      },
      { key: 'amount', label: 'Amount', value: formatDetailCurrency(bid.amount) },
      { key: 'status', label: 'Status', value: safeDisplay(bid.status) },
      {
        key: 'note',
        label: 'Note',
        value: safeDisplay(pickFirstValue(bid, ['note', 'description'])),
      },
    ]
  }

  return [{ key: 'detail', label: 'Detail', value: safeDisplay(post.brief) }]
})

function getDetailRouteTarget(post) {
  if (!post?.detailPath) return
  const dataType = String(post?.dataType || post?.targetType || '').trim()
  const dataId = normalizeId(post?.dataId, post?.targetId)
  if (!dataType || !dataId) return null
  const query = { openType: dataType, openId: dataId }
  if (dataType === 'bid') {
    query.openTaskId = normalizeId(post?.taskId, post?.task_id, post?.taskDataId)
  }
  return { path: post.detailPath, query }
}

const canOpenFeedDetail = (post) => !!getDetailRouteTarget(post)

const canOpenSelectedFeedDetail = computed(() => canOpenFeedDetail(selectedFeedItem.value))

const openFeedPreview = (post) => {
  if (!post) return
  selectedFeedItem.value = post
  showFeedPreview.value = true
}

const closeFeedPreview = () => {
  showFeedPreview.value = false
  selectedFeedItem.value = null
}

const openDetail = async (post) => {
  const target = getDetailRouteTarget(post)
  if (!target) {
    Notify.create({
      type: 'warning',
      message: 'This feed item is not linked to a detail record yet.',
      position: 'top',
    })
    return false
  }
  try {
    await router.push(target)
    return true
  } catch (error) {
    console.error('Failed to open feed detail route:', error)
    Notify.create({
      type: 'negative',
      message: 'Failed to open detail view. Please try again.',
      position: 'top',
    })
    return false
  }
}

const openSelectedFeedDetail = async () => {
  if (!selectedFeedItem.value) return
  const opened = await openDetail(selectedFeedItem.value)
  if (opened) closeFeedPreview()
}

const openReminderDetail = (item) => {
  if (!item) return
  const dataId = normalizeId(item?.dataId, item?.targetId, item?.id)
  const reminderMatch = (propertyReminders.value || []).find((reminder) => {
    const ids = [reminder.id, reminder.reminder_id]
      .filter((value) => value !== null && value !== undefined)
      .map((value) => String(value))
    return ids.includes(String(dataId))
  })
  const source = reminderMatch || item
  selectedReminder.value = {
    ...source,
    id: normalizeId(source?.id, source?.reminder_id, dataId),
    property_id: source?.property_id || item?.property_id || '',
    category: source?.category || item?.category || 'Reminder',
    note: source?.note || source?.brief || item?.brief || '',
    status: source?.status ?? true,
    repeat_by: source?.repeat_by || 'One-time',
    due_date: source?.due_date || source?.start_date || item?.due_date || item?.start_date || '',
    renewals: Array.isArray(source?.renewals) ? source.renewals : [],
  }
  showReminderDetail.value = true
}

const closeReminderDetail = () => {
  showReminderDetail.value = false
  selectedReminder.value = null
}

const syncUpdatedReminderInFeed = (updatedReminder) => {
  propertyReminders.value = (propertyReminders.value || []).map((reminder) =>
    String(normalizeId(reminder.id, reminder.reminder_id)) ===
    String(normalizeId(updatedReminder.id, updatedReminder.reminder_id))
      ? { ...reminder, ...updatedReminder }
      : reminder,
  )
  if (
    selectedReminder.value &&
    String(normalizeId(selectedReminder.value.id, selectedReminder.value.reminder_id)) ===
      String(normalizeId(updatedReminder.id, updatedReminder.reminder_id))
  ) {
    selectedReminder.value = { ...selectedReminder.value, ...updatedReminder }
  }
}

const renewReminderFromDetail = async () => {
  if (!canManageReminderRecords.value || !selectedReminder.value) return
  try {
    const current = selectedReminder.value
    const propertyId = normalizeId(current.property_id?.id, current.property_id)
    const reminderId = normalizeId(current.id, current.reminder_id)
    if (!propertyId || !reminderId) {
      Notify.create({
        type: 'warning',
        message: 'Reminder reference is incomplete.',
        position: 'top',
      })
      return
    }

    const todayIso = toIsoDate(new Date())
    const previousStartDate = current.start_date || todayIso
    const previousDueDate = getReminderDueDateValue(current) || previousStartDate
    const newDueDate = calculateReminderNextDueDate(previousDueDate, current.repeat_by)
    const renewals = Array.isArray(current.renewals) ? [...current.renewals] : []
    renewals.push({
      renewed_at: new Date().toISOString(),
      previous_start_date: previousStartDate,
      new_start_date: todayIso,
      previous_due_date: previousDueDate,
      new_due_date: newDueDate,
    })

    const updatedReminder = {
      ...current,
      start_date: todayIso,
      due_date: newDueDate,
      renewals,
    }

    await updateDocument(`properties/${propertyId}/reminders`, reminderId, updatedReminder)
    syncUpdatedReminderInFeed(updatedReminder)
    Notify.create({
      type: 'positive',
      message: `Reminder renewed.`,
      caption: `Next due: ${newDueDate}`,
      position: 'top',
    })
  } catch (error) {
    console.error('Failed to renew reminder from index detail:', error)
    Notify.create({
      type: 'negative',
      message: 'Failed to renew reminder.',
      position: 'top',
    })
  }
}

// Process dashboard data
const processDashboardData = () => {
  console.log('Processing dashboard data...')

  // Get recent tasks (last 5)
  recentMxRecords.value = userDataStore.userAccessibleMxRecords
    .sort((a, b) => new Date(b.report_date) - new Date(a.report_date))
    .slice(0, 5)

  // Get recent transactions (last 5)
  const getTxnDate = (t) => {
    const d = t.transac_date || t.created_datetime || t.date
    return d?.toDate ? d.toDate() : new Date(d)
  }
  recentTransactions.value = userDataStore.userAccessibleTransactions
    .sort((a, b) => getTxnDate(b) - getTxnDate(a))
    .slice(0, 5)

  console.log('Dashboard data processed:', {
    mxRecords: recentMxRecords.value.length,
    transactions: recentTransactions.value.length,
  })
}

// Utility functions
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

// Computed property for sorted renewals (most recent first)
const sortedRenewals = computed(() => {
  if (!selectedReminderForHistory.value?.renewals) return []

  return [...selectedReminderForHistory.value.renewals].sort((a, b) => {
    return new Date(b.renewed_at) - new Date(a.renewed_at)
  })
})

const dueSoonReminders = computed(() => {
  const now = new Date()
  now.setHours(0, 0, 0, 0)

  return reminders.value.filter((reminder) => {
    if (!reminder?.due_date) return false
    const dueDate = new Date(reminder.due_date)
    if (Number.isNaN(dueDate.getTime())) return false
    dueDate.setHours(0, 0, 0, 0)
    const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return diffDays >= 0 && diffDays <= 7
  })
})

// Renewal history functions
const closeRenewalHistoryDialog = () => {
  showRenewalHistoryDialog.value = false
  selectedReminderForHistory.value = null
}

const getDueReminderChipLabel = (reminder) => {
  if (!reminder?.due_date) return 'Unknown'
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const dueDate = new Date(reminder.due_date)
  dueDate.setHours(0, 0, 0, 0)
  const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return '1 Day'
  return `${diffDays} Days`
}

const getDueReminderChipColor = (reminder) => {
  const label = getDueReminderChipLabel(reminder)
  if (label === 'Today') return 'negative'
  if (label === '1 Day') return 'warning'
  return 'primary'
}

const getDueAlertSessionKey = () => {
  const userId = userDataStore.userId || 'anonymous'
  const today = new Date().toISOString().split('T')[0]
  return `due-reminder-alert-dismissed:${userId}:${today}`
}

const maybeShowDueReminderAlert = () => {
  if (!userDataStore.isAuthenticated) return
  if (dueSoonReminders.value.length === 0) return
  const dismissed = sessionStorage.getItem(getDueAlertSessionKey())
  if (dismissed === 'true') return
  showDueReminderAlert.value = true
}

const closeDueReminderAlert = () => {
  showDueReminderAlert.value = false
  sessionStorage.setItem(getDueAlertSessionKey(), 'true')
}

// Quick actions dialog handlers
const openCreateTransactionDialog = () => {
  showCreateTransactionDialog.value = true
  showQuickActions.value = false
}

const openCreateTaskDialog = () => {
  showCreateTaskDialog.value = true
  showQuickActions.value = false
}

const openCreateAssetDialog = () => {
  showCreateAssetDialog.value = true
  showQuickActions.value = false
}

const openCreateDocumentDialog = () => {
  showCreateDocumentDialog.value = true
  showQuickActions.value = false
}

const navigateToPage = async (path, actionLabel) => {
  showQuickActions.value = false
  try {
    const failure = await router.push(path)
    if (
      isNavigationFailure(failure, NavigationFailureType.aborted) ||
      isNavigationFailure(failure, NavigationFailureType.cancelled)
    ) {
      Notify.create({
        type: 'warning',
        message: `${actionLabel} is currently unavailable.`,
        position: 'top',
        timeout: 2800,
      })
    }
  } catch (error) {
    console.error(`Navigation failed for ${actionLabel}:`, error)
    Notify.create({
      type: 'negative',
      message: `Failed to open ${actionLabel}. Please try again.`,
      position: 'top',
      timeout: 3200,
    })
  }
}

const goToCreateTaskPage = () => {
  if (isPoUser.value) return
  navigateToPage('/create-mxrecord', 'Create Task')
}

const goToCreateTransactionPage = () => {
  navigateToPage('/create-transaction', 'Create Transaction')
}

const goToCreateLeasePage = () => {
  if (isPoUser.value) return
  navigateToPage('/create-lease', 'Create Lease')
}

const goToCreatePropertyPage = () => {
  if (isPoUser.value) return
  router.push('/create-property')
  showQuickActions.value = false
}

const openCreateReminderDialog = () => {
  showCreateReminderDialog.value = true
  showQuickActions.value = false
}

const goToDocumentsPage = () => {
  router.push('/documents')
  showQuickActions.value = false
}

const goToAssetsPage = () => {
  router.push('/assets')
  showQuickActions.value = false
}

const goToCreateTenantPage = () => {
  router.push('/create-tenant')
  showQuickActions.value = false
}

const goToReportsPage = () => {
  router.push('/reports')
  showQuickActions.value = false
}

// Reminders functions
const loadReminders = () => {
  try {
    reminders.value = []
  } catch (error) {
    console.error('Error loading reminders:', error)
    reminders.value = []
  }
}

const formatReminderDate = (dateString) => {
  const date = toDateSafe(dateString)
  if (!date) return 'N/A'
  const now = new Date()
  const diffTime = date.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 0) {
    return `${Math.abs(diffDays)} day${Math.abs(diffDays) === 1 ? '' : 's'} overdue`
  } else if (diffDays === 0) {
    return 'Today'
  } else if (diffDays === 1) {
    return 'Tomorrow'
  } else {
    return `In ${diffDays} days`
  }
}

// Dialog event handlers
const onTaskCreated = async () => {
  showCreateTaskDialog.value = false
  await userDataStore.loadAllUserData()
  Notify.create({
    type: 'positive',
    message: 'Task created successfully!',
    position: 'top',
    timeout: 3000,
  })
}

const onTransactionCreated = () => {
  showCreateTransactionDialog.value = false
  Notify.create({
    type: 'positive',
    message: 'Transaction created successfully!',
    position: 'top',
    timeout: 3000,
  })
}

const onLeaseCreated = () => {
  showCreateLeaseDialog.value = false
  Notify.create({
    type: 'positive',
    message: 'Lease created successfully!',
    position: 'top',
    timeout: 3000,
  })
}

const onAssetCreated = async () => {
  showCreateAssetDialog.value = false
  await userDataStore.loadAllUserData()
  Notify.create({
    type: 'positive',
    message: 'Asset created successfully!',
    position: 'top',
    timeout: 3000,
  })
}

const onDocumentCreated = async () => {
  showCreateDocumentDialog.value = false
  await userDataStore.loadAllUserData()
  Notify.create({
    type: 'positive',
    message: 'Document created successfully!',
    position: 'top',
    timeout: 3000,
  })
}

const onReminderCreated = async () => {
  showCreateReminderDialog.value = false
  await loadPropertyReminders()
  Notify.create({
    type: 'positive',
    message: 'Reminder created successfully!',
    position: 'top',
    timeout: 3000,
  })
}

// Watchers
watch(
  () => userDataStore.isAuthenticated,
  async (newValue) => {
    if (newValue) {
      initialLoadTriggered.value = true
      processDashboardData()
    } else {
      recentMxRecords.value = []
      recentTransactions.value = []
      recentBids.value = []
      taskBidSummaries.value = {}
      initialLoadTriggered.value = false
    }
  },
)

watch(allCoreLoaded, (ready) => {
  if (ready) {
    processDashboardData()
  }
})

watch(
  () => userDataStore.userAccessibleMxRecords,
  () => {
    if (allCoreLoaded.value) {
      processDashboardData()
      loadBidFeedItems()
    }
  },
)

watch(
  () => userDataStore.userAccessibleTransactions,
  () => {
    if (allCoreLoaded.value) processDashboardData()
  },
)

watch(
  () => userDataStore.userAccessibleProperties,
  () => {
    if (allCoreLoaded.value) processDashboardData()
  },
)

// Watch for data availability and redirect to loading page if needed
const loadPropertyReminders = async () => {
  try {
    const properties = userDataStore.userAccessibleProperties || []
    if (!properties.length) {
      propertyReminders.value = []
      return
    }
    const reminderGroups = await Promise.all(
      properties.map(async (property) => {
        const remindersForProperty = await getCollectionData(`properties/${property.id}/reminders`)
        return (remindersForProperty || []).map((reminder) => ({
          ...reminder,
          property_id: reminder?.property_id || property.id,
          id: reminder?.id || reminder?.reminder_id,
        }))
      }),
    )
    propertyReminders.value = reminderGroups.flat().filter(Boolean)
  } catch (error) {
    console.error('Failed to load property reminders for feed:', error)
    propertyReminders.value = []
  }
}

// Lifecycle
onMounted(async () => {
  console.log('IndexPage mounted')
  if (typeof window !== 'undefined') {
    const savedViewMode = String(window.localStorage.getItem(FEED_VIEW_MODE_STORAGE_KEY) || '').trim()
    if (savedViewMode === 'list' || savedViewMode === 'tile') {
      feedViewMode.value = savedViewMode
    }
  }
  if (typeof window !== 'undefined' && window.matchMedia) {
    mobileFeedLayoutQuery = window.matchMedia('(max-width: 768px)')
    setMobileFeedLayout(mobileFeedLayoutQuery.matches)
    mobileFeedLayoutHandler = (event) => {
      setMobileFeedLayout(event.matches)
    }
    mobileFeedLayoutQuery.addEventListener('change', mobileFeedLayoutHandler)
  }

  if (userDataStore.isAuthenticated) {
    initialLoadTriggered.value = true

    const hasCoreFeedData =
      (userDataStore.userAccessibleMxRecords || []).length > 0 ||
      (userDataStore.userAccessibleTransactions || []).length > 0 ||
      (userDataStore.userAccessibleLeases || []).length > 0

    if (!hasCoreFeedData) {
      await userDataStore.loadAllUserData()
    }

    processDashboardData()
    await loadBidFeedItems()
  }

  await loadPropertyReminders()
  loadReminders()
  maybeShowDueReminderAlert()
})

onUnmounted(() => {
  if (mobileFeedLayoutQuery && mobileFeedLayoutHandler) {
    mobileFeedLayoutQuery.removeEventListener('change', mobileFeedLayoutHandler)
  }
})

watch(
  () => userDataStore.userAccessibleProperties.length,
  () => {
    loadPropertyReminders()
  },
)

watch(() => reminders.value.length, maybeShowDueReminderAlert)

watch(
  () => route.fullPath,
  () => {
    // Ensure detail shell never blocks navigation lifecycle.
    if (showReminderDetail.value) closeReminderDetail()
    if (showFeedPreview.value) closeFeedPreview()
    if (isIndexHome.value) resetVisibleFeedCount()
  },
)

watch(
  () => [feedSortField.value, feedSortAsc.value],
  () => {
    resetVisibleFeedCount()
  },
)

watch(feedViewMode, (nextValue) => {
  if (typeof window === 'undefined') return
  if (nextValue === 'list' || nextValue === 'tile') {
    window.localStorage.setItem(FEED_VIEW_MODE_STORAGE_KEY, nextValue)
  }
})
</script>

<style scoped>
.pm-po-feed-page {
  padding: 10px;
  background: transparent;
  min-height: 100vh;
}

.feed-shell {
  max-width: 1580px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr);
  gap: 12px;
}

.feed-shell--no-reminders {
  grid-template-columns: minmax(0, 1fr);
}

.feed-reminders,
.feed-main {
  min-width: 0;
}

.feed-reminders {
  grid-column: 1;
  width: 100%;
}

.feed-main {
  grid-column: 2;
}

.feed-shell--no-reminders .feed-main {
  grid-column: 1;
}

.mobile-column-toggle {
  display: none;
}

.mobile-collapsible-column {
  min-width: 0;
}

.reminder-detail-body {
  padding: 20px;
}

.reminder-detail-actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 12px;
}

.reminder-detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.detail-block {
  background: #f8fafc;
  border: 1px solid var(--neutral-200);
  border-radius: var(--border-radius-card);
  padding: 12px 14px;
}

.detail-block.full-width {
  grid-column: 1 / -1;
}

.feed-main-router {
  width: 100%;
}

.feed-main-router :deep(.q-page) {
  padding: 0 !important;
  min-height: auto !important;
  background: transparent !important;
}

.feed-preview-body {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.feed-preview-image {
  width: 100%;
  max-height: 280px;
  border-radius: var(--border-radius-card);
  background: var(--neutral-100);
  border: 1px solid var(--neutral-200);
}

.feed-preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.feed-preview-type-chip {
  background: var(--neutral-100);
  color: var(--neutral-700);
  font-weight: 700;
}

.feed-preview-time {
  font-size: 0.78rem;
  color: var(--neutral-500);
}

.feed-preview-main-text {
  font-size: 0.92rem;
  line-height: 1.5;
  color: var(--neutral-900);
}

.feed-preview-bid {
  font-size: 0.84rem;
  color: #6d28d9;
  font-weight: 600;
}

.feed-preview-empty {
  font-size: 0.82rem;
  color: var(--neutral-500);
  padding: 4px 0 2px;
}

.feed-preview-section {
  border: 1px solid var(--neutral-200);
  border-radius: var(--border-radius-sm);
  padding: 8px;
  background: var(--neutral-50);
}

.feed-preview-section + .feed-preview-section {
  margin-top: 8px;
}

.feed-preview-section-title {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--neutral-700);
  margin-bottom: 6px;
}

.feed-preview-section-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.feed-preview-section-field {
  border: 1px solid var(--neutral-200);
  border-radius: var(--border-radius-sm);
  background: var(--bg-surface);
  padding: 8px 10px;
}

.feed-preview-section-label {
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--neutral-500);
  margin-bottom: 4px;
}

.feed-preview-section-value {
  font-size: 0.82rem;
  color: var(--neutral-900);
  font-weight: 600;
  word-break: break-word;
}

@media (max-width: 900px) {
  .reminder-detail-grid {
    grid-template-columns: 1fr;
  }
  .feed-preview-section-grid {
    grid-template-columns: 1fr;
  }
}

.feed-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.feed-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(188px, 1fr));
  grid-auto-flow: dense;
  gap: 8px;
}

.feed-grid-empty {
  grid-column: 1 / -1;
}

.feed-more-row {
  display: flex;
  justify-content: center;
  margin-top: 8px;
  margin-bottom: 2px;
}

.feed-more-btn {
  min-width: 132px;
}

.feed-context,
.feed-post {
  border-radius: var(--border-radius-card);
  border: 1px solid rgba(36, 59, 83, 0.1);
  background: #ffffff;
  box-shadow: none;
}

.rail-card {
  border-radius: var(--border-radius-card);
  border: 1px solid rgba(36, 59, 83, 0.08);
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(14px);
  box-shadow: var(--shadow-sm);
}

.feed-reminders .rail-card {
  box-shadow: var(--shadow-md) !important;
}

.feed-card-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.feed-card-avatar {
  flex-shrink: 0;
  margin-top: 1px;
}

.feed-card-content {
  flex: 1;
  min-width: 0;
}

.feed-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 6px;
  margin-bottom: 2px;
}

.post-title {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--neutral-900);
  line-height: 1.3;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.post-time {
  font-size: 0.7rem;
  color: var(--neutral-500);
  white-space: nowrap;
  flex-shrink: 0;
  line-height: 1.6;
}

.feed-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 4px;
}

.post-property {
  font-size: 0.72rem;
  color: var(--neutral-500);
  display: flex;
  align-items: center;
  white-space: nowrap;
}

.post-body {
  font-size: 0.8rem;
  color: var(--neutral-800);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.35;
}

.post-amount {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--primary-color);
}

.feed-post-section {
  padding: 10px 12px;
}

.feed-post-clickable {
  cursor: pointer;
  transition:
    box-shadow 0.16s ease,
    transform 0.16s ease,
    border-color 0.16s ease;
}

.feed-post-clickable:hover {
  transform: translateY(-1px);
  border-color: rgba(36, 59, 83, 0.18);
  box-shadow: 0 10px 24px rgba(36, 59, 83, 0.08);
}

.feed-mini-card {
  border-radius: var(--border-radius-card);
}

.feed-tile-card {
  overflow: hidden;
}

.feed-tile-section {
  padding: 0 !important;
}

.feed-tile-thumb {
  width: 100%;
  height: 104px;
  background: linear-gradient(180deg, rgba(238, 242, 248, 0.95), rgba(225, 233, 244, 0.95));
}

.feed-tile-body {
  padding: 9px 10px 10px;
  display: flex;
  flex-direction: column;
  min-height: 96px;
}

.feed-tile-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  margin-bottom: 5px;
}

.feed-tile-type {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 0.68rem;
  font-weight: 700;
  line-height: 1.2;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: var(--neutral-700);
  background: rgba(241, 244, 249, 0.95);
  border: 1px solid rgba(36, 59, 83, 0.06);
}

.feed-tile-type--task {
  color: #1d4ed8;
  background: #dbeafe;
}

.feed-tile-type--transaction {
  color: #047857;
  background: #d1fae5;
}

.feed-tile-type--lease {
  color: #b45309;
  background: #ffedd5;
}

.feed-tile-type--bid {
  color: #6d28d9;
  background: #ede9fe;
}

.feed-tile-title {
  font-size: 0.84rem;
  font-weight: 700;
  color: var(--neutral-900);
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.feed-tile-brief {
  margin-top: 3px;
  font-size: 0.75rem;
  color: var(--neutral-800);
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.feed-tile-meta {
  margin-top: auto;
  padding-top: 6px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
}

.feed-tile--task .feed-tile-body {
  padding: 8px 9px 9px;
}

.feed-tile--task .feed-tile-top {
  gap: 5px;
  margin-bottom: 4px;
}

.feed-tile--task .feed-tile-title {
  font-size: 0.82rem;
  line-height: 1.24;
}

.feed-tile--task .feed-tile-brief {
  margin-top: 2px;
  font-size: 0.73rem;
  line-height: 1.24;
  -webkit-line-clamp: 2;
}

.feed-tile--task .feed-tile-meta {
  padding-top: 5px;
  gap: 5px;
}

.feed-tile--wide {
  grid-column: span 2;
  min-height: 202px;
}

.feed-tile--medium {
  min-height: 164px;
}

.feed-tile--compact {
  min-height: 122px;
}

.feed-tile--tall {
  grid-row: span 2;
}

.feed-tile--feature {
  grid-column: span 2;
  grid-row: span 2;
  min-height: 292px;
}

.feed-tile--task.feed-tile--wide {
  min-height: 190px;
}

.feed-tile--task.feed-tile--feature {
  min-height: 272px;
}

.feed-tile--with-image.feed-tile--tall .feed-tile-thumb {
  height: 142px;
}

.feed-tile--with-image.feed-tile--feature .feed-tile-thumb {
  height: 172px;
}

.feed-tile--task.feed-tile--with-image.feed-tile--feature .feed-tile-thumb {
  height: 156px;
}

.feed-tile--feature .feed-tile-body {
  min-height: 118px;
}

.feed-tile--task.feed-tile--feature .feed-tile-body {
  min-height: 108px;
}

.feed-tile--compact .feed-tile-body {
  min-height: 84px;
}

.feed-tile--compact .feed-tile-brief {
  -webkit-line-clamp: 2;
}

.feed-empty-card {
  border-style: dashed;
}

.reminder-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.reminder-view-all-btn {
  font-size: 0.68rem !important;
  padding: 0 6px !important;
  min-height: 22px !important;
}

.rail-title {
  font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--neutral-800);
}

.reminder-card-compact {
  border-radius: var(--border-radius-card);
  box-shadow: none !important;
  cursor: pointer;
  transition:
    background 0.15s ease,
    transform 0.15s ease,
    border-color 0.15s ease;
}

.reminder-card-compact:hover {
  background: rgba(255, 255, 255, 0.98) !important;
  transform: translateY(-1px);
  border-color: rgba(39, 194, 164, 0.24);
}

.reminder-compact-section {
  padding: 8px 10px !important;
}

.reminder-compact-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
}

.reminder-compact-left {
  flex: 1;
  min-width: 0;
}

.reminder-title {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--neutral-900);
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.reminder-property-name {
  font-size: 0.72rem;
  color: var(--neutral-500);
  display: flex;
  align-items: center;
  margin-top: 2px;
}

.reminder-due-badge {
  font-size: 0.68rem;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 6px;
  white-space: nowrap;
  flex-shrink: 0;
}

.reminder-due-badge.due-overdue {
  background: #ffebee;
  color: #d32f2f;
}

.reminder-due-badge.due-today {
  background: #fff3e0;
  color: #e65100;
}

.reminder-due-badge.due-soon {
  background: #e8f5e9;
  color: #2e7d32;
}

/* Create New Section */
.create-new-card {
  border-radius: var(--border-radius-card);
  border: 1px solid rgba(36, 59, 83, 0.1);
  background: #ffffff;
  box-shadow: none;
}

.create-new-section {
  padding: 14px 18px !important;
}

.create-new-prompt {
  display: flex;
  align-items: center;
  padding: 10px 14px;
  border-radius: var(--border-radius-card);
  background: var(--neutral-50);
  border: 1px solid var(--neutral-200);
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 10px;
}

.create-new-prompt:hover {
  background: var(--neutral-100);
  border-color: var(--neutral-300);
}

.create-new-text {
  font-size: 0.875rem;
  color: var(--neutral-500);
}

.create-new-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: nowrap;
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: thin;
  -webkit-overflow-scrolling: touch;
}

.create-inline-btn {
  font-size: 0.74rem;
  min-height: 30px;
  padding: 0 10px;
  border-radius: 999px;
  white-space: nowrap;
  flex: 0 0 auto;
  box-shadow: 0 8px 18px rgba(36, 59, 83, 0.08);
}

.create-new-actions > .q-btn.feed-sort-btn {
  font-size: 0.78rem;
  color: var(--neutral-700) !important;
  border: 1px solid transparent !important;
  background: rgba(255, 255, 255, 0.52) !important;
  border-radius: 999px !important;
}

.create-new-actions > .q-btn.feed-sort-btn:hover {
  background: rgba(255, 255, 255, 0.96) !important;
  color: var(--primary-color) !important;
  border-color: rgba(36, 59, 83, 0.08) !important;
}

.feed-sort-group {
  display: flex;
  align-items: center;
  gap: 2px;
  flex-shrink: 0;
  flex-wrap: nowrap;
}

.feed-controls-right {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: nowrap;
  justify-content: flex-end;
  flex-shrink: 0;
}

.feed-view-group {
  display: flex;
  align-items: center;
  gap: 2px;
  flex-shrink: 0;
  flex-wrap: nowrap;
}

.feed-sort-label {
  font-size: 0.68rem;
  font-weight: 600;
  color: var(--neutral-500);
  margin-right: 4px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.feed-sort-btn {
  font-size: 0.75rem;
  padding: 2px 6px;
  min-height: 26px;
}

.feed-sort-dropdown :deep(.q-btn__content) {
  gap: 4px;
}

.feed-sort-menu {
  min-width: 140px;
}

.feed-view-btn {
  min-width: 68px;
}

.create-fullscreen-card {
  width: 100%;
  height: 100%;
  border-radius: 0;
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.create-fullscreen-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 16px;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
}

.create-fullscreen-close {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 10;
  background: rgba(255, 255, 255, 0.86);
  backdrop-filter: blur(2px);
}

.create-lease-dialog-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 0;
  padding-bottom: calc(72px + constant(safe-area-inset-bottom));
  padding-bottom: calc(72px + env(safe-area-inset-bottom, 0px));
  scroll-padding-bottom: calc(72px + env(safe-area-inset-bottom, 0px));
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
}

@media (max-width: 1480px) {
  .feed-shell:not(.feed-shell--no-reminders) {
    grid-template-columns: 240px minmax(0, 1fr);
  }
}

@media (max-width: 1280px) {
  .feed-shell:not(.feed-shell--no-reminders) {
    grid-template-columns: 260px minmax(0, 1fr);
  }
}

@media (max-width: 768px) {
  .feed-shell {
    grid-template-columns: 1fr;
    gap: 10px;
  }
  .feed-reminders,
  .feed-main {
    grid-column: auto;
  }
  .mobile-column-toggle {
    display: flex;
    width: 100%;
    min-height: 42px;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 8px 12px;
    border: 1px solid rgba(20, 28, 45, 0.08);
    border-radius: var(--border-radius-card);
    background: rgba(255, 255, 255, 0.92);
    color: #0f172a;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    box-shadow: 0 8px 24px rgba(15, 23, 42, 0.05);
  }
  .mobile-column-count {
    margin-left: auto;
    padding: 2px 8px;
    border-radius: 999px;
    background: #e3f2fd;
    color: #1565c0;
    font-size: 11px;
    font-weight: 700;
  }
  .mobile-collapsible-column {
    margin-top: 8px;
  }
  .mobile-collapsible-column.is-collapsed {
    display: none;
  }
  .feed-list {
    gap: 6px;
  }
  .feed-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 6px;
  }
  .create-new-actions {
    gap: 6px;
    align-items: center;
  }
  .feed-sort-group {
    margin-left: 0;
  }
  .feed-controls-right {
    margin-left: auto;
    justify-content: flex-end;
  }
}

@media (max-width: 560px) {
  .feed-grid {
    grid-template-columns: 1fr;
  }
  .feed-tile--wide,
  .feed-tile--tall,
  .feed-tile--feature {
    grid-column: auto;
    grid-row: auto;
  }
}

.data-loading-page {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    radial-gradient(circle at top left, rgba(39, 194, 164, 0.08), transparent 26%),
    radial-gradient(circle at top right, rgba(26, 22, 18, 0.05), transparent 24%),
    rgba(250, 248, 243, 0.95);
  backdrop-filter: blur(2px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-content {
  text-align: center;
  max-width: 400px;
}

.loading-steps {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 24px;
}

.loading-step {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  border-radius: var(--border-radius-card);
  background: rgba(255, 255, 255, 0.76);
  border: 1px solid rgba(36, 59, 83, 0.08);
  color: var(--neutral-600);
  transition: all 0.3s ease;
}

.loading-step.active {
  background: var(--tag-blue-bg);
  color: var(--primary-color);
}

.loading-step.completed {
  background: var(--tag-blue-alt);
  color: var(--primary-dark);
}

.dashboard-content {
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  background: var(--bg-secondary);
  border-radius: var(--border-radius-card);
  padding: 8px 2px;
}

.dashboard-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.dashboard-grid__full {
  width: 100%;
}

.dashboard-grid__row {
  width: 100%;
}

.dashboard-grid__two-col {
  width: 100%;
}

.page-header .header-title p {
  color: var(--neutral-600);
}

.page-header {
  margin-bottom: 16px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.quick-actions-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: flex-start;
  align-items: center;
}

.quick-action-btn {
  font-weight: 600;
}

.header-title h1 {
  margin: 0;
  color: var(--neutral-900);
}

.header-title p {
  margin: 4px 0 0 0;
}

.refresh-btn {
  margin-left: 16px;
}

.stats-section {
  margin-bottom: 12px;
}

.stat-card {
  height: 110px;
  min-height: 110px;
  border-radius: var(--border-radius-card);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--neutral-300);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: var(--bg-surface);
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 26px rgba(0, 0, 0, 0.14);
  border-color: var(--neutral-400);
}

.stat-card__content {
  display: flex;
  align-items: center;
  height: 100%;
  padding: 16px;
}

.stat-card__icon {
  margin-right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: var(--border-radius-card);
  background: var(--primary-glow);
}

.income-card .stat-card__icon {
  background: rgba(76, 175, 80, 0.1);
}

.expense-card .stat-card__icon {
  background: rgba(244, 67, 54, 0.1);
}

.tasks-card .stat-card__icon {
  background: rgba(255, 152, 0, 0.1);
}

.leases-card .stat-card__icon {
  background: rgba(33, 150, 243, 0.1);
}

.stat-card__info {
  flex: 1;
}

.stat-card__value {
  font-size: 1.5rem !important;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 4px;
  color: var(--neutral-900);
  letter-spacing: -0.02em;
}

.stat-card__label {
  font-size: 0.8125rem !important;
  line-height: 1.4;
  color: var(--neutral-600);
  margin: 0;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.dashboard-sections {
  margin-bottom: 24px;
}

.dashboard-section {
  border-radius: var(--border-radius-card);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
  background: var(--bg-surface);
  border: 1px solid var(--neutral-300);
  transition: all 0.3s ease;
  overflow: hidden;
  height: 100%;
}

.dashboard-section:hover {
  box-shadow: 0 10px 26px rgba(0, 0, 0, 0.14);
  border-color: var(--neutral-400);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--neutral-200);
  background: var(--bg-surface);
}

.section-header-inline {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  flex-wrap: wrap;
  gap: 8px;
}

.section-title {
  display: flex;
  align-items: center;
  font-weight: 600;
  color: var(--neutral-900);
  font-size: 1.125rem;
  letter-spacing: -0.01em;
}

.section-content {
  padding: 16px 20px;
  background: var(--bg-surface);
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #666;
}

.records-list,
.transactions-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.record-item,
.transaction-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  background: var(--bg-surface);
  border-radius: var(--border-radius-card);
  border: 1px solid var(--neutral-300);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  margin-bottom: 4px;
}

.record-item:hover,
.transaction-item:hover {
  background: var(--bg-secondary);
  border-color: var(--primary-color);
  transform: translateX(4px);
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.1);
}

.record-item.clickable {
  cursor: pointer;
  transition: all 0.2s ease;
}

.record-item.clickable:hover {
  background: var(--accent-glow);
  border-color: var(--accent-color);
  transform: translateY(-1px);
}

.transaction-item.clickable {
  cursor: pointer;
  transition: all 0.2s ease;
}

.transaction-item.clickable:hover {
  background: var(--accent-glow);
  border-color: var(--accent-color);
  transform: translateY(-1px);
}

.transaction-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  gap: 8px;
}

.transaction-details {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.record-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  gap: 8px;
}

.record-description {
  flex: 1;
  font-weight: 600;
  color: var(--neutral-900);
  font-size: 0.9375rem;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.record-details {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.record-info,
.transaction-info {
  flex: 1;
}

.record-title,
.transaction-title {
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 4px;
}

.record-meta,
.transaction-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.record-amount,
.transaction-amount {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1a1a1a;
}

.quick-actions-fab {
  box-shadow: 0 4px 16px var(--accent-glow);
}

.quick-actions-dialog {
  border-radius: 8px !important;
  min-width: 340px;
  max-width: 380px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.quick-actions-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px !important;
  border-bottom: 1px solid var(--neutral-200);
}

.quick-actions-grid-section {
  padding: 16px !important;
}

.quick-actions-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.grid-action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 14px 6px;
  border-radius: var(--border-radius-card);
  border: 1px solid transparent;
  background: transparent;
  cursor: pointer;
  transition: all 0.18s ease;
}

.grid-action-item:hover {
  background: var(--neutral-50, #f8f9fa);
  border-color: var(--neutral-200, #e5e7eb);
  transform: translateY(-1px);
}

.grid-action-item:active {
  transform: scale(0.96);
}

.grid-action-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--border-radius-card);
  display: flex;
  align-items: center;
  justify-content: center;
}

.grid-action-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--neutral-700);
  text-align: center;
  line-height: 1.2;
}

/* Button Text Styling - Use outline style colors */
.btn-primary,
.btn-secondary,
.refresh-btn {
  font-weight: 600 !important;
  /* Color is handled by global button styles - no override needed */
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .dashboard-page {
    padding: 10px;
  }

  .header-content {
    gap: 8px;
  }

  .quick-actions-bar {
    gap: 8px;
  }

  .stat-card__value {
    font-size: 1.1rem !important;
  }

  .stat-card__label {
    font-size: 0.7rem !important;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .record-item,
  .transaction-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .record-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .record-description {
    white-space: normal;
    overflow: visible;
    text-overflow: unset;
  }

  .record-details {
    width: 100%;
    justify-content: space-between;
  }

  .transaction-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .transaction-details {
    width: 100%;
    justify-content: space-between;
  }
}

/* Dialog Styles */
.linkedin-dialog-card {
  border-radius: 8px !important;
  border: 1px solid var(--neutral-200);
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.14);
  background: #fff;
  max-height: 92vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.dialog-header {
  background: #f7f9fb;
  border-bottom: 1px solid var(--neutral-200);
  padding: 10px 12px !important;
}

.linkedin-dialog-body {
  padding: 10px !important;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.dialog-close-btn {
  color: #666;
}

.dialog-close-btn:hover {
  background: rgba(0, 0, 0, 0.1);
}

/* Legacy reminder styles removed — compact reminder styles are above */

/* Renewal History Dialog Styles */
.renewal-reminder-info {
  background: #f8f9fa;
  padding: 16px;
  border-radius: var(--border-radius-sm);
  border-left: 4px solid var(--accent-color);
}

.due-reminder-dialog {
  border-radius: 8px !important;
}

.renewal-details {
  background: #f8f9fa;
  padding: 12px;
  border-radius: 6px;
}

.renewal-detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
  border-bottom: 1px solid var(--border-color);
}

.renewal-detail-item:last-child {
  border-bottom: none;
}

.detail-label {
  font-size: 0.875rem;
  color: #666;
  font-weight: 500;
}

.detail-value {
  font-size: 0.9rem;
  color: #1a1a1a;
  font-weight: 600;
}

.cursor-pointer {
  cursor: pointer;
  transition: all 0.2s ease;
}

.cursor-pointer:hover {
  transform: scale(1.05);
}

/* ========================================
   DARK MODE STYLES
   ======================================== */

:global(body.body--dark) .pm-po-feed-page {
  background:
    radial-gradient(circle at top left, rgba(45, 212, 191, 0.1), transparent 24%),
    radial-gradient(circle at top right, rgba(94, 234, 212, 0.06), transparent 20%),
    #0f172a !important;
}

:global(body.body--dark) .mobile-column-toggle {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.92);
}

:global(body.body--dark) .mobile-column-count {
  background: rgba(144, 202, 249, 0.16);
  color: rgba(187, 222, 251, 0.95);
}

:global(body.body--dark) .data-loading-page {
  background: rgba(18, 18, 18, 0.95) !important;
}

:global(body.body--dark) .loading-step {
  background: var(--bg-tertiary) !important;
  color: white !important;
}

:global(body.body--dark) .loading-step.active {
  background: var(--accent-glow) !important;
  color: var(--accent-light) !important;
}

:global(body.body--dark) .loading-step.completed {
  background: rgba(76, 175, 80, 0.2) !important;
  color: #4caf50 !important;
}

:global(body.body--dark) .header-title h1 {
  color: white !important;
}

:global(body.body--dark) .stat-card {
  background: var(--bg-surface) !important;
  border-color: var(--border-color) !important;
}

:global(body.body--dark) .stat-card__value {
  color: white !important;
}

:global(body.body--dark) .stat-card__label {
  color: #ffffff !important;
}

:global(body.body--dark) .stat-card__icon {
  background: var(--bg-tertiary) !important;
}

:global(body.body--dark) .dashboard-section {
  background: var(--bg-surface) !important;
  border-color: var(--border-color) !important;
}

:global(body.body--dark) .section-header {
  background: var(--bg-surface) !important;
  border-color: var(--border-color) !important;
}

:global(body.body--dark) .section-title {
  color: white !important;
}

:global(body.body--dark) .section-content {
  background: var(--bg-surface) !important;
}

:global(body.body--dark) .record-item,
:global(body.body--dark) .transaction-item {
  background: var(--bg-tertiary) !important;
  border-color: var(--border-color) !important;
}

:global(body.body--dark) .record-item:hover,
:global(body.body--dark) .transaction-item:hover {
  background: rgba(45, 212, 191, 0.16) !important;
  border-color: var(--accent-color) !important;
}

:global(body.body--dark) .record-description,
:global(body.body--dark) .record-title,
:global(body.body--dark) .transaction-title {
  color: white !important;
}

:global(body.body--dark) .record-amount,
:global(body.body--dark) .transaction-amount {
  color: white !important;
}

:global(body.body--dark) .empty-state {
  color: #ffffff !important;
}

:global(body.body--dark) .quick-actions-dialog {
  background: var(--bg-surface) !important;
}

:global(body.body--dark) .linkedin-dialog-card {
  background: var(--bg-surface) !important;
  border-color: var(--border-color) !important;
}

:global(body.body--dark) .quick-actions-header {
  background: var(--bg-tertiary) !important;
  border-color: var(--border-color) !important;
}

:global(body.body--dark) .grid-action-item:hover {
  background: var(--bg-tertiary);
  border-color: var(--border-color);
}

:global(body.body--dark) .grid-action-label {
  color: var(--neutral-300);
}

:global(body.body--dark) .dialog-header {
  background: #1f2937 !important;
  border-color: var(--border-color) !important;
}

:global(body.body--dark) .dialog-close-btn {
  color: white !important;
}

:global(body.body--dark) .reminders-card {
  background: var(--bg-surface) !important;
  border-color: var(--border-color) !important;
}

:global(body.body--dark) .reminder-card {
  background: var(--bg-surface) !important;
  border-color: var(--border-color) !important;
}

:global(body.body--dark) .reminder-card.reminder-overdue {
  background: rgba(244, 67, 54, 0.1) !important;
}

:global(body.body--dark) .create-new-card {
  background: linear-gradient(180deg, rgba(23, 34, 51, 0.96), rgba(18, 28, 43, 0.92)) !important;
  border-color: rgba(255, 255, 255, 0.12) !important;
  box-shadow: 0 20px 44px rgba(2, 8, 23, 0.34) !important;
}

:global(body.body--dark) .create-new-card .q-card__section,
:global(body.body--dark) .create-new-section {
  background: transparent !important;
  color: #e5eef7 !important;
}

:global(body.body--dark) .create-new-actions,
:global(body.body--dark) .feed-controls-right,
:global(body.body--dark) .feed-sort-group,
:global(body.body--dark) .feed-view-group {
  background: transparent !important;
}

:global(body.body--dark) .create-inline-btn {
  background: rgba(45, 212, 191, 0.16) !important;
  border: 1px solid rgba(45, 212, 191, 0.26) !important;
  color: #ccfbf1 !important;
  box-shadow: none !important;
}

:global(body.body--dark) .create-inline-btn:hover {
  background: rgba(45, 212, 191, 0.24) !important;
  border-color: rgba(94, 234, 212, 0.38) !important;
  color: #ecfeff !important;
}

:global(body.body--dark) .feed-sort-label {
  color: rgba(255, 255, 255, 0.62) !important;
}

:global(body.body--dark) .create-new-actions > .q-btn.feed-sort-btn {
  background: rgba(15, 23, 42, 0.74) !important;
  border-color: rgba(148, 163, 184, 0.16) !important;
  color: #e2e8f0 !important;
}

:global(body.body--dark) .create-new-actions > .q-btn.feed-sort-btn:hover {
  background: rgba(45, 212, 191, 0.16) !important;
  border-color: rgba(45, 212, 191, 0.24) !important;
  color: #ccfbf1 !important;
}

:global(body.body--dark) .feed-sort-menu {
  background: #172233 !important;
  color: #f8fafc !important;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: var(--border-radius-card);
}

:global(body.body--dark) .feed-sort-menu .q-item {
  color: #f8fafc !important;
}

:global(body.body--dark) .feed-sort-menu .q-item:hover {
  background: rgba(45, 212, 191, 0.12) !important;
}

:global(body.body--dark) .reminder-title {
  color: white !important;
}

:global(body.body--dark) .reminder-description {
  color: #ffffff !important;
}

:global(body.body--dark) .reminder-date {
  color: #ffffff !important;
}

:global(body.body--dark) .carousel-dot {
  background: #4a4a4a !important;
}

:global(body.body--dark) .carousel-dot.active {
  background: var(--accent-color) !important;
}

:global(body.body--dark) .reminders-carousel::-webkit-scrollbar-thumb {
  background: #4a4a4a !important;
}

:global(body.body--dark) .empty-reminders {
  background: transparent !important;
  color: #ffffff !important;
}

:global(body.body--dark) .renewal-reminder-info {
  background: var(--bg-tertiary) !important;
}

:global(body.body--dark) .renewal-details {
  background: var(--bg-tertiary) !important;
}

:global(body.body--dark) .renewal-detail-item {
  border-color: var(--border-color) !important;
}

:global(body.body--dark) .detail-label {
  color: #ffffff !important;
}

:global(body.body--dark) .detail-value {
  color: white !important;
}

:global(body.body--dark) .feed-preview-time {
  color: #cbd5e1 !important;
}

:global(body.body--dark) .feed-preview-main-text {
  color: #f8fafc !important;
}

:global(body.body--dark) .feed-preview-section-field {
  background: var(--bg-tertiary) !important;
  border-color: var(--border-color) !important;
}

:global(body.body--dark) .feed-preview-section {
  background: rgba(255, 255, 255, 0.03) !important;
  border-color: var(--border-color) !important;
}

:global(body.body--dark) .feed-preview-section-title,
:global(body.body--dark) .feed-preview-section-label,
:global(body.body--dark) .feed-preview-empty {
  color: #cbd5e1 !important;
}

:global(body.body--dark) .feed-preview-section-value {
  color: #f8fafc !important;
}
</style>
