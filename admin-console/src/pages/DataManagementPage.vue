<template>
  <section>
    <div class="panel filter-row">
      <select v-model="state.collection">
        <option value="">Select collection</option>
        <option v-for="name in collections" :key="name" :value="name">{{ name }}</option>
      </select>
      <input v-model="state.docId" placeholder="doc_id (optional)" />
      <input v-model.number="state.limit" type="number" min="1" max="200" placeholder="limit" />
      <button class="primary" @click="loadRecords">Load Records</button>
      <button @click="loadChanges">Load Changes</button>
    </div>

    <div class="row">
      <div class="col panel table-wrap">
        <h3>Records</h3>
        <table>
          <thead>
            <tr>
              <th>id</th>
              <th>data</th>
              <th>action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in records" :key="row.id">
              <td>{{ row.id }}</td>
              <td><pre style="white-space: pre-wrap">{{ formatJson(row) }}</pre></td>
              <td>
                <button @click="useRecord(row)">Edit</button>
                <button class="danger" @click="prepareDelete(row)">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="col panel">
        <h3>Edit / Delete</h3>
        <div style="display: grid; gap: 8px">
          <input v-model="editor.docId" placeholder="doc_id" />
          <textarea v-model="editor.patchText" rows="10" placeholder='{"field":"value"}'></textarea>
          <input v-model="editor.reason" placeholder="reason (required)" />
          <div class="filter-row">
            <button class="primary" @click="updateRecord">Update</button>
            <button class="danger" @click="deleteRecord">Delete</button>
          </div>
        </div>
      </div>
    </div>

    <div class="panel table-wrap" style="margin-top: 12px">
      <h3>Change Logs (Rollback)</h3>
      <table>
        <thead>
          <tr>
            <th>change_id</th>
            <th>collection</th>
            <th>doc_id</th>
            <th>action</th>
            <th>reason</th>
            <th>actor</th>
            <th>created_at</th>
            <th>rollback</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in changes" :key="row.id">
            <td>{{ row.id }}</td>
            <td>{{ row.collection }}</td>
            <td>{{ row.doc_id }}</td>
            <td>{{ row.action }}</td>
            <td>{{ row.reason }}</td>
            <td>{{ row.actor_id }}</td>
            <td>{{ row.created_at }}</td>
            <td>
              <button @click="rollback(row)">Rollback</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <p v-if="state.message" style="margin-top: 8px">{{ state.message }}</p>
  </section>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { adminApi } from '../services/adminApi'

const collections = ref([])
const records = ref([])
const changes = ref([])

const state = reactive({
  collection: '',
  docId: '',
  limit: 50,
  message: '',
})

const editor = reactive({
  docId: '',
  patchText: '{\n\n}',
  reason: '',
})

const formatJson = (row) => JSON.stringify(row, null, 2)

const loadCollections = async () => {
  const res = await adminApi.listDataCollections()
  collections.value = res.items || []
}

const ensureCollection = () => {
  if (!state.collection) throw new Error('Please select a collection')
}

const loadRecords = async () => {
  try {
    ensureCollection()
    const res = await adminApi.listDataRecords({
      collection: state.collection,
      doc_id: state.docId,
      limit: state.limit,
    })
    records.value = res.items || []
    state.message = `Loaded ${records.value.length} records.`
  } catch (err) {
    state.message = err.message || 'Failed to load records.'
  }
}

const loadChanges = async () => {
  try {
    ensureCollection()
    const res = await adminApi.listDataChanges({
      collection: state.collection,
      doc_id: state.docId,
      limit: 200,
    })
    changes.value = res.items || []
    state.message = `Loaded ${changes.value.length} change logs.`
  } catch (err) {
    state.message = err.message || 'Failed to load changes.'
  }
}

const useRecord = (row) => {
  editor.docId = row.id || ''
  const patch = { ...row }
  delete patch.id
  editor.patchText = JSON.stringify(patch, null, 2)
}

const prepareDelete = (row) => {
  editor.docId = row.id || ''
}

const updateRecord = async () => {
  try {
    ensureCollection()
    const patch = JSON.parse(editor.patchText || '{}')
    await adminApi.updateDataRecord({
      collection: state.collection,
      doc_id: editor.docId,
      patch,
      reason: editor.reason,
    })
    state.message = 'Record updated. Audit log saved.'
    await loadRecords()
    await loadChanges()
  } catch (err) {
    state.message = err.message || 'Update failed.'
  }
}

const deleteRecord = async () => {
  try {
    ensureCollection()
    await adminApi.deleteDataRecord({
      collection: state.collection,
      doc_id: editor.docId,
      reason: editor.reason,
    })
    state.message = 'Record deleted. Audit log saved.'
    await loadRecords()
    await loadChanges()
  } catch (err) {
    state.message = err.message || 'Delete failed.'
  }
}

const rollback = async (row) => {
  try {
    await adminApi.rollbackDataChange({
      change_id: row.id,
      reason: `rollback-from-ui:${row.id}`,
    })
    state.message = `Rollback completed for ${row.id}`
    await loadRecords()
    await loadChanges()
  } catch (err) {
    state.message = err.message || 'Rollback failed.'
  }
}

onMounted(async () => {
  await loadCollections()
})
</script>
