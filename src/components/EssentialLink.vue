<template>
  <q-item
    clickable
    :tag="isInternalLink ? 'div' : 'a'"
    :target="isInternalLink ? undefined : '_blank'"
    :href="isInternalLink ? undefined : link"
    @click="isInternalLink ? handleInternalClick() : undefined"
    class="essential-link"
    :class="{ 'is-active': isActive }"
  >
    <q-item-section v-if="icon" avatar class="link-icon">
      <q-icon :name="icon" class="link-icon-svg" />
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
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()

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

const isActive = computed(() => {
  if (!isInternalLink.value) return false
  const currentPath = route.path || ''
  if (props.link === '/') return currentPath === '/'
  return currentPath === props.link || currentPath.startsWith(`${props.link}/`)
})

const handleInternalClick = () => {
  router.push(props.link)
}

// Icon color is handled by CSS for better dark mode support
</script>

<style scoped>
/* Light Sidebar Navigation Link Styles */
/* Primary Blue: #1976d2 */
/* White BG: #FFFFFF */
/* Text: Black/Gray */

.essential-link {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: var(--border-radius-drawer);
  margin: 4px 0;
  padding: 12px 16px;
  position: relative;
  overflow: hidden;
  border: 1px solid transparent;
}

.essential-link:hover {
  background: #f3f4f6;
}

.link-icon {
  position: relative;
  min-width: 40px;
}

.link-content {
  position: relative;
}

.link-title {
  font-weight: 500;
  color: var(--neutral-800);
  font-size: 0.9rem;
  line-height: 1.4;
  transition: all 0.3s ease;
}

.link-caption {
  color: var(--neutral-600);
  font-size: 0.7rem;
  line-height: 1.3;
  margin-top: 2px;
  display: none;
}

.link-arrow {
  position: relative;
  opacity: 0;
  transition: all 0.3s ease;
}

.essential-link:hover .link-arrow {
  opacity: 0.7;
}

.essential-link:hover .link-title {
  color: var(--primary-color);
}

.essential-link:hover .link-icon .q-icon {
  color: var(--primary-color) !important;
}

/* Focus states for accessibility */
.essential-link:focus {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
}

/* Active state */
.essential-link.is-active,
.essential-link.router-link-active {
  background: linear-gradient(90deg, rgba(20, 184, 166, 0.18) 0%, rgba(20, 184, 166, 0.08) 100%);
  color: var(--neutral-900);
  border-color: var(--accent-color);
  box-shadow: 0 4px 14px rgba(20, 184, 166, 0.16);
}

.essential-link.is-active .link-title,
.essential-link.router-link-active .link-title {
  color: var(--primary-dark);
  font-weight: 700;
}

.essential-link.is-active .link-caption,
.essential-link.router-link-active .link-caption {
  color: var(--secondary-color);
}

.essential-link.is-active .link-icon .q-icon,
.essential-link.router-link-active .link-icon .q-icon {
  color: var(--accent-dark) !important;
}

.essential-link.is-active .link-arrow,
.essential-link.router-link-active .link-arrow {
  opacity: 1;
}

.essential-link.is-active .link-arrow .q-icon,
.essential-link.router-link-active .link-arrow .q-icon {
  color: var(--accent-dark);
}

.essential-link.is-active::before,
.essential-link.router-link-active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 10%;
  height: 80%;
  width: 4px;
  border-radius: 0 6px 6px 0;
  background: #ffffff;
  background: var(--accent-color);
}

/* Responsive adjustments */
@media (max-width: 1023px) {
  .essential-link {
    padding: 14px 16px;
  }

  .link-title {
    font-size: 0.95rem;
  }
}

/* Animation for icon */
.link-icon .q-icon,
.link-icon-svg {
  transition: all 0.3s ease;
  color: var(--neutral-600);
}

.essential-link:hover .link-icon .q-icon,
.essential-link:hover .link-icon-svg {
  color: var(--primary-color) !important;
}

.essential-link.router-link-active .link-icon .q-icon,
.essential-link.router-link-active .link-icon-svg {
  color: white !important;
}

.essential-link:hover .link-icon .q-icon {
  transform: scale(1.05);
}

/* Dark Mode Styles - Fixed visibility */
:global(body.body--dark) .essential-link {
  background: transparent;
}

:global(body.body--dark) .essential-link:hover {
  background: var(--bg-tertiary);
}

:global(body.body--dark) .link-title {
  color: var(--neutral-600) !important; /* Fixed: Now visible in dark mode */
  font-weight: 500;
}

:global(body.body--dark) .link-caption {
  color: var(--neutral-500) !important;
}

:global(body.body--dark) .link-icon .q-icon {
  color: var(--neutral-500) !important; /* Fixed: Now visible in dark mode */
}

:global(body.body--dark) .essential-link:hover .link-title {
  color: var(--primary-color) !important; /* Fixed: Bright color on hover */
}

:global(body.body--dark) .essential-link:hover .link-icon .q-icon {
  color: var(--primary-color) !important;
}

:global(body.body--dark) .link-arrow .q-icon {
  color: var(--neutral-500) !important; /* Fixed: Now visible */
}

:global(body.body--dark) .essential-link.is-active,
:global(body.body--dark) .essential-link.router-link-active {
  background: linear-gradient(90deg, rgba(45, 212, 191, 0.24) 0%, rgba(45, 212, 191, 0.12) 100%);
  border-color: var(--accent-color);
  box-shadow: 0 4px 16px rgba(45, 212, 191, 0.2);
}

:global(body.body--dark) .essential-link.is-active .link-title,
:global(body.body--dark) .essential-link.router-link-active .link-title {
  color: #ecfeff !important;
}

:global(body.body--dark) .essential-link.is-active .link-icon .q-icon,
:global(body.body--dark) .essential-link.router-link-active .link-icon .q-icon {
  color: #99f6e4 !important;
}

:global(body.body--dark) .essential-link.is-active .link-arrow .q-icon,
:global(body.body--dark) .essential-link.router-link-active .link-arrow .q-icon {
  color: #99f6e4 !important;
}
</style>
