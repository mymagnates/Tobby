<template>
  <div class="property-context-switcher">
    <q-btn
      ref="trigger"
      flat
      no-caps
      class="property-context-trigger"
      data-testid="property-switcher"
      :aria-label="`Switch property: ${selectedLabel}`"
      aria-haspopup="dialog"
      :aria-expanded="open ? 'true' : 'false'"
      aria-controls="workspace-property-options"
      @keydown.down.prevent="open = true"
    >
      <q-icon :name="modelValue ? 'home_work' : 'apps'" size="19px" aria-hidden="true" />
      <span class="property-context-trigger__name">{{ selectedLabel }}</span>
      <q-icon
        :name="open ? 'expand_less' : 'expand_more'"
        size="21px"
        class="property-context-trigger__chevron"
        data-testid="property-chevron"
        aria-hidden="true"
      />
      <q-popup-proxy
        v-model="open"
        :breakpoint="600"
        anchor="bottom left"
        self="top left"
        position="bottom"
        class="property-context-popup"
        @before-show="search = ''"
        @hide="restoreFocus"
      >
        <div
          id="workspace-property-options"
          ref="panel"
          class="property-context-panel"
          role="dialog"
          aria-label="Choose property"
          @keydown.down.prevent="moveFocus(1)"
          @keydown.up.prevent="moveFocus(-1)"
        >
          <div class="property-context-panel__header">
            <strong>Choose property</strong>
            <q-btn
              flat
              round
              dense
              icon="close"
              aria-label="Close property selector"
              @click="open = false"
            />
          </div>
          <q-input
            v-model="search"
            outlined
            dense
            autofocus
            clearable
            placeholder="Search name or address"
            aria-label="Search properties"
            class="property-context-search"
          >
            <template #prepend><q-icon name="search" size="19px" /></template>
          </q-input>
          <div class="property-context-options" aria-label="Property options" role="group">
            <button
              v-if="includeAll && !search"
              type="button"
              class="property-context-option"
              :class="{ 'is-selected': !modelValue }"
              :aria-pressed="!modelValue"
              @click="select(null)"
            >
              <q-icon name="apps" size="19px" />
              <span><strong>All properties</strong><small>Portfolio overview</small></span>
              <q-icon v-if="!modelValue" name="check" class="property-context-check" />
            </button>
            <template v-for="group in groups" :key="group.label">
              <div v-if="group.properties.length" class="property-context-group">
                {{ group.label }}
              </div>
              <button
                v-for="property in group.properties"
                :key="property.id"
                type="button"
                class="property-context-option"
                :class="{ 'is-selected': String(modelValue) === String(property.id) }"
                :aria-pressed="String(modelValue) === String(property.id)"
                @click="select(String(property.id))"
              >
                <q-icon name="home_work" size="19px" />
                <span>
                  <strong>{{ propertyName(property) }}</strong>
                  <small v-if="property.address && property.address !== propertyName(property)">{{
                    property.address
                  }}</small>
                </span>
                <q-icon
                  v-if="String(modelValue) === String(property.id)"
                  name="check"
                  class="property-context-check"
                />
              </button>
            </template>
            <div v-if="!filtered.length" class="property-context-empty" role="status">
              <strong>{{
                properties.length ? 'No matching properties' : 'No properties yet'
              }}</strong>
              <span>{{
                properties.length
                  ? 'Try a different name or address.'
                  : 'Properties you have access to will appear here.'
              }}</span>
            </div>
          </div>
          <div class="property-context-footer">
            <q-btn flat no-caps icon="home_work" label="Manage properties" @click="act('manage')" />
            <q-btn
              v-if="showCreate"
              flat
              no-caps
              icon="add"
              label="Add property"
              @click="act('create')"
            />
          </div>
        </div>
      </q-popup-proxy>
    </q-btn>
  </div>
</template>

<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import { filterProperties, propertyName } from '../utils/workspaceScope'

const props = defineProps({
  modelValue: { type: String, default: null },
  properties: { type: Array, default: () => [] },
  includeAll: { type: Boolean, default: true },
  showCreate: { type: Boolean, default: false },
  userId: { type: String, default: '' },
})
const emit = defineEmits(['update:modelValue', 'create', 'manage'])
const open = ref(false)
const search = ref('')
const recentIds = ref([])
const panel = ref(null)
const trigger = ref(null)
const storageKey = computed(() => `handout:recent-properties:${props.userId}`)
watch(
  () => props.userId,
  () => {
    open.value = false
    try {
      const saved = props.userId ? JSON.parse(sessionStorage.getItem(storageKey.value) || '[]') : []
      recentIds.value = Array.isArray(saved)
        ? saved.filter((id) => typeof id === 'string').slice(0, 3)
        : []
    } catch {
      recentIds.value = []
    }
  },
  { immediate: true },
)
const selectedLabel = computed(() => {
  if (!props.modelValue) return props.includeAll ? 'All properties' : 'Choose property'
  const property = props.properties.find((item) => String(item.id) === props.modelValue)
  return property ? propertyName(property) : 'Unavailable property'
})
const filtered = computed(() => filterProperties(props.properties, search.value))
const groups = computed(() => {
  if (search.value) return [{ label: 'Search results', properties: filtered.value }]
  const recent = recentIds.value
    .map((id) => props.properties.find((p) => String(p.id) === id))
    .filter(Boolean)
  return [
    { label: 'Recent', properties: recent },
    {
      label: recent.length ? 'Other properties' : 'Your properties',
      properties: props.properties.filter((p) => !recent.includes(p)),
    },
  ]
})
function select(id) {
  if (id) {
    recentIds.value = [id, ...recentIds.value.filter((value) => value !== id)].slice(0, 3)
    try {
      if (props.userId) sessionStorage.setItem(storageKey.value, JSON.stringify(recentIds.value))
    } catch {
      /* Selection still works if browser storage is disabled. */
    }
  }
  emit('update:modelValue', id)
  open.value = false
}
function act(event) {
  open.value = false
  emit(event)
}
function moveFocus(direction) {
  const items = [...(panel.value?.querySelectorAll('input, button:not([disabled])') || [])]
  const index = items.indexOf(document.activeElement)
  items[(index + direction + items.length) % items.length]?.focus()
}
async function restoreFocus() {
  await nextTick()
  trigger.value?.$el?.focus()
}
</script>

<style lang="scss">
.property-context-switcher {
  min-width: 0;
  width: clamp(180px, 25vw, 310px);
}
.property-context-trigger.q-btn {
  width: 100%;
  min-height: 44px;
  padding: 0 12px;
  border: 1px solid var(--workspace-border, #dfe5df);
  border-radius: 9px;
  background: var(--workspace-surface, #fff);
  color: var(--workspace-ink, #243830);
  box-shadow: none;
  .q-btn__content {
    flex-wrap: nowrap;
    gap: 9px;
    width: 100%;
  }
  &::before {
    box-shadow: none;
  }
  &:focus-visible {
    outline: 2px solid #14806d;
    outline-offset: 3px;
  }
}
.property-context-trigger__name {
  flex: 1;
  min-width: 0;
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
  font-weight: 600;
}
.property-context-trigger__chevron {
  flex: 0 0 21px;
  color: #527269;
}
.property-context-popup {
  border-radius: 14px;
}
.property-context-panel {
  width: 370px;
  max-width: calc(100vw - 24px);
  max-height: min(620px, 82dvh);
  display: flex;
  flex-direction: column;
  background: #fff;
  color: #243830;
  border: 1px solid #dfe5df;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 12px 36px #203e3020;
}
.property-context-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px 4px;
}
.property-context-search {
  margin: 8px 12px 12px;
}
.property-context-options {
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 0 8px 8px;
  min-height: 0;
  scrollbar-width: thin;
}
.property-context-group {
  padding: 16px 10px 7px;
  color: #68786f;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.07em;
}
.property-context-option {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  min-height: 52px;
  padding: 10px;
  text-align: left;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: inherit;
  cursor: pointer;
  font: inherit;
  > span {
    flex: 1;
    min-width: 0;
  }
  strong,
  small {
    display: block;
    overflow-wrap: anywhere;
  }
  strong {
    font-size: 13px;
    font-weight: 600;
  }
  small {
    margin-top: 3px;
    color: #65766d;
    font-size: 12px;
  }
  &:hover,
  &:focus-visible {
    background: #f2f5f1;
    outline: 2px solid #14806d;
    outline-offset: -2px;
  }
  &.is-selected {
    background: #e9f5ef;
    color: #116450;
  }
}
.property-context-check {
  flex: 0 0 20px;
}
.property-context-footer {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  padding: 8px;
  border-top: 1px solid #e5ebe5;
  .q-btn {
    min-height: 44px;
    font-size: 12px;
  }
}
.property-context-empty {
  padding: 24px 12px;
  strong,
  span {
    display: block;
  }
  span {
    margin-top: 8px;
    font-size: 12px;
    color: #65766d;
  }
}
body.body--dark {
  .property-context-panel {
    background: #202d28;
    color: #ecf3ed;
    border-color: #45564d;
  }
  .property-context-group,
  .property-context-option small {
    color: #afc3b7;
  }
  .property-context-option:hover,
  .property-context-option:focus-visible {
    background: #30453a;
  }
  .property-context-option.is-selected {
    background: #264c3d;
    color: #b7f2d8;
  }
}
@media (max-width: 599px) {
  .property-context-switcher {
    width: 100%;
  }
  .property-context-panel {
    width: 100vw;
    max-width: 100vw;
    border-radius: 18px 18px 0 0;
    padding-bottom: env(safe-area-inset-bottom, 0px);
  }
  .property-context-panel__header {
    padding-top: 16px;
  }
}
</style>
