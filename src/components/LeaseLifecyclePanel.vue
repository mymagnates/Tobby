<template>
  <section class="lease-lifecycle">
    <header><div><strong>{{ status }}</strong><p>{{ lease.lease_start_date || lease.start_date || 'Start date not set' }} – {{ lease.lease_end_date || 'End date not set' }}</p></div>
      <q-btn v-if="canManage && ['Active', 'Expired'].includes(status)" outline no-caps label="Renew lease" :disable="busy" @click="renewOpen = true" />
      <q-btn v-if="canManage && ['Active', 'Scheduled'].includes(status)" flat no-caps label="Terminate" :disable="busy" @click="terminate" />
    </header>
    <p v-if="lease.renews_lease_id">Renewal of {{ lease.renews_lease_id }}. Deposit and inventory continue from the original tenancy; prior payments and signatures remain unchanged.</p>
    <p v-if="error" role="alert">{{ error }}</p>
    <q-form v-if="canManage && status === 'Draft'" @submit="confirmLease">
      <div class="lease-lifecycle-fields">
        <q-input v-model="draft.start" type="date" outlined label="Start date" :rules="[v => !!v || 'Required']" />
        <q-input v-model="draft.end" type="date" outlined label="End date" :rules="[v => !!v && v >= draft.start || 'End date must follow start date']" />
        <q-input v-model.number="draft.rent" type="number" min="0" step="0.01" outlined label="Rent" :rules="[v => v !== '' && v !== null && Number(v) >= 0 || 'Enter rent']" />
      </div>
      <q-btn type="submit" unelevated color="primary" no-caps label="Confirm lease" :loading="busy" />
      <p>Confirmation activates the lease on its start date. Another confirmed lease cannot overlap these dates.</p>
    </q-form>
    <q-dialog v-model="renewOpen" persistent maximized><q-card class="renewal-dialog">
      <CreateLease :renewal-source="lease" :property-id="pid" :allow-property-edit="false" @cancel="renewOpen = false" @lease-created="renewed" />
    </q-card></q-dialog>
  </section>
</template>
<script setup>
import { computed, reactive, ref, watch } from 'vue'
import CreateLease from './CreateLease.vue'
import { leaseStatus, leasePropertyId } from '../../backend/leaseLifecycle.js'
import { updateLeaseRequest } from 'src/services/leaseApi'
const props = defineProps({ lease: { type: Object, required: true }, canManage: Boolean })
const emit = defineEmits(['updated', 'renewed'])
const status = computed(() => leaseStatus(props.lease))
const pid = computed(() => leasePropertyId(props.lease))
const busy = ref(false), error = ref(''), renewOpen = ref(false)
const draft = reactive({ start: '', end: '', rent: 0 })
watch(() => props.lease, lease => Object.assign(draft, { start: lease.lease_start_date || lease.start_date || '', end: lease.lease_end_date || '', rent: lease.rate_amount ?? 0 }), { immediate: true })
async function save(changes) {
  if (busy.value) return
  busy.value = true; error.value = ''
  try { emit('updated', await updateLeaseRequest({ leaseId: props.lease.id, changes })) }
  catch (err) { error.value = err.message }
  finally { busy.value = false }
}
function confirmLease() { return save({ status: 'Active', lease_start_date: draft.start, lease_end_date: draft.end, rate_amount: draft.rent }) }
function terminate() {
  if (window.confirm('Terminate this lease now? Its transactions and signed records will be preserved.')) save({ status: 'Terminated' })
}
function renewed(lease) { renewOpen.value = false; emit('renewed', lease) }
</script>
<style scoped>
.lease-lifecycle { padding: 16px; margin-bottom: 16px; border: 1px solid var(--brand-border, #dbe3dc); border-radius: 12px; }
.lease-lifecycle header { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; }
.lease-lifecycle header > div { flex: 1; min-width: 180px; }
.lease-lifecycle p { font-size: 14px; color: var(--brand-muted, #61736a); overflow-wrap: anywhere; }
.lease-lifecycle-fields { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; }
.renewal-dialog { overflow-y: auto; padding: 16px; background: var(--brand-canvas, #f7f8f4); }
:deep(.q-btn) { min-height: 44px; }
</style>
