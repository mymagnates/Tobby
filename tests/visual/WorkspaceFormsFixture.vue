<template>
  <q-layout view="hHh lpR fFf" class="web-workspace">
    <q-page-container>
      <component :is="selected" v-if="pageMode && !closed" @cancel="close" />
      <q-page v-else>
        <p v-if="closed" data-testid="fixture-closed">Form closed</p>
        <q-dialog v-model="open" maximized persistent :transition-duration="0">
          <q-card class="create-fullscreen-card">
            <q-card-section class="create-fullscreen-body">
              <component :is="selected" :auto-navigate="false" in-dialog @cancel="close" />
            </q-card-section>
          </q-card>
        </q-dialog>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import CreateProperty from '../../src/components/CreateProperty.vue'
import CreateMxRecord from '../../src/components/CreateMxRecord.vue'
import CreateTransaction from '../../src/components/CreateTransaction.vue'
import CreateLease from '../../src/components/CreateLease.vue'
import CreateAsset from '../../src/components/CreateAsset.vue'
import CreateDocument from '../../src/components/CreateDocument.vue'
import CreateReminder from '../../src/components/CreateReminder.vue'
import CreateService from '../../src/components/CreateService.vue'
import CreateTenantPage from '../../src/pages/CreateTenantPage.vue'
import EditPropertyPage from '../../src/pages/EditPropertyPage.vue'
import { useWebFormTheme } from '../../src/composables/useWebFormTheme'

const components = {
  property: CreateProperty,
  maintenance: CreateMxRecord,
  transaction: CreateTransaction,
  lease: CreateLease,
  asset: CreateAsset,
  document: CreateDocument,
  reminder: CreateReminder,
  service: CreateService,
  tenant: CreateTenantPage,
  'edit-property': EditPropertyPage,
}
const query = new URLSearchParams(window.location.search)
const name = query.get('form') || 'property'
if (!components[name]) throw new Error(`Unknown fixture form: ${name}`)
const selected = components[name]
const pageMode = ['tenant', 'edit-property'].includes(name)
const open = ref(true)
const closed = ref(false)
useWebFormTheme(query.get('theme') !== 'off')
function close() {
  open.value = false
  closed.value = true
}
</script>

<style scoped>
/* Minimal fullscreen host contract from AssetsPage. No form styling or overflow masking. */
.create-fullscreen-card {
  height: 100vh;
  display: flex;
  flex-direction: column;
}
.create-fullscreen-body {
  flex: 1;
  overflow-y: auto;
}
</style>
