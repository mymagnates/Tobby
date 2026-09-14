<template>
  <q-page>
    <WorkspaceHeader
      :title="title"
      :back="Boolean(route.query.returnTo)"
      @back="router.push(safeMobileReturnTo(route.query.returnTo, '/mobile/pm/home'))"
    >
      <q-btn
        v-if="mode === 'home' || mode === 'manage'"
        class="ios-primary ios-new-record"
        :ripple="false"
        unelevated
        no-caps
        icon="add"
        label="New record"
        @click="createOpen = true"
      />
    </WorkspaceHeader>
    <div v-if="error" class="ios-error" role="alert">
      {{ error }} <q-btn flat no-caps label="Retry" @click="load" />
    </div>
    <q-linear-progress v-if="loading" indeterminate aria-label="Loading" />
    <p v-if="!loading && selectedProperty && !properties.some((property) => property.id === selectedProperty)" class="ios-error" role="alert">
      This property is no longer available. Choose another property.
    </p>
    <q-select
      v-if="mode === 'home' || mode === 'manage'"
      v-model="selectedProperty"
      :options="propertyOptions"
      emit-value
      map-options
      outlined
      label="Property"
      dropdown-icon="expand_more"
      class="ios-property-select"
    />
    <template v-if="mode === 'home'">
      <div class="ios-section-heading">
        <h2>Needs attention</h2>
        <q-btn flat no-caps label="View all" @click="showAttention" />
      </div>
      <p v-if="!loading && !error && attention.length" class="ios-muted q-mt-none">
        {{ attention.filter((item) => item.attention.overdue).length }} overdue /
        {{ attention.filter((item) => item.attention.dueToday).length }} due today
      </p>
      <button
        v-for="item in attention.slice(0, 5)"
        :key="`${recordPropertyId(item)}-${item.type}-${item.id}`"
        class="ios-row"
        @click="selectRecord(item)"
      >
        <q-icon :name="item.type === 'tasks' ? 'task_alt' : 'event'" size="22px" />
        <span class="ios-row-body"
          ><span class="ios-row-title">{{ recordTitle(item) }}</span
          ><span class="ios-row-meta"
            >{{ propertyName(recordPropertyId(item)) }} ·
            {{ item.type === 'tasks' ? 'Task' : 'Reminder' }}
            <template v-if="item.attention.due">
              · {{ item.attention.due.toLocaleDateString() }}</template
            ></span
          ></span
        >
        <span class="ios-attention-label">{{ item.attention.label }}</span>
        <q-icon name="chevron_right" />
      </button>
      <div v-if="!loading && !error && !properties.length" class="ios-empty">
        <p>No properties yet. Set up a property on the web to get started.</p>
        <q-btn flat no-caps label="Property setup" @click="router.push('/mobile/pm/property')" />
      </div>
      <div v-else-if="!loading && !attention.length && !error && (!selectedProperty || properties.some((property) => property.id === selectedProperty))" class="ios-empty">
        <p>No urgent, overdue or due-today items.</p>
        <p class="ios-muted">Other open tasks may still need your attention.</p>
        <q-btn flat no-caps label="View all tasks" @click="showAllTasks" />
      </div>
    </template>
    <template v-else-if="mode === 'property'">
      <q-input v-model="search" outlined dense clearable label="Find a property"
        ><template #prepend><q-icon name="search" /></template
      ></q-input>
      <section v-for="property in filteredProperties" :key="property.id" class="ios-property">
        <h2 class="q-ma-none">{{ property.nickname || property.address || property.id }}</h2>
        <p class="ios-muted">{{ propertyLeasingStatus(store.userAccessibleLeases || [], property.id) }}</p>
        <p v-if="property.nickname" class="ios-muted q-mb-none">{{ property.address }}</p>
        <div class="ios-property-actions">
          <q-btn
            class="ios-primary"
            unelevated
            no-caps
            icon="fact_check"
            label="Inventory List"
            :loading="leaseLoading === property.id"
            @click="openInventory(property)"
          />
          <q-btn
            flat
            no-caps
            label="Records"
            icon-right="chevron_right"
            @click="showPropertyRecords(property.id)"
          />
        </div>
      </section>
      <div v-if="!loading && !filteredProperties.length && !error" class="ios-empty">
        {{
          properties.length
            ? 'No properties found.'
            : 'Add your first property on the web, then refresh here.'
        }}
        <q-btn v-if="!properties.length" flat no-caps label="Refresh properties" @click="load" />
      </div>
    </template>
    <template v-else-if="mode === 'manage'">
      <q-select
        v-model="recordFilter"
        :options="[
          { label: 'All records', value: 'all' },
          { label: 'Needs attention', value: 'attention' },
        ]"
        emit-value
        map-options
        outlined
        label="Show"
        class="q-mb-md"
      />
      <q-input v-model="search" outlined dense clearable label="Search records"
        ><template #prepend><q-icon name="search" /></template
      ></q-input>
      <q-select
        v-if="recordFilter !== 'attention'"
        v-model="recordType"
        :options="recordTypes"
        emit-value
        map-options
        outlined
        dense
        label="Record type"
        class="q-mt-md"
      />
      <button
        v-for="item in filteredRecords"
        :key="`${recordPropertyId(item)}-${item.type}-${item.id}`"
        class="ios-row"
        @click="selectRecord(item)"
      >
        <span class="ios-row-body"
          ><span class="ios-row-title">{{ recordTitle(item) }}</span
          ><span class="ios-row-meta"
            >{{ propertyName(recordPropertyId(item)) }} · {{ item.type }} ·
            {{ item.attention?.label || recordStatus(item) }}</span
          ></span
        ><q-icon name="chevron_right" />
      </button>
      <div v-if="!loading && !filteredRecords.length && !error" class="ios-empty">
        No records found.
      </div>
    </template>
    <template v-else-if="mode === 'account'">
      <h2>{{ store.userProfile?.display_name || store.user?.displayName || 'Your account' }}</h2>
      <p class="ios-muted">{{ store.user?.email }}</p>
      <h2>Usage</h2>
      <p v-if="quotaError" class="ios-error" role="alert">
        {{ quotaError }} <q-btn flat no-caps label="Retry" @click="loadQuota" />
      </p>
      <q-linear-progress v-if="quotaLoading" indeterminate aria-label="Loading usage" />
      <template v-else-if="quota">
        <div v-for="row in quotaRows" :key="row.label" class="ios-row">
          <span class="ios-row-body">{{ row.label }}</span
          ><span>{{ row.value }}</span>
        </div>
      </template>
      <h2>Support & privacy</h2>
      <a
        v-for="link in supportLinks"
        :key="link.label"
        class="ios-row ios-support-link"
        :href="link.url"
        target="_blank"
        rel="noopener noreferrer"
        ><span class="ios-row-body">{{ link.label }}</span
        ><q-icon name="open_in_new" size="18px"
      /></a>
      <q-expansion-item label="Camera, photos & microphone" dense-toggle>
        <p class="ios-muted">
          Camera and photo access are used when you attach item or property photos. Saving photos
          uses library access only when you choose to export. Microphone access is used only when
          you choose to record audio.
        </p>
      </q-expansion-item>
      <button class="ios-row" @click="deletionOpen = true">Request Account Deletion</button>
      <button class="ios-row" @click="logout">Sign out</button>
    </template>
    <q-dialog v-model="leaseOpen"
      ><q-card class="ios-dialog">
        <h2>Choose a lease</h2>
        <p v-if="!leases.length">
          No lease is linked to this property. Add the lease on the web first.
        </p>
        <q-list
          ><q-item
            v-for="lease in leases"
            :key="lease.id"
            clickable
            v-ripple
            @click="goToLease(lease)"
            ><q-item-section
              >{{ lease.LSID || lease.id
              }}<q-item-label caption
                >{{ lease.status }} ·
                {{ lease.lease_start_date || lease.start_date || '' }}</q-item-label
              ></q-item-section
            ><q-item-section side><q-icon name="chevron_right" /></q-item-section></q-item
        ></q-list>
        <q-btn flat no-caps label="Cancel" v-close-popup /> </q-card
    ></q-dialog>
    <q-dialog v-model="createOpen" position="bottom"
      ><q-card class="ios-dialog"
        ><h2>New record</h2>
        <q-list
          ><q-item v-for="item in createTypes" :key="item.label" clickable @click="openCreate(item)"
            ><q-item-section avatar><q-icon :name="item.icon" /></q-item-section
            ><q-item-section>{{ item.label }}</q-item-section
            ><q-item-section side><q-icon name="chevron_right" /></q-item-section></q-item
        ></q-list> </q-card
    ></q-dialog>
    <q-dialog v-model="detailOpen" position="bottom"
      ><q-card class="ios-dialog">
        <h2>{{ selected ? recordTitle(selected) : 'Record' }}</h2>
        <LeaseLifecyclePanel v-if="selected?.type === 'leases'" :lease="selected" can-manage @updated="updateLeaseDetail" @renewed="updateLeaseDetail" />
        <q-btn v-if="selected?.type === 'leases'" outline no-caps label="Inventory List" @click="goToLease(selected)" />
        <DepositWorkspace v-if="selected?.type === 'leases'" :property-id="leasePropertyId(selected)" :lease-id="selected.deposit_source_lease_id || selected.id" :lease-status="selected.status" />
        <template v-if="selected"
          ><p v-for="field in detailFields" :key="field.label">
            <span class="text-grey-7">{{ field.label }}</span
            ><br />{{ field.value }}
          </p>
          <q-btn
            v-if="attachmentUrl"
            flat
            no-caps
            label="Open file"
            :href="attachmentUrl"
            target="_blank"
            rel="noopener noreferrer"
          />
          <a
            v-if="receiptUrl"
            :href="receiptUrl"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              class="ios-receipt"
              :src="receiptUrl"
              alt="Transaction receipt or photo"
              loading="lazy"
            />
          </a>
        </template>
        <q-btn flat no-caps label="Close" v-close-popup /> </q-card
    ></q-dialog>
    <q-dialog v-model="deletionOpen" persistent
      ><q-card class="ios-dialog"
        ><h2>Request account deletion?</h2>
        <p>
          Your request will be reviewed. Shared property, lease and transaction records will not be
          deleted immediately.
        </p>
        <q-input v-model="deletionReason" outlined label="Note (optional)" maxlength="1000" />
        <p v-if="deletionError" role="alert" class="text-negative">{{ deletionError }}</p>
        <q-card-actions align="right"
          ><q-btn flat no-caps label="Cancel" :disable="deleting" v-close-popup /><q-btn
            no-caps
            unelevated
            color="negative"
            label="Submit request"
            :loading="deleting"
            @click="requestDeletion" /></q-card-actions></q-card
    ></q-dialog>
  </q-page>
</template>
<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { signOut } from 'firebase/auth'
import { Notify } from 'quasar'
import { auth } from 'src/boot/firebase'
import { useUserDataStore } from 'src/stores/userDataStore'
import { useFirebase } from 'src/composables/useFirebase'
import { mobileRequest } from 'src/services/mobileApi'
import WorkspaceHeader from 'src/components/mobile/WorkspaceHeader.vue'
import LeaseLifecyclePanel from 'src/components/LeaseLifecyclePanel.vue'
import DepositWorkspace from 'src/components/deposits/DepositWorkspace.vue'
import { propertyLeasingStatus, leasePropertyId } from '../../../backend/leaseLifecycle.js'
import {
  buildMobileAttention,
  mobileAttachmentUrl,
  mobileTaskLocation,
  recordPropertyId,
  safeMobileReturnTo,
} from 'src/utils/mobileHome'
const props = defineProps({ mode: { type: String, default: 'home' } })
const store = useUserDataStore(),
  route = useRoute(),
  router = useRouter(),
  firebase = useFirebase()
const mode = computed(() => props.mode),
  title = computed(
    () =>
      ({ home: 'Home', property: 'Property', manage: 'Manage', account: 'Account' })[mode.value],
  )
const loading = ref(false),
  error = ref(''),
  tasks = ref([]),
  reminders = ref([]),
  otherRecords = ref([])
function queryModel(key, fallback = '') {
  return computed({
    get: () => (typeof route.query[key] === 'string' ? route.query[key] : fallback),
    set: (value) =>
      router.replace({ query: { ...route.query, [key]: value || undefined, scroll: undefined } }),
  })
}
const search = queryModel('search'),
  selectedProperty = queryModel('property'),
  recordType = queryModel('type', 'tasks'),
  recordFilter = queryModel('filter', 'all')
const recordTypes = [
  'tasks',
  'reminders',
  'transactions',
  'documents',
  'leases',
  'assets',
  'services',
].map((value) => ({ label: value[0].toUpperCase() + value.slice(1), value }))
const properties = computed(() => store.userAccessibleProperties || [])
const propertyOptions = computed(() => [
  { label: 'All properties', value: '' },
  ...properties.value.map((row) => ({
    label: row.nickname || row.address || row.id,
    value: row.id,
  })),
])
const filteredProperties = computed(() =>
  properties.value.filter((row) =>
    `${row.nickname} ${row.address}`.toLowerCase().includes((search.value || '').toLowerCase()),
  ),
)
const now = ref(new Date())
const attention = computed(() =>
  buildMobileAttention({
    tasks: tasks.value,
    reminders: reminders.value,
    properties: properties.value,
    property: selectedProperty.value,
    now: now.value,
  }),
)
const propertyId = (value) => (typeof value === 'object' ? value?.id : value)
const propertyName = (id) => {
  const p = properties.value.find((row) => row.id === propertyId(id))
  return p?.nickname || p?.address || ''
}
const recordTitle = (row) =>
  row.task_title ||
  row.name ||
  row.title ||
  row.note ||
  row.item ||
  row.LSID ||
  row.description ||
  row.transac_type ||
  'Record'
const sourceRecords = computed(() =>
  recordType.value === 'tasks'
    ? tasks.value
    : recordType.value === 'reminders'
      ? reminders.value
      : recordType.value === 'leases'
        ? store.userAccessibleLeases || []
        : otherRecords.value,
)
const filteredRecords = computed(() =>
  (recordFilter.value === 'attention'
    ? attention.value
    : sourceRecords.value.map((item) => ({ ...item, type: recordType.value }))
  ).filter(
    (item) =>
      properties.value.some((property) => property.id === recordPropertyId(item)) &&
      (!selectedProperty.value || recordPropertyId(item) === selectedProperty.value) &&
      recordTitle(item)
        .toLowerCase()
        .includes((search.value || '').toLowerCase()),
  ),
)
let generation = 0
let restoreScroll = true
async function readRecords(collection) {
  return (
    await Promise.all(
      properties.value.map(async (property) =>
        (await firebase.getAllDocuments(`properties/${property.id}/${collection}`)).map((row) => ({
          ...row,
          property_id: property.id,
        })),
      ),
    )
  ).flat()
}
async function load() {
  const run = ++generation
  loading.value = true
  error.value = ''
  try {
    await store.loadUserRoles()
    if (run !== generation) return
    await store.loadProperties()
    if (mode.value === 'property') await store.loadLeases()
    if (run !== generation) return
    if (mode.value === 'home' || mode.value === 'manage') {
      const [taskRows, reminderRows] = await Promise.all([
        readRecords('mxrecords'),
        readRecords('reminders'),
      ])
      if (run !== generation) return
      tasks.value = taskRows
      reminders.value = reminderRows
      now.value = new Date()
      if (recordType.value === 'leases') await store.loadLeases()
      if (['transactions', 'documents', 'assets', 'services'].includes(recordType.value)) {
        const records = await readRecords(recordType.value)
        if (run === generation) otherRecords.value = records
      }
    }
    if (mode.value === 'account') await loadQuota()
  } catch (err) {
    if (run === generation) {
      error.value = err.message || 'Unable to load records.'
      if (/permission|unauthorized|forbidden/i.test(`${err.code} ${err.message}`)) {
        tasks.value = []
        reminders.value = []
        otherRecords.value = []
        detailOpen.value = false
      }
    }
  } finally {
    if (run === generation) {
      loading.value = false
      if (restoreScroll) {
        restoreScroll = false
        await nextTick()
        requestAnimationFrame(() =>
          window.scrollTo(0, Math.min(1000000, Math.max(0, Number(route.query.scroll) || 0))),
        )
      }
    }
  }
}
const leaseOpen = ref(false),
  leaseLoading = ref(''),
  leases = ref([])
async function openInventory(property) {
  leaseLoading.value = property.id
  error.value = ''
  try {
    const payload = await mobileRequest(`/properties/${encodeURIComponent(property.id)}/leases`)
    leases.value = payload.leases || []
    const active = leases.value.filter((lease) =>
      ['rented', 'active', 'current', 'occupied'].includes(String(lease.status).toLowerCase()),
    )
    if (active.length === 1) goToLease(active[0])
    else leaseOpen.value = true
  } catch (err) {
    error.value = err.message
  } finally {
    leaseLoading.value = ''
  }
}
function goToLease(lease) {
  leaseOpen.value = false
  detailOpen.value = false
  router.push(`/mobile/pm/property/lease/${encodeURIComponent(lease.inventory_source_lease_id || lease.id)}/inventory`)
}
async function updateLeaseDetail(lease) {
  selected.value = { ...lease, type: 'leases' }
  await store.loadLeases()
}
function currentReturnTo() {
  return safeMobileReturnTo(
    router.resolve({
      path: route.path,
      query: {
        ...route.query,
        scroll: String(Math.round(window.scrollY)),
      },
    }).fullPath,
  )
}
function showAttention() {
  router.push({
    path: '/mobile/pm/manage',
    query: {
      property: selectedProperty.value || undefined,
      filter: 'attention',
      returnTo: currentReturnTo(),
    },
  })
}
function showAllTasks() {
  router.push({
    path: '/mobile/pm/manage',
    query: {
      property: selectedProperty.value || undefined,
      type: 'tasks',
      returnTo: currentReturnTo(),
    },
  })
}
function showPropertyRecords(property) {
  router.push({ path: '/mobile/pm/manage', query: { property, returnTo: currentReturnTo() } })
}
const createOpen = ref(false)
const createTypes = [
  { label: 'Inventory check', icon: 'fact_check', path: '/mobile/pm/property' },
  { label: 'Task', icon: 'task_alt', path: '/create-mxrecord' },
  { label: 'Transaction', icon: 'payments', path: '/create-transaction' },
  { label: 'Reminder', icon: 'event', path: '/reminders' },
  { label: 'Document', icon: 'attach_file', path: '/documents' },
]
function openCreate(item) {
  createOpen.value = false
  router.push({
    path: item.path.startsWith('/mobile/') ? item.path : '/mobile/pm/create',
    query: {
      kind: item.label.toLowerCase(),
      property: selectedProperty.value || undefined,
      returnTo: currentReturnTo(),
    },
  })
}
const selected = ref(null),
  detailOpen = ref(false)
function selectRecord(item) {
  if (!properties.value.some((property) => property.id === recordPropertyId(item))) return
  if (item.type === 'tasks') {
    const location = mobileTaskLocation(item, currentReturnTo())
    if (location) router.push(location)
    return
  }
  selected.value = item
  detailOpen.value = true
}
const detailFields = computed(() =>
  selected.value
    ? [
        { label: 'Property', value: propertyName(selected.value.property_id) },
        ...[
          'description',
          'status',
          'amount',
          'transac_date',
          'report_date',
          'due_date',
          'category',
        ].map((key) => ({ label: key.replaceAll('_', ' '), value: selected.value[key] })),
      ].filter((row) => row.value !== undefined && row.value !== '')
    : [],
)
const attachmentUrl = computed(() => mobileAttachmentUrl(selected.value))
const receiptUrl = computed(() => mobileAttachmentUrl({ picture_url: selected.value?.picture_url }))
const recordStatus = (item) =>
  typeof item.status === 'boolean'
    ? item.status
      ? 'Active'
      : 'Inactive'
    : item.status || item.transac_date || ''
const quota = ref(null),
  quotaError = ref(''),
  quotaLoading = ref(false)
async function loadQuota() {
  quotaLoading.value = true
  quotaError.value = ''
  try {
    const [summary, usage, credits] = await Promise.all([
      mobileRequest('/billing/profile-summary'),
      mobileRequest('/billing/usage'),
      mobileRequest('/billing/credits'),
    ])
    quota.value = { summary, usage, credits }
  } catch (err) {
    quotaError.value = err.message
    quota.value = null
  } finally {
    quotaLoading.value = false
  }
}
const display = (value) =>
  value === undefined || value === null ? 'Unavailable' : Number(value).toLocaleString()
const quotaRows = computed(() =>
  quota.value
    ? [
        {
          label: 'AI tokens',
          value: `${display(quota.value.usage.ai_tokens_used)} / ${display(quota.value.usage.ai_tokens_limit)}`,
        },
        {
          label: 'Storage (MB)',
          value: `${display(quota.value.usage.storage_used_mb)} / ${display(quota.value.usage.storage_limit_mb)}`,
        },
        {
          label: 'Credits',
          value: display(quota.value.credits.balance ?? quota.value.credits.credits_balance),
        },
      ]
    : [],
)
const supportLinks = [
  { label: 'Contact Support', url: 'https://tobbythebutler.web.app/contact-support' },
  { label: 'Report Abuse', url: 'https://tobbythebutler.web.app/contact-support' },
  { label: 'Privacy Policy', url: 'https://tobbythebutler.web.app/privacy' },
]
const deletionOpen = ref(false),
  deletionReason = ref(''),
  deleting = ref(false),
  deletionError = ref('')
async function requestDeletion() {
  deleting.value = true
  deletionError.value = ''
  try {
    await mobileRequest('/account-deletion-requests', {
      method: 'POST',
      body: {
        email: store.user?.email || '',
        account_type: store.accountType || 'pm',
        source: 'capacitor_profile',
        reason: deletionReason.value,
      },
    })
    deletionOpen.value = false
    Notify.create({ message: 'Request submitted' })
  } catch (err) {
    deletionError.value = err.message
  } finally {
    deleting.value = false
  }
}
async function logout() {
  await signOut(auth)
  await router.replace('/mobile/login')
}
watch(
  () => [props.mode, recordType.value],
  () => {
    otherRecords.value = []
    load()
  },
  { immediate: true },
)
watch(properties, () => {
  if (
    selected.value &&
    !properties.value.some((property) => property.id === recordPropertyId(selected.value))
  ) {
    detailOpen.value = false
    selected.value = null
  }
})
let clockTimer
let refreshTimer
let refreshPending = false
let disposed = false
function scheduleRefresh() {
  if (disposed || document.visibilityState === 'hidden') return
  clearTimeout(refreshTimer)
  refreshTimer = setTimeout(() => {
    if (loading.value) {
      refreshPending = true
      return
    }
    void load()
  }, 150)
}
watch(loading, (isLoading) => {
  if (!isLoading && refreshPending) {
    refreshPending = false
    scheduleRefresh()
  }
})
onMounted(() => {
  document.addEventListener('visibilitychange', scheduleRefresh)
  window.addEventListener('focus', scheduleRefresh)
  window.addEventListener('online', scheduleRefresh)
  clockTimer = setInterval(() => {
    now.value = new Date()
  }, 60000)
})
onUnmounted(() => {
  disposed = true
  generation++
  clearTimeout(refreshTimer)
  document.removeEventListener('visibilitychange', scheduleRefresh)
  window.removeEventListener('focus', scheduleRefresh)
  window.removeEventListener('online', scheduleRefresh)
  clearInterval(clockTimer)
})
</script>
