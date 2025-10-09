<template>
  <div
    class="property-card"
    :class="[`property-card--${status}`, { 'property-card--featured': isFeatured }]"
  >
    <!-- Badges -->
    <div class="property-card__badges" v-if="showBadges">
      <span v-if="isFeatured" class="property-card__badge badge-featured">Featured</span>
      <span v-if="isNew" class="property-card__badge badge-new">New</span>
      <span v-if="isHot" class="property-card__badge badge-hot">Hot</span>
      <span v-if="hasDiscount" class="property-card__badge badge-discount"
        >-{{ discountPercent }}%</span
      >
    </div>

    <!-- Header -->
    <div class="property-card__header">
      <div class="property-card__title">
        {{ property.name || property.nickname || 'Property Name' }}
      </div>
      <div class="property-card__subtitle">{{ property.address || 'Address not specified' }}</div>
      <div class="property-card__status" :class="`status-${status}`">
        <q-icon :name="getStatusIcon()" size="12px" />
        {{ getStatusText() }}
      </div>
    </div>

    <!-- Content -->
    <div class="property-card__content">
      <!-- Metrics Grid -->
      <div class="property-card__metrics">
        <div class="property-card__metric metric-primary">
          <div class="metric-value">{{ property.total_units || 0 }}</div>
          <div class="metric-label">Units</div>
        </div>
        <div class="property-card__metric metric-success">
          <div class="metric-value">{{ property.occupied_units || 0 }}</div>
          <div class="metric-label">Occupied</div>
        </div>
        <div class="property-card__metric metric-accent">
          <div class="metric-value">{{ getOccupancyRate() }}%</div>
          <div class="metric-label">Occupancy</div>
        </div>
        <div class="property-card__metric">
          <div class="metric-value">{{ property.property_type || 'N/A' }}</div>
          <div class="metric-label">Type</div>
        </div>
      </div>

      <!-- Details Grid -->
      <div class="property-card__details">
        <div class="property-card__detail">
          <q-icon name="location_on" class="detail-icon" />
          <span class="detail-label">City:</span>
          <span class="detail-value">{{ property.city || 'N/A' }}</span>
        </div>
        <div class="property-card__detail">
          <q-icon name="apartment" class="detail-icon" />
          <span class="detail-label">Floors:</span>
          <span class="detail-value">{{ property.floors || 'N/A' }}</span>
        </div>
        <div class="property-card__detail">
          <q-icon name="construction" class="detail-icon" />
          <span class="detail-label">Built:</span>
          <span class="detail-value">{{ property.year_built || 'N/A' }}</span>
        </div>
        <div class="property-card__detail">
          <q-icon name="square_foot" class="detail-icon" />
          <span class="detail-label">Size:</span>
          <span class="detail-value">{{ property.total_area || 'N/A' }}</span>
        </div>
      </div>

      <!-- Quick Stats -->
      <div class="property-card__quick-stats">
        <div class="quick-stat">
          <q-icon name="trending_up" class="stat-icon" />
          <span>{{ getLeaseCount() }} Leases</span>
        </div>
        <div class="quick-stat">
          <q-icon name="receipt" class="stat-icon" />
          <span>{{ getTransactionCount() }} Transactions</span>
        </div>
        <div class="quick-stat">
          <q-icon name="dns" class="stat-icon" />
          <span>{{ getMxRecordCount() }} Tasks</span>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="property-card__actions">
      <button class="property-card__action action-primary" @click="viewDetails">View</button>
      <button class="property-card__action action-secondary" @click="editProperty">Edit</button>
      <button class="property-card__action action-accent" @click="createLease">Lease</button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const props = defineProps({
  property: {
    type: Object,
    required: true,
  },
  showBadges: {
    type: Boolean,
    default: true,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  isNew: {
    type: Boolean,
    default: false,
  },
  isHot: {
    type: Boolean,
    default: false,
  },
  hasDiscount: {
    type: Boolean,
    default: false,
  },
  discountPercent: {
    type: Number,
    default: 10,
  },
})

const status = computed(() => {
  if (props.property.status) return props.property.status
  if (props.property.occupied_units === props.property.total_units) return 'inactive'
  if (props.property.occupied_units > 0) return 'active'
  return 'pending'
})

const getStatusIcon = () => {
  const icons = {
    active: 'check_circle',
    inactive: 'cancel',
    pending: 'schedule',
    featured: 'star',
  }
  return icons[status.value] || 'help'
}

const getStatusText = () => {
  const texts = {
    active: 'Active',
    inactive: 'Full',
    pending: 'Available',
    featured: 'Featured',
  }
  return texts[status.value] || 'Unknown'
}

const getOccupancyRate = () => {
  if (!props.property.total_units || props.property.total_units === 0) return 0
  return Math.round((props.property.occupied_units / props.property.total_units) * 100)
}

const getLeaseCount = () => {
  return props.property.lease_count || props.property.leases?.length || 0
}

const getTransactionCount = () => {
  return props.property.transaction_count || props.property.transactions?.length || 0
}

const getMxRecordCount = () => {
  return props.property.mx_record_count || props.property.mx_records?.length || 0
}

const viewDetails = () => {
  router.push(`/my-properties/${props.property.id}`)
}

const editProperty = () => {
  router.push(`/edit-property/${props.property.id}`)
}

const createLease = () => {
  router.push(`/create-lease?property=${props.property.id}`)
}
</script>

<style scoped>
/* Component-specific styles can be added here if needed */
.property-card__action {
  cursor: pointer;
  user-select: none;
}

.property-card__action:focus {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
}
</style>
