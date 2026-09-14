<template>
  <q-page class="reports-workspace">
    <header class="reports-heading">
      <div>
        <h1>Reports</h1>
        <p>{{ mode === 'pm_statement' ? account.label : 'A clear record of your properties.' }}</p>
      </div>
      <div class="report-heading-actions">
        <q-btn
          flat
          round
          icon="refresh"
          aria-label="Refresh report"
          :disable="loading || loadingOptions"
          @click="refreshReport"
        >
          <q-tooltip>Refresh report</q-tooltip>
        </q-btn>
        <q-btn
          outline
          no-caps
          icon="download"
          label="Export CSV"
          class="report-export"
          :disable="!canExport"
          @click="downloadReport"
        />
        <q-btn
          unelevated
          no-caps
          icon="picture_as_pdf"
          label="Export PDF"
          class="report-export report-export--primary"
          :disable="!canExport || pdfBusy"
          @click="openPdfDialog"
        />
      </div>
    </header>

    <div v-if="optionsError" class="report-message report-message--error" role="alert">
      <span>{{ optionsError }}</span
      ><q-btn flat no-caps label="Retry" @click="loadOptions" />
    </div>
    <div v-else-if="loadingOptions" class="report-message" role="status" aria-live="polite">
      <q-spinner size="20px" /> Loading your report access...
    </div>
    <template v-else>
      <div v-if="account.can_pm_statement" class="report-modes" aria-label="Report workspace">
        <button :aria-pressed="mode === 'property'" @click="changeMode('property')">
          Property reports
        </button>
        <button :aria-pressed="mode === 'pm_statement'" @click="changeMode('pm_statement')">
          PM account statement
        </button>
      </div>
      <div class="report-filters">
        <q-select
          v-model="selectedIds"
          :options="propertyOptions"
          multiple
          emit-value
          map-options
          outlined
          dense
          :disable="Boolean(headerPropertyId)"
          label="Properties"
          :display-value="scopeLabel"
          class="report-property-select"
          data-testid="report-properties"
        >
          <template #before-options>
            <q-item v-if="!headerPropertyId" clickable @click="selectAll">
              <q-item-section>{{
                mode === 'pm_statement'
                  ? 'All account properties, including past activity'
                  : 'All eligible properties'
              }}</q-item-section>
            </q-item>
            <q-item
              v-if="mode === 'property' && ownedIds.length && !headerPropertyId"
              clickable
              @click="selectedIds = ownedIds.slice()"
            >
              <q-item-section>My owned properties</q-item-section>
            </q-item>
          </template>
        </q-select>
        <q-select
          v-model="period"
          :options="periodOptions"
          emit-value
          map-options
          outlined
          dense
          label="Period"
          class="report-period-select"
        />
        <template v-if="period === 'custom'">
          <q-input v-model="fromDate" outlined dense type="date" label="From" />
          <q-input v-model="toDate" outlined dense type="date" label="To" />
        </template>
      </div>
      <p class="report-scope-note">
        {{
          headerPropertyId
            ? 'Property scope follows the workspace header.'
            : mode === 'pm_statement'
              ? 'Your account only. Matching company names do not combine accounts.'
              : 'Only properties with access to this report are included. Amounts are not prorated by ownership share.'
        }}
      </p>

      <nav v-if="mode === 'property'" class="report-tabs" aria-label="Property report type">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          :aria-current="tab.value === propertyType ? 'page' : undefined"
          @click="propertyType = tab.value"
        >
          {{ tab.label }}
        </button>
      </nav>

      <section class="report-content" :aria-busy="loading" aria-labelledby="active-report-title">
        <div class="report-content-heading">
          <div>
            <h2 id="active-report-title">{{ titles[activeType] }}</h2>
            <p>{{ dateLabel }} · USD</p>
          </div>
          <span class="report-basis-label">Recorded basis</span>
        </div>
        <div v-if="scopeError" class="report-message" role="status">{{ scopeError }}</div>
        <div v-else-if="reportError" class="report-message report-message--error" role="alert">
          <span>{{ reportError }}</span
          ><q-btn flat no-caps label="Retry" @click="loadReport" />
        </div>
        <div v-else-if="loading" class="report-message" role="status" aria-live="polite">
          <q-spinner size="20px" /> Loading report...
        </div>
        <template v-else-if="report">
          <div class="report-metrics">
            <div v-for="metric in metrics" :key="metric.label">
              <span>{{ metric.label }}</span
              ><strong>{{ metric.value }}</strong>
            </div>
          </div>
          <details v-if="report.warnings.length || report.excluded_count" class="report-data-note">
            <summary>
              Data notes{{
                report.excluded_count ? ` · ${report.excluded_count} excluded records` : ''
              }}
            </summary>
            <p v-if="report.excluded_count">
              Excluded records are not included in the displayed totals. Review the ledger and
              source records before relying on this report.
            </p>
            <ul>
              <li v-for="warning in report.warnings.slice(0, 20)" :key="warning">{{ warning }}</li>
            </ul>
            <p v-if="report.warnings.length > 20">
              {{ report.warnings.length - 20 }} more data notes. Narrow the property scope to review
              them.
            </p>
          </details>
          <p v-if="activeType === 'pm_statement'" class="report-account-note">
            Money in and out includes rent collected on behalf of owners, settlements and advances.
            It is not PM business profit.
          </p>
          <div v-if="!report.rows.length" class="report-empty" role="status">
            <h3>
              No {{ activeType === 'tasks' ? 'tasks' : 'reportable transactions' }} in this period
            </h3>
            <p>
              Try another period or property selection. Missing records are not assumed to be zero
              activity.
            </p>
          </div>
          <template v-else>
            <p class="report-scroll-hint">Scroll the table sideways to see all columns.</p>
            <q-table
              flat
              :rows="displayRows"
              :columns="columns"
              row-key="id"
              :pagination="{ rowsPerPage: 25 }"
              :rows-per-page-options="[25, 50, 100]"
              class="report-data-table"
              wrap-cells
            >
              <template #body-cell-title="props"
                ><q-td :props="props"
                  ><span class="report-task-title">{{ props.value }}</span></q-td
                ></template
              >
              <template #body-cell-note="props"
                ><q-td :props="props"
                  ><span class="report-task-title">{{ props.value }}</span></q-td
                ></template
              >
            </q-table>
            <details
              v-if="activeType === 'pnl' && report.property_totals.length > 1"
              class="report-breakdown"
            >
              <summary>By property · {{ report.property_totals.length }}</summary>
              <q-table
                flat
                :rows="report.property_totals"
                :columns="propertyColumns"
                row-key="property_id"
                :pagination="{ rowsPerPage: 25 }"
                class="report-data-table"
              />
            </details>
          </template>
          <details class="report-method">
            <summary>About this report</summary>
            <p>{{ report.basis }}</p>
            <p v-if="activeType !== 'tasks'">
              Based on recorded transactions, not accrual accounting, bank reconciliation or a
              double-entry general ledger. Unclassified items and non-operating movements do not
              automatically contribute to property P&amp;L.
            </p>
          </details>
        </template>
      </section>
    </template>
    <q-dialog v-model="showPdfDialog" :persistent="pdfBusy">
      <q-card class="report-pdf-dialog">
        <q-card-section>
          <h2>Export report</h2>
          <p>
            The full report for the current property selection and period is included, not just the
            visible table page.
          </p>
          <q-input
            v-model="pdfCompany"
            outlined
            label="Company name (optional)"
            maxlength="160"
            :disable="pdfBusy"
            hint="Used for this PDF. Your profile is not changed."
          />
          <p class="report-pdf-title">
            <strong>{{ pdfTitle }}</strong
            ><br />{{ titles[activeType] }} · {{ dateLabel }}
          </p>
          <p v-if="pdfError" role="alert">{{ pdfError }}</p>
          <p v-if="unicodePdf">
            This report contains non-Latin text. Use Print / Save PDF and choose “Save as PDF” to
            preserve every character.
          </p>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat no-caps label="Cancel" :disable="pdfBusy" v-close-popup />
          <q-btn
            v-if="unicodePdf"
            unelevated
            no-caps
            color="primary"
            label="Print / Save PDF"
            :disable="!canExport"
            @click="printPdf"
          />
          <q-btn
            v-else
            unelevated
            no-caps
            color="primary"
            label="Download PDF"
            :loading="pdfBusy"
            :disable="!canExport"
            @click="downloadPdf"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import {
  getReportingOptions,
  getWorkspaceReport,
  reportToCsv,
  groupPnlRows,
} from '../services/reportingApi'
import { reportingPeriod } from '../utils/reportingDates'
import { transactionReportRevision } from '../services/reportingChanges'
import {
  reportDocumentTitle,
  reportFilename,
  needsUnicodePrint,
  printReportDocument,
} from '../utils/reportDocument'

const route = useRoute()
const properties = ref([])
const account = ref({ id: '', label: 'My PM account', can_pm_statement: false })
const optionsError = ref('')
const loadingOptions = ref(true)
const reportError = ref('')
const loading = ref(false)
const report = ref(null)
const showPdfDialog = ref(false),
  pdfCompany = ref(''),
  pdfBusy = ref(false),
  pdfError = ref('')
const mode = ref('property')
const propertyType = ref('pnl')
const selectedIds = ref([])
const period = ref('month')
const initialPeriod = reportingPeriod('month')
const fromDate = ref(initialPeriod.from)
const toDate = ref(initialPeriod.to)
const periodOptions = [
  { label: 'This month', value: 'month' },
  { label: 'Last month', value: 'last_month' },
  { label: 'Year to date', value: 'year' },
  { label: 'Custom dates', value: 'custom' },
]
const tabs = [
  { label: 'P&L', value: 'pnl' },
  { label: 'Task History', value: 'tasks' },
  { label: 'General Ledger', value: 'ledger' },
]
const titles = {
  pnl: 'Profit & Loss',
  tasks: 'Task History',
  ledger: 'General Ledger',
  pm_statement: 'PM Account Statement',
}
const activeType = computed(() =>
  mode.value === 'pm_statement' ? 'pm_statement' : propertyType.value,
)
const headerPropertyId = computed(() =>
  typeof route.query.propertyId === 'string' ? route.query.propertyId : '',
)
const eligibleProperties = computed(() =>
  properties.value.filter((property) =>
    activeType.value === 'tasks' ? property.can_tasks : property.can_finance,
  ),
)
const propertyOptions = computed(() =>
  eligibleProperties.value.map((property) => ({ label: property.name, value: property.id })),
)
const ownedIds = computed(() =>
  eligibleProperties.value.filter((property) => property.is_owner).map((property) => property.id),
)
const scopeLabel = computed(() => {
  if (mode.value === 'pm_statement' && !selectedIds.value.length) return 'All account properties'
  if (selectedIds.value.length === 1)
    return (
      propertyOptions.value.find((option) => option.value === selectedIds.value[0])?.label ||
      'Unavailable property'
    )
  return selectedIds.value.length ? `${selectedIds.value.length} properties` : 'Select properties'
})
const scopeError = computed(() => {
  if (mode.value === 'pm_statement' && !account.value.can_pm_statement)
    return 'PM account reporting is not available to this account.'
  if (
    selectedIds.value.some(
      (value) => !propertyOptions.value.some((option) => option.value === value),
    )
  )
    return 'The selected property is not available for this report. Change the property scope or report type.'
  if (mode.value === 'property' && !selectedIds.value.length)
    return eligibleProperties.value.length
      ? 'Select at least one property to view the report.'
      : 'You do not have access to any properties for this report.'
  return ''
})
const dateLabel = computed(() => `${fromDate.value} to ${toDate.value}`)
const money = (value) =>
  typeof value === 'number' && Number.isFinite(value)
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
    : 'Not available'
const categoryLabel = (value) =>
  String(value || '')
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
const metrics = computed(() => {
  const summary = report.value?.summary || {}
  if (activeType.value === 'tasks')
    return [
      { label: 'Recorded tasks', value: summary.taskCount },
      { label: 'Open', value: summary.openTasks },
      { label: 'Completed', value: summary.completedTasks },
    ]
  if (activeType.value === 'pm_statement')
    return [
      { label: 'Management fees, net of refunds', value: money(summary.managementFees) },
      { label: 'Money in', value: money(summary.inflow) },
      { label: 'Money out', value: money(summary.outflow) },
    ]
  return [
    { label: 'Recorded income', value: money(summary.income) },
    { label: 'Recorded expenses', value: money(summary.expenses) },
    { label: 'Net recorded result', value: money(summary.net) },
  ]
})
const textColumn = (name, label, extra = {}) => ({
  name,
  label,
  field: name,
  align: 'left',
  sortable: true,
  ...extra,
})
const amountColumn = (name, label) => textColumn(name, label, { align: 'right', format: money })
const propertyColumns = [
  textColumn('property_name', 'Property'),
  amountColumn('income', 'Income'),
  amountColumn('expenses', 'Expenses'),
  amountColumn('net', 'Net result'),
]
const columns = computed(() => {
  if (activeType.value === 'pnl')
    return [
      textColumn('category', 'Category', { format: categoryLabel }),
      amountColumn('income', 'Income'),
      amountColumn('expense', 'Expenses'),
      amountColumn('net', 'Net result'),
    ]
  const shared = [textColumn('date', 'Date'), textColumn('property_name', 'Property')]
  if (activeType.value === 'tasks')
    return [
      ...shared,
      textColumn('title', 'Task'),
      textColumn('status', 'Status', { format: categoryLabel }),
      textColumn('completed_at', 'Completed'),
    ]
  const cash =
    activeType.value === 'pm_statement'
      ? [
          amountColumn('inflow', 'Money in'),
          amountColumn('outflow', 'Money out'),
          amountColumn('management_fee', 'Earned fee / refund'),
        ]
      : [
          amountColumn('amount', 'Amount'),
          amountColumn('income', 'P&L income'),
          amountColumn('expense', 'P&L expense'),
          textColumn('classification', 'P&L treatment', { format: categoryLabel }),
        ]
  return [
    ...shared,
    textColumn('category', 'Category', { format: categoryLabel }),
    textColumn('from', 'From'),
    textColumn('to', 'To'),
    ...cash,
    textColumn('note', 'Note'),
  ]
})
const displayRows = computed(() => {
  if (activeType.value !== 'pnl') return report.value?.rows || []
  return groupPnlRows(report.value?.rows || [])
})
const canExport = computed(
  () =>
    !!report.value?.rows.length &&
    !loading.value &&
    !loadingOptions.value &&
    !scopeError.value &&
    !reportError.value &&
    !optionsError.value,
)
const pdfPropertyNames = computed(() =>
  selectedIds.value.length
    ? selectedIds.value.map((id) => propertyOptions.value.find((p) => p.value === id)?.label || id)
    : [...new Set((report.value?.rows || []).map((row) => row.property_name).filter(Boolean))],
)
const pdfTitle = computed(() =>
  reportDocumentTitle(
    pdfCompany.value,
    pdfPropertyNames.value,
    mode.value === 'pm_statement' && !selectedIds.value.length,
  ),
)
function pdfSnapshot() {
  if (!canExport.value) return null
  const formatted = (rows, cols) =>
    rows.map((row) =>
      cols.map((col) => {
        const value = typeof col.field === 'function' ? col.field(row) : row[col.field]
        return String(col.format ? col.format(value, row) : (value ?? ''))
      }),
    )
  return {
    title: pdfTitle.value,
    companyName: pdfCompany.value.trim(),
    reportTitle: titles[activeType.value],
    period: dateLabel.value,
    scope: pdfPropertyNames.value.slice(),
    metrics: metrics.value.map((metric) => ({ ...metric })),
    columns: columns.value.map(({ label, align }) => ({ label, align })),
    rows: formatted(displayRows.value, columns.value),
    propertyColumns: propertyColumns.map(({ label, align }) => ({ label, align })),
    propertyRows:
      activeType.value === 'pnl' && report.value.property_totals.length > 1
        ? formatted(report.value.property_totals, propertyColumns)
        : [],
    basis: report.value.basis,
    notes: [
      ...(activeType.value !== 'tasks'
        ? [
            'Recorded transactions only; not bank reconciliation, accrual accounting or a double-entry ledger. Amounts are not prorated by ownership share.',
          ]
        : []),
      ...(activeType.value === 'pm_statement'
        ? ['Money in/out includes funds handled for owners and is not PM business profit.']
        : []),
      ...(report.value.excluded_count
        ? [
            `${report.value.excluded_count} records excluded from totals. Review source records before relying on this report.`,
          ]
        : []),
      ...report.value.warnings,
    ],
    landscape: ['ledger', 'pm_statement'].includes(activeType.value),
    generatedAt: new Date().toISOString().slice(0, 10),
  }
}
const unicodePdf = computed(() => {
  if (!showPdfDialog.value) return false
  const snapshot = pdfSnapshot()
  return snapshot ? needsUnicodePrint(snapshot) : false
})
function openPdfDialog() {
  if (!canExport.value) return
  pdfCompany.value = account.value.company_name || ''
  pdfError.value = ''
  showPdfDialog.value = true
}
async function downloadPdf() {
  if (!canExport.value || pdfBusy.value) return
  const snapshot = pdfSnapshot(),
    request = reportSequence
  const filename = reportFilename(activeType.value, fromDate.value, toDate.value)
  pdfBusy.value = true
  pdfError.value = ''
  try {
    const { createReportPdf } = await import('../services/reportPdf')
    if (request !== reportSequence || !canExport.value)
      throw new Error('The report changed. Review the current selection before exporting.')
    const document = createReportPdf(snapshot)
    document.save(filename)
    showPdfDialog.value = false
  } catch (error) {
    pdfError.value = error.message || 'Unable to generate PDF. Please retry.'
  } finally {
    pdfBusy.value = false
  }
}
function printPdf() {
  const snapshot = pdfSnapshot()
  if (snapshot) printReportDocument(snapshot)
}
let optionsController,
  reportController,
  reportSequence = 0,
  optionsSequence = 0

function selectAll() {
  selectedIds.value =
    mode.value === 'pm_statement' ? [] : eligibleProperties.value.map((property) => property.id)
}
function changeMode(value) {
  mode.value = value
  selectedIds.value = headerPropertyId.value
    ? [headerPropertyId.value]
    : value === 'pm_statement'
      ? []
      : eligibleProperties.value.map((property) => property.id)
}
async function loadOptions() {
  const request = ++optionsSequence
  optionsController?.abort()
  optionsController = new AbortController()
  loadingOptions.value = true
  optionsError.value = ''
  report.value = null
  try {
    const result = await getReportingOptions({ signal: optionsController.signal })
    if (request !== optionsSequence) return
    properties.value = result.properties
    account.value = result.account
    if (!account.value.can_pm_statement) mode.value = 'property'
    if (!result.properties.some((p) => p.can_finance) && result.properties.some((p) => p.can_tasks))
      propertyType.value = 'tasks'
    selectedIds.value = headerPropertyId.value
      ? [headerPropertyId.value]
      : mode.value === 'pm_statement'
        ? []
        : eligibleProperties.value.map((property) => property.id)
  } catch (error) {
    if (request === optionsSequence && error.name !== 'AbortError')
      optionsError.value = error.message
  } finally {
    if (request === optionsSequence) loadingOptions.value = false
  }
}
async function loadReport() {
  const request = ++reportSequence
  reportController?.abort()
  report.value = null
  reportError.value = ''
  loading.value = false
  if (loadingOptions.value || optionsError.value || scopeError.value) return
  reportController = new AbortController()
  loading.value = true
  try {
    const result = await getWorkspaceReport(
      {
        type: activeType.value,
        property_ids: selectedIds.value.slice(),
        from: fromDate.value,
        to: toDate.value,
      },
      { signal: reportController.signal },
    )
    if (request === reportSequence) report.value = result
  } catch (error) {
    if (request === reportSequence && error.name !== 'AbortError') reportError.value = error.message
  } finally {
    if (request === reportSequence) loading.value = false
  }
}
function downloadReport() {
  if (!canExport.value) return
  const scope =
    mode.value === 'pm_statement'
      ? `${account.value.label}: ${scopeLabel.value}`
      : selectedIds.value
          .map((id) => propertyOptions.value.find((option) => option.value === id)?.label || id)
          .join('; ')
  const csv = reportToCsv(report.value, { from: fromDate.value, to: toDate.value, scope })
  const url = URL.createObjectURL(new Blob(['\ufeff', csv], { type: 'text/csv;charset=utf-8;' }))
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `${activeType.value}_${fromDate.value}_${toDate.value}.csv`
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
function syncPeriod() {
  const range = reportingPeriod(period.value)
  if (range) {
    fromDate.value = range.from
    toDate.value = range.to
  }
}
function refreshReport() {
  syncPeriod()
  if (optionsError.value) return loadOptions()
  return loadReport()
}
watch(period, syncPeriod)
watch(transactionReportRevision, refreshReport, { flush: 'sync' })
watch(headerPropertyId, (value) => {
  selectedIds.value = value
    ? [value]
    : mode.value === 'pm_statement'
      ? []
      : eligibleProperties.value.map((property) => property.id)
})
watch(
  [activeType, selectedIds, fromDate, toDate, loadingOptions, scopeError],
  () => {
    // Clear the old snapshot synchronously, including its export action, before scheduling a new fetch.
    reportController?.abort()
    reportSequence += 1
    report.value = null
    loadReport()
  },
  { deep: true, flush: 'sync' },
)
onMounted(loadOptions)
onBeforeUnmount(() => {
  reportSequence += 1
  optionsSequence += 1
  optionsController?.abort()
  reportController?.abort()
})
</script>

<style src="../css/reports-workspace.scss" lang="scss"></style>
