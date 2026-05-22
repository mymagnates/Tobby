<template>
  <q-page class="mobile-page">
    <div class="mobile-page-stack">
      <MobilePageHeader eyebrow="PM" title="Account" description="Profile and mobile preferences." />

      <MobileCard title="PM Profile" subtitle="Name, email, organization, and role context.">
        <div class="mobile-list">
          <div v-for="item in settings" :key="item.title" class="mobile-list-row">
            <div class="mobile-list-row__icon"><q-icon :name="item.icon" size="21px" /></div>
            <div class="mobile-list-row__body">
              <div class="mobile-list-row__title">{{ item.title }}</div>
              <div class="mobile-list-row__meta">{{ item.meta }}</div>
            </div>
          </div>
        </div>
      </MobileCard>
    </div>
  </q-page>
</template>

<script setup>
import MobileCard from 'components/mobile/MobileCard.vue'
import MobilePageHeader from 'components/mobile/MobilePageHeader.vue'

const settings = [
  { icon: 'person', title: 'Profile', meta: 'Name, email, organization' },
  { icon: 'notifications', title: 'Notifications', meta: 'Mobile alerts and reminders' },
  { icon: 'logout', title: 'Sign out', meta: 'End this session' },
]
</script>
