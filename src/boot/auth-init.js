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
    let settled = false
    let unsubscribe = null
    const finish = () => {
      if (settled) return
      settled = true
      if (typeof unsubscribe === 'function') {
        unsubscribe()
      }
      resolve()
    }

    if (typeof window !== 'undefined') {
      const cleanupKey = 'handout-clear-mock-v1'
      if (!localStorage.getItem(cleanupKey)) {
        const keysToClear = [
          'web_sp_bids_v1',
          'web_sp_projects_v1',
          'web_sp_invoices_v1',
          'web_sp_leads_v1',
          'web_sp_cards_snapshot_v1',
          'web_sp_documents_v1',
          'web_sp_credit_account_v1',
          'web_sp_credit_ledger_v1',
          'web_sp_credit_orders_v1',
        ]
        keysToClear.forEach((key) => localStorage.removeItem(key))
        localStorage.setItem(cleanupKey, 'true')
      }
    }
    
    // Wait for auth state to be determined
    const timeout = window.setTimeout(() => {
      console.warn('Auth init timed out; continuing app startup without a cached auth state.')
      userDataStore.clearAllData()
      finish()
    }, 5000)

    unsubscribe = onAuthStateChanged(auth, async (user) => {
      window.clearTimeout(timeout)
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
      finish()
    })
  })
})
