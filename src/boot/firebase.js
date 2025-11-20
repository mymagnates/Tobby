import { initializeApp } from 'firebase/app'
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { getAnalytics } from 'firebase/analytics'

// Your Firebase configuration
// Replace these values with your actual Firebase project configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'demo-api-key',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'tobbythebutler.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'tobbythebutler',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'tobbythebutler.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:123456789:web:abcdef',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-XXXXXXXXXX',
}

// Check if Firebase configuration is complete
const requiredConfig = ['apiKey', 'authDomain', 'projectId']
const missingConfig = requiredConfig.filter(
  (key) =>
    !firebaseConfig[key] ||
    firebaseConfig[key].includes('demo-') ||
    firebaseConfig[key].includes('your-'),
)

if (missingConfig.length > 0) {
  console.error('Firebase configuration is incomplete. Missing:', missingConfig)
  console.error(
    'Please create a .env file with your Firebase configuration. See env.example for reference.',
  )
  console.error('Current config:', firebaseConfig)
}

// Initialize Firebase
let app
try {
  app = initializeApp(firebaseConfig)
  console.log('Firebase initialized successfully')
} catch (error) {
  console.error('Firebase initialization failed:', error)
  throw new Error(`Firebase initialization failed: ${error.message}`)
}

// Initialize Firebase services
let auth, db, storage
try {
  auth = getAuth(app)
  
  // Set persistence to LOCAL (default) but we'll implement custom 24h timeout
  setPersistence(auth, browserLocalPersistence)
    .then(() => {
      console.log('Firebase Auth persistence set to LOCAL with custom 24h timeout')
    })
    .catch((error) => {
      console.error('Error setting persistence:', error)
    })
  
  db = getFirestore(app)
  storage = getStorage(app)
  console.log('Firebase services initialized successfully')
} catch (error) {
  console.error('Firebase services initialization failed:', error)
  throw new Error(`Firebase services initialization failed: ${error.message}`)
}

// Initialize Analytics (only in browser environment)
let analytics = null
if (typeof window !== 'undefined') {
  try {
    analytics = getAnalytics(app)
  } catch (error) {
    console.warn('Analytics initialization failed:', error)
  }
}

// ============================================
// SESSION TIMEOUT CONFIGURATION
// ============================================
// Session will expire after 24 hours
export const SESSION_TIMEOUT_HOURS = 24
export const SESSION_TIMEOUT_MS = SESSION_TIMEOUT_HOURS * 60 * 60 * 1000 // 24 hours in milliseconds
export const SESSION_LOGIN_TIME_KEY = 'firebase_session_login_time'

// Session management helpers
export const sessionManager = {
  // Set login time when user signs in
  setLoginTime: () => {
    const loginTime = Date.now()
    if (typeof window !== 'undefined') {
      localStorage.setItem(SESSION_LOGIN_TIME_KEY, loginTime.toString())
    }
    console.log('Session login time set:', new Date(loginTime).toISOString())
  },

  // Get login time
  getLoginTime: () => {
    if (typeof window !== 'undefined') {
      const loginTime = localStorage.getItem(SESSION_LOGIN_TIME_KEY)
      return loginTime ? parseInt(loginTime, 10) : null
    }
    return null
  },

  // Check if session has expired (24 hours)
  isSessionExpired: () => {
    const loginTime = sessionManager.getLoginTime()
    if (!loginTime) {
      return false // No login time means fresh state
    }
    const currentTime = Date.now()
    const elapsed = currentTime - loginTime
    const expired = elapsed >= SESSION_TIMEOUT_MS
    
    if (expired) {
      console.log('Session expired. Login time:', new Date(loginTime).toISOString())
      console.log('Current time:', new Date(currentTime).toISOString())
      console.log('Elapsed time:', Math.floor(elapsed / 1000 / 60 / 60), 'hours')
    }
    
    return expired
  },

  // Clear login time (on logout)
  clearLoginTime: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(SESSION_LOGIN_TIME_KEY)
    }
    console.log('Session login time cleared')
  },

  // Get remaining session time in milliseconds
  getRemainingTime: () => {
    const loginTime = sessionManager.getLoginTime()
    if (!loginTime) {
      return 0
    }
    const elapsed = Date.now() - loginTime
    const remaining = SESSION_TIMEOUT_MS - elapsed
    return remaining > 0 ? remaining : 0
  },

  // Get remaining time in human-readable format
  getRemainingTimeFormatted: () => {
    const remaining = sessionManager.getRemainingTime()
    const hours = Math.floor(remaining / 1000 / 60 / 60)
    const minutes = Math.floor((remaining / 1000 / 60) % 60)
    return `${hours}h ${minutes}m`
  },
}

export { app, auth, db, storage, analytics }
export default app
