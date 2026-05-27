<template>
  <q-page class="owner-view q-pa-md">
    <div class="owner-view__hero q-mb-md">
      <div class="text-body2 text-grey-7">
        Review property performance, activity history, lease occupancy, and tax-ready summaries.
      </div>
    </div>

    <button
      class="property-picker-card q-mb-md"
      type="button"
      @click="propertyPickerDialogOpen = true"
    >
      <div class="property-picker-card__layout">
        <div class="property-picker-card__left">
          <div class="property-picker-card__eyebrow">Property</div>
          <div class="property-picker-card__title">
            {{ selectedProperty?.nickname || 'Select Property' }}
          </div>
          <div class="property-picker-card__sub">
            {{
              selectedProperty
                ? selectedProperty.address || selectedProperty.id
                : 'Choose one property to load owner-facing details and reports.'
            }}
          </div>
        </div>

        <div v-if="selectedProperty" class="property-picker-card__right">
          <div class="property-detail-grid">
            <div class="property-detail-item">
              <span class="property-detail-label">Type</span>
              <span class="property-detail-value">{{ selectedProperty.type || 'Property' }}</span>
            </div>
            <div class="property-detail-item">
              <span class="property-detail-label">Layout</span>
              <span class="property-detail-value">{{
                selectedProperty.spec?.type || 'Standard Layout'
              }}</span>
            </div>
            <div class="property-detail-item">
              <span class="property-detail-label">Beds</span>
              <span class="property-detail-value">{{ propertyBedroomLabel }}</span>
            </div>
            <div class="property-detail-item">
              <span class="property-detail-label">Baths</span>
              <span class="property-detail-value">{{ propertyBathroomLabel }}</span>
            </div>
            <div class="property-detail-item">
              <span class="property-detail-label">Size</span>
              <span class="property-detail-value">{{ propertySizeLabel }}</span>
            </div>
            <div class="property-detail-item">
              <span class="property-detail-label">Garage</span>
              <span class="property-detail-value">{{ propertyGarageLabel }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="property-picker-card__cta">
        {{ selectedProperty ? 'Change Property' : 'Open Property Picker' }}
      </div>
    </button>

    <div v-if="!selectedProperty" class="owner-view__empty">
      <q-icon name="home_work" size="72px" color="grey-5" />
      <div class="text-h6 q-mt-md">No property selected</div>
      <div class="text-body2 text-grey-7 q-mt-xs">
        Select a property to load transactions, tasks, lease history, and reports.
      </div>
    </div>

    <template v-else>
      <div class="row q-col-gutter-md q-mb-md">
        <div class="col-12 col-md-3">
          <q-card flat bordered class="summary-card">
            <q-card-section>
              <div class="summary-label">YTD Expense</div>
              <div class="summary-value">{{ formatAmount(ytdOperatingExpenses) }}</div>
              <div class="summary-sub">{{ formatAmount(mtdOperatingExpenses) }} this month</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-md-3">
          <q-card flat bordered class="summary-card">
            <q-card-section>
              <div class="summary-label">YTD Income</div>
              <div class="summary-value">{{ formatAmount(ytdRentCollected) }}</div>
              <div class="summary-sub">{{ formatAmount(mtdRentCollected) }} this month</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-md-3">
          <q-card flat bordered class="summary-card">
            <q-card-section>
              <div class="summary-label">Open Tasks</div>
              <div class="summary-value">{{ openTaskCount }}</div>
              <div class="summary-sub">{{ historicalTaskCount }} completed or archived</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-md-3">
          <q-card flat bordered class="summary-card">
            <q-card-section>
              <div class="summary-label">Current Tenant</div>
              <div class="summary-value summary-value--tenant">{{ currentTenantLabel }}</div>
              <div class="summary-sub summary-sub--stack">
                <span>{{ currentTenantPhone }}</span>
                <span>{{ currentTenantEmail }}</span>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <div class="q-mb-md">
        <div class="text-subtitle1 text-weight-medium q-mb-sm">Cash Flow & Maintenance Trend</div>
        <div class="core-charts-grid">
          <q-card class="chart-card" flat bordered>
            <q-card-section>
              <div class="text-subtitle2 text-weight-medium q-mb-sm">Monthly Cash Flow</div>
              <div class="chart-container">
                <canvas ref="coreCashFlowChartCanvas" style="max-height: 300px"></canvas>
              </div>
            </q-card-section>
          </q-card>

          <q-card class="chart-card" flat bordered>
            <q-card-section>
              <div class="text-subtitle2 text-weight-medium q-mb-sm">Maintenance Performance</div>
              <div class="chart-container">
                <canvas ref="maintenanceChartCanvas" style="max-height: 300px"></canvas>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <div class="row q-col-gutter-md">
        <div class="col-12 col-xl-6">
          <q-card flat bordered class="panel-card">
            <q-card-section class="row items-center">
              <div>
                <div class="text-subtitle1 text-weight-medium">Transactions</div>
                <div class="text-caption text-grey-7">All property cash activity, newest first</div>
              </div>
              <q-space />
              <q-btn
                flat
                dense
                color="primary"
                label="View All"
                @click="transactionListDialogOpen = true"
              />
            </q-card-section>
            <q-separator />
            <q-card-section>
              <div v-if="selectedPropertyTransactions.length === 0" class="text-body2 text-grey-6">
                No transactions recorded for this property.
              </div>
              <q-list v-else separator>
                <q-item
                  v-for="item in selectedPropertyTransactions.slice(0, 8)"
                  :key="item.id"
                  clickable
                  @click="openTransactionDialog(item)"
                >
                  <q-item-section>
                    <q-item-label class="text-weight-medium">
                      {{ item.transac_type || item.type || 'Transaction' }}
                    </q-item-label>
                    <q-item-label caption>
                      {{ formatDate(item.transac_date || item.created_datetime || item.date) }}
                    </q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <div class="text-weight-medium">{{ formatAmount(item.amount) }}</div>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-xl-6">
          <q-card flat bordered class="panel-card">
            <q-card-section class="row items-center">
              <div>
                <div class="text-subtitle1 text-weight-medium">Task History</div>
                <div class="text-caption text-grey-7">
                  Open work and resolved maintenance history
                </div>
              </div>
              <q-space />
              <q-btn
                flat
                dense
                color="primary"
                label="View All"
                @click="taskHistoryDialogOpen = true"
              />
            </q-card-section>
            <q-separator />
            <q-card-section>
              <div v-if="selectedPropertyTasks.length === 0" class="text-body2 text-grey-6">
                No tasks recorded for this property.
              </div>
              <template v-else>
                <div class="section-mini-label">Open / In Progress</div>
                <q-list v-if="openTasks.length" separator class="q-mb-md">
                  <q-item
                    v-for="item in openTasks.slice(0, 4)"
                    :key="item.id"
                    clickable
                    @click="openTaskDialog(item)"
                  >
                    <q-item-section>
                      <q-item-label class="text-weight-medium">
                        {{ item.task_title || item.description || item.category || 'Task' }}
                      </q-item-label>
                      <q-item-label caption>
                        {{ formatDate(item.report_date || item.created_at || item.createAt) }}
                      </q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <q-chip dense :color="getStatusColor(item.status)" text-color="white">
                        {{ normalizeStatus(item.status) }}
                      </q-chip>
                    </q-item-section>
                  </q-item>
                </q-list>
                <div v-else class="text-body2 text-grey-6 q-mb-md">No active tasks.</div>

                <div class="section-mini-label">History</div>
                <q-list v-if="historicalTasks.length" separator>
                  <q-item
                    v-for="item in historicalTasks.slice(0, 4)"
                    :key="item.id"
                    clickable
                    @click="openTaskDialog(item)"
                  >
                    <q-item-section>
                      <q-item-label class="text-weight-medium">
                        {{ item.task_title || item.description || item.category || 'Task' }}
                      </q-item-label>
                      <q-item-label caption>
                        {{ formatDate(item.report_date || item.created_at || item.createAt) }}
                      </q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <q-chip dense :color="getStatusColor(item.status)" text-color="white">
                        {{ normalizeStatus(item.status) }}
                      </q-chip>
                    </q-item-section>
                  </q-item>
                </q-list>
                <div v-else class="text-body2 text-grey-6">No completed history yet.</div>
              </template>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <div class="row q-col-gutter-md q-mt-md">
        <div class="col-12 col-xl-6">
          <q-card flat bordered class="panel-card">
            <q-card-section class="row items-center">
              <div>
                <div class="text-subtitle1 text-weight-medium">Current Tenant & Lease</div>
                <div class="text-caption text-grey-7">Current occupancy, rent, and lease terms</div>
              </div>
              <q-space />
              <q-btn
                flat
                dense
                color="primary"
                label="View Details"
                :disable="!currentLease"
                @click="openLeaseDialog(currentLease)"
              />
            </q-card-section>
            <q-separator />
            <q-card-section>
              <div v-if="!currentLease" class="text-body2 text-grey-6">
                No active lease for this property.
              </div>
              <div v-else class="info-grid">
                <div class="info-row">
                  <span class="info-label">Tenant</span>
                  <span class="info-value">{{ currentTenantLabel }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Lease Status</span>
                  <q-chip dense :color="getStatusColor(currentLease.status)" text-color="white">
                    {{ currentLeaseStatusLabel }}
                  </q-chip>
                </div>
                <div class="info-row">
                  <span class="info-label">Term</span>
                  <span class="info-value">
                    {{
                      formatDate(
                        currentLease.lease_start_date ||
                          currentLease.start_date ||
                          currentLease.move_in_date,
                      )
                    }}
                    -
                    {{ formatDate(currentLease.lease_end_date || currentLease.end_date) }}
                  </span>
                </div>
                <div class="info-row">
                  <span class="info-label">Rent</span>
                  <span class="info-value">
                    {{ formatAmount(currentLease.rate_amount) }}/{{
                      currentLease.rate_type || 'month'
                    }}
                  </span>
                </div>
                <div class="info-row">
                  <span class="info-label">Deposit</span>
                  <span class="info-value">{{
                    formatAmount(currentLease.deposit_amount || currentLease.deposit)
                  }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Contact</span>
                  <span class="info-value">{{
                    currentLease.tenant_email || currentLease.tenant_phone || 'Not available'
                  }}</span>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-xl-6">
          <q-card flat bordered class="panel-card">
            <q-expansion-item
              expand-separator
              default-opened
              icon="history"
              label="Historical Tenants & Leases"
              :caption="`${historicalLeases.length} archived lease${historicalLeases.length === 1 ? '' : 's'}`"
            >
              <q-card-section>
                <div v-if="historicalLeases.length === 0" class="text-body2 text-grey-6">
                  No historical lease records yet.
                </div>
                <div class="row justify-end q-mb-sm">
                  <q-btn
                    v-if="historicalLeases.length"
                    flat
                    dense
                    color="primary"
                    label="View All"
                    @click="leaseHistoryDialogOpen = true"
                  />
                </div>
                <q-list v-if="historicalLeases.length" separator>
                  <q-item
                    v-for="lease in historicalLeases"
                    :key="lease.id"
                    clickable
                    @click="openLeaseDialog(lease)"
                  >
                    <q-item-section>
                      <q-item-label class="text-weight-medium">
                        {{ getLeaseDisplayTenantName(lease) }}
                      </q-item-label>
                      <q-item-label caption>
                        {{
                          formatDate(
                            lease.lease_start_date || lease.start_date || lease.move_in_date,
                          )
                        }}
                        -
                        {{ formatDate(lease.lease_end_date || lease.end_date) }}
                      </q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <q-chip dense :color="getStatusColor(lease.status)" text-color="white">
                        {{ normalizeStatus(lease.status) }}
                      </q-chip>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-card-section>
            </q-expansion-item>
          </q-card>
        </div>
      </div>

      <div class="row q-col-gutter-md q-mt-md">
        <div class="col-12 col-xl-6">
          <q-card flat bordered class="panel-card">
            <q-card-section>
              <div class="row items-center q-mb-md">
                <div>
                  <div class="text-subtitle1 text-weight-medium">Financial Performance</div>
                  <div class="text-caption text-grey-7">
                    Cash basis performance for this property
                  </div>
                </div>
                <q-space />
                <q-btn-dropdown flat dense color="primary" icon="download" label="Export">
                  <q-list dense>
                    <q-item clickable v-close-popup @click="downloadFinancialPerformanceCsv">
                      <q-item-section>Export CSV</q-item-section>
                    </q-item>
                    <q-item clickable v-close-popup @click="printFinancialPerformanceSummary">
                      <q-item-section>Print Summary</q-item-section>
                    </q-item>
                  </q-list>
                </q-btn-dropdown>
              </div>

              <div class="financial-grid">
                <div class="financial-item">
                  <div class="financial-label">Gross Rent Collected</div>
                  <div class="financial-value">{{ formatAmount(ytdRentCollected) }}</div>
                </div>
                <div class="financial-item">
                  <div class="financial-label">Operating Expenses</div>
                  <div class="financial-value">{{ formatAmount(ytdOperatingExpenses) }}</div>
                </div>
                <div class="financial-item">
                  <div class="financial-label">Net Operating Income</div>
                  <div class="financial-value">{{ formatAmount(ytdNetCash) }}</div>
                </div>
                <div class="financial-item">
                  <div class="financial-label">Outstanding Balance Count</div>
                  <div class="financial-value">{{ outstandingBalanceCount }}</div>
                </div>
                <div class="financial-item">
                  <div class="financial-label">Occupancy Rate</div>
                  <div class="financial-value">{{ formatPercent(occupancyRate) }}</div>
                </div>
                <div class="financial-item">
                  <div class="financial-label">Average Historical Rent</div>
                  <div class="financial-value">{{ formatAmount(averageHistoricalRent) }}</div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-xl-6">
          <q-card flat bordered class="panel-card">
            <q-card-section>
              <div class="row items-center q-mb-md">
                <div>
                  <div class="text-subtitle1 text-weight-medium">Tax Package</div>
                  <div class="text-caption text-grey-7">
                    Tax-ready categorized totals for owner review and export preparation
                  </div>
                </div>
                <q-space />
                <q-btn-dropdown flat dense color="primary" icon="download" label="Export">
                  <q-list dense>
                    <q-item clickable v-close-popup @click="downloadTaxPackageCsv">
                      <q-item-section>Export CSV</q-item-section>
                    </q-item>
                    <q-item clickable v-close-popup @click="printTaxPackageSummary">
                      <q-item-section>Print Summary</q-item-section>
                    </q-item>
                  </q-list>
                </q-btn-dropdown>
              </div>

              <q-list separator>
                <q-item v-for="row in taxRows" :key="row.key">
                  <q-item-section>
                    <q-item-label class="text-weight-medium">{{ row.label }}</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-item-label>{{ formatAmount(row.amount) }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>

              <q-banner class="bg-grey-1 text-grey-8 q-mt-md" rounded>
                Cash basis summary only. Use categorized totals as the draft package for owner or
                CPA review.
              </q-banner>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </template>

    <q-dialog v-model="transactionDialogOpen">
      <q-card class="detail-dialog">
        <q-card-section class="row items-center">
          <div class="text-h6">Transaction Detail</div>
          <q-space />
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>
        <q-separator />
        <q-card-section v-if="selectedTransaction">
          <div class="detail-grid">
            <div class="detail-row">
              <span>ID</span><strong>{{ selectedTransaction.id }}</strong>
            </div>
            <div class="detail-row">
              <span>Type</span
              ><strong>{{
                selectedTransaction.transac_type || selectedTransaction.type || 'Transaction'
              }}</strong>
            </div>
            <div class="detail-row">
              <span>Date</span
              ><strong>{{
                formatDate(
                  selectedTransaction.transac_date ||
                    selectedTransaction.created_datetime ||
                    selectedTransaction.date,
                )
              }}</strong>
            </div>
            <div class="detail-row">
              <span>Amount</span><strong>{{ formatAmount(selectedTransaction.amount) }}</strong>
            </div>
            <div class="detail-row">
              <span>Method</span
              ><strong>{{
                selectedTransaction.method || selectedTransaction.payment_method || 'N/A'
              }}</strong>
            </div>
            <div class="detail-row">
              <span>Status</span><strong>{{ normalizeStatus(selectedTransaction.status) }}</strong>
            </div>
            <div class="detail-row">
              <span>Tenant</span
              ><strong>{{
                selectedTransaction.tenant_name || selectedTransaction.tenant_email || 'N/A'
              }}</strong>
            </div>
            <div class="detail-row">
              <span>Lease</span><strong>{{ selectedTransaction.lease_id || 'N/A' }}</strong>
            </div>
            <div class="detail-row detail-row--stack">
              <span>Notes</span
              ><strong>{{
                selectedTransaction.note ||
                selectedTransaction.memo ||
                selectedTransaction.comment ||
                'No notes'
              }}</strong>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="propertyPickerDialogOpen">
      <q-card class="property-picker-dialog">
        <q-card-section class="row items-center">
          <div class="text-h6">Choose Property</div>
          <q-space />
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>
        <q-separator />
        <q-card-section>
          <q-list separator>
            <q-item
              v-for="property in userDataStore.userAccessibleProperties"
              :key="property.id"
              clickable
              @click="selectProperty(property.id)"
            >
              <q-item-section>
                <q-item-label class="text-weight-medium">
                  {{ property.nickname || property.address || property.id }}
                </q-item-label>
                <q-item-label caption>
                  {{ property.address || property.id }}
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-chip
                  v-if="property.id === selectedPropertyId"
                  dense
                  color="primary"
                  text-color="white"
                >
                  Active
                </q-chip>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog
      v-model="transactionListDialogOpen"
      maximized
      transition-show="slide-left"
      transition-hide="slide-right"
    >
      <OwnerTransactionListView
        :items="selectedPropertyTransactions"
        :format-date="formatDate"
        :format-amount="formatAmount"
        :normalize-status="normalizeStatus"
        @select="handleTransactionListSelect"
      />
    </q-dialog>

    <q-dialog v-model="taskDialogOpen">
      <q-card class="detail-dialog">
        <q-card-section class="row items-center">
          <div class="text-h6">Task Detail</div>
          <q-space />
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>
        <q-separator />
        <q-card-section v-if="selectedTask">
          <div class="detail-grid">
            <div class="detail-row">
              <span>ID</span><strong>{{ selectedTask.id }}</strong>
            </div>
            <div class="detail-row">
              <span>Title</span
              ><strong>{{
                selectedTask.task_title ||
                selectedTask.description ||
                selectedTask.category ||
                'Task'
              }}</strong>
            </div>
            <div class="detail-row">
              <span>Status</span><strong>{{ normalizeStatus(selectedTask.status) }}</strong>
            </div>
            <div class="detail-row">
              <span>Reported</span
              ><strong>{{
                formatDate(
                  selectedTask.report_date || selectedTask.created_at || selectedTask.createAt,
                )
              }}</strong>
            </div>
            <div class="detail-row">
              <span>Resolved</span
              ><strong>{{
                formatDate(selectedTask.resolv_date || selectedTask.updated_at)
              }}</strong>
            </div>
            <div class="detail-row">
              <span>Priority</span
              ><strong>{{ selectedTask.priority || selectedTask.task_priority || 'N/A' }}</strong>
            </div>
            <div class="detail-row">
              <span>Assigned Vendor</span
              ><strong>{{
                selectedTask.assigned_sp_name ||
                selectedTask.sp_name ||
                selectedTask.vendor_name ||
                'N/A'
              }}</strong>
            </div>
            <div class="detail-row">
              <span>Estimated Cost</span
              ><strong>{{
                formatAmount(
                  selectedTask.amount || selectedTask.cost || selectedTask.estimated_cost,
                )
              }}</strong>
            </div>
            <div class="detail-row detail-row--stack">
              <span>Resolution</span
              ><strong>{{
                selectedTask.resolution ||
                selectedTask.task_description ||
                selectedTask.description ||
                'No additional detail'
              }}</strong>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog
      v-model="taskHistoryDialogOpen"
      maximized
      transition-show="slide-left"
      transition-hide="slide-right"
    >
      <OwnerTaskHistoryView
        :items="selectedPropertyTasks"
        :format-date="formatDate"
        :normalize-status="normalizeStatus"
        :get-status-color="getStatusColor"
        :open-task-statuses="openTaskStatuses"
        @select="handleTaskListSelect"
      />
    </q-dialog>

    <q-dialog v-model="leaseDialogOpen">
      <q-card class="detail-dialog">
        <q-card-section class="row items-center">
          <div class="text-h6">Tenant & Lease Detail</div>
          <q-space />
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>
        <q-separator />
        <q-card-section v-if="selectedLease">
          <div class="detail-grid">
            <div class="detail-row">
              <span>Lease ID</span
              ><strong>{{ selectedLease.id || selectedLease.lease_id || 'N/A' }}</strong>
            </div>
            <div class="detail-row">
              <span>Tenant</span><strong>{{ getLeaseDisplayTenantName(selectedLease) }}</strong>
            </div>
            <div class="detail-row">
              <span>Email</span><strong>{{ selectedLease.tenant_email || 'N/A' }}</strong>
            </div>
            <div class="detail-row">
              <span>Phone</span><strong>{{ selectedLease.tenant_phone || 'N/A' }}</strong>
            </div>
            <div class="detail-row">
              <span>Status</span><strong>{{ normalizeStatus(selectedLease.status) }}</strong>
            </div>
            <div class="detail-row">
              <span>Lease Start</span
              ><strong>{{
                formatDate(
                  selectedLease.lease_start_date ||
                    selectedLease.start_date ||
                    selectedLease.move_in_date,
                )
              }}</strong>
            </div>
            <div class="detail-row">
              <span>Lease End</span
              ><strong>{{
                formatDate(selectedLease.lease_end_date || selectedLease.end_date)
              }}</strong>
            </div>
            <div class="detail-row">
              <span>Monthly Rent</span
              ><strong
                >{{ formatAmount(selectedLease.rate_amount) }}/{{
                  selectedLease.rate_type || 'month'
                }}</strong
              >
            </div>
            <div class="detail-row">
              <span>Deposit</span
              ><strong>{{
                formatAmount(selectedLease.deposit_amount || selectedLease.deposit)
              }}</strong>
            </div>
            <div class="detail-row detail-row--stack">
              <span>Notes</span
              ><strong>{{ selectedLease.note || selectedLease.memo || 'No notes' }}</strong>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog
      v-model="leaseHistoryDialogOpen"
      maximized
      transition-show="slide-left"
      transition-hide="slide-right"
    >
      <OwnerLeaseHistoryView
        :items="historicalLeases"
        :format-date="formatDate"
        :normalize-status="normalizeStatus"
        :get-status-color="getStatusColor"
        :get-lease-display-tenant-name="getLeaseDisplayTenantName"
        @select="handleLeaseListSelect"
      />
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useUserDataStore } from '../stores/userDataStore'
import { normalizePropertyId } from '../utils/propertyIdUtils'
import { Notify } from 'quasar'
import OwnerTransactionListView from '../components/OwnerTransactionListView.vue'
import OwnerTaskHistoryView from '../components/OwnerTaskHistoryView.vue'
import OwnerLeaseHistoryView from '../components/OwnerLeaseHistoryView.vue'

const userDataStore = useUserDataStore()

const selectedPropertyId = ref(userDataStore.userAccessibleProperties[0]?.id || null)
const propertyPickerDialogOpen = ref(false)
const transactionDialogOpen = ref(false)
const transactionListDialogOpen = ref(false)
const taskDialogOpen = ref(false)
const taskHistoryDialogOpen = ref(false)
const leaseDialogOpen = ref(false)
const leaseHistoryDialogOpen = ref(false)
const selectedTransaction = ref(null)
const selectedTask = ref(null)
const selectedLease = ref(null)
const coreCashFlowChartCanvas = ref(null)
const maintenanceChartCanvas = ref(null)
let coreCashFlowChart = null
let maintenanceChart = null

watch(
  () => userDataStore.userAccessibleProperties,
  (properties) => {
    if (!properties.length) {
      selectedPropertyId.value = null
      return
    }
    const stillExists = properties.some((property) => property.id === selectedPropertyId.value)
    if (!stillExists) {
      selectedPropertyId.value = properties[0]?.id || null
    }
  },
  { immediate: true, deep: true },
)

const selectedProperty = computed(
  () =>
    userDataStore.userAccessibleProperties.find(
      (property) => property.id === selectedPropertyId.value,
    ) || null,
)

const toDateObject = (value) => {
  if (!value) return null
  if (value instanceof Date) return value
  if (value?.toDate) return value.toDate()
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

const selectedPropertyTransactions = computed(() =>
  [...userDataStore.userAccessibleTransactions]
    .filter(
      (item) =>
        normalizePropertyId(item.property_id) === normalizePropertyId(selectedPropertyId.value),
    )
    .sort(
      (a, b) =>
        (toDateObject(b.transac_date || b.created_datetime || b.date)?.getTime() || 0) -
        (toDateObject(a.transac_date || a.created_datetime || a.date)?.getTime() || 0),
    ),
)

const selectedPropertyTasks = computed(() =>
  [...userDataStore.userAccessibleMxRecords]
    .filter(
      (item) =>
        normalizePropertyId(item.property_id) === normalizePropertyId(selectedPropertyId.value),
    )
    .sort(
      (a, b) =>
        (toDateObject(b.report_date || b.created_at || b.createAt)?.getTime() || 0) -
        (toDateObject(a.report_date || a.created_at || a.createAt)?.getTime() || 0),
    ),
)

const selectedPropertyLeases = computed(() =>
  [...userDataStore.userAccessibleLeases]
    .filter((lease) => {
      const leasePropertyId = lease.property?.id || lease.property_id?.id || lease.property_id
      return normalizePropertyId(leasePropertyId) === normalizePropertyId(selectedPropertyId.value)
    })
    .sort(
      (a, b) =>
        (toDateObject(b.lease_start_date || b.start_date || b.move_in_date)?.getTime() || 0) -
        (toDateObject(a.lease_start_date || a.start_date || a.move_in_date)?.getTime() || 0),
    ),
)

const activeLeaseStatuses = ['active', 'occupied', 'rented', 'current']
const openTaskStatuses = ['open', 'new', 'pending', 'in_progress', 'in progress', 'working']
const incomeKeywords = ['rent', 'deposit', 'refund']

const currentLease = computed(
  () =>
    selectedPropertyLeases.value.find((lease) =>
      activeLeaseStatuses.includes(String(lease.status || '').toLowerCase()),
    ) || null,
)

const historicalLeases = computed(() =>
  selectedPropertyLeases.value.filter((lease) => lease.id !== currentLease.value?.id),
)

const openTasks = computed(() =>
  selectedPropertyTasks.value.filter((task) =>
    openTaskStatuses.includes(String(task.status || 'open').toLowerCase()),
  ),
)

const historicalTasks = computed(() =>
  selectedPropertyTasks.value.filter(
    (task) => !openTaskStatuses.includes(String(task.status || 'open').toLowerCase()),
  ),
)

const currentTenantLabel = computed(() =>
  currentLease.value ? getLeaseDisplayTenantName(currentLease.value) : 'Vacant',
)
const currentTenantEmail = computed(() => currentLease.value?.tenant_email || 'No email on file')
const currentTenantPhone = computed(() => currentLease.value?.tenant_phone || 'No phone on file')
const propertyBedroomLabel = computed(() => `${selectedProperty.value?.spec?.bedroom ?? 0} bed`)
const propertyBathroomLabel = computed(() => {
  const full = Number(selectedProperty.value?.spec?.full_bathroom ?? 0)
  const half = Number(selectedProperty.value?.spec?.half_bathroom ?? 0)
  const total = half > 0 ? `${full}.${half}` : `${full}`
  return `${total} bath`
})
const propertySizeLabel = computed(() => {
  const size = Number(selectedProperty.value?.spec?.size ?? 0)
  return size > 0 ? `${size.toLocaleString('en-US')} sq ft` : 'Size N/A'
})
const propertyGarageLabel = computed(() => {
  const garage = Number(selectedProperty.value?.spec?.garage ?? 0)
  return garage > 0 ? `${garage} garage` : 'No garage'
})

const currentLeaseStatusLabel = computed(() =>
  normalizeStatus(currentLease.value?.status || 'Active'),
)
const openTaskCount = computed(() => openTasks.value.length)
const historicalTaskCount = computed(() => historicalTasks.value.length)

const amountNumber = (value) => {
  const number = Number(value)
  return Number.isFinite(number) ? number : 0
}

const toDateSafe = (value) => {
  if (!value) return null
  if (value instanceof Date) return value
  if (typeof value?.toDate === 'function') return value.toDate()
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

const getMonthsForChartRange = () => {
  const now = new Date()
  const months = []
  for (let i = 5; i >= 0; i -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push({
      key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
      label: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    })
  }
  return months
}

const isIncomeTransaction = (item) => {
  const type = String(item?.transac_type || item?.type || '').toLowerCase()
  return incomeKeywords.some((keyword) => type.includes(keyword))
}

const isThisMonth = (value) => {
  const date = toDateObject(value)
  if (!date) return false
  const now = new Date()
  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth()
}

const isThisYear = (value) => {
  const date = toDateObject(value)
  if (!date) return false
  return date.getFullYear() === new Date().getFullYear()
}

const sumTransactions = (rows, predicate = () => true) =>
  rows.filter(predicate).reduce((sum, row) => sum + amountNumber(row.amount), 0)

const mtdRentCollected = computed(() =>
  sumTransactions(
    selectedPropertyTransactions.value,
    (item) =>
      isThisMonth(item.transac_date || item.created_datetime || item.date) &&
      isIncomeTransaction(item),
  ),
)

const mtdOperatingExpenses = computed(() =>
  sumTransactions(
    selectedPropertyTransactions.value,
    (item) =>
      isThisMonth(item.transac_date || item.created_datetime || item.date) &&
      !isIncomeTransaction(item),
  ),
)

const mtdNetCash = computed(() => mtdRentCollected.value - mtdOperatingExpenses.value)

const ytdRentCollected = computed(() =>
  sumTransactions(
    selectedPropertyTransactions.value,
    (item) =>
      isThisYear(item.transac_date || item.created_datetime || item.date) &&
      isIncomeTransaction(item),
  ),
)

const ytdOperatingExpenses = computed(() =>
  sumTransactions(
    selectedPropertyTransactions.value,
    (item) =>
      isThisYear(item.transac_date || item.created_datetime || item.date) &&
      !isIncomeTransaction(item),
  ),
)

const ytdNetCash = computed(() => ytdRentCollected.value - ytdOperatingExpenses.value)

const occupancyRate = computed(() => {
  const totalLeaseCount = selectedPropertyLeases.value.length
  if (!totalLeaseCount) return currentLease.value ? 1 : 0
  return currentLease.value ? 1 : 0
})

const averageHistoricalRent = computed(() => {
  if (!selectedPropertyLeases.value.length) return 0
  const total = selectedPropertyLeases.value.reduce(
    (sum, lease) => sum + amountNumber(lease.rate_amount),
    0,
  )
  return total / selectedPropertyLeases.value.length
})

const normalizeTaxCategory = (item) => {
  const type = String(item?.transac_type || item?.type || '').toLowerCase()
  if (type.includes('rent')) return 'rental_income'
  if (type.includes('deposit')) return 'security_deposit'
  if (type.includes('tax')) return 'property_tax'
  if (type.includes('insurance')) return 'insurance'
  if (type.includes('utility')) return 'utilities'
  if (type.includes('hoa')) return 'hoa_fees'
  if (type.includes('maintenance') || type.includes('labor') || type.includes('repair'))
    return 'repairs_maintenance'
  if (type.includes('management')) return 'management_fees'
  return 'other'
}

const taxSummary = computed(() => {
  const summary = {
    rental_income: 0,
    security_deposit: 0,
    property_tax: 0,
    insurance: 0,
    utilities: 0,
    hoa_fees: 0,
    repairs_maintenance: 0,
    management_fees: 0,
    other: 0,
  }

  selectedPropertyTransactions.value
    .filter((item) => isThisYear(item.transac_date || item.created_datetime || item.date))
    .forEach((item) => {
      const key = normalizeTaxCategory(item)
      summary[key] += amountNumber(item.amount)
    })

  return summary
})

const taxRows = computed(() => [
  { key: 'rental_income', label: 'Rental Income', amount: taxSummary.value.rental_income },
  {
    key: 'security_deposit',
    label: 'Security Deposits',
    amount: taxSummary.value.security_deposit,
  },
  { key: 'property_tax', label: 'Property Tax', amount: taxSummary.value.property_tax },
  { key: 'insurance', label: 'Insurance', amount: taxSummary.value.insurance },
  { key: 'utilities', label: 'Utilities', amount: taxSummary.value.utilities },
  { key: 'hoa_fees', label: 'HOA Fees', amount: taxSummary.value.hoa_fees },
  {
    key: 'repairs_maintenance',
    label: 'Repairs & Maintenance',
    amount: taxSummary.value.repairs_maintenance,
  },
  { key: 'management_fees', label: 'Management Fees', amount: taxSummary.value.management_fees },
  { key: 'other', label: 'Other / Uncategorized', amount: taxSummary.value.other },
])

const csvEscape = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`

const downloadCsv = (csvContent, reportType) => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  const timestamp = new Date().toISOString().split('T')[0]
  const propertySlug = String(
    selectedProperty.value?.nickname || selectedProperty.value?.id || 'property',
  )
    .trim()
    .replace(/[^a-z0-9]+/gi, '_')
    .replace(/^_+|_+$/g, '')
    .toLowerCase()
  const filename = `${reportType}_${propertySlug || 'property'}_${timestamp}.csv`

  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  Notify.create({
    type: 'positive',
    message: `${reportType.replaceAll('_', ' ')} exported successfully.`,
    caption: filename,
    position: 'top',
  })
}

const openPrintWindow = (title, bodyHtml) => {
  const printWindow = window.open('', '_blank', 'width=980,height=720')
  if (!printWindow) {
    Notify.create({
      type: 'negative',
      message: 'Unable to open print preview window.',
      position: 'top',
    })
    return
  }

  const propertyName =
    selectedProperty.value?.nickname || selectedProperty.value?.address || 'Property'
  printWindow.document.write(`
    <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 32px; color: #111827; }
          h1 { margin: 0 0 8px; font-size: 24px; }
          h2 { margin: 24px 0 12px; font-size: 18px; }
          p.meta { color: #6b7280; margin: 0 0 4px; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; }
          th, td { border: 1px solid #d1d5db; padding: 8px 10px; text-align: left; }
          th { background: #f3f4f6; }
          .kpi-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; margin-top: 16px; }
          .kpi { border: 1px solid #d1d5db; border-radius: 8px; padding: 12px; }
          .kpi-label { color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.06em; }
          .kpi-value { font-size: 20px; font-weight: 700; margin-top: 6px; }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <p class="meta">Property: ${propertyName}</p>
        <p class="meta">Generated: ${new Date().toLocaleString()}</p>
        ${bodyHtml}
      </body>
    </html>
  `)
  printWindow.document.close()
  printWindow.focus()
  printWindow.onload = () => {
    printWindow.print()
  }
}

const outstandingBalanceCount = computed(
  () =>
    selectedPropertyTransactions.value.filter((item) => {
      const status = String(item.status || '').toLowerCase()
      return ['late', 'overdue', 'past_due', 'past due', 'unpaid'].includes(status)
    }).length,
)

const financialPerformanceRows = computed(() => [
  { label: 'Gross Rent Collected (YTD)', value: ytdRentCollected.value },
  { label: 'Operating Expenses (YTD)', value: ytdOperatingExpenses.value },
  { label: 'Net Operating Income (YTD)', value: ytdNetCash.value },
  { label: 'Rent Collected (MTD)', value: mtdRentCollected.value },
  { label: 'Operating Expenses (MTD)', value: mtdOperatingExpenses.value },
  { label: 'Net Cash (MTD)', value: mtdNetCash.value },
  { label: 'Occupancy Rate', value: formatPercent(occupancyRate.value), isFormatted: true },
  { label: 'Outstanding Balance Count', value: outstandingBalanceCount.value, isFormatted: true },
  { label: 'Average Historical Rent', value: averageHistoricalRent.value },
])

const downloadFinancialPerformanceCsv = () => {
  try {
    let csvContent = ''
    csvContent += '=== OWNER VIEW FINANCIAL PERFORMANCE ===\n'
    csvContent += `Property,${csvEscape(selectedProperty.value?.nickname || selectedProperty.value?.address || selectedProperty.value?.id || 'Property')}\n`
    csvContent += `Generated,${csvEscape(new Date().toLocaleString())}\n`
    csvContent += '\n'
    csvContent += 'Metric,Value\n'
    financialPerformanceRows.value.forEach((row) => {
      const rendered = row.isFormatted ? row.value : formatAmount(row.value)
      csvContent += `${csvEscape(row.label)},${csvEscape(rendered)}\n`
    })
    csvContent += '\n'
    csvContent += '=== PROPERTY TRANSACTIONS (YTD) ===\n'
    csvContent += 'Date,Type,Amount,Status,Tenant,Lease ID\n'
    selectedPropertyTransactions.value
      .filter((item) => isThisYear(item.transac_date || item.created_datetime || item.date))
      .forEach((item) => {
        csvContent +=
          [
            csvEscape(formatDate(item.transac_date || item.created_datetime || item.date)),
            csvEscape(item.transac_type || item.type || 'Transaction'),
            csvEscape(formatAmount(item.amount)),
            csvEscape(normalizeStatus(item.status)),
            csvEscape(item.tenant_name || item.tenant_email || ''),
            csvEscape(item.lease_id || ''),
          ].join(',') + '\n'
      })
    downloadCsv(csvContent, 'Financial_Performance')
  } catch (error) {
    console.error('Error exporting financial performance CSV:', error)
    Notify.create({
      type: 'negative',
      message: 'Failed to export financial performance CSV.',
      position: 'top',
    })
  }
}

const printFinancialPerformanceSummary = () => {
  const kpiHtml = financialPerformanceRows.value
    .map((row) => {
      const rendered = row.isFormatted ? row.value : formatAmount(row.value)
      return `<div class="kpi"><div class="kpi-label">${row.label}</div><div class="kpi-value">${rendered}</div></div>`
    })
    .join('')
  openPrintWindow('Handout Financial Performance', `<div class="kpi-grid">${kpiHtml}</div>`)
}

const downloadTaxPackageCsv = () => {
  try {
    let csvContent = ''
    csvContent += '=== OWNER VIEW TAX PACKAGE ===\n'
    csvContent += `Property,${csvEscape(selectedProperty.value?.nickname || selectedProperty.value?.address || selectedProperty.value?.id || 'Property')}\n`
    csvContent += `Generated,${csvEscape(new Date().toLocaleString())}\n`
    csvContent += `Basis,${csvEscape('Cash basis')}\n`
    csvContent += '\n'
    csvContent += 'Category,Amount\n'
    taxRows.value.forEach((row) => {
      csvContent += `${csvEscape(row.label)},${csvEscape(formatAmount(row.amount))}\n`
    })
    csvContent += '\n'
    csvContent += '=== SUPPORTING TRANSACTIONS (YTD) ===\n'
    csvContent += 'Date,Type,Tax Category,Amount,Status,Lease ID\n'
    selectedPropertyTransactions.value
      .filter((item) => isThisYear(item.transac_date || item.created_datetime || item.date))
      .forEach((item) => {
        csvContent +=
          [
            csvEscape(formatDate(item.transac_date || item.created_datetime || item.date)),
            csvEscape(item.transac_type || item.type || 'Transaction'),
            csvEscape(normalizeTaxCategory(item).replaceAll('_', ' ')),
            csvEscape(formatAmount(item.amount)),
            csvEscape(normalizeStatus(item.status)),
            csvEscape(item.lease_id || ''),
          ].join(',') + '\n'
      })
    downloadCsv(csvContent, 'Tax_Package')
  } catch (error) {
    console.error('Error exporting tax package CSV:', error)
    Notify.create({
      type: 'negative',
      message: 'Failed to export tax package CSV.',
      position: 'top',
    })
  }
}

const printTaxPackageSummary = () => {
  const rowsHtml = taxRows.value
    .map((row) => `<tr><td>${row.label}</td><td>${formatAmount(row.amount)}</td></tr>`)
    .join('')
  openPrintWindow(
    'Handout Tax Package',
    `<table><thead><tr><th>Category</th><th>Amount</th></tr></thead><tbody>${rowsHtml}</tbody></table>`,
  )
}

const createCoreCashFlowChart = (Chart) => {
  if (!coreCashFlowChartCanvas.value) return
  const ctx = coreCashFlowChartCanvas.value.getContext('2d')
  if (coreCashFlowChart) coreCashFlowChart.destroy()

  const months = getMonthsForChartRange()
  const monthly = {}
  months.forEach((month) => {
    monthly[month.key] = { income: 0, expense: 0 }
  })

  selectedPropertyTransactions.value.forEach((item) => {
    const date = toDateSafe(item.transac_date || item.created_datetime || item.date)
    if (!date) return
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    if (!monthly[key]) return
    const amount = amountNumber(item.amount)
    if (isIncomeTransaction(item)) monthly[key].income += amount
    else monthly[key].expense += amount
  })

  coreCashFlowChart = new Chart(ctx, {
    data: {
      labels: months.map((month) => month.label),
      datasets: [
        {
          type: 'bar',
          label: 'Income',
          data: months.map((month) => monthly[month.key].income),
          backgroundColor: 'rgba(34, 197, 94, 0.7)',
          borderColor: 'rgba(34, 197, 94, 1)',
          borderWidth: 1,
        },
        {
          type: 'bar',
          label: 'Expenses',
          data: months.map((month) => monthly[month.key].expense),
          backgroundColor: 'rgba(239, 68, 68, 0.7)',
          borderColor: 'rgba(239, 68, 68, 1)',
          borderWidth: 1,
        },
        {
          type: 'line',
          label: 'Net Cash Flow',
          data: months.map((month) => monthly[month.key].income - monthly[month.key].expense),
          borderColor: 'rgba(37, 99, 235, 1)',
          backgroundColor: 'rgba(37, 99, 235, 0.15)',
          tension: 0.35,
          fill: false,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: { legend: { position: 'top' } },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { callback: (value) => `$${Number(value).toLocaleString()}` },
        },
      },
    },
  })
}

const createMaintenanceChart = (Chart) => {
  if (!maintenanceChartCanvas.value) return
  const ctx = maintenanceChartCanvas.value.getContext('2d')
  if (maintenanceChart) maintenanceChart.destroy()

  const months = getMonthsForChartRange()
  const monthly = {}
  months.forEach((month) => {
    monthly[month.key] = { open: 0, closed: 0, resolutionDays: [] }
  })

  selectedPropertyTasks.value.forEach((task) => {
    const reportDate = toDateSafe(task.report_date || task.created_at || task.createAt)
    if (!reportDate) return
    const key = `${reportDate.getFullYear()}-${String(reportDate.getMonth() + 1).padStart(2, '0')}`
    if (!monthly[key]) return

    const status = String(task.status || 'open').toLowerCase()
    if (status === 'resolved' || status === 'closed') {
      monthly[key].closed += 1
      const resolveDate = toDateSafe(task.resolv_date || task.updated_at)
      if (resolveDate) {
        const days = Math.max(0, Math.floor((resolveDate - reportDate) / (1000 * 60 * 60 * 24)))
        monthly[key].resolutionDays.push(days)
      }
    } else {
      monthly[key].open += 1
    }
  })

  maintenanceChart = new Chart(ctx, {
    data: {
      labels: months.map((month) => month.label),
      datasets: [
        {
          type: 'bar',
          label: 'Open Tasks',
          data: months.map((month) => monthly[month.key].open),
          backgroundColor: 'rgba(245, 158, 11, 0.65)',
        },
        {
          type: 'bar',
          label: 'Closed Tasks',
          data: months.map((month) => monthly[month.key].closed),
          backgroundColor: 'rgba(34, 197, 94, 0.65)',
        },
        {
          type: 'line',
          label: 'Avg Resolution Days',
          data: months.map((month) => {
            const values = monthly[month.key].resolutionDays
            if (!values.length) return 0
            return values.reduce((sum, day) => sum + day, 0) / values.length
          }),
          borderColor: 'rgba(59, 130, 246, 1)',
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          tension: 0.35,
          yAxisID: 'y1',
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: { legend: { position: 'top' } },
      scales: {
        y: { beginAtZero: true, position: 'left' },
        y1: {
          beginAtZero: true,
          position: 'right',
          grid: { drawOnChartArea: false },
          ticks: { callback: (value) => `${Number(value).toFixed(0)}d` },
        },
      },
    },
  })
}

const updateCharts = async () => {
  if (!selectedProperty.value) return
  const Chart = (await import('chart.js/auto')).default
  createCoreCashFlowChart(Chart)
  createMaintenanceChart(Chart)
}

const openTransactionDialog = (item) => {
  selectedTransaction.value = item
  transactionDialogOpen.value = true
}

const handleTransactionListSelect = (item) => {
  transactionListDialogOpen.value = false
  openTransactionDialog(item)
}

const openTaskDialog = (item) => {
  selectedTask.value = item
  taskDialogOpen.value = true
}

const handleTaskListSelect = (item) => {
  taskHistoryDialogOpen.value = false
  openTaskDialog(item)
}

const openLeaseDialog = (item) => {
  if (!item) return
  selectedLease.value = item
  leaseDialogOpen.value = true
}

const handleLeaseListSelect = (item) => {
  leaseHistoryDialogOpen.value = false
  openLeaseDialog(item)
}

const selectProperty = (propertyId) => {
  selectedPropertyId.value = propertyId
  propertyPickerDialogOpen.value = false
}

const getLeaseDisplayTenantName = (lease) =>
  lease?.tenant_name || lease?.tenant_email || lease?.tenant_id || 'N/A'

const normalizeStatus = (status) => {
  const normalized = String(status || '').trim()
  if (!normalized) return 'N/A'
  return normalized.replace(/_/g, ' ')
}

const formatDate = (date) => {
  const value = toDateObject(date)
  return value
    ? value.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '—'
}

const formatAmount = (amount) => {
  const num = Number(amount)
  if (!Number.isFinite(num)) return '$0.00'
  return num.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}

const formatPercent = (value) => `${Math.round(Number(value || 0) * 100)}%`

const getStatusColor = (status) => {
  const normalized = String(status || 'open').toLowerCase()
  if (
    ['closed', 'completed', 'resolved', 'paid', 'active', 'occupied', 'rented'].includes(normalized)
  )
    return 'positive'
  if (['cancel', 'cancelled', 'revoked', 'expired'].includes(normalized)) return 'negative'
  if (['in_progress', 'in progress', 'working', 'late', 'overdue', 'pending'].includes(normalized))
    return 'warning'
  return 'primary'
}

watch(
  [selectedPropertyId, selectedPropertyTransactions, selectedPropertyTasks, selectedPropertyLeases],
  () => {
    if (!selectedProperty.value) return
    updateCharts().catch((error) => {
      console.error('Failed to update handout charts:', error)
    })
  },
  { deep: true },
)

onMounted(() => {
  if (!selectedProperty.value) return
  updateCharts().catch((error) => {
    console.error('Failed to initialize handout charts:', error)
  })
})

onUnmounted(() => {
  if (coreCashFlowChart) coreCashFlowChart.destroy()
  if (maintenanceChart) maintenanceChart.destroy()
})
</script>

<style scoped>
.owner-view__hero {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.owner-view__empty {
  min-height: 50vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.summary-card,
.panel-card,
.detail-dialog {
  border-radius: 8px !important;
}

.summary-label,
.financial-label,
.section-mini-label {
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #6b7280;
}

.summary-value {
  margin-top: 8px;
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
}

.summary-value--tenant {
  font-size: 1.15rem;
  line-height: 1.35;
}

.summary-sub {
  margin-top: 6px;
  font-size: 0.9rem;
  color: #6b7280;
}

.summary-sub--stack {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.property-picker-card {
  width: 100%;
  border: 1px solid #dbe3f0;
  border-radius: var(--border-radius-card);
  background: linear-gradient(135deg, #f8fbff 0%, #ffffff 100%);
  padding: 18px 20px;
  text-align: left;
  cursor: pointer;
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease,
    border-color 0.15s ease;
}

.property-picker-card:hover {
  transform: translateY(-1px);
  border-color: #9ec5ff;
  box-shadow: 0 10px 24px rgba(37, 99, 235, 0.08);
}

.property-picker-card__layout {
  display: grid;
  grid-template-columns: minmax(280px, 1.1fr) minmax(320px, 1fr);
  gap: 20px;
  align-items: start;
}

.property-picker-card__left {
  min-width: 0;
}

.property-picker-card__right {
  min-width: 0;
}

.property-picker-card__eyebrow {
  font-size: 0.76rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #6b7280;
}

.property-picker-card__title {
  margin-top: 8px;
  font-size: 1.2rem;
  font-weight: 700;
  color: #0f172a;
}

.property-picker-card__sub {
  margin-top: 6px;
  color: #475569;
  font-size: 0.95rem;
}

.property-detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px 14px;
}

.property-detail-item {
  border: 1px solid #dbe3f0;
  border-radius: var(--border-radius-card);
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.86);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.property-detail-label {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #64748b;
}

.property-detail-value {
  font-size: 0.92rem;
  font-weight: 700;
  color: #0f172a;
}

.property-picker-card__cta {
  margin-top: 12px;
  color: #2563eb;
  font-size: 0.9rem;
  font-weight: 600;
}

.property-picker-dialog {
  width: min(680px, 92vw);
  border-radius: 8px !important;
}

.section-mini-label {
  margin-bottom: 8px;
  font-weight: 700;
}

.info-grid,
.detail-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-row,
.detail-row {
  display: flex;
  justify-content: space-between;
  gap: 16px;
}

.detail-row--stack {
  flex-direction: column;
}

.info-label,
.detail-row span {
  color: #6b7280;
}

.info-value {
  font-weight: 600;
  color: #111827;
  text-align: right;
}

.financial-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.financial-item {
  border: 1px solid #e5e7eb;
  border-radius: var(--border-radius-card);
  padding: 14px;
  background: linear-gradient(180deg, #fafcff 0%, #ffffff 100%);
}

.financial-value {
  margin-top: 8px;
  font-size: 1.1rem;
  font-weight: 700;
  color: #111827;
}

.core-charts-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.chart-card {
  border-radius: var(--border-radius-card);
}

.chart-container {
  position: relative;
  min-height: 300px;
}

.detail-dialog {
  width: min(720px, 92vw);
}

@media (max-width: 768px) {
  .owner-view__hero {
    flex-direction: column;
  }

  .financial-grid {
    grid-template-columns: 1fr;
  }

  .core-charts-grid {
    grid-template-columns: 1fr;
  }

  .property-picker-card__layout {
    grid-template-columns: 1fr;
  }

  .property-detail-grid {
    grid-template-columns: 1fr;
  }

  .info-row,
  .detail-row {
    flex-direction: column;
    gap: 4px;
  }

  .info-value {
    text-align: left;
  }
}
</style>
