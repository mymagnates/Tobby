<template>
  <q-page class="q-pa-md sp-profile-page">
    <q-card flat bordered class="sp-profile-card q-mb-sm">
      <q-card-section class="row items-center justify-between">
        <div>
          <div class="text-h6">Account</div>
          <div class="text-caption text-grey-7">Core account information</div>
        </div>
        <q-btn
          flat
          color="primary"
          icon="open_in_new"
          label="View Handout Page"
          @click="openPublicShowcase"
        />
      </q-card-section>
      <q-separator />
      <q-card-section class="account-summary">
        <div class="row q-col-gutter-sm">
          <div class="col-12 col-md-6">
            <div class="account-row">
              <span>Business</span>
              <strong>{{ accountBusinessName }}</strong>
            </div>
            <div class="account-row account-row-editable" @click="openContactEditDialog('contact')">
              <span>Contact</span>
              <strong class="account-value-edit">{{ accountContactName }}</strong>
            </div>
            <div class="account-row account-row-editable" @click="openContactEditDialog('email')">
              <span>Email</span>
              <strong class="account-value-edit">{{ accountEmail }}</strong>
            </div>
          </div>
          <div class="col-12 col-md-6">
            <div class="account-row account-row-editable" @click="openContactEditDialog('phone')">
              <span>Phone</span>
              <strong class="account-value-edit">{{ accountPhone }}</strong>
            </div>
            <div class="account-row account-row-editable" @click="openContactEditDialog('address')">
              <span>Address</span>
              <strong class="account-value-edit">{{ accountAddress }}</strong>
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <q-card flat bordered class="sp-profile-card">
      <q-card-section class="row items-center justify-between">
        <div>
          <div class="text-h6">SP Profile</div>
          <div class="text-caption text-grey-7">Manage your service provider information</div>
        </div>
      </q-card-section>
      <q-separator />
      <q-card-section>
        <q-form class="row q-col-gutter-md">
          <div class="col-12 col-md-6">
            <q-input v-model="form.sp_name" outlined dense label="SP Name" readonly />
          </div>
          <div class="col-12 col-md-6">
            <q-input v-model="form.contact_name" outlined dense label="Contact Name" readonly />
          </div>
          <div class="col-12 col-md-6">
            <q-input v-model="form.email" outlined dense type="email" label="Email" readonly />
          </div>
          <div class="col-12 col-md-6">
            <q-input v-model="form.phone" outlined dense label="Phone" readonly />
          </div>
          <div class="col-12 col-md-6">
            <q-input v-model="form.website" outlined dense label="Website" readonly />
          </div>
          <div class="col-12 col-md-6">
            <q-input v-model="form.service_area" outlined dense label="Service Area" readonly />
          </div>
          <div class="col-12">
            <q-input v-model="form.services" outlined dense label="Services (comma separated)" readonly />
          </div>
          <div class="col-12">
            <q-input v-model="form.address" outlined dense label="Business Address" readonly />
          </div>
          <div class="col-12">
            <q-input v-model="form.bio" outlined dense type="textarea" autogrow label="Business Bio" readonly />
          </div>
        </q-form>
      </q-card-section>
    </q-card>

    <q-dialog v-model="showContactEditDialog">
      <q-card style="min-width: 420px; max-width: 90vw">
        <q-card-section class="row items-center justify-between">
          <div class="text-h6">Update Contact Info</div>
          <q-btn icon="close" flat round dense color="primary" v-close-popup />
        </q-card-section>
        <q-separator />
        <q-card-section class="q-pa-md">
          <q-input
            v-model="contactForm.contact"
            label="Contact"
            outlined
            dense
            class="q-mb-sm"
          />
          <q-input
            v-model="contactForm.email"
            label="Email"
            type="email"
            outlined
            dense
            class="q-mb-sm"
          />
          <q-input
            v-model="contactForm.phone"
            label="Phone"
            type="tel"
            outlined
            dense
            class="q-mb-sm"
          />
          <q-input
            v-model="contactForm.address"
            label="Address"
            outlined
            dense
            autogrow
          />
        </q-card-section>
        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancel" color="grey" v-close-popup />
          <q-btn
            color="primary"
            label="Save"
            :loading="savingContact"
            @click="saveContactInfo"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Notify } from 'quasar'
import { useUserDataStore } from 'src/stores/userDataStore'
import { resolveSpSlug } from 'src/utils/spPosts'

const userStore = useUserDataStore()
const router = useRouter()
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

const accountBusinessName = ref('Not set')
const accountContactName = ref('Not set')
const accountEmail = ref('Not set')
const accountPhone = ref('Not set')
const accountAddress = ref('Not set')
const showContactEditDialog = ref(false)
const savingContact = ref(false)
const contactForm = ref({
  contact: '',
  email: '',
  phone: '',
  address: '',
})

const hydrateForm = () => {
  const profile = userStore.userProfile || {}
  accountBusinessName.value =
    profile.business_name || profile.sp_business_name || profile.display_name || 'Not set'
  accountContactName.value = profile.contact_name || profile.full_name || profile.user_name || 'Not set'
  accountEmail.value = profile.email || userStore.user?.email || 'Not set'
  accountPhone.value =
    profile.mobile_phone || profile.phone || profile.contact_phone || profile.cellphone || 'Not set'
  accountAddress.value =
    profile.registered_business_address || profile.address || profile.mailing_address || 'Not set'
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

const openContactEditDialog = (focusField) => {
  contactForm.value = {
    contact: accountContactName.value === 'Not set' ? '' : accountContactName.value,
    email: accountEmail.value === 'Not set' ? '' : accountEmail.value,
    phone: accountPhone.value === 'Not set' ? '' : accountPhone.value,
    address: accountAddress.value === 'Not set' ? '' : accountAddress.value,
  }
  showContactEditDialog.value = true
  if (focusField) {
    setTimeout(() => {
      const inputs = document.querySelectorAll('.q-dialog input, .q-dialog textarea')
      const map = {
        contact: 0,
        email: 1,
        phone: 2,
        address: 3,
      }
      const target = inputs[map[focusField]]
      target?.focus?.()
    }, 50)
  }
}

const saveContactInfo = async () => {
  try {
    savingContact.value = true
    const payload = {
      contact_name: String(contactForm.value.contact || '').trim(),
      full_name: String(contactForm.value.contact || '').trim(),
      email: String(contactForm.value.email || '').trim(),
      phone: String(contactForm.value.phone || '').trim(),
      contact_phone: String(contactForm.value.phone || '').trim(),
      mobile_phone: String(contactForm.value.phone || '').trim(),
      registered_business_address: String(contactForm.value.address || '').trim(),
      address: String(contactForm.value.address || '').trim(),
    }
    await userStore.updateUserProfile(payload)
    hydrateForm()
    showContactEditDialog.value = false
    Notify.create({ type: 'positive', message: 'Contact info updated.', position: 'top' })
  } catch (error) {
    Notify.create({
      type: 'negative',
      message: error.message || 'Failed to update contact info.',
      position: 'top',
    })
  } finally {
    savingContact.value = false
  }
}

const openPublicShowcase = () => {
  if (!userStore.userId) return
  const slug = resolveSpSlug(userStore.userProfile || {}, userStore.userId)
  router.push(`/public/handout/${slug}`)
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

.sp-profile-card {
  border-radius: 14px;
  border-color: var(--neutral-200);
}

.account-summary {
  padding-top: 12px;
}

.account-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 6px 0;
  border-bottom: 1px solid var(--neutral-100);
  font-size: 0.9rem;
}

.account-row:last-child {
  border-bottom: none;
}

.account-row-editable {
  cursor: pointer;
  background: rgba(25, 118, 210, 0.08);
  border-radius: 8px;
  padding: 8px;
}

.account-value-edit {
  color: var(--primary-color);
}
</style>
