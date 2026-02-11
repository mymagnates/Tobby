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

      <!-- User Profile Section at Bottom -->
      <div class="drawer-profile-section">
        <!-- Profile Item -->
        <q-item clickable @click="goToProfile" class="profile-item">
          <q-item-section avatar>
            <q-avatar size="40px" color="primary" text-color="white">
              <img
                v-if="userDataStore.user?.photoURL"
                :src="userDataStore.user.photoURL"
                alt="User Avatar"
              />
              <span v-else>{{ getUserInitials() }}</span>
            </q-avatar>
          </q-item-section>
          <q-item-section>
            <q-item-label class="profile-name">{{ getUserDisplayName() }}</q-item-label>
            <q-item-label caption class="profile-role">{{
              userDataStore.userCategory || 'User'
            }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-icon name="settings" color="grey-6" size="20px" />
          </q-item-section>
        </q-item>

        <!-- Sign Out Item -->
        <q-item clickable @click="handleSignOut" class="signout-item">
          <q-item-section avatar>
            <q-icon name="logout" color="grey-7" size="20px" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ t('signOut') }}</q-item-label>
          </q-item-section>
        </q-item>
      </div>
    </q-drawer>

    <!-- Top Header -->
    <q-header class="dashboard-header">
      <q-toolbar class="header-toolbar q-px-lg">
        <!-- Handout Logo - Shows when sidebar is closed -->
        <div v-if="!leftDrawerOpen" class="header-handout-logo" @click="toggleLeftDrawer">
          <span class="header-app-title">Handout</span>
        </div>

        <q-space />

        <!-- Logo Image -->
        <div class="header-logo" @click="refreshAllData">
          <img src="/logo.svg" alt="Handout Logo" class="header-logo-image" />
        </div>

        <!-- Header Actions: same-size buttons aligned in top bar -->
        <div class="header-actions">
          <!-- Refresh -->
          <q-btn flat round dense icon="refresh" @click="refreshAllData" class="header-action-btn">
            <q-tooltip>Refresh data</q-tooltip>
          </q-btn>

          <!-- Language Switcher -->
          <q-btn-dropdown
            flat
            dense
            :label="currentLanguageLabel"
            class="header-action-btn language-switcher"
            content-class="language-dropdown"
          >
            <q-tooltip>Language</q-tooltip>
            <q-list>
              <q-item
                clickable
                v-close-popup
                @click="changeLanguage('en-US')"
                :active="currentLocale === 'en-US'"
              >
                <q-item-section avatar>
                  <q-icon name="flag" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>English</q-item-label>
                </q-item-section>
                <q-item-section side v-if="currentLocale === 'en-US'">
                  <q-icon name="check" color="primary" />
                </q-item-section>
              </q-item>
              <q-item
                clickable
                v-close-popup
                @click="changeLanguage('es-ES')"
                :active="currentLocale === 'es-ES'"
              >
                <q-item-section avatar>
                  <q-icon name="flag" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Español</q-item-label>
                </q-item-section>
                <q-item-section side v-if="currentLocale === 'es-ES'">
                  <q-icon name="check" color="primary" />
                </q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>

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

// Change language
function changeLanguage(lang) {
  locale.value = lang
  localStorage.setItem('handout-locale', lang)
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
    title: t('documents'),
    caption: t('viewAllDocuments'),
    icon: 'folder',
    link: '/documents',
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

function getUserInitials() {
  if (userDataStore.user?.displayName) {
    const names = userDataStore.user.displayName.split(' ')
    return names.length > 1
      ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
      : names[0][0].toUpperCase()
  }
  if (userDataStore.user?.email) {
    return userDataStore.user.email[0].toUpperCase()
  }
  return 'U'
}

function getUserDisplayName() {
  return userDataStore.user?.displayName || userDataStore.user?.email?.split('@')[0] || 'User'
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

/* Drawer Profile Section */
.drawer-profile-section {
  margin-top: auto;
  padding: 16px;
  border-top: 1px solid #e5e7eb;
}

.profile-item {
  border-radius: 12px;
  transition: all 0.3s ease;
  padding: 12px 16px;
  margin-bottom: 8px;
}

.profile-item:hover {
  background: #f3f4f6;
}

.profile-name {
  font-weight: 600;
  color: #1f2937;
  font-size: 0.95rem;
}

.profile-role {
  color: #6b7280;
  font-size: 0.8rem;
}

.signout-item {
  border-radius: 12px;
  transition: all 0.3s ease;
  padding: 12px 16px;
  color: #6b7280;
}

.signout-item:hover {
  background: #fee2e2;
  color: #dc2626;
}

.signout-item:hover .q-icon {
  color: #dc2626;
}

/* ========================================
   HEADER STYLING
   ======================================== */

.dashboard-header {
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  box-shadow: none;
  height: 56px;
  min-height: 56px;
}

.header-toolbar {
  display: flex;
  align-items: center;
  height: 56px;
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
  color: var(--primary-color) !important;
  background: transparent !important;
  border: 1px solid var(--neutral-200) !important;
  border-radius: 8px !important;
  transition: all 0.2s ease;
  margin: 0 4px;
}

.header-action-btn .q-icon {
  color: var(--primary-color) !important;
  font-size: 20px;
}

.header-action-btn:hover {
  background: var(--primary-glow) !important;
  border-color: var(--primary-color) !important;
}

/* Language switcher: same 40x40, label centered */
.language-switcher {
  font-weight: 600 !important;
  font-size: 0.75rem !important;
}

.language-switcher .q-btn__content {
  justify-content: center;
}

.dark-mode-btn {
  border: 1px solid var(--neutral-200) !important;
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
    height: 52px;
    min-height: 52px;
  }

  .header-toolbar {
    height: 52px;
    min-height: 52px;
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

:global(body.body--dark) .profile-name {
  color: white !important;
}

:global(body.body--dark) .profile-role {
  color: #b0b0b0 !important;
}

:global(body.body--dark) .signout-item {
  color: #b0b0b0;
}

:global(body.body--dark) .signout-item:hover {
  background: rgba(220, 38, 38, 0.2);
  color: #ef5350;
}

:global(body.body--dark) .drawer-profile-section {
  border-top-color: #3d3d3d;
  background: #1a1a1a;
}

:global(body.body--dark) .profile-item {
  background: transparent;
}

:global(body.body--dark) .profile-item:hover {
  background: #2d2d2d;
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

/* Dark mode: all header action buttons same style */
:global(body.body--dark) .header-action-btn {
  color: var(--primary-color) !important;
  background: transparent !important;
  border-color: var(--neutral-300) !important;
}

:global(body.body--dark) .header-action-btn .q-icon {
  color: var(--primary-color) !important;
}

:global(body.body--dark) .header-action-btn:hover {
  background: var(--primary-glow) !important;
  border-color: var(--primary-color) !important;
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
