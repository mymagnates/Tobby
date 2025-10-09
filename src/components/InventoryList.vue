<template>
  <div class="inventory-list">
    <q-card class="inventory-card">
      <q-card-section class="inventory-header">
        <div class="row items-center justify-between">
          <div>
            <div class="text-h6 text-weight-bold text-primary">
              <q-icon name="inventory" class="q-mr-sm" />
              Property Inventory List
            </div>
            <div class="text-caption text-grey-6 q-mt-xs">
              Track items provided to tenant during move-in and returned during move-out
            </div>
          </div>
          <q-btn flat round dense icon="close" @click="emit('cancel')" class="dialog-close-btn" />
        </div>
      </q-card-section>

      <q-card-section class="inventory-content">
        <!-- Lease Information (Read-only) -->
        <div class="lease-info-section q-mb-lg">
          <div class="text-subtitle1 text-weight-medium q-mb-sm">Lease Information</div>
          <div class="lease-info-grid">
            <div class="info-item">
              <div class="info-label">Lease ID</div>
              <div class="info-value">{{ leaseId }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Property Address</div>
              <div class="info-value">{{ inventoryData.property_address }}</div>
            </div>
          </div>
        </div>

        <!-- KTCS Subcollection (Keys, Tokens, Cards, Security + Other Items) -->
        <div class="ktcs-subcollection-section q-mb-lg">
          <div class="subcollection-header">
            <div class="subcollection-title">
              <q-icon name="vpn_key" class="q-mr-sm" color="primary" />
              Standard Items
            </div>
            <div class="subcollection-subtitle">Keys, Tokens, Cards</div>
          </div>

          <!-- Standard KTCS Items -->
          <div class="ktcs-items-section q-mb-md">
            <!-- Door Keys -->
            <div class="">
              <!-- Door Keys -->
              <div class="item-status-row" style="display: flex; align-items: center; gap: 8px">
                <div style="display: flex; align-items: center; gap: 4px; min-width: 110px">
                  <q-icon name="key" class="item-icon" />
                  <div class="item-title">Door Keys</div>
                </div>
                <div style="display: flex; align-items: center; gap: 4px">
                  <q-input
                    v-model.number="inventoryData.ktcs_items.door_keys.received"
                    label="Received"
                    type="number"
                    min="0"
                    outlined
                    dense
                    style="width: 80px"
                  />
                  <q-input
                    v-model.number="inventoryData.ktcs_items.door_keys.returned"
                    label="Returned"
                    type="number"
                    min="0"
                    outlined
                    dense
                    style="width: 80px"
                  />
                </div>
              </div>

              <!-- Garage Tokens -->
              <div class="item-status-row" style="display: flex; align-items: center; gap: 8px">
                <div style="display: flex; align-items: center; gap: 4px; min-width: 110px">
                  <q-icon name="garage" class="item-icon" />
                  <div class="item-title">Garage Tokens</div>
                </div>
                <div style="display: flex; align-items: center; gap: 4px">
                  <q-input
                    v-model.number="inventoryData.ktcs_items.garage_tokens.received"
                    label="Received"
                    type="number"
                    min="0"
                    outlined
                    dense
                    style="width: 80px"
                  />
                  <q-input
                    v-model.number="inventoryData.ktcs_items.garage_tokens.returned"
                    label="Returned"
                    type="number"
                    min="0"
                    outlined
                    dense
                    style="width: 80px"
                  />
                </div>
              </div>

              <!-- Security Card/Key -->
              <div class="item-status-row" style="display: flex; align-items: center; gap: 8px">
                <div style="display: flex; align-items: center; gap: 4px; min-width: 110px">
                  <q-icon name="security" class="item-icon" />
                  <div class="item-title">Security Card/Key</div>
                </div>
                <div style="display: flex; align-items: center; gap: 4px">
                  <q-input
                    v-model.number="inventoryData.ktcs_items.security_card.received"
                    label="Received"
                    type="number"
                    min="0"
                    outlined
                    dense
                    style="width: 80px"
                  />
                  <q-input
                    v-model.number="inventoryData.ktcs_items.security_card.returned"
                    label="Returned"
                    type="number"
                    min="0"
                    outlined
                    dense
                    style="width: 80px"
                  />
                </div>
              </div>

              <!-- Mailbox Keys -->
              <div class="item-status-row" style="display: flex; align-items: center; gap: 8px">
                <div style="display: flex; align-items: center; gap: 4px; min-width: 110px">
                  <q-icon name="mail" class="item-icon" />
                  <div class="item-title">Mailbox Keys</div>
                </div>
                <div style="display: flex; align-items: center; gap: 4px">
                  <q-input
                    v-model.number="inventoryData.ktcs_items.mailbox_keys.received"
                    label="Received"
                    type="number"
                    min="0"
                    outlined
                    dense
                    style="width: 80px"
                  />
                  <q-input
                    v-model.number="inventoryData.ktcs_items.mailbox_keys.returned"
                    label="Returned"
                    type="number"
                    min="0"
                    outlined
                    dense
                    style="width: 80px"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- Custom Items Subcollection (Area-based with Comments) -->
        <div class="custom-items-subcollection-section q-mb-lg">
          <div class="subcollection-header">
            <div class="subcollection-title">
              <q-icon name="inventory_2" class="q-mr-sm" color="secondary" />
              Propety Condition Items
            </div>
            <div class="subcollection-subtitle">
              Area-based items with move-in/move-out comments
            </div>
          </div>

          <!-- Custom Items -->
          <div class="custom-items-section">
            <div class="section-header">
              <div class="text-subtitle1 text-weight-medium"></div>
              <q-btn color="primary" icon="add" label="Add Item" size="sm" @click="addCustomItem" />
            </div>

            <!-- Custom Items List -->
            <div v-if="inventoryData.custom_items.length > 0" class="custom-items-list q-mt-md">
              <div
                v-for="(item, index) in inventoryData.custom_items"
                :key="index"
                class="custom-item-card"
              >
                <div class="custom-item-header">
                  <q-icon name="inventory_2" class="custom-item-icon" />
                  <div class="custom-item-title">Item {{ index + 1 }}</div>
                  <q-btn
                    flat
                    round
                    icon="delete"
                    color="negative"
                    size="sm"
                    @click="removeCustomItem(index)"
                  />
                </div>

                <div class="custom-item-content">
                  <!-- Area and Item Name in the same row -->
                  <div class="row q-mb-sm">
                    <div class="col-6 custom-item-field">
                      <q-select
                        v-model="item.area"
                        :options="areaOptions"
                        label="Area *"
                        outlined
                        dense
                        :rules="[(val) => !!val || 'Area is required']"
                        @update:model-value="
                          () => {
                            item.item = ''
                          }
                        "
                      />
                    </div>
                    <div class="col-6 custom-item-field">
                      <q-select
                        v-model="item.item"
                        :options="getItemSuggestionsForArea(item.area)"
                        label="Item *"
                        outlined
                        dense
                        use-input
                        hide-selected
                        fill-input
                        input-debounce="0"
                        @filter="(val, update) => filterItemSuggestions(index, val, update)"
                        @new-value="createNewItem"
                        :rules="[(val) => !!val || 'Item is required']"
                        :disable="!item.area"
                      >
                        <template v-slot:no-option>
                          <q-item>
                            <q-item-section class="text-grey">
                              {{
                                item.area
                                  ? 'Type to add a custom item'
                                  : 'Please select an area first'
                              }}
                            </q-item-section>
                          </q-item>
                        </template>
                      </q-select>
                    </div>
                  </div>

                  <!-- Move-in and Move-out Comments and Pictures in the same row -->
                  <div class="row q-col-gutter-sm">
                    <!-- Move-in -->
                    <div class="col-6">
                      <div class="custom-item-field q-mb-xs">
                        <q-input
                          v-model="item.move_in_comment"
                          label="Move-in Comment"
                          type="textarea"
                          rows="2"
                          outlined
                          dense
                          placeholder="Condition and notes when tenant moved in..."
                        />
                      </div>
                      <div class="custom-item-field">
                        <q-uploader
                          v-model="item.move_in_photos"
                          label="Move-in Photos"
                          accept="image/*"
                          multiple
                          max-files="5"
                          style="width: 100%"
                          :auto-upload="false"
                          :hide-upload-btn="true"
                          :hide-upload-progress="true"
                          :hide-thumbnails="false"
                        />
                      </div>
                    </div>
                    <!-- Move-out -->
                    <div class="col-6">
                      <div class="custom-item-field q-mb-xs">
                        <q-input
                          v-model="item.move_out_comment"
                          label="Move-out Comment"
                          type="textarea"
                          rows="2"
                          outlined
                          dense
                          placeholder="Condition and notes when tenant moved out..."
                        />
                      </div>
                      <div class="custom-item-field">
                        <q-uploader
                          v-model="item.move_out_photos"
                          label="Move-out Photos"
                          accept="image/*"
                          multiple
                          max-files="5"
                          style="width: 100%"
                          :auto-upload="false"
                          :hide-upload-btn="true"
                          :hide-upload-progress="true"
                          :hide-thumbnails="false"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Empty State -->
            <div v-else class="empty-custom-items">
              <q-icon name="inventory_2" size="48px" color="grey-4" />
              <div class="text-body2 text-grey-6 q-mt-sm">No items added yet</div>
              <div class="text-caption text-grey-5">Click "Add Item" to add inventory items</div>
            </div>
          </div>
        </div>
      </q-card-section>

      <!-- Actions -->
      <q-card-actions class="inventory-actions">
        <q-btn flat label="Cancel" @click="$emit('cancel')" />
        <q-btn color="primary" label="Save Inventory" :loading="saving" @click="saveInventory" />
      </q-card-actions>
    </q-card>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useUserDataStore } from '../stores/userDataStore'
import { useFirebase } from '../composables/useFirebase'
import { Notify } from 'quasar'

// Props
const props = defineProps({
  leaseId: {
    type: String,
    required: true,
  },
  propertyId: {
    type: String,
    required: true,
  },
  leaseData: {
    type: Object,
    required: true,
  },
  initialData: {
    type: Object,
    default: () => null,
  },
})

// Emits
const emit = defineEmits(['saved', 'cancel'])

// Composables
const userDataStore = useUserDataStore()
const { createDocument, updateDocument } = useFirebase()

// Reactive data
const saving = ref(false)

// Initialize inventory data
const initializeInventoryData = () => {
  // Debug: Log the lease data structure
  console.log('=== INVENTORY DEBUG: Lease Data Structure ===')
  console.log('Full leaseData:', props.leaseData)
  console.log('leaseData.property_address:', props.leaseData.property_address)
  console.log('leaseData.property?.address:', props.leaseData.property?.address)
  console.log('leaseData.property_nickname:', props.leaseData.property_nickname)
  console.log('leaseData.property?.nickname:', props.leaseData.property?.nickname)
  console.log('propertyId:', props.propertyId)
  console.log('leaseId:', props.leaseId)
  console.log('=== END DEBUG ===')

  // Get property address from lease data (same logic as LeasesPage)
  let propertyAddress = 'No Address'

  // Try flattened structure first
  if (props.leaseData.property_address) {
    propertyAddress = props.leaseData.property_address
    console.log('Using property_address:', propertyAddress)
  } else if (props.leaseData.property_nickname) {
    propertyAddress = props.leaseData.property_nickname
    console.log('Using property_nickname as address:', propertyAddress)
  }
  // Try nested structure
  else if (props.leaseData.property?.address) {
    propertyAddress = props.leaseData.property.address
    console.log('Using property.address:', propertyAddress)
  } else if (props.leaseData.property?.nickname) {
    propertyAddress = props.leaseData.property.nickname
    console.log('Using property.nickname as address:', propertyAddress)
  }
  // Fallback to property lookup by ID
  else {
    const extractedPropertyId =
      props.leaseData.property_id || props.leaseData.property?.id || props.propertyId
    console.log('Fallback: Extracted property ID:', extractedPropertyId)
    const property = userDataStore.getPropertyById(extractedPropertyId)
    console.log('Fallback: Found property by ID:', property)
    if (property) {
      propertyAddress = property.address || property.nickname || 'No Address'
      console.log('Fallback: Using property data:', propertyAddress)
    }
  }

  console.log('Final resolved propertyAddress:', propertyAddress)

  return {
    property_id: props.propertyId,
    property_address: propertyAddress,
    lease_id: props.leaseId,
    // Main inventory record - only metadata
    created_datetime: new Date().toISOString(),
    updated_datetime: new Date().toISOString(),

    // Local data for UI - will be saved to separate subcollections
    ktcs_items: {
      door_keys: { received: 0, returned: 0 },
      garage_tokens: { received: 0, returned: 0 },
      security_card: { received: 0, returned: 0 },
      mailbox_keys: { received: 0, returned: 0 },
    },
    custom_items: [], // Area-based items with comments (saved to separate subcollection)
  }
}

const inventoryData = ref(initializeInventoryData())

// Item suggestions grouped by area
const itemSuggestionsByArea = {
  Kitchen: [
    'Refrigerator',
    'Stove/Oven',
    'Dishwasher',
    'Microwave',
    'Pots and Pans',
    'Dishes',
    'Cutlery',
    'Glasses',
    'Kitchen Utensils',
    'Toaster',
    'Coffee Maker',
    'Blender',
    'Can Opener',
    'Garbage Disposal',
  ],
  'Living Room': [
    'Sofa',
    'Chair',
    'Coffee Table',
    'Television',
    'Cable Box',
    'Internet Router',
    'Curtains/Blinds',
    'Rugs',
    'Pillows',
    'Blankets',
    'Light Fixtures',
    'Ceiling Fan',
  ],
  Bedroom: [
    'Bed Frame',
    'Mattress',
    'Dresser',
    'Nightstand',
    'Wardrobe',
    'Hangers',
    'Curtains/Blinds',
    'Pillows',
    'Blankets',
    'Light Fixtures',
    'Ceiling Fan',
  ],
  Bathroom: [
    'Shower Curtain',
    'Towels',
    'Bath Mat',
    'Toilet Paper Holder',
    'Mirror',
    'Cleaning Supplies',
  ],
  Laundry: ['Washing Machine', 'Dryer', 'Cleaning Supplies', 'Storage Containers'],
  'Dining Room': ['Dining Table', 'Chair', 'Light Fixtures', 'Curtains/Blinds', 'Rugs'],
  Office: ['Desk', 'Chair', 'Bookshelf', 'Light Fixtures', 'Extension Cords'],
  'Outdoor/Garage': [
    'Lawn Mower',
    'Garden Hose',
    'Patio Furniture',
    'Grill',
    'Bike',
    'Storage Boxes',
    'Tools',
  ],
  'Safety & Maintenance': [
    'Smoke Detector',
    'Carbon Monoxide Detector',
    'Fire Extinguisher',
    'First Aid Kit',
    'Light Bulbs',
    'Batteries',
    'Step Ladder',
    'Vacuum Cleaner',
    'Broom',
    'Mop',
  ],
  HVAC: ['Air Conditioner', 'Heater', 'Water Heater', 'Thermostat'],
}

// Area options for the dropdown
const areaOptions = Object.keys(itemSuggestionsByArea)

const itemSuggestions = ref([])

// Get filtered item suggestions based on area
const getItemSuggestionsForArea = (area) => {
  return area ? itemSuggestionsByArea[area] || [] : []
}

// Filter item suggestions based on area and search term
const filterItemSuggestions = (itemIndex, val, update) => {
  const currentItem = inventoryData.value.custom_items[itemIndex]
  const areaItems = getItemSuggestionsForArea(currentItem?.area)

  if (val === '') {
    update(() => {
      itemSuggestions.value = [...areaItems]
    })
    return
  }

  update(() => {
    const needle = val.toLowerCase()
    itemSuggestions.value = areaItems.filter((item) => item.toLowerCase().includes(needle))
  })
}

// Create new item
const createNewItem = (val, done) => {
  if (val.length > 0) {
    done(val, 'toggle')
  }
}

// Add custom item
const addCustomItem = () => {
  inventoryData.value.custom_items.push({
    area: '',
    item: '',
    move_in_comment: '',
    move_out_comment: '',
  })
}

// Remove custom item
const removeCustomItem = (index) => {
  inventoryData.value.custom_items.splice(index, 1)
}

// Save ktcs items (keys, tokens, cards, security, user-added other items)
const saveKtcsItems = async (inventoryId) => {
  const ktcsPath = `properties/${props.propertyId}/inventories/${inventoryId}/ktcs`

  // Save standard items
  const standardItems = [
    { type: 'door_keys', ...inventoryData.value.ktcs_items.door_keys },
    { type: 'garage_tokens', ...inventoryData.value.ktcs_items.garage_tokens },
    { type: 'security_card', ...inventoryData.value.ktcs_items.security_card },
    { type: 'mailbox_keys', ...inventoryData.value.ktcs_items.mailbox_keys },
  ]

  // Save each standard item
  for (const item of standardItems) {
    await createDocument(ktcsPath, {
      ...item,
      category: 'standard',
      created_datetime: new Date().toISOString(),
    })
  }
}

// Save custom items (area-based items with comments) to separate subcollection
const saveCustomItems = async (inventoryId) => {
  const customItemsPath = `properties/${props.propertyId}/inventories/${inventoryId}/custom_items`

  // Save each custom item
  for (const item of inventoryData.value.custom_items) {
    await createDocument(customItemsPath, {
      area: item.area,
      item: item.item,
      move_in_comment: item.move_in_comment,
      move_out_comment: item.move_out_comment,
      created_datetime: new Date().toISOString(),
    })
  }
}

// Save inventory
const saveInventory = async () => {
  try {
    saving.value = true

    // Validate custom items
    for (const item of inventoryData.value.custom_items) {
      if (!item.item) {
        Notify.create({
          type: 'negative',
          message: 'All custom items must have a name',
          position: 'top',
        })
        return
      }
    }

    inventoryData.value.updated_datetime = new Date().toISOString()

    // Prepare main inventory record (without ktcs_items)
    const mainInventoryData = {
      property_id: inventoryData.value.property_id,
      property_address: inventoryData.value.property_address,
      lease_id: inventoryData.value.lease_id,
      created_datetime: inventoryData.value.created_datetime,
      updated_datetime: inventoryData.value.updated_datetime,
    }

    let result
    let inventoryId

    if (inventoryData.value.id) {
      // Update existing inventory
      inventoryId = inventoryData.value.id
      await updateDocument(
        `properties/${props.propertyId}/inventories`,
        inventoryId,
        mainInventoryData,
      )
    } else {
      // Create new inventory
      result = await createDocument(`properties/${props.propertyId}/inventories`, mainInventoryData)
      inventoryId = result.id
      inventoryData.value.id = inventoryId
    }

    // Save KTCS items (keys, tokens, cards, security, other items) to ktcs subcollection
    await saveKtcsItems(inventoryId)

    // Save custom items (area-based items with comments) to custom_items subcollection
    await saveCustomItems(inventoryId)

    Notify.create({
      type: 'positive',
      message: 'Inventory saved successfully!',
      position: 'top',
    })

    emit('saved', inventoryData.value)
  } catch (error) {
    console.error('Error saving inventory:', error)
    Notify.create({
      type: 'negative',
      message: 'Failed to save inventory. Please try again.',
      position: 'top',
    })
  } finally {
    saving.value = false
  }
}

// Load existing inventory data
const loadInventoryData = async () => {
  if (props.initialData) {
    inventoryData.value = { ...inventoryData.value, ...props.initialData }
  }
}

// Initialize
onMounted(() => {
  loadInventoryData()
})

// Watch for prop changes
watch(
  () => props.initialData,
  (newData) => {
    if (newData) {
      inventoryData.value = { ...inventoryData.value, ...newData }
    }
  },
  { deep: true },
)
</script>

<style scoped>
.inventory-card {
  max-width: 1000px;
  margin: 0 auto;
}

.inventory-header {
  border-bottom: 1px solid var(--neutral-200);
  background: var(--bg-secondary);
}

/* Subcollection Headers */
.ktcs-subcollection-section,
.custom-items-subcollection-section {
  background: var(--bg-surface);
  border-radius: 16px;
  border: 3px solid var(--neutral-200);
  padding: 24px;
  margin-bottom: 24px;
}

.subcollection-header {
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid var(--neutral-200);
}

.subcollection-title {
  display: flex;
  align-items: center;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--neutral-800);
  margin-bottom: 4px;
}

.subcollection-subtitle {
  font-size: 0.875rem;
  color: var(--neutral-600);
  margin-left: 32px;
  font-style: italic;
}

.ktcs-items-section {
  background: var(--bg-secondary);
  border-radius: 12px;
  border: 2px solid var(--neutral-200);
  padding: 20px;
  margin-bottom: 16px;
}

.lease-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.info-item {
  padding: 12px;
  background: var(--bg-surface);
  border-radius: 8px;
  border: 1px solid var(--neutral-200);
}

.info-label {
  font-size: 0.75rem;
  color: var(--neutral-600);
  font-weight: 500;
  margin-bottom: 4px;
}

.info-value {
  font-size: 0.875rem;
  color: var(--neutral-800);
  font-weight: 600;
}

.standard-items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}

.standard-item-card {
  padding: 16px;
  background: var(--bg-surface);
  border-radius: 12px;
  border: 2px solid var(--neutral-200);
  transition: all 0.2s ease;
}

.standard-item-card:hover {
  border-color: var(--primary-color);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.item-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.item-icon {
  font-size: 24px;
  color: var(--primary-color);
  margin-right: 8px;
}

.item-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--neutral-800);
}

.item-status-row {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  justify-content: space-between;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.custom-items-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.custom-item-card {
  padding: 20px;
  background: var(--bg-surface);
  border-radius: 12px;
  border: 2px solid var(--secondary-color);
}

.custom-item-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.custom-item-icon {
  font-size: 20px;
  color: var(--secondary-color);
  margin-right: 8px;
}

.custom-item-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--neutral-700);
  flex: 1;
}

.custom-item-content {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

.custom-item-field {
  width: 100%;
}

/* Custom Other Items Styles */
.custom-other-items-section {
  background: var(--bg-secondary);
  border-radius: 12px;
  border: 2px solid var(--neutral-200);
  padding: 20px;
}

.custom-other-items-list {
  display: grid;
  gap: 16px;
}

.custom-other-item-card {
  background: var(--bg-surface);
  border-radius: 12px;
  border: 2px solid var(--neutral-200);
  padding: 16px;
  transition: all 0.3s ease;
}

.custom-other-item-card:hover {
  border-color: var(--primary-color);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.custom-other-item-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--neutral-200);
}

.custom-other-item-icon {
  color: var(--primary-color);
  margin-right: 8px;
}

.custom-other-item-title {
  flex: 1;
  font-size: 1rem;
  font-weight: 600;
  color: var(--neutral-800);
}

.custom-other-item-content {
  display: grid;
  gap: 16px;
}

.custom-other-item-field {
  width: 100%;
}

.quantities-row {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.empty-custom-other-items {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  background: var(--bg-secondary);
  border-radius: 12px;
  border: 2px dashed var(--neutral-300);
}

.empty-custom-items {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  background: var(--bg-secondary);
  border-radius: 12px;
  border: 2px dashed var(--neutral-300);
}

.inventory-actions {
  padding: 16px 24px;
  border-top: 1px solid var(--neutral-200);
  background: var(--bg-secondary);
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .standard-items-grid {
    grid-template-columns: 1fr;
  }

  .lease-info-grid {
    grid-template-columns: 1fr;
  }

  .item-status-row {
    flex-direction: column;
    gap: 8px;
  }

  .quantities-row {
    flex-direction: column;
    gap: 8px;
  }

  .quantities-row q-input {
    width: 100% !important;
  }
}

/* Dialog Close Button Styling */
.dialog-close-btn {
  color: var(--neutral-600);
  transition: all 0.2s ease;
}

.dialog-close-btn:hover {
  color: var(--primary-color);
  background: rgba(36, 87, 115, 0.1);
  transform: scale(1.1);
}
</style>
