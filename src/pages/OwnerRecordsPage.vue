<template>
  <q-page class="owner-records">
    <header class="owner-records-heading">
      <div><div class="owner-eyebrow">{{ store.isViewerOnlyUser ? 'Shared property workspace' : 'Owner workspace' }}</div><h1>{{ page.title }}</h1>
        <p>{{ writableProperties.length ? 'Review property records and add new activity.' : 'View-only access. You can review shared records but cannot change them.' }}</p></div>
      <div class="row q-gutter-sm">
        <q-btn outline color="primary" icon="refresh" label="Refresh" :loading="loading" @click="load" />
        <q-btn v-if="createComponent && writableProperties.length" unelevated color="primary" icon="add"
          label="Create record" @click="openCreate" />
      </div>
    </header>
    <div class="owner-records-filters">
      <q-select outlined dense emit-value map-options :model-value="propertyId" :options="propertyOptions"
        label="Property" @update:model-value="selectProperty" />
      <q-input v-model="search" outlined dense clearable label="Search records">
        <template #prepend><q-icon name="search" /></template>
      </q-input>
    </div>
    <q-banner v-if="errors.length" rounded class="owner-error q-mb-md" role="alert">
      Some records could not be loaded. Access may be restricted; unavailable records are not shown.
      <div v-for="message in errors" :key="message" class="text-caption">{{ message }}</div>
      <template #action><q-btn flat label="Retry" @click="load" /></template>
    </q-banner>
    <q-table flat bordered :rows="filteredRows" :columns="columns" row-key="key" :loading="loading"
      :pagination="{ rowsPerPage: 15 }" :grid="$q.screen.lt.sm" class="owner-records-table"
      no-data-label="No shared records found for this selection.">
      <template #body-cell-action="props"><q-td :props="props">
        <q-btn outline color="primary" label="View" :aria-label="`View ${props.row.title}`" @click="selected = props.row" />
      </q-td></template>
      <template #item="props"><div class="col-12 q-pb-sm"><q-card flat bordered class="owner-record-mobile">
        <strong>{{ props.row.title }}</strong><p>{{ props.row.property }}</p>
        <div class="row items-center justify-between"><span>{{ props.row.status }}</span>
          <q-btn outline color="primary" label="View" @click="selected = props.row" /></div>
      </q-card></div></template>
    </q-table>
    <DetailShell :model-value="Boolean(selected)" :title="selected?.title || page.title"
      :subtitle="selected?.property || ''" @close="selected = null">
      <div v-if="selected" class="owner-record-detail">
        <div class="owner-eyebrow q-mb-md">{{ store.canWritePropertyRecords(selected.propertyId) ? 'Property record' : 'Shared record · Read only' }}</div>
        <dl class="owner-detail-grid"><div v-for="field in detailFields" :key="field.label">
          <dt>{{ field.label }}</dt><dd>{{ field.value }}</dd>
        </div></dl>
        <q-btn v-if="documentUrl" outline color="primary" icon="open_in_new" label="Open document"
          :href="documentUrl" target="_blank" rel="noopener noreferrer" class="q-mt-md" />
        <div v-if="page.collection === null" class="row q-gutter-sm q-mt-md">
          <q-btn v-for="link in propertyLinks" :key="link.link" outline color="primary" :label="link.title"
            :to="{ path: link.link, query: { propertyId: selected.propertyId } }" />
        </div>
      </div>
    </DetailShell>
    <DetailShell :model-value="creating" :title="`Create ${page.title}`" @close="creating = false">
      <div class="owner-record-detail">
        <q-select v-if="!createPropertyId" outlined emit-value map-options label="Choose a property"
          :options="writableProperties.map((p) => ({ label: p.nickname || p.address || 'Property', value: p.id }))"
          @update:model-value="createPropertyId = $event" />
        <component :is="createComponent" v-if="createPropertyId && store.canWritePropertyRecords(createPropertyId)"
          :key="`${page.collection}-${createPropertyId}`" :property-id="createPropertyId" :allow-property-edit="false"
          @mxrecord-created="recordCreated" @lease-created="recordCreated" @transaction-created="recordCreated"
          @document-created="recordCreated" @asset-created="recordCreated" @reminder-saved="recordCreated"
          @cancel="creating = false" />
      </div>
    </DetailShell>
  </q-page>
</template>

<script setup>
import { computed, defineAsyncComponent, onBeforeUnmount, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../boot/firebase'
import { useUserDataStore } from '../stores/userDataStore'
import { listPropertyLeasesRequest } from '../services/leaseApi'
import { leaseStatus } from '../../backend/leaseLifecycle'
import { ownerWorkspaceLinks } from '../utils/ownerWorkspace'
import DetailShell from '../components/details/DetailShell.vue'

const route = useRoute()
const router = useRouter()
const store = useUserDataStore()
const page = computed(() => ownerWorkspaceLinks.find((item) => item.link === route.path) || ownerWorkspaceLinks[1])
const properties = computed(() => store.userAccessibleProperties)
const writableProperties = computed(() => properties.value.filter((p) => store.canWritePropertyRecords(p.id) && (!propertyId.value || p.id === propertyId.value)))
const creating = ref(false)
const createPropertyId = ref('')
const creators = {
  mxrecords: defineAsyncComponent(() => import('../components/CreateMxRecord.vue')),
  leases: defineAsyncComponent(() => import('../components/CreateLease.vue')),
  transactions: defineAsyncComponent(() => import('../components/CreateTransaction.vue')),
  documents: defineAsyncComponent(() => import('../components/CreateDocument.vue')),
  assets: defineAsyncComponent(() => import('../components/CreateAsset.vue')),
  reminders: defineAsyncComponent(() => import('../components/CreateReminder.vue')),
}
const createComponent = computed(() => creators[page.value.collection])
function openCreate() {
  if (!createComponent.value || !writableProperties.value.length) return
  createPropertyId.value = writableProperties.value.length === 1 ? writableProperties.value[0].id : ''
  creating.value = true
}
async function recordCreated() { creating.value = false; await load() }
const propertyId = computed(() => String(route.query.propertyId || ''))
const propertyOptions = computed(() => [{ label: 'All shared properties', value: '' },
  ...properties.value.map((p) => ({ label: p.nickname || p.address || 'Property', value: p.id }))])
const propertyLinks = ownerWorkspaceLinks.filter((item) => !['/po-dashboard', '/owner/properties'].includes(item.link))
const rows = ref([])
const selected = ref(null)
const loading = ref(false)
const errors = ref([])
const search = ref('')
let requestVersion = 0
const columns = [
  { name: 'title', label: 'Record', field: 'title', align: 'left', sortable: true },
  { name: 'property', label: 'Property', field: 'property', align: 'left', sortable: true },
  { name: 'status', label: 'Status / category', field: 'status', align: 'left', sortable: true },
  { name: 'date', label: 'Date', field: 'date', align: 'left' },
  { name: 'action', label: '', field: 'key', align: 'right' },
]
const filteredRows = computed(() => {
  const term = String(search.value || '').toLowerCase().trim()
  return rows.value.filter((row) => !term || [row.title, row.property, row.status].some((v) => v.toLowerCase().includes(term)))
})
const text = (value) => value == null || value === '' ? 'Not recorded' : String(value)
const date = (value) => {
  if (!value) return 'Not recorded'
  const parsed = value?.toDate ? value.toDate() : new Date(value)
  return Number.isNaN(parsed.getTime()) ? text(value) : parsed.toLocaleDateString()
}
const money = (value) => value == null || value === '' ? 'Not recorded' : Number.isFinite(Number(value))
  ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value)) : 'Not recorded'
const detailFields = computed(() => {
  if (!selected.value) return []
  const r = selected.value.raw
  const common = [{ label: 'Property', value: selected.value.property }, { label: 'Status / category', value: selected.value.status }]
  const fields = {
    properties: [['Address', r.address], ['Property type', r.type], ['Description', r.description]],
    tasks: [['Description', r.description], ['Status', r.status], ['Priority', r.priority], ['Created', date(r.created_datetime || r.created_at)], ['Notes', r.note || r.notes]],
    leases: [['Start date', date(r.lease_start_date || r.start_date)], ['End date', date(r.lease_end_date || r.end_date)], ['Rent', money(r.rate_amount)], ['Rate period', r.rate_type], ['Required deposit', money(r.deposit)], ['Notes', r.note || r.notes]],
    transactions: [['Type', r.transac_type], ['Category', r.category], ['Amount', money(r.amount)], ['From', r.transac_from], ['To', r.transac_to], ['Date', date(r.transac_date || r.transaction_date || r.date || r.created_datetime)], ['Description', r.description], ['Notes', r.note]],
    documents: [['Name', r.name || r.original_filename], ['Purpose', r.purpose || r.category], ['Description', r.description || r.note], ['Uploaded', date(r.upload_date || r.created_datetime)]],
    assets: [['Name', r.nickname || r.name], ['Category', r.category || r.type], ['Model', r.model], ['Serial number', r.serial_number], ['Description', r.description || r.note]],
    reminders: [['Category', r.category], ['Due', date(r.due_date || r.start_date)], ['Repeat', r.repeat], ['Notes', r.note]],
  }
  return [...common, ...(fields[route.path.split('/').pop()] || []).map(([label, value]) => ({ label, value: text(value) }))]
})
const documentUrl = computed(() => {
  if (page.value.collection !== 'documents' || !selected.value) return ''
  const r = selected.value.raw
  try { const url = new URL(r.file_url || r.url || r.image_url); return url.protocol === 'https:' ? url.href : '' } catch { return '' }
})
function selectProperty(id) {
  const query = { ...route.query }
  if (id) query.propertyId = id
  else query.propertyId = ''
  router.replace({ path: route.path, query })
}
async function load() {
  const version = ++requestVersion
  const type = page.value.collection
  selected.value = null
  rows.value = []
  errors.value = []
  loading.value = true
  const scope = properties.value.filter((p) => !propertyId.value || p.id === propertyId.value)
  const failures = []
  const result = []
  for (const property of scope) {
    const name = property.nickname || property.address || 'Property'
    try {
      const records = type === null ? [property] : type === 'leases'
        ? await listPropertyLeasesRequest({ propertyId: property.id })
        : (await getDocs(collection(db, 'properties', property.id, type))).docs.map((doc) => ({ ...doc.data(), id: doc.id }))
      for (const r of records) {
        const status = type === 'leases' ? leaseStatus(r) : typeof r.status === 'boolean' ? (r.status ? 'Active' : 'Inactive') : r.status || r.category || r.type || 'Not recorded'
        result.push({ key: `${property.id}/${r.id}`, propertyId: property.id, property: name, raw: r,
          title: text(r.nickname || r.name || r.description || r.original_filename || r.note || (type === 'leases' ? `${name} Lease` : r.transac_type) || page.value.title),
          status: text(status), date: date(r.transac_date || r.transaction_date || r.due_date || r.upload_date || r.created_datetime || r.created_at) })
      }
    } catch (error) { failures.push(`${name}: ${error.code === 'permission-denied' || error.status === 403 ? 'Access restricted' : 'Unable to load records'}`) }
  }
  if (version !== requestVersion) return
  rows.value = result
  errors.value = failures
  loading.value = false
}
watch([() => route.path, propertyId, () => store.userId, () => properties.value.map((p) => p.id).join('|')], () => { creating.value = false; search.value = ''; load() }, { immediate: true })
watch([() => route.query.create, () => page.value.collection, () => writableProperties.value.map((p) => p.id).join('|')], () => {
  if (route.query.create !== 'true' || !writableProperties.value.length) return
  openCreate()
  const query = { ...route.query }
  delete query.create
  router.replace({ path: route.path, query })
}, { immediate: true })
onBeforeUnmount(() => { requestVersion++ })
</script>

<style scoped>
.owner-records { max-width: 1280px; margin: auto; padding: 28px; color: var(--brand-ink, #243830); }
.owner-records-heading { display: flex; justify-content: space-between; align-items: center; gap: 16px; margin-bottom: 24px; }
.owner-records h1 { font-size: 28px; line-height: 1.2; margin: 8px 0; font-weight: 600; }
.owner-records p { color: var(--brand-muted, #61736a); margin: 8px 0; }
.owner-eyebrow { color: var(--brand-muted, #61736a); font-size: 12px; letter-spacing: .08em; text-transform: uppercase; }
.owner-records-filters { display: grid; grid-template-columns: minmax(160px, 1fr) minmax(160px, 2fr); gap: 16px; margin-bottom: 24px; }
.owner-records-table { border-color: var(--brand-border, #dbe3dc); border-radius: 12px; }
.owner-records-table :deep(td) { white-space: normal; overflow-wrap: anywhere; max-width: 360px; }
.owner-records :deep(.q-btn) { min-height: 44px; border-radius: 8px; text-transform: none; }
.owner-record-mobile { padding: 20px; }
.owner-record-detail { max-width: 1120px; margin: auto; }
.owner-detail-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; margin: 0; }
.owner-detail-grid > div { padding: 20px; border: 1px solid var(--brand-border, #dbe3dc); background: white; border-radius: 12px; }
.owner-detail-grid dt { color: var(--brand-muted, #61736a); font-size: 13px; margin-bottom: 8px; }
.owner-detail-grid dd { margin: 0; overflow-wrap: anywhere; white-space: pre-wrap; }
.owner-error { background: #fff4e5; color: #694714; }
@media (max-width: 600px) {
  .owner-records { padding: 20px 16px; }
  .owner-records-heading { align-items: flex-start; flex-wrap: wrap; }
  .owner-records-filters, .owner-detail-grid { grid-template-columns: 1fr; }
}
</style>
