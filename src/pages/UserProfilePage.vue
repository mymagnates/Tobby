<template>
  <q-page class="profile-page q-pa-sm">
    <div class="profile-container">
      <q-card class="profile-hero q-mb-sm">
        <q-card-section class="q-pa-md">
          <div class="row items-center justify-between">
            <div>
              <div class="text-h5 text-weight-bold text-white">Profile</div>
              <div class="text-body2 hero-subtitle">Account, role context, plan, and billing controls</div>
            </div>
            <q-chip dense color="white" text-color="primary">
              {{ accountTypeLabel }}
            </q-chip>
          </div>
        </q-card-section>
      </q-card>

      <div class="row q-col-gutter-sm">
        <div class="col-12 col-xl-4">
          <q-card class="section-card q-mb-sm">
            <q-card-section class="q-pa-md">
              <div class="text-h6 q-mb-md">Account</div>
              <div class="row items-center q-col-gutter-sm q-mb-md">
                <div class="col-auto">
                  <q-avatar size="56px" color="primary" text-color="white">
                    <q-icon name="person" size="30px" />
                  </q-avatar>
                </div>
                <div class="col">
                  <div class="text-subtitle1 text-weight-medium">{{ displayName }}</div>
                  <div class="text-body2 text-grey-7">{{ userProfile?.email || 'No email' }}</div>
                </div>
              </div>

              <div class="info-row">
                <span>Account Type</span>
                <strong>{{ accountTypeLabel }}</strong>
              </div>
              <div class="info-row">
                <span>Primary Role</span>
                <strong>{{ primaryRoleLabel }}</strong>
              </div>
              <div class="info-row">
                <span>Phone</span>
                <strong>{{ userProfile?.mobile_phone || userProfile?.cellphone || 'Not set' }}</strong>
              </div>
            </q-card-section>
          </q-card>

          <q-card class="section-card q-mb-sm">
            <q-card-section class="q-pa-md">
              <div class="text-h6 q-mb-md">Role Context</div>
              <q-select
                v-if="propertyContextOptions.length"
                v-model="activePropertyId"
                :options="propertyContextOptions"
                option-label="label"
                option-value="value"
                emit-value
                map-options
                outlined
                dense
                label="Active Property"
                class="q-mb-md"
              />
              <q-banner v-else dense rounded class="bg-blue-1 text-primary q-mb-md">
                No property role assignments found.
              </q-banner>

              <div class="row q-gutter-sm q-mb-md">
                <q-chip
                  v-if="selectedRoleEntry"
                  color="primary"
                  text-color="white"
                  :label="selectedRoleEntry.roleCode"
                />
                <q-chip v-if="selectedRoleEntry" color="blue-1" text-color="primary">
                  {{ selectedRoleEntry.propertyName }}
                </q-chip>
              </div>

              <div class="text-caption text-grey-7">
                Permissions are evaluated by current active property and property role.
              </div>
            </q-card-section>
          </q-card>

          <q-card class="section-card">
            <q-card-section class="q-pa-md">
              <div class="text-h6 q-mb-md">Settings</div>
              <q-list bordered separator class="rounded-borders">
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
                    <q-item-label>Privacy / Data Request</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-icon name="open_in_new" size="18px" />
                  </q-item-section>
                </q-item>
              </q-list>

              <div class="row q-col-gutter-sm q-mt-md">
                <div class="col-6">
                  <q-btn
                    class="full-width"
                    outline
                    color="primary"
                    label="Support"
                    @click="openSupport"
                  />
                </div>
                <div class="col-6">
                  <q-btn
                    class="full-width"
                    outline
                    color="negative"
                    label="Sign Out"
                    :loading="logoutLoading"
                    @click="handleSignOut"
                  />
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-xl-8">
          <q-card class="section-card q-mb-sm">
            <q-card-section class="q-pa-md">
              <div class="row items-start justify-between">
                <div>
                  <div class="text-h6">Plan</div>
                  <div class="text-caption text-grey-7">Server-enforced feature gates and usage quotas</div>
                </div>
                <div class="plan-status">
                  <q-badge :color="subscriptionStatusColor" class="q-mr-xs">
                    {{ subscriptionStatusLabel }}
                  </q-badge>
                </div>
              </div>

              <div v-if="billingLoading" class="text-center q-py-lg">
                <q-spinner-dots size="36px" color="primary" />
              </div>

              <div v-else class="row q-col-gutter-md q-mt-sm">
                <div class="col-12 col-lg-7">
                  <div class="plan-name">{{ currentPlanName }}</div>
                  <div class="text-body2 text-grey-7 q-mb-md">
                    Renews on {{ formatDate(billingSummary.next_renewal_date) }}
                  </div>
                </div>
                <div class="col-12 col-lg-5">
                  <q-btn
                    class="full-width q-mb-sm"
                    color="primary"
                    unelevated
                    label="Upgrade Plan"
                    @click="upgradePlan"
                  />
                  <q-btn
                    class="full-width"
                    outline
                    color="primary"
                    label="Compare Plans"
                    @click="comparePlans"
                  />
                </div>
              </div>
            </q-card-section>
          </q-card>

          <div class="row q-col-gutter-sm q-mb-sm">
            <div class="col-12 col-lg-8">
              <q-card class="section-card fill-height">
                <q-card-section class="q-pa-md">
                  <div class="text-h6 q-mb-md">Usage Quotas</div>

                  <div class="quota-card q-mb-md">
                    <div class="row items-center justify-between q-mb-xs">
                      <div class="text-subtitle2">Properties</div>
                      <div class="text-caption text-grey-7">{{ propertyUsed }} / {{ propertyLimit }}</div>
                    </div>
                    <q-linear-progress rounded size="10px" :value="propertyRatio" :color="ratioColor(propertyRatio)" />
                    <div class="row items-center justify-between q-mt-sm">
                      <div class="text-caption text-grey-7">{{ Math.round(propertyRatio * 100) }}% used</div>
                      <q-btn outline color="primary" size="sm" label="+10" @click="buyAddon('extra_properties')" />
                    </div>
                  </div>

                  <div class="quota-card q-mb-md">
                    <div class="row items-center justify-between q-mb-xs">
                      <div class="text-subtitle2">Voice Fill</div>
                      <div class="text-caption text-grey-7">{{ voiceUsed }} / {{ voiceLimit }}</div>
                    </div>
                    <q-linear-progress rounded size="10px" :value="voiceRatio" :color="ratioColor(voiceRatio)" />
                    <div class="row items-center justify-between q-mt-sm">
                      <div class="text-caption text-grey-7">{{ voiceRemaining }} left this month</div>
                      <q-btn outline color="primary" size="sm" label="Buy Pack" @click="buyAddon('voice_pack_50')" />
                    </div>
                  </div>

                  <div class="quota-card">
                    <div class="row items-center justify-between q-mb-xs">
                      <div class="text-subtitle2">Storage</div>
                      <div class="text-caption text-grey-7">{{ storageUsedGb }} / {{ storageLimitGb }} GB</div>
                    </div>
                    <q-linear-progress rounded size="10px" :value="storageRatio" :color="ratioColor(storageRatio)" />
                    <div class="row items-center justify-between q-mt-sm">
                      <div class="text-caption text-grey-7">{{ Math.round(storageRatio * 100) }}% used</div>
                      <q-btn outline color="primary" size="sm" label="Buy +20GB" @click="buyAddon('storage_20gb')" />
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <div class="col-12 col-lg-4">
              <q-card class="wallet-card fill-height">
                <q-card-section class="q-pa-md">
                  <div class="text-h6 text-white">Credit Wallet</div>
                  <div class="text-caption wallet-subtitle">Available credits</div>
                  <div class="wallet-balance">{{ creditBalance }}</div>

                  <q-list dense class="wallet-activity q-mt-sm">
                    <q-item v-for="item in recentBillingActivity" :key="item.id" class="q-pa-none q-mb-xs">
                      <q-item-section>
                        <q-item-label class="text-white text-caption">{{ item.label }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-list>

                  <div class="row q-col-gutter-sm q-mt-md">
                    <div class="col-6">
                      <q-btn class="full-width wallet-btn" label="Top Up" @click="topUpCredits" />
                    </div>
                    <div class="col-6">
                      <q-btn class="full-width wallet-btn-outline" outline label="History" @click="openBillingHistory" />
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>

          <q-card class="section-card">
            <q-card-section class="q-pa-md">
              <div class="text-h6 q-mb-md">Billing Actions</div>
              <div class="row q-col-gutter-sm">
                <div class="col-12 col-md-4">
                  <q-btn class="full-width" outline color="primary" label="Billing History" @click="openBillingHistory" />
                </div>
                <div class="col-12 col-md-4">
                  <q-btn class="full-width" outline color="primary" label="Invoices" @click="openInvoices" />
                </div>
                <div class="col-12 col-md-4">
                  <q-btn class="full-width" outline color="primary" label="Payment Method" @click="openPaymentMethod" />
                </div>
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
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUserDataStore } from '../stores/userDataStore'
import { useQuasar } from 'quasar'
import { billingApi } from '../services/webApiClient'
import { useFirebase } from '../composables/useFirebase'

const router = useRouter()
const userDataStore = useUserDataStore()
const $q = useQuasar()
const { logout, loading: firebaseLoading } = useFirebase()

const userProfile = computed(() => userDataStore.userProfile || {})
const userRoles = computed(() => userDataStore.userRoles || [])

const accountTypeRaw = computed(() => String(userProfile.value.account_type || '').toUpperCase())
const accountTypeLabel = computed(() => accountTypeRaw.value || 'UNSET')
const primaryRoleLabel = computed(() => userProfile.value.primary_role || userProfile.value.user_category || 'N/A')
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
  const value = String(role || '').toUpperCase().trim()
  if (value === 'PROPERTY OWNER' || value === 'OWNER' || value === 'PO') return 'PO'
  if (value === 'PROPERTY MANAGER' || value === 'MANAGER' || value === 'PM') return 'PM'
  return value || 'N/A'
}

const propertyContextOptions = computed(() =>
  mergedPropertyRoles.value
    .map((entry) => {
      const propertyId = entry.property_id || entry.propertyId || entry.id
      if (!propertyId) return null
      const property = userDataStore.getPropertyById(propertyId)
      const propertyName = property?.nickname || property?.address || 'Unknown Property'
      const roleCode = normalizeRoleCode(entry.role)
      return {
        value: String(propertyId),
        label: `${propertyName} • ${roleCode}`,
        roleCode,
        propertyName,
        raw: entry,
      }
    })
    .filter(Boolean)
)

const activePropertyId = ref('')
const syncingActiveProperty = ref(false)
const selectedRoleEntry = computed(
  () => propertyContextOptions.value.find((item) => item.value === activePropertyId.value) || null
)

watch(
  propertyContextOptions,
  (options) => {
    if (!options.length) {
      activePropertyId.value = ''
      return
    }
    const preferred = String(userProfile.value.active_property_id || '')
    const hasPreferred = preferred && options.some((item) => item.value === preferred)
    activePropertyId.value = hasPreferred ? preferred : options[0].value
  },
  { immediate: true }
)

watch(activePropertyId, async (value, previous) => {
  if (!value || value === previous || syncingActiveProperty.value) return
  const current = String(userProfile.value.active_property_id || '')
  if (current === value) return
  try {
    syncingActiveProperty.value = true
    await userDataStore.updateUserProfile({ active_property_id: value })
  } catch (error) {
    console.error('Failed to persist active property context:', error)
    $q.notify({
      type: 'warning',
      message: 'Unable to save active property context.',
      position: 'top',
    })
  } finally {
    syncingActiveProperty.value = false
  }
})

const billingLoading = ref(false)
const billingSummary = ref({})
const billingUsage = ref({})
const billingCredits = ref({})
const billingHistory = ref([])

const currentPlanName = computed(() => billingSummary.value.plan_name || 'Free')
const subscriptionStatusLabel = computed(() => (billingSummary.value.subscription_status || 'inactive').toUpperCase())
const subscriptionStatusColor = computed(() => {
  const status = String(billingSummary.value.subscription_status || 'inactive').toLowerCase()
  if (status === 'active') return 'positive'
  if (status === 'trialing') return 'warning'
  return 'grey'
})

const propertyUsed = computed(() => Number(billingUsage.value.properties_used || 0))
const propertyLimit = computed(() => Math.max(1, Number(billingUsage.value.properties_limit || 0)))
const propertyRatio = computed(() => Math.min(1, propertyUsed.value / propertyLimit.value))

const voiceUsed = computed(() => Number(billingUsage.value.voice_used || 0))
const voiceLimit = computed(() => Math.max(1, Number(billingUsage.value.voice_limit || 0)))
const voiceRatio = computed(() => Math.min(1, voiceUsed.value / voiceLimit.value))
const voiceRemaining = computed(() => Math.max(0, voiceLimit.value - voiceUsed.value))

const storageUsedMb = computed(() => Number(billingUsage.value.storage_used_mb || 0))
const storageLimitMb = computed(() => Math.max(1, Number(billingUsage.value.storage_limit_mb || 0)))
const storageRatio = computed(() => Math.min(1, storageUsedMb.value / storageLimitMb.value))
const storageUsedGb = computed(() => (storageUsedMb.value / 1024).toFixed(1))
const storageLimitGb = computed(() => (storageLimitMb.value / 1024).toFixed(1))

const creditBalance = computed(() => Number(billingCredits.value.balance || 0).toLocaleString())
const recentBillingActivity = computed(() => {
  if (!billingHistory.value.length) {
    return [
      { id: 'placeholder-1', label: 'No recent billing activity' },
      { id: 'placeholder-2', label: 'Credits and purchases will appear here' },
    ]
  }
  return billingHistory.value.slice(0, 3).map((item, index) => ({
    id: item.id || `history-${index}`,
    label: item.description || item.type || 'Billing record',
  }))
})
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

const logoutLoading = computed(() => Boolean(firebaseLoading.value))

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

const upgradePlan = async () => {
  try {
    await billingApi.upgrade({ target_plan: 'pro' })
    $q.notify({ type: 'positive', message: 'Upgrade request submitted.', position: 'top' })
    await loadBillingData()
  } catch (error) {
    notifyApiError(error, 'Unable to upgrade plan.')
  }
}

const buyAddon = async (addonCode = 'extra_properties') => {
  try {
    await billingApi.purchaseAddon({ addon_code: addonCode })
    $q.notify({ type: 'positive', message: 'Add-on purchase submitted.', position: 'top' })
    await loadBillingData()
  } catch (error) {
    notifyApiError(error, 'Unable to purchase add-on.')
  }
}

const comparePlans = () => {
  $q.notify({ type: 'info', message: 'Plan comparison modal can be added here.', position: 'top' })
}

const topUpCredits = () => {
  $q.notify({ type: 'info', message: 'Credit top-up flow can be connected here.', position: 'top' })
}

const openBillingHistory = () => {
  showBillingHistoryDialog.value = true
}

const openInvoices = () => {
  router.push('/sp-invoices')
}

const openPaymentMethod = () => {
  $q.notify({ type: 'info', message: 'Payment method setup is reserved for a later phase.', position: 'top' })
}

const openSupport = () => {
  router.push('/public/contact-support')
}

const openDataRequest = () => {
  router.push('/public/privacy')
}

const handleSignOut = async () => {
  try {
    await logout()
    router.push('/public/login')
  } catch (error) {
    notifyApiError(error, 'Unable to sign out.')
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
  max-width: 1640px;
  margin: 0 auto;
}

.profile-hero {
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
  border: 1px solid var(--neutral-200);
  border-radius: 12px;
}

.hero-subtitle {
  color: rgba(255, 255, 255, 0.85);
}

.section-card {
  border-radius: 12px;
  border: 1px solid var(--neutral-200);
  background: var(--bg-surface);
}

.fill-height {
  height: 100%;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid var(--neutral-100);
  font-size: 0.95rem;
}

.info-row:last-child {
  border-bottom: none;
}

.plan-name {
  font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
  font-size: 2.4rem;
  line-height: 1.1;
  font-weight: 700;
  color: var(--neutral-900);
}

.quota-card {
  border: 1px solid var(--neutral-200);
  border-radius: 10px;
  padding: 14px;
  background: var(--bg-secondary);
}

.wallet-card {
  background: linear-gradient(135deg, var(--accent-color) 0%, var(--accent-dark) 100%);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  color: white;
}

.wallet-subtitle {
  color: rgba(255, 255, 255, 0.78);
}

.wallet-balance {
  font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
  font-size: 3rem;
  line-height: 1;
  font-weight: 700;
  margin: 12px 0 8px;
}

.wallet-activity {
  min-height: 90px;
}

.wallet-btn {
  background: rgba(255, 255, 255, 0.16);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.32);
}

.wallet-btn-outline {
  color: #bfdbfe;
  border-color: #bfdbfe;
}

code {
  background: var(--neutral-100);
  padding: 2px 6px;
  border-radius: 6px;
}

:global(body.body--dark) .section-card {
  border-color: var(--neutral-300) !important;
}

:global(body.body--dark) .quota-card {
  border-color: var(--neutral-300);
  background: var(--bg-tertiary);
}
</style>
