<template>
  <div class="create-document">
    <q-card class="elevated">
      <q-card-section class="q-pa-md composer-head">
        <div class="row items-start justify-between q-col-gutter-sm">
          <div>
            <div class="text-h6 text-primary q-mb-xs">
              <q-icon name="description" class="q-mr-sm" />
              Create Document
            </div>
            <div class="text-caption text-grey-7 q-mb-sm">
              Save property or lease documents with a clear source and purpose.
            </div>
            <div v-if="resolvedPropertyName" class="text-caption text-grey-7">
              Property: {{ resolvedPropertyName || 'Selected Property' }}
            </div>
            <div v-else class="section-label q-mb-xs">Document Context</div>
          </div>
          <div class="row items-center q-gutter-sm">
            <q-btn
              unelevated
              color="primary"
              text-color="white"
              label="Cancel"
              class="top-action-btn"
              @click="emit('cancel')"
            />
            <q-btn
              color="primary"
              text-color="white"
              unelevated
              label="Save"
              class="top-action-btn"
              :loading="creating"
              @click="onSubmit"
            />
          </div>
        </div>
      </q-card-section>

      <q-card-section class="q-pt-none q-gutter-sm">
        <div v-if="showSourceTypeSelect || showPropertySelect || showLeaseSelect" class="section-label q-mb-xs">
          Source Context
        </div>
        <q-select
          v-if="showSourceTypeSelect"
          v-model="sourceType"
          :options="sourceTypeOptions"
          option-label="label"
          option-value="value"
          emit-value
          map-options
          label="Source Type"
          outlined
          dense
          bg-color="grey-1"
        />

        <q-select
          v-if="showPropertySelect"
          v-model="selectedPropertyId"
          :options="propertyOptions"
          option-label="label"
          option-value="value"
          emit-value
          map-options
          label="Select Property"
          outlined
          dense
          :rules="[(val) => !!val || 'Property selection is required']"
          bg-color="grey-1"
        />

        <q-select
          v-if="showLeaseSelect"
          v-model="selectedLeaseId"
          :options="leaseOptions"
          option-label="label"
          option-value="value"
          emit-value
          map-options
          label="Select Lease"
          outlined
          dense
          :rules="[(val) => !!val || 'Lease selection is required']"
          bg-color="grey-1"
        />

        <div class="section-label q-mb-xs q-mt-sm">Document Details</div>
        <q-select
          v-model="form.purpose"
          :options="purposeOptions"
          outlined
          dense
          label="Purpose"
          clearable
          use-input
          fill-input
          hide-selected
          bg-color="grey-1"
        />

        <q-input
          v-model="form.name"
          outlined
          dense
          label="Document Name (optional)"
          bg-color="grey-1"
        />

        <q-input
          v-model="form.description"
          outlined
          dense
          type="textarea"
          autogrow
          label="Description (optional)"
          bg-color="grey-1"
        />

        <div class="picture-upload-section">
          <div class="text-subtitle2 q-mb-sm">
            <q-icon name="photo_camera" class="q-mr-xs" />
            Attach File (Optional until save)
          </div>

          <q-file
            v-model="form.file"
            outlined
            dense
            clearable
            label="Choose file or image"
            accept=".pdf,.png,.jpg,.jpeg,.webp,.gif,.doc,.docx,.xls,.xlsx,.txt"
            bg-color="grey-1"
            class="q-mb-sm"
          >
            <template v-slot:prepend>
              <q-icon name="attach_file" />
            </template>
          </q-file>

          <div v-if="imagePreview" class="image-preview q-mb-sm">
            <div class="text-caption q-mb-xs">Preview:</div>
            <div class="relative-position inline-block">
              <q-img
                :src="imagePreview"
                style="max-width: 300px; max-height: 200px"
                class="rounded-borders"
                fit="contain"
              />
              <q-btn
                flat
                dense
                round
                icon="close"
                color="negative"
                class="absolute-top-right q-ma-xs"
                @click="removeSelectedFile"
              />
            </div>
          </div>

          <div v-else-if="filePreviewName" class="file-preview-card q-mb-sm">
            <div class="row items-center justify-between q-col-gutter-sm">
              <div class="col row items-center no-wrap q-gutter-sm">
                <q-icon :name="filePreviewIcon" color="primary" size="28px" />
                <div class="column">
                  <div class="text-body2 text-weight-medium ellipsis">
                    {{ filePreviewName }}
                  </div>
                  <div class="text-caption text-grey-6">
                    {{ filePreviewTypeLabel }}
                  </div>
                </div>
              </div>
              <div class="col-auto">
                <q-btn
                  flat
                  dense
                  round
                  icon="close"
                  color="negative"
                  @click="removeSelectedFile"
                />
              </div>
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { Notify } from 'quasar'
import { useFirebase } from '../composables/useFirebase'
import { useUserDataStore } from '../stores/userDataStore'
import { normalizeRoleValue } from '../utils/roleUtils'

const props = defineProps({
  propertyId: {
    type: String,
    required: false,
  },
  propertyName: {
    type: String,
    default: '',
  },
  allowPropertyEdit: {
    type: Boolean,
    default: true,
  },
  allowLeaseSource: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['document-created', 'cancel'])

const userDataStore = useUserDataStore()
const { createDocument, uploadFile } = useFirebase()

const creating = ref(false)
const sourceType = ref('property')
const selectedPropertyId = ref('')
const selectedLeaseId = ref('')
const form = ref({
  purpose: '',
  name: '',
  description: '',
  file: null,
})
const imagePreview = ref('')

const purposeOptions = [
  'Lease Agreement',
  'Move-in Checklist',
  'Inventory',
  'Inspection Report',
  'Payment Proof',
  'Maintenance',
  'Invoice',
  'Insurance',
  'ID Verification',
  'Other',
]

const propertyOptions = computed(() => {
  return (userDataStore.userAccessibleProperties || []).map((property) => ({
    label: property.nickname || property.address || property.id,
    value: property.id,
  }))
})

const sourceTypeOptions = [
  { label: 'Property', value: 'property' },
  { label: 'Lease', value: 'lease' },
]

const fixedPropertyId = computed(() => String(props.propertyId || '').trim())

const hasMatchedFixedProperty = computed(() =>
  propertyOptions.value.some((option) => String(option.value || '').trim() === fixedPropertyId.value),
)

const showSourceTypeSelect = computed(
  () => props.allowLeaseSource && (!fixedPropertyId.value || props.allowPropertyEdit),
)

const showPropertySelect = computed(() => {
  if (sourceType.value !== 'property') return false
  return props.allowPropertyEdit || !hasMatchedFixedProperty.value
})

const leaseOptions = computed(() => {
  return (userDataStore.userAccessibleLeases || []).map((lease) => {
    const propertyId = lease.property?.id || lease.property_id?.id || lease.property_id || ''
    const propertyLabel = userDataStore.getPropertyName(propertyId)
    const leaseLabel = lease.LSID || lease.lease_lsid || lease.lease_id || lease.id
    return {
      label: `${leaseLabel} (${propertyLabel || 'Property'})`,
      value: lease.id,
      propertyId,
    }
  })
})

const showLeaseSelect = computed(() => sourceType.value === 'lease')

const resolvedPropertyId = computed(() => {
  if (sourceType.value === 'lease') {
    const selectedLease = leaseOptions.value.find(
      (option) => String(option.value || '').trim() === String(selectedLeaseId.value || '').trim(),
    )
    return String(selectedLease?.propertyId || '').trim()
  }
  if (!showPropertySelect.value && fixedPropertyId.value) return fixedPropertyId.value
  return String(selectedPropertyId.value || '').trim()
})

const resolvedPropertyName = computed(() => {
  const selectedId = resolvedPropertyId.value
  if (!selectedId) return props.propertyName || ''
  const match = propertyOptions.value.find(
    (option) => String(option.value || '').trim() === String(selectedId).trim(),
  )
  return match?.label || props.propertyName || ''
})

watch(
  fixedPropertyId,
  (value) => {
    if (String(value || '').trim() && !props.allowPropertyEdit) {
      selectedPropertyId.value = String(value || '').trim()
    }
  },
  { immediate: true },
)

watch(sourceType, () => {
  selectedPropertyId.value = ''
  selectedLeaseId.value = ''
})

const getFileExtension = (fileName = '') => {
  const ext = fileName.split('.').pop()
  return ext ? ext.toLowerCase() : ''
}

const imageExtensions = ['png', 'jpg', 'jpeg', 'webp', 'gif']

const filePreviewName = computed(() => form.value.file?.name || '')
const filePreviewExtension = computed(() => getFileExtension(filePreviewName.value))
const filePreviewIcon = computed(() => {
  if (['pdf'].includes(filePreviewExtension.value)) return 'picture_as_pdf'
  if (['doc', 'docx'].includes(filePreviewExtension.value)) return 'description'
  if (['xls', 'xlsx'].includes(filePreviewExtension.value)) return 'table_chart'
  if (['txt'].includes(filePreviewExtension.value)) return 'article'
  return 'attach_file'
})
const filePreviewTypeLabel = computed(() => {
  const ext = filePreviewExtension.value
  return ext ? ext.toUpperCase() : 'FILE'
})

watch(
  () => form.value.file,
  (file) => {
    if (imagePreview.value) {
      URL.revokeObjectURL(imagePreview.value)
      imagePreview.value = ''
    }
    if (!file) return
    const extension = getFileExtension(file.name)
    if (imageExtensions.includes(extension)) {
      imagePreview.value = URL.createObjectURL(file)
    }
  },
)

const removeSelectedFile = () => {
  if (imagePreview.value) {
    URL.revokeObjectURL(imagePreview.value)
    imagePreview.value = ''
  }
  form.value.file = null
}

const onSubmit = async () => {
  if (!String(form.value.purpose || '').trim()) {
    Notify.create({ type: 'warning', message: 'Please select purpose.', position: 'top' })
    return
  }
  const file = form.value.file
  if (!file) {
    Notify.create({ type: 'warning', message: 'Please upload a file.', position: 'top' })
    return
  }

  creating.value = true
  let saved = false
  try {
    const now = new Date().toISOString()
    const extension = getFileExtension(file.name)
    const safeName = String(file.name || 'document').replace(/[^a-zA-Z0-9._-]/g, '_')
    let id = null
    let payload = null

    if (sourceType.value === 'lease') {
      const leaseId = String(selectedLeaseId.value || '').trim()
      const propertyId = resolvedPropertyId.value
      if (!leaseId) {
        Notify.create({ type: 'warning', message: 'Please select lease.', position: 'top' })
        return
      }
      if (!propertyId) {
        Notify.create({ type: 'warning', message: 'Selected lease is missing property.', position: 'top' })
        return
      }

      const storagePath = `images/leases/${leaseId}/documents/${Date.now()}_${safeName}`
      const fileUrl = await uploadFile(storagePath, file)
      payload = {
        name: form.value.name || file.name,
        description: form.value.description || null,
        purpose: form.value.purpose || null,
        category: form.value.purpose || null,
        document_purpose: form.value.purpose || null,
        file_url: fileUrl,
        original_filename: file.name,
        file_type: extension,
        file_size: file.size,
        upload_date: now,
        created_datetime: now,
        property_id: propertyId,
        lease_doc_id: leaseId,
      }
      id = await createDocument(`leases/${leaseId}/documents`, payload)
    } else {
      const propertyId = resolvedPropertyId.value
      if (!propertyId) {
        Notify.create({ type: 'warning', message: 'Please select property.', position: 'top' })
        return
      }
      const propertyRole = normalizeRoleValue(userDataStore.getUserRoleForProperty(propertyId)?.role)

      const storagePath = `properties/${propertyId}/documents/${Date.now()}_${safeName}`
      const fileUrl = await uploadFile(storagePath, file)

      payload = {
        name: form.value.name || file.name,
        description: form.value.description || null,
        note: form.value.description || null,
        purpose: form.value.purpose || null,
        category: form.value.purpose || null,
        document_purpose: form.value.purpose || null,
        file_url: fileUrl,
        url: fileUrl,
        image_url: fileUrl,
        original_filename: file.name,
        file_type: extension,
        content_type: file.type || null,
        size: file.size || null,
        uploaded_by_role: propertyRole || userDataStore.accountType || null,
        upload_date: now,
        created_datetime: now,
      }

      id = await createDocument(`properties/${propertyId}/documents`, payload)
    }

    emit('document-created', { id, ...payload })
    saved = true
  } catch (error) {
    Notify.create({
      type: 'negative',
      message: error?.message || 'Failed to create document.',
      position: 'top',
    })
  } finally {
    if (saved) {
      removeSelectedFile()
    }
    creating.value = false
  }
}
</script>

<style scoped>
.create-document {
  max-width: 1200px;
  margin: 0 auto;
}

.elevated {
  border-radius: 14px;
  border: 1px solid var(--neutral-200);
}

.top-action-btn {
  min-width: 112px;
  height: 36px;
}

.composer-head {
  background: linear-gradient(180deg, #f8fbff 0%, #ffffff 100%);
}

:global(body.body--dark) .q-card__section.composer-head {
  background: linear-gradient(180deg, #243447 0%, #1b2635 100%) !important;
}

:global(body.body--dark) .create-document .elevated,
:global(body.body--dark) .create-document .q-card__section:not(.composer-head) {
  background: #15202b !important;
  border-color: #2d3f52;
  color: #e6edf3;
}

:global(body.body--dark) .create-document .bg-grey-1,
:global(body.body--dark) .create-document .q-field__control,
:global(body.body--dark) .create-document .picture-upload-section,
:global(body.body--dark) .create-document .file-preview-card {
  background: #223041 !important;
  border-color: #35506a;
}

.section-label {
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--neutral-600);
}

.picture-upload-section {
  margin: 16px 0;
  padding: 16px;
  border: 1px solid var(--neutral-200);
  border-radius: 10px;
  background-color: #fafcff;
}

.file-preview-card {
  border: 1px solid var(--neutral-200);
  border-radius: 10px;
  background: #fff;
  padding: 12px 14px;
}
</style>
