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

  void authPersistenceReady.finally(() => {
    // Let the app mount immediately; auth hydration can catch up in the background.
    onAuthStateChanged(auth, (user) => {
      if (user) {
        try {
          userDataStore.setUser(user)
        } catch (error) {
          console.error('Auth init - Error initializing user data:', error)
        }
      } else {
        userDataStore.clearAllData()
      }
    })
  })
})
