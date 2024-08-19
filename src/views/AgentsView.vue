<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

function logout() {
  localStorage.removeItem('isLoggedIn')
  router.push('/login')
}

</script>

<template>
  <div class="flex m-4">
    <button class="text-blue" @click="logout">Logout</button>
  </div>
</template>
