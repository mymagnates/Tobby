<template>
  <q-layout view="lHh Lpr lFr" class="dashboard-layout">
    <!-- Dark Left Sidebar -->
    <q-drawer
      v-model="leftDrawerOpen"
      side="left"
      :width="240"
      class="dark-drawer"
      :breakpoint="1024"
      overlay
      bordered
    >
      <!-- Logo Text - Click to collapse menu -->
      <div class="drawer-logo-icon" @click="goHome">
        <span class="sidebar-app-title">Handout</span>
      </div>

      <!-- Navigation Links -->
      <q-list class="nav-list">
        <template v-for="(section, sectionIndex) in navSections" :key="section.key">
          <div class="nav-group">
            <EssentialLink
              v-for="link in section.links"
              :key="`${section.key}-${link.link}`"
              v-bind="link"
              class="nav-child-link"
            />
          </div>
          <div v-if="sectionIndex < navSections.length - 1" class="nav-group-gap" />
        </template>
      </q-list>

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
              flat
              round
              dense
              icon="search"
              class="header-action-btn"
              @click="goToUniversalSearch"
            >
              <q-tooltip>Universal Search</q-tooltip>
            </q-btn>

            <q-btn
              flat
              round
              dense
              icon="forum"
              class="header-action-btn"
              @click="showGlobalContactsDialog = true"
            >
              <q-tooltip>Contacts</q-tooltip>
            </q-btn>

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
            flat
            dense
            :label="currentLanguageLabel"
            class="header-action-btn language-switcher"
            @click="toggleLanguage"
          >
            <q-tooltip>Switch Language</q-tooltip>
          </q-btn>

          <!-- Dark Mode Toggle -->
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
              <q-item clickable v-close-popup @click="goToProfile">
                <q-item-section avatar>
                  <q-icon name="manage_accounts" />
                </q-item-section>
                <q-item-section>User Profile</q-item-section>
              </q-item>
              <q-separator />
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

      <router-view />
    </q-page-container>

    <q-dialog v-model="showGlobalCreateDialog">
      <q-card style="min-width: 420px">
        <q-card-section class="row items-center justify-between">
          <div class="text-h6">Create</div>
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-separator />
        <q-card-section class="q-gutter-sm">
          <q-btn
            v-for="option in globalCreateOptions"
            :key="option.label"
            outline
            color="primary"
            class="full-width justify-start"
            :icon="option.icon"
            :label="option.label"
            @click="openGlobalCreateOption(option.path)"
          />
        </q-card-section>
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
    <div class="global-assistant-widget">
      <q-btn
        v-if="!showAssistantPanel"
        round
        color="primary"
        icon="chat"
        size="md"
        class="assistant-fab"
        @click="showAssistantPanel = true"
      >
        <q-tooltip>Assistant</q-tooltip>
      </q-btn>

      <transition name="assistant-slide">
        <q-card v-if="showAssistantPanel" class="assistant-panel">
          <q-card-section class="assistant-panel-header">
            <div class="assistant-panel-title">
              <q-icon name="smart_toy" size="20px" class="q-mr-sm" />
              Assistant
            </div>
            <q-btn flat round dense icon="close" size="sm" @click="showAssistantPanel = false" />
          </q-card-section>
          <q-separator />
          <q-card-section class="assistant-panel-body">
            <div class="assistant-placeholder">
              <q-icon name="construction" size="48px" color="grey-4" />
              <div class="assistant-placeholder-text">Coming soon</div>
              <div class="assistant-placeholder-sub">This space is reserved for the assistant feature.</div>
            </div>
          </q-card-section>
        </q-card>
      </transition>
    </div>
  </q-layout>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { useUserDataStore } from '../stores/userDataStore'
import { useFirebase } from '../composables/useFirebase'
import EssentialLink from 'components/EssentialLink.vue'

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
  '/user-profile': 'User Profile',
  '/tenant-home': 'Tenant Home',
  '/create-tenant': 'Create Tenant'
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
const isPmPo = computed(() => userDataStore.userCategory === 'PM/PO')
const showGlobalCreateDialog = ref(false)
const showGlobalContactsDialog = ref(false)
const showAssistantPanel = ref(false)

const globalCreateOptions = [
  { label: 'Create Property', icon: 'home_work', path: '/create-property' },
  { label: 'Create Task', icon: 'build', path: '/create-mxrecord' },
  { label: 'Create Transaction', icon: 'receipt_long', path: '/create-transaction' },
  { label: 'Create Lease', icon: 'description', path: '/create-lease' },
  { label: 'Create Reminder', icon: 'notifications', path: '/reminders' },
  { label: 'Create Document', icon: 'folder', path: '/documents' },
  { label: 'Create Asset', icon: 'inventory_2', path: '/assets' },
]

const globalContacts = [
  { id: 'c1', name: 'AquaFix LLC', role: 'SP • Plumbing', initials: 'AF' },
  { id: 'c2', name: 'Westlake Tenant', role: 'TT', initials: 'WT' },
  { id: 'c3', name: 'Property Owner', role: 'PO', initials: 'PO' },
]

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

// Initialize dark mode from localStorage
onMounted(() => {
  const savedDarkMode = localStorage.getItem('handout-dark-mode')
  if (savedDarkMode !== null) {
    isDarkMode.value = savedDarkMode === 'true'
    $q.dark.set(isDarkMode.value)
    applyDarkModeClass(isDarkMode.value)
  }
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
    caption: t('mainPage'),
    icon: 'dashboard',
    link: '/',
    allowedFor: ['owner', 'manager', 'admin', 'PM', 'PO'], // Not for tenants
  },
  {
    title: 'PM/PO Feed',
    caption: 'Social feed prototype',
    icon: 'dynamic_feed',
    link: '/pm-po-feed',
    allowedFor: ['owner', 'manager', 'admin', 'PM', 'PO'],
  },
  {
    title: t('dashboard'),
    caption: 'SP workspace',
    icon: 'dashboard',
    link: '/sp-dashboard',
    allowedFor: ['contractor', 'SP', 'sp'],
  },
  {
    title: t('Properties'),
    caption: t('viewYourProperties'),
    icon: 'home',
    link: '/my-properties',
    allowedFor: ['owner', 'manager', 'admin', 'PM', 'PO'],
  },
  {
    title: t('tasks'),
    caption: t('viewAllTasks'),
    icon: 'dns',
    link: '/mx-records',
    allowedFor: ['owner', 'manager', 'admin', 'PM', 'PO'],
  },
  {
    title: 'Biz Card',
    caption: 'Saved business cards',
    icon: 'badge',
    link: '/sp-cards',
    allowedFor: ['owner', 'manager', 'admin', 'PM', 'PO'],
  },
  {
    title: t('transactions'),
    caption: t('viewAllTransactions'),
    icon: 'receipt_long',
    link: '/transactions',
    allowedFor: ['owner', 'manager', 'admin', 'PM', 'PO'],
  },
  {
    title: t('reminders'),
    caption: t('manageReminders'),
    icon: 'notifications',
    link: '/reminders',
    allowedFor: ['owner', 'manager', 'admin', 'PM', 'PO'],
  },
  {
    title: t('documents'),
    caption: t('viewAllDocuments'),
    icon: 'folder',
    link: '/documents',
    allowedFor: ['owner', 'manager', 'admin', 'PM', 'PO'],
  },
  {
    title: t('assets'),
    caption: t('viewAllAssets'),
    icon: 'inventory_2',
    link: '/assets',
    allowedFor: ['owner', 'manager', 'admin', 'PM', 'PO'],
  },
  {
    title: t('leases'),
    caption: t('viewAllLeases'),
    icon: 'description',
    link: '/leases',
    allowedFor: ['owner', 'manager', 'admin', 'PM', 'PO'],
  },
  {
    title: t('tenants'),
    caption: t('manageAllTenants'),
    icon: 'people',
    link: '/tenants',
    allowedFor: ['owner', 'manager', 'admin', 'PM', 'PO'],
  },
  {
    title: t('tenantHome'),
    caption: t('tenantHomePage'),
    icon: 'home_work',
    link: '/tenant-home',
    allowedFor: ['tenant'], // Only for tenants
  },
  {
    title: t('reports'),
    caption: t('viewReportsAnalytics'),
    icon: 'assessment',
    link: '/reports',
    allowedFor: ['owner', 'manager', 'admin', 'PM', 'PO'],
  },
  {
    title: 'Leads',
    caption: 'Open opportunities',
    icon: 'ads_click',
    link: '/sp-leads',
    allowedFor: ['contractor', 'SP', 'sp'],
  },
  {
    title: 'Bids',
    caption: 'My submitted bids',
    icon: 'gavel',
    link: '/sp-bids',
    allowedFor: ['contractor', 'SP', 'sp'],
  },
  {
    title: 'Documents',
    caption: 'Project documents',
    icon: 'folder',
    link: '/sp-documents',
    allowedFor: ['contractor', 'SP', 'sp'],
  },
  {
    title: 'Messages',
    caption: 'Reserved module',
    icon: 'chat_bubble_outline',
    link: '/sp-messages',
    allowedFor: ['contractor', 'SP', 'sp'],
  },
  {
    title: 'Projects',
    caption: 'Accepted work',
    icon: 'work_outline',
    link: '/sp-projects',
    allowedFor: ['contractor', 'SP', 'sp'],
  },
  {
    title: 'Invoices',
    caption: 'Create and submit',
    icon: 'request_quote',
    link: '/sp-invoices',
    allowedFor: ['contractor', 'SP', 'sp'],
  },

])

// Computed property to filter links based on user category
const linksList = computed(() => {
  const userCategory = userDataStore.userCategory
  console.log('MainLayout - Filtering menu for user category:', userCategory)

  // If no user category yet (still loading), show nothing
  if (!userCategory) {
    return []
  }

  // Filter links based on user category
  const filtered = allLinksList.value.filter((link) => {
    // Handle "PM/PO" as a single category
    if (userCategory === 'PM/PO') {
      // PM/PO users should see all property management pages
      return link.allowedFor.includes('PM') || link.allowedFor.includes('PO')
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
  if (['/', '/pm-po-feed', '/sp-dashboard'].includes(path)) return 'dashboard'
  if (['/my-properties', '/assets', '/documents'].includes(path)) return 'propertyAssetDocuments'
  if (['/mx-records', '/transactions', '/reminders', '/leases', '/tenants'].includes(path))
    return 'taskTransactionReminderLeaseTenants'
  if (['/reports', '/sp-cards'].includes(path)) return 'reportBizCard'
  if (
    ['/sp-leads', '/sp-bids', '/sp-documents', '/sp-messages', '/sp-projects', '/sp-invoices'].includes(
      path,
    )
  )
    return 'spPortal'
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
  router.push('/user-profile')
}

function goToUniversalSearch() {
  router.push('/universal-search')
}

function openGlobalCreateOption(path) {
  showGlobalCreateDialog.value = false
  router.push(path)
}
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
  background: var(--bg-primary);
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
  background: var(--bg-surface);
  border-right: 1px solid var(--border-color);
  box-shadow: none;
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
  background: var(--primary-glow);
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

.nav-list {
  padding: 14px 12px;
  flex: 1;
}

.nav-child-link {
  margin: 0 0 3px;
}

.nav-group {
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-drawer);
  background: var(--bg-surface);
  padding: 5px;
}

.nav-group-gap {
  height: 6px;
}

/* ========================================
   HEADER STYLING
   ======================================== */

.dashboard-header {
  background: transparent;
  border-bottom: none;
  box-shadow: none;
  min-height: 56px;
  padding: max(10px, env(safe-area-inset-top, 10px)) 20px 0;
}

.dashboard-header .header-toolbar {
  max-width: none;
  width: 100%;
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-drawer);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
  min-height: 56px;
  padding-left: 5px;
  padding-right: 10px;
  transition: box-shadow 0.3s ease, border-color 0.3s ease;
}

.dashboard-header .header-toolbar:hover {
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
  border-color: var(--neutral-400, var(--border-color));
}

.header-toolbar {
  display: flex;
  align-items: center;
  min-height: 56px;
}

.header-center-title {
  flex: 1;
  text-align: center;
  font-size: 1.125rem;
  font-weight: 600;
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
  background: var(--bg-surface) !important;
  border: 1.5px solid var(--border-strong) !important;
  border-radius: var(--border-radius-card) !important;
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
  background: var(--accent-glow) !important;
  border-color: var(--accent-color) !important;
  color: var(--accent-dark) !important;
  transform: translateY(-1px);
  box-shadow: 0 4px 10px rgba(20, 184, 166, 0.2);
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
  background: rgba(20, 184, 166, 0.08) !important;
  border: 1.5px solid var(--accent-color) !important;
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
  background: var(--bg-primary);
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
}

:global(body.body--dark) .dashboard-header {
  background: transparent;
  color: white;
}

:global(body.body--dark) .dashboard-header .header-toolbar {
  background: var(--bg-surface);
  border-color: var(--border-color);
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
  color: var(--primary-color) !important;
  background: rgba(15, 23, 42, 0.35) !important;
  border: 1.5px solid var(--border-strong) !important;
}

:global(body.body--dark) .header-action-btn:hover {
  background: rgba(45, 212, 191, 0.2) !important;
  border-color: var(--accent-color) !important;
  color: #99f6e4 !important;
}

:global(body.body--dark) .language-switcher {
  background: transparent !important;
}

:global(body.body--dark) .language-switcher:hover {
  background: rgba(45, 212, 191, 0.2) !important;
}

:global(body.body--dark) .refresh-btn,
:global(body.body--dark) .dark-mode-btn {
  background: transparent !important;
  border: 1.5px solid var(--border-strong) !important;
  color: var(--primary-color) !important;
}

:global(body.body--dark) .refresh-btn:hover,
:global(body.body--dark) .dark-mode-btn:hover {
  background: rgba(45, 212, 191, 0.2) !important;
  color: #99f6e4 !important;
}

:global(body.body--dark) .profile-btn {
  background: rgba(45, 212, 191, 0.16) !important;
  border: 1.5px solid var(--accent-color) !important;
  color: #99f6e4 !important;
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
  height: calc(100vh - 260px);
  max-height: 560px;
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
  align-items: center;
  justify-content: center;
  padding: 8px !important;
}

.assistant-placeholder {
  text-align: center;
}

.assistant-placeholder-text {
  font-size: 0.92rem;
  font-weight: 600;
  color: var(--neutral-600);
  margin-top: 12px;
}

.assistant-placeholder-sub {
  font-size: 0.76rem;
  color: var(--neutral-400);
  margin-top: 4px;
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
</style>
