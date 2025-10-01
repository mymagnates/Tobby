<template>
  <q-page class="q-pa-md">
    <div class="text-h4 q-mb-lg">Property & User Management System</div>

    <!-- Firebase Connection Test -->
    <q-card class="q-mb-md">
      <q-card-section class="bg-info text-white">
        <div class="row items-center justify-between">
          <div class="text-h6">Firebase Connection Test</div>
          <div class="row q-gutter-sm">
            <q-btn
              icon="refresh"
              color="white"
              text-color="info"
              @click="testFirebaseConnection"
              label="Test Connection"
            />
            <q-btn
              icon="add"
              color="white"
              text-color="info"
              @click="createSampleData"
              label="Create Sample Data"
            />
          </div>
        </div>
      </q-card-section>

      <q-card-section>
        <div v-if="connectionTestLoading" class="text-center q-pa-md">
          <q-spinner color="info" size="2em" />
          <div class="q-mt-sm">Testing Firebase connection...</div>
        </div>
        <div v-else-if="connectionStatus" class="text-center q-pa-md">
          <q-icon name="check_circle" color="positive" size="2em" />
          <div class="q-mt-sm text-positive">{{ connectionStatus }}</div>
        </div>
        <div v-else-if="connectionError" class="text-center q-pa-md">
          <q-icon name="error" color="negative" size="2em" />
          <div class="q-mt-sm text-negative">{{ connectionError }}</div>
        </div>
        <div v-else class="text-center q-pa-md text-grey">
          Click "Test Connection" to verify Firebase connectivity
        </div>
      </q-card-section>
    </q-card>

    <!-- Debug Information -->
    <q-card class="q-mb-md">
      <q-card-section class="bg-warning text-white">
        <div class="text-h6">Debug Information</div>
      </q-card-section>
      <q-card-section>
        <div class="row q-gutter-md">
          <div class="col-12 col-md-3">
            <strong>Users:</strong> {{ users.length }} (Loading: {{ usersLoading }})
          </div>
          <div class="col-12 col-md-3">
            <strong>Properties:</strong> {{ properties.length }} (Loading: {{ propertiesLoading }})
          </div>
          <div class="col-12 col-md-3">
            <strong>MX Records:</strong> {{ mxrecords.length }} (Loading: {{ mxrecordsLoading }})
          </div>
          <div class="col-12 col-md-3">
            <strong>Transactions:</strong> {{ transactions.length }} (Loading:
            {{ transactionsLoading }})
          </div>
        </div>
        <div class="q-mt-md">
          <strong>Firebase Project:</strong> {{ db?.app?.options?.projectId || 'Not loaded' }}
        </div>
      </q-card-section>
    </q-card>

    <!-- Users Collection -->
    <q-card class="q-mb-md">
      <q-card-section class="bg-deep-purple text-white">
        <div class="row items-center justify-between">
          <div class="text-h6">Users Collection</div>
          <q-btn
            icon="add"
            color="white"
            text-color="deep-purple"
            @click="showAddUser = true"
            label="Add User"
          />
        </div>
      </q-card-section>

      <q-card-section>
        <q-expansion-item
          icon="people"
          label="Users Data"
          header-class="text-deep-purple"
          :default-opened="true"
        >
          <div v-if="usersLoading" class="text-center q-pa-md">
            <q-spinner color="deep-purple" size="2em" />
            <div class="q-mt-sm">Loading users...</div>
          </div>

          <div v-else-if="users.length === 0" class="text-center q-pa-md text-grey">
            No users found
          </div>

          <div v-else class="q-gutter-md">
            <q-card v-for="user in users" :key="user.id" class="user-card" flat bordered>
              <q-card-section>
                <div class="row items-center justify-between">
                  <div>
                    <div class="text-h6">{{ user.displayName || 'No Name' }}</div>
                    <div class="text-subtitle2">{{ user.email }}</div>
                    <div class="text-caption">ID: {{ user.id }}</div>
                  </div>
                  <div class="row q-gutter-sm">
                    <q-btn icon="edit" color="secondary" size="sm" @click="editUser(user)" />
                    <q-btn icon="delete" color="negative" size="sm" @click="deleteUser(user.id)" />
                  </div>
                </div>

                <!-- Roles Subcollection -->
                <div class="q-mt-md">
                  <q-expansion-item
                    icon="security"
                    label="User Roles & Property Access"
                    header-class="text-orange"
                    class="q-mb-sm"
                  >
                    <div class="row q-gutter-sm q-mb-sm">
                      <q-btn
                        icon="add"
                        color="orange"
                        size="sm"
                        @click="showAddUserRole(user.id)"
                        label="Add Role"
                      />
                    </div>

                    <div v-if="user.rolesLoading" class="text-center q-pa-sm">
                      <q-spinner color="orange" size="1em" />
                      <span class="q-ml-sm">Loading roles...</span>
                    </div>
                    <div
                      v-else-if="!user.roles || user.roles.length === 0"
                      class="text-center q-pa-sm text-grey"
                    >
                      No roles assigned
                    </div>
                    <div v-else class="q-gutter-sm">
                      <q-chip
                        v-for="role in user.roles"
                        :key="role.id"
                        color="orange"
                        text-color="white"
                        size="sm"
                        removable
                        @remove="deleteUserRole(user.id, role.id)"
                      >
                        {{ role.role }} - {{ getPropertyName(role.propertyId) }}
                      </q-chip>
                    </div>
                  </q-expansion-item>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </q-expansion-item>
      </q-card-section>
    </q-card>

    <!-- Properties Collection -->
    <q-card class="q-mb-md">
      <q-card-section class="bg-primary text-white">
        <div class="row items-center justify-between">
          <div class="text-h6">Properties Collection</div>
          <q-btn
            icon="add"
            color="white"
            text-color="primary"
            @click="showAddProperty = true"
            label="Add Property"
          />
        </div>
      </q-card-section>

      <q-card-section>
        <q-expansion-item
          icon="home"
          label="Properties Data"
          header-class="text-primary"
          :default-opened="true"
        >
          <div v-if="propertiesLoading" class="text-center q-pa-md">
            <q-spinner color="primary" size="2em" />
            <div class="q-mt-sm">Loading properties...</div>
          </div>

          <div v-else-if="properties.length === 0" class="text-center q-pa-md text-grey">
            No properties found
          </div>

          <div v-else class="q-gutter-md">
            <q-card
              v-for="property in properties"
              :key="property.id"
              class="property-card"
              flat
              bordered
            >
              <q-card-section>
                <div class="row items-center justify-between">
                  <div>
                    <div class="text-h6">{{ property.name || 'No Name' }}</div>
                    <div class="text-subtitle2">{{ property.address }}</div>
                    <div class="text-caption">
                      Type: {{ property.type }} | Status: {{ property.status }}
                    </div>
                    <div class="text-caption">ID: {{ property.id }}</div>
                  </div>
                  <div class="row q-gutter-sm">
                    <q-btn
                      icon="edit"
                      color="secondary"
                      size="sm"
                      @click="editProperty(property)"
                    />
                    <q-btn
                      icon="delete"
                      color="negative"
                      size="sm"
                      @click="deleteProperty(property.id)"
                    />
                  </div>
                </div>

                <!-- Subcollections -->
                <div class="q-mt-md">
                  <q-expansion-item
                    icon="dns"
                    label="MX Records"
                    header-class="text-secondary"
                    class="q-mb-sm"
                  >
                    <div v-if="property.mxrecordsLoading" class="text-center q-pa-sm">
                      <q-spinner color="secondary" size="1em" />
                      <span class="q-ml-sm">Loading MX records...</span>
                    </div>
                    <div
                      v-else-if="!property.mxrecords || property.mxrecords.length === 0"
                      class="text-center q-pa-sm text-grey"
                    >
                      No MX records found
                    </div>
                    <div v-else class="q-gutter-sm">
                      <q-chip
                        v-for="mxrecord in property.mxrecords"
                        :key="mxrecord.id"
                        color="secondary"
                        text-color="white"
                        size="sm"
                      >
                        {{ mxrecord.name }}: {{ mxrecord.value }}
                      </q-chip>
                    </div>
                  </q-expansion-item>

                  <q-expansion-item icon="receipt" label="Transactions" header-class="text-accent">
                    <div v-if="property.transactionsLoading" class="text-center q-pa-sm">
                      <q-spinner color="accent" size="1em" />
                      <span class="q-ml-sm">Loading transactions...</span>
                    </div>
                    <div
                      v-else-if="!property.transactions || property.transactions.length === 0"
                      class="text-center q-pa-sm text-grey"
                    >
                      No transactions found
                    </div>
                    <div v-else class="q-gutter-sm">
                      <q-chip
                        v-for="transaction in property.transactions"
                        :key="transaction.id"
                        color="accent"
                        text-color="white"
                        size="sm"
                      >
                        {{ transaction.type }}: ${{ transaction.amount }}
                      </q-chip>
                    </div>
                  </q-expansion-item>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </q-expansion-item>
      </q-card-section>
    </q-card>

    <!-- MX Records Collection -->
    <q-card class="q-mb-md">
      <q-card-section class="bg-secondary text-white">
        <div class="row items-center justify-between">
          <div class="text-h6">MX Records Collection</div>
          <q-btn
            icon="add"
            color="white"
            text-color="secondary"
            @click="showAddMxRecord = true"
            label="Add MX Record"
          />
        </div>
      </q-card-section>

      <q-card-section>
        <q-expansion-item
          icon="dns"
          label="MX Records Data"
          header-class="text-secondary"
          :default-opened="true"
        >
          <div v-if="mxrecordsLoading" class="text-center q-pa-md">
            <q-spinner color="secondary" size="2em" />
            <div class="q-mt-sm">Loading MX records...</div>
          </div>

          <div v-else-if="mxrecords.length === 0" class="text-center q-pa-md text-grey">
            No MX records found
          </div>

          <div v-else class="q-gutter-md">
            <q-card
              v-for="mxrecord in mxrecords"
              :key="mxrecord.id"
              class="mxrecord-card"
              flat
              bordered
            >
              <q-card-section>
                <div class="row items-center justify-between">
                  <div>
                    <div class="text-h6">{{ mxrecord.name }}</div>
                    <div class="text-body2">{{ mxrecord.value }}</div>
                    <div class="text-caption">
                      Type: {{ mxrecord.type }} | Priority: {{ mxrecord.priority }}
                    </div>
                    <div class="text-caption">Created: {{ formatDate(mxrecord.createdAt) }}</div>
                  </div>
                  <div class="row q-gutter-sm">
                    <q-btn
                      icon="edit"
                      color="secondary"
                      size="sm"
                      @click="editMxRecord(mxrecord)"
                    />
                    <q-btn
                      icon="delete"
                      color="negative"
                      size="sm"
                      @click="deleteMxRecord(mxrecord.id)"
                    />
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </q-expansion-item>
      </q-card-section>
    </q-card>

    <!-- Transactions Collection -->
    <q-card class="q-mb-md">
      <q-card-section class="bg-accent text-white">
        <div class="row items-center justify-between">
          <div class="text-h6">Transactions Collection</div>
          <q-btn
            icon="add"
            color="white"
            text-color="accent"
            @click="showAddTransaction = true"
            label="Add Transaction"
          />
        </div>
      </q-card-section>

      <q-card-section>
        <q-expansion-item
          icon="receipt"
          label="Transactions Data"
          header-class="text-accent"
          :default-opened="true"
        >
          <div v-if="transactionsLoading" class="text-center q-pa-md">
            <q-spinner color="accent" size="2em" />
            <div class="q-mt-sm">Loading transactions...</div>
          </div>

          <div v-else-if="transactions.length === 0" class="text-center q-pa-md text-grey">
            No transactions found
          </div>

          <div v-else class="q-gutter-md">
            <q-card
              v-for="transaction in transactions"
              :key="transaction.id"
              class="transaction-card"
              flat
              bordered
            >
              <q-card-section>
                <div class="row items-center justify-between">
                  <div>
                    <div class="text-h6">{{ transaction.type }}</div>
                    <div class="text-body2">${{ transaction.amount }}</div>
                    <div class="text-caption">
                      Property: {{ transaction.propertyId }} | Date:
                      {{ formatDate(transaction.date) }}
                    </div>
                    <div class="text-caption">Status: {{ transaction.status }}</div>
                  </div>
                  <div class="row q-gutter-sm">
                    <q-btn
                      icon="edit"
                      color="secondary"
                      size="sm"
                      @click="editTransaction(transaction)"
                    />
                    <q-btn
                      icon="delete"
                      color="negative"
                      size="sm"
                      @click="deleteTransaction(transaction.id)"
                    />
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </q-expansion-item>
      </q-card-section>
    </q-card>

    <!-- Add User Dialog -->
    <q-dialog v-model="showAddUser">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">Add User</div>
        </q-card-section>

        <q-card-section>
          <q-form @submit="addUser" class="q-gutter-md">
            <q-input v-model="newUser.displayName" label="Display Name" outlined required />
            <q-input v-model="newUser.email" label="Email" type="email" outlined required />
            <q-select
              v-model="newUser.status"
              :options="['Active', 'Inactive', 'Pending']"
              label="Status"
              outlined
              required
            />
            <div class="row q-gutter-sm">
              <q-btn type="submit" color="primary" label="Add User" />
              <q-btn @click="showAddUser = false" color="secondary" label="Cancel" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Add User Role Dialog -->
    <q-dialog v-model="showAddUserRole">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">Add User Role</div>
        </q-card-section>

        <q-card-section>
          <q-form @submit="addUserRole" class="q-gutter-md">
            <q-select
              v-model="newUserRole.userId"
              :options="userOptions"
              label="User"
              outlined
              required
            />
            <q-select
              v-model="newUserRole.role"
              :options="['Owner', 'Manager', 'Tenant', 'Viewer', 'Admin']"
              label="Role"
              outlined
              required
            />
            <q-select
              v-model="newUserRole.propertyId"
              :options="propertyOptions"
              label="Property"
              outlined
              required
            />
            <div class="row q-gutter-sm">
              <q-btn type="submit" color="primary" label="Add Role" />
              <q-btn @click="showAddUserRole = false" color="secondary" label="Cancel" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Add Property Dialog -->
    <q-dialog v-model="showAddProperty">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">Add Property</div>
        </q-card-section>

        <q-card-section>
          <q-form @submit="addProperty" class="q-gutter-md">
            <q-input v-model="newProperty.name" label="Property Name" outlined required />
            <q-input v-model="newProperty.address" label="Address" outlined required />
            <q-select
              v-model="newProperty.type"
              :options="['Residential', 'Commercial', 'Industrial', 'Land']"
              label="Property Type"
              outlined
              required
            />
            <q-select
              v-model="newProperty.status"
              :options="['Available', 'Sold', 'Rented', 'Under Contract']"
              label="Status"
              outlined
              required
            />
            <div class="row q-gutter-sm">
              <q-btn type="submit" color="primary" label="Add Property" />
              <q-btn @click="showAddProperty = false" color="secondary" label="Cancel" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Add MX Record Dialog -->
    <q-dialog v-model="showAddMxRecord">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">Add MX Record</div>
        </q-card-section>

        <q-card-section>
          <q-form @submit="addMxRecord" class="q-gutter-md">
            <q-input v-model="newMxRecord.name" label="Record Name" outlined required />
            <q-input v-model="newMxRecord.value" label="Record Value" outlined required />
            <q-select
              v-model="newMxRecord.type"
              :options="['MX', 'A', 'CNAME', 'TXT']"
              label="Record Type"
              outlined
              required
            />
            <q-input
              v-model.number="newMxRecord.priority"
              label="Priority"
              type="number"
              outlined
              required
            />
            <div class="row q-gutter-sm">
              <q-btn type="submit" color="primary" label="Add MX Record" />
              <q-btn @click="showAddMxRecord = false" color="secondary" label="Cancel" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Add Transaction Dialog -->
    <q-dialog v-model="showAddTransaction">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">Add Transaction</div>
        </q-card-section>

        <q-card-section>
          <q-form @submit="addTransaction" class="q-gutter-md">
            <q-select
              v-model="newTransaction.type"
              :options="['Purchase', 'Sale', 'Rent', 'Maintenance', 'Tax']"
              label="Transaction Type"
              outlined
              required
            />
            <q-input
              v-model.number="newTransaction.amount"
              label="Amount"
              type="number"
              step="0.01"
              outlined
              required
            />
            <q-select
              v-model="newTransaction.propertyId"
              :options="propertyOptions"
              label="Property"
              outlined
              required
            />
            <q-select
              v-model="newTransaction.status"
              :options="['Pending', 'Completed', 'Cancelled']"
              label="Status"
              outlined
              required
            />
            <div class="row q-gutter-sm">
              <q-btn type="submit" color="primary" label="Add Transaction" />
              <q-btn @click="showAddTransaction = false" color="secondary" label="Cancel" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useFirebase } from '../composables/useFirebase'
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  addDoc,
  deleteDoc,
  getDocs,
  limit,
} from 'firebase/firestore'
import { db } from '../boot/firebase'

const { createDocument, deleteDocument } = useFirebase()

// Data state
const users = ref([])
const properties = ref([])
const mxrecords = ref([])
const transactions = ref([])

// Loading states
const connectionTestLoading = ref(false)
const connectionStatus = ref('')
const connectionError = ref('')
const usersLoading = ref(true)
const propertiesLoading = ref(true)
const mxrecordsLoading = ref(true)
const transactionsLoading = ref(true)

// Dialog states
const showAddUser = ref(false)
const showAddUserRole = ref(false)
const showAddProperty = ref(false)
const showAddMxRecord = ref(false)
const showAddTransaction = ref(false)

// New item forms
const newUser = ref({
  displayName: '',
  email: '',
  status: 'Active',
})

const newUserRole = ref({
  userId: '',
  role: 'Viewer',
  propertyId: '',
})

const newProperty = ref({
  name: '',
  address: '',
  type: 'Residential',
  status: 'Available',
})

const newMxRecord = ref({
  name: '',
  value: '',
  type: 'MX',
  priority: 10,
})

const newTransaction = ref({
  type: 'Purchase',
  amount: 0,
  propertyId: '',
  status: 'Pending',
})

// Computed property options for transaction form
const propertyOptions = computed(() => {
  return properties.value.map((prop) => ({
    label: prop.name,
    value: prop.id,
  }))
})

// Computed user options for user role form
const userOptions = computed(() => {
  return users.value.map((user) => ({
    label: user.displayName || user.email,
    value: user.id,
  }))
})

// Real-time listeners
let usersUnsubscribe = null
let propertiesUnsubscribe = null
let mxrecordsUnsubscribe = null
let transactionsUnsubscribe = null

// Initialize real-time listeners
onMounted(() => {
  console.log('🔥 Firebase Test Page: onMounted called')
  console.log('🔥 Firebase DB instance:', db)
  console.log('🔥 Firebase Project ID:', db.app.options.projectId)

  // Users collection listener
  const usersQuery = query(collection(db, 'users'), orderBy('displayName'))
  console.log('🔥 Setting up users listener...')
  usersUnsubscribe = onSnapshot(
    usersQuery,
    (snapshot) => {
      console.log('🔥 Users snapshot received:', snapshot.docs.length, 'documents')
      users.value = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        roles: [],
        rolesLoading: true,
      }))
      usersLoading.value = false

      // Load roles subcollection for each user
      users.value.forEach(loadUserRoles)
    },
    (error) => {
      console.error('🔥 Users listener error:', error)
      usersLoading.value = false
    },
  )

  // Properties collection listener
  const propertiesQuery = query(collection(db, 'properties'), orderBy('name'))
  console.log('🔥 Setting up properties listener...')
  propertiesUnsubscribe = onSnapshot(
    propertiesQuery,
    (snapshot) => {
      console.log('🔥 Properties snapshot received:', snapshot.docs.length, 'documents')
      properties.value = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        mxrecords: [],
        transactions: [],
        mxrecordsLoading: true,
        transactionsLoading: true,
      }))
      propertiesLoading.value = false

      // Load subcollections for each property
      properties.value.forEach(loadPropertySubcollections)
    },
    (error) => {
      console.error('🔥 Properties listener error:', error)
      propertiesLoading.value = false
    },
  )

  // MX Records collection listener
  const mxrecordsQuery = query(collection(db, 'mxrecords'), orderBy('name'))
  console.log('🔥 Setting up mxrecords listener...')
  mxrecordsUnsubscribe = onSnapshot(
    mxrecordsQuery,
    (snapshot) => {
      console.log('🔥 MX Records snapshot received:', snapshot.docs.length, 'documents')
      mxrecords.value = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      mxrecordsLoading.value = false
    },
    (error) => {
      console.error('🔥 MX Records listener error:', error)
      mxrecordsLoading.value = false
    },
  )

  // Transactions collection listener
  const transactionsQuery = query(collection(db, 'transactions'), orderBy('date', 'desc'))
  console.log('🔥 Setting up transactions listener...')
  transactionsUnsubscribe = onSnapshot(
    transactionsQuery,
    (snapshot) => {
      console.log('🔥 Transactions snapshot received:', snapshot.docs.length, 'documents')
      transactions.value = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      transactionsLoading.value = false
    },
    (error) => {
      console.error('🔥 Transactions listener error:', error)
      transactionsLoading.value = false
    },
  )
})

// Load roles subcollection for a user
const loadUserRoles = async (user) => {
  try {
    const rolesQuery = query(collection(db, 'users', user.id, 'roles'))
    onSnapshot(rolesQuery, (snapshot) => {
      user.roles = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      user.rolesLoading = false
    })
  } catch (error) {
    console.error('Error loading user roles:', error)
  }
}

// Load subcollections for a property
const loadPropertySubcollections = async (property) => {
  try {
    // Load MX records subcollection
    const mxrecordsQuery = query(collection(db, 'properties', property.id, 'mxrecords'))
    onSnapshot(mxrecordsQuery, (snapshot) => {
      property.mxrecords = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      property.mxrecordsLoading = false
    })

    // Load transactions subcollection
    const transactionsQuery = query(collection(db, 'properties', property.id, 'transactions'))
    onSnapshot(transactionsQuery, (snapshot) => {
      property.transactions = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      property.transactionsLoading = false
    })
  } catch (error) {
    console.error('Error loading subcollections:', error)
  }
}

// Cleanup listeners
onUnmounted(() => {
  if (propertiesUnsubscribe) propertiesUnsubscribe()
  if (mxrecordsUnsubscribe) mxrecordsUnsubscribe()
  if (transactionsUnsubscribe) transactionsUnsubscribe()
  if (usersUnsubscribe) usersUnsubscribe()
})

// Create sample data for testing
const createSampleData = async () => {
  try {
    connectionTestLoading.value = true
    connectionError.value = ''
    connectionStatus.value = ''

    // Create sample users
    const sampleUsers = [
      { displayName: 'John Doe', email: 'john@example.com', status: 'Active' },
      { displayName: 'Jane Smith', email: 'jane@example.com', status: 'Active' },
      { displayName: 'Bob Johnson', email: 'bob@example.com', status: 'Active' },
    ]

    for (const userData of sampleUsers) {
      await createDocument('users', {
        ...userData,
        createdAt: new Date(),
      })
    }

    // Create sample properties with the correct structure
    const sampleProperties = [
      {
        address: '123 Sunset Blvd, Los Angeles, CA 90210',
        nickname: 'Sunset Villa',
        type: 'Residential',
        status: 'Available',
        spec: {
          type: 'Single Family',
          story: 2,
          bedroom: 3,
          full_bathroom: 2,
          kitchen: 1,
          meeting_room: 0,
          office: 1,
          half_bathroom: 1,
          garage: 2,
          size: 2200,
          lot_size: 6000,
          hoa_name: 'Sunset HOA',
          hoa_contact: 'info@sunsethoa.com',
        },
        equipments: [
          {
            status: 'Active',
            category: 'HVAC',
            Name: 'Central Air',
            Manufacture: 'Carrier',
            Model: '24ABC',
            Serial: 'CRR-2022-001',
            Manufactured_year: 2022,
            Purchased_year: 2022,
            Warranty_length: '5 years',
            Invoice_price: 8000,
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        address: '456 Business Ave, Downtown, CA 90211',
        nickname: 'Downtown Office',
        type: 'Commercial',
        status: 'Rented',
        spec: {
          type: 'Office Building',
          story: 3,
          bedroom: 0,
          full_bathroom: 4,
          kitchen: 1,
          meeting_room: 6,
          office: 12,
          half_bathroom: 2,
          garage: 20,
          size: 15000,
          lot_size: 8000,
          hoa_name: 'Downtown Business Association',
          hoa_contact: 'contact@downtownba.com',
        },
        equipments: [
          {
            status: 'Active',
            category: 'Security',
            Name: 'Access Control',
            Manufacture: 'Honeywell',
            Model: 'HID-3000',
            Serial: 'HNY-2023-001',
            Manufactured_year: 2023,
            Purchased_year: 2023,
            Warranty_length: '3 years',
            Invoice_price: 5000,
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    const createdProperties = []
    for (const propertyData of sampleProperties) {
      const propertyId = await createDocument('properties', propertyData)
      createdProperties.push(propertyId)
    }

    // Create sample MX records in property subcollections
    if (createdProperties.length > 0) {
      const sampleMxRecords = [
        {
          mx_id: `mx_${Date.now()}_1`,
          create_id: 'test_user_1',
          reported_by: 'John Doe',
          reported_role: 'Property Manager',
          description: 'HVAC system not working properly',
          report_date: new Date('2024-01-15'),
          resolution: 'Pending',
          resolv_by: '',
          resolv_date: null,
          logs: [
            {
              log_timestamp: new Date('2024-01-15'),
              comment: 'Issue reported by tenant',
              user_id: 'test_user_1',
              user_name: 'John Doe',
              user_role: 'Property Manager',
            },
          ],
          createAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-01-15'),
        },
        {
          mx_id: `mx_${Date.now()}_2`,
          create_id: 'test_user_2',
          reported_by: 'Jane Smith',
          reported_role: 'Landlord',
          description: 'Plumbing leak in kitchen',
          report_date: new Date('2024-01-20'),
          resolution: 'Resolved',
          resolv_by: 'Bob Johnson',
          resolv_date: new Date('2024-01-25'),
          logs: [
            {
              log_timestamp: new Date('2024-01-20'),
              comment: 'Issue reported by landlord',
              user_id: 'test_user_2',
              user_name: 'Jane Smith',
              user_role: 'Landlord',
            },
            {
              log_timestamp: new Date('2024-01-25'),
              comment: 'Fixed by contractor',
              user_id: 'test_user_3',
              user_name: 'Bob Johnson',
              user_role: 'Contractor',
            },
          ],
          createAt: new Date('2024-01-20'),
          updatedAt: new Date('2024-01-25'),
        },
      ]

      for (let i = 0; i < sampleMxRecords.length; i++) {
        const propertyId = createdProperties[i % createdProperties.length]
        await createDocument(`properties/${propertyId}/mxrecords`, sampleMxRecords[i])
      }
    }

    // Create sample transactions in property subcollections
    if (createdProperties.length > 0) {
      const sampleTransactions = [
        {
          transac_id: `txn_${Date.now()}_1`,
          property_id: createdProperties[0],
          lease_id: 'lease_001',
          role: 'Property Manager',
          transac_from: 'Tenant',
          transac_to: 'Landlord',
          amount: 2500,
          transac_date: new Date('2024-01-01'),
          transac_type: 'Rent Payment',
          created_by: 'test_user_1',
          created_datetime: new Date('2024-01-01'),
        },
        {
          transac_id: `txn_${Date.now()}_2`,
          property_id: createdProperties[0],
          lease_id: 'lease_001',
          role: 'Property Manager',
          transac_from: 'Tenant',
          transac_to: 'Landlord',
          amount: 1000,
          transac_date: new Date('2024-01-01'),
          transac_type: 'Security Deposit',
          created_by: 'test_user_1',
          created_datetime: new Date('2024-01-01'),
        },
        {
          transac_id: `txn_${Date.now()}_3`,
          property_id: createdProperties[1],
          lease_id: 'lease_002',
          role: 'Landlord',
          transac_from: 'Insurance Company',
          transac_to: 'Landlord',
          amount: 5000,
          transac_date: new Date('2024-01-10'),
          transac_type: 'Insurance Payment',
          created_by: 'test_user_2',
          created_datetime: new Date('2024-01-10'),
        },
        {
          transac_id: `txn_${Date.now()}_4`,
          property_id: createdProperties[1],
          lease_id: 'lease_002',
          role: 'Landlord',
          transac_from: 'Tenant',
          transac_to: 'Landlord',
          amount: 3500,
          transac_date: new Date('2024-01-01'),
          transac_type: 'Rent Payment',
          created_by: 'test_user_2',
          created_datetime: new Date('2024-01-01'),
        },
      ]

      for (const transactionData of sampleTransactions) {
        await createDocument(
          `properties/${transactionData.property_id}/transactions`,
          transactionData,
        )
      }
    }

    connectionStatus.value = '✅ Sample data created successfully! Check the collections below.'
  } catch (error) {
    connectionError.value = `❌ Error creating sample data: ${error.message}`
    console.error('Sample data creation error:', error)
  } finally {
    connectionTestLoading.value = false
  }
}

// Firebase connection test
const testFirebaseConnection = async () => {
  try {
    connectionTestLoading.value = true
    connectionError.value = ''
    connectionStatus.value = ''

    // Test basic connection by trying to read from a collection
    const testQuery = query(collection(db, 'users'), limit(1))
    await getDocs(testQuery)

    connectionStatus.value = `✅ Firebase connected successfully! Project: ${db.app.options.projectId}`

    // Test if collections exist and show counts
    const collections = ['users', 'properties', 'mxrecords', 'transactions']
    const collectionCounts = {}

    for (const colName of collections) {
      try {
        const colQuery = query(collection(db, colName))
        const colSnapshot = await getDocs(colQuery)
        collectionCounts[colName] = colSnapshot.size
      } catch {
        collectionCounts[colName] = 'Error'
      }
    }

    connectionStatus.value += `\n📊 Collection Status: ${JSON.stringify(collectionCounts, null, 2)}`
  } catch (error) {
    connectionError.value = `❌ Firebase connection failed: ${error.message}`
    console.error('Firebase connection test error:', error)
  } finally {
    connectionTestLoading.value = false
  }
}

// CRUD operations
const addUser = async () => {
  try {
    await createDocument('users', {
      ...newUser.value,
      createdAt: new Date(),
    })
    newUser.value = { displayName: '', email: '', status: 'Active' }
    showAddUser.value = false
  } catch (error) {
    console.error('Error adding user:', error)
  }
}

const addUserRole = async () => {
  try {
    // Check if this user-role-property combination already exists
    const existingRole = users.value
      .find((u) => u.id === newUserRole.value.userId)
      ?.roles?.find(
        (r) => r.role === newUserRole.value.role && r.propertyId === newUserRole.value.propertyId,
      )

    if (existingRole) {
      console.error('This user already has this role for this property')
      return
    }

    // Add role to user's roles subcollection
    const userRef = doc(db, 'users', newUserRole.value.userId)
    const rolesCollectionRef = collection(userRef, 'roles')

    await addDoc(rolesCollectionRef, {
      role: newUserRole.value.role,
      propertyId: newUserRole.value.propertyId,
      createdAt: new Date(),
    })

    newUserRole.value = { userId: '', role: 'Viewer', propertyId: '' }
    showAddUserRole.value = false
  } catch (error) {
    console.error('Error adding user role:', error)
  }
}

const addProperty = async () => {
  try {
    await createDocument('properties', {
      ...newProperty.value,
      createdAt: new Date(),
    })
    newProperty.value = { name: '', address: '', type: 'Residential', status: 'Available' }
    showAddProperty.value = false
  } catch (error) {
    console.error('Error adding property:', error)
  }
}

const addMxRecord = async () => {
  try {
    await createDocument('mxrecords', {
      ...newMxRecord.value,
      createdAt: new Date(),
    })
    newMxRecord.value = { name: '', value: '', type: 'MX', priority: 10 }
    showAddMxRecord.value = false
  } catch (error) {
    console.error('Error adding MX record:', error)
  }
}

const addTransaction = async () => {
  try {
    await createDocument('transactions', {
      ...newTransaction.value,
      date: new Date(),
      createdAt: new Date(),
    })
    newTransaction.value = { type: 'Purchase', amount: 0, propertyId: '', status: 'Pending' }
    showAddTransaction.value = false
  } catch (error) {
    console.error('Error adding transaction:', error)
  }
}

const editUser = (user) => {
  // TODO: Implement edit functionality
  console.log('Edit user:', user)
}

const editProperty = (property) => {
  // TODO: Implement edit functionality
  console.log('Edit property:', property)
}

const editMxRecord = (mxrecord) => {
  // TODO: Implement edit functionality
  console.log('Edit MX record:', mxrecord)
}

const editTransaction = (transaction) => {
  // TODO: Implement edit functionality
  console.log('Edit transaction:', transaction)
}

const deleteUser = async (userId) => {
  try {
    await deleteDocument('users', userId)
  } catch (error) {
    console.error('Error deleting user:', error)
  }
}

const deleteUserRole = async (userId, roleId) => {
  try {
    const userRef = doc(db, 'users', userId)
    const roleRef = doc(userRef, 'roles', roleId)
    await deleteDoc(roleRef)
  } catch (error) {
    console.error('Error deleting user role:', error)
  }
}

const deleteProperty = async (propertyId) => {
  try {
    await deleteDocument('properties', propertyId)
  } catch (error) {
    console.error('Error deleting property:', error)
  }
}

const deleteMxRecord = async (mxrecordId) => {
  try {
    await deleteDocument('mxrecords', mxrecordId)
  } catch (error) {
    console.error('Error deleting MX record:', error)
  }
}

const deleteTransaction = async (transactionId) => {
  try {
    await deleteDocument('transactions', transactionId)
  } catch (error) {
    console.error('Error deleting transaction:', error)
  }
}

const formatDate = (timestamp) => {
  if (!timestamp) return 'N/A'
  return new Date(timestamp.toDate()).toLocaleString()
}

const getPropertyName = (propertyId) => {
  const property = properties.value.find((p) => p.id === propertyId)
  return property ? property.nickname || property.address || 'Unknown Property' : 'Unknown Property'
}
</script>

<style scoped>
.user-card,
.property-card,
.mxrecord-card,
.transaction-card {
  transition: all 0.3s ease;
}

.user-card:hover,
.property-card:hover,
.mxrecord-card:hover,
.transaction-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
</style>
