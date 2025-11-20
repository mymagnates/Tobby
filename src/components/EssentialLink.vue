<template>
  <q-item
    clickable
    :tag="isInternalLink ? 'div' : 'a'"
    :target="isInternalLink ? undefined : '_blank'"
    :href="isInternalLink ? undefined : link"
    @click="isInternalLink ? handleInternalClick() : undefined"
    class="essential-link"
  >
    <q-item-section v-if="icon" avatar class="link-icon">
      <q-icon :name="icon" :color="getIconColor()" />
    </q-item-section>

    <q-item-section class="link-content">
      <q-item-label class="link-title">{{ title }}</q-item-label>
      <q-item-label caption class="link-caption">
        {{ caption }}
      </q-item-label>
    </q-item-section>

    <q-item-section side class="link-arrow">
      <q-icon name="o_chevron_right" color="grey-5" size="16px" />
    </q-item-section>
  </q-item>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const props = defineProps({
  title: {
    type: String,
    required: true,
  },

  caption: {
    type: String,
    default: '',
  },

  link: {
    type: String,
    default: '#',
  },

  icon: {
    type: String,
    default: '',
  },
})

const isInternalLink = computed(() => {
  return props.link.startsWith('/')
})

const handleInternalClick = () => {
  router.push(props.link)
}

const getIconColor = () => {
  return 'grey-6'
}
</script>

<style scoped>
/* Sleek Design: Blue (#1976D2), White (#FFFFFF), Gray (#757575) */

.essential-link {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 12px;
  margin: 6px 12px;
  padding: 14px 16px;
  position: relative;
  overflow: hidden;
  border: 1px solid transparent;
}

.essential-link:hover {
  background: #e3f2fd;
  transform: translateX(4px);
  border-color: #e3f2fd;
}

.link-icon {
  position: relative;
  min-width: 40px;
}

.link-content {
  position: relative;
}

.link-title {
  font-weight: 600;
  color: #757575;
  font-size: 0.95rem;
  line-height: 1.4;
  transition: all 0.3s ease;
}

.link-caption {
  color: #9e9e9e;
  font-size: 0.75rem;
  line-height: 1.3;
  margin-top: 2px;
}

.link-arrow {
  position: relative;
  opacity: 0;
  transition: all 0.3s ease;
}

.essential-link:hover .link-arrow {
  opacity: 1;
  transform: translateX(4px);
}

.essential-link:hover .link-title {
  color: #1976D2;
}

.essential-link:hover .link-icon .q-icon {
  color: #1976D2 !important;
  transform: scale(1.1);
}

/* Focus states for accessibility */
.essential-link:focus {
  outline: 2px solid #1976D2;
  outline-offset: 2px;
}

/* Active state */
.essential-link.router-link-active {
  background: #1976D2;
  color: white;
  border-color: #1976D2;
  box-shadow: 0 4px 12px rgba(25, 118, 210, 0.3);
}

.essential-link.router-link-active .link-title {
  color: white;
}

.essential-link.router-link-active .link-caption {
  color: rgba(255, 255, 255, 0.85);
}

.essential-link.router-link-active .link-icon .q-icon {
  color: white !important;
}

.essential-link.router-link-active .link-arrow {
  opacity: 1;
}

.essential-link.router-link-active .link-arrow .q-icon {
  color: rgba(255, 255, 255, 0.85);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .essential-link {
    padding: 12px 14px;
    margin: 4px 10px;
  }

  .link-title {
    font-size: 0.875rem;
  }

  .link-caption {
    font-size: 0.7rem;
  }
}

/* Animation for icon */
.link-icon .q-icon {
  transition: all 0.3s ease;
}
</style>
