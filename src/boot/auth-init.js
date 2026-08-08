import { defineBoot } from '#q-app/wrappers'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, authStateReady } from './firebase'
import { useUserDataStore } from '../stores/userDataStore'

/**
 * Initialize authentication state on app startup
 * This ensures user data is loaded immediately when the app starts
 * and persists across page refreshes using localStorage cache
 */
export default defineBoot(async () => {
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

  // Hydrate the store before the router evaluates a protected deep link.
  // `authStateReady` only resolves after Firebase has restored LOCAL state.
  const restoredUser = await authStateReady
  if (restoredUser) {
    await userDataStore.setUser(restoredUser)
  } else {
    userDataStore.clearAllData()
  }

  onAuthStateChanged(auth, (user) => {
    if (user) {
      void userDataStore.setUser(user)
    } else {
      userDataStore.clearAllData()
    }
  })
})
