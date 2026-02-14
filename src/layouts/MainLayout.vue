<template>
  <q-layout view="lHh Lpr lFr" class="dashboard-layout">
    <!-- Dark Left Sidebar -->
    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      side="left"
      :width="240"
      class="dark-drawer"
      :breakpoint="1024"
    >
      <!-- Logo Text - Click to collapse menu -->
      <div class="drawer-logo-icon" @click="toggleLeftDrawer">
        <span class="sidebar-app-title">Handout</span>
      </div>

      <!-- Navigation Links -->
      <q-list class="nav-list">
        <EssentialLink v-for="link in linksList" :key="link.title" v-bind="link" class="nav-link" />
      </q-list>

    </q-drawer>

    <!-- Top Header -->
    <q-header class="dashboard-header">
      <q-toolbar class="header-toolbar q-px-lg">
        <!-- Handout Logo - Shows when sidebar is closed -->
        <div v-if="!leftDrawerOpen" class="header-handout-logo" @click="toggleLeftDrawer">
          <span class="header-app-title">Handout</span>
        </div>

        <q-space />


        <!-- Header Actions: same-size buttons aligned in top bar -->
        <div class="header-actions">
          <!-- Refresh -->
          <q-btn
            flat
            round
            dense
            icon="refresh"
            @click="refreshAllData"
            class="header-action-btn refresh-btn"
          >
            <q-tooltip>Refresh data</q-tooltip>
          </q-btn>

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

          <q-btn
            flat
            round
            dense
            icon="manage_accounts"
            class="header-action-btn profile-btn"
            @click="goToProfile"
          >
            <q-tooltip>User Profile</q-tooltip>
          </q-btn>

          <q-btn
            flat
            round
            dense
            icon="logout"
            class="header-action-btn signout-btn"
            @click="handleSignOut"
          >
            <q-tooltip>{{ t('signOut') }}</q-tooltip>
          </q-btn>
        </div>
      </q-toolbar>
    </q-header>

    <q-page-container class="page-container">
      <!-- Loading indicator for data loading -->
      <div v-if="dataLoading" class="data-loading-overlay">
        <q-spinner-dots size="40px" color="primary" />
        <div class="loading-text">Loading your data...</div>
      </div>

      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { useUserDataStore } from '../stores/userDataStore'
import { useFirebase } from '../composables/useFirebase'
import EssentialLink from 'components/EssentialLink.vue'

const $q = useQuasar()
const router = useRouter()
const { locale, t } = useI18n()
const userDataStore = useUserDataStore()
const { logout } = useFirebase()

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

        // 1. User is authenticated (already checked above)
        // 2. Redirect to index page if not already there
        if (currentPath !== '/' && !isOnLoadingPage) {
          console.log('MainLayout - Redirecting to index page')
          router.push('/')
        }

        // 3. Check if data is already loaded
        const hasData = userDataStore.userAccessibleProperties.length > 0

        // 4. If not loaded -> Load data immediately
        if (!hasData && !userDataStore.profileLoading) {
          console.log('MainLayout - Loading data')
          loadAllUserData()
        } else {
          // 5. If loaded -> Do nothing
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

// Refresh all data
async function refreshAllData() {
  if (!userDataStore.isAuthenticated) {
    return
  }

  console.log('MainLayout - Refreshing all data...')
  await loadAllUserData()

  // Show success notification
  import('quasar').then(({ Notify }) => {
    Notify.create({
      type: 'positive',
      message: 'Data refreshed successfully',
      position: 'top',
      timeout: 2000,
    })
  })
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
  background: #f5f7fa;
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
  background: #ffffff;
  border-right: 1px solid #e5e7eb;
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
  padding: 20px 16px;
  flex: 1;
}

/* ========================================
   HEADER STYLING
   ======================================== */

.dashboard-header {
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  box-shadow: none;
  min-height: 56px;
  padding-top: max(10px, env(safe-area-inset-top, 10px));
}

.header-toolbar {
  display: flex;
  align-items: center;
  min-height: 56px;
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
  gap: 0;
  margin-left: 12px;
}

/* Base: all header action buttons same size */
.header-action-btn {
  width: 40px !important;
  min-width: 40px !important;
  height: 40px !important;
  min-height: 40px !important;
  padding: 0 !important;
  color: #82A6D7 !important;
  background: transparent !important;
  border: 1.5px solid #82A6D7 !important;
  border-radius: 2px !important;
  transition: all 0.2s ease;
  margin: 0 4px;
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
  background: rgba(130, 166, 215, 0.12) !important;
  transform: translateY(-1px);
  box-shadow: 0 4px 10px rgba(93, 139, 196, 0.18);
}

/* Language switcher: same 40x40, label centered, text only */
.language-switcher {
  font-weight: 600 !important;
  font-size: 0.875rem !important;
  background: transparent !important;
  color: #82A6D7 !important;
}

.language-switcher :deep(.q-btn__content) {
  justify-content: center;
}

.language-switcher:hover {
  background: rgba(130, 166, 215, 0.12) !important;
}

/* Refresh and Dark Mode buttons: primary background with white icon */
.refresh-btn,
.dark-mode-btn {
  background: transparent !important;
  border: 1.5px solid #82A6D7 !important;
  color: #82A6D7 !important;
}

.refresh-btn:hover,
.dark-mode-btn:hover {
  background: rgba(130, 166, 215, 0.12) !important;
}

.profile-btn {
  margin-left: 8px;
  background: transparent !important;
  border: 1.5px solid #f59e0b !important;
  color: #f59e0b !important;
}

.profile-btn:hover {
  background: rgba(245, 158, 11, 0.14) !important;
  color: #d97706 !important;
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
  border-radius: 10px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Page Container */
.page-container {
  background: #f5f7fa;
  min-height: 100vh;
  position: relative;
  overflow-y: auto; /* Allow scrolling */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
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
    padding-top: min(12px, env(safe-area-inset-top, 10px));
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
  outline: 2px solid #1976d2;
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
  background: #121212;
}

:global(body.body--dark) .dark-drawer {
  background: #1a1a1a;
  border-right-color: #3d3d3d;
  color: white;
}

:global(body.body--dark) .dashboard-header {
  background: #1a1a1a;
  border-bottom-color: #3d3d3d;
  color: white;
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
  background: #121212;
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
  color: #8fb4e3 !important;
  background: transparent !important;
  border: 1.5px solid #8fb4e3 !important;
}

:global(body.body--dark) .header-action-btn:hover {
  background: rgba(143, 180, 227, 0.16) !important;
  color: #b9d4f3 !important;
}

:global(body.body--dark) .language-switcher {
  background: transparent !important;
}

:global(body.body--dark) .language-switcher:hover {
  background: rgba(143, 180, 227, 0.16) !important;
}

:global(body.body--dark) .refresh-btn,
:global(body.body--dark) .dark-mode-btn {
  background: transparent !important;
  border: 1.5px solid #8fb4e3 !important;
  color: #8fb4e3 !important;
}

:global(body.body--dark) .refresh-btn:hover,
:global(body.body--dark) .dark-mode-btn:hover {
  background: rgba(143, 180, 227, 0.16) !important;
  color: #b9d4f3 !important;
}

:global(body.body--dark) .profile-btn {
  background: transparent !important;
  border: 1.5px solid #fbbf24 !important;
  color: #fbbf24 !important;
}

:global(body.body--dark) .profile-btn:hover {
  background: rgba(251, 191, 36, 0.16) !important;
  color: #fcd34d !important;
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
</style>
