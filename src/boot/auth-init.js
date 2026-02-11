import { defineBoot } from '#q-app/wrappers'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './firebase'
import { useUserDataStore } from '../stores/userDataStore'

/**
 * Initialize authentication state on app startup
 * This ensures user data is loaded immediately when the app starts
 * and persists across page refreshes using localStorage cache
 */
export default defineBoot(async () => {
  return new Promise((resolve) => {
    const userDataStore = useUserDataStore()
    
    // Wait for auth state to be determined
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is authenticated, initialize store with user data
        // This will load from cache if available (within 5 min), or fetch fresh data
        try {
          await userDataStore.initialize(user)
        } catch (error) {
          console.error('Auth init - Error initializing user data:', error)
        }
      } else {
        // No user, ensure store is cleared
        userDataStore.clearAllData()
      }
      
      // Resolve after first auth state check
      unsubscribe()
      resolve()
    })
  })
})
