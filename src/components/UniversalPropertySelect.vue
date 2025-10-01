<template>
  <q-select
    v-model="selectedPropertyId"
    :options="propertyOptions"
    :label="label"
    :outlined="outlined"
    :dense="dense"
    :clearable="clearable"
    :rules="rules"
    :loading="loading"
    :disable="disable"
    :error="error"
    :error-message="errorMessage"
    :hint="hint"
    :class="customClass"
    option-value="value"
    option-label="label"
    emit-value
    map-options
    @update:model-value="onPropertyChange"
  >
    <template v-if="showPropertyDetails" v-slot:option="scope">
      <q-item v-bind="scope.itemProps">
        <q-item-section>
          <q-item-label>{{ scope.opt.label }}</q-item-label>
          <q-item-label v-if="scope.opt.property?.address" caption>
            {{ scope.opt.property.address }}
          </q-item-label>
        </q-item-section>
      </q-item>
    </template>
  </q-select>
</template>

<script setup>
import { computed, watch } from 'vue'
import { useUserDataStore } from '../stores/userDataStore'

const userDataStore = useUserDataStore()

// Props
const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: null,
  },
  label: {
    type: String,
    default: 'Property',
  },
  outlined: {
    type: Boolean,
    default: true,
  },
  dense: {
    type: Boolean,
    default: true,
  },
  clearable: {
    type: Boolean,
    default: false,
  },
  rules: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  disable: {
    type: Boolean,
    default: false,
  },
  error: {
    type: Boolean,
    default: false,
  },
  errorMessage: {
    type: String,
    default: '',
  },
  hint: {
    type: String,
    default: '',
  },
  customClass: {
    type: String,
    default: '',
  },
  showPropertyDetails: {
    type: Boolean,
    default: false,
  },
  required: {
    type: Boolean,
    default: false,
  },
})

// Emits
const emit = defineEmits(['update:modelValue', 'property-change'])

// Computed
const propertyOptions = computed(() => {
  console.log('UniversalPropertySelect - Property options:', userDataStore.universalPropertyOptions)
  return userDataStore.universalPropertyOptions
})

const selectedPropertyId = computed({
  get: () => props.modelValue,
  set: (value) => {
    emit('update:modelValue', value)
  },
})

// Methods
const onPropertyChange = (propertyId) => {
  console.log('=== UniversalPropertySelect - Property Change ===')
  console.log('Property changed to:', propertyId, 'Type:', typeof propertyId)
  console.log(
    'Available properties:',
    userDataStore.userAccessibleProperties.map((p) => ({
      id: p.id,
      type: typeof p.id,
      nickname: p.nickname,
    })),
  )

  const property = userDataStore.getPropertyById(propertyId)
  console.log('Found property:', property)
  console.log('=== END UniversalPropertySelect - Property Change ===')

  emit('property-change', { propertyId, property })
}

// Watch for changes in user data
watch(
  () => userDataStore.userAccessibleProperties,
  (newProperties) => {
    console.log('UniversalPropertySelect - Properties updated:', newProperties.length)
  },
  { deep: true },
)

// Watch for authentication changes
watch(
  () => userDataStore.isAuthenticated,
  (isAuthenticated) => {
    console.log('UniversalPropertySelect - Authentication changed:', isAuthenticated)
    if (!isAuthenticated) {
      // Clear selection when user logs out
      emit('update:modelValue', null)
    }
  },
)
</script>

<style scoped>
/* Add any custom styles here */
</style>
