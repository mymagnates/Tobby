import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
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

export { app, auth, db, storage, analytics }
export default app
