<template>
  <q-page padding>
    <CreateProperty @cancel="router.back()" />
  </q-page>
</template>

<script setup>
import { useRouter } from 'vue-router'
import CreateProperty from '../components/CreateProperty.vue'

const router = useRouter()
</script>
