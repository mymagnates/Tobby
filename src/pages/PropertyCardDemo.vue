<template>
  <q-page class="q-pa-lg">
    <div class="text-h4 text-weight-bold text-finance q-mb-lg">Modern Property Card Design</div>

    <div class="text-subtitle1 text-neutral-600 q-mb-xl">
      Sleek, dense, and informational property cards with modern finance app aesthetics
    </div>

    <!-- Grid Layout Options -->
    <div class="q-mb-lg">
      <div class="text-h6 text-weight-semibold q-mb-md">Layout Options</div>
      <div class="btn-group">
        <q-btn
          :class="layout === 'grid' ? 'btn-primary' : 'btn-secondary'"
          @click="layout = 'grid'"
          label="Grid"
          class="btn-md"
        />
        <q-btn
          :class="layout === 'compact' ? 'btn-primary' : 'btn-secondary'"
          @click="layout = 'compact'"
          label="Compact"
          class="btn-md"
        />
        <q-btn
          :class="layout === 'dense' ? 'btn-primary' : 'btn-secondary'"
          @click="layout = 'dense'"
          label="Dense"
          class="btn-md"
        />
        <q-btn
          :class="layout === 'list' ? 'btn-primary' : 'btn-secondary'"
          @click="layout = 'list'"
          label="List"
          class="btn-md"
        />
      </div>
    </div>

    <!-- Property Cards -->
    <div v-if="layout === 'grid'" class="property-grid">
      <PropertyCard
        v-for="property in demoProperties"
        :key="property.id"
        :property="property"
        :is-featured="property.id === 1"
        :is-new="property.id === 2"
        :is-hot="property.id === 3"
        :has-discount="property.id === 4"
        :discount-percent="15"
      />
    </div>

    <div v-else-if="layout === 'compact'" class="property-grid property-grid--compact">
      <PropertyCard
        v-for="property in demoProperties"
        :key="property.id"
        :property="property"
        :is-featured="property.id === 1"
        :is-new="property.id === 2"
        :is-hot="property.id === 3"
        :has-discount="property.id === 4"
        :discount-percent="15"
      />
    </div>

    <div v-else-if="layout === 'dense'" class="property-grid property-grid--dense">
      <PropertyCard
        v-for="property in demoProperties"
        :key="property.id"
        :property="property"
        :is-featured="property.id === 1"
        :is-new="property.id === 2"
        :is-hot="property.id === 3"
        :has-discount="property.id === 4"
        :discount-percent="15"
      />
    </div>

    <div v-else-if="layout === 'list'" class="property-list">
      <div v-for="property in demoProperties" :key="property.id" class="property-list-item">
        <div class="property-list-image">
          <q-icon name="home" size="2rem" color="grey-5" />
        </div>
        <div class="property-list-content">
          <div class="text-h6 text-weight-bold">{{ property.name }}</div>
          <div class="text-subtitle2 text-neutral-600 q-mb-sm">{{ property.address }}</div>
          <div class="row q-gutter-md">
            <div class="text-caption">
              <q-icon name="apartment" size="14px" class="q-mr-xs" />
              {{ property.total_units }} Units
            </div>
            <div class="text-caption">
              <q-icon name="check_circle" size="14px" class="q-mr-xs" />
              {{ property.occupied_units }} Occupied
            </div>
            <div class="text-caption">
              <q-icon name="location_on" size="14px" class="q-mr-xs" />
              {{ property.city }}
            </div>
          </div>
        </div>
        <div class="property-list-actions">
          <q-btn size="sm" class="btn-primary btn-sm" label="View" />
          <q-btn size="sm" class="btn-secondary btn-sm" label="Edit" />
        </div>
      </div>
    </div>

    <!-- Card Variants Demo -->
    <div class="q-mt-xl">
      <div class="text-h6 text-weight-semibold q-mb-md">Card Variants</div>
      <div class="row q-gutter-md">
        <div class="col-12 col-md-4">
          <div class="property-card property-card--featured">
            <div class="property-card__header">
              <div class="property-card__title">Featured Property</div>
              <div class="property-card__subtitle">Premium location with high demand</div>
              <div class="property-card__status status-featured">
                <q-icon name="star" size="12px" />
                Featured
              </div>
            </div>
            <div class="property-card__content">
              <div class="text-caption text-neutral-600">
                This card demonstrates the featured variant with accent colors and enhanced styling.
              </div>
            </div>
          </div>
        </div>

        <div class="col-12 col-md-4">
          <div class="property-card property-card--active">
            <div class="property-card__header">
              <div class="property-card__title">Active Property</div>
              <div class="property-card__subtitle">Currently operational</div>
              <div class="property-card__status status-active">
                <q-icon name="check_circle" size="12px" />
                Active
              </div>
            </div>
            <div class="property-card__content">
              <div class="text-caption text-neutral-600">
                This card shows the active state with success colors and green accents.
              </div>
            </div>
          </div>
        </div>

        <div class="col-12 col-md-4">
          <div class="property-card property-card--inactive">
            <div class="property-card__header">
              <div class="property-card__title">Inactive Property</div>
              <div class="property-card__subtitle">Currently unavailable</div>
              <div class="property-card__status status-inactive">
                <q-icon name="cancel" size="12px" />
                Inactive
              </div>
            </div>
            <div class="property-card__content">
              <div class="text-caption text-neutral-600">
                This card displays the inactive state with muted colors and reduced opacity.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State Demo -->
    <div class="q-mt-xl">
      <div class="text-h6 text-weight-semibold q-mb-md">Loading States</div>
      <div class="row q-gutter-md">
        <div class="col-12 col-md-4">
          <div class="property-card property-card--loading">
            <div class="property-card__image">
              <q-icon name="image" size="2rem" />
            </div>
            <div class="property-card__header">
              <div class="property-card__title">Loading Property</div>
              <div class="property-card__subtitle">Loading address...</div>
            </div>
            <div class="property-card__content">
              <div class="property-card__metrics">
                <div class="property-card__metric">
                  <div class="metric-value">--</div>
                  <div class="metric-label">Units</div>
                </div>
                <div class="property-card__metric">
                  <div class="metric-value">--</div>
                  <div class="metric-label">Occupied</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Button Showcase -->
    <div class="q-mt-xl">
      <ButtonShowcase />
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import PropertyCard from '../components/PropertyCard.vue'
import ButtonShowcase from '../components/ButtonShowcase.vue'

const layout = ref('grid')

const demoProperties = [
  {
    id: 1,
    name: 'Sunset Towers',
    nickname: 'ST-001',
    address: '123 Sunset Blvd, Los Angeles, CA',
    city: 'Los Angeles',
    total_units: 45,
    occupied_units: 42,
    property_type: 'Apartment',
    floors: 12,
    year_built: 2018,
    total_area: '45,000 sq ft',
    status: 'active',
    lease_count: 42,
    transaction_count: 156,
    mx_record_count: 8,
  },
  {
    id: 2,
    name: 'Marina Heights',
    nickname: 'MH-002',
    address: '456 Ocean Drive, Miami, FL',
    city: 'Miami',
    total_units: 32,
    occupied_units: 28,
    property_type: 'Condominium',
    floors: 8,
    year_built: 2020,
    total_area: '28,000 sq ft',
    status: 'active',
    lease_count: 28,
    transaction_count: 89,
    mx_record_count: 5,
  },
  {
    id: 3,
    name: 'Downtown Plaza',
    nickname: 'DP-003',
    address: '789 Business Ave, New York, NY',
    city: 'New York',
    total_units: 60,
    occupied_units: 60,
    property_type: 'Office',
    floors: 15,
    year_built: 2015,
    total_area: '75,000 sq ft',
    status: 'inactive',
    lease_count: 60,
    transaction_count: 234,
    mx_record_count: 12,
  },
  {
    id: 4,
    name: 'Garden Court',
    nickname: 'GC-004',
    address: '321 Park Street, Austin, TX',
    city: 'Austin',
    total_units: 24,
    occupied_units: 0,
    property_type: 'Townhouse',
    floors: 3,
    year_built: 2021,
    total_area: '18,000 sq ft',
    status: 'pending',
    lease_count: 0,
    transaction_count: 0,
    mx_record_count: 0,
  },
  {
    id: 5,
    name: 'Riverside Lofts',
    nickname: 'RL-005',
    address: '654 River Road, Portland, OR',
    city: 'Portland',
    total_units: 18,
    occupied_units: 15,
    property_type: 'Loft',
    floors: 6,
    year_built: 2019,
    total_area: '22,000 sq ft',
    status: 'active',
    lease_count: 15,
    transaction_count: 67,
    mx_record_count: 3,
  },
  {
    id: 6,
    name: 'Mountain View',
    nickname: 'MV-006',
    address: '987 Summit Peak, Denver, CO',
    city: 'Denver',
    total_units: 36,
    occupied_units: 30,
    property_type: 'Apartment',
    floors: 9,
    year_built: 2017,
    total_area: '38,000 sq ft',
    status: 'active',
    lease_count: 30,
    transaction_count: 112,
    mx_record_count: 6,
  },
]
</script>

<style scoped>
/* Demo-specific styles */
.property-card--loading .property-card__image {
  background: var(--neutral-200);
}
</style>
