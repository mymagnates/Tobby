<template>
  <q-page class="q-pa-md sp-profile-page">
    <q-card flat bordered class="sp-profile-card">
      <q-card-section class="row items-center justify-between">
        <div>
          <div class="text-h6">SP Profile</div>
          <div class="text-caption text-grey-7">Manage your service provider information</div>
        </div>
      </q-card-section>
      <q-separator />
      <q-card-section>
        <q-form class="row q-col-gutter-md" @submit.prevent="saveProfile">
          <div class="col-12 col-md-6">
            <q-input v-model="form.sp_name" outlined dense label="SP Name" />
          </div>
          <div class="col-12 col-md-6">
            <q-input v-model="form.contact_name" outlined dense label="Contact Name" />
          </div>
          <div class="col-12 col-md-6">
            <q-input v-model="form.email" outlined dense type="email" label="Email" />
          </div>
          <div class="col-12 col-md-6">
            <q-input v-model="form.phone" outlined dense label="Phone" />
          </div>
          <div class="col-12 col-md-6">
            <q-input v-model="form.website" outlined dense label="Website" />
          </div>
          <div class="col-12 col-md-6">
            <q-input v-model="form.service_area" outlined dense label="Service Area" />
          </div>
          <div class="col-12">
            <q-input v-model="form.services" outlined dense label="Services (comma separated)" />
          </div>
          <div class="col-12">
            <q-input v-model="form.address" outlined dense label="Business Address" />
          </div>
          <div class="col-12">
            <q-input v-model="form.bio" outlined dense type="textarea" autogrow label="Business Bio" />
          </div>
          <div class="col-12 row justify-end q-gutter-sm">
            <q-btn flat color="grey-7" label="Reset" @click="resetForm" />
            <q-btn color="primary" label="Save Profile" type="submit" :loading="saving" />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { Notify } from 'quasar'
import { useUserDataStore } from 'src/stores/userDataStore'

const userStore = useUserDataStore()
const form = reactive({
  sp_name: '',
  contact_name: '',
  email: '',
  phone: '',
  website: '',
  service_area: '',
  services: '',
  address: '',
  bio: '',
})

const saving = ref(false)

const hydrateForm = () => {
  const profile = userStore.userProfile || {}
  form.sp_name = profile.sp_business_name || profile.business_name || profile.display_name || ''
  form.contact_name = profile.contact_name || profile.full_name || ''
  form.email = profile.email || userStore.user?.email || ''
  form.phone = profile.phone || profile.contact_phone || ''
  form.website = profile.website || ''
  form.service_area = profile.service_area || ''
  form.services = Array.isArray(profile.services)
    ? profile.services.join(', ')
    : profile.services || ''
  form.address = profile.address || ''
  form.bio = profile.bio || ''
}

const resetForm = () => {
  hydrateForm()
}

const saveProfile = async () => {
  saving.value = true
  try {
    await userStore.updateUserProfile({
      sp_business_name: form.sp_name,
      business_name: form.sp_name,
      display_name: form.sp_name,
      contact_name: form.contact_name,
      email: form.email,
      phone: form.phone,
      contact_phone: form.phone,
      website: form.website,
      service_area: form.service_area,
      services: form.services
        .split(',')
        .map((v) => v.trim())
        .filter(Boolean),
      address: form.address,
      bio: form.bio,
    })
    Notify.create({ type: 'positive', message: 'SP profile updated.', position: 'top' })
  } catch (error) {
    Notify.create({
      type: 'negative',
      message: error.message || 'Failed to update profile.',
      position: 'top',
    })
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  hydrateForm()
})
</script>

<style scoped>
.sp-profile-page {
  max-width: 980px;
  margin: 0 auto;
}
</style>
