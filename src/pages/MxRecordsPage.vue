<template>
  <q-page class="q-pa-md">
    <div class="row justify-end q-mb-md">
      <div class="row q-gutter-sm">
        <q-btn
          v-if="canManageRecords"
          @click="openCreateMxRecordDialog"
          color="primary"
          text-color="white"
          unelevated
          icon="add"
          label="Create Task"
        />
      </div>
    </div>

    <q-dialog
      v-model="showCreateMxRecordComposer"
      persistent
      maximized
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card class="create-fullscreen-card">
        <q-card-section class="create-fullscreen-body">
          <CreateMxRecord
            @mxrecord-created="onMxRecordCreated"
            @cancel="closeCreateMxRecordDialog"
          />
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Filters Row -->
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12">
        <div class="row q-gutter-sm">
          <div class="col-12 col-md-7">
            <q-input
              v-model="searchQuery"
              outlined
              dense
              placeholder="Search tasks..."
              clearable
              bg-color="grey-1"
            >
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>
          <div class="col-12 col-md-5">
            <q-select
              v-model="dateFilter"
              :options="dateFilterOptions"
              label="Filter by Time"
              outlined
              dense
              clearable
              bg-color="grey-1"
            >
              <template v-slot:prepend>
                <q-icon name="date_range" />
              </template>
            </q-select>
          </div>
        </div>
      </div>
    </div>

    <!-- Summary Stats -->
    <div class="row q-gutter-md q-mb-md">
      <q-card
        class="summary-card cursor-pointer"
        :class="{ 'filter-active': activeFilter === 'all' }"
        @click="setFilter('all')"
      >
        <q-card-section class="text-center">
          <div class="text-h6 text-primary">{{ filteredMxRecords.length }}</div>
          <div class="text-caption">Total Tasks</div>
        </q-card-section>
      </q-card>
      <q-card
        class="summary-card cursor-pointer"
        :class="{ 'filter-active': activeFilter === 'open' }"
        @click="setFilter('open')"
      >
        <q-card-section class="text-center">
          <div class="text-h6 text-orange">{{ openRecords.length }}</div>
          <div class="text-caption">Open</div>
        </q-card-section>
      </q-card>
      <q-card
        class="summary-card cursor-pointer"
        :class="{ 'filter-active': activeFilter === 'closed' }"
        @click="setFilter('closed')"
      >
        <q-card-section class="text-center">
          <div class="text-h6 text-green">{{ closedRecords.length }}</div>
          <div class="text-caption">Closed</div>
        </q-card-section>
      </q-card>
      <q-card
        class="summary-card cursor-pointer"
        :class="{ 'filter-active': activeFilter === 'cancel' }"
        @click="setFilter('cancel')"
      >
        <q-card-section class="text-center">
          <div class="text-h6 text-red">{{ cancelRecords.length }}</div>
          <div class="text-caption">Cancelled</div>
        </q-card-section>
      </q-card>
      <q-card
        class="summary-card cursor-pointer"
        :class="{ 'filter-active': activeFilter === 'published' }"
        @click="setFilter('published')"
      >
        <q-card-section class="text-center">
          <div class="text-h6 text-positive">{{ publishedRecords.length }}</div>
          <div class="text-caption">Published to SP</div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Active Filter Display -->
    <div v-if="activeFilter !== 'all'" class="q-mb-md">
      <q-chip
        :color="getFilterColor(activeFilter)"
        text-color="white"
        removable
        @remove="clearFilter"
      >
        <q-icon :name="getFilterIcon(activeFilter)" class="q-mr-xs" />
        {{ getFilterLabel(activeFilter) }}
        <q-badge color="white" text-color="black" class="q-ml-xs">
          {{ getFilteredCount() }}
        </q-badge>
      </q-chip>
    </div>

    <div v-if="userDataStore.mxRecordsLoading" class="text-center q-pa-lg">
      <q-spinner-dots size="50px" color="primary" />
      <div class="q-mt-sm">Loading tasks...</div>
    </div>

    <div v-else-if="filteredMxRecords.length === 0" class="text-center q-pa-lg">
      <q-icon name="dns" size="100px" color="grey-4" />
      <div class="text-h6 q-mt-md text-grey-6">
        {{ searchQuery ? 'No tasks found matching your search' : 'No tasks found' }}
      </div>
      <div class="text-body2 text-grey-6 q-mt-sm">
        {{
          searchQuery
            ? 'Try adjusting your search terms'
            : "You don't have any tasks for your properties yet."
        }}
      </div>
    </div>

    <div v-else class="mx-records-list">
      <q-card
        v-for="(mxRecord, mxRecordIndex) in filteredMxRecords"
        :key="mxRecord.id || mxRecord.mx_id || `mx-${mxRecordIndex}`"
        class="mxrecord-row clickable-row"
        @click="viewMxRecord(mxRecord)"
      >
        <q-card-section class="mxrecord-row-content">
          <!-- Property and Description -->
          <div class="mxrecord-description">
            <div class="description-title">{{ getPropertyName(mxRecord.property_id) }}</div>
          </div>
          <div class="mxrecord-description">
            <div class="description-property">{{ mxRecord.description || 'No Description' }}</div>
          </div>

          <!-- Date -->
          <div class="mxrecord-date">
            <div class="date-label">Reported</div>
            <div class="date-value">{{ formatDate(mxRecord.report_date) }}</div>
          </div>

          <!-- Reported By -->
          <div class="mxrecord-reporter">
            <div class="reporter-label">Reported By</div>
            <div class="reporter-value">{{ getReportedBy(mxRecord) }}</div>
            <div class="reporter-role">{{ getReportedRole(mxRecord) }}</div>
          </div>

          <!-- Status -->
          <div class="mxrecord-status">
            <q-chip
              :color="getStatusColor(mxRecord.status)"
              text-color="white"
              size="md"
              class="status-chip"
            >
              {{ mxRecord.status || 'open' }}
            </q-chip>
            <q-chip
              v-if="isTaskPublished(mxRecord)"
              color="positive"
              text-color="white"
              size="sm"
              class="status-chip q-mt-xs"
              icon="flag"
            >
              Published to SP
            </q-chip>
          </div>

          <!-- Add Comment Button (only action remaining) -->
          <div class="mxrecord-actions">
            <q-btn
              v-if="canManageRecords"
              outline
              color="primary"
              label="Add Comment"
              class="action-btn"
              @click.stop="addComment(mxRecord)"
            />
          </div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>

  <!-- Task Details Panel -->
  <DetailShell
    v-model="showMxRecordDialog"
    title="Task Details"
    :subtitle="selectedMxRecord?.description || ''"
    @close="closeMxRecordDialog"
  >
    <template #actions>
      <q-btn
        v-if="canManageRecords"
        outline
        color="primary"
        icon="photo_camera"
        label="Add Photos"
        size="sm"
        class="dialog-action-btn"
        @click="addPhotosToMxRecord"
      />
      <q-btn
        v-if="canManageRecords"
        outline
        color="primary"
        label="Add Comment"
        size="sm"
        class="dialog-action-btn"
        @click="addCommentFromDialog"
      />
      <q-btn
        v-if="canManageRecords && selectedMxRecord"
        unelevated
        :color="isTaskPublished(selectedMxRecord) ? 'positive' : 'deep-orange'"
        text-color="white"
        icon="publish"
        :label="getPublishTaskButtonLabel(selectedMxRecord)"
        size="sm"
        class="dialog-action-btn publish-task-btn"
        :loading="publishingTaskToSp"
        @click="openTaskPublishDialog(selectedMxRecord, 'detail')"
      />
    </template>

    <div class="dialog-content">
        <div v-if="selectedMxRecord" class="mxrecord-details-layout">
          <div class="mxrecord-details-full">
          <q-banner
            v-if="selectedMxRecord.assigned_sp"
            rounded
            class="assigned-sp-banner q-mb-md"
          >
            <div class="assigned-sp-row">
              <div class="assigned-sp-main">
                <div class="assigned-sp-title">Assigned SP</div>
                <div class="assigned-sp-name">{{ selectedMxRecord.assigned_sp.sp_name || selectedMxRecord.assigned_sp.sp_id }}</div>
                <div class="assigned-sp-meta">
                  <span>Bid: ${{ Number(selectedMxRecord.assigned_sp.bid_amount || 0).toLocaleString() }}</span>
                  <span>Assigned: {{ formatDate(selectedMxRecord.assigned_sp.assigned_at) }}</span>
                </div>
              </div>
              <div class="assigned-sp-actions">
                <q-btn
                  dense
                  flat
                  color="primary"
                  icon="person"
                  label="View"
                  @click="openAssignedSpDetailDialog"
                />
                <q-btn
                  v-if="canManageRecords"
                  dense
                  flat
                  color="negative"
                  icon="close"
                  label="Unassign"
                  @click="clearAssignedSp"
                />
              </div>
            </div>
          </q-banner>

          <q-banner
            v-if="isTaskPublished(selectedMxRecord)"
            rounded
            class="bg-green-1 text-green-10 q-mb-md"
          >
            <q-icon name="flag" class="q-mr-xs" />
            Flag: This task has been published to service providers.
          </q-banner>

          <!-- Basic Information -->
          <div class="details-section">
            <div class="section-title">Basic Information</div>
            <div class="details-grid">
              <div class="detail-item">
                <div class="detail-label">MX ID</div>
                <div class="detail-value">{{ selectedMxRecord.mx_id || 'N/A' }}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Description</div>
                <div class="detail-value">
                  {{ selectedMxRecord.description || 'No Description' }}
                </div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Status</div>
                <div class="detail-value">
                  <q-chip
                    :color="getStatusColor(selectedMxRecord.status)"
                    text-color="white"
                    size="sm"
                  >
                    {{ selectedMxRecord.status || 'open' }}
                  </q-chip>
                </div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Property</div>
                <div class="detail-value">{{ getPropertyName(selectedMxRecord.property_id) }}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">SP Publish Status</div>
                <div class="detail-value">
                  <q-chip
                    :color="isTaskPublished(selectedMxRecord) ? 'positive' : 'grey-6'"
                    text-color="white"
                    size="sm"
                  >
                    {{ isTaskPublished(selectedMxRecord) ? 'Published' : 'Not Published' }}
                  </q-chip>
                  <div v-if="selectedMxRecord.sp_published_at" class="text-caption text-grey-7 q-mt-xs">
                    Last publish: {{ formatDate(selectedMxRecord.sp_published_at) }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Reporting Information -->
          <div class="details-section">
            <div class="section-title">Reporting Information</div>
            <div class="details-grid">
              <div class="detail-item">
                <div class="detail-label">Reported By</div>
                <div class="detail-value">{{ getReportedBy(selectedMxRecord) }}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Reporter Role</div>
                <div class="detail-value">{{ getReportedRole(selectedMxRecord) }}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Report Date</div>
                <div class="detail-value">{{ formatDate(selectedMxRecord.report_date) }}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Created</div>
                <div class="detail-value">{{ formatDate(selectedMxRecord.createAt) }}</div>
              </div>
            </div>
          </div>

          <!-- Images Section -->
          <div
            v-if="selectedMxRecord.image_urls && selectedMxRecord.image_urls.length > 0"
            class="details-section"
          >
            <div class="section-title">
              <q-icon name="photo_library" class="q-mr-sm" />
              Attached Images ({{ selectedMxRecord.image_urls.length }})
            </div>
            <div class="images-grid">
              <div
                v-for="(imageUrl, index) in selectedMxRecord.image_urls"
                :key="index"
                class="image-preview-container"
              >
                <q-img
                  :src="imageUrl"
                  class="image-preview cursor-pointer"
                  fit="cover"
                  @click="viewImageFullscreen(imageUrl, index)"
                >
                  <div class="absolute-bottom text-caption image-overlay">
                    Image {{ index + 1 }}
                  </div>
                  <q-tooltip>Click to view full size</q-tooltip>
                </q-img>
              </div>
            </div>
          </div>

          <!-- Activity Log -->
          <div
            v-if="selectedMxRecordLogs.length > 0"
            class="details-section"
          >
            <div class="section-title">Activity Log</div>
            <div class="activity-log">
              <div
                v-for="(log, logIndex) in selectedMxRecordLogs"
                :key="log.log_timestamp || `log-${logIndex}`"
                class="log-entry"
              >
                <div class="log-header">
                  <div class="log-user">
                    <strong>{{ log.user_name }}</strong>
                    <span class="log-role">({{ log.user_role }})</span>
                  </div>
                  <div class="log-actions">
                    <q-btn
                      flat
                      dense
                      round
                      icon="photo_camera"
                      color="primary"
                      size="sm"
                      @click="addPhotosToComment(log)"
                      class="add-comment-photos-btn"
                    >
                      <q-tooltip>Add photos to this comment</q-tooltip>
                    </q-btn>
                    <div class="log-time">{{ formatDate(log.log_timestamp) }}</div>
                  </div>
                </div>
                <div class="log-comment">{{ log.comment }}</div>
                <!-- Display existing comment images if any -->
                <div v-if="log.image_urls && log.image_urls.length > 0" class="log-images q-mt-sm">
                  <div class="text-caption q-mb-xs">Attached Images:</div>
                  <div class="row q-gutter-xs">
                    <q-img
                      v-for="(imageUrl, imgIndex) in log.image_urls"
                      :key="imgIndex"
                      :src="imageUrl"
                      style="width: 60px; height: 60px"
                      class="rounded-borders cursor-pointer"
                      fit="cover"
                      @click="
                        viewCommentImageFullscreen(imageUrl, imgIndex, log.image_urls, log.comment)
                      "
                    >
                      <q-tooltip>Click to view full image</q-tooltip>
                    </q-img>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="details-section">
            <div class="section-title row items-center justify-between">
              <span>Task Transactions</span>
              <q-btn
                v-if="canManageRecords"
                flat
                dense
                color="primary"
                icon="add"
                label="Add Transaction"
                @click="openTaskTransactionEntry"
              />
            </div>
            <div v-if="loadingTaskTransactions" class="text-center q-pa-sm">
              <q-spinner-dots size="28px" color="primary" />
            </div>
            <div
              v-else-if="selectedTaskTransactionRows.length === 0"
              class="text-caption text-grey-6"
            >
              No transactions linked to this task yet.
            </div>
            <q-list v-else separator bordered class="rounded-borders">
              <q-item
                v-for="transaction in selectedTaskTransactionRows"
                :key="transaction.id"
              >
                <q-item-section>
                  <q-item-label>
                    {{ transaction.transac_type || 'Transaction' }} ·
                    ${{ formatTransactionAmount(transaction.amount) }}
                  </q-item-label>
                  <q-item-label caption>
                    {{ transaction.transac_from || 'Unknown' }} ->
                    {{ transaction.transac_to || 'Unknown' }} ·
                    {{ formatDate(transaction.transac_date || transaction.created_datetime) }}
                  </q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
            <div v-if="selectedTaskTransactionRows.length > 0" class="text-caption text-grey-7 q-mt-sm">
              Total cost: ${{ formatTransactionAmount(taskTransactionsTotal) }}
            </div>
          </div>
          </div>

          <q-card v-if="loadingTaskBids || taskBids.length > 0" class="task-bids-side-panel" flat bordered>
            <q-card-section>
              <div class="sp-panel-header q-mb-xs">
                <div>
                  <div class="text-subtitle2 text-weight-bold">Bids</div>
                  <div class="text-caption text-grey-7">
                    Select one bid to keep only that bid visible.
                  </div>
                </div>
                <q-btn
                  v-if="showOnlySelectedBid && taskBids.length > 1"
                  flat
                  dense
                  no-caps
                  color="primary"
                  label="Show All"
                  @click="showOnlySelectedBid = false"
                />
              </div>

              <div v-if="loadingTaskBids" class="text-center q-pa-sm">
                <q-spinner-dots size="22px" color="primary" />
              </div>
              <div v-else class="task-bid-rows">
                <div
                  v-for="bid in visibleTaskBids"
                  :key="bid.id || bid.bid_id"
                  class="task-bid-row cursor-pointer"
                  :class="{ 'task-bid-row--assigned': isBidAssigned(bid) }"
                  @click="openTaskBidDetailDialog(bid)"
                >
                  <div class="task-bid-main">
                    <div class="task-bid-sp-wrap">
                      <q-btn
                        flat
                        dense
                        no-caps
                        class="task-bid-sp-link"
                        :label="getBidSpName(bid)"
                        @click.stop="openBidSpDetailDialog(bid)"
                      />
                    </div>
                    <span class="task-bid-amount"
                      >${{ Number(bid.amount || 0).toLocaleString() }}</span
                    >
                  </div>
                  <div class="task-bid-meta">
                    <span>{{ bid.status || 'submitted' }}</span>
                    <span>{{ formatDate(bid.created_at) }}</span>
                  </div>
                  <div class="task-bid-actions">
                    <q-chip
                      v-if="isBidSelected(bid)"
                      dense
                      size="sm"
                      color="positive"
                      text-color="white"
                      icon="check_circle"
                    >
                      Selected
                    </q-chip>
                    <q-btn
                      v-else-if="canManageRecords"
                      dense
                      flat
                      size="sm"
                      color="primary"
                      icon="task_alt"
                      label="Select Bid"
                      @click.stop="selectBidAndHideOthers(bid)"
                    />
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>

          <q-card v-if="showSpRecommendationPanel" class="sp-recommendations-panel" flat bordered>
            <q-card-section>
              <div class="sp-panel-header q-mb-sm">
                <div>
                  <div class="text-subtitle1 text-weight-bold">Recommended SP</div>
                  <div class="text-caption text-grey-7">
                    Primary decision surface for contact and quote.
                  </div>
                </div>
                <q-btn
                  flat
                  round
                  dense
                  :icon="showRecommendedSp ? 'expand_less' : 'expand_more'"
                  @click="showRecommendedSp = !showRecommendedSp"
                />
              </div>

              <div v-show="showRecommendedSp">
                <div v-if="loadingRecommendedSps" class="text-center q-pa-md">
                  <q-spinner-dots size="28px" color="primary" />
                </div>
                <div v-else-if="recommendedSps.length === 0" class="text-grey-6 text-caption">
                  No recommendations available for this task yet.
                </div>
                <div v-else class="sp-recommendation-list">
                  <q-card
                    v-for="sp in recommendedSps"
                    :key="sp.sp_id"
                    class="sp-recommendation-card"
                    flat
                    bordered
                  >
                    <q-card-section class="sp-recommendation-content">
                      <div class="sp-row-top">
                        <div class="sp-row-title-wrap">
                          <div class="sp-row-title">{{ sp.sp_name || sp.display_name }}</div>
                          <div class="sp-row-subtitle">{{ sp.service_area || 'N/A' }}</div>
                        </div>
                        <q-btn
                          dense
                          flat
                          round
                          color="accent"
                          icon="bookmark_add"
                          size="sm"
                          @click="saveSpCard(sp)"
                        >
                          <q-tooltip>Save Biz Card</q-tooltip>
                        </q-btn>
                      </div>
                      <div class="q-mt-xs">
                        <q-chip size="sm" color="teal" text-color="white" class="sp-rating-chip">
                          Rating: {{ sp.rating || sp.rating_avg || 'N/A' }}
                        </q-chip>
                      </div>

                      <div class="sp-row-actions">
                        <q-btn
                          dense
                          flat
                          color="primary"
                          icon="chat"
                          label="Contact"
                          @click="contactRecommendedSp(sp)"
                        />
                        <q-btn
                          dense
                          flat
                          color="secondary"
                          icon="request_quote"
                          label="Request Quote"
                          @click="requestQuoteFromSp(sp)"
                        />
                      </div>
                    </q-card-section>
                  </q-card>
                </div>
              </div>

              <template v-if="loadingTaskBids || taskBids.length > 0">
                <q-separator class="q-my-sm" />

                <div class="sp-panel-header q-mb-xs">
                  <div>
                    <div class="text-subtitle2 text-weight-bold">Bids</div>
                    <div class="text-caption text-grey-7">All bids for this task</div>
                  </div>
                  <q-btn
                    flat
                    round
                    dense
                    :icon="showTaskBids ? 'expand_less' : 'expand_more'"
                    @click="showTaskBids = !showTaskBids"
                  />
                </div>

                <div v-show="showTaskBids" class="task-bids-section">
                  <div v-if="loadingTaskBids" class="text-center q-pa-sm">
                    <q-spinner-dots size="22px" color="primary" />
                  </div>
                  <div v-else class="task-bid-rows">
                    <div
                      v-for="bid in taskBids"
                      :key="bid.id || bid.bid_id"
                      class="task-bid-row cursor-pointer"
                      :class="{ 'task-bid-row--assigned': isBidAssigned(bid) }"
                      @click="openTaskBidDetailDialog(bid)"
                    >
                      <div class="task-bid-main">
                        <div class="task-bid-sp-wrap">
                          <q-btn
                            flat
                            dense
                            no-caps
                            class="task-bid-sp-link"
                            :label="getBidSpName(bid)"
                            @click.stop="openBidSpDetailDialog(bid)"
                          />
                          <q-chip
                            dense
                            size="sm"
                            color="teal"
                            text-color="white"
                            class="task-bid-rating-chip"
                          >
                            {{ getBidSpRatingLabel(bid) }}
                          </q-chip>
                        </div>
                        <span class="task-bid-amount"
                          >${{ Number(bid.amount || 0).toLocaleString() }}</span
                        >
                      </div>
                      <div class="task-bid-meta">
                        <span>{{ bid.status || 'submitted' }}</span>
                        <span>{{ formatDate(bid.created_at) }}</span>
                      </div>
                      <div class="task-bid-actions">
                        <q-btn
                          dense
                          flat
                          size="sm"
                          color="primary"
                          icon="chat"
                          label="Chat"
                          @click.stop="openBidConversation(bid)"
                        />
                        <q-btn
                          v-if="canManageRecords"
                          dense
                          flat
                          size="sm"
                          :color="getBidAssignBtnColor(bid)"
                          :icon="getBidAssignBtnIcon(bid)"
                          :label="getBidAssignBtnLabel(bid)"
                          :disable="isBidAssigned(bid)"
                          @click.stop="assignTaskToBidSp(bid)"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </template>
            </q-card-section>
          </q-card>
        </div>
    </div>
  </DetailShell>

  <q-dialog v-model="showTaskPublishDialog" persistent>
    <q-card style="min-width: 440px; max-width: 640px">
      <q-card-section class="row items-center justify-between">
        <div class="text-subtitle1 text-weight-bold">
          {{
            taskPublishDialogSource === 'create'
              ? 'Task Saved: Publish to Service Provider?'
              : getPublishTaskButtonLabel(activeTaskPublishTarget)
          }}
        </div>
        <q-btn
          v-if="!publishingTaskToSp"
          flat
          round
          dense
          icon="close"
          @click="cancelTaskPublishDialog"
        />
      </q-card-section>
      <q-separator />
      <q-card-section class="q-gutter-sm">
        <div class="text-body2">
          {{ activeTaskPublishTarget?.description || 'This task' }}
        </div>
        <q-banner rounded class="bg-orange-1 text-orange-10">
          Disclaimer: task comments will also be published to service providers.
        </q-banner>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn
          flat
          color="primary"
          label="No"
          :disable="publishingTaskToSp"
          @click="cancelTaskPublishDialog"
        />
        <q-btn
          unelevated
          color="primary"
          :label="isTaskPublished(activeTaskPublishTarget) ? 'Republish' : 'Publish'"
          :loading="publishingTaskToSp"
          @click="confirmTaskPublishDialog"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <!-- Add Comment Dialog -->
  <q-dialog v-if="canManageRecords" v-model="showCommentDialog" persistent>
    <q-card style="min-width: 500px">
      <q-card-section>
        <div class="row items-center justify-between">
          <div>
            <div class="text-h6">Add Comment to Task</div>
            <div class="text-caption text-grey-6 q-mt-xs">
              {{ selectedMxRecord?.description || 'No Description' }}
            </div>
          </div>
          <q-btn
            flat
            round
            dense
            icon="close"
            @click="closeCommentDialog"
            class="dialog-close-btn"
          />
        </div>
      </q-card-section>

      <q-card-section>
        <q-form @submit="submitComment" class="q-gutter-md">
          <q-input
            v-model="newComment.comment"
            label="Comment"
            type="textarea"
            outlined
            rows="4"
            :rules="[(val) => !!val || 'Comment is required']"
            placeholder="Enter your comment or update about this task..."
          />

          <q-select
            v-model="newComment.action_type"
            :options="actionTypeOptions"
            label="Action Type"
            outlined
            :rules="[(val) => !!val || 'Action type is required']"
            emit-value
            map-options
          />

          <!-- Picture Upload Section for Comments -->
          <div class="comment-picture-upload-section">
            <div class="text-subtitle2 q-mb-sm">
              <q-icon name="photo_camera" class="q-mr-xs" />
              Attach Pictures (Optional)
            </div>

            <q-file
              v-model="commentSelectedFiles"
              accept="image/*"
              outlined
              dense
              multiple
              label="Choose pictures"
              hint="Upload photos related to this comment"
              bg-color="grey-1"
              class="q-mb-sm"
              @update:model-value="onCommentFilesSelected"
            >
              <template v-slot:prepend>
                <q-icon name="attach_file" />
              </template>
            </q-file>

            <!-- Comment Image Previews -->
            <div v-if="commentImagePreviews.length > 0" class="comment-image-previews q-mb-sm">
              <div class="text-caption q-mb-xs">
                Previews ({{ commentImagePreviews.length }} image{{
                  commentImagePreviews.length > 1 ? 's' : ''
                }}):
              </div>
              <div class="row q-gutter-sm">
                <div
                  v-for="(preview, index) in commentImagePreviews"
                  :key="index"
                  class="comment-image-preview-item"
                >
                  <q-img
                    :src="preview.url"
                    style="width: 80px; height: 80px"
                    class="rounded-borders"
                    fit="cover"
                  />
                  <q-btn
                    flat
                    dense
                    round
                    icon="close"
                    color="negative"
                    size="sm"
                    class="absolute-top-right q-ma-xs"
                    @click="removeCommentImage(index)"
                  />
                  <div
                    class="text-caption text-center q-mt-xs"
                    style="max-width: 80px; font-size: 0.7rem"
                  >
                    {{
                      preview.name.length > 10
                        ? preview.name.substring(0, 10) + '...'
                        : preview.name
                    }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Add More Photos Button -->
            <div class="text-center q-mt-sm">
              <q-btn
                flat
                color="primary"
                icon="add_photo_alternate"
                label="Add More Photos"
                size="sm"
                @click="addMorePhotosToComment"
                class="add-more-photos-btn"
              >
                <q-tooltip>Select additional photos for this comment</q-tooltip>
              </q-btn>
            </div>
          </div>
        </q-form>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancel" color="primary" @click="closeCommentDialog" />
        <q-btn
          unelevated
          label="Add Comment"
          color="primary"
          @click="submitComment"
          :loading="submittingComment"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <!-- Add Photos to Task Dialog -->
  <q-dialog v-if="canManageRecords" v-model="showAddPhotosDialog" persistent>
    <q-card style="min-width: 500px">
      <q-card-section>
        <div class="text-h6">Add Photos to Task</div>
        <div class="text-caption text-grey-6 q-mt-xs">
          {{ selectedMxRecord?.description || 'No Description' }}
        </div>
      </q-card-section>

      <q-card-section>
        <!-- Picture Upload Section for Additional Photos -->
        <div class="additional-picture-upload-section">
          <div class="text-subtitle2 q-mb-sm">
            <q-icon name="photo_camera" class="q-mr-xs" />
            Add More Pictures
          </div>

          <q-file
            v-model="additionalSelectedFiles"
            accept="image/*"
            outlined
            dense
            multiple
            label="Choose pictures"
            hint="Upload additional photos for this task"
            bg-color="grey-1"
            class="q-mb-sm"
            @update:model-value="onAdditionalFilesSelected"
          >
            <template v-slot:prepend>
              <q-icon name="attach_file" />
            </template>
          </q-file>

          <!-- Additional Image Previews -->
          <div v-if="additionalImagePreviews.length > 0" class="additional-image-previews q-mb-sm">
            <div class="text-caption q-mb-xs">
              Previews ({{ additionalImagePreviews.length }} image{{
                additionalImagePreviews.length > 1 ? 's' : ''
              }}):
            </div>
            <div class="row q-gutter-sm">
              <div
                v-for="(preview, index) in additionalImagePreviews"
                :key="index"
                class="additional-image-preview-item"
              >
                <q-img
                  :src="preview.url"
                  style="width: 120px; height: 120px"
                  class="rounded-borders"
                  fit="cover"
                />
                <q-btn
                  flat
                  dense
                  round
                  icon="close"
                  color="negative"
                  size="sm"
                  class="absolute-top-right q-ma-xs"
                  @click="removeAdditionalImage(index)"
                />
                <div
                  class="text-caption text-center q-mt-xs"
                  style="max-width: 120px; font-size: 0.8rem"
                >
                  {{
                    preview.name.length > 15 ? preview.name.substring(0, 15) + '...' : preview.name
                  }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancel" color="primary" @click="closeAddPhotosDialog" />
        <q-btn
          unelevated
          label="Upload Photos"
          color="primary"
          @click="submitAdditionalPhotos"
          :loading="uploadingPhotos"
          :disable="additionalImagePreviews.length === 0"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <q-dialog
    v-model="showTaskCostPromptDialog"
    persistent
  >
    <q-card style="min-width: 420px">
      <q-card-section class="row items-center justify-between">
        <div class="text-subtitle1 text-weight-bold">Task Cost Check</div>
      </q-card-section>
      <q-separator />
      <q-card-section>
        <div class="text-body1">
          Did you pay any cost or buy any parts for this task?
        </div>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="No" color="primary" @click="resolveTaskCostDecision('no')" />
        <q-btn unelevated label="Yes" color="primary" @click="resolveTaskCostDecision('yes')" />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <q-dialog
    v-if="canManageRecords"
    v-model="showTaskTransactionDialog"
    persistent
  >
    <q-card style="min-width: 560px; max-width: 720px; width: 100%">
      <q-card-section class="row items-center justify-between">
        <div class="text-subtitle1 text-weight-bold">Create Task Transaction</div>
        <q-btn
          v-if="!requireTaskTransactionSave"
          flat
          round
          dense
          icon="close"
          @click="cancelTaskTransactionDialog"
        />
      </q-card-section>
      <q-separator />
      <q-card-section class="q-gutter-md">
        <q-select
          v-model="taskTransactionForm.transac_type"
          :options="taskTransactionTypeOptions"
          label="Transaction Type *"
          outlined
          dense
        />
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-6">
            <q-select
              v-model="taskTransactionForm.transac_from"
              :options="taskTransactionRoleOptions"
              label="Transaction From *"
              outlined
              dense
            />
          </div>
          <div class="col-12 col-md-6">
            <q-select
              v-model="taskTransactionForm.transac_to"
              :options="taskTransactionToRoleOptions"
              label="Transaction To *"
              outlined
              dense
            />
          </div>
        </div>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-6">
            <q-input
              v-model.number="taskTransactionForm.amount"
              type="number"
              step="0.01"
              min="0"
              label="Amount *"
              outlined
              dense
            />
          </div>
          <div class="col-12 col-md-6">
            <q-input
              v-model="taskTransactionForm.transac_date"
              type="date"
              label="Transaction Date *"
              outlined
              dense
            />
          </div>
        </div>
        <q-input
          v-model="taskTransactionForm.note"
          label="Note"
          type="textarea"
          rows="3"
          outlined
          dense
        />
        <q-file
          v-model="taskTransactionSelectedFile"
          accept="image/*"
          outlined
          dense
          label="Attach Picture (Optional)"
          @update:model-value="onTaskTransactionFileSelected"
        />
        <div v-if="taskTransactionImagePreview" class="q-mt-sm">
          <q-img
            :src="taskTransactionImagePreview"
            style="max-width: 240px; max-height: 160px"
            class="rounded-borders"
            fit="contain"
          />
        </div>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn
          v-if="!requireTaskTransactionSave"
          flat
          label="Cancel"
          color="primary"
          @click="cancelTaskTransactionDialog"
        />
        <q-btn
          unelevated
          color="primary"
          label="Save Transaction"
          :loading="savingTaskTransaction"
          @click="saveTaskTransaction"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <q-dialog v-model="showAddAnotherTransactionDialog" persistent>
    <q-card style="min-width: 420px">
      <q-card-section class="row items-center justify-between">
        <div class="text-subtitle1 text-weight-bold">Add Another Transaction?</div>
      </q-card-section>
      <q-separator />
      <q-card-section>
        <div class="text-body1">
          Do you want to add one more transaction for this task?
        </div>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Done" color="primary" @click="resolveAddAnotherTransaction(false)" />
        <q-btn unelevated label="Add Another" color="primary" @click="resolveAddAnotherTransaction(true)" />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <!-- Add Photos to Comment Dialog -->
  <q-dialog v-model="showAddCommentPhotosDialog" persistent>
    <q-card style="min-width: 500px">
      <q-card-section>
        <div class="text-h6">Add Photos to Comment</div>
        <div class="text-caption text-grey-6 q-mt-xs">
          {{ selectedCommentLog?.comment || 'No Comment' }}
        </div>
      </q-card-section>

      <q-card-section>
        <!-- Picture Upload Section for Comment Photos -->
        <div class="comment-additional-picture-upload-section">
          <div class="text-subtitle2 q-mb-sm">
            <q-icon name="photo_camera" class="q-mr-xs" />
            Add Photos to Comment
          </div>

          <q-file
            v-model="commentAdditionalSelectedFiles"
            accept="image/*"
            outlined
            dense
            multiple
            label="Choose pictures"
            hint="Upload photos for this comment"
            bg-color="grey-1"
            class="q-mb-sm"
            @update:model-value="onCommentAdditionalFilesSelected"
          >
            <template v-slot:prepend>
              <q-icon name="attach_file" />
            </template>
          </q-file>

          <!-- Comment Additional Image Previews -->
          <div
            v-if="commentAdditionalImagePreviews.length > 0"
            class="comment-additional-image-previews q-mb-sm"
          >
            <div class="text-caption q-mb-xs">
              Previews ({{ commentAdditionalImagePreviews.length }} image{{
                commentAdditionalImagePreviews.length > 1 ? 's' : ''
              }}):
            </div>
            <div class="row q-gutter-sm">
              <div
                v-for="(preview, index) in commentAdditionalImagePreviews"
                :key="index"
                class="comment-additional-image-preview-item"
              >
                <q-img
                  :src="preview.url"
                  style="width: 100px; height: 100px"
                  class="rounded-borders"
                  fit="cover"
                />
                <q-btn
                  flat
                  dense
                  round
                  icon="close"
                  color="negative"
                  size="sm"
                  class="absolute-top-right q-ma-xs"
                  @click="removeCommentAdditionalImage(index)"
                />
                <div
                  class="text-caption text-center q-mt-xs"
                  style="max-width: 100px; font-size: 0.75rem"
                >
                  {{
                    preview.name.length > 12 ? preview.name.substring(0, 12) + '...' : preview.name
                  }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancel" color="primary" @click="closeAddCommentPhotosDialog" />
        <q-btn
          unelevated
          label="Upload Photos"
          color="primary"
          @click="submitCommentAdditionalPhotos"
          :loading="uploadingCommentPhotos"
          :disable="commentAdditionalImagePreviews.length === 0"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <!-- Fullscreen Image Viewer Dialog -->
  <q-dialog v-model="showImageViewer" maximized>
    <q-card class="image-viewer-card">
      <q-card-section class="image-viewer-header">
        <div class="row items-center justify-between">
          <div>
            <div class="text-h6">
              Image {{ currentImageIndex + 1 }} of {{ currentImageList.length }}
            </div>
            <div class="text-caption text-grey-4" v-if="currentImageContext">
              {{ currentImageContext }}
            </div>
          </div>
          <div class="row q-gutter-sm">
            <q-btn
              v-if="currentImageList.length > 1"
              flat
              round
              icon="keyboard_arrow_left"
              @click="previousImage"
              :disable="currentImageIndex === 0"
              class="image-nav-btn"
            >
              <q-tooltip>Previous image</q-tooltip>
            </q-btn>
            <q-btn
              v-if="currentImageList.length > 1"
              flat
              round
              icon="keyboard_arrow_right"
              @click="nextImage"
              :disable="currentImageIndex === currentImageList.length - 1"
              class="image-nav-btn"
            >
              <q-tooltip>Next image</q-tooltip>
            </q-btn>
            <q-btn
              flat
              round
              icon="open_in_new"
              @click="viewImage(currentImageUrl)"
              class="image-nav-btn"
            >
              <q-tooltip>Open in new tab</q-tooltip>
            </q-btn>
            <q-btn flat round icon="close" @click="closeImageViewer" class="image-nav-btn" />
          </div>
        </div>
      </q-card-section>

      <q-card-section class="image-viewer-content">
        <div class="image-viewer-container">
          <q-img
            :src="currentImageUrl"
            class="fullscreen-image"
            fit="contain"
            @click="closeImageViewer"
          >
            <q-tooltip>Click to close</q-tooltip>
          </q-img>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>

  <q-dialog v-model="showBidSpDetailDialog">
    <q-card style="min-width: 380px; max-width: 520px">
      <q-card-section class="row items-center justify-between">
        <div class="text-subtitle1 text-weight-bold">SP Detail</div>
        <q-btn flat round dense icon="close" v-close-popup />
      </q-card-section>
      <q-separator />
      <q-card-section v-if="selectedBidSpDetail">
        <div class="detail-item q-mb-sm">
          <div class="detail-label">Name</div>
          <div class="detail-value">{{ selectedBidSpDetail.name }}</div>
        </div>
        <div class="detail-item q-mb-sm">
          <div class="detail-label">Rating</div>
          <div class="detail-value">{{ selectedBidSpDetail.rating || 'N/A' }}</div>
        </div>
        <div class="detail-item q-mb-sm">
          <div class="detail-label">Email</div>
          <div class="detail-value">{{ selectedBidSpDetail.contact?.email || 'N/A' }}</div>
        </div>
        <div class="detail-item q-mb-sm">
          <div class="detail-label">Phone</div>
          <div class="detail-value">{{ selectedBidSpDetail.contact?.phone || 'N/A' }}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Contact Name</div>
          <div class="detail-value">{{ selectedBidSpDetail.contact?.contact_name || 'N/A' }}</div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>

  <q-dialog v-model="showTaskBidDetailDialog">
    <q-card style="min-width: 420px; max-width: 640px">
      <q-card-section class="row items-center justify-between">
        <div class="text-subtitle1 text-weight-bold">Bid Details</div>
        <q-btn flat round dense icon="close" v-close-popup />
      </q-card-section>
      <q-separator />
      <q-card-section v-if="selectedTaskBidDetail">
        <div class="detail-item q-mb-sm">
          <div class="detail-label">Amount</div>
          <div class="detail-value">
            ${{ Number(selectedTaskBidDetail.amount || 0).toLocaleString() }}
          </div>
        </div>
        <div class="detail-item q-mb-sm">
          <div class="detail-label">Status</div>
          <div class="detail-value">{{ selectedTaskBidDetail.status || 'submitted' }}</div>
        </div>
        <div class="detail-item q-mb-sm">
          <div class="detail-label">Service Provider</div>
          <div class="detail-value">{{ selectedTaskBidDetail.sp_name || 'SP' }}</div>
        </div>
        <div class="detail-item q-mb-sm">
          <div class="detail-label">SP Rating</div>
          <div class="detail-value">{{ selectedTaskBidDetail.sp_rating || 'N/A' }}</div>
        </div>
        <div class="detail-item q-mb-sm">
          <div class="detail-label">Submitted At</div>
          <div class="detail-value">{{ formatDate(selectedTaskBidDetail.created_at) }}</div>
        </div>
        <div class="detail-item q-mb-sm">
          <div class="detail-label">Note</div>
          <div class="detail-value">
            {{ selectedTaskBidDetail.note || 'No note provided.' }}
          </div>
        </div>
        <div class="detail-item q-mb-sm">
          <div class="detail-label">Currency</div>
          <div class="detail-value">{{ selectedTaskBidDetail.currency || 'USD' }}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Task</div>
          <div class="detail-value">{{ selectedTaskBidDetail.task_label || 'Task' }}</div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>

</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useUserDataStore } from '../stores/userDataStore'
import { useFirebase } from '../composables/useFirebase'
import { normalizeRoleValue, roleLabel } from '../utils/roleUtils'
import CreateMxRecord from '../components/CreateMxRecord.vue'
import DetailShell from '../components/details/DetailShell.vue'
import { Notify } from 'quasar'
import { marketplaceApi, spCardsApi } from '../services/webApiClient'

const userDataStore = useUserDataStore()
const { updateDocument, createDocument, uploadImages, getCollectionData } = useFirebase()
const route = useRoute()
const searchQuery = ref('')
const activeFilter = ref('all') // 'all', 'open', 'closed', 'cancel', 'published'
const selectedProperty = ref(null)
const dateFilter = ref(null)

// Filter options
const dateFilterOptions = [
  'Last 7 Days',
  'Last 30 Days',
  'Last 3 Months',
  'Last 6 Months',
  'Last Year',
  'All Time',
]

const canManageRecords = computed(() => {
  const accountType = String(userDataStore.accountType || userDataStore.userCategory || '').toLowerCase()
  return ['pm', 'po', 'admin'].includes(accountType)
})
const showMxRecordDialog = ref(false)
const selectedMxRecord = ref(null)
const recommendedSps = ref([])
const loadingRecommendedSps = ref(false)
const taskBids = ref([])
const loadingTaskBids = ref(false)
const showOnlySelectedBid = ref(false)
const selectedBidFilterId = ref('')
const showBidSpDetailDialog = ref(false)
const selectedBidSpDetail = ref(null)
const showTaskBidDetailDialog = ref(false)
const selectedTaskBidDetail = ref(null)
const showCreateMxRecordComposer = ref(false)
const showCommentDialog = ref(false)
const submittingComment = ref(false)
const newComment = ref({
  comment: '',
  action_type: '',
  image_urls: [], // Will store uploaded image URLs for the comment
})

// Comment file upload related data
const commentSelectedFiles = ref([])
const commentImagePreviews = ref([])

// Additional photos dialog data
const showAddPhotosDialog = ref(false)
const uploadingPhotos = ref(false)
const additionalSelectedFiles = ref([])
const additionalImagePreviews = ref([])

// Comment additional photos dialog data
const showAddCommentPhotosDialog = ref(false)
const uploadingCommentPhotos = ref(false)
const selectedCommentLog = ref(null)
const commentAdditionalSelectedFiles = ref([])
const commentAdditionalImagePreviews = ref([])
const selectedTaskTransactions = ref([])
const loadingTaskTransactions = ref(false)
const showTaskCostPromptDialog = ref(false)
const showTaskTransactionDialog = ref(false)
const showAddAnotherTransactionDialog = ref(false)
const savingTaskTransaction = ref(false)
const requireTaskTransactionSave = ref(false)
const activeTaskTransactionContext = ref(null)
const taskCostDecisionResolver = ref(null)
const taskTransactionResolver = ref(null)
const addAnotherTransactionResolver = ref(null)
const taskTransactionSelectedFile = ref(null)
const taskTransactionImagePreview = ref(null)
const taskTransactionForm = ref({
  transac_from: '',
  transac_to: '',
  amount: null,
  transac_date: new Date().toISOString().split('T')[0],
  transac_type: '',
  note: '',
})
const deepLinkHandled = ref(false)
const showRecommendedSp = ref(true)
const showTaskBids = ref(true)
const showSpRecommendationPanel = ref(false)
const showTaskPublishDialog = ref(false)
const taskPublishDialogSource = ref('detail')
const activeTaskPublishTarget = ref(null)
const publishingTaskToSp = ref(false)

const taskTransactionTypeOptions = [
  'Rent',
  'Deposit',
  'Tax',
  'Insurance',
  'Utility',
  'Maintenance',
  'Labor',
  'HOA',
  'Fee',
  'Refund',
  'Other',
]

const taskTransactionRoleOptions = [
  'Property Owner',
  'Property Manager',
  'Tenant',
  'Service Provider',
  'Government',
  'HOA',
]

const taskTransactionToRoleOptions = computed(() => {
  if (!taskTransactionForm.value.transac_from) return []
  return taskTransactionRoleOptions.filter(
    (option) => option !== taskTransactionForm.value.transac_from,
  )
})

const selectedTaskTransactionRows = computed(() =>
  (Array.isArray(selectedTaskTransactions.value) ? selectedTaskTransactions.value : []).filter(
    (transaction) => transaction && typeof transaction === 'object',
  ),
)

const selectedBidIdForTask = computed(() =>
  normalizeId(
    selectedMxRecord.value?.selected_bid_id,
    selectedMxRecord.value?.assigned_sp?.bid_id,
    selectedBidFilterId.value,
  ),
)

const visibleTaskBids = computed(() => {
  const rows = (Array.isArray(taskBids.value) ? taskBids.value : []).filter(
    (bid) => bid && typeof bid === 'object',
  )
  if (!showOnlySelectedBid.value) return rows
  const selectedBidId = selectedBidIdForTask.value
  if (!selectedBidId) return rows
  const filtered = rows.filter((bid) => normalizeId(bid?.id, bid?.bid_id) === selectedBidId)
  return filtered.length ? filtered : rows
})

const taskTransactionsTotal = computed(() =>
  selectedTaskTransactionRows.value.reduce((sum, transaction) => {
    const amount = Number(transaction?.amount || 0)
    return sum + (Number.isFinite(amount) ? amount : 0)
  }, 0),
)

watch(
  () => taskTransactionForm.value.transac_from,
  (nextFrom, prevFrom) => {
    if (nextFrom !== prevFrom) {
      taskTransactionForm.value.transac_to = ''
    }
  },
)

const actionTypeOptions = [
  { label: 'Update', value: 'update' },
  { label: 'Comment', value: 'comment' },
  { label: 'Cancel', value: 'cancel' },
  { label: 'Resolution', value: 'resolution' },
]

// Use computed properties from the store
const userAccessibleMxRecords = computed(() => {
  return Array.isArray(userDataStore.userAccessibleMxRecords)
    ? userDataStore.userAccessibleMxRecords
    : []
})

const normalizedAccessibleMxRecords = computed(() =>
  userAccessibleMxRecords.value.filter((record) => record && typeof record === 'object'),
)

const selectedMxRecordLogs = computed(() =>
  (Array.isArray(selectedMxRecord.value?.logs) ? selectedMxRecord.value.logs : []).filter(
    (log) => log && typeof log === 'object',
  ),
)

const normalizeFilterValue = (status) => String(status || '').toLowerCase()

const isOpenStatus = (status) => {
  const normalized = normalizeFilterValue(status)
  return !normalized || normalized === 'open'
}

const normalizeRoleLabel = (role) => {
  const normalized = normalizeRoleValue(role)
  return normalized ? roleLabel(normalized) : 'Unknown Role'
}

const getReportedBy = (mxRecord) => {
  if (!mxRecord) return 'Unknown'
  return (
    mxRecord.reported_by ||
    mxRecord.created_by_name ||
    mxRecord.user_name ||
    mxRecord.created_by ||
    'Unknown'
  )
}

const getReportedRole = (mxRecord) => {
  if (!mxRecord) return 'Unknown Role'
  return normalizeRoleLabel(mxRecord.reported_role || mxRecord.created_by_role || mxRecord.user_role)
}

// Filtered tasks based on search query, status filter, property filter, and date filter
const filteredMxRecords = computed(() => {
  let records = normalizedAccessibleMxRecords.value

  // Apply status filter first
  if (activeFilter.value === 'open') {
    records = records.filter((record) => isOpenStatus(record.status))
  } else if (activeFilter.value === 'closed') {
    records = records.filter((record) => normalizeFilterValue(record.status) === 'closed')
  } else if (activeFilter.value === 'cancel') {
    records = records.filter((record) => normalizeFilterValue(record.status) === 'cancel')
  } else if (activeFilter.value === 'published') {
    records = records.filter((record) => isTaskPublished(record))
  }

  // Apply property filter
  if (selectedProperty.value) {
    records = records.filter((record) => record.property_id === selectedProperty.value)
  }

  // Apply date filter
  if (dateFilter.value) {
    const now = new Date()
    let startDate = new Date()

    switch (dateFilter.value) {
      case 'Last 7 Days':
        startDate.setDate(now.getDate() - 7)
        break
      case 'Last 30 Days':
        startDate.setDate(now.getDate() - 30)
        break
      case 'Last 3 Months':
        startDate.setMonth(now.getMonth() - 3)
        break
      case 'Last 6 Months':
        startDate.setMonth(now.getMonth() - 6)
        break
      case 'Last Year':
        startDate.setFullYear(now.getFullYear() - 1)
        break
      case 'All Time':
        startDate = new Date(0) // Beginning of time
        break
    }

    records = records.filter((record) => {
      const reportDate = new Date(record.report_date)
      return reportDate >= startDate
    })
  }

  // Apply search filter
  if (!searchQuery.value.trim()) {
    return records
  }

  const query = searchQuery.value.toLowerCase().trim()
  return records.filter((mxRecord) => {
    const description = (mxRecord.description || '').toLowerCase()
    const propertyName = getPropertyName(mxRecord.property_id).toLowerCase()
    const reportedBy = getReportedBy(mxRecord).toLowerCase()
    const mxId = (mxRecord.mx_id || '').toLowerCase()

    return (
      description.includes(query) ||
      propertyName.includes(query) ||
      reportedBy.includes(query) ||
      mxId.includes(query)
    )
  })
})

// Summary statistics (unfiltered)
const openRecords = computed(() =>
  normalizedAccessibleMxRecords.value.filter((record) => isOpenStatus(record.status)),
)

const closedRecords = computed(() =>
  normalizedAccessibleMxRecords.value.filter(
    (record) => normalizeFilterValue(record.status) === 'closed',
  ),
)

const cancelRecords = computed(() =>
  normalizedAccessibleMxRecords.value.filter(
    (record) => normalizeFilterValue(record.status) === 'cancel',
  ),
)

const publishedRecords = computed(() =>
  normalizedAccessibleMxRecords.value.filter((record) => isTaskPublished(record)),
)

// Filter functions
const setFilter = (filter) => {
  activeFilter.value = normalizeFilterValue(filter) || 'all'
  console.log('Tasks filter set to:', activeFilter.value)
}

const clearFilter = () => {
  activeFilter.value = 'all'
  console.log('Tasks filter cleared')
}

const getFilterColor = (filter) => {
  const colors = {
    all: 'primary',
    open: 'orange',
    closed: 'green',
    cancel: 'red',
    published: 'positive',
  }
  return colors[filter] || 'primary'
}

const getFilterIcon = (filter) => {
  const icons = {
    all: 'dns',
    open: 'radio_button_unchecked',
    closed: 'check_circle',
    cancel: 'cancel',
    published: 'flag',
  }
  return icons[filter] || 'dns'
}

const getFilterLabel = (filter) => {
  const labels = {
    all: 'All Records',
    open: 'Open',
    closed: 'Closed',
    cancel: 'Cancelled',
    published: 'Published to SP',
  }
  return labels[filter] || 'All Records'
}

const getFilteredCount = () => {
  return filteredMxRecords.value.length
}

const normalizeId = (...values) => {
  for (const value of values) {
    if (value === null || value === undefined) continue
    const parsed = String(value).trim()
    if (!parsed || parsed.toLowerCase() === 'undefined' || parsed.toLowerCase() === 'null') continue
    return parsed
  }
  return ''
}

const getBidTaskLabel = (bid, fallbackRecord = selectedMxRecord.value) => {
  const taskRef = normalizeId(
    bid?.mx_id,
    bid?.task_id,
    bid?.task_doc_id,
    fallbackRecord?.mx_id,
    fallbackRecord?.task_id,
    fallbackRecord?.id,
  )
  return `Task ${taskRef || 'N/A'}`
}

onMounted(async () => {
  if (userDataStore.isAuthenticated) {
    // Check if we have the necessary data
    if (userDataStore.userRoles.length === 0 || userDataStore.properties.length === 0) {
      await userDataStore.loadAllUserData()
    } else if (userDataStore.mxRecords.length === 0) {
      await userDataStore.loadMxRecords()
    }
  }
  tryOpenDeepLinkedMxRecord()
})

const getPropertyName = (propertyId) => {
  const property = userDataStore.getPropertyById(propertyId)
  if (!property) return 'Unknown Property'
  const address = getTaskPropertyAddress(property)
  return (
    address.line1 ||
    String(property.displayName || property.name || property.address || 'Unknown Property')
  )
}

const extractTaskPropertyId = (propertyValue) => {
  if (!propertyValue) return ''
  if (typeof propertyValue === 'object') {
    return String(propertyValue.id || propertyValue.property_id || '').trim()
  }
  return String(propertyValue).trim()
}

const buildTaskIdCandidates = (mxRecord) => {
  if (!mxRecord) return []
  return [...new Set([mxRecord.id, mxRecord.mx_id, mxRecord.task_id]
    .filter((value) => value !== null && value !== undefined && String(value).trim().length)
    .map((value) => String(value).trim()))]
}

const formatTransactionAmount = (value) => {
  const amount = Number(value || 0)
  if (!Number.isFinite(amount)) return '0.00'
  return amount.toFixed(2)
}

const getStatusColor = (status) => {
  const normalized = normalizeFilterValue(status)
  if (!normalized || normalized === 'open') return 'orange'
  if (normalized === 'closed') return 'green'
  if (normalized === 'cancel') return 'red'
  return 'grey'
}

const formatDate = (timestamp) => {
  if (!timestamp) return 'Unknown'
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return date.toLocaleDateString()
}

const isTaskPublished = (mxRecord) => {
  if (!mxRecord || typeof mxRecord !== 'object') return false
  if (mxRecord.sp_published === true) return true
  const publishStatus = String(mxRecord.sp_publish_status || mxRecord.publish_status || '').toLowerCase()
  return publishStatus === 'published'
}

const getPublishTaskButtonLabel = (mxRecord) =>
  isTaskPublished(mxRecord) ? 'Republish to SP' : 'Publish to SP'

const getTaskPublishComments = (mxRecord) =>
  (Array.isArray(mxRecord?.logs) ? mxRecord.logs : [])
    .filter((log) => log && typeof log === 'object')
    .map((log) => ({
      comment: String(log.comment || ''),
      action_type: String(log.action_type || 'comment'),
      created_at: log.log_timestamp || null,
      user_id: String(log.user_id || ''),
      user_name: String(log.user_name || ''),
      user_role: String(log.user_role || ''),
      image_urls: Array.isArray(log.image_urls) ? log.image_urls : [],
    }))
    .filter((comment) => comment.comment.length > 0)

const getTaskPropertyAddress = (mxRecord, property = {}) => {
  const task = mxRecord && typeof mxRecord === 'object' ? mxRecord : {}
  const taskAddress = task.address && typeof task.address === 'object' ? task.address : {}
  const propertyAddress = property.address && typeof property.address === 'object' ? property.address : {}
  const taskLegacyStreet = typeof task.address === 'string' ? String(task.address || '').trim() : ''
  const propertyLegacyStreet = typeof property.address === 'string' ? String(property.address || '').trim() : ''

  const line1 = String(
    taskAddress.street ||
      taskAddress.street1 ||
      taskAddress.line1 ||
      taskAddress.address1 ||
      task.property_address_line1 ||
      task.property_name ||
      task.street ||
      task.address_line1 ||
      task.address1 ||
      taskLegacyStreet ||
      propertyAddress.street ||
      propertyAddress.street1 ||
      propertyAddress.line1 ||
      propertyAddress.address1 ||
      property.street ||
      property.address_line1 ||
      propertyLegacyStreet ||
      '',
  ).trim()
  const line2 = String(
    taskAddress.line2 ||
      taskAddress.unit ||
      task.address_line2 ||
      propertyAddress.line2 ||
      propertyAddress.unit ||
      property.address_line2 ||
      '',
  ).trim()
  const city = String(
    taskAddress.city ||
      task.city ||
      task.city_name ||
      task.property_city ||
      propertyAddress.city ||
      property.city ||
      property.city_name ||
      '',
  ).trim()
  const state = String(
    taskAddress.state ||
      task.state ||
      task.state_code ||
      task.property_state ||
      propertyAddress.state ||
      property.state ||
      property.state_code ||
      '',
  ).trim()
  const zip = String(
    taskAddress.zip ||
      taskAddress.zipCode ||
      taskAddress.postal_code ||
      task.zip ||
      task.zip_code ||
      task.postal_code ||
      task.property_zip ||
      propertyAddress.zip ||
      propertyAddress.zipCode ||
      propertyAddress.postal_code ||
      property.zip ||
      property.zip_code ||
      property.postal_code ||
      '',
  ).trim()

  return { line1, line2, city, state, zip }
}

const buildTaskPublishPayload = (mxRecord, source = 'detail') => {
  const propertyId = extractTaskPropertyId(mxRecord?.property_id)
  const taskDocId = String(mxRecord?.id || '').trim()
  const taskRef = String(mxRecord?.mx_id || taskDocId || '').trim()
  const property = userDataStore.getPropertyById(propertyId) || {}
  const actorRole =
    normalizeRoleValue(userDataStore.getUserRoleForProperty(propertyId)?.role) || 'pm'
  const comments = getTaskPublishComments(mxRecord)
  const propertyAddress = getTaskPropertyAddress(mxRecord, property)
  const location = [propertyAddress.city, propertyAddress.state].filter(Boolean).join(', ')
  const propertyLabel = propertyAddress.line1 || String(property?.name || property?.address || '').trim()

  return {
    actor_id: String(userDataStore.userId || ''),
    actor_role: actorRole,
    property_id: propertyId,
    property_name: propertyLabel,
    property_address_line1: propertyAddress.line1,
    property_address_line2: propertyAddress.line2,
    property_city: propertyAddress.city,
    property_state: propertyAddress.state,
    property_zip: propertyAddress.zip,
    city: propertyAddress.city,
    state: propertyAddress.state,
    zip_code: propertyAddress.zip,
    postal_code: propertyAddress.zip,
    task_doc_id: taskDocId,
    system_task_id: taskDocId,
    mx_id: taskRef,
    task_id: taskRef,
    title: String(mxRecord?.description || `Task ${taskRef || taskDocId}`),
    description: String(mxRecord?.description || ''),
    scope: String(mxRecord?.description || ''),
    status: String(mxRecord?.status || 'open'),
    address: propertyAddress.line1,
    location: location || propertyLabel,
    image_urls: Array.isArray(mxRecord?.image_urls) ? mxRecord.image_urls : Array.isArray(mxRecord?.photos) ? mxRecord.photos : [],
    comments,
    comment_count: comments.length,
    publish_source: source,
  }
}

const publishTaskToServiceProvider = async (mxRecord, source = 'detail') => {
  if (!mxRecord || typeof mxRecord !== 'object') return false

  const propertyId = extractTaskPropertyId(mxRecord.property_id)
  const mxRecordId = String(mxRecord.id || '').trim()
  if (!propertyId || !mxRecordId) {
    Notify.create({
      type: 'negative',
      message: 'Task reference is incomplete. Cannot publish.',
      position: 'top',
    })
    return false
  }

  publishingTaskToSp.value = true
  try {
    const lead = await marketplaceApi.publishLeadFromTask(buildTaskPublishPayload(mxRecord, source))
    const now = new Date()
    const nextPublishCount = Number(mxRecord.sp_publish_count || 0) + 1
    const leadId = String(lead?.id || lead?.lead_id || mxRecord.sp_lead_id || '').trim() || null
    const roleForProperty =
      normalizeRoleValue(userDataStore.getUserRoleForProperty(propertyId)?.role) || 'pm'
    const updatePayload = {
      sp_published: true,
      sp_publish_status: 'published',
      sp_publish_source: source,
      sp_publish_includes_comments: true,
      sp_published_at: now,
      sp_published_by: String(userDataStore.userId || ''),
      sp_published_by_role: roleForProperty,
      sp_publish_count: nextPublishCount,
      sp_lead_id: leadId,
      updatedAt: now,
    }

    await updateDocument(`properties/${propertyId}/mxrecords`, mxRecordId, updatePayload)

    if (selectedMxRecord.value?.id === mxRecordId) {
      selectedMxRecord.value = {
        ...selectedMxRecord.value,
        ...updatePayload,
      }
    }

    await userDataStore.loadMxRecords()

    Notify.create({
      type: 'positive',
      message: nextPublishCount > 1 ? 'Task republished to service providers.' : 'Task published to service providers.',
      position: 'top',
    })
    return true
  } catch (error) {
    console.error('Failed to publish task to service providers:', error)
    Notify.create({
      type: 'negative',
      message: error?.message || 'Failed to publish task to service providers.',
      position: 'top',
    })
    return false
  } finally {
    publishingTaskToSp.value = false
  }
}

const openTaskPublishDialog = (mxRecord, source = 'detail') => {
  if (!canManageRecords.value) return
  if (!mxRecord || typeof mxRecord !== 'object') return
  activeTaskPublishTarget.value = mxRecord
  taskPublishDialogSource.value = source
  showTaskPublishDialog.value = true
}

const clearTaskPublishDialogState = () => {
  showTaskPublishDialog.value = false
  activeTaskPublishTarget.value = null
  taskPublishDialogSource.value = 'detail'
}

const cancelTaskPublishDialog = async () => {
  if (publishingTaskToSp.value) return
  const source = taskPublishDialogSource.value
  clearTaskPublishDialogState()
  if (source === 'create') {
    await refreshData()
  }
}

const confirmTaskPublishDialog = async () => {
  if (publishingTaskToSp.value) return
  const target = activeTaskPublishTarget.value
  const source = taskPublishDialogSource.value
  const published = await publishTaskToServiceProvider(target, source)
  if (!published) return
  clearTaskPublishDialogState()
}

const viewMxRecord = (mxRecord) => {
  if (!mxRecord || typeof mxRecord !== 'object') return
  selectedMxRecord.value = mxRecord
  selectedBidFilterId.value = normalizeId(mxRecord?.selected_bid_id, mxRecord?.assigned_sp?.bid_id)
  showOnlySelectedBid.value = Boolean(selectedBidFilterId.value)
  showMxRecordDialog.value = true
  selectedTaskBidDetail.value = null
  showTaskBidDetailDialog.value = false
  loadTaskBids(mxRecord)
  if (showSpRecommendationPanel.value) loadRecommendedSps(mxRecord)
  loadTaskTransactions(mxRecord)
}

const openTaskBidDetailDialog = (bid) => {
  if (!bid || typeof bid !== 'object') return
  selectedTaskBidDetail.value = {
    bid_row: bid,
    bid_id: String(bid?.id || bid?.bid_id || ''),
    amount: Number(bid?.amount || 0),
    status: bid?.status || 'submitted',
    sp_id: String(bid?.sp_id || ''),
    sp_name: getBidSpName(bid),
    sp_rating: getBidSpRating(bid),
    sp_contact: getBidSpContact(bid),
    note: bid?.note || bid?.description || '',
    currency: bid?.currency || 'USD',
    created_at: bid?.created_at || bid?.createdAt || null,
    updated_at: bid?.updated_at || null,
    task_label: getBidTaskLabel(bid),
  }
  showTaskBidDetailDialog.value = true
}

const tryOpenDeepLinkedMxRecord = () => {
  if (deepLinkHandled.value) return
  const openType = String(route.query.openType || '').toLowerCase()
  const openId = String(route.query.openId || '')
  const openTaskId = String(route.query.openTaskId || '')
  if (!openId || !['task', 'mxrecord', 'bid'].includes(openType)) return
  if (!normalizedAccessibleMxRecords.value.length) return

  const normalizedOpenId = String((openType === 'bid' ? openTaskId || openId : openId) || '').toLowerCase()
  const targetRecord = normalizedAccessibleMxRecords.value.find((record) => {
    const idCandidates = [record.id, record.mx_id]
      .filter((value) => value !== null && value !== undefined)
      .map((value) => String(value).toLowerCase())
    return idCandidates.includes(normalizedOpenId)
  })
  if (!targetRecord) return

  viewMxRecord(targetRecord)
  deepLinkHandled.value = true
}

watch(
  () => normalizedAccessibleMxRecords.value.length,
  () => {
    tryOpenDeepLinkedMxRecord()
  },
  { immediate: true }
)

watch(
  () => [route.query.openType, route.query.openId],
  () => {
    deepLinkHandled.value = false
    tryOpenDeepLinkedMxRecord()
  }
)

watch(
  () => route.query.propertyId,
  (propertyId) => {
    const value = String(propertyId || '').trim()
    selectedProperty.value = value || null
  },
  { immediate: true },
)

const closeMxRecordDialog = () => {
  showMxRecordDialog.value = false
  selectedMxRecord.value = null
  recommendedSps.value = []
  taskBids.value = []
  selectedTaskBidDetail.value = null
  showTaskBidDetailDialog.value = false
  selectedTaskTransactions.value = []
  loadingTaskTransactions.value = false
  showTaskCostPromptDialog.value = false
  showTaskTransactionDialog.value = false
  showAddAnotherTransactionDialog.value = false
  showOnlySelectedBid.value = false
  selectedBidFilterId.value = ''
  if (taskPublishDialogSource.value === 'detail') {
    clearTaskPublishDialogState()
  }
}

async function loadTaskTransactions(mxRecord = selectedMxRecord.value) {
  if (!mxRecord) {
    selectedTaskTransactions.value = []
    return
  }

  const propertyId = extractTaskPropertyId(mxRecord.property_id)
  if (!propertyId) {
    selectedTaskTransactions.value = []
    return
  }

  const taskIdCandidates = buildTaskIdCandidates(mxRecord)
  if (taskIdCandidates.length === 0) {
    selectedTaskTransactions.value = []
    return
  }

  loadingTaskTransactions.value = true
  try {
    const rows = await getCollectionData(`properties/${propertyId}/transactions`)
    selectedTaskTransactions.value = (rows || [])
      .filter((transaction) => transaction && typeof transaction === 'object')
      .filter((transaction) => {
        const taskId = String(transaction?.task_id || transaction?.related_task_id || '').trim()
        return taskId && taskIdCandidates.includes(taskId)
      })
      .sort((a, b) => {
        const aTime = new Date(a?.created_datetime || a?.transac_date || 0).getTime()
        const bTime = new Date(b?.created_datetime || b?.transac_date || 0).getTime()
        return bTime - aTime
      })
  } catch (error) {
    console.error('Failed to load task transactions:', error)
    selectedTaskTransactions.value = []
  } finally {
    loadingTaskTransactions.value = false
  }
}

async function loadRecommendedSps(mxRecord) {
  loadingRecommendedSps.value = true
  try {
    const rows = await marketplaceApi.getRecommendedSps(mxRecord.id)
    recommendedSps.value = rows.map((row, index) => ({
      sp_id: row.sp_id || '',
      sp_name: row.sp_name || row.display_name || `Service Provider ${index + 1}`,
      rating: row.rating || row.rating_avg || 'N/A',
      service_area: row.service_area || 'Unknown',
      provider_type: row.provider_type || 'individual',
    }))
    if (!recommendedSps.value.length) {
      recommendedSps.value = [
        { sp_id: 'sp-demo-1', sp_name: 'BlueFix Services', rating: 4.7, service_area: 'Local' },
        { sp_id: 'sp-demo-2', sp_name: 'Prime Repair Co', rating: 4.5, service_area: 'Regional' },
      ]
    }
  } catch (error) {
    console.error('Failed loading recommended SPs:', error)
  } finally {
    loadingRecommendedSps.value = false
  }
}

async function loadTaskBids(mxRecord) {
  loadingTaskBids.value = true
  try {
    const actorRole =
      normalizeRoleValue(userDataStore.getUserRoleForProperty(mxRecord.property_id)?.role) || 'pm'
    const taskIdCandidates = [...new Set([
      mxRecord?.mx_id,
      mxRecord?.task_id,
      mxRecord?.id,
    ].filter((item) => item !== null && item !== undefined && String(item).trim().length).map((item) => String(item)))]

    let rows = []

    // Prefer API first, but try all likely task identifiers.
    for (const taskId of taskIdCandidates) {
      const nextRows = await marketplaceApi.getTaskBids(taskId, {
        actor_id: userDataStore.userId,
        actor_role: actorRole,
      })
      if (Array.isArray(nextRows) && nextRows.length) {
        rows = nextRows
        break
      }
    }

    // Fallback: read directly from Firebase lead/bids subcollections.
    if (!rows.length) {
      const leadRows = await getCollectionData('marketplace_leads')
      const matchedLeads = leadRows.filter((lead) => {
        const leadRefs = [lead?.mx_id, lead?.task_id, lead?.task_doc_id]
          .filter((value) => value !== null && value !== undefined && String(value).trim().length)
          .map((value) => String(value))
        return leadRefs.some((value) => taskIdCandidates.includes(value))
      })

      const bidGroups = await Promise.all(
        matchedLeads.map((lead) => {
          const leadId = String(lead?.id || lead?.lead_id || '')
          if (!leadId) return Promise.resolve([])
          return getCollectionData(`marketplace_leads/${leadId}/bids`)
        })
      )

      rows = bidGroups
        .flat()
        .sort((a, b) => String(b?.created_at || '').localeCompare(String(a?.created_at || '')))
    }

    const seen = new Set()
    taskBids.value = rows.filter((bid) => {
      const key = String(bid?.id || bid?.bid_id || '')
      if (!key || seen.has(key)) return false
      seen.add(key)
      return true
    })
    if (String(route.query.openType || '').toLowerCase() === 'bid') {
      const openBidId = String(route.query.openId || '').toLowerCase()
      const matchedBid = taskBids.value.find((bid) => {
        const bidIds = [bid?.id, bid?.bid_id]
          .filter((value) => value !== null && value !== undefined)
          .map((value) => String(value).toLowerCase())
        return bidIds.includes(openBidId)
      })
      if (matchedBid) {
        showTaskBids.value = true
        openTaskBidDetailDialog(matchedBid)
        deepLinkHandled.value = true
      }
    }
  } catch (error) {
    console.error('Failed loading task bids:', error)
    taskBids.value = []
  } finally {
    loadingTaskBids.value = false
  }
}

const contactRecommendedSp = async (sp) => {
  if (!selectedMxRecord.value) return
  try {
    await marketplaceApi.contactSp(selectedMxRecord.value.id, { sp_id: sp.sp_id })
    Notify.create({ type: 'positive', message: `Contact initiated: ${sp.sp_name}`, position: 'top' })
  } catch (error) {
    Notify.create({ type: 'warning', message: error.message || 'Contact action failed', position: 'top' })
  }
}

const requestQuoteFromSp = async (sp) => {
  if (!selectedMxRecord.value) return
  try {
    await marketplaceApi.requestQuote(selectedMxRecord.value.id, { sp_id: sp.sp_id })
    Notify.create({ type: 'positive', message: `Quote requested from ${sp.sp_name}`, position: 'top' })
  } catch (error) {
    Notify.create({ type: 'warning', message: error.message || 'Quote request failed', position: 'top' })
  }
}

const getBidSpName = (bid) => {
  const directName = bid?.sp_business_name || bid?.sp_name || bid?.sp_display_name
  if (directName) return directName
  const spId = String(bid?.sp_id || '')
  if (!spId) return 'SP'
  const matched = recommendedSps.value.find((row) => String(row?.sp_id || '') === spId)
  return matched?.sp_name || matched?.display_name || spId
}

const getBidSpContact = (bid) => {
  const direct = bid?.sp_contact
  if (direct && typeof direct === 'object') return direct
  return {
    email: bid?.sp_email || '',
    phone: bid?.sp_phone || '',
    contact_name: bid?.sp_contact_name || '',
  }
}

const getBidSpRating = (bid) => {
  const directRating = bid?.rating ?? bid?.rating_avg ?? bid?.sp_rating
  if (directRating !== null && directRating !== undefined && String(directRating).trim() !== '') {
    return directRating
  }
  const spId = String(bid?.sp_id || '')
  if (!spId) return null
  const matched = recommendedSps.value.find((row) => String(row?.sp_id || '') === spId)
  return matched?.rating ?? matched?.rating_avg ?? null
}

const getBidSpRatingLabel = (bid) => {
  const rating = getBidSpRating(bid)
  return rating ? `Rating: ${rating}` : 'Rating: N/A'
}

const getBidIdentifier = (bid) => normalizeId(bid?.id, bid?.bid_id)

const isBidSelected = (bid) => {
  const bidId = getBidIdentifier(bid)
  return Boolean(bidId) && bidId === selectedBidIdForTask.value
}

const getAssignedSpId = () => {
  return String(selectedMxRecord.value?.assigned_sp?.sp_id || selectedMxRecord.value?.assigned_sp_id || '')
}

const isBidAssigned = (bid) => {
  const spId = String(bid?.sp_id || '')
  return Boolean(spId) && spId === getAssignedSpId()
}

const hasAssignedBidSp = () => Boolean(getAssignedSpId())

const getBidAssignBtnLabel = (bid) => {
  if (isBidAssigned(bid)) return 'Assigned'
  if (hasAssignedBidSp()) return 'Reassign'
  return 'Assign'
}

const getBidAssignBtnIcon = (bid) => {
  if (isBidAssigned(bid)) return 'check_circle'
  if (hasAssignedBidSp()) return 'swap_horiz'
  return 'person_add'
}

const getBidAssignBtnColor = (bid) => {
  if (isBidAssigned(bid)) return 'positive'
  if (hasAssignedBidSp()) return 'warning'
  return 'primary'
}

const openBidSpDetailDialog = (bid) => {
  selectedBidSpDetail.value = {
    sp_id: String(bid?.sp_id || ''),
    name: getBidSpName(bid),
    rating: getBidSpRating(bid),
    contact: getBidSpContact(bid),
  }
  showBidSpDetailDialog.value = true
}

const openAssignedSpDetailDialog = () => {
  if (!selectedMxRecord.value?.assigned_sp) return
  const assigned = selectedMxRecord.value.assigned_sp
  selectedBidSpDetail.value = {
    sp_id: String(assigned.sp_id || ''),
    name: assigned.sp_name || assigned.sp_id || 'SP',
    rating: assigned.sp_rating || null,
    contact: assigned.sp_contact || {},
  }
  showBidSpDetailDialog.value = true
}

const openBidConversation = async (bid) => {
  if (!selectedMxRecord.value) return
  const spId = bid?.sp_id
  if (!spId) {
    Notify.create({ type: 'warning', message: 'SP information missing for this bid.', position: 'top' })
    return
  }
  try {
    await marketplaceApi.contactSp(selectedMxRecord.value.id, { sp_id: spId })
    Notify.create({
      type: 'positive',
      message: `Conversation started with ${getBidSpName(bid)}`,
      position: 'top',
    })
  } catch (error) {
    Notify.create({
      type: 'warning',
      message: error.message || 'Failed to start conversation.',
      position: 'top',
    })
  }
}

const assignTaskToBidSp = async (bid) => {
  if (!canManageRecords.value) return
  if (!selectedMxRecord.value) return
  const spId = String(bid?.sp_id || '')
  if (!spId) {
    Notify.create({ type: 'warning', message: 'SP ID missing for this bid.', position: 'top' })
    return
  }

  const propertyId = selectedMxRecord.value.property_id
  const mxRecordId = selectedMxRecord.value.id
  if (!propertyId || !mxRecordId) {
    Notify.create({ type: 'negative', message: 'Task reference missing.', position: 'top' })
    return false
  }

  const bidId = getBidIdentifier(bid)
  const assignedSp = {
    sp_id: spId,
    sp_name: getBidSpName(bid),
    sp_contact: getBidSpContact(bid),
    sp_rating: getBidSpRating(bid),
    bid_id: bidId,
    bid_amount: Number(bid?.amount || 0),
    assigned_at: new Date().toISOString(),
    assigned_by: String(userDataStore.userId || ''),
  }

  try {
    await updateDocument(`properties/${String(propertyId)}/mxrecords`, String(mxRecordId), {
      assigned_sp: assignedSp,
      assigned_sp_id: spId,
      selected_bid_id: bidId,
      selected_bid_at: new Date(),
      updatedAt: new Date(),
    })
    selectedMxRecord.value.assigned_sp = assignedSp
    selectedMxRecord.value.assigned_sp_id = spId
    selectedMxRecord.value.selected_bid_id = bidId
    selectedMxRecord.value.selected_bid_at = new Date().toISOString()
    selectedBidFilterId.value = bidId
    Notify.create({
      type: 'positive',
      message: `Task assigned to ${assignedSp.sp_name}`,
      position: 'top',
    })
    return true
  } catch (error) {
    Notify.create({
      type: 'negative',
      message: error.message || 'Failed to assign task.',
      position: 'top',
    })
    return false
  }
}

const selectBidAndHideOthers = async (bid) => {
  const assigned = await assignTaskToBidSp(bid)
  if (!assigned) return
  showOnlySelectedBid.value = true
}

const clearAssignedSp = async () => {
  if (!canManageRecords.value) return
  if (!selectedMxRecord.value) return
  const propertyId = selectedMxRecord.value.property_id
  const mxRecordId = selectedMxRecord.value.id
  if (!propertyId || !mxRecordId) return
  try {
    await updateDocument(`properties/${String(propertyId)}/mxrecords`, String(mxRecordId), {
      assigned_sp: null,
      assigned_sp_id: null,
      selected_bid_id: null,
      selected_bid_at: null,
      updatedAt: new Date(),
    })
    selectedMxRecord.value.assigned_sp = null
    selectedMxRecord.value.assigned_sp_id = null
    selectedMxRecord.value.selected_bid_id = null
    selectedMxRecord.value.selected_bid_at = null
    selectedBidFilterId.value = ''
    showOnlySelectedBid.value = false
    Notify.create({ type: 'positive', message: 'Task unassigned.', position: 'top' })
  } catch (error) {
    Notify.create({
      type: 'negative',
      message: error.message || 'Failed to unassign task.',
      position: 'top',
    })
  }
}

const saveSpCard = async (sp) => {
  try {
    await spCardsApi.saveCard({
      owner_id: userDataStore.userId,
      sp_id: sp.sp_id,
      sp_name: sp.sp_name,
      display_name: sp.sp_name,
      service_area: sp.service_area,
      rating_avg: sp.rating,
      provider_type: sp.provider_type || 'individual',
      owner_note: '',
    })
    Notify.create({ type: 'positive', message: `${sp.sp_name} biz card saved`, position: 'top' })
  } catch (error) {
    Notify.create({ type: 'negative', message: error.message || 'Save card failed', position: 'top' })
  }
}

const addComment = (mxRecord) => {
  if (!canManageRecords.value) return
  selectedMxRecord.value = mxRecord
  showCommentDialog.value = true
  // Reset form
  newComment.value = {
    comment: '',
    action_type: '',
  }
}

const addCommentFromDialog = () => {
  if (!canManageRecords.value) return
  showCommentDialog.value = true
  // Reset form
  newComment.value = {
    comment: '',
    action_type: '',
  }
}

const closeCommentDialog = () => {
  showCommentDialog.value = false
  newComment.value = {
    comment: '',
    action_type: '',
    image_urls: [],
  }
  // Clear comment file uploads
  commentSelectedFiles.value = []
  commentImagePreviews.value = []
}

// Comment file upload functions
const onCommentFilesSelected = (files) => {
  console.log('Comment files selected:', files)
  if (files && files.length > 0) {
    // Process each file to create previews
    const fileArray = Array.isArray(files) ? files : [files]

    fileArray.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        commentImagePreviews.value.push({
          url: e.target.result,
          name: file.name,
          file: file,
        })
      }
      reader.readAsDataURL(file)
    })
  }
}

const removeCommentImage = (index) => {
  commentImagePreviews.value.splice(index, 1)
  // Update selectedFiles to match imagePreviews
  commentSelectedFiles.value = commentImagePreviews.value.map((preview) => preview.file)
}

const addMorePhotosToComment = () => {
  // Create a hidden file input to select more photos
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.multiple = true

  input.onchange = (event) => {
    const files = Array.from(event.target.files || [])
    if (files.length > 0) {
      console.log('Additional comment files selected:', files)

      // Process each additional file
      files.forEach((file) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          commentImagePreviews.value.push({
            url: e.target.result,
            name: file.name,
            file: file,
          })
        }
        reader.readAsDataURL(file)
      })

      // Update the selected files array
      const allFiles = commentImagePreviews.value.map((preview) => preview.file)
      commentSelectedFiles.value = allFiles

      // Show notification
      import('quasar').then(({ Notify }) => {
        Notify.create({
          type: 'positive',
          message: `${files.length} additional photo${files.length > 1 ? 's' : ''} selected`,
          position: 'top',
          timeout: 2000,
        })
      })
    }
  }

  // Trigger file selection
  input.click()
}

// Function to upload comment images to Firebase Storage is now imported from useFirebase

// Additional photos functions
const addPhotosToMxRecord = () => {
  if (!canManageRecords.value) return
  showAddPhotosDialog.value = true
}

const closeAddPhotosDialog = () => {
  showAddPhotosDialog.value = false
  additionalSelectedFiles.value = []
  additionalImagePreviews.value = []
}

const onAdditionalFilesSelected = (files) => {
  console.log('Additional files selected:', files)
  if (files && files.length > 0) {
    // Process each file to create previews
    const fileArray = Array.isArray(files) ? files : [files]

    fileArray.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        additionalImagePreviews.value.push({
          url: e.target.result,
          name: file.name,
          file: file,
        })
      }
      reader.readAsDataURL(file)
    })
  }
}

const removeAdditionalImage = (index) => {
  additionalImagePreviews.value.splice(index, 1)
  // Update selectedFiles to match imagePreviews
  additionalSelectedFiles.value = additionalImagePreviews.value.map((preview) => preview.file)
}

const submitAdditionalPhotos = async () => {
  if (!selectedMxRecord.value || additionalImagePreviews.value.length === 0) {
    return
  }

  uploadingPhotos.value = true

  try {
    // Upload additional photos
    const additionalFilesToUpload = additionalImagePreviews.value.map((preview) => preview.file)
    console.log(`Uploading ${additionalFilesToUpload.length} additional photos...`)

    const newImageUrls = await uploadImages(
      additionalFilesToUpload,
      selectedMxRecord.value.property_id,
      'mxrecord',
    )

    console.log('Additional photos uploaded successfully:', newImageUrls)

    // Get existing image URLs and merge with new ones
    const existingImageUrls = selectedMxRecord.value.image_urls || []
    const updatedImageUrls = [...existingImageUrls, ...newImageUrls]

    // Update the task with new image URLs
    const propertyId = selectedMxRecord.value.property_id
    const mxRecordId = selectedMxRecord.value.id

    if (!propertyId || !mxRecordId) {
      throw new Error(`Missing required IDs: propertyId=${propertyId}, mxRecordId=${mxRecordId}`)
    }

    const propertyIdStr = String(propertyId)
    const mxRecordIdStr = String(mxRecordId)

    const updateData = {
      image_urls: updatedImageUrls,
      updatedAt: new Date(),
    }

    await updateDocument(`properties/${propertyIdStr}/mxrecords`, mxRecordIdStr, updateData)

    // Update local data
    selectedMxRecord.value.image_urls = updatedImageUrls

    // Close dialog and refresh data
    closeAddPhotosDialog()
    await userDataStore.loadMxRecords()

    // Show success notification
    import('quasar').then(({ Notify }) => {
      Notify.create({
        type: 'positive',
        message: `${newImageUrls.length} photo${newImageUrls.length > 1 ? 's' : ''} added successfully!`,
        position: 'top',
      })
    })
  } catch (error) {
    console.error('Error uploading additional photos:', error)

    import('quasar').then(({ Notify }) => {
      Notify.create({
        type: 'negative',
        message: 'Failed to upload photos. Please try again.',
        position: 'top',
      })
    })
  } finally {
    uploadingPhotos.value = false
  }
}

// Comment additional photos functions
const addPhotosToComment = (log) => {
  selectedCommentLog.value = log
  showAddCommentPhotosDialog.value = true
}

const closeAddCommentPhotosDialog = () => {
  showAddCommentPhotosDialog.value = false
  selectedCommentLog.value = null
  commentAdditionalSelectedFiles.value = []
  commentAdditionalImagePreviews.value = []
}

const onCommentAdditionalFilesSelected = (files) => {
  console.log('Comment additional files selected:', files)
  if (files && files.length > 0) {
    // Process each file to create previews
    const fileArray = Array.isArray(files) ? files : [files]

    fileArray.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        commentAdditionalImagePreviews.value.push({
          url: e.target.result,
          name: file.name,
          file: file,
        })
      }
      reader.readAsDataURL(file)
    })
  }
}

const removeCommentAdditionalImage = (index) => {
  commentAdditionalImagePreviews.value.splice(index, 1)
  // Update selectedFiles to match imagePreviews
  commentAdditionalSelectedFiles.value = commentAdditionalImagePreviews.value.map(
    (preview) => preview.file,
  )
}

const viewImage = (imageUrl) => {
  // Open image in a new tab/window
  window.open(imageUrl, '_blank')
}

// Function to view comment images in fullscreen
const viewCommentImageFullscreen = (imageUrl, index, commentImages, commentText = '') => {
  currentImageUrl.value = imageUrl
  currentImageIndex.value = index
  currentImageList.value = commentImages || []
  currentImageContext.value = commentText
    ? `Comment: "${commentText.substring(0, 50)}${commentText.length > 50 ? '...' : ''}"`
    : 'Comment Images'
  showImageViewer.value = true

  // Add keyboard event listener
  document.addEventListener('keydown', handleImageViewerKeyboard)
}

// Fullscreen image viewer
const showImageViewer = ref(false)
const currentImageUrl = ref('')
const currentImageIndex = ref(0)
const currentImageList = ref([])
const currentImageContext = ref('')

const handleImageViewerKeyboard = (event) => {
  if (!showImageViewer.value) return

  switch (event.key) {
    case 'Escape':
      closeImageViewer()
      break
    case 'ArrowLeft':
      previousImage()
      break
    case 'ArrowRight':
      nextImage()
      break
  }
}

const nextImage = () => {
  if (currentImageIndex.value < currentImageList.value.length - 1) {
    currentImageIndex.value++
    currentImageUrl.value = currentImageList.value[currentImageIndex.value]
  }
}

const previousImage = () => {
  if (currentImageIndex.value > 0) {
    currentImageIndex.value--
    currentImageUrl.value = currentImageList.value[currentImageIndex.value]
  }
}

const closeImageViewer = () => {
  showImageViewer.value = false
  currentImageUrl.value = ''
  currentImageIndex.value = 0
  currentImageList.value = []
  currentImageContext.value = ''

  // Remove keyboard event listener
  document.removeEventListener('keydown', handleImageViewerKeyboard)
}

const viewImageFullscreen = (imageUrl, index) => {
  currentImageUrl.value = imageUrl
  currentImageIndex.value = index
  currentImageList.value = selectedMxRecord.value.image_urls || []
  currentImageContext.value = 'Task Images'
  showImageViewer.value = true

  // Add keyboard event listener
  document.addEventListener('keydown', handleImageViewerKeyboard)
}

const submitCommentAdditionalPhotos = async () => {
  if (
    !selectedMxRecord.value ||
    !selectedCommentLog.value ||
    commentAdditionalImagePreviews.value.length === 0
  ) {
    return
  }

  uploadingCommentPhotos.value = true

  try {
    // Upload additional comment photos
    const commentAdditionalFilesToUpload = commentAdditionalImagePreviews.value.map(
      (preview) => preview.file,
    )
    console.log(`Uploading ${commentAdditionalFilesToUpload.length} additional comment photos...`)

    const newImageUrls = await uploadImages(
      commentAdditionalFilesToUpload,
      selectedMxRecord.value.property_id,
      'comment',
    )

    console.log('Additional comment photos uploaded successfully:', newImageUrls)

    // Get existing comment image URLs and merge with new ones
    const existingImageUrls = selectedCommentLog.value.image_urls || []
    const updatedImageUrls = [...existingImageUrls, ...newImageUrls]

    // Find the comment in the logs and update it
    const updatedLogs = selectedMxRecordLogs.value.map((log) => {
      if (log.log_timestamp === selectedCommentLog.value.log_timestamp) {
        return {
          ...log,
          image_urls: updatedImageUrls,
        }
      }
      return log
    })

    // Update the task with updated logs
    const propertyId = selectedMxRecord.value.property_id
    const mxRecordId = selectedMxRecord.value.id

    if (!propertyId || !mxRecordId) {
      throw new Error(`Missing required IDs: propertyId=${propertyId}, mxRecordId=${mxRecordId}`)
    }

    const propertyIdStr = String(propertyId)
    const mxRecordIdStr = String(mxRecordId)

    const updateData = {
      logs: updatedLogs,
      updatedAt: new Date(),
    }

    await updateDocument(`properties/${propertyIdStr}/mxrecords`, mxRecordIdStr, updateData)

    // Update local data
    selectedMxRecord.value.logs = updatedLogs
    selectedCommentLog.value.image_urls = updatedImageUrls

    // Close dialog and refresh data
    closeAddCommentPhotosDialog()
    await userDataStore.loadMxRecords()

    // Show success notification
    import('quasar').then(({ Notify }) => {
      Notify.create({
        type: 'positive',
        message: `${newImageUrls.length} photo${newImageUrls.length > 1 ? 's' : ''} added to comment successfully!`,
        position: 'top',
      })
    })
  } catch (error) {
    console.error('Error uploading additional comment photos:', error)

    import('quasar').then(({ Notify }) => {
      Notify.create({
        type: 'negative',
        message: 'Failed to upload photos to comment. Please try again.',
        position: 'top',
      })
    })
  } finally {
    uploadingCommentPhotos.value = false
  }
}

const getTaskTransactionContextForRecord = (mxRecord = selectedMxRecord.value) => {
  if (!mxRecord) return null
  const propertyId = extractTaskPropertyId(mxRecord.property_id)
  const taskId = String(mxRecord.id || '').trim()
  if (!propertyId || !taskId) return null
  return {
    propertyId,
    taskId,
    taskDescription: mxRecord.description || '',
  }
}

const resetTaskTransactionForm = (context = null) => {
  const taskContext = context || activeTaskTransactionContext.value
  const roleValue =
    normalizeRoleValue(
      userDataStore.getUserRoleForProperty(taskContext?.propertyId)?.role,
    ) || 'pm'
  const defaultRole = roleLabel(roleValue) || 'Property Manager'

  taskTransactionForm.value = {
    transac_from: defaultRole,
    transac_to: '',
    amount: null,
    transac_date: new Date().toISOString().split('T')[0],
    transac_type: '',
    note: taskContext?.taskDescription
      ? `Task: ${taskContext.taskDescription}`
      : '',
  }
  taskTransactionSelectedFile.value = null
  taskTransactionImagePreview.value = null
}

const onTaskTransactionFileSelected = (file) => {
  if (!file) {
    taskTransactionImagePreview.value = null
    return
  }
  const reader = new FileReader()
  reader.onload = (event) => {
    taskTransactionImagePreview.value = event?.target?.result || null
  }
  reader.readAsDataURL(file)
}

const resolveTaskCostDecision = (decision) => {
  showTaskCostPromptDialog.value = false
  if (taskCostDecisionResolver.value) {
    taskCostDecisionResolver.value(decision)
    taskCostDecisionResolver.value = null
  }
}

const promptTaskCostDecision = () => {
  showTaskCostPromptDialog.value = true
  return new Promise((resolve) => {
    taskCostDecisionResolver.value = resolve
  })
}

const resolveAddAnotherTransaction = (addAnother) => {
  showAddAnotherTransactionDialog.value = false
  if (addAnotherTransactionResolver.value) {
    addAnotherTransactionResolver.value(addAnother)
    addAnotherTransactionResolver.value = null
  }
}

const promptAddAnotherTransaction = () => {
  showAddAnotherTransactionDialog.value = true
  return new Promise((resolve) => {
    addAnotherTransactionResolver.value = resolve
  })
}

const openTaskTransactionDialog = ({ context, requireSave }) => {
  activeTaskTransactionContext.value = context
  requireTaskTransactionSave.value = Boolean(requireSave)
  resetTaskTransactionForm(context)
  showTaskTransactionDialog.value = true
  return new Promise((resolve) => {
    taskTransactionResolver.value = resolve
  })
}

const cancelTaskTransactionDialog = () => {
  if (requireTaskTransactionSave.value) return
  showTaskTransactionDialog.value = false
  if (taskTransactionResolver.value) {
    taskTransactionResolver.value(null)
    taskTransactionResolver.value = null
  }
}

const syncTaskCostSummary = async (context) => {
  if (!context?.propertyId || !context?.taskId) return
  const count = selectedTaskTransactionRows.value.length
  const total = Number(taskTransactionsTotal.value || 0)

  try {
    await updateDocument(`properties/${context.propertyId}/mxrecords`, context.taskId, {
      cost_transaction_count: count,
      cost_total_amount: total,
      cost_last_updated_at: new Date(),
      updatedAt: new Date(),
    })
  } catch (error) {
    console.error('Failed to sync task cost summary:', error)
  }

  if (selectedMxRecord.value?.id === context.taskId) {
    selectedMxRecord.value.cost_transaction_count = count
    selectedMxRecord.value.cost_total_amount = total
    selectedMxRecord.value.cost_last_updated_at = new Date().toISOString()
  }
}

const saveTaskTransaction = async () => {
  const context = activeTaskTransactionContext.value
  if (!context?.propertyId || !context?.taskId) {
    Notify.create({
      type: 'negative',
      message: 'Task context is missing for transaction creation.',
      position: 'top',
    })
    return
  }

  if (!taskTransactionForm.value.transac_type) {
    Notify.create({ type: 'negative', message: 'Transaction type is required.', position: 'top' })
    return
  }
  if (!taskTransactionForm.value.transac_from || !taskTransactionForm.value.transac_to) {
    Notify.create({
      type: 'negative',
      message: 'Transaction from/to are required.',
      position: 'top',
    })
    return
  }
  if (taskTransactionForm.value.transac_from === taskTransactionForm.value.transac_to) {
    Notify.create({
      type: 'negative',
      message: 'From and To cannot be the same.',
      position: 'top',
    })
    return
  }
  if (!taskTransactionForm.value.transac_date) {
    Notify.create({ type: 'negative', message: 'Transaction date is required.', position: 'top' })
    return
  }
  if (!(Number(taskTransactionForm.value.amount) > 0)) {
    Notify.create({
      type: 'negative',
      message: 'Amount must be greater than 0.',
      position: 'top',
    })
    return
  }

  savingTaskTransaction.value = true
  try {
    let pictureUrl = ''
    if (taskTransactionSelectedFile.value) {
      const uploaded = await uploadImages(
        [taskTransactionSelectedFile.value],
        context.propertyId,
        'transaction',
      )
      pictureUrl = Array.isArray(uploaded) && uploaded.length > 0 ? uploaded[0] : ''
    }

    const now = new Date()
    const transactionPayload = {
      transac_id: `txn_${Date.now()}`,
      property_id: context.propertyId,
      task_id: context.taskId,
      related_type: 'task',
      role:
        normalizeRoleValue(
          userDataStore.getUserRoleForProperty(context.propertyId)?.role,
        ) || '',
      created_by_role:
        normalizeRoleValue(
          userDataStore.getUserRoleForProperty(context.propertyId)?.role,
        ) || '',
      transac_from: taskTransactionForm.value.transac_from,
      transac_to: taskTransactionForm.value.transac_to,
      amount: Number(taskTransactionForm.value.amount),
      transac_date: taskTransactionForm.value.transac_date,
      transac_type: taskTransactionForm.value.transac_type,
      note: taskTransactionForm.value.note || '',
      picture_url: pictureUrl,
      created_by: userDataStore.userId,
      created_by_user_id: userDataStore.userId,
      created_datetime: now,
      updatedAt: now,
    }

    const transactionId = await createDocument(
      `properties/${context.propertyId}/transactions`,
      transactionPayload,
    )

    selectedTaskTransactions.value.unshift({
      id: transactionId,
      ...transactionPayload,
    })
    await syncTaskCostSummary(context)

    showTaskTransactionDialog.value = false

    if (taskTransactionResolver.value) {
      taskTransactionResolver.value(transactionId)
      taskTransactionResolver.value = null
    }

    Notify.create({
      type: 'positive',
      message: 'Task transaction saved successfully.',
      position: 'top',
    })
  } catch (error) {
    console.error('Failed to create task transaction:', error)
    Notify.create({
      type: 'negative',
      message: error?.message || 'Failed to save task transaction.',
      position: 'top',
    })
  } finally {
    savingTaskTransaction.value = false
  }
}

const openTaskTransactionEntry = async () => {
  if (!canManageRecords.value) return
  const context = getTaskTransactionContextForRecord()
  if (!context) {
    Notify.create({
      type: 'negative',
      message: 'Unable to open transaction form for this task.',
      position: 'top',
    })
    return
  }
  await openTaskTransactionDialog({ context, requireSave: false })
}

const handleResolutionCostFlow = async () => {
  const context = getTaskTransactionContextForRecord()
  if (!context) return

  const decision = await promptTaskCostDecision()
  if (decision !== 'yes') return

  let continueAdding = true
  while (continueAdding) {
    const transactionId = await openTaskTransactionDialog({ context, requireSave: true })
    if (!transactionId) continue
    continueAdding = await promptAddAnotherTransaction()
  }
}

const submitComment = async () => {
  console.log('submitComment called with:', {
    comment: newComment.value.comment,
    action_type: newComment.value.action_type,
    selectedMxRecord: selectedMxRecord.value?.id,
  })

  if (!newComment.value.comment || !newComment.value.action_type) {
    console.error('Missing required fields:', {
      comment: newComment.value.comment,
      action_type: newComment.value.action_type,
    })

    import('quasar').then(({ Notify }) => {
      Notify.create({
        type: 'negative',
        message: 'Please fill in all required fields',
        position: 'top',
      })
    })
    return
  }

  if (!selectedMxRecord.value || !selectedMxRecord.value.id) {
    console.error('No selected task or missing ID:', selectedMxRecord.value)

    import('quasar').then(({ Notify }) => {
      Notify.create({
        type: 'negative',
        message: 'No task selected',
        position: 'top',
      })
    })
    return
  }

  submittingComment.value = true

  try {
    // Handle comment image uploads if files are selected
    let commentImageUrls = []
    const commentFilesToUpload = commentImagePreviews.value.map((preview) => preview.file)
    if (commentFilesToUpload.length > 0) {
      try {
        console.log(`Uploading ${commentFilesToUpload.length} comment images...`)
        commentImageUrls = await uploadImages(
          commentFilesToUpload,
          selectedMxRecord.value.property_id,
          'comment',
        )
        console.log('Comment images uploaded successfully to Firebase Storage:', commentImageUrls)
      } catch (error) {
        console.error('Error uploading comment images to Firebase Storage:', error)
        // Continue with comment submission even if image upload fails
        import('quasar').then(({ Notify }) => {
          Notify.create({
            type: 'warning',
            message: 'Images could not be uploaded, but comment will still be added',
            position: 'top',
          })
        })
      }
    }

    // Create new log entry
    const newLogEntry = {
      log_timestamp: new Date(),
      comment: newComment.value.comment,
      user_id: userDataStore.userId,
      user_name: userDataStore.user?.displayName || userDataStore.user?.email || 'Unknown User',
      user_role:
        normalizeRoleValue(
          userDataStore.getUserRoleForProperty(selectedMxRecord.value.property_id)?.role,
        ) ||
        'Unknown Role',
      action_type: newComment.value.action_type,
      image_urls: commentImageUrls, // Add uploaded comment image URLs
    }

    // Add the log entry to the task
    const updatedLogs = [...selectedMxRecordLogs.value, newLogEntry]

    // Validate IDs before constructing path
    const propertyId = selectedMxRecord.value.property_id
    const mxRecordId = selectedMxRecord.value.id

    console.log('Validating IDs for Firebase update:', {
      propertyId: propertyId,
      propertyIdType: typeof propertyId,
      mxRecordId: mxRecordId,
      mxRecordIdType: typeof mxRecordId,
      selectedMxRecord: selectedMxRecord.value,
    })

    if (!propertyId || !mxRecordId) {
      throw new Error(`Missing required IDs: propertyId=${propertyId}, mxRecordId=${mxRecordId}`)
    }

    // Ensure IDs are strings
    const propertyIdStr = String(propertyId)
    const mxRecordIdStr = String(mxRecordId)
    const documentPath = `properties/${propertyIdStr}/mxrecords/${mxRecordIdStr}`

    // Prepare update data
    const updateData = {
      logs: updatedLogs,
      updatedAt: new Date(),
    }

    // If action type is 'resolution', automatically change status to 'closed'
    if (newComment.value.action_type === 'resolution') {
      updateData.status = 'closed'
      console.log('Resolution comment detected - automatically setting status to closed')
    }

    console.log('Updating task with new comment...', {
      documentPath,
      newLogEntry,
      totalLogs: updatedLogs.length,
      updateData,
      willAutoClose: newComment.value.action_type === 'resolution',
    })

    await updateDocument(`properties/${propertyIdStr}/mxrecords`, mxRecordIdStr, updateData)

    console.log('Task updated successfully with new comment')

    // Update the local selected record
    selectedMxRecord.value.logs = updatedLogs

    // Update local status if it was changed
    if (newComment.value.action_type === 'resolution') {
      selectedMxRecord.value.status = 'closed'
      console.log('Local task status updated to closed')
    }

    const isResolution = newComment.value.action_type === 'resolution'

    // Close comment dialog first, then continue resolution cost flow if needed.
    closeCommentDialog()

    if (isResolution) {
      await handleResolutionCostFlow()
    }

    // Refresh task + transaction data for latest linked results.
    await Promise.all([
      userDataStore.loadMxRecords(),
      loadTaskTransactions(),
    ])

    Notify.create({
      type: 'positive',
      message: isResolution
        ? 'Resolution comment saved successfully.'
        : 'Comment added successfully!',
      position: 'top',
    })
  } catch (error) {
    console.error('Error adding comment:', error)

    // Show error notification
    import('quasar').then(({ Notify }) => {
      Notify.create({
        type: 'negative',
        message: 'Failed to add comment. Please try again.',
        position: 'top',
      })
    })
  } finally {
    submittingComment.value = false
  }
}

// Create task dialog functions
const openCreateMxRecordDialog = () => {
  if (!canManageRecords.value) return
  showCreateMxRecordComposer.value = true
}

const closeCreateMxRecordDialog = () => {
  showCreateMxRecordComposer.value = false
}

const onMxRecordCreated = (createdRecord) => {
  closeCreateMxRecordDialog()
  if (createdRecord && canManageRecords.value) {
    openTaskPublishDialog(createdRecord, 'create')
    return
  }
  refreshData()
}

const refreshData = async () => {
  await userDataStore.loadAllUserData()
}
</script>

<style scoped>
.mx-records-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.mxrecord-row {
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  margin-bottom: 0;
}

.mxrecord-row:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.clickable-row {
  cursor: pointer;
}

.clickable-row:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
}

/* Comment picture upload styles */
.comment-picture-upload-section {
  margin: 16px 0;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  background-color: #f8f9fa;
}

.comment-image-previews {
  max-height: 200px;
  overflow-y: auto;
}

.comment-image-preview-item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 80px;
}

.comment-image-preview-item .q-img {
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  overflow: hidden;
}

.comment-image-preview-item:hover .q-img {
  border-color: #1976d2;
}

/* Additional photos upload styles */
.additional-picture-upload-section {
  margin: 16px 0;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  background-color: #f8f9fa;
}

.additional-image-previews {
  max-height: 300px;
  overflow-y: auto;
}

.additional-image-preview-item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 120px;
}

.additional-image-preview-item .q-img {
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  overflow: hidden;
}

.additional-image-preview-item:hover .q-img {
  border-color: #1976d2;
}

/* Comment additional photos upload styles */
.comment-additional-picture-upload-section {
  margin: 16px 0;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  background-color: #f8f9fa;
}

.comment-additional-image-previews {
  max-height: 250px;
  overflow-y: auto;
}

.comment-additional-image-preview-item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 100px;
}

.comment-additional-image-preview-item .q-img {
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  overflow: hidden;
}

.comment-additional-image-preview-item:hover .q-img {
  border-color: #1976d2;
}

/* Log entry styles */
.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.log-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.add-comment-photos-btn {
  opacity: 0.7;
  transition: opacity 0.2s ease;
}

.log-entry:hover .add-comment-photos-btn {
  opacity: 1;
}

.log-images {
  padding: 8px;
  background-color: #f5f5f5;
  border-radius: 4px;
  border-left: 3px solid #1976d2;
}

.cursor-pointer {
  cursor: pointer;
}

/* Add More Photos Button */
.add-more-photos-btn {
  border: 1px dashed #1976d2;
  border-radius: 8px;
  padding: 8px 16px;
  transition: all 0.2s ease;
}

.add-more-photos-btn:hover {
  background-color: rgba(25, 118, 210, 0.1);
  border-color: #1976d2;
  transform: translateY(-1px);
}

/* Images Grid Styles */
.images-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 16px;
  margin-top: 16px;
}

.image-preview-container {
  position: relative;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.image-preview-container:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.image-preview {
  width: 100%;
  height: 100%;
  border-radius: 8px;
}

.image-overlay {
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 4px 8px;
  font-size: 0.75rem;
  text-align: center;
}

/* Fullscreen Image Viewer Styles */
.image-viewer-card {
  background: #000;
  color: white;
}

.image-viewer-header {
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  position: sticky;
  top: 0;
  z-index: 1;
}

.image-viewer-content {
  padding: 0;
  height: calc(100vh - 80px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-viewer-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fullscreen-image {
  max-width: 100%;
  max-height: 100%;
  cursor: pointer;
}

.image-nav-btn {
  color: white;
}

.image-nav-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .images-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 12px;
  }
}

.mxrecord-row-content {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
}

.mxrecord-image {
  flex-shrink: 0;
  width: 80px;
  height: 80px;
}

.issue-image {
  width: 100%;
  height: 100%;
  border-radius: 6px;
  overflow: hidden;
}

.image-overlay {
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 4px 8px;
  font-size: 0.75rem;
}

.mxrecord-description {
  flex: 1;
  min-width: 0;
}

.description-title {
  font-size: 1rem;
  font-weight: 600;
  color: #1a1a1a;
  line-height: 1.3;
  margin-bottom: 4px;
  word-break: break-word;
}

.description-property {
  font-size: 0.85rem;
  color: #666;
}

.mxrecord-date {
  flex-shrink: 0;
  width: 100px;
  text-align: center;
}

.date-label {
  font-size: 0.75rem;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.date-value {
  font-size: 0.9rem;
  font-weight: 500;
  color: #1a1a1a;
}

.mxrecord-reporter {
  flex-shrink: 0;
  width: 120px;
  text-align: center;
}

.reporter-label {
  font-size: 0.75rem;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.reporter-value {
  font-size: 0.9rem;
  font-weight: 500;
  color: #1a1a1a;
  margin-bottom: 2px;
}

.reporter-role {
  font-size: 0.8rem;
  color: #666;
}

.mxrecord-status {
  flex-shrink: 0;
  display: flex;
  justify-content: center;
}

.status-chip {
  font-weight: 500;
}

.mxrecord-actions {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.action-btn {
  font-weight: 500;
  text-transform: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-size: 0.85rem;
  min-height: 36px;
  white-space: nowrap;
}

.search-input {
  max-width: 500px;
}

.summary-card {
  min-width: 120px;
  transition: all 0.2s ease-in-out;
  cursor: pointer;
}

.summary-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.summary-card.filter-active {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  border: 2px solid var(--q-primary);
}

.cursor-pointer {
  cursor: pointer;
}

/* Responsive Design */
@media (max-width: 768px) {
  .mxrecord-row-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    padding: 12px;
  }

  .mxrecord-image {
    width: 100%;
    height: 120px;
    align-self: center;
  }

  .mxrecord-description {
    width: 100%;
  }

  .mxrecord-date,
  .mxrecord-reporter {
    width: auto;
    text-align: left;
  }

  .mxrecord-status {
    align-self: flex-start;
  }

  .mxrecord-actions {
    align-self: stretch;
    flex-direction: row;
    gap: 8px;
  }

  .action-btn {
    flex: 1;
    min-width: 0;
  }
}

/* Task Details Dialog Styles */
.mxrecord-dialog {
  background: white;
  border-radius: 0;
}

.dialog-header {
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  padding: 12px 16px;
}

.dialog-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.dialog-header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.dialog-action-btn {
  font-weight: 600;
  text-transform: none;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 0.9rem;
  min-height: 34px;
}

.publish-task-btn {
  box-shadow: 0 6px 18px rgba(251, 140, 0, 0.28);
}

.dialog-content {
  padding: 10px 8px;
  max-height: calc(100vh - 80px);
  overflow-y: auto;
}

.mxrecord-details-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 330px;
  gap: 16px;
  align-items: start;
}

.mxrecord-details-full {
  min-width: 0;
}

.task-bids-side-panel,
.sp-recommendations-panel {
  position: sticky;
  top: 8px;
}

.assigned-sp-banner {
  border: 1px solid var(--border-color);
  background: var(--status-info-bg);
}

.assigned-sp-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.assigned-sp-main {
  min-width: 0;
}

.assigned-sp-title {
  font-size: 0.72rem;
  color: var(--neutral-600);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  font-weight: 700;
}

.assigned-sp-name {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--neutral-900);
}

.assigned-sp-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.72rem;
  color: var(--neutral-600);
}

.assigned-sp-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.sp-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.sp-recommendation-list {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
}

.sp-recommendation-card {
  border-radius: 8px;
}

.sp-recommendation-content {
  padding: 8px !important;
}

.sp-row-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
}

.sp-row-title-wrap {
  min-width: 0;
}

.sp-row-title {
  font-size: 0.85rem;
  font-weight: 600;
  line-height: 1.25;
  color: var(--neutral-900);
  word-break: break-word;
}

.sp-row-subtitle {
  margin-top: 2px;
  font-size: 0.73rem;
  color: var(--neutral-600);
}

.sp-rating-chip {
  height: 20px;
  min-height: 20px;
  font-size: 0.68rem;
}

.sp-row-actions {
  margin-top: 6px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.sp-row-actions :deep(.q-btn) {
  min-height: 24px !important;
  padding: 2px 6px !important;
  font-size: 0.72rem !important;
}

.task-bids-section {
  margin-top: 4px;
}

.task-bid-rows {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.task-bid-row {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 6px 8px;
  background: #fff;
}

.task-bid-row--assigned {
  border-color: color-mix(in srgb, var(--primary-color) 45%, #dbeafe 55%);
  background: color-mix(in srgb, var(--primary-color) 6%, #ffffff 94%);
}

.task-bid-main {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  font-size: 13px;
}

.task-bid-sp-wrap {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 6px;
}

.task-bid-sp-link {
  padding: 0 !important;
  min-height: auto !important;
  color: var(--primary-color) !important;
  text-decoration: underline;
  font-size: 0.78rem;
  font-weight: 600;
}

.task-bid-sp-link :deep(.q-btn__content) {
  justify-content: flex-start !important;
}

.task-bid-sp {
  font-weight: 600;
  color: #111827;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.task-bid-rating-chip {
  height: 18px;
  min-height: 18px;
  font-size: 0.62rem;
}

.task-bid-amount {
  font-weight: 700;
  color: #0f766e;
  white-space: nowrap;
}

.task-bid-meta {
  margin-top: 2px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-size: 11px;
  color: #6b7280;
}

.task-bid-actions {
  margin-top: 4px;
  display: flex;
  justify-content: flex-end;
}

.task-bid-actions :deep(.q-btn) {
  min-height: 24px !important;
  padding: 2px 8px !important;
  font-size: 0.72rem !important;
}

.details-section {
  margin-bottom: 20px;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid #e9ecef;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 12px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-label {
  font-size: 0.875rem;
  font-weight: 700;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-value {
  font-size: 1rem;
  color: #1a1a1a;
  word-break: break-word;
}

.activity-log {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 12px;
  max-height: 320px;
  overflow-y: auto;
}

.log-entry {
  background: white;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 12px;
  border-left: 4px solid #1976d2;
}

.log-entry:last-child {
  margin-bottom: 0;
}

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.log-user {
  display: flex;
  align-items: center;
  gap: 8px;
}

.log-role {
  color: #666;
  font-size: 0.875rem;
}

.log-time {
  color: #666;
  font-size: 0.875rem;
}

.log-comment {
  color: #1a1a1a;
  line-height: 1.5;
}

/* Responsive Dialog */
@media (max-width: 1024px) {
  .mxrecord-details-layout {
    grid-template-columns: 1fr;
  }

  .task-bids-side-panel,
  .sp-recommendations-panel {
    position: static;
    order: 2;
  }

  .sp-recommendation-list {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .dialog-header {
    padding: 12px 16px;
  }

  .dialog-content {
    padding: 16px;
  }

  .details-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .log-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
}

/* Dialog Close Button Styling */
.dialog-close-btn {
  color: var(--neutral-600);
  transition: all 0.2s ease;
}

.dialog-close-btn:hover {
  color: var(--primary-color);
  background: rgba(36, 87, 115, 0.1);
  transform: scale(1.1);
}
</style>
