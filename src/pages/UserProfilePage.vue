<template>
  <q-page class="profile-page q-pa-sm">
    <div class="profile-container">
      <q-card class="profile-topbar q-mb-sm">
        <q-card-section class="q-pa-sm">
          <div class="row items-center q-col-gutter-sm">
            <div class="col-auto">
              <q-avatar size="52px" color="primary" text-color="white">
                <q-icon name="person" size="26px" />
              </q-avatar>
            </div>
            <div class="col">
              <div class="row items-center q-col-gutter-sm">
                <div class="col-auto">
                  <div class="text-h6 text-weight-bold">{{ displayName }}</div>
                </div>
                <div class="col-auto">
                  <q-chip dense color="primary" text-color="white" class="text-caption">
                    {{ accountTypeLabel }}
                  </q-chip>
                </div>
              </div>

              <div class="text-caption text-grey-7">
                {{ isSpAccount ? (businessName || 'Business Profile') : 'Property Management Profile' }}
              </div>
            </div>
            <div class="col-12 col-lg-auto">
              <div class="row q-col-gutter-xs justify-end topbar-actions">
                <div class="col-auto">
                  <q-btn
                    outline
                    color="primary"
                    size="sm"
                    icon="edit"
                    label="Edit Contact"
                    @click="openContactEditDialog('phone')"
                  />
                </div>
                <div class="col-auto">
                  <q-btn
                    outline
                    color="primary"
                    size="sm"
                    icon="receipt_long"
                    label="Billing"
                    @click="openBillingHistory"
                  />
                </div>
                <div class="col-auto">
                  <q-btn
                    outline
                    color="primary"
                    size="sm"
                    icon="support_agent"
                    label="Support"
                    @click="openSupport"
                  />
                </div>

                <div class="col-auto">
                  <q-btn
                    class="full-width"
                    outline
                    color="primary"
                    size="sm"
                    label="Payment Method"
                    @click="openPaymentMethod"
                  />
                </div>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <div class="row q-col-gutter-sm profile-main-row">
        <div class="col-12 col-lg-4">
          <q-card class="section-card panel-card">
            <q-card-section class="q-pa-sm">
              <div class="section-title q-mb-sm">Account</div>
              <div class="compact-grid q-mb-sm">
                <div class="info-cell">
                  <span class="cell-label">Email</span>
                  <strong>{{ userProfile?.email || 'No email' }}</strong>
                </div>
                <div class="info-cell">
                  <span class="cell-label">{{ isSpAccount ? 'Business' : 'Company' }}</span>
                  <button class="info-editable" type="button" @click="openContactEditDialog('company')">
                    {{ (isSpAccount ? businessName : companyDisplay) || 'Not set' }}
                  </button>
                </div>
                <div class="info-cell">
                  <span class="cell-label">Phone</span>
                  <button class="info-editable" type="button" @click="openContactEditDialog('phone')">
                    {{ phoneDisplay }}
                  </button>
                </div>
                <div class="info-cell">
                  <span class="cell-label">Address</span>
                  <button class="info-editable" type="button" @click="openContactEditDialog('address')">
                    {{ addressDisplay }}
                  </button>
                </div>
              </div>

              <q-separator class="q-my-sm" />
              <div class="section-title q-mb-sm">Role Context</div>
              <q-banner v-if="!propertyContextOptions.length" dense rounded class="bg-blue-1 text-primary q-mb-sm">
                No property role assignments found.
              </q-banner>
              <div v-else class="role-chip-wrap">
                <q-chip
                  v-for="item in propertyContextOptions"
                  :key="item.value"
                  color="blue-1"
                  text-color="primary"
                >
                  {{ item.propertyName }} • {{ formatRoleCodes(item.roleCodes) }}
                </q-chip>
              </div>
              <div class="text-caption text-grey-7 q-mt-sm">
                Role tags show all assignments per property.
              </div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-lg-4">
          <q-card class="section-card panel-card">
            <q-card-section class="q-pa-sm">
              <div class="section-title q-mb-sm">Usage Quotas</div>

              <div class="quota-card q-mb-sm">
                <div class="row items-center justify-between q-mb-xs">
                  <div class="text-subtitle2">AI Tokens</div>
                  <div class="text-caption text-grey-7">{{ aiTokensUsedDisplay }} / {{ aiTokensLimitDisplay }}</div>
                </div>
                <q-linear-progress rounded size="8px" :value="aiTokensRatio" :color="ratioColor(aiTokensRatio)" />
                <div class="row items-center justify-between q-mt-xs">
                  <div class="text-caption text-grey-7">{{ aiTokensRemainingDisplay }} left this month</div>
                  <q-btn outline color="primary" size="sm" label="Buy Tokens" @click="buyAddon('ai_tokens_pack')" />
                </div>
              </div>

              <div class="quota-card">
                <div class="row items-center justify-between q-mb-xs">
                  <div class="text-subtitle2">Storage</div>
                  <div class="text-caption text-grey-7">{{ storageUsedGb }} / {{ storageLimitGb }} GB</div>
                </div>
                <q-linear-progress rounded size="8px" :value="storageRatio" :color="ratioColor(storageRatio)" />
                <div class="row items-center justify-between q-mt-xs">
                  <div class="text-caption text-grey-7">{{ Math.round(storageRatio * 100) }}% used</div>
                  <q-btn outline color="primary" size="sm" label="Buy +20GB" @click="buyAddon('storage_20gb')" />
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-lg-4">
          <q-card class="section-card panel-card">
            <q-card-section class="q-pa-sm">
              <div class="section-title q-mb-sm">Settings</div>
              <q-list dense bordered separator class="rounded-borders q-mb-sm">
                <q-item>
                  <q-item-section>
                    <q-item-label>Language</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-item-label caption>EN</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item>
                  <q-item-section>
                    <q-item-label>Notification</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-item-label caption>Basic</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item clickable @click="openDataRequest">
                  <q-item-section>
                    <q-item-label>Privacy Policy</q-item-label>
                    <q-item-label caption>Review how Handout collects and protects data.</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-icon name="open_in_new" size="16px" />
                  </q-item-section>
                </q-item>
                <q-item clickable @click="openDeleteAccountDialog">
                  <q-item-section>
                    <q-item-label class="text-negative">Request Account Deletion</q-item-label>
                    <q-item-label caption>Submit an account closure and deletion request.</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-icon name="delete_forever" color="negative" size="18px" />
                  </q-item-section>
                </q-item>
              </q-list>

              <div class="row q-col-gutter-xs">

              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>

    <q-dialog v-model="showBillingHistoryDialog">
      <q-card style="min-width: 680px; max-width: 90vw">
        <q-card-section class="row items-center justify-between">
          <div class="text-h6">Billing History</div>
          <q-btn icon="close" flat round dense color="primary" v-close-popup />
        </q-card-section>
        <q-separator />
        <q-card-section>
          <div v-if="!billingHistoryRows.length" class="text-center q-pa-md text-grey-7">
            No billing history available yet.
          </div>
          <q-list v-else separator>
            <q-item v-for="row in billingHistoryRows" :key="row.id">
              <q-item-section>
                <q-item-label>{{ row.description }}</q-item-label>
                <q-item-label caption>{{ row.date }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-item-label :class="row.amountClass">{{ row.amount }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showContactEditDialog">
      <q-card style="min-width: 420px; max-width: 90vw">
        <q-card-section class="row items-center justify-between">
          <div class="text-h6">Update Contact Info</div>
          <q-btn icon="close" flat round dense color="primary" v-close-popup />
        </q-card-section>
        <q-separator />
        <q-card-section class="q-pa-md">
          <q-input
            v-model="contactForm.displayName"
            label="Display Name"
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
            v-model="contactForm.companyName"
            label="Company Name"
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

    <q-dialog v-model="showDeleteAccountDialog" persistent>
      <q-card class="delete-account-dialog">
        <q-card-section>
          <div class="text-h6 text-negative">Request Account Deletion</div>
          <p class="text-body2 q-mt-sm q-mb-none">
            This submits a deletion request for your Handout account. Property, lease,
            transaction, and service records may need to be retained or transferred where required
            for legal, accounting, security, or shared-workspace reasons.
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
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { normalizeRoleValue } from '../utils/roleUtils'
import { useUserDataStore } from '../stores/userDataStore'
import { useQuasar } from 'quasar'
import { billingApi } from '../services/webApiClient'
import { requestAccountDeletion } from '../services/accountPrivacy'

const router = useRouter()
const userDataStore = useUserDataStore()
const $q = useQuasar()

const userProfile = computed(() => userDataStore.userProfile || {})
const userRoles = computed(() => userDataStore.userRoles || [])

const accountTypeRaw = computed(() => String(userProfile.value.account_type || '').toLowerCase())
const accountTypeLabel = computed(() => (accountTypeRaw.value || 'unset').toUpperCase())
const isSpAccount = computed(() => accountTypeRaw.value === 'sp' || String(userProfile.value.user_category || '').toLowerCase() === 'sp')
const businessName = computed(
  () =>
    userProfile.value.business_name ||
    userProfile.value.sp_business_name ||
    userProfile.value.company_name ||
    ''
)
const companyDisplay = computed(
  () =>
    userProfile.value.company_name ||
    userProfile.value.business_name ||
    userProfile.value.sp_business_name ||
    userProfile.value.company ||
    ''
)
const phoneDisplay = computed(
  () =>
    userProfile.value.mobile_phone ||
    userProfile.value.cellphone ||
    userProfile.value.phone ||
    'Not set'
)
const addressDisplay = computed(
  () =>
    userProfile.value.registered_business_address ||
    userProfile.value.address ||
    userProfile.value.mailing_address ||
    'Not set'
)
const displayName = computed(
  () =>
    userProfile.value.user_name ||
    [userProfile.value.first_name, userProfile.value.last_name].filter(Boolean).join(' ') ||
    userDataStore.user?.displayName ||
    'User'
)

const mergedPropertyRoles = computed(() => {
  const profileRoles = Array.isArray(userProfile.value.property_roles) ? userProfile.value.property_roles : []
  if (profileRoles.length) return profileRoles
  return userRoles.value
})

const normalizeRoleCode = (role) => {
  const normalized = normalizeRoleValue(role)
  if (normalized === 'pm') return 'PM'
  if (normalized === 'po') return 'PO'
  if (normalized === 'tt') return 'TT'
  if (normalized === 'sp') return 'SP'
  if (normalized === 'admin') return 'ADMIN'
  return 'N/A'
}

const formatRoleCodes = (codes = []) => {
  const roleOrder = ['PM', 'PO', 'TT', 'SP', 'ADMIN', 'N/A']
  const set = new Set((Array.isArray(codes) ? codes : []).filter(Boolean))
  return roleOrder.filter((code) => set.has(code)).join('/') || 'N/A'
}

const propertyContextOptions = computed(() => {
  const grouped = new Map()

  for (const entry of mergedPropertyRoles.value) {
    const propertyId = entry.property_id || entry.propertyId || entry.id
    if (!propertyId) continue
    const key = String(propertyId)
    const property = userDataStore.getPropertyById(propertyId)
    const propertyName = property?.nickname || property?.address || 'Unknown Property'
    const roleCode = normalizeRoleCode(entry.role)

    if (!grouped.has(key)) {
      grouped.set(key, {
        value: key,
        label: propertyName,
        propertyName,
        roleCodes: [],
        raw: [],
      })
    }

    const current = grouped.get(key)
    if (!current.roleCodes.includes(roleCode)) {
      current.roleCodes.push(roleCode)
    }
    current.raw.push(entry)
  }

  return Array.from(grouped.values()).map((item) => ({
    ...item,
    label: `${item.propertyName} • ${item.roleCodes.join(' + ')}`,
  }))
})

const billingLoading = ref(false)
const billingSummary = ref({})
const billingUsage = ref({})
const billingCredits = ref({})
const billingHistory = ref([])

const pickUsageNumber = (keys = []) => {
  for (const key of keys) {
    const value = Number(billingUsage.value?.[key])
    if (Number.isFinite(value) && value >= 0) return value
  }
  return 0
}

const numberFormatter = new Intl.NumberFormat('en-US')

const aiTokensUsed = computed(() =>
  pickUsageNumber(['ai_tokens_used', 'ai_token_used', 'tokens_used', 'token_used', 'voice_used'])
)
const aiTokensLimitRaw = computed(() =>
  pickUsageNumber(['ai_tokens_limit', 'ai_token_limit', 'tokens_limit', 'token_limit', 'voice_limit'])
)
const aiTokensLimit = computed(() => Math.max(1, aiTokensLimitRaw.value))
const aiTokensRatio = computed(() => Math.min(1, aiTokensUsed.value / aiTokensLimit.value))
const aiTokensRemaining = computed(() => Math.max(0, aiTokensLimitRaw.value - aiTokensUsed.value))
const aiTokensUsedDisplay = computed(() => numberFormatter.format(aiTokensUsed.value))
const aiTokensLimitDisplay = computed(() => numberFormatter.format(aiTokensLimitRaw.value))
const aiTokensRemainingDisplay = computed(() => numberFormatter.format(aiTokensRemaining.value))

const storageUsedMb = computed(() => Number(billingUsage.value.storage_used_mb || 0))
const storageLimitMb = computed(() => Math.max(1, Number(billingUsage.value.storage_limit_mb || 0)))
const storageRatio = computed(() => Math.min(1, storageUsedMb.value / storageLimitMb.value))
const storageUsedGb = computed(() => (storageUsedMb.value / 1024).toFixed(1))
const storageLimitGb = computed(() => (storageLimitMb.value / 1024).toFixed(1))

const billingHistoryRows = computed(() =>
  (billingHistory.value || []).map((item, index) => {
    const amountNum = Number(item.amount || 0)
    const signed = amountNum >= 0 ? `+${amountNum}` : `${amountNum}`
    return {
      id: item.id || `history-row-${index}`,
      description: item.description || item.type || 'Billing record',
      date: formatDate(item.created_at || item.date || item.timestamp),
      amount: item.amount !== undefined && item.amount !== null ? signed : '-',
      amountClass: amountNum > 0 ? 'text-positive' : amountNum < 0 ? 'text-negative' : 'text-grey-7',
    }
  })
)

const showBillingHistoryDialog = ref(false)
const showContactEditDialog = ref(false)
const savingContact = ref(false)
const showDeleteAccountDialog = ref(false)
const deletingAccount = ref(false)
const deleteAccountConfirmText = ref('')
const deleteAccountReason = ref('')
const contactForm = ref({
  displayName: '',
  phone: '',
  companyName: '',
  address: '',
})

const ratioColor = (ratio) => {
  if (ratio >= 1) return 'negative'
  if (ratio >= 0.8) return 'warning'
  return 'primary'
}

const formatDate = (date) => {
  if (!date) return 'Not set'
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return String(date)
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

const loadBillingData = async () => {
  billingLoading.value = true
  try {
    const [summary, usage, credits, history] = await Promise.all([
      billingApi.getProfileSummary(),
      billingApi.getUsage(),
      billingApi.getCredits(),
      billingApi.getHistory(),
    ])
    billingSummary.value = summary || {}
    billingUsage.value = usage || {}
    billingCredits.value = credits || {}
    billingHistory.value = history?.items || []
  } catch (error) {
    console.error('Failed to load billing data:', error)
    $q.notify({
      type: 'warning',
      message: 'Billing data unavailable. Using fallback values.',
      position: 'top',
    })
  } finally {
    billingLoading.value = false
  }
}

const notifyApiError = (error, fallbackMessage) => {
  $q.notify({
    type: 'negative',
    message: error?.message || fallbackMessage,
    caption: error?.upgrade_hint || '',
    position: 'top',
  })
}


const openBillingHistory = () => {
  showBillingHistoryDialog.value = true
}

const openPaymentMethod = () => {
  $q.notify({ type: 'info', message: 'Payment method setup is reserved for a later phase.', position: 'top' })
}

const openSupport = () => {
  window.location.assign('/contact-support')
}

const openDataRequest = () => {
  window.location.assign('/privacy')
}

const openDeleteAccountDialog = () => {
  deleteAccountConfirmText.value = ''
  deleteAccountReason.value = ''
  showDeleteAccountDialog.value = true
}

const buyAddon = (addonKey) => {
  const addonMap = {
    ai_tokens_pack: 'AI Token Pack',
    storage_20gb: 'Storage Pack',
  }
  const addonLabel = addonMap[addonKey] || 'Addon'
  $q.notify({
    type: 'info',
    message: `${addonLabel} checkout will be enabled in a later phase.`,
    position: 'top',
  })
}

const openContactEditDialog = (focusField) => {
  contactForm.value = {
    displayName:
      userProfile.value.user_name ||
      [userProfile.value.first_name, userProfile.value.last_name].filter(Boolean).join(' ') ||
      userDataStore.user?.displayName ||
      '',
    phone:
      userProfile.value.mobile_phone ||
      userProfile.value.cellphone ||
      userProfile.value.phone ||
      '',
    companyName:
      userProfile.value.company_name ||
      userProfile.value.business_name ||
      userProfile.value.sp_business_name ||
      userProfile.value.company ||
      '',
    address:
      userProfile.value.registered_business_address ||
      userProfile.value.address ||
      userProfile.value.mailing_address ||
      '',
  }
  showContactEditDialog.value = true
  const fieldToIndex = { name: 0, phone: 1, company: 2, address: 3 }
  const targetIndex = fieldToIndex[focusField] ?? 0
  setTimeout(() => {
    const inputs = document.querySelectorAll('.q-dialog input, .q-dialog textarea')
    const target = inputs[targetIndex] || inputs[0]
    target?.focus?.()
  }, 50)
}

const saveContactInfo = async () => {
  try {
    savingContact.value = true
    const displayNameInput = String(contactForm.value.displayName || '').trim()
    const phone = String(contactForm.value.phone || '').trim()
    const companyName = String(contactForm.value.companyName || '').trim()
    const address = String(contactForm.value.address || '').trim()
    const nameParts = displayNameInput ? displayNameInput.split(/\s+/).filter(Boolean) : []
    const firstName = nameParts.length ? nameParts[0] : ''
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : ''
    const profilePayload = {
      user_name: displayNameInput,
      first_name: firstName,
      last_name: lastName,
      phone,
      mobile_phone: phone,
      registered_business_address: address,
      address,
      company_name: companyName,
      company: companyName,
    }
    if (isSpAccount.value) {
      profilePayload.business_name = companyName
      profilePayload.sp_business_name = companyName
    }
    await userDataStore.updateUserProfile({
      ...profilePayload,
    })
    showContactEditDialog.value = false
  } catch (error) {
    notifyApiError(error, 'Unable to update contact info.')
  } finally {
    savingContact.value = false
  }
}

const submitAccountDeletionRequest = async () => {
  if (deleteAccountConfirmText.value.trim().toUpperCase() !== 'DELETE') return
  try {
    deletingAccount.value = true
    await requestAccountDeletion({
      userId: userDataStore.user?.uid || userProfile.value.id,
      email: userProfile.value.email || userDataStore.user?.email || '',
      accountType: userProfile.value.account_type || userProfile.value.user_category || '',
      source: 'web_profile',
      reason: deleteAccountReason.value,
    })
    await userDataStore.loadUserProfile()
    showDeleteAccountDialog.value = false
    $q.notify({
      type: 'positive',
      message: 'Account deletion request submitted.',
      caption: 'Support will review retention and shared-workspace obligations before closure.',
      position: 'top',
    })
  } catch (error) {
    notifyApiError(error, 'Unable to submit account deletion request.')
  } finally {
    deletingAccount.value = false
  }
}

onMounted(async () => {
  if (!userDataStore.isAuthenticated) {
    router.push('/public/login')
    return
  }
  await loadBillingData()
})
</script>

<style scoped>
.profile-container {
  max-width: 1600px;
  margin: 0 auto;
}

.profile-page :deep(.q-card__section.q-pa-sm) {
  padding: 10px !important;
}

.profile-page :deep(.q-card__section.q-pa-md) {
  padding: 12px !important;
}

.profile-topbar {
  border-radius: var(--border-radius-card);
  border: 1px solid var(--neutral-200);
  background: linear-gradient(120deg, var(--bg-secondary) 0%, var(--bg-surface) 100%);
}

.topbar-subline {
  color: var(--neutral-700);
}

.topbar-actions :deep(.q-btn) {
  min-height: 30px;
  padding: 0 10px;
  border-radius: var(--border-radius-sm);
}

.section-card {
  border-radius: var(--border-radius-card);
  border: 1px solid var(--neutral-200);
  background: var(--bg-surface);
}

.profile-main-row {
  align-items: stretch;
}

.panel-card {
  height: 100%;
  min-height: 360px;
}

.section-title {
  font-size: 0.95rem;
  font-weight: 700;
  letter-spacing: 0.01em;
  color: var(--neutral-900);
}

.compact-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.info-cell {
  border: 1px solid var(--neutral-200);
  border-radius: var(--border-radius-sm);
  background: var(--bg-secondary);
  padding: 8px 10px;
  min-height: 64px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 3px;
}

.cell-label {
  font-size: 0.68rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--neutral-600);
}

.info-editable {
  background: none;
  border: none;
  padding: 0;
  font: inherit;
  color: var(--primary-color);
  cursor: pointer;
  text-align: left;
  font-weight: 600;
  line-height: 1.3;
}

.info-editable:hover {
  text-decoration: underline;
}

.info-cell strong {
  font-size: 0.85rem;
  line-height: 1.3;
  color: var(--neutral-900);
}

.quota-card {
  border: 1px solid var(--neutral-200);
  border-radius: var(--border-radius-sm);
  padding: 8px 10px;
  background: var(--bg-secondary);
}

.quota-card :deep(.q-btn) {
  min-height: 26px;
  padding: 0 8px;
  font-size: 0.72rem;
  border-radius: 7px;
}

.role-chip-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  max-height: 142px;
  overflow: auto;
  padding-right: 2px;
}

.role-chip-wrap :deep(.q-chip) {
  margin: 0;
  height: 26px;
  font-size: 0.72rem;
}

.panel-card :deep(.q-list .q-item) {
  min-height: 34px;
}

.panel-card :deep(.q-item__label) {
  font-size: 0.84rem;
}

.panel-card :deep(.q-item__label--caption) {
  font-size: 0.72rem;
}

@media (min-width: 1200px) {
  .profile-main-row {
    min-height: calc(100vh - 190px);
  }

  .panel-card {
    min-height: 0;
  }
}

@media (max-width: 1199px) {
  .panel-card {
    min-height: auto;
  }
}

@media (max-width: 680px) {
  .compact-grid {
    grid-template-columns: 1fr;
  }

  .topbar-actions {
    justify-content: flex-start;
  }
}

:global(body.body--dark) .section-card {
  border-color: var(--neutral-300) !important;
}

:global(body.body--dark) .profile-topbar {
  border-color: var(--neutral-300) !important;
  background: linear-gradient(120deg, #1a2230 0%, var(--bg-surface) 100%);
}

:global(body.body--dark) .info-cell {
  border-color: var(--neutral-300);
  background: var(--bg-tertiary);
}

:global(body.body--dark) .quota-card {
  border-color: var(--neutral-300);
  background: var(--bg-tertiary);
}

.delete-account-dialog {
  width: min(560px, 92vw);
  border-radius: var(--border-radius-card);
}
</style>
