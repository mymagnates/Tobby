<template>
  <q-page class="q-pa-sm">
    <q-card flat bordered>
      <q-card-section class="row items-center justify-between">
        <div class="text-subtitle1 text-weight-medium">Payment Method</div>
        <q-btn flat dense icon="arrow_back" label="Back" @click="goBack" />
      </q-card-section>
      <q-separator />
      <q-card-section>
        <q-banner dense rounded class="bg-blue-1 text-primary">
          Payment method management will be enabled in a later phase.
        </q-banner>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goBack = () => {
  router.push('/sp-credits')
}
</script>
