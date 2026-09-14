<template>
  <q-page
    ><h1>PM account required</h1>
    <p>This iOS release is available to property managers.</p>
    <q-btn no-caps flat label="Use another account" @click="logout"
  /></q-page>
</template>
<script setup>
import { signOut } from 'firebase/auth'
import { useRouter } from 'vue-router'
import { auth } from 'src/boot/firebase'
const router = useRouter()
async function logout() {
  await signOut(auth)
  router.replace('/mobile/login')
}
</script>
