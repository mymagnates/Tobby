<template>
  <q-page class="q-pa-md">
    <div class="row justify-end q-mb-md">
      <q-btn color="primary" flat icon="refresh" label="Refresh" @click="loadCards" />
    </div>

    <q-banner class="bg-blue-1 text-blue-10 q-mb-md" rounded>
      Owner-scoped snapshot biz cards. Updating live SP profile will not override your private notes.
    </q-banner>

    <div v-if="loading" class="text-center q-pa-lg">
      <q-spinner-dots size="40px" color="primary" />
    </div>

    <div v-else-if="cards.length === 0" class="text-center q-pa-lg">
      <q-icon name="badge" size="64px" color="grey-5" />
      <div class="q-mt-sm text-grey-7">No saved biz cards yet.</div>
    </div>

    <div v-else class="row q-col-gutter-md">
      <div v-for="card in cards" :key="card.id" class="col-12 col-md-6 col-lg-4">
        <q-card bordered flat>
          <q-card-section>
            <div class="text-subtitle1 text-weight-bold">{{ card.display_name || card.sp_name }}</div>
            <div class="text-caption text-grey-7">{{ card.service_area || 'N/A' }}</div>
            <div class="q-mt-xs">
              <q-chip size="sm" color="primary" text-color="white">
                {{ card.provider_type || 'provider' }}
              </q-chip>
              <q-chip size="sm" color="teal" text-color="white">
                Rating: {{ card.rating_avg || card.rating || 'N/A' }}
              </q-chip>
            </div>
          </q-card-section>

          <q-separator />

          <q-card-section>
            <q-input
              v-model="notes[card.id]"
              type="textarea"
              outlined
              dense
              label="Private Note"
              rows="3"
            />
          </q-card-section>

          <q-card-actions align="right">
            <q-btn flat color="primary" label="Save Note" @click="saveNote(card)" />
          </q-card-actions>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { Notify } from 'quasar'
import { useUserDataStore } from '../stores/userDataStore'
import { spCardsApi } from '../services/webApiClient'

const userDataStore = useUserDataStore()
const loading = ref(false)
const cards = ref([])
const notes = ref({})

const loadCards = async () => {
  loading.value = true
  try {
    const ownerId = userDataStore.userId
    cards.value = await spCardsApi.list(ownerId)
    notes.value = cards.value.reduce((acc, card) => {
      acc[card.id] = card.owner_note || ''
      return acc
    }, {})
  } catch (error) {
    Notify.create({
      type: 'negative',
      message: error.message || 'Failed to load biz cards.',
      position: 'top',
    })
  } finally {
    loading.value = false
  }
}

const saveNote = async (card) => {
  try {
    await spCardsApi.updateNote(card.id, notes.value[card.id] || '')
    Notify.create({
      type: 'positive',
      message: 'Biz card note saved.',
      position: 'top',
    })
  } catch (error) {
    Notify.create({
      type: 'negative',
      message: error.message || 'Unable to save note.',
      position: 'top',
    })
  }
}

onMounted(() => {
  loadCards()
})
</script>
