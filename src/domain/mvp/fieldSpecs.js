export const TT_DASHBOARD_FIELDS = Object.freeze([
  'rent_due_date',
  'rent_due_in_days',
  'lease_start_date',
  'lease_end_date',
  'my_tasks_open_count',
  'my_tasks_in_progress_count',
  'my_tasks_resolved_count',
  'latest_payment_amount',
  'latest_payment_date',
  'latest_receipt_amount',
  'latest_receipt_date',
])

export const TT_CREATE_TASK_FIELDS = Object.freeze({
  required: ['task_title', 'task_description', 'task_priority', 'property_id'],
  optional: ['task_category', 'unit_id', 'photos', 'videos', 'attachments', 'draft_id'],
  actions: ['save_draft', 'submit_task'],
})

export const TT_INBOX_FIELDS = Object.freeze([
  'message_id',
  'message_type',
  'message_title',
  'message_body',
  'linked_task_id',
  'created_at',
  'is_read',
])

export const PM_PO_DASHBOARD_FIELDS = Object.freeze([
  'open_tasks_count',
  'overdue_tasks_count',
  'today_reminders_count',
  'expiring_leases_count',
  'overdue_rent_count',
  'monthly_income',
  'monthly_expense',
  'occupancy_rate',
])

export const PM_PO_CREATE_ENTITY_TYPES = Object.freeze([
  'property',
  'task',
  'asset',
  'reminder',
  'lease',
  'document',
  'transaction',
  'inventory',
])

export const PM_PO_RECORDS_GLOBAL_SEARCH_FIELDS = Object.freeze([
  'keyword',
  'entity_type_filter',
  'property_filter',
  'date_range',
  'status_filter',
  'actor_filter',
])

export const SEARCH_SP_FILTER_FIELDS = Object.freeze([
  'service_type',
  'location',
  'rating',
  'response_time',
  'price_range',
])

export const SP_PROFILE_REQUIRED_FIELDS = Object.freeze([
  'display_name',
  'provider_type',
  'service_categories',
  'service_areas',
  'phone',
  'email',
])

export const SP_VERIFICATION_MINIMUM_DOCS = 1

export const ADMIN_METRICS_DICTIONARY = Object.freeze([
  'dau_total',
  'dau_tt',
  'dau_sp',
  'dau_pm_po',
  'mau_total',
  'tasks_created',
  'proposals_submitted',
  'assignments_activated',
  'invoices_submitted',
  'invoices_approved',
  'invoices_paid',
  'firestore_reads_daily',
  'firestore_writes_daily',
  'storage_egress_gb_daily',
  'storage_used_gb_total',
  'event_failures_daily',
  'firebase_cost_daily',
  'firebase_cost_month_to_date',
  'ai_cost_daily',
  'ai_cost_month_to_date',
  'total_cost_month_to_date',
])

export const DATA_GOVERNANCE = Object.freeze({
  retentionPolicy: 'permanent',
  autoDeletionEnabled: false,
  manualDeletionOnly: true,
  deletionChannels: ['support_email', 'in_app_support_page'],
  requiredDeletionLogs: [
    'request_timestamp',
    'requester_identity',
    'approver_identity',
    'affected_data_categories',
    'completion_timestamp',
  ],
})

