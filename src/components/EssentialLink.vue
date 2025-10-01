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
      <q-icon name="chevron_right" color="grey-5" size="16px" />
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
  const colors = ['primary', 'accent', 'success', 'finance']
  const index = props.title.length % colors.length
  return colors[index]
}
</script>

<style scoped>
.essential-link {
  transition: var(--transition);
  border-radius: var(--border-radius-sm);
  margin: 4px 8px;
  padding: 12px 16px;
  position: relative;
  overflow: hidden;
  border: 1px solid transparent;
}

.essential-link::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--accent-color) 100%);
  opacity: 0;
  transition: var(--transition);
  z-index: 0;
}

.essential-link:hover::before {
  opacity: 0.05;
}

.essential-link:hover {
  background: var(--primary-glow);
  transform: translateX(4px);
  box-shadow: var(--shadow-sm);
  border-color: var(--primary-color);
}

.link-icon {
  z-index: 1;
  position: relative;
}

.link-content {
  z-index: 1;
  position: relative;
}

.link-title {
  font-weight: 600;
  color: var(--neutral-800);
  font-size: 0.875rem;
  line-height: 1.4;
}

.link-caption {
  color: var(--neutral-600);
  font-size: 0.75rem;
  line-height: 1.3;
  margin-top: 2px;
}

.link-arrow {
  z-index: 1;
  position: relative;
  opacity: 0;
  transition: var(--transition);
}

.essential-link:hover .link-arrow {
  opacity: 1;
  transform: translateX(4px);
}

/* Focus states for accessibility */
.essential-link:focus {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
}

/* Active state */
.essential-link.router-link-active {
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
  color: white;
  border-color: var(--primary-color);
  box-shadow: var(--shadow-md);
}

.essential-link.router-link-active .link-title {
  color: white;
}

.essential-link.router-link-active .link-caption {
  color: rgba(255, 255, 255, 0.8);
}

.essential-link.router-link-active .link-icon .q-icon {
  color: white;
}

.essential-link.router-link-active .link-arrow .q-icon {
  color: rgba(255, 255, 255, 0.8);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .essential-link {
    padding: 10px 12px;
    margin: 2px 4px;
  }

  .link-title {
    font-size: 0.8125rem;
  }

  .link-caption {
    font-size: 0.6875rem;
  }
}

/* Animation for icon */
.link-icon .q-icon {
  transition: var(--transition);
}

.essential-link:hover .link-icon .q-icon {
  transform: scale(1.1);
}

/* Loading state */
.essential-link.loading {
  opacity: 0.6;
  pointer-events: none;
}

.essential-link.loading .link-icon .q-icon {
  animation: pulse 2s infinite;
}

/* Hover effects for different link types */
.essential-link:nth-child(1):hover {
  border-color: var(--primary-color);
}

.essential-link:nth-child(2):hover {
  border-color: var(--accent-color);
}

.essential-link:nth-child(3):hover {
  border-color: var(--success-color);
}

.essential-link:nth-child(4):hover {
  border-color: var(--finance-dark);
}

.essential-link:nth-child(5):hover {
  border-color: var(--primary-color);
}

.essential-link:nth-child(6):hover {
  border-color: var(--accent-color);
}
</style>
