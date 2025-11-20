<template>
  <q-layout view="lHh Lpr lFr" class="sleek-layout">
    <q-header bordered class="sleek-header">
      <q-toolbar class="q-px-md">
        <q-btn
          flat
          dense
          round
          icon="o_menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
          class="menu-btn lt-md"
        />

        <q-toolbar-title class="row items-center">
          <div class="logo-container">
            <span class="app-title">HANDOUT</span>
          </div>
        </q-toolbar-title>

        <div class="header-actions">
          <q-btn-dropdown flat round icon="o_person" class="user-menu">
            <template v-slot:label>
              <div v-if="userDataStore.user?.photoURL" class="row items-center">
                <q-avatar size="28px" class="q-mr-sm">
                  <img :src="userDataStore.user.photoURL" alt="User Avatar" />
                </q-avatar>
              </div>
              <span v-if="userDataStore.user?.displayName" class="text-weight-medium user-name">
                {{ userDataStore.user.displayName }}
              </span>
              <span v-else-if="userDataStore.user?.email" class="text-weight-medium user-name">
                {{ userDataStore.user.email.split('@')[0] }}
              </span>
              <span v-else class="text-weight-medium user-name"> User </span>
            </template>

            <q-list class="user-menu-list">
              <q-item clickable v-close-popup @click="goToProfile" class="menu-item">
                <q-item-section avatar>
                  <q-icon name="o_person" color="primary" />
                </q-item-section>
                <q-item-section>Profile & Settings</q-item-section>
              </q-item>

              <q-separator />

              <q-item clickable v-close-popup @click="handleSignOut" class="menu-item">
                <q-item-section avatar>
                  <q-icon name="o_logout" />
                </q-item-section>
                <q-item-section>Sign Out</q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above side="left" :width="280" class="sleek-drawer">
      <div class="drawer-header">
        <div class="drawer-title">Menu</div>
      </div>
      <q-list class="nav-list">
        <EssentialLink v-for="link in linksList" :key="link.title" v-bind="link" class="nav-link" />
      </q-list>
    </q-drawer>

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
    icon: 'o_dashboard',
    link: '/',
    allowedFor: ['owner', 'manager', 'admin', 'PM', 'PO'], // Not for tenants
  },
  {
    title: 'My Properties',
    caption: 'View your properties',
    icon: 'o_home',
    link: '/my-properties',
    allowedFor: ['owner', 'manager', 'admin', 'PM', 'PO'],
  },
  {
    title: 'Tasks',
    caption: 'View all tasks',
    icon: 'o_dns',
    link: '/mx-records',
    allowedFor: ['owner', 'manager', 'admin', 'PM', 'PO'],
  },
  {
    title: 'Transactions',
    caption: 'View all transactions',
    icon: 'o_receipt_long',
    link: '/transactions',
    allowedFor: ['owner', 'manager', 'admin', 'PM', 'PO'],
  },
  {
    title: 'Reminders',
    caption: 'Manage reminders',
    icon: 'o_notifications',
    link: '/reminders',
    allowedFor: ['owner', 'manager', 'admin', 'PM', 'PO'],
  },
  {
    title: 'Reports',
    caption: 'View reports & analytics',
    icon: 'o_assessment',
    link: '/reports',
    allowedFor: ['owner', 'manager', 'admin', 'PM', 'PO'],
  },
  {
    title: 'Leases',
    caption: 'View all leases',
    icon: 'o_description',
    link: '/leases',
    allowedFor: ['owner', 'manager', 'admin', 'PM', 'PO'],
  },
  {
    title: 'Tenants',
    caption: 'Manage all tenants',
    icon: 'o_people',
    link: '/tenants',
    allowedFor: ['owner', 'manager', 'admin', 'PM', 'PO'],
  },
  {
    title: 'Create Tenant',
    caption: 'Manually add a new tenant',
    icon: 'o_person_add',
    link: '/create-tenant',
    allowedFor: ['owner', 'manager', 'admin', 'PM', 'PO'],
  },

  {
    title: 'Tenant Home',
    caption: 'Tenant home page',
    icon: 'o_home_work',
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
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Pacifico&display=swap');

/* Main Colors: Blue (#1976D2), White (#FFFFFF), Gray (#757575) */

.sleek-layout {
  background: #ffffff;
}

.sleek-header {
  background: #ffffff;
  border-bottom: 1px solid #e0e0e0;
  box-shadow: none;
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.app-title {
  font-family: 'Pacifico', cursive;
  font-size: 1.8rem;
  font-weight: 400;
  color: #1976D2;
  letter-spacing: 0.02em;
  transition: all 0.3s ease;
}

.app-title:hover {
  transform: scale(1.05);
}

.menu-btn {
  color: #757575;
  margin-right: 12px;
  transition: all 0.3s ease;
}

.menu-btn:hover {
  background: #f5f5f5;
  color: #1976D2;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-menu {
  transition: all 0.3s ease;
  color: #757575;
  padding: 8px 16px;
  border-radius: 8px;
}

.user-menu:hover {
  background: #f5f5f5;
  color: #1976D2;
}

.user-name {
  color: #757575;
  font-size: 0.95rem;
}

.user-menu-list {
  min-width: 220px;
}

.menu-item {
  transition: all 0.3s ease;
  border-radius: 8px;
  margin: 4px 8px;
}

.menu-item:hover {
  background: #f5f5f5;
}

/* Sleek Drawer Design */
.sleek-drawer {
  background: #ffffff;
  border-right: 1px solid #e0e0e0;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.05);
}

.drawer-header {
  padding: 24px 20px 20px;
  border-bottom: 1px solid #e0e0e0;
  background: #ffffff;
}

.drawer-title {
  font-weight: 700;
  font-size: 1.1rem;
  color: #757575;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.nav-list {
  padding: 16px 0;
}

.nav-link {
  margin: 6px 12px;
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: #757575;
}

.nav-link:hover {
  background: #e3f2fd;
  transform: translateX(4px);
  color: #1976D2;
}

.page-container {
  background: #f5f5f5;
  min-height: 100vh;
  position: relative;
}

.data-loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(8px);
}

.loading-text {
  margin-top: 16px;
  font-size: 1rem;
  font-weight: 500;
  color: #1976D2;
}

/* Responsive Design */
@media (max-width: 768px) {
  .app-title {
    font-size: 1.5rem;
  }

  .header-actions {
    gap: 8px;
  }

  .user-name {
    display: none;
  }
}

/* Animation for page transitions */
.page-container > * {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Enhanced focus states */
.user-menu:focus {
  outline: 2px solid #1976D2;
  outline-offset: 2px;
}

/* Print styles */
@media print {
  .sleek-header,
  .sleek-drawer {
    display: none;
  }

  .page-container {
    background: white;
  }
}
</style>
