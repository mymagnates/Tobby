<template>
  <q-layout view="hhh Lpr lFr" class="modern-layout">
    <q-header elevated class="modern-header bg-primary">
      <q-toolbar class="q-px-md">
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
          class="menu-btn"
        />

        <q-toolbar-title class="row items-center">
          <div class="logo-container">
            <img src="/logo.svg" alt="Property Manager Logo" class="logo" />
            <span
              class="app-title"
              style="
                font-family: 'Orbitron', 'cursive', 'Comic Sans MS', Impact, fantasy, system-ui;
                letter-spacing: 0.08em;
              "
              >Handout</span
            >
          </div>
        </q-toolbar-title>

        <div class="header-actions">
          <q-btn-dropdown flat round icon="person" color="white" class="q-ml-sm user-menu q-px-md">
            <template v-slot:label>
              <div v-if="userDataStore.user?.photoURL" class="row items-center">
                <q-avatar size="24px" class="q-mr-sm">
                  <img :src="userDataStore.user.photoURL" alt="User Avatar" />
                </q-avatar>
              </div>
              <span v-if="userDataStore.user?.displayName" class="text-weight-medium">
                {{ userDataStore.user.displayName }}
              </span>
              <span v-else-if="userDataStore.user?.email" class="text-weight-medium">
                {{ userDataStore.user.email.split('@')[0] }}
              </span>
              <span v-else class="text-weight-medium"> User </span>
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
                  <q-icon name="logout" color="error" />
                </q-item-section>
                <q-item-section class="text-error">Sign Out</q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered class="modern-drawer">
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

      // Only load data if not on loading page and data not already loaded
      if (
        router.currentRoute.value.path !== '/loading' &&
        userDataStore.userAccessibleProperties.length === 0 &&
        !userDataStore.profileLoading
      ) {
        console.log('MainLayout - Loading user data after page refresh')
        needsRedirectAfterLoad.value = true
        loadAllUserData()
      } else if (router.currentRoute.value.path === '/loading') {
        console.log('MainLayout - On loading page, letting LoadingPage handle data loading')
      } else {
        console.log('MainLayout - Data already loaded or loading')
      }
    } else if (wasAuthenticated !== undefined) {
      // Only clear data if this is not the initial watch trigger
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
.modern-layout {
  background: var(--neutral-50);
}

.modern-header {
  backdrop-filter: blur(10px);
  background: linear-gradient(135deg, var(--finance-dark) 0%, var(--primary-color) 100%);
  border-bottom: 1px solid var(--primary-color);
  box-shadow: var(--shadow-sm);
  color: white;
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo {
  height: 32px;
  width: auto;
  filter: drop-shadow(0 2px 4px rgba(15, 118, 110, 0.3));
  transition: var(--transition);
}

.logo:hover {
  transform: scale(1.05);
}

.app-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: white;
  letter-spacing: -0.025em;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.version-info {
  display: flex;
  align-items: center;
}

.version-chip {
  font-size: 0.75rem;
  font-weight: 600;
  box-shadow: var(--shadow-sm);
}

.menu-btn {
  transition: var(--transition);
  color: white;
}

.menu-btn:hover {
  transform: scale(1.05);
  background: rgba(255, 255, 255, 0.1);
}

.user-menu {
  transition: var(--transition);
  background: rgba(255, 255, 255, 0.1);
  min-width: 120px;
  padding: 8px 16px;
}

.user-menu:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.user-menu-list {
  min-width: 200px;
}

.menu-item {
  transition: var(--transition);
  border-radius: var(--border-radius-sm);
  margin: 4px 8px;
}

.menu-item:hover {
  background: var(--primary-glow);
  transform: translateX(2px);
}

.modern-drawer {
  background: white;
  border-right: 1px solid var(--neutral-200);
}

.drawer-header {
  padding: 24px 16px 16px;
  border-bottom: 1px solid var(--neutral-200);
  background: linear-gradient(135deg, var(--finance-dark) 0%, var(--primary-color) 100%);
  color: white;
}

.drawer-logo-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.drawer-logo {
  width: 32px;
  height: 32px;
  border-radius: 6px;
}

.drawer-title {
  font-weight: 600;
  font-size: 1.2rem;
}

.nav-list {
  padding: 16px 0;
}

.nav-section-header {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--neutral-600);
  padding: 16px 16px 8px;
  display: flex;
  align-items: center;
}

.nav-link {
  margin: 4px 8px;
  border-radius: var(--border-radius-sm);
  transition: var(--transition);
}

.nav-link:hover {
  background: var(--primary-glow);
  transform: translateX(2px);
}

.page-container {
  background: var(--neutral-50);
  min-height: 100vh;
  position: relative;
}

.data-loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(4px);
}

.loading-text {
  margin-top: 16px;
  font-size: 1rem;
  font-weight: 500;
  color: var(--primary-color);
}

/* Responsive Design */
@media (max-width: 768px) {
  .app-title {
    font-size: 1.125rem;
  }

  .logo {
    height: 28px;
  }

  .header-actions {
    gap: 8px;
  }

  .version-chip {
    display: none;
  }
}

/* Animation for page transitions */
.page-container > * {
  animation: fadeIn 0.3s ease-out;
}

/* Enhanced focus states */
.menu-btn:focus,
.user-menu:focus {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
}

/* Loading states */
.q-loading {
  backdrop-filter: blur(4px);
}

/* Print styles */
@media print {
  .modern-header,
  .modern-drawer {
    display: none;
  }

  .page-container {
    background: white;
  }
}
</style>
