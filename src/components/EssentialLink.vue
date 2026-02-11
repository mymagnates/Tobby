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

// Icon color is handled by CSS for better dark mode support
</script>

<style scoped>
/* Light Sidebar Navigation Link Styles */
/* Primary Blue: #1976d2 */
/* White BG: #FFFFFF */
/* Text: Black/Gray */

.essential-link {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 10px;
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
.essential-link.router-link-active {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
  box-shadow: 0 4px 16px var(--primary-glow);
}

.essential-link.router-link-active .link-title {
  color: white;
  font-weight: 600;
}

.essential-link.router-link-active .link-caption {
  color: rgba(255, 255, 255, 0.9);
}

.essential-link.router-link-active .link-icon .q-icon {
  color: white !important;
}

.essential-link.router-link-active .link-arrow {
  opacity: 1;
}

.essential-link.router-link-active .link-arrow .q-icon {
  color: white;
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

:global(body.body--dark) .essential-link.router-link-active {
  background: var(--primary-color);
  border-color: var(--primary-color);
  box-shadow: 0 4px 16px var(--primary-glow);
}

:global(body.body--dark) .essential-link.router-link-active .link-title {
  color: white !important; /* Fixed: White text on active */
}

:global(body.body--dark) .essential-link.router-link-active .link-icon .q-icon {
  color: white !important;
}

:global(body.body--dark) .essential-link.router-link-active .link-arrow .q-icon {
  color: white !important;
}
</style>
