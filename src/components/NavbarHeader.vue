<script setup lang="ts">
import { useRouter, RouterLink } from 'vue-router'

const router = useRouter()

function logout() {
  localStorage.removeItem('isLoggedIn')
  router.push('/login')
}

</script>

<template>
  <div class="flex items-center justify-between bg-slate-100 p-4 border-b shadow border-gray-200">
    <div class="text-xl text-primaryblue italic ml-4 cursor-default">
      <span class="font-medium">Logo</span>
      <span class="font-semibold">Produk</span>
    </div>
    <div class="flex gap-x-10 ">
      <RouterLink class="flex items-center text-primaryblue font-semibold h-6" to="/agents">
        <img
          src="@/assets/images/agents-icon.svg"
          alt="Engineer Icon"
          class="h-6 mr-2"
        />
        <div>Agents</div>
      </RouterLink>
      <RouterLink class="flex items-center text-primaryblue font-semibold h-6" to="/status">
        <img
          src="@/assets/images/status-icon.svg"
          alt="Engineer Icon"
          class="h-8 mr-2"
        />
        <div>Status</div>
      </RouterLink>
      <RouterLink class="flex items-center text-primaryblue font-semibold h-6" to="/control">
        <img
          src="@/assets/images/map-and-control-icon.svg"
          alt="Engineer Icon"
          class="h-6 mr-2"
        />
        <div>Control and Map</div>
      </RouterLink>
    </div>
    <div class="flex items-center justify-center">
      <div class="cursor-pointer" @click="logout">Logout</div>
      <img src="@/assets/images/profile_pict.png" alt="Notifications" class="ml-4 w-12" />
      <img
        src="@/assets/images/profile_setting.svg"
        alt="Notifications"
        class="mx-4 w-5"
      />
    </div>
  </div>
</template>

<style scoped></style>
