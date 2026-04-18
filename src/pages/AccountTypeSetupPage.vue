<template>
  <q-page class="account-type-page q-pa-md">
    <div class="setup-card">
      <div class="setup-header">
        <div class="text-h5 text-weight-bold">Choose Your Account Type</div>
        <div class="text-body2 text-grey-7 q-mt-xs">
          This choice is required once and cannot be changed later.
        </div>
      </div>

      <div class="type-grid q-mt-md">
        <q-card
          v-for="option in availableOptions"
          :key="option.value"
          class="type-option cursor-pointer"
          :class="{ selected: selectedType === option.value }"
          flat
          bordered
          @click="selectedType = option.value"
        >
          <q-card-section>
            <div class="shape-wrap">
              <div class="shape" :class="`shape-${option.shape}`"></div>
            </div>
            <div class="text-subtitle1 text-weight-bold q-mt-sm">{{ option.label }}</div>
            <div class="text-caption text-grey-7 q-mt-xs">{{ option.description }}</div>
          </q-card-section>
        </q-card>
      </div>

      <div v-if="selectedType === 'MANAGER'" class="q-mt-md">
        <q-card flat bordered class="q-pa-md">
          <div class="text-subtitle2 text-weight-medium">Property Manager Details</div>
          <div class="text-body2 text-grey-7 q-mt-xs">
            All property managers start with the same base permissions. Ownership is set when you create or join a property.
          </div>

          <q-input
            v-model="companyName"
            outlined
            dense
            label="Company Name (Optional)"
            class="q-mt-md"
          />
        </q-card>
      </div>

      <q-banner v-if="errorMessage" class="bg-red-1 text-red-10 q-mt-md" rounded>
        {{ errorMessage }}
      </q-banner>

      <div class="row justify-end q-gutter-sm q-mt-lg">
        <q-btn
          color="primary"
          unelevated
          label="Confirm Account Type"
          :disable="!canConfirm"
          :loading="saving"
          @click="openConfirmDialog"
        />
      </div>
    </div>

    <q-dialog v-model="showConfirmDialog" persistent>
      <q-card style="min-width: 360px">
        <q-card-section>
          <div class="text-h6">Final Confirmation</div>
        </q-card-section>
        <q-card-section class="text-body2">
          You selected:
          <strong>{{ selectedTypeLabel }}</strong>
          <br />
          This can only be chosen once and cannot be changed later.
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="grey-7" v-close-popup />
          <q-btn
            color="primary"
            unelevated
            label="Confirm and Continue"
            :loading="saving"
            @click="confirmSelection"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUserDataStore } from '../stores/userDataStore'
import { useFirebase } from '../composables/useFirebase'

const router = useRouter()
const userDataStore = useUserDataStore()
const { createDocument } = useFirebase()

const selectedType = ref('')
const saving = ref(false)
const errorMessage = ref('')
const showConfirmDialog = ref(false)
const companyName = ref('')

const ACCOUNT_TYPE_OPTIONS = Object.freeze([
  {
    value: 'MANAGER',
    label: 'Property Manager',
    shape: 'square',
    description:
      'Manage properties and operations. You can manage your own properties and/or properties for others.',
  },
  {
    value: 'SP',
    label: 'Service Provider',
    shape: 'triangle',
    description:
      'Receive opportunities, submit proposals, and collaborate on assigned service work.',
  },
])

const hasLockedType = computed(() => {
  const profile = userDataStore.userProfile || {}
  return Boolean(profile.account_type_locked || profile.account_type || profile.user_category)
})

const availableOptions = computed(() => ACCOUNT_TYPE_OPTIONS)
const selectedTypeLabel = computed(
  () => availableOptions.value.find((opt) => opt.value === selectedType.value)?.label || selectedType.value
)
const canConfirm = computed(() => Boolean(selectedType.value))

const resolveAccountType = () => {
  if (selectedType.value === 'SP') return 'sp'
  if (selectedType.value === 'MANAGER') return 'pm'
  return null
}

const confirmSelection = async () => {
  if (!selectedType.value || !userDataStore.userId) return

  if (hasLockedType.value) {
    errorMessage.value = 'Account type already configured and locked.'
    return
  }

  saving.value = true
  errorMessage.value = ''

  try {
    const now = new Date()
    const currentProfile = userDataStore.userProfile || {}
    const accountType = resolveAccountType()
    await createDocument(
      'users',
      {
        ...currentProfile,
        user_id: userDataStore.userId,
        email: currentProfile.email || userDataStore.user?.email || '',
        user_name: currentProfile.user_name || userDataStore.user?.displayName || '',
        account_type: accountType,
        account_type_locked: true,
        account_type_selected_at: now,
        user_category: accountType,
        owner_workspace_only: selectedType.value === 'MANAGER' ? false : currentProfile.owner_workspace_only || false,
        company_name:
          selectedType.value === 'MANAGER'
            ? (companyName.value || currentProfile.company_name || '')
            : currentProfile.company_name || '',
        updatedAt: now,
        createdAt: currentProfile.createdAt || now,
      },
      userDataStore.userId
    )

    await userDataStore.loadUserProfile()
    showConfirmDialog.value = false
    router.push('/loading')
  } catch (error) {
    errorMessage.value = error?.message || 'Failed to save account type.'
  } finally {
    saving.value = false
  }
}

const openConfirmDialog = () => {
  if (!selectedType.value) return
  showConfirmDialog.value = true
}

watch(selectedType, (next) => {
  if (next !== 'MANAGER') {
    companyName.value = ''
  }
})

onMounted(async () => {
  if (!userDataStore.isAuthenticated) {
    router.push('/public/login')
    return
  }

  if (!userDataStore.userProfile && userDataStore.userId) {
    await userDataStore.loadUserProfile()
  }

  if (hasLockedType.value) {
    router.push('/')
  }
})
</script>

<style scoped>
.account-type-page {
  display: flex;
  justify-content: center;
}

.setup-card {
  width: 100%;
  max-width: 920px;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  background: var(--bg-surface);
  padding: 20px;
}

.type-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 12px;
}

.type-option {
  transition: all 0.2s ease;
}

.type-option.selected {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 1px var(--primary-color);
}

.shape-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 64px;
}

.shape {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
}

.shape-square {
  border-radius: 8px;
}

.shape-triangle {
  width: 0;
  height: 0;
  border-left: 24px solid transparent;
  border-right: 24px solid transparent;
  border-bottom: 48px solid var(--primary-color);
  background: transparent;
}
</style>
