<template>
  <q-page class="q-pa-sm">
    <div class="search-container">
      <q-card class="q-mb-sm">
        <q-card-section class="q-pa-sm">
          <div class="text-h6 q-mb-sm">Universal Query</div>

          <q-tabs
            v-model="searchMode"
            align="left"
            active-color="primary"
            indicator-color="primary"
            dense
            class="q-mb-sm"
          >
            <q-tab name="structured" label="Structured" />
            <q-tab name="dialog" label="Dialog Search" />
          </q-tabs>

          <q-tab-panels v-model="searchMode" animated keep-alive>
            <q-tab-panel name="structured" class="q-pa-none">
              <div class="row q-col-gutter-sm">
                <div class="col-12 col-md-3">
                  <q-select
                    v-model="selectedType"
                    :options="typeOptions"
                    outlined
                    dense
                    label="Type"
                  />
                </div>
                <div class="col-12 col-md-7">
                  <q-input
                    v-model="queryText"
                    outlined
                    dense
                    label="Search text"
                    @keyup.enter="runStructuredSearch"
                  />
                </div>
                <div class="col-12 col-md-2">
                  <q-btn
                    color="primary"
                    unelevated
                    class="full-width"
                    label="Search"
                    @click="runStructuredSearch"
                  />
                </div>
              </div>
            </q-tab-panel>

            <q-tab-panel name="dialog" class="q-pa-none">
              <div class="row q-col-gutter-sm">
                <div class="col-12 col-md-10">
                  <q-input
                    v-model="dialogQuery"
                    outlined
                    dense
                    label="Ask what you want to find (example: open unpaid plumbing invoices this month)"
                    @keyup.enter="runDialogSearch"
                  />
                </div>
                <div class="col-12 col-md-2">
                  <q-btn
                    color="primary"
                    unelevated
                    class="full-width"
                    label="Run"
                    @click="runDialogSearch"
                  />
                </div>
              </div>
            </q-tab-panel>
          </q-tab-panels>
        </q-card-section>
      </q-card>

      <div class="row q-col-gutter-sm">
        <div class="col-12 col-lg-4">
          <q-card>
            <q-card-section class="q-pa-sm">
              <div class="text-subtitle1 q-mb-sm">Results</div>
              <q-banner v-if="!results.length" rounded class="bg-grey-2 text-grey-8 q-mb-sm">
                No results.
              </q-banner>
              <q-list separator>
                <q-item
                  v-for="item in results"
                  :key="item.id"
                  clickable
                  @click="selected = item"
                >
                  <q-item-section>
                    <q-item-label>{{ item.title }}</q-item-label>
                    <q-item-label caption>{{ item.type.toUpperCase() }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-lg-8">
          <q-card>
            <q-card-section class="q-pa-sm">
              <div class="text-subtitle1 q-mb-sm">Embedded Detail</div>
              <q-banner v-if="!selected" rounded class="bg-blue-1 text-primary">
                Select a result to view details in-place.
              </q-banner>
              <q-card v-else flat bordered>
                <q-card-section class="q-pa-sm">
                  <div class="text-h6">{{ selected.title }}</div>
                  <div class="text-caption text-grey-7 q-mb-sm">{{ selected.type.toUpperCase() }}</div>
                  <div>{{ selected.summary }}</div>
                </q-card-section>
              </q-card>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'

const typeOptions = ['task', 'lease', 'transaction', 'reminder', 'document', 'asset', 'sp']
const seedResults = []

const searchMode = ref('structured')
const selectedType = ref('task')
const queryText = ref('')
const dialogQuery = ref('')
const selected = ref(null)
const results = ref([])

const filterRows = ({ type, term }) => {
  const normalizedTerm = term.trim().toLowerCase()
  return seedResults.filter((row) => {
    const typeMatch = type ? row.type === type : true
    const textMatch = normalizedTerm
      ? `${row.title} ${row.summary}`.toLowerCase().includes(normalizedTerm)
      : true
    return typeMatch && textMatch
  })
}

const runStructuredSearch = () => {
  results.value = filterRows({ type: selectedType.value, term: queryText.value })
  selected.value = null
}

const runDialogSearch = () => {
  // Low-cost heuristic routing for natural language query.
  const text = dialogQuery.value.toLowerCase()

  let inferredType = ''
  if (text.includes('lease')) inferredType = 'lease'
  else if (text.includes('invoice') || text.includes('payment') || text.includes('transaction')) inferredType = 'transaction'
  else if (text.includes('document') || text.includes('file')) inferredType = 'document'
  else if (text.includes('vendor') || text.includes('sp') || text.includes('service')) inferredType = 'sp'
  else if (text.includes('task') || text.includes('repair')) inferredType = 'task'

  results.value = filterRows({ type: inferredType, term: dialogQuery.value })
  selected.value = null
}
</script>

<style scoped>
.search-container {
  max-width: 1400px;
  margin: 0 auto;
}
</style>
