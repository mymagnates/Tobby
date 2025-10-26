<template>
  <div class="tenant-signup-link">
    <q-card flat bordered>
      <q-card-section>
        <div class="section-header">
          <q-icon name="person_add" size="28px" color="primary" />
          <div class="header-text">
            <div class="text-h6">Tenant Sign Up Link</div>
            <div class="text-caption text-grey-7">Share this link with new tenants</div>
          </div>
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <!-- Display the link -->
        <div class="link-display">
          <q-input
            :model-value="signupLink"
            label="Sign Up Link"
            outlined
            readonly
            dense
          >
            <template v-slot:append>
              <q-btn
                flat
                dense
                icon="content_copy"
                color="primary"
                @click="copyLink"
                :loading="copying"
              >
                <q-tooltip>Copy to clipboard</q-tooltip>
              </q-btn>
            </template>
          </q-input>
        </div>

        <!-- Action buttons -->
        <div class="action-buttons">
          <q-btn
            color="primary"
            icon="content_copy"
            label="Copy Link"
            @click="copyLink"
            :loading="copying"
            unelevated
            class="q-mr-sm"
          />
          <q-btn
            color="secondary"
            icon="email"
            label="Email Link"
            @click="emailLink"
            outline
            class="q-mr-sm"
          />
          <q-btn
            color="accent"
            icon="qr_code"
            label="Show QR Code"
            @click="showQRCode"
            outline
          />
        </div>

        <!-- QR Code Display -->
        <div v-if="showingQR" class="qr-code-section">
          <div class="text-subtitle2 q-mb-md text-center">Scan to Sign Up</div>
          <div class="qr-code-placeholder">
            <div class="qr-message">
              <q-icon name="qr_code_scanner" size="64px" color="grey-5" />
              <p class="text-caption text-grey-7">
                QR Code functionality requires qrcode library
              </p>
              <p class="text-caption text-grey-6">
                Tenants can visit: {{ signupLink }}
              </p>
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'

const props = defineProps({
  propertyId: {
    type: String,
    required: true,
  },
  propertyName: {
    type: String,
    default: 'property',
  },
})

const $q = useQuasar()

// State
const copying = ref(false)
const showingQR = ref(false)

// Computed
const signupLink = computed(() => {
  const origin = window.location.origin
  return `${origin}/tenant-signup/${props.propertyId}`
})

// Methods
const copyLink = async () => {
  try {
    copying.value = true
    await navigator.clipboard.writeText(signupLink.value)
    
    $q.notify({
      type: 'positive',
      message: 'Link copied to clipboard!',
      icon: 'check_circle',
      position: 'top',
    })
  } catch (error) {
    console.error('Error copying link:', error)
    $q.notify({
      type: 'negative',
      message: 'Failed to copy link',
      icon: 'error',
      position: 'top',
    })
  } finally {
    setTimeout(() => {
      copying.value = false
    }, 500)
  }
}

const emailLink = () => {
  const subject = encodeURIComponent(`Tenant Sign Up - ${props.propertyName}`)
  const body = encodeURIComponent(
    `Hello,\n\nPlease use the following link to create your tenant account for ${props.propertyName}:\n\n${signupLink.value}\n\nBest regards`
  )
  
  window.location.href = `mailto:?subject=${subject}&body=${body}`
}

const showQRCode = () => {
  showingQR.value = !showingQR.value
  
  if (showingQR.value) {
    $q.notify({
      type: 'info',
      message: 'QR Code display',
      caption: 'Install qrcode library for full functionality',
      position: 'top',
    })
  }
}
</script>

<style scoped>
.tenant-signup-link {
  margin: 16px 0;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-text {
  flex: 1;
}

.link-display {
  margin-bottom: 16px;
}

.action-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
}

.qr-code-section {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e0e0e0;
}

.qr-code-placeholder {
  background: #f5f5f5;
  border: 2px dashed #e0e0e0;
  border-radius: 8px;
  padding: 32px;
  text-align: center;
}

.qr-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.qr-message p {
  margin: 0;
  max-width: 300px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .action-buttons {
    flex-direction: column;
  }

  .action-buttons .q-btn {
    width: 100%;
    margin-right: 0 !important;
  }
}
</style>

