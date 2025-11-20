<template>
  <div class="firebase-auth q-pa-md">
    <q-card class="auth-card">
      <q-card-section>
        <div class="text-h6 q-mb-md">
          {{ isAuthenticated ? 'Welcome!' : 'Sign In' }}
        </div>

        <!-- Sign In Form -->
        <div v-if="!isAuthenticated">
          <q-form @submit="handleSignIn" class="q-gutter-md">
            <q-input
              v-model="email"
              type="email"
              label="Email"
              required
              outlined
              :rules="[(val) => !!val || 'Email is required']"
            />

            <q-input
              v-model="password"
              type="password"
              label="Password"
              required
              outlined
              :rules="[(val) => !!val || 'Password is required']"
            />

            <div class="row q-gutter-sm">
              <q-btn type="submit" color="primary" :loading="loading" label="Sign In" class="col" />
              <q-btn @click="showSignUp = true" color="secondary" label="Sign Up" class="col" />
            </div>
          </q-form>
        </div>

        <!-- User Info -->
        <div v-else class="user-info">
          <p><strong>Email:</strong> {{ userEmail }}</p>
          <p v-if="userDisplayName"><strong>Name:</strong> {{ userDisplayName }}</p>
          <q-btn @click="handleLogout" color="negative" :loading="loading" label="Sign Out" />
        </div>

        <!-- Sign Up Form -->
        <q-dialog v-model="showSignUp">
          <q-card style="min-width: 350px">
            <q-card-section>
              <div class="text-h6">Sign Up</div>
            </q-card-section>

            <q-card-section>
              <q-form @submit="handleSignUp" class="q-gutter-md">
                <q-input v-model="signUpEmail" type="email" label="Email" required outlined />

                <q-input
                  v-model="signUpPassword"
                  type="password"
                  label="Password"
                  required
                  outlined
                />

                <q-input v-model="displayName" label="Display Name" outlined />

                <div class="row q-gutter-sm">
                  <q-btn
                    type="submit"
                    color="primary"
                    :loading="loading"
                    label="Create Account"
                    class="col"
                  />
                  <q-btn @click="showSignUp = false" color="secondary" label="Cancel" class="col" />
                </div>
              </q-form>
            </q-card-section>
          </q-card>
        </q-dialog>
      </q-card-section>

      <!-- Error Display -->
      <q-card-section v-if="error" class="text-negative">
        {{ error }}
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useFirebase } from '../composables/useFirebase'

const router = useRouter()
const { loading, error, isAuthenticated, userEmail, userDisplayName, signIn, signUp, logout } =
  useFirebase()

// Form data
const email = ref('')
const password = ref('')
const signUpEmail = ref('')
const signUpPassword = ref('')
const displayName = ref('')
const showSignUp = ref(false)

// Methods
const handleSignIn = async () => {
  try {
    await signIn(email.value, password.value)
    email.value = ''
    password.value = ''

    // Check if there's a redirect URL in query params
    const redirectUrl = route.query.redirect
    
    // Redirect to loading page after successful login (data will load there)
    console.log('Login successful, redirecting to loading page')
    console.log('Redirect URL:', redirectUrl)
    
    // Pass redirect URL to loading page if it exists
    if (redirectUrl) {
      router.push({ path: '/loading', query: { redirect: redirectUrl } })
    } else {
      router.push('/loading')
    }
  } catch (err) {
    console.error('Sign in error:', err)
  }
}

const handleSignUp = async () => {
  try {
    await signUp(signUpEmail.value, signUpPassword.value, displayName.value)
    signUpEmail.value = ''
    signUpPassword.value = ''
    displayName.value = ''
    showSignUp.value = false

    // Redirect to loading page after successful registration (data will load there)
    console.log('Registration successful, redirecting to loading page')
    router.push('/loading')
  } catch (err) {
    console.error('Sign up error:', err)
  }
}

const handleLogout = async () => {
  try {
    await logout()
  } catch (err) {
    console.error('Logout error:', err)
  }
}
</script>

<style scoped>
.firebase-auth {
  max-width: 400px;
  margin: 0 auto;
}

.auth-card {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.user-info {
  text-align: center;
}

.user-info p {
  margin: 8px 0;
}
</style>
