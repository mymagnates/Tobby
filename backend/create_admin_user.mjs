import { initializeApp, getApps } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'

if (!getApps().length) {
  initializeApp({ projectId: 'tobbythebutler' })
}

const auth = getAuth()
const email = 'mymagnates@gmail.com'
const password = 'edward'

let user
try {
  user = await auth.getUserByEmail(email)
} catch {
  user = await auth.createUser({
    email,
    password,
    emailVerified: true,
    displayName: 'Admin User',
  })
}

await auth.setCustomUserClaims(user.uid, {
  admin: true,
  roles: ['admin'],
  role: 'admin',
})

const updated = await auth.getUser(user.uid)
console.log(
  JSON.stringify(
    {
      uid: updated.uid,
      email: updated.email,
      customClaims: updated.customClaims || {},
    },
    null,
    2
  )
)
