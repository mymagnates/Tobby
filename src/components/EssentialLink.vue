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
  return 'grey-8'
}
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
  color: #1f2937;
  font-size: 0.9rem;
  line-height: 1.4;
  transition: all 0.3s ease;
}

.link-caption {
  color: #6b7280;
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
  color: #1976d2;
}

.essential-link:hover .link-icon .q-icon {
  color: #1976d2 !important;
}

/* Focus states for accessibility */
.essential-link:focus {
  outline: 2px solid #1976d2;
  outline-offset: 2px;
}

/* Active state */
.essential-link.router-link-active {
  background: #1976d2;
  color: white;
  border-color: #1976d2;
  box-shadow: 0 4px 16px rgba(25, 118, 210, 0.4);
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
.link-icon .q-icon {
  transition: all 0.3s ease;
  color: #4b5563;
}

.essential-link:hover .link-icon .q-icon {
  transform: scale(1.05);
}

/* Dark Mode Styles */
:global(body.body--dark) .essential-link {
  background: transparent;
}

:global(body.body--dark) .essential-link:hover {
  background: #2d2d2d;
}

:global(body.body--dark) .link-title {
  color: white;
}

:global(body.body--dark) .link-caption {
  color: #b0b0b0;
}

:global(body.body--dark) .link-icon .q-icon {
  color: #b0b0b0 !important;
}

:global(body.body--dark) .essential-link:hover .link-title {
  color: #42a5f5;
}

:global(body.body--dark) .essential-link:hover .link-icon .q-icon {
  color: #42a5f5 !important;
}

:global(body.body--dark) .link-arrow .q-icon {
  color: #b0b0b0 !important;
}

:global(body.body--dark) .essential-link.router-link-active {
  background: #42a5f5;
  border-color: #42a5f5;
  box-shadow: 0 4px 16px rgba(66, 165, 245, 0.4);
}

:global(body.body--dark) .essential-link.router-link-active .link-title {
  color: white;
}

:global(body.body--dark) .essential-link.router-link-active .link-icon .q-icon {
  color: white !important;
}

:global(body.body--dark) .essential-link.router-link-active .link-arrow .q-icon {
  color: white !important;
}
</style>
