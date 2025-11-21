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
      <!-- Logo Icon -->
      <div class="drawer-logo-icon">
        <img src="/logo.svg" alt="Logo" class="sidebar-logo" />
      </div>

      <!-- Navigation Links -->
      <q-list class="nav-list">
        <EssentialLink v-for="link in linksList" :key="link.title" v-bind="link" class="nav-link" />
      </q-list>
    </q-drawer>

    <!-- Top Header -->
    <q-header elevated class="dashboard-header">
      <q-toolbar class="q-px-lg">
        <!-- Mobile Menu Button -->
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
          class="menu-btn lt-lg"
        />

        <!-- Logo -->
        <div class="header-logo">
          <img src="/logo.svg" alt="Logo" class="logo-image" />
          <span class="header-app-title">HANDOUT</span>
        </div>

        <q-space />

        <!-- Header Actions -->
        <div class="header-actions">
          <!-- History/Clock Icon -->
          <q-btn flat round dense icon="schedule" color="grey-7" class="action-btn">
            <q-tooltip>History</q-tooltip>
          </q-btn>

          <!-- Notifications -->
          <q-btn flat round dense icon="notifications" color="grey-7" class="action-btn">
            <q-badge color="primary" floating rounded />
            <q-tooltip>Notifications</q-tooltip>
          </q-btn>

          <!-- User Profile -->
          <q-btn-dropdown flat no-caps class="user-profile-btn">
            <template v-slot:label>
              <div class="row items-center no-wrap">
                <q-avatar size="36px" color="primary" text-color="white">
                  <img
                    v-if="userDataStore.user?.photoURL"
                    :src="userDataStore.user.photoURL"
                    alt="User Avatar"
                  />
                  <span v-else>{{ getUserInitials() }}</span>
                </q-avatar>
                <div class="user-info q-ml-sm gt-sm">
                  <div class="user-name-text">{{ getUserDisplayName() }}</div>
                  <div class="user-role-text">{{ userDataStore.userCategory || 'User' }}</div>
                </div>
              </div>
            </template>

            <q-list class="user-menu-list">
              <q-item clickable v-close-popup @click="goToProfile" class="menu-item">
                <q-item-section avatar>
                  <q-icon name="person" color="primary" />
                </q-item-section>
                <q-item-section>Profile & Settings</q-item-section>
              </q-item>

              <q-separator />

              <q-item clickable v-close-popup @click="handleSignOut" class="menu-item">
                <q-item-section avatar>
                  <q-icon name="logout" color="grey-7" />
                </q-item-section>
                <q-item-section>Sign Out</q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
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
import { ref, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserDataStore } from '../stores/userDataStore'
import { useFirebase } from '../composables/useFirebase'
import EssentialLink from 'components/EssentialLink.vue'

const router = useRouter()
const userDataStore = useUserDataStore()
const { logout } = useFirebase()

const allLinksList = [
  {
    title: 'Dashboard',
    caption: 'Main page',
    icon: 'dashboard',
    link: '/',
    allowedFor: ['owner', 'manager', 'admin', 'PM', 'PO'], // Not for tenants
  },
  {
    title: 'My Properties',
    caption: 'View your properties',
    icon: 'home',
    link: '/my-properties',
    allowedFor: ['owner', 'manager', 'admin', 'PM', 'PO'],
  },
  {
    title: 'Tasks',
    caption: 'View all tasks',
    icon: 'dns',
    link: '/mx-records',
    allowedFor: ['owner', 'manager', 'admin', 'PM', 'PO'],
  },
  {
    title: 'Transactions',
    caption: 'View all transactions',
    icon: 'receipt_long',
    link: '/transactions',
    allowedFor: ['owner', 'manager', 'admin', 'PM', 'PO'],
  },
  {
    title: 'Reminders',
    caption: 'Manage reminders',
    icon: 'notifications',
    link: '/reminders',
    allowedFor: ['owner', 'manager', 'admin', 'PM', 'PO'],
  },
  {
    title: 'Reports',
    caption: 'View reports & analytics',
    icon: 'assessment',
    link: '/reports',
    allowedFor: ['owner', 'manager', 'admin', 'PM', 'PO'],
  },
  {
    title: 'Leases',
    caption: 'View all leases',
    icon: 'description',
    link: '/leases',
    allowedFor: ['owner', 'manager', 'admin', 'PM', 'PO'],
  },
  {
    title: 'Tenants',
    caption: 'Manage all tenants',
    icon: 'people',
    link: '/tenants',
    allowedFor: ['owner', 'manager', 'admin', 'PM', 'PO'],
  },
  {
    title: 'Create Tenant',
    caption: 'Manually add a new tenant',
    icon: 'person_add',
    link: '/create-tenant',
    allowedFor: ['owner', 'manager', 'admin', 'PM', 'PO'],
  },

  {
    title: 'Tenant Home',
    caption: 'Tenant home page',
    icon: 'home_work',
    link: '/tenant-home',
    allowedFor: ['tenant'], // Only for tenants
  },
]

// Computed property to filter links based on user category
const linksList = computed(() => {
  const userCategory = userDataStore.userCategory
  console.log('MainLayout - Filtering menu for user category:', userCategory)

  // If no user category yet (still loading), show nothing
  if (!userCategory) {
    return []
  }

  // Filter links based on user category
  const filtered = allLinksList.filter((link) => {
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
      const isOnIndexPage = currentPath === '/'
      const hasData = userDataStore.userAccessibleProperties.length > 0

      // On page refresh with authenticated user, redirect to loading page if not already there or on index
      if (wasAuthenticated === undefined && !isOnLoadingPage && !isOnIndexPage && !hasData) {
        console.log('MainLayout - Page refresh detected, redirecting to loading page')
        router.push('/loading')
        return
      }

      // Only load data in background if not on loading page and data not already loaded
      if (!isOnLoadingPage && !hasData && !userDataStore.profileLoading) {
        console.log('MainLayout - Loading user data in background')
        needsRedirectAfterLoad.value = true
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

/* ========================================
   DARK SIDEBAR STYLING
   ======================================== */

.dark-drawer {
  background: #ffffff;
  border-right: 1px solid #e5e7eb;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.05);
}

.drawer-logo-icon {
  padding: 32px 20px 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid #e5e7eb;
}

.sidebar-logo {
  height: 48px;
  width: auto;
  transition: all 0.3s ease;
  cursor: pointer;
}

.sidebar-logo:hover {
  transform: scale(1.1);
}

.nav-list {
  padding: 20px 16px;
}

/* ========================================
   HEADER STYLING
   ======================================== */

.dashboard-header {
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  height: 72px;
}

.menu-btn {
  color: #6b7280;
  margin-right: 12px;
  transition: all 0.3s ease;
}

.menu-btn:hover {
  background: #f3f4f6;
  color: #1976d2;
}

/* Header Logo */
.header-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-left: 16px;
  cursor: pointer;
}

.logo-image {
  height: 36px;
  width: auto;
  transition: all 0.3s ease;
}

.header-logo:hover .logo-image {
  transform: scale(1.05);
}

.header-app-title {
  font-family: 'Pacifico', cursive;
  font-size: 1.5rem;
  font-weight: 400;
  color: #1976d2;
  letter-spacing: 0.02em;
  transition: all 0.3s ease;
}

.header-logo:hover .header-app-title {
  transform: scale(1.05);
}

/* Header Actions */
.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-btn {
  transition: all 0.3s ease;
}

.action-btn:hover {
  background: #f3f4f6;
}

/* User Profile Button */
.user-profile-btn {
  padding: 4px 12px 4px 4px;
  border-radius: 24px;
  transition: all 0.3s ease;
}

.user-profile-btn:hover {
  background: #f3f4f6;
}

.user-info {
  text-align: left;
}

.user-name-text {
  font-size: 0.875rem;
  font-weight: 600;
  color: #111827;
  line-height: 1.2;
}

.user-role-text {
  font-size: 0.75rem;
  color: #6b7280;
  line-height: 1.2;
}

/* User Menu Dropdown */
.user-menu-list {
  min-width: 240px;
  border-radius: 12px;
  padding: 8px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12);
}

.menu-item {
  transition: all 0.3s ease;
  border-radius: 8px;
  margin: 2px 0;
  padding: 12px 16px;
}

.menu-item:hover {
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
  color: #1976d2;
}

/* ========================================
   RESPONSIVE DESIGN
   ======================================== */

@media (max-width: 768px) {
  .dashboard-header {
    height: 60px;
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

  .user-profile-btn {
    padding: 4px;
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

.user-profile-btn:focus,
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
</style>
