import { defineBoot } from '#q-app/wrappers'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, authPersistenceReady } from './firebase'
import { useUserDataStore } from '../stores/userDataStore'

/**
 * Initialize authentication state on app startup
 * This ensures user data is loaded immediately when the app starts
 * and persists across page refreshes using localStorage cache
 */
export default defineBoot(() => {
  return new Promise((resolve) => {
    const userDataStore = useUserDataStore()

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
    
    let resolved = false
    const finish = () => {
      if (resolved) return
      resolved = true
      resolve()
    }

    authPersistenceReady.finally(() => {
      // Wait for auth state to be determined, but do not block first paint on
      // profile/role hydration. Those can continue in the background.
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          try {
            userDataStore.setUser(user)
          } catch (error) {
            console.error('Auth init - Error initializing user data:', error)
          }
        } else {
          userDataStore.clearAllData()
        }

        unsubscribe()
        finish()
      })
    })
  })
})
