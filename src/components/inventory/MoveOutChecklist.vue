<template>
  <section class="move-out-checklist">
    <div class="move-out-toolbar">
      <div><strong>{{ checkedCount }} / {{ entries.length }} checked</strong><p>{{ differenceCount }} items with differences or no reference</p></div>
      <q-select :model-value="filter" @update:model-value="filter = $event" :options="filters" emit-value map-options outlined dense label="Show items" />
      <q-btn outline no-caps icon="add" label="Add item" :disable="busy || readonly" @click="$emit('add', 'Other')" />
      <q-btn flat no-caps icon="key" label="Add key / access" :disable="busy || readonly" @click="$emit('add-access')" />
      <q-btn flat no-caps label="Signatures" @click="$emit('signatures')" />
    </div>
    <p v-if="missingMoveIn" class="move-out-notice">No confirmed move-in baseline. This checklist records move-out condition only; later records are shown as references, not move-in evidence.</p>
    <p class="move-out-help">Choose the observed condition and enter actual counts for keys / access, then mark each item checked. Reference photos are never copied into move-out evidence.</p>
    <section v-for="group in groups" :key="group.area" class="move-out-room">
      <header><h2>{{ group.area }} <small>{{ group.items.filter(item => item.checked).length }}/{{ group.items.length }} checked</small></h2>
        <q-btn flat no-caps icon="add" :label="`Add to ${group.area}`" :disable="busy || readonly" @click="$emit('add', group.area)" /></header>
      <table>
        <thead><tr><th>Item</th><th>Move-in / reference</th><th>Move-out</th><th>Checked</th></tr></thead>
        <tbody>
          <tr v-for="entry in group.items" :key="entry.item_id" :data-item-id="entry.item_id">
            <td data-label="Item"><strong>{{ entry.name }}</strong>
              <small v-if="entry.added_at_move_out">Added at move-out · no move-in comparison</small>
              <small v-if="entry.replaces_item_id">Replaces: {{ entries.find(item => item.item_id === entry.replaces_item_id)?.name || 'Previously recorded item' }}</small>
              <q-btn flat no-caps size="sm" :label="readonly ? 'Details' : 'Notes / photos'" @click="$emit('edit', entry.item_id)" />
            </td>
            <td data-label="Move-in / reference">
              <span>{{ conditionLabel(entry.move_in?.condition || entry.reference?.condition) }}</span>
              <small v-if="entry.kind === 'access'">Count: {{ quantityLabel((entry.move_in || entry.reference)?.quantity) }}</small>
              <small>{{ entry.move_in ? 'Confirmed move-in' : entry.reference ? 'Later confirmed reference' : 'No reference available' }}</small>
              <details v-if="entry.reference || entry.move_in"><summary>Reference details</summary>
                <div v-if="entry.move_in"><strong>Move-in</strong><small v-if="entry.kind === 'access'">Count: {{ quantityLabel(entry.move_in.quantity) }}</small><p>{{ entry.move_in.note }}</p><button v-for="photo in entry.move_in.photos || []" :key="photo.path" type="button" class="photo-button" :aria-label="`View move-in photo of ${entry.name}`" @click="$emit('photo', photo.url)"><img :src="photo.url" alt="Move-in evidence" /></button></div>
                <div v-if="entry.reference && entry.reference.batch_id !== entry.move_in?.batch_id"><strong>Latest confirmed reference: {{ conditionLabel(entry.reference.condition) }}</strong><small v-if="entry.kind === 'access'">Count: {{ quantityLabel(entry.reference.quantity) }}</small><p>{{ entry.reference.note }}</p><button v-for="photo in entry.reference.photos || []" :key="photo.path" type="button" class="photo-button" :aria-label="`View reference photo of ${entry.name}`" @click="$emit('photo', photo.url)"><img :src="photo.url" alt="Reference evidence" /></button></div>
              </details>
            </td>
            <td data-label="Move-out">
              <q-select :model-value="entry.condition" :options="conditions" emit-value map-options outlined dense :aria-label="`Move-out condition for ${entry.name}`" :disable="busy || readonly" @update:model-value="$emit('condition', entry, $event)" />
              <label v-if="entry.kind === 'access'" class="quantity-field">Quantity returned
                <input type="number" min="0" max="999" step="1" :value="entry.quantity ?? ''" :aria-label="`Actual count for ${entry.name}`" :aria-invalid="!validQuantity(entry.quantity)" :disabled="busy || readonly" @change="$emit('quantity', entry, Number.isNaN($event.target.valueAsNumber) ? null : $event.target.valueAsNumber)" />
                <small v-if="!validQuantity(entry.quantity)">Enter a whole number from 0 to 999 to check.</small>
                <small v-else-if="entry.quantity !== (entry.move_in || entry.reference)?.quantity">Count differs: {{ quantityLabel((entry.move_in || entry.reference)?.quantity) }} → {{ entry.quantity }}</small>
              </label>
              <q-btn v-if="(entry.move_in || entry.reference) && !readonly" flat no-caps size="sm" label="Use reference condition" :disable="busy || (entry.move_in || entry.reference).condition === 'not_checked'" @click="$emit('reference', entry.item_id)" />
              <p v-if="entry.note">{{ entry.note }}</p>
              <button v-for="photo in entry.photos" :key="photo.path" class="photo-button" :aria-label="`View move-out photo of ${entry.name}`" @click="$emit('photo', photo.url)"><img :src="photo.url" alt="Move-out evidence" /></button>
            </td>
            <td data-label="Checked"><q-checkbox :model-value="entry.checked" :aria-label="`Checked ${entry.name}`" :disable="busy || readonly || entry.condition === 'not_checked' || (entry.kind === 'access' && !validQuantity(entry.quantity))" @update:model-value="$emit('review', entry.item_id, $event)" /></td>
          </tr>
        </tbody>
      </table>
    </section>
    <p v-if="!groups.length">{{ entries.length ? 'No items match this filter.' : 'Add the first item to this move-out checklist.' }}</p>
  </section>
</template>
<script setup>
import { computed, ref } from 'vue'
const props = defineProps({ entries: { type: Array, default: () => [] }, conditions: { type: Array, required: true }, busy: Boolean, readonly: Boolean, missingMoveIn: Boolean })
defineEmits(['add', 'add-access', 'edit', 'photo', 'condition', 'quantity', 'reference', 'review', 'signatures'])
const filter = ref('all')
const filters = [{ label: 'All items', value: 'all' }, { label: 'Unchecked', value: 'unchecked' }, { label: 'Differences / no reference', value: 'differences' }]
const validQuantity = value => Number.isInteger(value) && value >= 0 && value <= 999
const quantityLabel = value => value ?? 'Not recorded'
const differs = entry => {
  const baseline = entry.move_in || entry.reference
  return entry.condition !== 'not_checked' && (!baseline || entry.condition !== baseline.condition || !!entry.replaces_item_id || (entry.kind === 'access' && entry.quantity !== baseline.quantity))
}
const checkedCount = computed(() => props.entries.filter(entry => entry.checked).length)
const differenceCount = computed(() => props.entries.filter(differs).length)
const conditionLabel = value => props.conditions.find(option => option.value === value)?.label || 'No record'
const groups = computed(() => {
  const rooms = new Map()
  for (const entry of props.entries) {
    if (filter.value === 'unchecked' && entry.checked || filter.value === 'differences' && !differs(entry)) continue
    const area = entry.area || 'Other'
    if (!rooms.has(area)) rooms.set(area, [])
    rooms.get(area).push(entry)
  }
  return [...rooms].map(([area, items]) => ({ area, items }))
})
</script>
<style scoped>
.move-out-toolbar { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin: 12px 0; }
.move-out-toolbar > div:first-child { flex: 1 1 200px; }
.move-out-toolbar p, .move-out-help { margin: 4px 0; color: var(--brand-muted); font-size: 14px; }
.move-out-toolbar .q-field { min-width: 180px; }
.move-out-notice { padding: 12px; border-left: 3px solid var(--brand-primary); background: var(--brand-soft); }
.move-out-room { margin-top: 16px; border: 1px solid var(--brand-border); border-radius: 8px; overflow: hidden; }
.move-out-room header { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; padding: 4px 12px; background: var(--brand-soft); }
.move-out-room h2 { font-size: 16px; margin: 0; }
.move-out-room h2 small { margin-left: 8px; font-weight: normal; }
table { width: 100%; table-layout: fixed; border-collapse: collapse; background: var(--brand-surface); }
th, td { text-align: left; vertical-align: top; padding: 8px 10px; border-top: 1px solid var(--brand-border); overflow-wrap: anywhere; }
th { font-size: 13px; color: var(--brand-muted); }
th:last-child { width: 80px; }
td small { display: block; font-size: 12px; color: var(--brand-muted); margin-top: 4px; }
td p { white-space: pre-wrap; margin: 4px 0; }
td:first-child > strong { display: block; margin-bottom: 4px; }
summary { cursor: pointer; min-height: 44px; padding-top: 8px; font-size: 13px; }
img { width: 52px; height: 52px; object-fit: cover; margin: 4px; border-radius: 4px; }
.photo-button { border: 0; padding: 0; background: none; cursor: pointer; }
.photo-button:focus-visible { outline: 2px solid var(--brand-primary); outline-offset: 2px; border-radius: 4px; }
.quantity-field { display: block; margin-top: 8px; font-size: 13px; }
.quantity-field input { display: block; box-sizing: border-box; width: 100%; min-width: 0; min-height: 44px; margin-top: 4px; padding: 8px; border: 1px solid var(--brand-border); border-radius: 4px; background: var(--brand-surface); color: inherit; font: inherit; }
:deep(.q-btn) { min-height: 44px; }
@media (max-width: 700px) {
  table, tbody { display: block; }
  thead { display: none; }
  tr { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); border-top: 1px solid var(--brand-border); }
  td { display: block; border: 0; min-width: 0; }
  td:first-child, td:last-child { grid-column: 1 / -1; }
  td::before { content: attr(data-label); display: block; color: var(--brand-muted); font-size: 12px; margin-bottom: 4px; }
  td:first-child::before { display: none; }
  td:last-child { display: flex; align-items: center; }
}
</style>
