<template>
  <q-layout view="lHh Lpr lFr" class="dashboard-layout">
    <!-- Dark Left Sidebar -->
    <q-drawer
      v-model="leftDrawerOpen"
      side="left"
      :width="280"
      class="dark-drawer"
      :breakpoint="1024"
      overlay
      bordered
    >
      <!-- Logo Text - Click to collapse menu -->
      <div class="drawer-logo-icon" @click="goHome">
        <span class="sidebar-app-title">Handout</span>
      </div>

      <!-- Navigation Grid -->
      <div class="nav-grid-wrap">
        <template v-for="(section, sectionIndex) in navSections" :key="section.key">
          <div class="nav-grid">
            <button
              v-for="link in section.links"
              :key="`${section.key}-${link.link}`"
              class="nav-grid-item"
              :class="{ 'nav-grid-active': isNavActive(link.link) }"
              @click="navigateTo(link.link)"
            >
              <div class="nav-grid-icon" :style="{ background: link.bg || 'rgba(0,0,0,0.06)' }">
                <q-icon :name="link.icon" size="22px" :color="link.color || 'grey-7'" />
              </div>
              <span class="nav-grid-label">{{ link.title }}</span>
            </button>
          </div>
          <q-separator v-if="sectionIndex < navSections.length - 1" class="q-my-sm" />
        </template>
      </div>

    </q-drawer>

    <!-- Top Header -->
    <q-header class="dashboard-header" :class="{ 'drawer-minimized': !leftDrawerOpen }">
      <q-toolbar class="header-toolbar q-px-lg">
        <!-- Left: Logo -->
        <div class="header-handout-logo" @click="goHome">
          <span class="header-app-title">Handout</span>
        </div>
        <q-space />

        <!-- Center: Page title aligned with content -->
        <div class="header-center-title">{{ headerPageTitle }}</div>
        <q-space />

        <!-- Right: Actions -->


        <!-- Header Actions: same-size buttons aligned in top bar -->
        <div class="header-actions">
          <q-btn
            v-if="isPmPo"
            flat
            round
            dense
            icon="apps"
            class="header-action-btn"
            @click="toggleLeftDrawer"
          >
            <q-tooltip>Navigation Menu</q-tooltip>
          </q-btn>

          <template v-if="isPmPo">
            <q-btn
              v-if="showUniversalSearchButton"
              flat
              round
              dense
              icon="search"
              class="header-action-btn"
              @click="goToUniversalSearch"
            >
              <q-tooltip>Universal Search</q-tooltip>
            </q-btn>
           <!--
            <q-btn
              flat
              round
              dense
              icon="person"
              class="header-action-btn"
              @click="showGlobalContactsDialog = true"
            >

              <q-tooltip>Contacts</q-tooltip>
            </q-btn>
      -->
            <q-btn
              flat
              round
              dense
              icon="add_circle"
              class="header-action-btn"
              @click="showGlobalCreateDialog = true"
            >
              <q-tooltip>Create</q-tooltip>
            </q-btn>
          </template>

          <!-- Language Switcher -->
          <q-btn
            v-if="false"
            flat
            dense
            :label="currentLanguageLabel"
            class="header-action-btn language-switcher"
            @click="toggleLanguage"
          >
            <q-tooltip>Switch Language</q-tooltip>
          </q-btn>

          <q-btn
            flat
            round
            dense
            :icon="isDarkMode ? 'light_mode' : 'dark_mode'"
            @click="toggleDarkMode"
            class="header-action-btn dark-mode-btn"
          >
            <q-tooltip>{{ isDarkMode ? 'Light Mode' : 'Dark Mode' }}</q-tooltip>
          </q-btn>
          <q-btn-dropdown
            flat
            dense
            icon="manage_accounts"
            class="header-action-btn profile-btn"
            dropdown-icon="expand_more"
            no-icon-animation
          >
            <q-list style="min-width: 180px">
              <q-item v-if="!isTenantUser" clickable v-close-popup @click="goToProfile">
                <q-item-section avatar>
                  <q-icon name="manage_accounts" />
                </q-item-section>
                <q-item-section>User Profile</q-item-section>
              </q-item>
              <q-separator v-if="!isTenantUser" />
              <q-item clickable v-close-popup @click="handleSignOut">
                <q-item-section avatar>
                  <q-icon name="logout" color="negative" />
                </q-item-section>
                <q-item-section class="text-negative">{{ t('signOut') }}</q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
        </div>
      </q-toolbar>
    </q-header>

    <q-page-container class="page-container" :class="{ 'drawer-open': leftDrawerOpen }">
      <!-- Loading indicator for data loading -->
      <div v-if="dataLoading" class="data-loading-overlay">
        <q-spinner-dots size="40px" color="primary" />
        <div class="loading-text">Loading your data...</div>
      </div>

      <div class="content-shell" :class="contentShellClass">
        <aside v-if="showPropertyRail" class="property-rail">
          <PropertySidebarPicker
            class="mainlayout-property-picker"
            v-model="activePropertyId"
            :properties="userDataStore.userAccessibleProperties"
            :include-all="propertyRailIncludeAll"
          />
        </aside>

        <div class="content-main" :class="{ 'content-main--workspace': showPropertyRail }">
          <router-view v-slot="{ Component, route: currentViewRoute }">
            <keep-alive>
              <component
                :is="Component"
                v-if="currentViewRoute.meta?.keepAlive"
                :key="currentViewRoute.path"
              />
            </keep-alive>
            <component
              :is="Component"
              v-if="!currentViewRoute.meta?.keepAlive"
              :key="currentViewRoute.fullPath"
            />
          </router-view>
        </div>

        <aside v-if="showAdRail" class="ad-rail">
          <q-card v-if="!showAssistantPanel" flat bordered class="ad-slot-card stats-rail-card">
            <q-card-section class="stats-rail-header">
              <div class="text-subtitle2 text-weight-medium">Quick Stats</div>
              <div class="text-caption text-grey-6 q-mt-xs">This Month</div>
            </q-card-section>
            <q-separator />
            <q-card-section class="stats-rail-body">
              <q-card class="stats-card-compact" flat bordered>
                <q-card-section class="stats-compact-section">
                  <div class="stats-compact-row">
                    <div class="stats-compact-left">
                      <div class="stats-title">Monthly Income</div>
                      <div class="stats-meta">
                        <q-icon name="arrow_circle_up" size="12px" class="q-mr-xs" />
                        Current month
                      </div>
                    </div>
                    <div class="stats-value-badge stats-value-income">
                      ${{ formatStatCurrency(monthlyIncome) }}
                    </div>
                  </div>
                </q-card-section>
              </q-card>
              <q-card class="stats-card-compact" flat bordered>
                <q-card-section class="stats-compact-section">
                  <div class="stats-compact-row">
                    <div class="stats-compact-left">
                      <div class="stats-title">Monthly Expense</div>
                      <div class="stats-meta">
                        <q-icon name="arrow_circle_down" size="12px" class="q-mr-xs" />
                        Current month
                      </div>
                    </div>
                    <div class="stats-value-badge stats-value-expense">
                      ${{ formatStatCurrency(monthlyExpense) }}
                    </div>
                  </div>
                </q-card-section>
              </q-card>
              <q-card class="stats-card-compact" flat bordered>
                <q-card-section class="stats-compact-section">
                  <div class="stats-compact-row">
                    <div class="stats-compact-left">
                      <div class="stats-title">Open Tasks</div>
                      <div class="stats-meta">
                        <q-icon name="assignment" size="12px" class="q-mr-xs" />
                        Active queue
                      </div>
                    </div>
                    <div class="stats-value-badge stats-value-tasks">{{ openTasks }}</div>
                  </div>
                </q-card-section>
              </q-card>
              <q-card class="stats-card-compact" flat bordered>
                <q-card-section class="stats-compact-section">
                  <div class="stats-compact-row">
                    <div class="stats-compact-left">
                      <div class="stats-title">Active Leases</div>
                      <div class="stats-meta">
                        <q-icon name="home_work" size="12px" class="q-mr-xs" />
                        Current units
                      </div>
                    </div>
                    <div class="stats-value-badge stats-value-leases">{{ activeLeases }}</div>
                  </div>
                </q-card-section>
              </q-card>
            </q-card-section>
          </q-card>
          <div v-if="isIndexDashboard" id="index-reminders-slot" class="index-reminders-slot" />

          <q-card
            v-if="showAssistantInRail"
            flat
            bordered
            class="ad-slot-card assistant-rail-card"
            :class="{ 'assistant-rail-card--expanded': showAssistantPanel }"
          >
            <q-card-section class="assistant-rail-header">
              <div>
                <div class="assistant-rail-title">
                  <q-icon name="smart_toy" size="18px" class="q-mr-xs" />
                  Tobby
                </div>
                <div class="assistant-rail-subtitle">
                  Ask questions or draft tasks without leaving the PM workspace.
                </div>
              </div>
              <q-btn
                v-if="showAssistantPanel"
                flat
                round
                dense
                icon="close"
                size="sm"
                @click="showAssistantPanel = false"
              />
            </q-card-section>
            <q-separator />
            <q-card-section v-if="!showAssistantPanel" class="assistant-rail-cta">
              <q-btn
                unelevated
                color="primary"
                no-caps
                icon="chat"
                label="Talk to Tobby"
                class="full-width assistant-rail-btn"
                @click="showAssistantPanel = true"
              />
            </q-card-section>
            <q-card-section v-else class="assistant-panel-body assistant-panel-body--rail">
              <div ref="assistantMessagesEl" class="assistant-message-list">
                <div
                  v-for="message in assistantMessages"
                  :key="message.id"
                  class="assistant-message-row"
                  :class="`assistant-message-row--${message.role}`"
                >
                  <div class="assistant-message-bubble" :class="`assistant-message-bubble--${message.role}`">
                    <div class="assistant-message-text">{{ message.text }}</div>
                    <div v-if="message.draft" class="assistant-draft assistant-draft--message">
                      <div class="text-subtitle2 text-weight-bold q-mb-xs">{{ message.title }}</div>
                      <div
                        v-for="line in message.summaryLines"
                        :key="`${message.id}-${line.label}`"
                        class="assistant-draft-line"
                      >
                        <strong>{{ line.label }}:</strong> {{ line.value }}
                      </div>
                      <q-btn
                        unelevated
                        color="primary"
                        :label="message.actionLabel"
                        class="q-mt-sm"
                        @click="openAssistantDraft(message)"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <q-input
                v-model="assistantInput"
                type="textarea"
                outlined
                autogrow
                dense
                label="Ask Tobby"
                :disable="assistantLoading"
                class="assistant-input"
                @keyup.enter.exact.prevent="runAssistantIntake"
              />
              <div class="assistant-actions">
                <q-btn
                  unelevated
                  color="primary"
                  label="Send"
                  :loading="assistantLoading"
                  @click="runAssistantIntake"
                />
                <q-btn flat label="Clear" @click="resetAssistant" />
              </div>
              <div v-if="assistantError" class="text-negative">{{ assistantError }}</div>
              <div v-if="assistantOutOfScope" class="text-grey-7">{{ assistantOutOfScope }}</div>
            </q-card-section>
          </q-card>
        </aside>
      </div>
    </q-page-container>

    <q-dialog v-model="showGlobalCreateDialog">
      <q-card class="global-create-dialog">
        <q-card-section class="global-create-header">
          <div class="text-subtitle1 text-weight-bold">Create New</div>
          <q-btn icon="close" flat round dense size="sm" v-close-popup />
        </q-card-section>
        <q-card-section class="global-create-body">
          <div class="global-create-grid">
            <button
              v-for="option in filteredGlobalCreateOptions"
              :key="option.label"
              class="global-create-item"
              @click="handleCreateOption(option)"
            >
              <div class="global-create-icon" :style="{ background: option.bg }">
                <q-icon :name="option.icon" size="24px" :color="option.color" />
              </div>
              <span class="global-create-label">{{ option.label }}</span>
            </button>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Create Form Dialog (embeds create components) -->
    <q-dialog v-model="showCreateFormDialog" maximized transition-show="slide-up" transition-hide="slide-down">
      <q-card class="create-form-dialog">
        <q-card-section class="create-form-dialog-header">
          <q-btn icon="close" flat round dense @click="showCreateFormDialog = false" />
          <div class="text-subtitle1 text-weight-bold">{{ activeCreateLabel }}</div>
          <div style="width: 36px" />
        </q-card-section>
        <q-separator />
        <div class="create-form-dialog-body">
          <q-layout view="lHh lpr lFf" container>
            <q-page-container>
              <component
                :is="activeCreateComponent"
                v-if="activeCreateComponent"
                v-bind="activeCreateProps"
                @cancel="showCreateFormDialog = false"
                @property-created="handlePropertyCreated"
                @mxrecord-created="handleCreateRecordSaved('Task created successfully.')"
                @transaction-created="handleCreateRecordSaved('Transaction created successfully.')"
                @reminder-saved="handleCreateRecordSaved('Reminder created successfully.')"
                @lease-created="handleCreateRecordSaved('Lease created successfully.')"
                @asset-created="handleCreateRecordSaved('Asset created successfully.')"
                @document-created="handleCreateRecordSaved('Document saved successfully.')"
                @service-created="handleCreateRecordSaved('Service saved successfully.')"
              />
            </q-page-container>
          </q-layout>
        </div>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showGlobalContactsDialog">
      <q-card style="min-width: 420px">
        <q-card-section class="row items-center justify-between">
          <div class="text-h6">Contacts</div>
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-separator />
        <q-card-section>
          <q-list separator>
            <q-item v-for="contact in globalContacts" :key="contact.id" clickable>
              <q-item-section avatar>
                <q-avatar color="blue-1" text-color="primary">{{ contact.initials }}</q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ contact.name }}</q-item-label>
                <q-item-label caption>{{ contact.role }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Global Assistant Widget (bottom-right, available on all pages) -->
    <div v-if="!showAssistantInRail" class="global-assistant-widget">
      <q-btn
        v-if="showFloatingAssistantFab && !showAssistantPanel"
        rounded
        color="primary"
        icon="chat"
        size="md"
        class="assistant-fab"
        @click="showAssistantPanel = true"
      >
        Talk to Tobby
        <q-tooltip>Talk to Tobby</q-tooltip>
      </q-btn>

      <transition name="assistant-slide">
        <q-card v-if="showAssistantPanel" class="assistant-panel">
          <q-card-section class="assistant-panel-header">
            <div class="assistant-panel-title">
              <q-icon name="smart_toy" size="20px" class="q-mr-sm" />
              Tobby
            </div>
            <q-btn flat round dense icon="close" size="sm" @click="showAssistantPanel = false" />
          </q-card-section>
          <q-separator />
          <q-card-section class="assistant-panel-body">
            <div ref="assistantFloatingMessagesEl" class="assistant-message-list">
              <div
                v-for="message in assistantMessages"
                :key="`floating-${message.id}`"
                class="assistant-message-row"
                :class="`assistant-message-row--${message.role}`"
              >
                <div class="assistant-message-bubble" :class="`assistant-message-bubble--${message.role}`">
                  <div class="assistant-message-text">{{ message.text }}</div>
                  <div v-if="message.draft" class="assistant-draft assistant-draft--message">
                    <div class="text-subtitle2 text-weight-bold q-mb-xs">{{ message.title }}</div>
                    <div
                      v-for="line in message.summaryLines"
                      :key="`floating-${message.id}-${line.label}`"
                      class="assistant-draft-line"
                    >
                      <strong>{{ line.label }}:</strong> {{ line.value }}
                    </div>
                    <q-btn
                      unelevated
                      color="primary"
                      :label="message.actionLabel"
                      class="q-mt-sm"
                      @click="openAssistantDraft(message)"
                    />
                  </div>
                </div>
              </div>
            </div>
            <q-input
              v-model="assistantInput"
              type="textarea"
              outlined
              autogrow
              dense
              label="Ask Tobby"
              :disable="assistantLoading"
              class="assistant-input"
              @keyup.enter.exact.prevent="runAssistantIntake"
            />
            <div class="assistant-actions">
              <q-btn
                unelevated
                color="primary"
                label="Send"
                :loading="assistantLoading"
                @click="runAssistantIntake"
              />
              <q-btn flat label="Clear" @click="resetAssistant" />
            </div>
            <div v-if="assistantError" class="text-negative">{{ assistantError }}</div>
            <div v-if="assistantOutOfScope" class="text-grey-7">{{ assistantOutOfScope }}</div>
          </q-card-section>
        </q-card>
      </transition>
    </div>
  </q-layout>
</template>

<script setup>
import { ref, watch, computed, onMounted, defineAsyncComponent, shallowRef, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { useUserDataStore } from '../stores/userDataStore'
import { useFirebase } from '../composables/useFirebase'
import { agentApi } from '../services/webApiClient'
import PropertySidebarPicker from '../components/PropertySidebarPicker.vue'

const createComponentMap = {
  property: defineAsyncComponent(() => import('components/CreateProperty.vue')),
  task: defineAsyncComponent(() => import('components/CreateMxRecord.vue')),
  transaction: defineAsyncComponent(() => import('components/CreateTransaction.vue')),
  reminder: defineAsyncComponent(() => import('components/CreateReminder.vue')),
  lease: defineAsyncComponent(() => import('components/CreateLease.vue')),
  asset: defineAsyncComponent(() => import('components/CreateAsset.vue')),
  document: defineAsyncComponent(() => import('components/CreateDocument.vue')),
  service: defineAsyncComponent(() => import('components/CreateService.vue')),
  tenant: defineAsyncComponent(() => import('pages/CreateTenantPage.vue')),
}


const $q = useQuasar()
const router = useRouter()
const route = useRoute()
const { locale, t } = useI18n()

// Page title for header center (layout only; no color change)
const PAGE_TITLES = {
  '/': 'Dashboard',
  '/pm-po-feed': 'PM/PO Feed',
  '/universal-search': 'Universal Search',
  '/my-properties': 'My Properties',
  '/property-view': 'Property View',
  '/transactions': 'Transactions',
  '/leases': 'Leases',
  '/tenants': 'Tenants',
  '/mx-records': 'Tasks',
  '/reminders': 'Reminders',
  '/reports': 'Reports',
  '/documents': 'Documents',
  '/po-dashboard': 'Handout',
  '/property-services': 'Property Services',
  '/user-profile': 'User Profile',
  '/tenant-home': 'Tenant Home',
  '/create-tenant': 'Create Tenant',
  '/sp-profile': 'SP Profile',
  '/sp-handout-builder': 'Build Handout',
}

const headerPageTitle = computed(() =>
  PAGE_TITLES[route.path] ??
  (route.path.startsWith('/assets') ? 'Assets' : null) ??
  (route.path.startsWith('/edit-property') ? 'Edit Property' : null) ??
  (route.path.startsWith('/application-detail') ? 'Application' : null) ??
  (route.name ? String(route.name).replace(/([A-Z])/g, ' $1').trim() : null) ??
  'Dashboard'
)
const userDataStore = useUserDataStore()
const { logout } = useFirebase()
const hasOwnerWorkspaceAccess = computed(() => Boolean(userDataStore.hasOwnerWorkspaceAccess))
const isOwnerWorkspaceOnly = computed(() => Boolean(userDataStore.isOwnerOnlyUser))
const isPmPo = computed(() => ['pm', 'po'].includes(String(userDataStore.userCategory || '').toLowerCase()) || hasOwnerWorkspaceAccess.value || userDataStore.isManagerCapableUser)
const isTenantUser = computed(() => String(userDataStore.userCategory || '').toLowerCase() === 'tt')
const showUniversalSearchButton = computed(
  () => isPmPo.value && !isOwnerWorkspaceOnly.value && !String(route.path || '').startsWith('/sp-'),
)
const showFloatingAssistant = computed(() => {
  const path = String(route.path || '')
  if (path.startsWith('/sp-')) return false
  if (path.startsWith('/po-dashboard')) return false
  if (isOwnerWorkspaceOnly.value) return false
  return true
})
const showAssistantInRail = computed(() => Boolean(showAdRail.value && isPmPo.value && showFloatingAssistant.value))
const showFloatingAssistantFab = computed(() => Boolean(showFloatingAssistant.value && !showAssistantInRail.value))
const PROPERTY_RAIL_ROUTES = [
  '/transactions',
  '/mx-records',
  '/reminders',
  '/tenants',
  '/assets',
  '/property-services',
  '/leases',
  '/documents',
  '/reports',
]
const isIndexDashboard = computed(() => route.path === '/' || route.path === '/pm-po-feed')
const propertyRailIncludeAll = computed(() => route.path !== '/property-services')
const showPropertyRail = computed(() => {
  const accountType = String(userDataStore.accountType || userDataStore.userCategory || '').toLowerCase()
  if (!['pm', 'po', 'admin'].includes(accountType)) return false
  return isIndexDashboard.value || PROPERTY_RAIL_ROUTES.some((path) => route.path.startsWith(path))
})
const showAdRail = computed(() => {
  const accountType = String(userDataStore.accountType || userDataStore.userCategory || '').toLowerCase()
  if (!['pm', 'po', 'admin'].includes(accountType)) return false
  if (showPropertyRail.value) return true
  return route.path === '/' || route.path === '/pm-po-feed'
})
const getTransactionDate = (transaction) => {
  const source = transaction?.transac_date || transaction?.created_datetime || transaction?.date
  if (source?.toDate) return source.toDate()
  return new Date(source)
}
const isIncomeType = (transaction) => {
  if (transaction?.type === 'income') return true
  const transacType = String(transaction?.transac_type || '').toLowerCase()
  return transacType.includes('rent') || transacType.includes('deposit') || transacType.includes('refund')
}
const monthlyIncome = computed(() => {
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  return (userDataStore.userAccessibleTransactions || [])
    .filter((transaction) => {
      const transactionDate = getTransactionDate(transaction)
      return (
        !Number.isNaN(transactionDate.getTime()) &&
        transactionDate.getMonth() === currentMonth &&
        transactionDate.getFullYear() === currentYear &&
        isIncomeType(transaction)
      )
    })
    .reduce((sum, transaction) => sum + (parseFloat(transaction.amount) || 0), 0)
})
const monthlyExpense = computed(() => {
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  return (userDataStore.userAccessibleTransactions || [])
    .filter((transaction) => {
      const transactionDate = getTransactionDate(transaction)
      return (
        !Number.isNaN(transactionDate.getTime()) &&
        transactionDate.getMonth() === currentMonth &&
        transactionDate.getFullYear() === currentYear &&
        !isIncomeType(transaction)
      )
    })
    .reduce((sum, transaction) => sum + (parseFloat(transaction.amount) || 0), 0)
})
const selectedRailPropertyId = computed(() => String(route.query.propertyId || '').trim())
const matchesSelectedRailProperty = (record) => {
  if (!selectedRailPropertyId.value) return true
  const propertyId = String(
    record?.property_id?.id || record?.property?.id || record?.property_id || '',
  ).trim()
  return propertyId === selectedRailPropertyId.value
}
const openTasks = computed(() =>
  (userDataStore.userAccessibleMxRecords || []).filter(
    (task) =>
      matchesSelectedRailProperty(task) &&
      (!task?.status || String(task.status).toLowerCase() === 'open'),
  ).length,
)
const activeLeases = computed(() =>
  (userDataStore.userAccessibleLeases || []).filter((lease) => {
    const status = String(lease?.status || lease?.leasedetail?.status || '').toLowerCase()
    return matchesSelectedRailProperty(lease) && (status === 'active' || status === 'occupied')
  }).length,
)
const formatStatCurrency = (amount) =>
  new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount || 0)
const contentShellClass = computed(() => ({
  'content-shell--with-rails': showPropertyRail.value,
  'content-shell--with-ad-rail': !showPropertyRail.value && showAdRail.value,
}))
const activePropertyId = computed({
  get() {
    const value = String(route.query.propertyId || '').trim()
    return value || null
  },
  set(value) {
    const nextQuery = { ...route.query }
    if (value) {
      nextQuery.propertyId = value
    } else {
      delete nextQuery.propertyId
    }
    router.replace({ query: nextQuery }).catch(() => {})
  },
})
const showGlobalCreateDialog = ref(false)
const showGlobalContactsDialog = ref(false)
const showAssistantPanel = ref(false)
const showCreateFormDialog = ref(false)
const activeCreateComponent = shallowRef(null)
const activeCreateLabel = ref('')
const activeCreateProps = ref({})
const assistantInput = ref('')
const assistantLoading = ref(false)
const assistantError = ref('')
const assistantOutOfScope = ref('')
const assistantDraft = ref(null)
const assistantMessagesEl = ref(null)
const assistantFloatingMessagesEl = ref(null)
const createAssistantMessage = (payload) => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
  ...payload,
})
const assistantMessages = ref([
  createAssistantMessage({
    role: 'assistant',
    text: 'Ask me to create a task, reminder, asset, service, or transaction. I will prepare the draft for you here.',
  }),
])

const handleOpenGlobalAssistant = () => {
  showAssistantPanel.value = true
}

const globalCreateOptions = [
  { label: 'Property', icon: 'home', path: '/create-property', bg: 'rgba(156,39,176,0.1)', color: 'purple' },
  { label: 'Task', icon: 'dns', key: 'task', bg: 'rgba(33,150,243,0.1)', color: 'primary' },
  { label: 'Transaction', icon: 'receipt_long', key: 'transaction', bg: 'rgba(76,175,80,0.1)', color: 'positive' },
  { label: 'Lease', icon: 'event', key: 'lease', bg: 'rgba(255,152,0,0.1)', color: 'warning' },
  { label: 'Tenant', icon: 'person_add', key: 'tenant', bg: 'rgba(3,169,244,0.1)', color: 'cyan-8' },
  { label: 'Reminder', icon: 'alarm', key: 'reminder', path: '/reminders?create=true', bg: 'rgba(244,67,54,0.1)', color: 'negative' },
  { label: 'Asset', icon: 'inventory_2', key: 'asset', bg: 'rgba(121,85,72,0.1)', color: 'brown' },
  { label: 'Document', icon: 'description', key: 'document', path: '/documents?create=true', bg: 'rgba(0,150,136,0.1)', color: 'teal' },
  { label: 'Service', icon: 'handyman', key: 'service', path: '/property-services', bg: 'rgba(96,125,139,0.1)', color: 'blue-grey' },
]

const filteredGlobalCreateOptions = computed(() => {
  if (isOwnerWorkspaceOnly.value) {
    const allowed = new Set(['task', 'transaction', 'reminder', 'asset', 'service'])
    return globalCreateOptions.filter((option) => allowed.has(option.key))
  }
  return globalCreateOptions
})

const globalContacts = []

const resetCreateDialogState = () => {
  activeCreateProps.value = {}
  activeCreateComponent.value = null
  activeCreateLabel.value = ''
}

watch(showCreateFormDialog, (value) => {
  if (!value) resetCreateDialogState()
})

// Dark mode state
const isDarkMode = ref(false)

// Language state
const currentLocale = computed(() => locale.value)
const currentLanguageLabel = computed(() => {
  return currentLocale.value === 'es-ES' ? 'ES' : 'EN'
})

// Toggle language between English and Spanish - updates all system text globally
function toggleLanguage() {
  const newLang = currentLocale.value === 'en-US' ? 'es-ES' : 'en-US'
  // Update locale - this will automatically update all components using i18n
  locale.value = newLang
  localStorage.setItem('handout-locale', newLang)

  // Show confirmation notification
  $q.notify({
    type: 'info',
    message: newLang === 'es-ES' ? 'Idioma cambiado a Español' : 'Language changed to English',
    position: 'top',
    timeout: 1500,
    color: 'primary'
  })
}

const resetAssistant = () => {
  assistantInput.value = ''
  assistantError.value = ''
  assistantOutOfScope.value = ''
  assistantDraft.value = null
  assistantMessages.value = [
    createAssistantMessage({
      role: 'assistant',
      text: 'Ask me to create a task, reminder, asset, service, or transaction. I will prepare the draft for you here.',
    }),
  ]
}

const scrollAssistantToBottom = async () => {
  await nextTick()
  ;[assistantMessagesEl.value, assistantFloatingMessagesEl.value].forEach((element) => {
    if (element) element.scrollTop = element.scrollHeight
  })
}

const addAssistantMessage = async (message) => {
  assistantMessages.value.push(createAssistantMessage(message))
  await scrollAssistantToBottom()
}

const handlePropertyCreated = async () => {
  showCreateFormDialog.value = false
  try {
    await Promise.all([
      userDataStore.loadUserRoles(),
      userDataStore.loadProperties(),
      userDataStore.loadMxRecords(),
      userDataStore.loadTransactions(),
      userDataStore.loadLeases(),
    ])
  } catch (error) {
    console.error('Failed to refresh data after property creation:', error)
  }
}

const handleCreateRecordSaved = async (message) => {
  showCreateFormDialog.value = false
  try {
    await userDataStore.loadAllUserData()
  } catch (error) {
    console.error('Failed to refresh data after create action:', error)
  }
  if (message) {
    $q.notify({
      type: 'positive',
      message,
      position: 'top',
    })
  }
}

const openTaskCreateWithDraft = (draft) => {
  activeCreateComponent.value = createComponentMap.task
  activeCreateLabel.value = 'Task'
  activeCreateProps.value = {
    allowPropertyEdit: true,
    prefill: {
      description: draft?.description || '',
      status: draft?.status || 'open',
      report_date: new Date().toISOString().split('T')[0],
      property_id: draft?.property_id || null,
    },
  }
  showCreateFormDialog.value = true
}

const openTransactionCreateWithDraft = (draft) => {
  activeCreateComponent.value = createComponentMap.transaction
  activeCreateLabel.value = 'Transaction'
  activeCreateProps.value = {
    allowPropertyEdit: true,
    propertyName: draft?.property_name || '',
    prefill: {
      property_id: draft?.property_id || null,
      transac_type: draft?.transac_type || '',
      transac_from: draft?.transac_from || '',
      transac_to: draft?.transac_to || '',
      amount: draft?.amount ?? null,
      transac_date: draft?.transac_date || new Date().toISOString().split('T')[0],
      note: draft?.note || '',
    },
  }
  showCreateFormDialog.value = true
}

const openAssetCreateWithDraft = (draft) => {
  activeCreateComponent.value = createComponentMap.asset
  activeCreateLabel.value = 'Asset'
  activeCreateProps.value = {
    allowPropertyEdit: true,
    propertyName: draft?.property_name || '',
    prefill: {
      property_id: draft?.property_id || null,
      nickname: draft?.nickname || '',
      type: draft?.type || '',
      location: draft?.location || '',
      brand: draft?.brand || '',
      model: draft?.model || '',
      serial: draft?.serial || '',
      mfg_date: draft?.mfg_date || '',
      acquired_date: draft?.acquired_date || '',
      notes: draft?.notes || '',
    },
  }
  showCreateFormDialog.value = true
}

const openReminderCreateWithDraft = (draft) => {
  activeCreateComponent.value = createComponentMap.reminder
  activeCreateLabel.value = 'Reminder'
  activeCreateProps.value = {
    allowPropertyEdit: true,
    propertyName: draft?.property_name || '',
    prefill: {
      property_id: draft?.property_id || null,
      category: draft?.category || '',
      start_date: draft?.start_date || new Date().toISOString().split('T')[0],
      due_date: draft?.due_date || draft?.start_date || new Date().toISOString().split('T')[0],
      repeat_by: draft?.repeat_by || 'one-time',
      amount: draft?.amount ?? null,
      note: draft?.note || '',
      status: draft?.status !== false,
    },
  }
  showCreateFormDialog.value = true
}

const openServiceCreateWithDraft = (draft) => {
  const propertyId = draft?.property_id || draft?.propertyId || null
  activeCreateComponent.value = createComponentMap.service
  activeCreateLabel.value = 'Service'
  activeCreateProps.value = {
    allowPropertyEdit: true,
    propertyName: draft?.property_name || '',
    prefill: {
      property_id: propertyId,
      selectedServicePropertyIds: Array.isArray(draft?.selectedServicePropertyIds)
        ? draft.selectedServicePropertyIds
        : propertyId
          ? [propertyId]
          : [],
      service_type: draft?.service_type || 'loan',
      company_name: draft?.company_name || '',
      company_website: draft?.company_website || '',
      agent_company: draft?.agent_company || '',
      agent_name: draft?.agent_name || '',
      agent_phone: draft?.agent_phone || '',
      agent_email: draft?.agent_email || '',
      service_start_date: draft?.service_start_date || '',
      term: draft?.term || '',
    },
  }
  showCreateFormDialog.value = true
}

const getAssistantDraftMeta = (entityType, draft) => {
  const propertyLabel =
    draft?.property_name ||
    resolvePropertyLabel(draft?.property_id, userDataStore.userAccessibleProperties) ||
    'Not set'

  if (entityType === 'transaction') {
    return {
      title: 'Draft Transaction',
      actionLabel: 'Open Transaction Form',
      summaryLines: [
        { label: 'From', value: draft?.transac_from || 'Not set' },
        { label: 'To', value: draft?.transac_to || 'Not set' },
        { label: 'Amount', value: draft?.amount ?? 'Not set' },
        { label: 'Type', value: draft?.transac_type || 'Not set' },
        { label: 'Property', value: propertyLabel },
      ],
    }
  }

  if (entityType === 'reminder') {
    return {
      title: 'Draft Reminder',
      actionLabel: 'Open Reminder Form',
      summaryLines: [
        { label: 'Category', value: draft?.category || 'Not set' },
        { label: 'Repeat', value: draft?.repeat_by || 'Not set' },
        { label: 'Due Date', value: draft?.due_date || draft?.start_date || 'Not set' },
        { label: 'Property', value: propertyLabel },
      ],
    }
  }

  if (entityType === 'asset') {
    return {
      title: 'Draft Asset',
      actionLabel: 'Open Asset Form',
      summaryLines: [
        { label: 'Name', value: draft?.nickname || 'Not set' },
        { label: 'Type', value: draft?.type || 'Not set' },
        { label: 'Location', value: draft?.location || 'Not set' },
        { label: 'Property', value: propertyLabel },
      ],
    }
  }

  if (entityType === 'service') {
    return {
      title: 'Draft Service',
      actionLabel: 'Open Service Form',
      summaryLines: [
        { label: 'Type', value: draft?.service_type || 'Not set' },
        { label: 'Company', value: draft?.company_name || 'Not set' },
        { label: 'Agent', value: draft?.agent_name || draft?.agent_company || 'Not set' },
        { label: 'Property', value: propertyLabel },
      ],
    }
  }

  return {
    title: 'Draft Task',
    actionLabel: 'Open Task Form',
    summaryLines: [
      { label: 'Description', value: draft?.description || 'Not set' },
      { label: 'Category', value: draft?.task_category || 'Not set' },
      { label: 'Priority', value: draft?.task_priority || 'Not set' },
      { label: 'Property', value: propertyLabel },
    ],
  }
}

const openAssistantDraft = (message) => {
  const entityType = message?.entityType || 'task'
  const draft = message?.draft || null
  if (!draft) return

  if (entityType === 'transaction') {
    openTransactionCreateWithDraft(draft)
    return
  }
  if (entityType === 'reminder') {
    openReminderCreateWithDraft(draft)
    return
  }
  if (entityType === 'asset') {
    openAssetCreateWithDraft(draft)
    return
  }
  if (entityType === 'service') {
    openServiceCreateWithDraft(draft)
    return
  }
  openTaskCreateWithDraft(draft)
}

const normalizeMatchValue = (value) => String(value || '').toLowerCase().trim()

const extractStreetParts = (value) => {
  const text = normalizeMatchValue(value)
  if (!text) return { streetNumber: '', streetName: '' }

  const beforeComma = text.split(',')[0]?.trim() || text
  const numberMatch = beforeComma.match(/^\s*(\d+)\b/)
  const streetNumber = numberMatch ? numberMatch[1] : ''

  const nameMatch = beforeComma.match(/^\s*\d+\s+(.+)$/)
  const streetName = nameMatch ? nameMatch[1].trim() : ''

  return { streetNumber, streetName }
}

const TRANSACTION_TYPE_OPTIONS = [
  'Rent',
  'Deposit',
  'Tax',
  'Insurance',
  'Utility',
  'Maintenance',
  'Labor',
  'HOA',
  'Fee',
  'Refund',
  'Other',
]

const TRANSACTION_ROLE_OPTIONS = [
  'Property Owner',
  'Property Manager',
  'Tenant',
  'Service Provider',
  'Government',
  'HOA',
]

const REMINDER_CATEGORY_OPTIONS = ['fee', 'hoa', 'rent', 'maintenance', 'labor', 'tax', 'other']
const ASSET_TYPE_OPTIONS = ['Appliance', 'HVAC', 'Pool/Spa', 'Electrical', 'Plumbing', 'Safety', 'Exterior', 'Furniture', 'Other']
const SERVICE_TYPE_OPTIONS = [
  'loan',
  'insurance',
  'pest_control',
  'lawn',
  'pool',
  'cleaning',
  'hvac',
  'plumbing',
  'electrical',
  'security',
  'trash',
  'snow_removal',
]

const detectAssetTypeLocal = (message) => {
  const text = normalizeMatchValue(message)
  if (!text) return 'Other'
  if (/water heater|heater|ac|hvac|furnace|thermostat|air handler|compressor/.test(text)) return 'HVAC'
  if (/dishwasher|washer|dryer|fridge|refrigerator|stove|oven|microwave|appliance/.test(text)) return 'Appliance'
  if (/outlet|breaker|panel|switch|electrical|light|wiring/.test(text)) return 'Electrical'
  if (/toilet|sink|faucet|pipe|plumbing|drain|garbage disposal/.test(text)) return 'Plumbing'
  if (/camera|alarm|detector|safety|sensor|extinguisher/.test(text)) return 'Safety'
  if (/gate|door|window|roof|gutter|fence|garage/.test(text)) return 'Exterior'
  if (/sofa|chair|table|bed|furniture/.test(text)) return 'Furniture'
  if (/pool|spa|hot tub/.test(text)) return 'Pool/Spa'
  return 'Other'
}

const detectAssetLocationLocal = (message) => {
  const text = normalizeMatchValue(message)
  if (!text) return ''
  const knownLocations = [
    'Kitchen',
    'Laundry Room',
    'Garage',
    'Basement',
    'Bathroom',
    'Primary Bathroom',
    'Guest Bathroom',
    'Living Room',
    'Dining Room',
    'Bedroom 2',
    'Bedroom 3',
    'Bedroom 4',
    'Main Bedroom',
    'Office',
    'Patio',
    'Deck',
    'Roof',
    'Back Yard',
    'Front Yard',
    'HVAC Closet',
    'Utility Room',
    'Mechanical Room',
    'Water Heater Closet',
  ]
  const match = knownLocations.find((location) => text.includes(normalizeMatchValue(location)))
  return match || ''
}

const detectReminderCategoryLocal = (message) => {
  const text = normalizeMatchValue(message)
  if (!text) return ''
  if (/rent/.test(text)) return 'rent'
  if (/hoa/.test(text)) return 'hoa'
  if (/tax/.test(text)) return 'tax'
  if (/maintenance|repair|fix/.test(text)) return 'maintenance'
  if (/labor|service/.test(text)) return 'labor'
  if (/fee|charge/.test(text)) return 'fee'
  return 'other'
}

const detectReminderRepeatLocal = (message) => {
  const text = normalizeMatchValue(message)
  if (!text) return 'one-time'
  if (/daily|every day/.test(text)) return 'daily'
  if (/weekly|every week/.test(text)) return 'weekly'
  if (/monthly|every month/.test(text)) return 'monthly'
  if (/yearly|annual|annually|every year/.test(text)) return 'yearly'
  return 'one-time'
}

const detectTransactionTypeLocal = (message) => {
  const text = normalizeMatchValue(message)
  if (!text) return ''
  if (/rent/.test(text)) return 'Rent'
  if (/deposit/.test(text)) return 'Deposit'
  if (/tax/.test(text)) return 'Tax'
  if (/insurance/.test(text)) return 'Insurance'
  if (/utility|electric|water|gas|trash|sewer/.test(text)) return 'Utility'
  if (/maintenance|repair|fix/.test(text)) return 'Maintenance'
  if (/labor|service/.test(text)) return 'Labor'
  if (/hoa/.test(text)) return 'HOA'
  if (/refund/.test(text)) return 'Refund'
  if (/fee|charge/.test(text)) return 'Fee'
  return ''
}

const resolveTransactionRole = (value) => {
  const normalized = normalizeMatchValue(value)
  if (!normalized) return ''

  const synonyms = [
    { match: /landlord|owner|po/, role: 'Property Owner' },
    { match: /pm|manager|management/, role: 'Property Manager' },
    { match: /tenant|renter/, role: 'Tenant' },
    { match: /sp|service\s*provider|vendor|contractor|handyman/, role: 'Service Provider' },
    { match: /gov|government|city|county|state/, role: 'Government' },
    { match: /hoa/, role: 'HOA' },
  ]

  const synonym = synonyms.find((entry) => entry.match.test(normalized))
  if (synonym) return synonym.role

  const direct = TRANSACTION_ROLE_OPTIONS.find(
    (option) => normalizeMatchValue(option) === normalized
  )
  if (direct) return direct

  const partial = TRANSACTION_ROLE_OPTIONS.find((option) =>
    normalizeMatchValue(option).includes(normalized)
  )
  return partial || ''
}

const normalizePropertyIdValue = (value) => {
  if (!value) return ''
  if (typeof value === 'object') {
    return String(value.id || value.property_id || '').trim()
  }
  return String(value).trim()
}

const resolvePropertyLabel = (propertyId, properties) => {
  const normalizedId = normalizePropertyIdValue(propertyId)
  if (!normalizedId) return ''
  const match = (properties || []).find(
    (property) => String(property.id || property.property_id || '').trim() === normalizedId
  )
  if (!match) return ''
  return match.nickname || match.displayName || match.address || match.id || ''
}

const normalizeAssistantDraftProperty = (draft, properties, matchedPropertyId, matchedPropertyLabel) => {
  const propertyId =
    matchedPropertyId ||
    normalizePropertyIdValue(draft?.property_id) ||
    normalizePropertyIdValue(draft?.propertyId) ||
    null
  const resolvedLabel =
    matchedPropertyLabel ||
    resolvePropertyLabel(propertyId, properties) ||
    ''
  const rawName = String(draft?.property_name || draft?.propertyName || '').trim()
  const propertyName =
    resolvedLabel ||
    (rawName && rawName !== String(propertyId || '').trim() ? rawName : '')

  return {
    ...draft,
    property_id: propertyId,
    property_name: propertyName,
  }
}

const inferTransactionRoles = (message, transacType) => {
  const text = normalizeMatchValue(message)
  const type = normalizeMatchValue(transacType)
  const roleFromHints = resolveTransactionRole(text)
  let fromRole = roleFromHints || ''
  let toRole = ''

  if (type === 'rent' || type === 'deposit') {
    fromRole = 'Tenant'
    toRole = 'Property Owner'
  } else if (type) {
    fromRole = fromRole || 'Property Owner'
  }

  if (type === 'refund') {
    if (/tenant|renter/.test(text)) {
      fromRole = 'Property Owner'
      toRole = 'Tenant'
    }
  }

  if (type === 'fee') {
    if (/tenant|renter/.test(text)) {
      fromRole = 'Tenant'
      toRole = 'Property Owner'
    }
  }

  if (/hoa/.test(text)) {
    if (!toRole) toRole = 'HOA'
  }

  if (/government|city|county|state/.test(text)) {
    if (!toRole) toRole = 'Government'
  }

  if (/tenant|renter/.test(text) && !fromRole) {
    fromRole = 'Tenant'
  }

  if (!toRole && fromRole === 'Tenant') {
    const hinted = resolveTransactionRole(text)
    toRole = hinted && hinted !== 'Tenant' ? hinted : 'Property Owner'
  } else if (!toRole && fromRole === 'Property Owner') {
    const hinted = resolveTransactionRole(text)
    toRole = hinted && hinted !== 'Property Owner' ? hinted : 'Tenant'
  }

  if (fromRole === 'Tenant' && (!toRole || toRole === 'Tenant')) {
    toRole = 'Property Owner'
  }

  return { transac_from: fromRole, transac_to: toRole }
}

const findPropertyMatch = (message, properties) => {
  const haystack = normalizeMatchValue(message)
  if (!haystack) return null

  let best = null
  const choose = (property, matchedValue, score) => {
    if (!best || score > best.score) {
      best = { id: property.id || property.property_id, matchedValue, score }
    }
  }

  properties.forEach((property) => {
    const addressSource = property.street || property.address || ''
    const { streetNumber, streetName } = extractStreetParts(addressSource)
    const fields = [property.nickname, streetNumber, streetName]
    fields.forEach((field) => {
      const value = normalizeMatchValue(field)
      if (!value) return
      if (haystack === value) {
        choose(property, value, 1000 + value.length)
      } else if (haystack.includes(value)) {
        choose(property, value, 100 + value.length)
      } else if (value.includes(haystack) && haystack.length > 3) {
        choose(property, value, 10 + haystack.length)
      }
    })
  })

  return best?.id || null
}

const runAssistantIntake = async () => {
  const message = String(assistantInput.value || '').trim()
  if (!message) {
    assistantError.value = 'Please enter a short description of the issue.'
    return
  }
  assistantLoading.value = true
  assistantError.value = ''
  assistantOutOfScope.value = ''
  assistantDraft.value = null
  await addAssistantMessage({
    role: 'user',
    text: message,
  })
  try {
    if (userDataStore.userRoles.length === 0 && !userDataStore.userRolesLoading) {
      await userDataStore.loadUserRoles()
    }
    if (userDataStore.userAccessibleProperties.length === 0 && !userDataStore.propertiesLoading) {
      await userDataStore.loadProperties()
    }
    const properties = userDataStore.userAccessibleProperties || []
    const matchedPropertyId = findPropertyMatch(message, properties)
    const matchedTransactionType = detectTransactionTypeLocal(message)
    const matchedAssetType = detectAssetTypeLocal(message)
    const matchedAssetLocation = detectAssetLocationLocal(message)
    const matchedReminderCategory = detectReminderCategoryLocal(message)
    const matchedReminderRepeat = detectReminderRepeatLocal(message)
    const matchedPropertyLabel = resolvePropertyLabel(matchedPropertyId, properties)
    const propertyList = (userDataStore.userAccessibleProperties || []).map((p) => ({
      id: p.id || p.property_id,
      nickname: p.nickname || p.displayName || '',
      displayName: p.displayName || '',
      address: p.address || '',
    }))
    const response = await agentApi.intake({
      raw_text: message,
      context: {
        property_id: matchedPropertyId || null,
        property_list: propertyList,
        transaction_type_hint: matchedTransactionType || null,
        transaction_type_options: TRANSACTION_TYPE_OPTIONS,
        transaction_role_options: TRANSACTION_ROLE_OPTIONS,
        asset_type_hint: matchedAssetType || null,
        asset_type_options: ASSET_TYPE_OPTIONS,
        asset_location_hint: matchedAssetLocation || null,
        reminder_category_hint: matchedReminderCategory || null,
        reminder_category_options: REMINDER_CATEGORY_OPTIONS,
        reminder_repeat_hint: matchedReminderRepeat || null,
        service_type_options: SERVICE_TYPE_OPTIONS,
      },
    })
    if (response?.capability === 'out_of_scope' || response?.entity_type === 'out_of_scope') {
      assistantOutOfScope.value = response?.message || 'This request is outside the assistant scope.'
      await addAssistantMessage({
        role: 'assistant',
        text: assistantOutOfScope.value,
      })
      assistantInput.value = ''
      return
    }
    if (!response?.draft) {
      assistantError.value = 'No draft was returned. Please try again.'
      await addAssistantMessage({
        role: 'assistant',
        text: assistantError.value,
      })
      return
    }
    assistantDraft.value = { ...response.draft }
    const entityType = response?.entity_type || 'task'
    if (entityType === 'transaction' && matchedTransactionType) {
      assistantDraft.value.transac_type = matchedTransactionType
    }
    if (entityType === 'reminder') {
      if (!assistantDraft.value.category && matchedReminderCategory) {
        assistantDraft.value.category = matchedReminderCategory
      }
      if (!assistantDraft.value.repeat_by && matchedReminderRepeat) {
        assistantDraft.value.repeat_by = matchedReminderRepeat
      }
      if (!assistantDraft.value.property_name) {
        assistantDraft.value.property_name =
          resolvePropertyLabel(assistantDraft.value.property_id, properties) || ''
      }
    }
    if (entityType === 'asset') {
      if (!assistantDraft.value.type && matchedAssetType) {
        assistantDraft.value.type = matchedAssetType
      }
      if (!assistantDraft.value.location && matchedAssetLocation) {
        assistantDraft.value.location = matchedAssetLocation
      }
      if (!assistantDraft.value.property_name) {
        assistantDraft.value.property_name =
          resolvePropertyLabel(assistantDraft.value.property_id, properties) || ''
      }
    }
    if (entityType === 'transaction' && !assistantDraft.value.property_name) {
      assistantDraft.value.property_name =
        resolvePropertyLabel(assistantDraft.value.property_id, properties) || ''
    }
    if (entityType === 'transaction') {
      const normalizedFrom = resolveTransactionRole(assistantDraft.value.transac_from)
      const normalizedTo = resolveTransactionRole(assistantDraft.value.transac_to)
      if (normalizedFrom) assistantDraft.value.transac_from = normalizedFrom
      if (normalizedTo) assistantDraft.value.transac_to = normalizedTo
      if (!assistantDraft.value.transac_from || !assistantDraft.value.transac_to) {
        const inferred = inferTransactionRoles(message, assistantDraft.value.transac_type)
        if (!assistantDraft.value.transac_from && inferred.transac_from) {
          assistantDraft.value.transac_from = inferred.transac_from
        }
        if (!assistantDraft.value.transac_to && inferred.transac_to) {
          assistantDraft.value.transac_to = inferred.transac_to
        }
      }
    }
    const normalizedDraft = normalizeAssistantDraftProperty(
      assistantDraft.value,
      properties,
      matchedPropertyId,
      matchedPropertyLabel,
    )
    const draftMeta = getAssistantDraftMeta(entityType, normalizedDraft)
    await addAssistantMessage({
      role: 'assistant',
      text: 'I prepared a draft for you. Review it here, then open the form when you are ready.',
      entityType,
      draft: normalizedDraft,
      title: draftMeta.title,
      actionLabel: draftMeta.actionLabel,
      summaryLines: draftMeta.summaryLines,
    })
    assistantInput.value = ''
    assistantDraft.value = null
  } catch (error) {
    assistantError.value = error?.message || 'Failed to analyze the request.'
    await addAssistantMessage({
      role: 'assistant',
      text: assistantError.value,
    })
  } finally {
    assistantLoading.value = false
  }
}

// Initialize dark mode from localStorage
onMounted(() => {
  const savedDarkMode = localStorage.getItem('handout-dark-mode')
  if (savedDarkMode !== null) {
    isDarkMode.value = savedDarkMode === 'true'
    $q.dark.set(isDarkMode.value)
    applyDarkModeClass(isDarkMode.value)
  }
  window.addEventListener('open-global-assistant', handleOpenGlobalAssistant)
})
// Toggle dark mode
function toggleDarkMode() {
  isDarkMode.value = !isDarkMode.value
  $q.dark.set(isDarkMode.value)
  localStorage.setItem('handout-dark-mode', isDarkMode.value.toString())
  applyDarkModeClass(isDarkMode.value)
}
// Apply dark mode class to body for custom styling
function applyDarkModeClass(isDark) {
  if (isDark) {
    document.body.classList.add('body--dark')
  } else {
    document.body.classList.remove('body--dark')
  }
}

const allLinksList = computed(() => [
  {
    title: t('dashboard'),
    icon: 'dashboard',
    link: '/',
    bg: 'rgba(33,150,243,0.1)',
    color: 'primary',
    allowedFor: ['pm', 'admin'],
  },
  {
    title: t('reports'),
    icon: 'assessment',
    link: '/reports',
    bg: 'rgba(255,87,34,0.1)',
    color: 'deep-orange',
    allowedFor: ['pm', 'po', 'admin'],
  },
  {
    title: 'SP Credits',
    icon: 'token',
    link: '/sp-credits',
    bg: 'rgba(25,118,210,0.12)',
    color: 'primary',
    allowedFor: ['sp', 'admin'],
  },
  {
    title: t('Properties'),
    icon: 'home',
    link: '/my-properties',
    bg: 'rgba(156,39,176,0.1)',
    color: 'purple',
    allowedFor: ['pm', 'admin'],
  },
  {
    title: t('tasks'),
    icon: 'dns',
    link: '/mx-records',
    bg: 'rgba(33,150,243,0.1)',
    color: 'primary',
    allowedFor: ['pm', 'po', 'admin'],
  },
  {
    title: t('reminders'),
    icon: 'notifications',
    link: '/reminders',
    bg: 'rgba(244,67,54,0.1)',
    color: 'negative',
    allowedFor: ['pm', 'po', 'admin'],
  },
  {
    title: t('transactions'),
    icon: 'receipt_long',
    link: '/transactions',
    bg: 'rgba(76,175,80,0.1)',
    color: 'positive',
    allowedFor: ['pm', 'po', 'admin'],
  },
  {
    title: t('documents'),
    icon: 'folder',
    link: '/documents',
    bg: 'rgba(0,150,136,0.1)',
    color: 'teal',
    allowedFor: ['pm', 'admin'],
  },
  {
    title: t('assets'),
    icon: 'inventory_2',
    link: '/assets',
    bg: 'rgba(121,85,72,0.1)',
    color: 'brown',
    allowedFor: ['pm', 'po', 'admin'],
  },
  {
    title: 'Services',
    icon: 'handyman',
    link: '/property-services',
    bg: 'rgba(96,125,139,0.1)',
    color: 'blue-grey',
    allowedFor: ['pm', 'admin'],
  },
  {
    title: t('leases'),
    icon: 'description',
    link: '/leases',
    bg: 'rgba(255,152,0,0.1)',
    color: 'warning',
    allowedFor: ['pm', 'admin'],
  },
  {
    title: t('tenants'),
    icon: 'people',
    link: '/tenants',
    bg: 'rgba(3,169,244,0.1)',
    color: 'cyan-8',
    allowedFor: ['pm', 'admin'],
  },
])

const hasReportsData = computed(() => {
  const transactionCount = userDataStore.userAccessibleTransactions.length
  const taskCount = userDataStore.userAccessibleMxRecords.length
  return transactionCount + taskCount > 0
})

// Computed property to filter links based on user category
const linksList = computed(() => {
  const userCategory = String(userDataStore.userCategory || '').toLowerCase()
  console.log('MainLayout - Filtering menu for user category:', userCategory)

  // If no user category yet (still loading), show nothing
  if (!userCategory) {
    return []
  }

  // Filter links based on user category
  const filtered = allLinksList.value.filter((link) => {
    if (link.link === '/reports' && !hasReportsData.value && !hasOwnerWorkspaceAccess.value) {
      return false
    }
    if (isOwnerWorkspaceOnly.value) {
      return link.allowedFor.includes('po')
    }
    if (userCategory === 'pm' || userCategory === 'po') {
      return link.allowedFor.includes(userCategory)
    }

    // For other categories, check direct match
    return link.allowedFor.includes(userCategory)
  })

  console.log(
    'MainLayout - Filtered links:',
    filtered.map((l) => l.title),
  )
  return filtered
})

const getSectionKey = (link) => {
  const path = link?.link || ''
  if (['/', '/po-dashboard', '/reports'].includes(path)) return 'dashboard'
  if (['/my-properties', '/assets', '/documents', '/property-services'].includes(path)) return 'propertyAssetDocuments'
  if (['/mx-records', '/transactions', '/reminders', '/leases', '/tenants'].includes(path))
    return 'taskTransactionReminderLeaseTenants'
  if (['/sp-cards'].includes(path)) return 'reportBizCard'
  if (['/sp-dashboard', '/sp-credits'].includes(path)) return 'spPortal'
  if (['/tenant-home'].includes(path)) return 'tenant'
  return 'other'
}

const NAV_SECTION_ORDER = ['dashboard', 'propertyAssetDocuments', 'taskTransactionReminderLeaseTenants', 'reportBizCard', 'spPortal', 'tenant', 'other']

const navSections = computed(() => {
  const grouped = linksList.value.reduce((acc, link) => {
    const key = getSectionKey(link)
    if (!acc[key]) {
      acc[key] = []
    }
    acc[key].push(link)
    return acc
  }, {})

  return NAV_SECTION_ORDER
    .filter((key) => Array.isArray(grouped[key]) && grouped[key].length > 0)
    .map((key) => ({ key, links: grouped[key] }))
})

const leftDrawerOpen = ref(false)
const dataLoading = ref(false)

// Universal data loading function
const loadAllUserData = async () => {
  if (!userDataStore.isAuthenticated || !userDataStore.userId) {
    console.log('MainLayout - User not authenticated, skipping data load')
    return
  }

  console.log('MainLayout - Starting universal data loading...')
  dataLoading.value = true

  try {
    // Load all user data in parallel
    await Promise.all([
      userDataStore.loadUserProfile(),
      userDataStore.loadUserRoles(),
      userDataStore.loadProperties(),
      userDataStore.loadMxRecords(),
      userDataStore.loadTransactions(),
      userDataStore.loadLeases(),
    ])

    console.log('MainLayout - Universal data loading completed successfully')
    console.log(
      'MainLayout - User accessible properties:',
      userDataStore.userAccessibleProperties.length,
    )
    console.log('MainLayout - User roles:', userDataStore.userRoles.length)
  } catch (error) {
    console.error('MainLayout - Error loading user data:', error)
  } finally {
    dataLoading.value = false
  }
}

// Track if we need to redirect after data load (for page refresh)
const needsRedirectAfterLoad = ref(false)

// Watch for authentication changes
watch(
  () => userDataStore.isAuthenticated,
  (isAuthenticated, wasAuthenticated) => {
    console.log('MainLayout - Authentication changed:', { isAuthenticated, wasAuthenticated })

    if (isAuthenticated) {
      console.log('MainLayout - User authenticated')

      const currentPath = router.currentRoute.value.path
      const isOnLoadingPage = currentPath === '/loading'
      const hasData = userDataStore.userAccessibleProperties.length > 0
      const isPageRefresh = wasAuthenticated === undefined

      // On page refresh with authenticated user
      if (isPageRefresh) {
        console.log('MainLayout - Page refresh detected')

        // Keep current route on refresh. Do not force redirect to index.
        // Check if data is already loaded
        const hasData = userDataStore.userAccessibleProperties.length > 0

        // If not loaded -> Load data immediately
        if (!hasData && !userDataStore.profileLoading) {
          console.log('MainLayout - Loading data')
          loadAllUserData()
        } else {
          // If loaded -> Do nothing
          console.log('MainLayout - Data already loaded')
        }
        return
      }

      // On normal authentication (not page refresh)
      if (!isOnLoadingPage && !hasData && !userDataStore.profileLoading) {
        console.log('MainLayout - New authentication, loading user data')
        loadAllUserData()
      } else if (isOnLoadingPage) {
        console.log('MainLayout - On loading page, letting LoadingPage handle data loading')
      } else {
        console.log('MainLayout - Data already loaded or loading')
      }
    } else if (wasAuthenticated !== undefined && wasAuthenticated === true) {
      // User was authenticated and now is not - this is an actual logout
      console.log('MainLayout - User logged out, clearing data')
      dataLoading.value = false
      needsRedirectAfterLoad.value = false
      // Note: Redirect to logout success page is handled by handleSignOut function
    }
  },
  { immediate: true },
)

// Watch for data loading completion to redirect after page refresh
watch(
  () => [
    userDataStore.userAccessibleProperties.length,
    userDataStore.profileLoading,
    userDataStore.propertiesLoading,
  ],
  () => {
    // If data just finished loading and we need to redirect
    if (
      needsRedirectAfterLoad.value &&
      userDataStore.userAccessibleProperties.length > 0 &&
      !userDataStore.profileLoading &&
      !userDataStore.propertiesLoading &&
      router.currentRoute.value.path !== '/'
    ) {
      console.log('MainLayout - Data loaded after refresh, redirecting to index')
      needsRedirectAfterLoad.value = false
      router.push('/')
    }
  },
  { deep: true },
)

// Watch for user ID changes (in case user changes)
watch(
  () => userDataStore.userId,
  (newUserId, oldUserId) => {
    if (newUserId && newUserId !== oldUserId) {
      console.log('MainLayout - User ID changed, reloading data')
      loadAllUserData()
    }
  },
)

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

function isNavActive(link) {
  const currentPath = route.path || ''
  if (link === '/') return currentPath === '/'
  return currentPath === link || currentPath.startsWith(`${link}/`)
}

function navigateTo(link) {
  leftDrawerOpen.value = false
  router.push(link)
}

function goHome() {
  router.push('/')
}

async function handleSignOut() {
  try {
    console.log('MainLayout - Starting sign out process...')

    // Clear any loading states
    dataLoading.value = false

    // Perform logout
    await logout()
    console.log('MainLayout - User signed out successfully')

    // Redirect to logout success page
    console.log('MainLayout - Redirecting to logout success page...')
    await router.push('/logout-success')
    console.log('MainLayout - Redirected to logout success page successfully')
  } catch (error) {
    console.error('MainLayout - Error during sign out:', error)

    // Even if logout fails, clear loading state and try to redirect to logout success
    dataLoading.value = false
    try {
      console.log('MainLayout - Attempting fallback redirect to logout success...')
      await router.push('/logout-success')
      console.log('MainLayout - Fallback redirect successful')
    } catch (redirectError) {
      console.error('MainLayout - Error with fallback redirect:', redirectError)
    }
  }
}

function goToProfile() {
  if (isTenantUser.value) {
    router.push('/tenant-home')
    return
  }
  const profile = userDataStore.userProfile || {}
  const accountType = String(profile.account_type || '').toLowerCase()
  const userCategory = String(profile.user_category || '').toLowerCase()
  const isSp = accountType === 'sp' || userCategory === 'sp'
  router.push(isSp ? '/sp-profile' : '/user-profile')
}

function goToUniversalSearch() {
  router.push('/universal-search')
}

function handleCreateOption(option) {
  showGlobalCreateDialog.value = false
  if (option.key && createComponentMap[option.key]) {
    activeCreateLabel.value = `Create ${option.label}`
    activeCreateComponent.value = createComponentMap[option.key]
    activeCreateProps.value = option.key === 'property' ? { autoNavigate: false } : {}
    showCreateFormDialog.value = true
  } else if (option.path) {
    router.push(option.path)
  }
}

watch(
  () => route.query.create,
  (value) => {
    if (value === 'property') {
      activeCreateLabel.value = 'Create Property'
      activeCreateComponent.value = createComponentMap.property
      activeCreateProps.value = { autoNavigate: false }
      showCreateFormDialog.value = true
      const nextQuery = { ...route.query }
      delete nextQuery.create
      router.replace({ query: nextQuery }).catch(() => {})
    }
  },
  { immediate: true },
)
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Pacifico&display=swap');

/* Dashboard Color Palette */
/* Primary Blue: #1976d2 */
/* Dark Sidebar: #1F2128 */
/* White: #FFFFFF */
/* Light Gray: #F5F7FA */
/* Text Gray: #6B7280 */

.dashboard-layout {
  background:
    radial-gradient(circle at top left, rgba(39, 194, 164, 0.08), transparent 26%),
    radial-gradient(circle at top right, rgba(36, 59, 83, 0.08), transparent 24%),
    linear-gradient(180deg, #f8fbff 0%, var(--bg-primary) 38%, #f3f6fb 100%);
}

/* Hide scrollbars globally while maintaining scroll functionality */
* {
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}

*::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}

/* ========================================
   DARK SIDEBAR STYLING
   ======================================== */

.dark-drawer {
  background: rgba(255, 255, 255, 0.82);
  backdrop-filter: blur(18px);
  border-right: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow: var(--shadow-lg);
  display: flex;
  flex-direction: column;
  overflow-y: auto; /* Allow scrolling */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}

.dark-drawer::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}

.drawer-logo-icon {
  padding: 32px 20px 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.drawer-logo-icon:hover {
  background: rgba(36, 59, 83, 0.06);
}

.sidebar-app-title {
  font-family: 'Pacifico', cursive;
  font-size: 1.8rem;
  font-weight: 400;
  color: var(--primary-color);
  letter-spacing: 0.02em;
  transition: all 0.3s ease;
}

.drawer-logo-icon:hover .sidebar-app-title {
  transform: scale(1.05);
}

.nav-grid-wrap {
  padding: 12px 16px 24px;
  flex: 1;
}

.nav-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.nav-grid-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 14px 6px 10px;
  border: 1px solid transparent;
  background: rgba(255, 255, 255, 0.52);
  border-radius: var(--border-radius-card, 14px);
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease;
}
.nav-grid-item:hover {
  background: rgba(255, 255, 255, 0.95);
  border-color: rgba(36, 59, 83, 0.08);
  box-shadow: var(--shadow-sm);
  transform: translateY(-1px);
}
:global(body.body--dark) .nav-grid-item:hover {
  background: rgba(255, 255, 255, 0.08);
}

.nav-grid-icon {
  width: 46px;
  height: 46px;
  border-radius: var(--border-radius-card);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.75);
}
.nav-grid-item:hover .nav-grid-icon {
  transform: scale(1.08);
}

.nav-grid-label {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--neutral-700, #424242);
  text-align: center;
  line-height: 1.2;
  max-width: 84px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
:global(body.body--dark) .nav-grid-label {
  color: #bbb;
}

.nav-grid-active {
  background: linear-gradient(180deg, rgba(39, 194, 164, 0.14), rgba(39, 194, 164, 0.08));
  border: 1px solid rgba(39, 194, 164, 0.24);
  border-radius: var(--border-radius-card, 14px);
  box-shadow: var(--shadow-sm);
}
.nav-grid-active .nav-grid-label {
  color: var(--neutral-900);
  font-weight: 700;
}
:global(body.body--dark) .nav-grid-active {
  background: rgba(45, 212, 191, 0.18);
}
:global(body.body--dark) .nav-grid-active .nav-grid-label {
  color: #ecfeff;
}

/* ========================================
   HEADER STYLING
   ======================================== */

.dashboard-header {
  background: transparent;
  border-bottom: none;
  box-shadow: none;
  min-height: 60px;
  padding: max(12px, env(safe-area-inset-top, 12px)) 20px 0;
}

.dashboard-header .header-toolbar {
  max-width: none;
  width: 100%;
  background: #f8fbfd;
  backdrop-filter: blur(18px) saturate(140%);
  border: 1px solid rgba(36, 59, 83, 0.12);
  border-radius: var(--border-radius-drawer);
  box-shadow: 0 10px 28px rgba(15, 23, 42, 0.08), 0 1px 0 rgba(255, 255, 255, 0.8) inset;
  min-height: 60px;
  padding-left: 8px;
  padding-right: 12px;
  transition: box-shadow 0.3s ease, border-color 0.3s ease, background 0.3s ease;
}

.dashboard-header .header-toolbar:hover {
  box-shadow: 0 14px 34px rgba(15, 23, 42, 0.12), 0 1px 0 rgba(255, 255, 255, 0.85) inset;
  border-color: rgba(39, 194, 164, 0.22);
}

.header-toolbar {
  display: flex;
  align-items: center;
  min-height: 56px;
}

.header-center-title {
  flex: 1;
  text-align: center;
  font-size: 1.04rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--neutral-900);
  pointer-events: none;
}

/* Header Handout Logo - Shows when sidebar is closed */
.header-handout-logo {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.header-handout-logo:hover {
  background: var(--primary-glow);
}

.header-handout-logo .header-app-title {
  font-family: 'Pacifico', cursive;
  font-size: 1.5rem;
  font-weight: 400;
  color: var(--primary-color);
  letter-spacing: 0.02em;
}

/* Header Logo */
.header-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.header-logo:hover {
  transform: scale(1.05);
}

.header-logo-image {
  height: 40px;
  width: 40px;
  border-radius: 50%;
  object-fit: cover;
  transition: all 0.3s ease;
}

/* Header Actions - same size, aligned in top bar */
.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 12px;
}

/* Base: all header action buttons same size */
.header-action-btn {
  width: 40px !important;
  min-width: 40px !important;
  height: 40px !important;
  min-height: 40px !important;
  padding: 0 !important;
  color: var(--primary-color) !important;
  background: rgba(255, 255, 255, 0.62) !important;
  border: 1px solid rgba(36, 59, 83, 0.1) !important;
  border-radius: var(--border-radius-card) !important;
  box-shadow: 0 1px 0 rgba(255, 255, 255, 0.8) inset;
  transition: all 0.2s ease;
  margin: 0;
}

.header-action-btn :deep(.q-icon) {
  color: currentColor !important;
  font-size: 20px;
  opacity: 1 !important;
}

.header-action-btn :deep(.q-btn__label),
.header-action-btn :deep(.q-btn__content) {
  color: currentColor !important;
}

.header-action-btn:hover {
  background: rgba(255, 255, 255, 0.95) !important;
  border-color: rgba(39, 194, 164, 0.32) !important;
  color: var(--accent-dark) !important;
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

/* Language switcher: same 40x40, label centered, text only */
.language-switcher {
  font-weight: 600 !important;
  font-size: 0.875rem !important;
  background: transparent !important;
  color: var(--primary-color) !important;
}

.language-switcher :deep(.q-btn__content) {
  justify-content: center;
}

.language-switcher:hover {
  background: var(--accent-glow) !important;
}

/* Refresh and Dark Mode buttons: primary background with white icon */
.refresh-btn,
.dark-mode-btn {
  background: transparent !important;
  border: 1.5px solid var(--border-strong) !important;
  color: var(--primary-color) !important;
}

.refresh-btn:hover,
.dark-mode-btn:hover {
  background: var(--accent-glow) !important;
}

.profile-btn {
  min-width: 56px !important;
  width: auto !important;
  padding: 0 8px !important;
  background: linear-gradient(180deg, rgba(39, 194, 164, 0.14), rgba(39, 194, 164, 0.08)) !important;
  border: 1px solid rgba(39, 194, 164, 0.34) !important;
  color: var(--accent-dark) !important;
}

.profile-btn:hover {
  background: rgba(20, 184, 166, 0.18) !important;
  color: var(--accent-dark) !important;
}

.profile-btn :deep(.q-btn__content) {
  gap: 2px;
}

.signout-btn {
  background: transparent !important;
  border: 1.5px solid #ef4444 !important;
  color: #ef4444 !important;
}

.signout-btn:hover {
  background: rgba(239, 68, 68, 0.14) !important;
  color: #dc2626 !important;
}

.action-btn {
  transition: all 0.3s ease;
}

.action-btn:hover {
  background: #f3f4f6;
}

/* Navigation Links (Dark Theme) */
.nav-link {
  margin: 4px 0;
  border-radius: var(--border-radius-drawer);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Page Container - horizontal padding aligns content with banner left/right */
.page-container {
  background: transparent;
  min-height: 100vh;
  position: relative;
  overflow-y: auto; /* Allow scrolling */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
  padding-left: 20px;
  padding-right: 20px;
}

/* When side menu is active, extra left padding so content aligns with banner */
.page-container.drawer-open {
  padding-left: 24px;
}

.page-container::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}

.content-shell {
  min-height: calc(100vh - 72px);
  padding-top: 16px;
}

.content-shell--with-rails {
  display: grid;
  grid-template-columns: 260px 1fr 260px;
  gap: 16px;
  align-items: start;
}

.content-shell--with-ad-rail {
  display: grid;
  grid-template-columns: 1fr 260px;
  gap: 16px;
  align-items: start;
}

.property-rail {
  align-self: start;
  position: sticky;
  top: 0;
}

.ad-rail {
  align-self: start;
  position: sticky;
  top: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: calc(100vh - 96px);
}

.index-reminders-slot {
  margin-top: 12px;
}

.mainlayout-property-picker,
.ad-slot-card {
  border-radius: var(--border-radius-card);
  background: rgba(255, 255, 255, 0.84);
  backdrop-filter: blur(14px);
  border: 1px solid rgba(255, 255, 255, 0.72);
  box-shadow: var(--shadow-md);
}

.stats-rail-card {
  overflow: hidden;
}

.assistant-rail-card {
  width: 100%;
  overflow: hidden;
}

.assistant-rail-card--expanded {
  min-height: calc(100vh - 96px);
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
}

.assistant-rail-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 12px 14px 10px !important;
}

.assistant-rail-title {
  display: flex;
  align-items: center;
  font-size: 0.92rem;
  font-weight: 700;
  color: var(--neutral-900);
}

.assistant-rail-subtitle {
  margin-top: 6px;
  font-size: 0.76rem;
  line-height: 1.45;
  color: var(--neutral-500);
}

.assistant-rail-cta {
  display: flex;
  padding: 12px !important;
}

.assistant-rail-btn {
  width: 100%;
  min-height: 42px;
  border-radius: var(--border-radius-btn);
}

.stats-rail-header {
  padding: 12px 14px 10px !important;
}

.stats-rail-body {
  display: grid;
  grid-template-columns: 1fr;
  gap: 6px;
  padding: 10px !important;
}

.stats-card-compact {
  border-radius: calc(var(--border-radius-card) - 2px);
  box-shadow: none !important;
  cursor: default;
  transition: background 0.15s ease;
  border: 1px solid rgba(36, 59, 83, 0.08);
  background: rgba(255, 255, 255, 0.84);
}

.stats-card-compact:hover {
  background: rgba(255, 255, 255, 0.96) !important;
}

.stats-compact-section {
  padding: 8px 10px !important;
}

.stats-compact-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
}

.stats-compact-left {
  flex: 1;
  min-width: 0;
}

.stats-title {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--neutral-900);
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.stats-meta {
  font-size: 0.72rem;
  color: var(--neutral-500);
  display: flex;
  align-items: center;
  margin-top: 2px;
}

.stats-value-badge {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 6px;
  white-space: nowrap;
  flex-shrink: 0;
}

.stats-value-income {
  background: #e8f5e9;
  color: #2e7d32;
}

.stats-value-expense {
  background: #ffebee;
  color: #d32f2f;
}

.stats-value-tasks {
  background: #fff3e0;
  color: #e65100;
}

.stats-value-leases {
  background: #e3f2fd;
  color: #1565c0;
}

.content-main {
  min-width: 0;
}

.content-main--workspace {
  background: var(--bg-surface);
  border: 1px solid var(--neutral-200);
  border-radius: var(--border-radius-card);
  min-height: 424px;
  padding: 18px;
}

/* Loading Overlay */
.data-loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.96);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(10px);
}

.loading-text {
  margin-top: 16px;
  font-size: 1rem;
  font-weight: 600;
  color: var(--primary-color);
}

/* ========================================
   RESPONSIVE DESIGN
   ======================================== */

@media (max-width: 768px) {
  .dashboard-header {
    min-height: 48px;
    padding: min(12px, env(safe-area-inset-top, 10px)) 12px 0;
  }

  .dashboard-header .header-toolbar {
    padding-left: 2px;
    padding-right: 16px;
  }

  .page-container {
    padding-left: 12px;
    padding-right: 12px;
  }

  .page-container.drawer-open {
    padding-left: 16px;
  }

  .header-toolbar {
    min-height: 48px;
  }

  .header-action-btn {
    width: 36px !important;
    min-width: 36px !important;
    height: 36px !important;
    min-height: 36px !important;
  }

  .header-action-btn .q-icon {
    font-size: 18px;
  }

  .header-logo {
    padding-left: 8px;
    gap: 8px;
  }

  .logo-image {
    height: 28px;
  }

  .header-app-title {
    font-size: 1.3rem;
  }

  .header-actions {
    gap: 4px;
  }

  .action-btn {
    size: sm;
  }

  .content-shell--with-rails,
  .content-shell--with-ad-rail {
    grid-template-columns: 1fr;
  }

  .content-shell {
    padding-top: 12px;
  }

  .property-rail,
  .ad-rail {
    position: static;
  }
}

/* ========================================
   ANIMATIONS & TRANSITIONS
   ======================================== */

.page-container > * {
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ========================================
   ACCESSIBILITY & FOCUS STATES
   ======================================== */

.action-btn:focus {
  outline: 2px solid var(--accent-color);
  outline-offset: 2px;
}

/* ========================================
   PRINT STYLES
   ======================================== */

@media print {
  .dashboard-header,
  .dark-drawer {
    display: none;
  }

  .page-container {
    background: white;
  }
}

/* ========================================
   DARK MODE STYLES
   ======================================== */

:global(body.body--dark) .dashboard-layout {
  background: var(--bg-primary);
}

:global(body.body--dark) .dark-drawer {
  background: var(--bg-surface);
  border-right-color: var(--border-color);
  color: white;
  box-shadow: var(--shadow-lg);
}

:global(body.body--dark) .dashboard-header {
  background: transparent;
  color: white;
}

:global(body.body--dark) .dashboard-header .header-toolbar {
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.92), rgba(17, 24, 39, 0.86));
  backdrop-filter: blur(20px) saturate(150%);
  border-color: rgba(148, 163, 184, 0.2);
  box-shadow: 0 14px 34px rgba(0, 0, 0, 0.34), 0 1px 0 rgba(255, 255, 255, 0.04) inset;
}

:global(body.body--dark) .dashboard-header .header-toolbar:hover {
  border-color: rgba(45, 212, 191, 0.28);
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.4), 0 1px 0 rgba(255, 255, 255, 0.06) inset;
}

:global(body.body--dark) .header-center-title {
  color: var(--primary-color);
}

:global(body.body--dark) .sidebar-app-title {
  color: var(--primary-color) !important;
}

:global(body.body--dark) .header-app-title {
  color: var(--primary-color) !important;
}

:global(body.body--dark) .drawer-logo-icon {
  background: transparent;
}

:global(body.body--dark) .drawer-logo-icon:hover {
  background: var(--primary-glow);
}

:global(body.body--dark) .page-container {
  background: var(--bg-primary);
  color: white;
}

:global(body.body--dark) .nav-list {
  background: transparent;
}

:global(body.body--dark) .nav-link {
  color: white;
}

/* Dark mode: keep action buttons visible with strong contrast */
:global(body.body--dark) .header-action-btn {
  color: #d8fff6 !important;
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.96), rgba(30, 41, 59, 0.92)) !important;
  border: 1.5px solid rgba(148, 163, 184, 0.28) !important;
  box-shadow: 0 6px 16px rgba(2, 6, 23, 0.24), 0 1px 0 rgba(255, 255, 255, 0.04) inset !important;
}

:global(body.body--dark) .header-action-btn:hover {
  background: linear-gradient(180deg, rgba(20, 184, 166, 0.28), rgba(15, 118, 110, 0.24)) !important;
  border-color: rgba(45, 212, 191, 0.5) !important;
  color: #ffffff !important;
}

:global(body.body--dark) .header-action-btn :deep(.q-icon),
:global(body.body--dark) .header-action-btn :deep(.q-btn__label),
:global(body.body--dark) .header-action-btn :deep(.q-btn__content),
:global(body.body--dark) .header-action-btn :deep(.q-btn-dropdown__arrow) {
  color: currentColor !important;
  opacity: 1 !important;
}

:global(body.body--dark) .language-switcher {
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.96), rgba(30, 41, 59, 0.92)) !important;
}

:global(body.body--dark) .language-switcher:hover {
  background: linear-gradient(180deg, rgba(20, 184, 166, 0.28), rgba(15, 118, 110, 0.24)) !important;
}

:global(body.body--dark) .refresh-btn,
:global(body.body--dark) .dark-mode-btn {
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.96), rgba(30, 41, 59, 0.92)) !important;
  border: 1.5px solid rgba(148, 163, 184, 0.28) !important;
  color: #d8fff6 !important;
}

:global(body.body--dark) .refresh-btn:hover,
:global(body.body--dark) .dark-mode-btn:hover {
  background: linear-gradient(180deg, rgba(20, 184, 166, 0.28), rgba(15, 118, 110, 0.24)) !important;
  color: #ffffff !important;
}

:global(body.body--dark) .profile-btn {
  background: linear-gradient(180deg, rgba(20, 184, 166, 0.26), rgba(15, 118, 110, 0.22)) !important;
  border: 1.5px solid rgba(45, 212, 191, 0.42) !important;
  color: #ecfeff !important;
  box-shadow: 0 6px 16px rgba(2, 6, 23, 0.24), 0 1px 0 rgba(255, 255, 255, 0.04) inset !important;
}

:global(body.body--dark) .profile-btn:hover {
  background: rgba(45, 212, 191, 0.24) !important;
  color: #ccfbf1 !important;
}

:global(body.body--dark) .signout-btn {
  background: transparent !important;
  border: 1.5px solid #f87171 !important;
  color: #f87171 !important;
}

:global(body.body--dark) .signout-btn:hover {
  background: rgba(248, 113, 113, 0.16) !important;
  color: #fca5a5 !important;
}

:global(body.body--dark) .data-loading-overlay {
  background: rgba(18, 18, 18, 0.96);
}

:global(body.body--dark) .loading-text {
  color: var(--primary-color);
}

:global(body.body--dark) .header-handout-logo {
  background: transparent;
}

:global(body.body--dark) .header-handout-logo:hover {
  background: var(--primary-glow);
}

:global(body.body--dark) .header-logo {
  background: transparent;
}

:global(body.body--dark) .assistant-rail-title {
  color: var(--primary-color);
}

:global(body.body--dark) .assistant-rail-subtitle {
  color: rgba(255, 255, 255, 0.72);
}

:global(body.body--dark) .assistant-message-bubble--assistant {
  background: rgba(15, 23, 42, 0.72);
  border-color: rgba(148, 163, 184, 0.22);
}

:global(body.body--dark) .assistant-message-bubble--user {
  background: rgba(45, 212, 191, 0.18);
  border-color: rgba(45, 212, 191, 0.28);
}

:global(body.body--dark) .assistant-message-text,
:global(body.body--dark) .assistant-draft-line {
  color: rgba(255, 255, 255, 0.88);
}

/* Global Assistant Widget — aligned with right rail (280px) */
.global-assistant-widget {
  position: fixed;
  bottom: 10px;
  right: 30px;
  z-index: 6000;
}

.assistant-fab {
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.2);
}

.assistant-panel {
  width: 260px;
  height: min(560px, calc(100vh - var(--ad-rail-reserve, 320px) - 20px));
  max-height: min(560px, calc(100vh - var(--ad-rail-reserve, 320px) - 20px));
  min-height: 300px;
  border-radius: var(--border-radius-card, 10px);
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--neutral-200, #e5e7eb);
  background: var(--bg-surface, #fff);
  overflow: hidden;
}

.assistant-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px !important;
}

.assistant-panel-title {
  display: flex;
  align-items: center;
  font-weight: 700;
  font-size: 0.88rem;
  color: var(--neutral-800);
}

.assistant-panel-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: flex-start;
  padding: 10px !important;
}

.assistant-panel-body--rail {
  min-height: 280px;
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
}

.assistant-message-list {
  flex: 1 1 auto;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-right: 4px;
  margin-bottom: 10px;
}

.assistant-message-row {
  display: flex;
}

.assistant-message-row--user {
  justify-content: flex-end;
}

.assistant-message-row--assistant {
  justify-content: flex-start;
}

.assistant-message-bubble {
  max-width: 92%;
  border-radius: var(--border-radius-card);
  padding: 10px 12px;
}

.assistant-message-bubble--assistant {
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(36, 59, 83, 0.08);
}

.assistant-message-bubble--user {
  background: rgba(39, 194, 164, 0.14);
  border: 1px solid rgba(39, 194, 164, 0.28);
}

.assistant-message-text {
  font-size: 0.84rem;
  line-height: 1.5;
  color: var(--neutral-800);
  white-space: pre-wrap;
}

.assistant-input {
  margin-bottom: 8px;
}

.assistant-actions {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 8px;
}

.assistant-draft {
  margin-top: 10px;
  padding: 10px;
  border-radius: var(--border-radius-card);
  border: 1px solid var(--neutral-200);
  background: var(--bg-surface);
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.assistant-draft--message {
  margin-top: 10px;
}

.assistant-draft-line {
  font-size: 0.85rem;
  color: var(--neutral-700);
}

.assistant-slide-enter-active,
.assistant-slide-leave-active {
  transition: all 0.25s ease;
}

.assistant-slide-enter-from,
.assistant-slide-leave-to {
  opacity: 0;
  transform: translateY(16px) scale(0.96);
}

@media (max-width: 768px) {
  .global-assistant-widget {
    right: 22px;
    bottom: 12px;
  }

  .assistant-panel {
    width: calc(100vw - 44px);
    height: 55vh;
  }
}

/* Global Create Dialog — 3x3 grid */
.global-create-dialog {
  border-radius: 8px !important;
  min-width: 340px;
  max-width: 380px;
}

.global-create-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px 8px !important;
}

.global-create-body {
  padding: 8px 18px 18px !important;
}

.global-create-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.global-create-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 14px 6px 10px;
  border: none;
  background: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s ease;
}
.global-create-item:hover {
  background: rgba(0, 0, 0, 0.04);
}
:global(body.body--dark) .global-create-item:hover {
  background: rgba(255, 255, 255, 0.08);
}

.global-create-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.global-create-label {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--neutral-700, #424242);
  text-align: center;
  line-height: 1.2;
}
:global(body.body--dark) .global-create-label {
  color: #ccc;
}

/* Create Form Dialog (maximized) */
.create-form-dialog {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.create-form-dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 12px !important;
  flex-shrink: 0;
}

.create-form-dialog-body {
  flex: 1;
  overflow: hidden;
  position: relative;
}

.create-form-dialog-body .q-layout {
  height: 100%;
}

.create-form-dialog-body .q-page-container {
  height: 100%;
  overflow-y: auto;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
}
</style>
