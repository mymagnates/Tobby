<template>
  <q-page class="mobile-page mobile-page--with-primary-action">
    <q-form id="mobile-account-form" class="mobile-page-stack" @submit="saveProfile">
      <MobilePageHeader :title="title" />

      <MobileCard title="Profile" :subtitle="profileSubtitle">
        <div class="mobile-form-stack">
          <q-input v-model="form.display_name" label="Display Name" outlined dense />
          <q-input v-model="form.full_name" label="Full Name" outlined dense />
          <q-input v-model="form.email" label="Email" outlined dense readonly />
          <q-input v-model="form.phone" label="Phone" outlined dense />

          <template v-if="normalizedRole === 'sp'">
            <q-input v-model="form.business_name" label="Business Name" outlined dense />
            <q-input v-model="form.website" label="Website" outlined dense />
            <q-input v-model="form.service_area" label="Service Area" outlined dense />
            <q-input
              v-model="form.services"
              label="Services"
              hint="Comma separated"
              outlined
              dense
            />
            <q-input
              v-model="form.bio"
              label="Handout Bio"
              type="textarea"
              autogrow
              outlined
              dense
            />
          </template>

          <template v-else>
            <q-input v-model="form.organization" label="Organization" outlined dense />
            <q-input v-model="form.address" label="Address" outlined dense />
          </template>
        </div>
      </MobileCard>

      <MobileCard title="Notifications" subtitle="Mobile preferences saved to your account.">
        <div class="mobile-toggle-list">
          <label class="mobile-toggle-row">
            <span>
              <span class="mobile-toggle-row__title">Mobile Alerts</span>
              <span class="mobile-toggle-row__meta">Important account and property updates.</span>
            </span>
            <q-toggle v-model="notifications.mobile" dense />
          </label>
          <label class="mobile-toggle-row">
            <span>
              <span class="mobile-toggle-row__title">Reminders</span>
              <span class="mobile-toggle-row__meta">Due dates, requests, and follow-up items.</span>
            </span>
            <q-toggle v-model="notifications.reminders" dense />
          </label>
          <label v-if="normalizedRole === 'sp'" class="mobile-toggle-row">
            <span>
              <span class="mobile-toggle-row__title">Bid and Project Updates</span>
              <span class="mobile-toggle-row__meta">Lead, bid, project, and invoice status.</span>
            </span>
            <q-toggle v-model="notifications.marketplace" dense />
          </label>
          <label v-else class="mobile-toggle-row">
            <span>
              <span class="mobile-toggle-row__title">Documents</span>
              <span class="mobile-toggle-row__meta"
                >New files, receipts, notices, and statements.</span
              >
            </span>
            <q-toggle v-model="notifications.documents" dense />
          </label>
        </div>
      </MobileCard>

      <MobileCard title="Privacy" subtitle="Policy access and account privacy requests.">
        <div class="mobile-list-group">
          <button
            type="button"
            class="mobile-list-row mobile-list-row--button"
            @click="openPrivacyPolicy"
          >
            <div class="mobile-list-row__icon">
              <q-icon name="policy" size="21px" />
            </div>
            <div class="mobile-list-row__body">
              <div class="mobile-list-row__title">Privacy Policy</div>
              <div class="mobile-list-row__meta">Open the current Tobby privacy policy.</div>
            </div>
            <q-icon name="chevron_right" class="mobile-list-row__chevron" size="20px" />
          </button>

          <button
            type="button"
            class="mobile-list-row mobile-list-row--button"
            :disabled="deletionSubmitting"
            @click="confirmAccountDeletion"
          >
            <div class="mobile-list-row__icon mobile-list-row__icon--danger">
              <q-icon name="person_remove" size="21px" />
            </div>
            <div class="mobile-list-row__body">
              <div class="mobile-list-row__title">Request Account Deletion</div>
              <div class="mobile-list-row__meta">Submit a review request for this account.</div>
            </div>
            <q-spinner v-if="deletionSubmitting" size="18px" color="negative" />
            <q-icon v-else name="chevron_right" class="mobile-list-row__chevron" size="20px" />
          </button>

          <button
            type="button"
            class="mobile-list-row mobile-list-row--button"
            @click="openContactSupport"
          >
            <div class="mobile-list-row__icon">
              <q-icon name="support_agent" size="21px" />
            </div>
            <div class="mobile-list-row__body">
              <div class="mobile-list-row__title">Contact Support</div>
              <div class="mobile-list-row__meta">Open Tobby support on the web.</div>
            </div>
            <q-icon name="chevron_right" class="mobile-list-row__chevron" size="20px" />
          </button>

          <button
            type="button"
            class="mobile-list-row mobile-list-row--button"
            @click="openContactSupport"
          >
            <div class="mobile-list-row__icon mobile-list-row__icon--danger">
              <q-icon name="report" size="21px" />
            </div>
            <div class="mobile-list-row__body">
              <div class="mobile-list-row__title">Report Abuse</div>
              <div class="mobile-list-row__meta">Contact support for abuse or safety concerns.</div>
            </div>
            <q-icon name="chevron_right" class="mobile-list-row__chevron" size="20px" />
          </button>
        </div>
      </MobileCard>

      <MobileCard title="Session" subtitle="Manage the current mobile login.">
        <button
          type="button"
          class="mobile-list-row mobile-list-row--button"
          @click="signOutMobile"
        >
          <div class="mobile-list-row__icon">
            <q-icon name="logout" size="21px" />
          </div>
          <div class="mobile-list-row__body">
            <div class="mobile-list-row__title">Sign Out</div>
            <div class="mobile-list-row__meta">End this session and return to mobile login.</div>
          </div>
        </button>
      </MobileCard>
    </q-form>

    <div class="mobile-primary-action">
      <q-btn
        unelevated
        no-caps
        color="primary"
        class="full-width"
        type="submit"
        form="mobile-account-form"
        label="Save Profile"
        :loading="saving"
      />
    </div>
  </q-page>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Dialog, Notify } from 'quasar'
import MobileCard from 'components/mobile/MobileCard.vue'
import MobilePageHeader from 'components/mobile/MobilePageHeader.vue'
import { useFirebase } from 'src/composables/useFirebase'
import { contactSupportUrl } from 'src/services/contentModeration'
import { privacyPolicyUrl, requestAccountDeletion } from 'src/services/accountPrivacy'
import { useUserDataStore } from 'src/stores/userDataStore'

const props = defineProps({
  role: {
    type: String,
    default: 'pm',
  },
})

const router = useRouter()
const userDataStore = useUserDataStore()
const { logout } = useFirebase()
const saving = ref(false)
const deletionSubmitting = ref(false)

const normalizedRole = computed(() => {
  const value = String(props.role || '').toLowerCase()
  if (value === 'owner') return 'owner'
  if (value === 'tenant') return 'tenant'
  if (value === 'sp') return 'sp'
  return 'pm'
})

const title = computed(() => 'Account')
const profileSubtitle = computed(() => {
  if (normalizedRole.value === 'sp') return 'Business profile, service area, and handout details.'
  if (normalizedRole.value === 'tenant')
    return 'Contact details used for lease and request updates.'
  if (normalizedRole.value === 'owner') return 'Contact details used for portfolio updates.'
  return 'Name, email, organization, and role context.'
})

const form = reactive({
  display_name: '',
  full_name: '',
  email: '',
  phone: '',
  business_name: '',
  website: '',
  service_area: '',
  services: '',
  bio: '',
  organization: '',
  address: '',
})

const notifications = reactive({
  mobile: true,
  reminders: true,
  documents: true,
  marketplace: true,
})

const profile = computed(() => userDataStore.userProfile || {})
const authUser = computed(() => userDataStore.user || {})

const apiAccountType = computed(() => {
  const profileType = String(
    profile.value.account_type || profile.value.user_category || userDataStore.accountType || '',
  ).toLowerCase()
  if (profileType === 'admin') return 'admin'
  if (profileType === 'sp') return 'sp'
  if (profileType === 'tt' || profileType === 'tenant') return 'tt'
  if (profileType === 'po' || profileType === 'owner') return 'po'
  if (normalizedRole.value === 'owner') return 'po'
  if (normalizedRole.value === 'tenant') return 'tt'
  if (normalizedRole.value === 'sp') return 'sp'
  return 'pm'
})

const serializeServices = (value) =>
  String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)

const servicesToString = (value) => {
  if (Array.isArray(value)) return value.filter(Boolean).join(', ')
  return String(value || '')
}

const hydrate = () => {
  const currentProfile = profile.value
  const currentUser = authUser.value
  form.display_name =
    currentProfile.display_name || currentProfile.user_name || currentUser.displayName || ''
  form.full_name =
    currentProfile.full_name || currentProfile.contact_name || currentUser.displayName || ''
  form.email = currentProfile.email || currentUser.email || ''
  form.phone =
    currentProfile.phone || currentProfile.mobile_phone || currentProfile.contact_phone || ''
  form.business_name = currentProfile.business_name || currentProfile.sp_business_name || ''
  form.website = currentProfile.website || ''
  form.service_area = currentProfile.service_area || currentProfile.coverage_area || ''
  form.services = servicesToString(currentProfile.services)
  form.bio = currentProfile.bio || currentProfile.description || ''
  form.organization =
    currentProfile.organization || currentProfile.company_name || currentProfile.business_name || ''
  form.address = currentProfile.address || currentProfile.mailing_address || ''

  const prefs = currentProfile.notification_preferences || {}
  notifications.mobile = prefs.mobile ?? currentProfile.mobile_notifications ?? true
  notifications.reminders = prefs.reminders ?? true
  notifications.documents = prefs.documents ?? true
  notifications.marketplace = prefs.marketplace ?? true
}

const saveProfile = async () => {
  saving.value = true
  try {
    const payload = {
      display_name: form.display_name.trim(),
      full_name: form.full_name.trim(),
      phone: form.phone.trim(),
      notification_preferences: {
        mobile: notifications.mobile,
        reminders: notifications.reminders,
        documents: notifications.documents,
        marketplace: notifications.marketplace,
      },
      mobile_notifications: notifications.mobile,
    }

    if (!profile.value.email && form.email) payload.email = form.email

    if (normalizedRole.value === 'sp') {
      const businessName = form.business_name.trim()
      payload.business_name = businessName
      payload.sp_business_name = businessName
      payload.contact_name = form.full_name.trim()
      payload.website = form.website.trim()
      payload.service_area = form.service_area.trim()
      payload.coverage_area = form.service_area.trim()
      payload.services = serializeServices(form.services)
      payload.bio = form.bio.trim()
    } else {
      payload.organization = form.organization.trim()
      payload.company_name = form.organization.trim()
      payload.address = form.address.trim()
    }

    await userDataStore.updateUserProfile(payload)
    Notify.create({ type: 'positive', message: 'Profile saved.' })
  } catch (error) {
    Notify.create({ type: 'negative', message: error?.message || 'Unable to save profile.' })
  } finally {
    saving.value = false
  }
}

const openPrivacyPolicy = () => {
  window.open(privacyPolicyUrl, '_blank', 'noopener,noreferrer')
}

const openContactSupport = () => {
  window.open(contactSupportUrl, '_blank', 'noopener,noreferrer')
}

const submitAccountDeletionRequest = async (reason = '') => {
  deletionSubmitting.value = true
  try {
    await requestAccountDeletion({
      user: authUser.value,
      email: form.email || profile.value.email || authUser.value.email || '',
      accountType: apiAccountType.value,
      source: 'capacitor_profile',
      reason,
    })
    Notify.create({ type: 'positive', message: 'Request submitted.' })
  } catch (error) {
    Notify.create({
      type: 'negative',
      message: error?.message || 'Unable to submit account deletion request.',
    })
  } finally {
    deletionSubmitting.value = false
  }
}

const confirmAccountDeletion = () => {
  if (deletionSubmitting.value) return
  Dialog.create({
    title: 'Request account deletion?',
    message:
      'This request will not immediately delete shared property, lease, transaction, task, or service records. Tobby will review and process the request.',
    prompt: {
      model: '',
      type: 'textarea',
      label: 'Optional note',
      isValid: (value) => String(value || '').length <= 500,
    },
    persistent: true,
    ok: {
      label: 'Submit Request',
      color: 'negative',
      noCaps: true,
      unelevated: true,
    },
    cancel: {
      label: 'Cancel',
      flat: true,
      noCaps: true,
    },
  }).onOk((reason) => {
    submitAccountDeletionRequest(reason)
  })
}

const signOutMobile = async () => {
  saving.value = true
  try {
    await logout()
    await router.replace('/mobile-login')
  } catch (error) {
    Notify.create({ type: 'negative', message: error?.message || 'Unable to sign out.' })
  } finally {
    saving.value = false
  }
}

watch(profile, hydrate, { deep: true })

onMounted(async () => {
  hydrate()
  if (userDataStore.user && !userDataStore.profileLoading) {
    await userDataStore.loadUserProfile?.()
    hydrate()
  }
})
</script>
