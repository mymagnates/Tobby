<template>
  <section class="record-photo-picker" :aria-label="label" :aria-busy="busy">
    <div class="text-subtitle2">{{ label }} <span class="text-caption">(Optional)</span></div>
    <p class="text-caption q-my-xs">
      One image, up to 25 MB. Your record details are not changed.
    </p>
    <template v-if="preview">
      <img :src="preview" alt="Selected attachment preview" class="record-photo-preview" />
      <div class="record-photo-actions">
        <q-btn flat no-caps label="View photo" :disable="busy" @click="viewOpen = true" />
        <q-btn
          flat
          no-caps
          label="Replace photo"
          :disable="disabled || busy"
          @click="sourcesOpen = true"
        />
        <q-btn flat no-caps label="Remove photo" :disable="disabled || busy" @click="remove" />
      </div>
    </template>
    <q-btn
      v-else
      outline
      no-caps
      icon="add_a_photo"
      label="Add photo"
      :disable="disabled || busy"
      @click="sourcesOpen = true"
    />
    <div v-if="busy" role="status" class="q-mt-sm">Opening photo...</div>
    <div v-if="errorMessage" role="alert" class="text-negative q-mt-sm">{{ errorMessage }}</div>
    <input
      ref="fileInput"
      type="file"
      :accept="PHOTO_ACCEPT"
      hidden
      aria-label="Choose image file"
      @change="chooseFile"
    />
    <q-dialog v-model="sourcesOpen">
      <q-card class="record-photo-sheet">
        <q-card-section
          ><h2 class="text-h6 q-my-none">
            {{ preview ? 'Replace photo' : 'Add photo' }}
          </h2></q-card-section
        >
        <q-card-section class="record-photo-sources">
          <q-btn
            v-if="native"
            flat
            no-caps
            icon="photo_camera"
            label="Take photo"
            @click="chooseNative('camera')"
          />
          <q-btn
            v-if="native"
            flat
            no-caps
            icon="photo_library"
            label="Choose photo"
            @click="chooseNative('photos')"
          />
          <q-btn flat no-caps icon="image" label="Choose image file" @click="openFile" />
          <q-btn flat no-caps label="Cancel" v-close-popup />
        </q-card-section>
      </q-card>
    </q-dialog>
    <q-dialog v-model="viewOpen">
      <q-card class="record-photo-sheet">
        <q-card-section
          ><img :src="preview" alt="Selected attachment" class="record-photo-full"
        /></q-card-section>
        <q-card-actions align="right"
          ><q-btn flat no-caps label="Close photo" v-close-popup
        /></q-card-actions>
      </q-card>
    </q-dialog>
  </section>
</template>

<script setup>
import { onBeforeUnmount, ref, watch } from 'vue'
import { isNativeMobileRuntime } from 'src/utils/mobileRuntime'
import { PHOTO_ACCEPT, pickNativePhoto, validatePhotoFile } from 'src/services/recordPhoto'

const props = defineProps({
  modelValue: { type: Object, default: null },
  label: { type: String, default: 'Receipt / Photo' },
  disabled: Boolean,
})
const emit = defineEmits(['update:modelValue', 'busy', 'error'])
const native = isNativeMobileRuntime()
const fileInput = ref(null),
  sourcesOpen = ref(false),
  viewOpen = ref(false)
const preview = ref(''),
  busy = ref(false),
  errorMessage = ref('')
let mounted = true
watch(
  () => props.modelValue,
  (file) => {
    if (preview.value) URL.revokeObjectURL(preview.value)
    preview.value = file ? URL.createObjectURL(file) : ''
    errorMessage.value = ''
  },
  { immediate: true },
)
onBeforeUnmount(() => {
  mounted = false
  if (preview.value) URL.revokeObjectURL(preview.value)
})
function reportError(error) {
  errorMessage.value = error.message || 'Unable to open photo. Your draft is unchanged.'
  emit('error', errorMessage.value)
}
function openFile() {
  if (props.disabled || busy.value) return
  sourcesOpen.value = false
  fileInput.value.value = ''
  fileInput.value.click()
}
function chooseFile(event) {
  const file = event.target.files?.[0]
  if (!file || props.disabled || busy.value) return
  try {
    emit('update:modelValue', validatePhotoFile(file))
  } catch (error) {
    reportError(error)
  }
}
async function chooseNative(source) {
  if (props.disabled || busy.value) return
  sourcesOpen.value = false
  busy.value = true
  emit('busy', true)
  errorMessage.value = ''
  try {
    const file = await pickNativePhoto(source)
    if (mounted && file && !props.disabled) emit('update:modelValue', file)
  } catch (error) {
    if (mounted) reportError(error)
  } finally {
    busy.value = false
    if (mounted) emit('busy', false)
  }
}
function remove() {
  if (props.disabled || busy.value) return
  viewOpen.value = false
  emit('update:modelValue', null)
}
</script>

<style scoped>
.record-photo-picker {
  border: 1px solid var(--ios-separator, var(--neutral-300));
  border-radius: 12px;
  padding: 16px;
  margin-block: 16px;
}
.record-photo-preview {
  display: block;
  width: 100%;
  max-width: 300px;
  height: 180px;
  object-fit: contain;
  margin-top: 12px;
}
.record-photo-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.record-photo-picker :deep(.q-btn),
.record-photo-sheet :deep(.q-btn) {
  min-height: 48px;
}
.record-photo-sheet {
  width: 480px;
  max-width: calc(100vw - 32px);
  padding-bottom: env(safe-area-inset-bottom);
}
.record-photo-sources {
  display: grid;
  gap: 8px;
}
.record-photo-full {
  display: block;
  width: 100%;
  max-height: 70vh;
  object-fit: contain;
}
</style>
