<template>
  <q-page class="dashboard-page">
    <!-- Loading State -->
    <div v-if="!dataLoaded" class="data-loading-page">
      <div class="loading-content">
        <q-spinner size="4em" color="primary" />
        <div class="text-h4 q-mt-md">Loading Dashboard</div>
        <div class="text-h6 q-mt-sm text-grey-6">Please wait while we load your data...</div>

        <!-- Loading Steps -->
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
        </div>
      </div>
    </div>

    <!-- Main Dashboard Content -->
    <div v-else class="dashboard-content">
      <!-- Page Header -->
      <div class="page-header">
        <div class="header-content">
          <div class="header-title">
            <h1 class="text-h4 text-weight-bold">Dashboard</h1>
            <p class="text-subtitle1 text-grey-6">Welcome back!</p>
          </div>
          <div class="header-actions">
            <div class="row q-gutter-sm items-center">
              <div class="col-auto">
                <q-btn
                  label="Create Property"
                  color="primary"
                  text-color="white"
                  @click="showCreatePropertyDialog = true"
                  icon="home_work"
                  unelevated
                />
              </div>
              <div class="col-auto">
                <q-btn
                  label="Create Lease"
                  color="primary"
                  text-color="white"
                  @click="showCreateLeaseDialog = true"
                  icon="assignment"
                  unelevated
                />
              </div>
              <div class="col-auto">
                <q-btn
                  label="Create Transaction"
                  color="primary"
                  text-color="white"
                  @click="showCreateTransactionDialog = true"
                  icon="receipt"
                  unelevated
                />
              </div>
              <div class="col-auto">
                <q-btn
                  label="Create Task"
                  color="primary"
                  text-color="white"
                  @click="showCreateTaskDialog = true"
                  icon="dns"
                  unelevated
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Stats Cards -->
      <div class="stats-section">
        <div class="row" style="margin: 5px">
          <div class="col-12 col-sm-6 col-md-3">
            <q-card class="stat-card income-card">
              <q-card-section class="stat-card__content">
                <div class="stat-card__icon">
                  <q-icon name="arrow_circle_up" size="24px" color="positive" />
                </div>
                <div class="stat-card__info">
                  <div class="stat-card__value">${{ formatCurrency(monthlyIncome) }}</div>
                  <div class="stat-card__label">Monthly Income</div>
                </div>
              </q-card-section>
            </q-card>
          </div>

          <div class="col-12 col-sm-6 col-md-3">
            <q-card class="stat-card expense-card">
              <q-card-section class="stat-card__content">
                <div class="stat-card__icon">
                  <q-icon name="arrow_circle_down" size="24px" color="negative" />
                </div>
                <div class="stat-card__info">
                  <div class="stat-card__value">${{ formatCurrency(monthlyExpense) }}</div>
                  <div class="stat-card__label">Monthly Expense</div>
                </div>
              </q-card-section>
            </q-card>
          </div>

          <div class="col-12 col-sm-6 col-md-3">
            <q-card class="stat-card tasks-card">
              <q-card-section class="stat-card__content">
                <div class="stat-card__icon">
                  <q-icon name="assignment" size="24px" color="warning" />
                </div>
                <div class="stat-card__info">
                  <div class="stat-card__value">{{ openTasks }}</div>
                  <div class="stat-card__label">Open Tasks</div>
                </div>
              </q-card-section>
            </q-card>
          </div>

          <div class="col-12 col-sm-6 col-md-3">
            <q-card class="stat-card leases-card">
              <q-card-section class="stat-card__content">
                <div class="stat-card__icon">
                  <q-icon name="home_work" size="24px" color="info" />
                </div>
                <div class="stat-card__info">
                  <div class="stat-card__value">{{ activeLeases }}</div>
                  <div class="stat-card__label">Active Leases</div>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>

      <!-- Dashboard Sections -->
      <div class="dashboard-sections">
        <div class="row">
          <!-- Left Column -->
          <div class="col-sm-6 col-lg-6">
            <!-- Recent Tasks -->
            <q-card class="dashboard-section">
              <q-card-section class="section-header">
                <div class="section-title">
                  <q-icon name="build" size="24px" color="primary" />
                  <span class="text-h6 q-ml-sm">Recent Tasks</span>
                </div>
              </q-card-section>

              <q-card-section class="section-content">
                <div v-if="recentMxRecords.length === 0" class="empty-state">
                  <q-icon name="build" size="48px" color="grey-4" />
                  <div class="text-h6 text-grey-6 q-mt-md">No Tasks</div>
                  <div class="text-caption text-grey-5">Create your first maintenance task</div>
                </div>

                <div v-else class="records-list">
                  <div
                    v-for="record in recentMxRecords.slice(0, 3)"
                    :key="record.id"
                    class="record-item clickable"
                    @click="viewMxRecordDetail(record)"
                  >
                    <div class="record-content">
                      <div class="record-description">
                        {{ record.description || 'No description available' }}
                      </div>
                      <div class="record-details">
                        <q-chip
                          :color="getStatusColor(record.status)"
                          text-color="white"
                          size="sm"
                          dense
                        >
                          {{ record.status || 'Open' }}
                        </q-chip>
                        <span class="text-caption text-grey-6 q-mx-sm">
                          {{ formatDate(record.report_date) }}
                        </span>
                        <span class="text-caption text-weight-bold text-primary">
                          ${{ formatCurrency(record.amount || 0) }}
                        </span>
                        <q-icon name="chevron_right" size="16px" color="grey-5" class="q-ml-sm" />
                      </div>
                    </div>
                  </div>
                </div>
              </q-card-section>
              <q-card-actions align="center" class="q-pa-md">
                <q-btn
                  dense
                  label="View All"
                  color="primary"
                  text-color="white"
                  class="btn-primary"
                  @click="$router.push('/mx-records')"
                />
              </q-card-actions>
            </q-card>
          </div>

          <!-- Right Column -->
          <div class="col-sm-6 col-lg-6">
            <!-- Recent Transactions -->
            <q-card class="dashboard-section">
              <q-card-section class="section-header">
                <div class="section-title">
                  <q-icon name="receipt" size="24px" color="primary" />
                  <span class="text-h6 q-ml-sm">Recent Transactions</span>
                </div>
              </q-card-section>

              <q-card-section class="section-content">
                <div v-if="recentTransactions.length === 0" class="empty-state">
                  <q-icon name="receipt" size="48px" color="grey-4" />
                  <div class="text-h6 text-grey-6 q-mt-md">No Transactions</div>
                  <div class="text-caption text-grey-5">
                    Your recent transactions will appear here
                  </div>
                </div>

                <div v-else class="transactions-list">
                  <div
                    v-for="transaction in recentTransactions.slice(0, 3)"
                    :key="transaction.id"
                    class="transaction-item clickable"
                    @click="viewTransactionDetail(transaction)"
                  >
                    <div class="transaction-content">
                      <div class="transaction-details">
                        <q-chip
                          :color="getTransactionTypeColor(transaction.transac_type)"
                          text-color="white"
                          size="sm"
                          dense
                        >
                          {{ transaction.transac_type || 'Payment' }}
                        </q-chip>
                        <span class="text-caption text-grey-6 q-mx-sm">
                          {{ formatDate(transaction.transac_date) }}
                        </span>
                        <span class="text-caption text-grey-6 q-mx-sm">
                          {{ transaction.transac_from || 'N/A' }} →
                          {{ transaction.transac_to || 'N/A' }}
                        </span>
                        <span
                          class="text-caption text-weight-bold"
                          :class="getTransactionAmountColor(transaction.transac_type)"
                        >
                          ${{ formatCurrency(transaction.amount || 0) }}
                        </span>
                        <q-icon name="chevron_right" size="16px" color="grey-5" class="q-ml-sm" />
                      </div>
                    </div>
                  </div>
                </div>
              </q-card-section>
              <q-card-actions align="center" class="q-pa-md">
                <q-btn
                  dense
                  label="View All"
                  color="primary"
                  text-color="white"
                  class="btn-primary"
                  @click="$router.push('/transactions')"
                />
              </q-card-actions>
            </q-card>
          </div>
        </div>
      </div>

      <!-- Reminders Card -->
      <div class="reminders-section q-pa-md">
        <div class="row">
          <div class="col-12">
            <q-card class="reminders-card">
              <q-card-section>
                <div class="text-h6 q-mb-md">
                  <q-icon name="notifications" class="q-mr-sm" />
                  Reminders
                </div>

                <!-- Reminders Grid -->
                <div v-if="reminders.length > 0" class="reminders-grid">
                  <q-card
                    v-for="reminder in reminders.slice(0, 6)"
                    :key="reminder.id"
                    class="reminder-card"
                    :class="{ 'reminder-overdue': isReminderOverdue(reminder) }"
                  >
                    <q-card-section class="reminder-card-content">
                      <!-- Reminder Header -->
                      <div class="reminder-header">
                        <div class="reminder-title">{{ reminder.title }}</div>
                        <div class="reminder-actions-header">
                          <q-btn
                            flat
                            round
                            dense
                            icon="refresh"
                            color="primary"
                            size="sm"
                            class="reminder-renew-btn"
                            @click="renewReminder(reminder)"
                          >
                            <q-tooltip>Defer reminder</q-tooltip>
                          </q-btn>
                          <q-btn
                            flat
                            round
                            dense
                            icon="check_circle"
                            color="primary"
                            size="sm"
                            class="reminder-complete-btn"
                            @click="markReminderComplete(reminder)"
                          >
                            <q-tooltip>Mark as complete</q-tooltip>
                          </q-btn>
                        </div>
                      </div>

                      <!-- Reminder Description -->
                      <div class="reminder-description">{{ reminder.description }}</div>

                      <!-- Reminder Footer -->
                      <div class="reminder-footer">
                        <div class="reminder-date">
                          <q-icon name="event" size="12px" class="q-mr-xs" />
                          <span>{{ formatReminderDate(reminder.due_date) }}</span>
                          <q-badge
                            v-if="reminder.renewals && reminder.renewals.length > 0"
                            color="orange"
                            :label="`${reminder.renewals.length}x`"
                            class="q-ml-xs cursor-pointer"
                            @click.stop="viewRenewalHistory(reminder)"
                          >
                            <q-tooltip>Click to view renewal history</q-tooltip>
                          </q-badge>
                        </div>
                        <q-chip
                          v-if="reminder.property_name"
                          size="xs"
                          color="primary"
                          text-color="white"
                        >
                          {{ reminder.property_name }}
                        </q-chip>
                      </div>
                    </q-card-section>
                  </q-card>
                </div>

                <!-- Empty State -->
                <div v-else class="empty-reminders text-center q-pa-lg">
                  <q-icon name="notifications_off" size="48px" color="grey-4" />
                  <div class="text-body2 text-grey-6 q-mt-sm">No reminders</div>
                  <div class="text-caption text-grey-5">All caught up!</div>
                </div>

                <!-- View All Button -->
                <div v-if="reminders.length > 5" class="text-center q-mt-md">
                  <q-btn
                    flat
                    color="primary"
                    label="View All Reminders"
                    @click="$router.push('/reminders')"
                  />
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>

      <!-- Quick Actions Dialog -->
      <q-dialog v-model="showQuickActions" position="bottom">
        <q-card class="quick-actions-dialog">
          <q-card-section class="text-h6 text-center">Quick Actions</q-card-section>
          <q-card-section class="q-pt-none">
            <div class="row q-gutter-sm">
              <div class="col-6">
                <q-btn
                  label="Create Property"
                  color="primary"
                  text-color="white"
                  class="btn-primary full-width"
                  @click="openCreatePropertyDialog"
                />
              </div>
              <div class="col-6">
                <q-btn
                  label="Create Lease"
                  color="primary"
                  text-color="white"
                  class="btn-primary full-width"
                  @click="openCreateLeaseDialog"
                />
              </div>
              <div class="col-6">
                <q-btn
                  label="Add Transaction"
                  color="primary"
                  text-color="white"
                  class="btn-primary full-width"
                  @click="openCreateTransactionDialog"
                />
              </div>
              <div class="col-6">
                <q-btn
                  label="Create Task"
                  color="primary"
                  text-color="white"
                  class="btn-primary full-width"
                  @click="openCreateTaskDialog"
                />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </q-dialog>

      <!-- Task Detail Dialog -->
      <q-dialog v-model="showMxRecordDetail" position="standard">
        <q-card class="mx-record-detail-dialog" style="min-width: 500px; max-width: 800px">
          <q-card-section class="row items-center q-pb-none">
            <div class="text-h6">Task Details</div>
            <q-space />
            <q-btn icon="close" flat round dense color="primary" v-close-popup />
          </q-card-section>

          <q-card-section v-if="selectedMxRecord" class="q-pt-none">
            <div class="row q-gutter-md">
              <div class="col-12">
                <q-chip
                  :color="getStatusColor(selectedMxRecord.status)"
                  text-color="white"
                  size="md"
                  class="q-mb-md"
                >
                  {{ selectedMxRecord.status || 'Open' }}
                </q-chip>
              </div>

              <div class="col-12 col-md-6">
                <div class="text-caption text-grey-6">Property</div>
                <div class="text-body1">{{ getPropertyName(selectedMxRecord.property_id) }}</div>
              </div>

              <div class="col-12 col-md-6">
                <div class="text-caption text-grey-6">Amount</div>
                <div class="text-body1 text-weight-bold">
                  ${{ formatCurrency(selectedMxRecord.amount || 0) }}
                </div>
              </div>

              <div class="col-12 col-md-6">
                <div class="text-caption text-grey-6">Report Date</div>
                <div class="text-body1">{{ formatDate(selectedMxRecord.report_date) }}</div>
              </div>

              <div class="col-12 col-md-6">
                <div class="text-caption text-grey-6">Priority</div>
                <div class="text-body1">{{ selectedMxRecord.priority || 'Medium' }}</div>
              </div>

              <div class="col-12" v-if="selectedMxRecord.description">
                <div class="text-caption text-grey-6">Description</div>
                <div class="text-body1">{{ selectedMxRecord.description }}</div>
              </div>

              <div class="col-12" v-if="selectedMxRecord.notes">
                <div class="text-caption text-grey-6">Notes</div>
                <div class="text-body1">{{ selectedMxRecord.notes }}</div>
              </div>
            </div>
          </q-card-section>

          <q-card-actions align="right" class="q-pa-md">
            <q-btn flat label="Close" color="primary" v-close-popup />
            <q-btn
              label="Add Log"
              color="primary"
              text-color="white"
              class="btn-primary"
              icon="add_comment"
              @click="addLogToMxRecord(selectedMxRecord)"
            />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <!-- Transaction Detail Dialog -->
      <q-dialog v-model="showTransactionDetail" position="standard">
        <q-card class="transaction-detail-dialog" style="min-width: 500px; max-width: 800px">
          <q-card-section class="row items-center q-pb-none">
            <div class="text-h6">Transaction Details</div>
            <q-space />
            <q-btn icon="close" flat round dense color="primary" v-close-popup />
          </q-card-section>

          <q-card-section v-if="selectedTransaction" class="q-pt-none">
            <div class="row q-gutter-md">
              <div class="col-12">
                <q-chip
                  :color="getTransactionTypeColor(selectedTransaction.transac_type)"
                  text-color="white"
                  size="md"
                  class="q-mb-md"
                >
                  {{ selectedTransaction.transac_type || 'Payment' }}
                </q-chip>
              </div>

              <div class="col-12 col-md-6">
                <div class="text-caption text-grey-6">From</div>
                <div class="text-body1">{{ selectedTransaction.transac_from || 'N/A' }}</div>
              </div>

              <div class="col-12 col-md-6">
                <div class="text-caption text-grey-6">To</div>
                <div class="text-body1">{{ selectedTransaction.transac_to || 'N/A' }}</div>
              </div>

              <div class="col-12 col-md-6">
                <div class="text-caption text-grey-6">Amount</div>
                <div
                  class="text-body1 text-weight-bold"
                  :class="getTransactionAmountColor(selectedTransaction.transac_type)"
                >
                  ${{ formatCurrency(selectedTransaction.amount || 0) }}
                </div>
              </div>

              <div class="col-12 col-md-6">
                <div class="text-caption text-grey-6">Date</div>
                <div class="text-body1">{{ formatDate(selectedTransaction.transac_date) }}</div>
              </div>

              <div class="col-12 col-md-6">
                <div class="text-caption text-grey-6">Property</div>
                <div class="text-body1">{{ getPropertyName(selectedTransaction.property_id) }}</div>
              </div>

              <div class="col-12 col-md-6">
                <div class="text-caption text-grey-6">Lease ID</div>
                <div class="text-body1">{{ selectedTransaction.lease_id || 'N/A' }}</div>
              </div>

              <div class="col-12 col-md-6">
                <div class="text-caption text-grey-6">Role</div>
                <div class="text-body1">{{ selectedTransaction.role || 'N/A' }}</div>
              </div>

              <div class="col-12 col-md-6">
                <div class="text-caption text-grey-6">Transaction ID</div>
                <div class="text-body1">{{ selectedTransaction.transac_id || 'N/A' }}</div>
              </div>
            </div>
          </q-card-section>

          <q-card-actions align="right" class="q-pa-md">
            <q-btn flat label="Close" color="primary" v-close-popup />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <!-- Create Property Dialog -->
      <q-dialog v-model="showCreatePropertyDialog" persistent>
        <q-card style="min-width: 600px; max-width: 800px">
          <q-card-section class="dialog-header">
            <div class="row items-center justify-between">
              <div class="text-h6">Create Property</div>
              <q-btn
                flat
                round
                dense
                icon="close"
                color="primary"
                @click="showCreatePropertyDialog = false"
                class="dialog-close-btn"
              />
            </div>
          </q-card-section>
          <q-card-section>
            <CreateProperty
              @property-created="onPropertyCreated"
              @cancel="showCreatePropertyDialog = false"
            />
          </q-card-section>
        </q-card>
      </q-dialog>

      <!-- Create Task Dialog -->
      <q-dialog v-model="showCreateTaskDialog" persistent>
        <q-card style="min-width: 600px; max-width: 800px">
          <q-card-section class="dialog-header">
            <div class="row items-center justify-between">
              <div class="text-h6">Create Task</div>
              <q-btn
                flat
                round
                dense
                icon="close"
                color="primary"
                @click="showCreateTaskDialog = false"
                class="dialog-close-btn"
              />
            </div>
          </q-card-section>
          <q-card-section>
            <CreateMxRecord
              @mxrecord-created="onTaskCreated"
              @cancel="showCreateTaskDialog = false"
            />
          </q-card-section>
        </q-card>
      </q-dialog>

      <!-- Create Transaction Dialog -->
      <q-dialog v-model="showCreateTransactionDialog" persistent>
        <q-card style="min-width: 600px; max-width: 800px">
          <q-card-section class="dialog-header">
            <div class="row items-center justify-between">
              <div class="text-h6">Create Transaction</div>
              <q-btn
                flat
                round
                dense
                icon="close"
                color="primary"
                @click="showCreateTransactionDialog = false"
                class="dialog-close-btn"
              />
            </div>
          </q-card-section>
          <q-card-section>
            <CreateTransaction
              @transaction-created="onTransactionCreated"
              @cancel="showCreateTransactionDialog = false"
            />
          </q-card-section>
        </q-card>
      </q-dialog>

      <!-- Create Lease Dialog -->
      <q-dialog v-model="showCreateLeaseDialog" persistent>
        <q-card style="min-width: 600px; max-width: 800px">
          <q-card-section class="dialog-header">
            <div class="row items-center justify-between">
              <div class="text-h6">Create Lease</div>
              <q-btn
                flat
                round
                dense
                icon="close"
                color="primary"
                @click="showCreateLeaseDialog = false"
                class="dialog-close-btn"
              />
            </div>
          </q-card-section>
          <q-card-section>
            <CreateLease @lease-created="onLeaseCreated" @cancel="showCreateLeaseDialog = false" />
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
                selectedReminderForHistory.renewals &&
                selectedReminderForHistory.renewals.length > 0
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
                      <span class="detail-value">{{
                        formatReminderDate(renewal.new_due_date)
                      }}</span>
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
                      selectedReminderForHistory.created_date ||
                        selectedReminderForHistory.due_date,
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
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUserDataStore } from '../stores/userDataStore'
import { Notify } from 'quasar'
import CreateProperty from '../components/CreateProperty.vue'
import CreateMxRecord from '../components/CreateMxRecord.vue'
import CreateTransaction from '../components/CreateTransaction.vue'
import CreateLease from '../components/CreateLease.vue'

const router = useRouter()

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
const showQuickActions = ref(false)
const showMxRecordDetail = ref(false)
const selectedMxRecord = ref(null)
const showTransactionDetail = ref(false)
const selectedTransaction = ref(null)

// Reminders data
const reminders = ref([])
const dataLoaded = ref(false)

// Dialog states for create forms
const showCreatePropertyDialog = ref(false)
const showCreateTaskDialog = ref(false)
const showCreateTransactionDialog = ref(false)
const showCreateLeaseDialog = ref(false)

// Renewal history dialog
const showRenewalHistoryDialog = ref(false)
const selectedReminderForHistory = ref(null)

// Quick stats computed properties
const monthlyIncome = computed(() => {
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()

  return userDataStore.userAccessibleTransactions
    .filter((t) => {
      const transactionDate = new Date(t.date)
      return (
        transactionDate.getMonth() === currentMonth &&
        transactionDate.getFullYear() === currentYear &&
        t.type === 'income'
      )
    })
    .reduce((sum, t) => sum + (t.amount || 0), 0)
})

const monthlyExpense = computed(() => {
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()

  return userDataStore.userAccessibleTransactions
    .filter((t) => {
      const transactionDate = new Date(t.date)
      return (
        transactionDate.getMonth() === currentMonth &&
        transactionDate.getFullYear() === currentYear &&
        t.type === 'expense'
      )
    })
    .reduce((sum, t) => sum + (t.amount || 0), 0)
})

const openTasks = computed(() => {
  return userDataStore.userAccessibleMxRecords.filter((mx) => !mx.status || mx.status === 'open')
    .length
})

const activeLeases = computed(() => {
  return userDataStore.userAccessibleLeases.filter(
    (lease) => lease.status === 'active' || lease.status === 'occupied',
  ).length
})

// Process dashboard data
const processDashboardData = () => {
  console.log('Processing dashboard data...')

  // Get recent tasks (last 5)
  recentMxRecords.value = userDataStore.userAccessibleMxRecords
    .sort((a, b) => new Date(b.report_date) - new Date(a.report_date))
    .slice(0, 5)

  // Get recent transactions (last 5)
  recentTransactions.value = userDataStore.userAccessibleTransactions
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5)

  console.log('Dashboard data processed:', {
    mxRecords: recentMxRecords.value.length,
    transactions: recentTransactions.value.length,
  })

  dataLoaded.value = true
}

// Utility functions
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

const formatDate = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
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

// Renewal history functions
const viewRenewalHistory = (reminder) => {
  selectedReminderForHistory.value = reminder
  showRenewalHistoryDialog.value = true
}

const closeRenewalHistoryDialog = () => {
  showRenewalHistoryDialog.value = false
  selectedReminderForHistory.value = null
}

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'completed':
      return 'positive'
    case 'in_progress':
      return 'warning'
    case 'pending':
      return 'info'
    default:
      return 'grey'
  }
}

// Transaction utility functions
const getTransactionTypeColor = (transacType) => {
  switch (transacType?.toLowerCase()) {
    case 'rent payment':
      return 'primary'
    case 'security deposit':
      return 'info'
    case 'maintenance fee':
      return 'warning'
    case 'utility payment':
      return 'secondary'
    case 'late fee':
      return 'negative'
    case 'refund':
      return 'positive'
    default:
      return 'grey'
  }
}

const getTransactionAmountColor = (transacType) => {
  switch (transacType?.toLowerCase()) {
    case 'rent payment':
    case 'maintenance fee':
    case 'utility payment':
    case 'late fee':
      return 'text-negative'
    case 'refund':
      return 'text-positive'
    default:
      return 'text-grey'
  }
}

// Quick actions dialog handlers
const openCreatePropertyDialog = () => {
  showCreatePropertyDialog.value = true
  showQuickActions.value = false
}

const openCreateLeaseDialog = () => {
  showCreateLeaseDialog.value = true
  showQuickActions.value = false
}

const openCreateTransactionDialog = () => {
  showCreateTransactionDialog.value = true
  showQuickActions.value = false
}

const openCreateTaskDialog = () => {
  showCreateTaskDialog.value = true
  showQuickActions.value = false
}

// Task functions
const viewMxRecordDetail = (record) => {
  selectedMxRecord.value = record
  showMxRecordDetail.value = true
}

const addLogToMxRecord = (record) => {
  showMxRecordDetail.value = false
  // Navigate to tasks page with the specific record selected for adding a log
  router.push(`/mx-records?recordId=${record.id}&action=addLog`)
}

// Transaction functions
const viewTransactionDetail = (transaction) => {
  selectedTransaction.value = transaction
  showTransactionDetail.value = true
}

const getPropertyName = (propertyId) => {
  if (!propertyId) return 'Unknown Property'
  const property = userDataStore.userAccessibleProperties.find((prop) => prop.id === propertyId)
  return property ? property.nickname || property.address || 'Unknown Property' : 'Unknown Property'
}

// Reminders functions
const loadReminders = () => {
  try {
    // Mock reminders data - in real app, this would come from your backend
    reminders.value = [
      {
        id: '1',
        title: 'Property Inspection Due',
        description: 'Quarterly inspection for Downtown Apartment',
        due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
        property_id: 'prop1',
        property_name: 'Downtown Apartment',
        status: 'pending',
        renewals: [], // Track renewal history
      },
      {
        id: '2',
        title: 'Lease Renewal',
        description: 'Lease renewal discussion with tenant',
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        property_id: 'prop2',
        property_name: 'Suburban House',
        status: 'pending',
        renewals: [], // Track renewal history
      },
      {
        id: '3',
        title: 'Maintenance Check',
        description: 'HVAC system maintenance scheduled',
        due_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day overdue
        property_id: 'prop1',
        property_name: 'Downtown Apartment',
        status: 'overdue',
        renewals: [
          {
            renewed_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            previous_due_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            new_due_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ], // Has been renewed once
      },
    ]
  } catch (error) {
    console.error('Error loading reminders:', error)
    reminders.value = []
  }
}

const isReminderOverdue = (reminder) => {
  const dueDate = new Date(reminder.due_date)
  const now = new Date()
  return dueDate < now
}

const formatReminderDate = (dateString) => {
  const date = new Date(dateString)
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

const markReminderComplete = (reminder) => {
  try {
    // Remove reminder from the list
    const index = reminders.value.findIndex((r) => r.id === reminder.id)
    if (index !== -1) {
      reminders.value.splice(index, 1)
    }

    Notify.create({
      type: 'positive',
      message: 'Reminder marked as complete!',
      position: 'top',
      timeout: 2000,
    })
  } catch (error) {
    console.error('Error marking reminder complete:', error)
    Notify.create({
      type: 'negative',
      message: 'Failed to mark reminder as complete',
      position: 'top',
      timeout: 3000,
    })
  }
}

const renewReminder = (reminder) => {
  try {
    // Find the reminder in the list
    const index = reminders.value.findIndex((r) => r.id === reminder.id)
    if (index === -1) return

    // Store the current due date as previous due date
    const previousDueDate = reminder.due_date

    // Set new due date to TODAY (clock restarts)
    const today = new Date()
    const newDueDate = today.toISOString()

    // Create renewal record
    const renewalRecord = {
      renewed_at: new Date().toISOString(),
      previous_due_date: previousDueDate,
      new_due_date: newDueDate,
    }

    // Initialize renewals array if it doesn't exist
    if (!reminder.renewals) {
      reminder.renewals = []
    }

    // Add renewal record to the renewals array
    reminder.renewals.push(renewalRecord)

    // Update the due date to today
    reminder.due_date = newDueDate

    // Update status if it was overdue
    if (reminder.status === 'overdue') {
      reminder.status = 'pending'
    }

    // Update the reminder in the array
    reminders.value[index] = { ...reminder }

    Notify.create({
      type: 'positive',
      message: `Reminder renewed! Clock restarted from today.`,
      position: 'top',
      caption: `New due date: ${formatReminderDate(newDueDate)}`,
      timeout: 3000,
    })

    console.log('Reminder renewed:', {
      id: reminder.id,
      previousDueDate: previousDueDate,
      newDueDate: newDueDate,
      renewalCount: reminder.renewals.length,
      createdDate: reminder.created_date, // Original creation date (if exists)
    })
  } catch (error) {
    console.error('Error renewing reminder:', error)
    Notify.create({
      type: 'negative',
      message: 'Failed to renew reminder',
      position: 'top',
      timeout: 3000,
    })
  }
}

// Dialog event handlers
const onPropertyCreated = () => {
  showCreatePropertyDialog.value = false
  Notify.create({
    type: 'positive',
    message: 'Property created successfully!',
    position: 'top',
    timeout: 3000,
  })
}

const onTaskCreated = () => {
  showCreateTaskDialog.value = false
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

// Watchers
watch(
  () => userDataStore.isAuthenticated,
  async (newValue) => {
    if (newValue) {
      processDashboardData()
    } else {
      // Clear data on logout
      recentMxRecords.value = []
      recentTransactions.value = []
      dataLoaded.value = false
    }
  },
)

watch(
  () => userDataStore.userAccessibleMxRecords,
  () => {
    if (dataLoaded.value) {
      processDashboardData()
    }
  },
)

watch(
  () => userDataStore.userAccessibleTransactions,
  () => {
    if (dataLoaded.value) {
      processDashboardData()
    }
  },
)

watch(
  () => userDataStore.userAccessibleProperties,
  () => {
    if (dataLoaded.value) {
      processDashboardData()
    }
  },
)

// Watch for data availability and redirect to loading page if needed
watch(
  () => [
    userDataStore.isAuthenticated,
    userDataStore.userAccessibleProperties.length,
    userDataStore.profileLoading,
    userDataStore.propertiesLoading,
    userDataStore.userRolesLoading,
  ],
  ([isAuth, propertiesCount, profileLoading, propertiesLoading, rolesLoading]) => {
    // Only redirect if user is authenticated but has no data and nothing is loading
    if (
      isAuth &&
      propertiesCount === 0 &&
      !profileLoading &&
      !propertiesLoading &&
      !rolesLoading &&
      router.currentRoute.value.path === '/'
    ) {
      console.log('IndexPage - Data cleared, redirecting to loading page')
      router.push('/loading')
    }
  },
)

// Lifecycle
onMounted(async () => {
  console.log('IndexPage mounted')

  // Check if user is authenticated and has data loaded
  if (userDataStore.isAuthenticated) {
    // If no properties are loaded yet and not currently loading, redirect to loading page
    if (
      userDataStore.userAccessibleProperties.length === 0 &&
      !userDataStore.profileLoading &&
      !userDataStore.propertiesLoading &&
      !userDataStore.userRolesLoading
    ) {
      console.log('IndexPage - No data available, redirecting to loading page')
      router.push('/loading')
      return
    }

    // Process existing data from store
    processDashboardData()
  }

  // Load reminders
  loadReminders()
})
</script>

<style scoped>
.dashboard-page {
  padding: 16px;
  background: #f8f9fa;
  min-height: 100vh;
}

.data-loading-page {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.95);
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
  border-radius: 8px;
  background: #f5f5f5;
  color: #666;
  transition: all 0.3s ease;
}

.loading-step.active {
  background: #e3f2fd;
  color: #1976d2;
}

.loading-step.completed {
  background: #e8f5e8;
  color: #2e7d32;
}

.dashboard-content {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 24px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.header-title h1 {
  margin: 0;
  color: #1a1a1a;
}

.header-title p {
  margin: 4px 0 0 0;
}

.refresh-btn {
  margin-left: 16px;
}

.stats-section {
  margin-bottom: 32px;
}

.stat-card {
  height: 100px;
  min-height: 100px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  margin: 2px;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
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
  border-radius: 10px;
  background: rgba(25, 118, 210, 0.1);
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
  font-size: 1.2rem !important;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 2px;
  color: #1a1a1a;
}

.stat-card__label {
  font-size: 0.75rem !important;
  line-height: 1.3;
  color: #666;
  margin: 0;
}

.dashboard-sections {
  margin-bottom: 32px;
}

.dashboard-section {
  border-radius: 12px;
  box-shadow: none;
  margin-bottom: 24px;
  margin-right: 5px;
  background: white;
  border: 1px solid #e5e7eb;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px 16px 24px;
  border-bottom: 1px solid #e5e7eb;
  background: white;
}

.section-title {
  display: flex;
  align-items: center;
  font-weight: 600;
  color: #1a1a1a;
}

.section-content {
  padding: 20px 24px;
  background: white;
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
  gap: 16px;
}

.record-item,
.transaction-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  transition: all 0.2s ease;
}

.record-item:hover,
.transaction-item:hover {
  background: white;
  border-color: #1976d2;
}

.record-item.clickable {
  cursor: pointer;
  transition: all 0.2s ease;
}

.record-item.clickable:hover {
  background: rgba(25, 118, 210, 0.05);
  border-color: #1976d2;
  transform: translateY(-1px);
}

.transaction-item.clickable {
  cursor: pointer;
  transition: all 0.2s ease;
}

.transaction-item.clickable:hover {
  background: rgba(25, 118, 210, 0.05);
  border-color: #1976d2;
  transform: translateY(-1px);
}

.transaction-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  gap: 12px;
}

.transaction-details {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.record-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  gap: 12px;
}

.record-description {
  flex: 1;
  font-weight: 600;
  color: #1a1a1a;
  font-size: 0.9rem;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.record-details {
  display: flex;
  align-items: center;
  gap: 8px;
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
  box-shadow: 0 4px 16px rgba(25, 118, 210, 0.3);
}

.quick-actions-dialog {
  border-radius: 16px 16px 0 0;
  min-width: 320px;
  max-width: 500px;
}

.quick-actions-dialog .q-card-section {
  padding: 20px 24px;
}

.quick-actions-dialog .q-card-section:first-child {
  border-bottom: 1px solid #e0e0e0;
  background: #f8f9fa;
}

/* Button Text Styling - Keep Default Colors */
.btn-primary,
.btn-secondary,
.refresh-btn {
  color: white !important;
  font-weight: 600 !important;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .dashboard-page {
    padding: 12px;
  }

  .header-content {
    flex-direction: column;
    gap: 16px;
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
.dialog-header {
  background: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
  padding: 16px 24px;
}

.dialog-close-btn {
  color: #666;
}

.dialog-close-btn:hover {
  background: rgba(0, 0, 0, 0.1);
}

/* Reminders Styles */
.reminders-section {
  margin-bottom: 100px; /* Space for fixed quick actions */
}

.reminders-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.reminders-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.reminders-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
  margin-top: 8px;
}

.reminder-card {
  border-radius: 12px;
  border-left: 4px solid #2196f3;
  transition: all 0.3s ease;
  height: 160px;
  display: flex;
  flex-direction: column;
}

.reminder-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.reminder-card.reminder-overdue {
  border-left-color: #f44336;
  background: linear-gradient(135deg, #fff3e0 0%, #ffffff 100%);
}

.reminder-card-content {
  padding: 16px;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.reminder-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.reminder-title {
  font-weight: 600;
  color: #1a1a1a;
  font-size: 0.9rem;
  line-height: 1.3;
  flex: 1;
  margin-right: 8px;
}

.reminder-actions-header {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.reminder-renew-btn,
.reminder-complete-btn {
  flex-shrink: 0;
  opacity: 0.7;
  transition: opacity 0.2s ease;
}

.reminder-renew-btn:hover,
.reminder-complete-btn:hover {
  opacity: 1;
}

.reminder-description {
  color: #666;
  font-size: 0.8rem;
  line-height: 1.4;
  margin-bottom: 12px;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.reminder-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.reminder-date {
  display: flex;
  align-items: center;
  font-size: 0.75rem;
  color: #888;
  font-weight: 500;
}

.empty-reminders {
  padding: 40px 20px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .reminders-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .reminder-card {
    height: 140px;
  }

  .reminder-card-content {
    padding: 12px;
  }

  .reminder-title {
    font-size: 0.85rem;
  }

  .reminder-description {
    font-size: 0.75rem;
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .reminders-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1025px) {
  .reminders-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* Renewal History Dialog Styles */
.renewal-reminder-info {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  border-left: 4px solid #1976d2;
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
  border-bottom: 1px solid #e0e0e0;
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
</style>
