<template>
  <q-page class="q-pa-sm sp-profile-page">
    <q-card flat bordered class="sp-profile-card q-mb-sm">
      <q-card-section class="row items-center justify-between q-py-sm q-px-md">
        <div>
          <div class="text-subtitle1 text-weight-medium">Account</div>
          <div class="text-caption text-grey-7">Core account information</div>
        </div>
        <div class="row items-center q-gutter-sm">
          <q-btn flat no-caps icon="arrow_back" label="Back" @click="goBack" />
          <q-btn
            outline
            color="negative"
            icon="delete_forever"
            label="Request Deletion"
            @click="openDeleteAccountDialog"
          />
          <q-btn
            flat
            color="primary"
            icon="open_in_new"
            label="View Handout Page"
            @click="openPublicShowcase"
          />
        </div>
      </q-card-section>
      <q-separator />
      <q-card-section class="account-summary q-px-md q-py-sm">
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
      <q-card-section class="row items-center justify-between q-py-sm q-px-md">
        <div>
          <div class="text-subtitle1 text-weight-medium">SP Profile</div>
          <div class="text-caption text-grey-7">Manage your service provider information</div>
        </div>
      </q-card-section>
      <q-separator />
      <q-card-section class="q-px-md q-py-sm">
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

    <q-card flat bordered class="sp-profile-card q-mb-sm">
      <q-card-section class="q-px-md q-py-sm">
        <div class="text-subtitle1 text-weight-medium">Usage Quotas</div>
        <div class="text-caption text-grey-7 q-mb-sm">AI and storage usage for this account</div>

        <div class="quota-card q-mb-sm" :class="`quota-card--${aiTokensStatus}`">
          <div class="quota-card-head q-mb-xs">
            <div>
              <div class="text-subtitle2">AI Tokens</div>
              <div class="quota-status-copy">{{ aiTokensStatusLabel }}</div>
            </div>
            <div class="quota-usage-copy">{{ aiTokensUsedDisplay }} / {{ aiTokensLimitDisplay }}</div>
          </div>
          <q-linear-progress rounded size="8px" :value="aiTokensRatio" :color="quotaColor(aiTokensStatus)" />
          <div class="quota-card-foot q-mt-xs">
            <span>{{ aiTokensRemainingDisplay }} left this month</span>
          </div>
          <div v-if="aiTokensMessage" class="quota-message" :class="`text-${quotaColor(aiTokensStatus)}`">
            {{ aiTokensMessage }}
          </div>
        </div>

        <div class="quota-card" :class="`quota-card--${storageStatus}`">
          <div class="quota-card-head q-mb-xs">
            <div>
              <div class="text-subtitle2">Storage</div>
              <div class="quota-status-copy">{{ storageStatusLabel }}</div>
            </div>
            <div class="quota-usage-copy">{{ storageUsedDisplay }} / {{ storageLimitDisplay }}</div>
          </div>
          <q-linear-progress rounded size="8px" :value="storageRatio" :color="quotaColor(storageStatus)" />
          <div class="quota-card-foot q-mt-xs">
            <span>{{ storageRemainingDisplay }} remaining</span>
          </div>
          <div v-if="storageMessage" class="quota-message" :class="`text-${quotaColor(storageStatus)}`">
            {{ storageMessage }}
          </div>
        </div>
      </q-card-section>
    </q-card>

    <q-dialog v-model="showContactEditDialog">
      <q-card class="profile-contact-dialog">
        <q-card-section class="dialog-header profile-contact-dialog__header">
          <div>
            <div class="text-h6">Update Contact Info</div>
            <div class="profile-contact-dialog__subtitle">
              Keep your service provider contact details current.
            </div>
          </div>
          <q-btn icon="close" flat round dense class="dialog-close-btn" v-close-popup />
        </q-card-section>
        <q-card-section class="profile-contact-dialog__body">
          <div class="profile-contact-dialog__grid">
            <q-input
              v-model="contactForm.contact"
              label="Contact"
              outlined
              dense
            />
            <q-input
              v-model="contactForm.email"
              label="Email"
              type="email"
              outlined
              dense
            />
            <q-input
              v-model="contactForm.phone"
              label="Phone"
              type="tel"
              outlined
              dense
            />
            <q-input
              v-model="contactForm.address"
              label="Address"
              outlined
              dense
              autogrow
              class="profile-contact-dialog__wide"
            />
          </div>
        </q-card-section>
        <q-card-actions align="right" class="profile-contact-dialog__actions">
          <q-btn outline no-caps label="Cancel" color="primary" v-close-popup />
          <q-btn
            color="primary"
            unelevated
            no-caps
            label="Save"
            :loading="savingContact"
            @click="saveContactInfo"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showDeleteAccountDialog" persistent>
      <q-card class="delete-account-dialog">
        <q-card-section>
          <div class="text-h6 text-negative">Request Account Deletion</div>
          <p class="text-body2 q-mt-sm q-mb-none">
            This submits a deletion request for your service provider account. Active bids,
            projects, invoices, credits, and shared records may need review before final closure.
          </p>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <q-input
            v-model="deleteAccountReason"
            outlined
            autogrow
            label="Optional note"
            placeholder="Add context for the support team"
            class="q-mb-sm"
          />
          <q-input
            v-model="deleteAccountConfirmText"
            outlined
            label="Type DELETE to confirm"
            :rules="[(val) => String(val || '').trim().toUpperCase() === 'DELETE' || 'Type DELETE to confirm']"
          />
        </q-card-section>
        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat color="grey-7" label="Cancel" :disable="deletingAccount" v-close-popup />
          <q-btn
            color="negative"
            label="Submit Request"
            :loading="deletingAccount"
            :disable="deleteAccountConfirmText.trim().toUpperCase() !== 'DELETE'"
            @click="submitAccountDeletionRequest"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Notify } from 'quasar'
import { useUserDataStore } from 'src/stores/userDataStore'
import { resolveSpSlug } from 'src/utils/spPosts'
import { requestAccountDeletion } from 'src/services/accountPrivacy'
import { billingApi } from 'src/services/webApiClient'

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
const showDeleteAccountDialog = ref(false)
const deletingAccount = ref(false)
const deleteAccountConfirmText = ref('')
const deleteAccountReason = ref('')
const billingUsage = ref({})
const contactForm = ref({
  contact: '',
  email: '',
  phone: '',
  address: '',
})

const numberFormatter = new Intl.NumberFormat('en-US')
const formatStorage = (mb) => {
  const value = Number(mb || 0)
  if (value >= 1024) return `${(value / 1024).toFixed(1)} GB`
  return `${Math.round(value)} MB`
}

const aiTokensUsed = computed(() => Number(billingUsage.value.ai_tokens_used || 0))
const aiTokensLimit = computed(() => Math.max(1, Number(billingUsage.value.ai_tokens_limit || 0)))
const aiTokensRatio = computed(() => Math.min(1, aiTokensUsed.value / aiTokensLimit.value))
const aiTokensRemaining = computed(() => Math.max(0, aiTokensLimit.value - aiTokensUsed.value))
const aiTokensStatus = computed(() => {
  if (aiTokensRatio.value >= 1) return 'blocked'
  if (aiTokensRatio.value >= 0.8) return 'warning'
  return 'normal'
})
const aiTokensStatusLabel = computed(() => {
  if (aiTokensStatus.value === 'blocked') return 'limit reached'
  if (aiTokensStatus.value === 'warning') return 'nearing limit'
  return 'normal'
})
const aiTokensUsedDisplay = computed(() => numberFormatter.format(aiTokensUsed.value))
const aiTokensLimitDisplay = computed(() => numberFormatter.format(aiTokensLimit.value))
const aiTokensRemainingDisplay = computed(() => numberFormatter.format(aiTokensRemaining.value))
const aiTokensMessage = computed(() => String(billingUsage.value.ai_tokens_message || '').trim())

const storageUsedMb = computed(() => Number(billingUsage.value.storage_used_mb || 0))
const storageLimitMb = computed(() => Math.max(1, Number(billingUsage.value.storage_limit_mb || 0)))
const storageRatio = computed(() => Math.min(1, storageUsedMb.value / storageLimitMb.value))
const storageRemainingMb = computed(() => Math.max(0, storageLimitMb.value - storageUsedMb.value))
const storageStatus = computed(() => {
  if (storageRatio.value >= 1) return 'blocked'
  if (storageRatio.value >= 0.8) return 'warning'
  return 'normal'
})
const storageStatusLabel = computed(() => {
  if (storageStatus.value === 'blocked') return 'limit reached'
  if (storageStatus.value === 'warning') return 'nearing limit'
  return 'normal'
})
const storageUsedDisplay = computed(() => formatStorage(storageUsedMb.value))
const storageLimitDisplay = computed(() => formatStorage(storageLimitMb.value))
const storageRemainingDisplay = computed(() => formatStorage(storageRemainingMb.value))
const storageMessage = computed(() => String(billingUsage.value.storage_message || '').trim())

const quotaColor = (status) => {
  if (status === 'blocked') return 'negative'
  if (status === 'warning') return 'warning'
  return 'primary'
}

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

const loadBillingUsage = async () => {
  try {
    billingUsage.value = await billingApi.getUsage()
  } catch (error) {
    console.warn('Failed to load billing usage for SP profile:', error)
    billingUsage.value = {}
  }
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

const openDeleteAccountDialog = () => {
  deleteAccountConfirmText.value = ''
  deleteAccountReason.value = ''
  showDeleteAccountDialog.value = true
}

const submitAccountDeletionRequest = async () => {
  if (deleteAccountConfirmText.value.trim().toUpperCase() !== 'DELETE') return
  try {
    deletingAccount.value = true
    await requestAccountDeletion({
      userId: userStore.user?.uid || userStore.userId,
      email: userStore.userProfile?.email || userStore.user?.email || '',
      accountType: userStore.userProfile?.account_type || userStore.userProfile?.user_category || 'sp',
      source: 'web_sp_profile',
      reason: deleteAccountReason.value,
    })
    await userStore.loadUserProfile()
    showDeleteAccountDialog.value = false
    Notify.create({
      type: 'positive',
      message: 'Account deletion request submitted.',
      caption: 'Support will review active SP obligations before closure.',
      position: 'top',
    })
  } catch (error) {
    Notify.create({
      type: 'negative',
      message: error.message || 'Failed to submit account deletion request.',
      position: 'top',
    })
  } finally {
    deletingAccount.value = false
  }
}

const openPublicShowcase = () => {
  if (!userStore.userId) return
  const slug = resolveSpSlug(userStore.userProfile || {}, userStore.userId)
  window.open(`/public/handout/${slug}`, '_blank', 'noopener,noreferrer')
}

const goBack = () => {
  if (window.history.length > 1) {
    router.back()
    return
  }
  router.push('/sp-dashboard')
}

onMounted(() => {
  hydrateForm()
  loadBillingUsage()
})
</script>

<style scoped>
.sp-profile-card {
  border-radius: var(--border-radius-card);
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
  border-radius: var(--border-radius-sm);
  padding: 8px;
}

.account-value-edit {
  color: var(--primary-color);
}

.delete-account-dialog {
  width: min(560px, 92vw);
  border-radius: var(--border-radius-card);
}

.quota-card {
  padding: 12px 14px;
  border: 1px solid var(--neutral-200);
  border-radius: var(--border-radius-sm);
  background: #fff;
}

.quota-card + .quota-card {
  margin-top: 12px;
}

.quota-card--warning {
  border-color: rgba(245, 158, 11, 0.35);
}

.quota-card--blocked {
  border-color: rgba(220, 38, 38, 0.35);
}

.quota-card-head,
.quota-card-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.quota-status-copy {
  font-size: 12px;
  color: var(--neutral-500);
  text-transform: capitalize;
}

.quota-usage-copy {
  font-size: 13px;
  font-weight: 600;
  color: var(--neutral-700);
}

.quota-card-foot {
  font-size: 12px;
  color: var(--neutral-500);
}

.quota-message {
  margin-top: 8px;
  font-size: 12px;
  line-height: 1.45;
}
</style>
