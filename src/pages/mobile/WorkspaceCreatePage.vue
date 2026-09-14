<template>
  <q-page>
    <WorkspaceHeader :title="saved ? 'Record saved' : `New ${kind}`" back @back="returnToContext" />
    <template v-if="saved">
      <p class="ios-muted">{{ selectedProperty?.nickname || selectedProperty?.address }}</p>
      <div v-for="row in savedFields" :key="row.label" class="ios-row">
        <span class="ios-row-body">{{ row.label }}</span
        ><span>{{ row.value }}</span>
      </div>
      <section v-if="savedPhoto" class="q-mt-lg" aria-label="Saved attachment">
        <h2 class="text-subtitle1">Receipt / Photo</h2>
        <a
          :href="savedPhoto"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="View saved photo"
        >
          <img :src="savedPhoto" alt="Saved record attachment" class="saved-photo" />
          <span>View photo</span>
        </a>
      </section>
      <q-btn class="ios-primary q-mt-lg" no-caps unelevated label="Done" @click="returnToContext" />
    </template>
    <template v-else>
      <q-select
        v-model="propertyId"
        :options="properties"
        emit-value
        map-options
        outlined
        label="Property"
        :disable="formBusy"
        class="q-mb-lg"
      />
      <div v-if="propertyId" class="ios-shared-form">
        <component
          :is="formComponent"
          :key="kind === 'transaction' ? kind : `${kind}-${propertyId}`"
          :property-id="propertyId"
          :property-name="selectedProperty?.nickname || selectedProperty?.address || ''"
          :allow-property-edit="false"
          :allow-lease-source="false"
          @transaction-created="complete"
          @mxrecord-created="complete"
          @reminder-saved="complete"
          @document-created="complete"
          @busy-change="formBusy = $event"
          @draft-change="hasDraft = $event"
          @cancel="returnToContext"
        />
      </div>
    </template>
    <q-dialog v-model="discardDialog" persistent>
      <q-card>
        <q-card-section>
          <h2 class="text-h6 q-my-none">Discard this draft?</h2>
          <p>Your unsaved changes and selected photo will be lost.</p>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat no-caps label="Keep editing" @click="answerDiscard(false)" />
          <q-btn flat no-caps label="Discard draft" @click="answerDiscard(true)" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>
<script setup>
import { computed, defineAsyncComponent, onMounted, ref } from 'vue'
import { onBeforeRouteLeave, useRoute, useRouter } from 'vue-router'
import { useUserDataStore } from 'src/stores/userDataStore'
import { useFirebase } from 'src/composables/useFirebase'
import WorkspaceHeader from 'src/components/mobile/WorkspaceHeader.vue'
import { mobileAttachmentUrl, safeMobileReturnTo } from 'src/utils/mobileHome'
const route = useRoute(),
  router = useRouter(),
  store = useUserDataStore(),
  firebase = useFirebase()
const forms = {
  task: defineAsyncComponent(() => import('src/components/CreateMxRecord.vue')),
  transaction: defineAsyncComponent(() => import('src/components/CreateTransaction.vue')),
  reminder: defineAsyncComponent(() => import('src/components/CreateReminder.vue')),
  document: defineAsyncComponent(() => import('src/components/CreateDocument.vue')),
}
const kind = computed(() => (Object.hasOwn(forms, route.query.kind) ? route.query.kind : 'task')),
  formComponent = computed(() => forms[kind.value])
const propertyId = ref(String(route.query.property || '')),
  saved = ref(null)
const formBusy = ref(false),
  hasDraft = ref(false),
  discardDialog = ref(false)
let discardAnswer
function answerDiscard(leave) {
  discardDialog.value = false
  if (leave) hasDraft.value = false
  discardAnswer?.(leave)
  discardAnswer = null
}
onBeforeRouteLeave(() => {
  if (formBusy.value) return false
  if (saved.value || !hasDraft.value) return true
  discardDialog.value = true
  return new Promise((resolve) => {
    discardAnswer = resolve
  })
})
function returnToContext() {
  if (formBusy.value) return
  const target = safeMobileReturnTo(route.query.returnTo, '')
  const previous = router.options?.history?.state?.back
  const safePrevious = safeMobileReturnTo(previous, '')
  if (safePrevious && (!target || target === safePrevious)) return router.back()
  if (target) return router.push(target)
  return router.push({
    path: '/mobile/pm/manage',
    query: propertyId.value ? { property: propertyId.value } : {},
  })
}
const savedPhoto = computed(() => mobileAttachmentUrl(saved.value))
const selectedProperty = computed(() =>
  store.userAccessibleProperties.find((row) => row.id === propertyId.value),
)
const properties = computed(() =>
  store.userAccessibleProperties.map((row) => ({
    label: row.nickname || row.address || row.id,
    value: row.id,
  })),
)
const savedFields = computed(() =>
  Object.entries(saved.value || {})
    .filter(
      ([key, value]) =>
        [
          'id',
          'task_title',
          'title',
          'name',
          'amount',
          'transac_date',
          'transac_type',
          'note',
          'description',
          'status',
          'due_date',
          'report_date',
        ].includes(key) &&
        value !== '' &&
        value !== null &&
        typeof value !== 'object',
    )
    .map(([label, value]) => ({ label: label.replaceAll('_', ' '), value })),
)
async function complete(record) {
  saved.value = { ...record }
  hasDraft.value = false
  const savedPropertyId = record.property_id || propertyId.value
  const collection = {
    task: 'mxrecords',
    transaction: 'transactions',
    reminder: 'reminders',
    document: 'documents',
  }[kind.value]
  // Read the saved record back; shared forms may reset their reactive payload after emitting.
  try {
    const refreshed = await firebase.getDocument(
      `properties/${savedPropertyId}/${collection}/${record.id}`,
    )
    saved.value = { ...record, ...refreshed }
  } catch {
    /* The creation itself succeeded; retain its returned receipt. */
  }
}
onMounted(() => store.loadProperties())
</script>
<style scoped>
.saved-photo {
  display: block;
  width: 100%;
  max-width: 480px;
  max-height: 320px;
  object-fit: contain;
  margin-bottom: 12px;
}
:deep(.q-card-actions .q-btn) {
  min-height: 48px;
}
</style>
