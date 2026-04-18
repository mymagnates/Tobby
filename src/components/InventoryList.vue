<template>
  <div class="inventory-list">
    <div class="inventory-shell">
      <div class="inventory-header">
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
      </div>
      <div class="inventory-content">
        <!-- Lease Information (Read-only) -->
        <div class="lease-info-section q-mb-lg">
          <div class="text-subtitle1 text-weight-medium q-mb-sm">Lease Information</div>
          <div class="lease-info-grid">
            <div class="info-item">
              <div class="info-label">Lease ID</div>
              <div class="info-value">{{ displayLeaseIdentifier }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Property Address</div>
              <div class="info-value">{{ displayPropertyAddress }}</div>
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
                <div class="custom-item-header" @click="toggleCustomItem(index)">
                  <div class="custom-item-header-main">
                    <q-icon name="inventory_2" class="custom-item-icon" />
                    <div class="custom-item-title-block">
                      <div class="custom-item-title">
                        {{ item.item || `Item ${index + 1}` }}
                      </div>
                      <div v-if="item.created_datetime" class="custom-item-meta">
                        Created {{ formatDateTime(item.created_datetime) }}
                      </div>
                    </div>
                  </div>
                  <div class="custom-item-header-actions">
                    <q-btn
                      flat
                      round
                      :icon="item.collapsed ? 'expand_more' : 'expand_less'"
                      color="grey-7"
                      size="sm"
                      @click.stop="toggleCustomItem(index)"
                    />
                  <q-btn
                    flat
                    round
                    icon="delete"
                    color="negative"
                    size="sm"
                    @click.stop="removeCustomItem(index)"
                  />
                  </div>
                </div>

                <div v-show="!item.collapsed" class="custom-item-content">
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
                        <q-file
                          v-model="item.move_in_photo_file"
                          class="inventory-photo-input"
                          label="Move-in Photos"
                          accept="image/*"
                          outlined
                          dense
                          clearable
                        >
                          <template v-slot:prepend>
                            <q-icon name="photo_camera" />
                          </template>
                        </q-file>
                        <div v-if="item.move_in_photo_url" class="inventory-photo-preview q-mt-sm">
                          <q-img
                            :src="item.move_in_photo_url"
                            class="inventory-photo-thumb"
                            fit="cover"
                            @click="showImageFullscreen(item.move_in_photo_url, `${item.item || 'Item'} Move-in Photo`)"
                          />
                          <div v-if="item.move_in_photo_uploaded_at" class="inventory-photo-meta">
                            Uploaded {{ formatDateTime(item.move_in_photo_uploaded_at) }}
                          </div>
                        </div>
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
                        <q-file
                          v-model="item.move_out_photo_file"
                          class="inventory-photo-input"
                          label="Move-out Photos"
                          accept="image/*"
                          outlined
                          dense
                          clearable
                        >
                          <template v-slot:prepend>
                            <q-icon name="photo_camera" />
                          </template>
                        </q-file>
                        <div v-if="item.move_out_photo_url" class="inventory-photo-preview q-mt-sm">
                          <q-img
                            :src="item.move_out_photo_url"
                            class="inventory-photo-thumb"
                            fit="cover"
                            @click="showImageFullscreen(item.move_out_photo_url, `${item.item || 'Item'} Move-out Photo`)"
                          />
                          <div v-if="item.move_out_photo_uploaded_at" class="inventory-photo-meta">
                            Uploaded {{ formatDateTime(item.move_out_photo_uploaded_at) }}
                          </div>
                        </div>
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
      </div>

      <!-- Actions -->
      <div class="inventory-actions">
        <q-btn flat label="Cancel" @click="$emit('cancel')" />
        <q-btn color="primary" label="Save Inventory" :loading="saving" @click="saveInventory" />
      </div>
    </div>

    <q-dialog v-model="showImageViewer" maximized>
      <q-card class="image-viewer-card">
        <q-card-section class="image-viewer-header">
          <div class="row items-center justify-between">
            <div class="text-h6 text-weight-bold">{{ currentImageTitle }}</div>
            <q-btn flat round icon="close" @click="closeImageViewer" class="close-btn" />
          </div>
        </q-card-section>
        <q-card-section class="image-viewer-content">
          <q-img :src="currentImageUrl" class="fullscreen-image" fit="contain">
            <template v-slot:loading>
              <q-spinner-gears color="primary" size="50px" />
            </template>
            <template v-slot:error>
              <div class="absolute-full flex flex-center bg-negative text-white">
                <div class="text-center">
                  <q-icon name="broken_image" size="64px" />
                  <div class="q-mt-sm">Failed to load image</div>
                </div>
              </div>
            </template>
          </q-img>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useFirebase } from '../composables/useFirebase'
import { Notify } from 'quasar'

// Props
const props = defineProps({
  initialData: {
    type: Object,
    default: () => null,
  },
})

// Emits
const emit = defineEmits(['saved', 'cancel'])
const PRIMARY_INVENTORY_DOC_ID = 'primary'

// Composables
const { createDocument, updateDocument, uploadFile } = useFirebase()

// Reactive data
const saving = ref(false)
const showImageViewer = ref(false)
const currentImageUrl = ref('')
const currentImageTitle = ref('')

// Initialize inventory data
const initializeInventoryData = () => {
  return {
    id: '',
    property_id: '',
    property_address: 'No Address',
    lease_doc_id: '',
    lease_lsid: '',
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

const displayLeaseIdentifier = computed(
  () => String(inventoryData.value?.lease_lsid || '').trim() || 'N/A',
)

const displayPropertyAddress = computed(
  () => String(inventoryData.value?.property_address || '').trim() || 'No Address',
)

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

const formatDateTime = (value) => {
  if (!value) return ''
  try {
    const next = value?.toDate ? value.toDate() : new Date(value)
    if (!(next instanceof Date) || Number.isNaN(next.getTime())) return ''
    return next.toLocaleString()
  } catch {
    return ''
  }
}

// Add custom item
const addCustomItem = () => {
  inventoryData.value.custom_items.push({
    area: '',
    item: '',
    collapsed: false,
    created_datetime: new Date().toISOString(),
    move_in_comment: '',
    move_out_comment: '',
    move_in_photo_file: null,
    move_out_photo_file: null,
    move_in_photo_url: '',
    move_out_photo_url: '',
    move_in_photo_uploaded_at: '',
    move_out_photo_uploaded_at: '',
    move_in_photo_storage_path: '',
    move_out_photo_storage_path: '',
  })
}

// Remove custom item
const removeCustomItem = (index) => {
  inventoryData.value.custom_items.splice(index, 1)
}

const toggleCustomItem = (index) => {
  const targetItem = inventoryData.value.custom_items[index]
  if (!targetItem) return
  targetItem.collapsed = !targetItem.collapsed
}

const getLeaseInventoriesPath = (leaseDocId) => `leases/${leaseDocId}/inventories`

const showImageFullscreen = (imageUrl, title) => {
  currentImageUrl.value = imageUrl
  currentImageTitle.value = title
  showImageViewer.value = true
}

const closeImageViewer = () => {
  showImageViewer.value = false
  currentImageUrl.value = ''
  currentImageTitle.value = ''
}

const sanitizeFileSegment = (value) =>
  String(value || 'file')
    .trim()
    .replace(/[^a-zA-Z0-9._-]/g, '-')

const uploadCustomItemPhoto = async (file, leaseDocId, context, itemLabel) => {
  if (!file || !leaseDocId) return null
  const extension = String(file.name || '').split('.').pop() || 'jpg'
  const safeItemLabel = sanitizeFileSegment(itemLabel || 'item')
  const fileName = `${Date.now()}_${safeItemLabel}.${extension}`
  const storagePath = `images/leases/${leaseDocId}/inventory/${context}/${fileName}`
  const url = await uploadFile(storagePath, file)
  return {
    url,
    storagePath,
  }
}

// Save inventory
const saveInventory = async () => {
  try {
    saving.value = true
    const activeLeaseDocId = String(inventoryData.value.lease_doc_id || '').trim()
    const activePropertyId = String(inventoryData.value.property_id || '').trim()
    if (!activeLeaseDocId) {
      Notify.create({
        type: 'negative',
        message: 'Lease reference is missing for this inventory.',
        position: 'top',
      })
      return
    }

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

    const normalizedCustomItems = []
    for (const item of inventoryData.value.custom_items) {
      const nextItem = {
        area: item.area || '',
        item: item.item || '',
        collapsed: Boolean(item.collapsed),
        created_datetime: item.created_datetime || new Date().toISOString(),
        move_in_comment: item.move_in_comment || '',
        move_out_comment: item.move_out_comment || '',
        move_in_photo_url: item.move_in_photo_url || '',
        move_out_photo_url: item.move_out_photo_url || '',
        move_in_photo_uploaded_at: item.move_in_photo_uploaded_at || '',
        move_out_photo_uploaded_at: item.move_out_photo_uploaded_at || '',
        move_in_photo_storage_path: item.move_in_photo_storage_path || '',
        move_out_photo_storage_path: item.move_out_photo_storage_path || '',
      }

      const moveInFile = item.move_in_photo_file || null
      if (moveInFile) {
        const uploadedMoveIn = await uploadCustomItemPhoto(
          moveInFile,
          activeLeaseDocId,
          'inventory_move_in',
          item.item,
        )
        if (uploadedMoveIn) {
          nextItem.move_in_photo_url = uploadedMoveIn.url || ''
          nextItem.move_in_photo_storage_path = uploadedMoveIn.storagePath || ''
          nextItem.move_in_photo_uploaded_at = new Date().toISOString()
        }
      }

      const moveOutFile = item.move_out_photo_file || null
      if (moveOutFile) {
        const uploadedMoveOut = await uploadCustomItemPhoto(
          moveOutFile,
          activeLeaseDocId,
          'inventory_move_out',
          item.item,
        )
        if (uploadedMoveOut) {
          nextItem.move_out_photo_url = uploadedMoveOut.url || ''
          nextItem.move_out_photo_storage_path = uploadedMoveOut.storagePath || ''
          nextItem.move_out_photo_uploaded_at = new Date().toISOString()
        }
      }

      normalizedCustomItems.push(nextItem)
    }

    // Persist the full inventory in the main inventory document.
    const mainInventoryData = {
      property_id: activePropertyId || '',
      property_address: String(inventoryData.value.property_address || '').trim() || '',
      lease_doc_id: activeLeaseDocId,
      lease_lsid: String(inventoryData.value.lease_lsid || '').trim() || '',
      ktcs_items: {
        door_keys: { ...inventoryData.value.ktcs_items.door_keys },
        garage_tokens: { ...inventoryData.value.ktcs_items.garage_tokens },
        security_card: { ...inventoryData.value.ktcs_items.security_card },
        mailbox_keys: { ...inventoryData.value.ktcs_items.mailbox_keys },
      },
      custom_items: normalizedCustomItems,
      created_datetime: inventoryData.value.created_datetime,
      updated_datetime: inventoryData.value.updated_datetime,
    }

    let result
    let inventoryId

    if (inventoryData.value.id) {
      // Update existing inventory
      inventoryId = inventoryData.value.id
      await updateDocument(
        getLeaseInventoriesPath(activeLeaseDocId),
        inventoryId,
        mainInventoryData,
      )
    } else {
      // Legacy fallback: if the primary inventory doc is missing, recreate it under the fixed id.
      result = await createDocument(
        getLeaseInventoriesPath(activeLeaseDocId),
        mainInventoryData,
        PRIMARY_INVENTORY_DOC_ID,
      )
      inventoryId = String(result?.id || result || '').trim()
      inventoryData.value.id = inventoryId
    }

    if (!inventoryId) {
      throw new Error('Failed to resolve inventory ID while saving inventory record.')
    }

    inventoryData.value.custom_items = normalizedCustomItems.map((item) => ({
      ...item,
      move_in_photo_file: null,
      move_out_photo_file: null,
    }))

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
const loadInventoryData = () => {
  const base = initializeInventoryData()
  if (props.initialData && typeof props.initialData === 'object') {
    inventoryData.value = {
      ...base,
      ...props.initialData,
      id: props.initialData.id || base.id,
      property_id: props.initialData.property_id || base.property_id,
      property_address: props.initialData.property_address || base.property_address,
      lease_doc_id: props.initialData.lease_doc_id || base.lease_doc_id,
      lease_lsid: props.initialData.lease_lsid || base.lease_lsid,
      ktcs_items: {
        ...base.ktcs_items,
        ...(props.initialData.ktcs_items || {}),
      },
      custom_items: Array.isArray(props.initialData.custom_items)
        ? props.initialData.custom_items.map((item) => ({
            area: item.area || '',
            item: item.item || '',
            collapsed: Boolean(item.collapsed),
            created_datetime: item.created_datetime || '',
            move_in_comment: item.move_in_comment || '',
            move_out_comment: item.move_out_comment || '',
            move_in_photo_file: null,
            move_out_photo_file: null,
            move_in_photo_url: item.move_in_photo_url || '',
            move_out_photo_url: item.move_out_photo_url || '',
            move_in_photo_uploaded_at: item.move_in_photo_uploaded_at || '',
            move_out_photo_uploaded_at: item.move_out_photo_uploaded_at || '',
            move_in_photo_storage_path: item.move_in_photo_storage_path || '',
            move_out_photo_storage_path: item.move_out_photo_storage_path || '',
          }))
        : base.custom_items,
    }
    return
  }
  inventoryData.value = base
}

watch(
  () => props.initialData,
  () => {
    loadInventoryData()
  },
  { deep: true, immediate: true },
)
</script>

<style scoped>
.inventory-list {
  width: 100%;
  height: 100%;
  min-height: 0;
  overflow: hidden;
}

.inventory-shell {
  width: 100%;
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--bg-surface);
}

.inventory-header {
  border-bottom: 1px solid var(--neutral-200);
  background: var(--bg-secondary);
  padding: 16px 20px;
  flex-shrink: 0;
}

.inventory-content {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
  padding: 16px 20px;
  padding-bottom: calc(84px + constant(safe-area-inset-bottom));
  padding-bottom: calc(84px + env(safe-area-inset-bottom, 0px));
  scroll-padding-bottom: calc(84px + env(safe-area-inset-bottom, 0px));
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
  justify-content: space-between;
  margin-bottom: 16px;
  cursor: pointer;
}

.custom-item-header-main {
  display: flex;
  align-items: center;
  min-width: 0;
  flex: 1;
}

.custom-item-title-block {
  min-width: 0;
  flex: 1;
}

.custom-item-header-actions {
  display: flex;
  align-items: center;
  gap: 4px;
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

.custom-item-meta {
  font-size: 0.75rem;
  color: var(--neutral-500);
  margin-top: 2px;
}

.custom-item-content {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

.custom-item-field {
  width: 100%;
}

.inventory-photo-input {
  background: #fff;
  border: 1px solid var(--neutral-200);
  border-radius: 12px;
}

.inventory-photo-input :deep(.q-field__control) {
  background: #fff;
  border-radius: 12px;
}

.inventory-photo-preview {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

.inventory-photo-thumb {
  width: 96px;
  height: 96px;
  border-radius: 10px;
  border: 1px solid var(--neutral-200);
  cursor: pointer;
  overflow: hidden;
}

.inventory-photo-meta {
  font-size: 0.75rem;
  color: var(--neutral-500);
  margin-top: 6px;
}

.image-viewer-card {
  background: var(--bg-surface);
}

.image-viewer-header {
  border-bottom: 1px solid var(--neutral-200);
  background: var(--bg-secondary);
}

.image-viewer-content {
  height: calc(100vh - 72px);
  background: #fff;
}

.fullscreen-image {
  width: 100%;
  height: 100%;
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
  padding: 12px 20px calc(12px + env(safe-area-inset-bottom, 0px));
  border-top: 1px solid var(--neutral-200);
  background: var(--bg-secondary);
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: flex-end;
  flex-shrink: 0;
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
