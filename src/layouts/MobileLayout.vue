<template>
  <q-layout view="hHh lpR fFf" class="mobile-shell">
    <q-page-container>
      <router-view />
    </q-page-container>
    <MobileBottomTabs />
  </q-layout>
</template>

<script setup>
import MobileBottomTabs from 'components/mobile/MobileBottomTabs.vue'
</script>
