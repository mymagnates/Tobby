<template>
  <q-page class="mobile-page mobile-page--with-primary-action">
    <q-form id="pm-mobile-task-form" class="mobile-page-stack" @submit="onSubmit">
      <MobilePageHeader eyebrow="PM Manage" title="Task" description="Create a work item or issue that needs follow-up.">
        <template #action>
          <q-btn round flat dense icon="arrow_back" @click="router.back()" />
        </template>
      </MobilePageHeader>

      <MobileCard title="Context" subtitle="Choose the property this task belongs to.">
        <q-select
          v-model="selectedPropertyId"
          :options="propertyOptions"
          option-label="label"
          option-value="value"
          emit-value
          map-options
          label="Property"
          outlined
          dense
          :loading="propertiesLoading"
          :rules="[(val) => !!val || 'Property is required']"
        >
          <template #prepend>
            <q-icon name="home" color="primary" />
          </template>
        </q-select>
        <MobileEmptyState
          v-if="!propertiesLoading && propertyOptions.length === 0"
          title="No properties available"
          body="Accessible properties will appear here after your PM workspace data loads."
        />
      </MobileCard>

      <MobileCard title="Task Details" subtitle="Keep the mobile version focused on the fields needed onsite.">
        <div class="mobile-form-stack">
          <q-input
            v-model="form.report_date"
            label="Report Date"
            type="date"
            outlined
            dense
            :rules="[(val) => !!val || 'Report date is required']"
          >
            <template #prepend>
              <q-icon name="event" color="primary" />
            </template>
          </q-input>

          <q-select
            v-model="form.status"
            :options="statusOptions"
            label="Status"
            outlined
            dense
            :rules="[(val) => !!val || 'Status is required']"
          >
            <template #prepend>
              <q-icon name="flag" color="primary" />
            </template>
          </q-select>

          <q-input
            v-model="form.description"
            label="Task Description"
            type="textarea"
            autogrow
            outlined
            dense
            :rules="[(val) => !!String(val || '').trim() || 'Description is required']"
          />
        </div>
      </MobileCard>

      <MobileCard title="Photos" subtitle="Attach issue evidence before submitting.">
        <div class="mobile-form-stack">
          <q-file
            v-model="selectedFiles"
            accept="image/*"
            outlined
            dense
            multiple
            label="Choose photos"
            hint="Up to 6 images"
            @update:model-value="onFilesSelected"
          >
            <template #prepend>
              <q-icon name="photo_camera" color="primary" />
            </template>
          </q-file>

          <div v-if="imagePreviews.length" class="mobile-photo-strip">
            <div v-for="(preview, index) in imagePreviews" :key="`${preview.name}-${index}`" class="mobile-photo-thumb">
              <q-img :src="preview.url" fit="cover" class="mobile-photo-thumb__image" />
              <q-btn
                round
                dense
                flat
                icon="close"
                size="sm"
                color="negative"
                class="mobile-photo-thumb__remove"
                @click="removeImage(index)"
              />
            </div>
          </div>
        </div>
      </MobileCard>
    </q-form>

    <div class="mobile-primary-action">
      <q-btn
        unelevated
        no-caps
        color="primary"
        class="full-width"
        type="submit"
        form="pm-mobile-task-form"
        label="Create Task"
        :loading="loading"
      />
    </div>
  </q-page>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Notify } from 'quasar'
import MobileCard from 'components/mobile/MobileCard.vue'
import MobileEmptyState from 'components/mobile/MobileEmptyState.vue'
import MobilePageHeader from 'components/mobile/MobilePageHeader.vue'
import { useFirebase } from 'src/composables/useFirebase'
import { useUserDataStore } from 'src/stores/userDataStore'

const router = useRouter()
const route = useRoute()
const userDataStore = useUserDataStore()
const { createDocument, uploadImages } = useFirebase()

const loading = ref(false)
const selectedPropertyId = ref('')
const selectedFiles = ref([])
const imagePreviews = ref([])
const statusOptions = ['open', 'closed', 'cancel']
const isPreviewRoute = computed(() => String(route.path || '').startsWith('/mobile-preview'))
const previewWriteOnly = computed(() => isPreviewRoute.value && !userDataStore.userId)
const previewProperties = [
  { id: 'preview-property-main', property_id: 'preview-property-main', nickname: '123 Main St', address: '123 Main St' },
]

const form = reactive({
  description: '',
  report_date: new Date().toISOString().split('T')[0],
  status: 'open',
})

const availableProperties = computed(() => {
  const rows = userDataStore.userAccessibleProperties || []
  return rows.length ? rows : (isPreviewRoute.value ? previewProperties : [])
})
const propertiesLoading = computed(() => userDataStore.propertiesLoading)
const propertyOptions = computed(() =>
  availableProperties.value.map((property) => ({
    label: property.nickname || property.displayName || property.address || property.id,
    value: property.id || property.property_id,
  })),
)

watch(
  propertyOptions,
  (options) => {
    if (!selectedPropertyId.value && options.length > 0) {
      selectedPropertyId.value = options[0].value
    }
  },
  { immediate: true },
)

onMounted(async () => {
  if (!userDataStore.propertiesLoading && availableProperties.value.length === 0) {
    await userDataStore.loadProperties?.()
  }
})

const onFilesSelected = (files) => {
  imagePreviews.value = []
  const fileArray = Array.isArray(files) ? files : files ? [files] : []
  selectedFiles.value = fileArray.slice(0, 6)
  selectedFiles.value.forEach((file) => {
    const reader = new FileReader()
    reader.onload = (event) => {
      imagePreviews.value.push({
        url: event.target.result,
        name: file.name,
        file,
      })
    }
    reader.readAsDataURL(file)
  })
}

const removeImage = (index) => {
  imagePreviews.value.splice(index, 1)
  selectedFiles.value = imagePreviews.value.map((preview) => preview.file)
}

const resetForm = () => {
  form.description = ''
  form.report_date = new Date().toISOString().split('T')[0]
  form.status = 'open'
  selectedFiles.value = []
  imagePreviews.value = []
}

const onSubmit = async () => {
  const finalPropertyId = String(selectedPropertyId.value || '').trim()
  if (!finalPropertyId) {
    Notify.create({ type: 'warning', message: 'Please select a property.', position: 'top' })
    return
  }

  const matchedProperty = availableProperties.value.find(
    (property) => String(property.id || property.property_id || '').trim() === finalPropertyId,
  )
  if (!matchedProperty) {
    Notify.create({ type: 'negative', message: 'Selected property is not accessible.', position: 'top' })
    return
  }

  loading.value = true
  try {
    let imageUrls = []
    const filesToUpload = imagePreviews.value.map((preview) => preview.file)
    if (filesToUpload.length > 0 && !previewWriteOnly.value) {
      imageUrls = await uploadImages(filesToUpload, finalPropertyId, 'mxrecord')
    }

    const currentTimestamp = new Date()
    const role = userDataStore.getUserRoleForProperty(finalPropertyId)?.role || 'Unknown Role'
    const userName = userDataStore.user?.displayName || userDataStore.user?.email || 'Unknown User'

    const payload = {
      create_id: userDataStore.userId,
      createAt: currentTimestamp,
      report_date: form.report_date,
      description: form.description,
      status: form.status,
      logs: [
        {
          log_timestamp: currentTimestamp,
          comment: 'Initial report submitted',
          user_id: userDataStore.userId,
          user_name: userName,
          user_role: role,
        },
      ],
      mx_id: `mx_${Date.now()}`,
      property_id: finalPropertyId,
      reported_by: userName,
      reported_role: role,
      image_urls: imageUrls,
      sp_published: false,
      sp_publish_status: 'draft',
      sp_publish_source: null,
      sp_publish_includes_comments: false,
      sp_published_at: null,
      sp_published_by: null,
      sp_published_by_role: null,
      sp_publish_count: 0,
      sp_lead_id: null,
      updatedAt: currentTimestamp,
    }
    if (!previewWriteOnly.value) {
      await createDocument(`properties/${finalPropertyId}/mxrecords`, payload)
    }

    Notify.create({ type: 'positive', message: 'Task created.', position: 'top' })
    resetForm()
    router.push(isPreviewRoute.value ? '/mobile-preview/pm/manage' : '/mobile/pm/manage')
  } catch (error) {
    Notify.create({
      type: 'negative',
      message: error?.message || 'Failed to create task.',
      position: 'top',
    })
  } finally {
    loading.value = false
  }
}
</script>
