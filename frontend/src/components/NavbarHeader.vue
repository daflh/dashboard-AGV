<script setup lang="ts">
import { useRouter, RouterLink } from 'vue-router'
import { ref } from 'vue'
import Popover from 'primevue/popover'

const router = useRouter()
const op = ref<typeof Popover | null>(null)  // Pastikan ref bisa berupa null awalnya

const logout = () => {
  localStorage.removeItem('isLoggedIn')
  router.push('/login')
}

const togglePopover = (event: Event) => {
  op.value!.toggle(event)  // Non-null assertion untuk memastikan op.value tidak null
}
</script>

<template>
  <div class="flex items-center justify-between bg-slate-100 p-4 border-b shadow border-gray-200 fixed top-0 left-0 w-full z-50">
    <div class="text-xl text-primaryblue italic ml-4 cursor-default">
      <span class="font-medium">Logo</span>
      <span class="font-semibold">Produk</span>
    </div>
    <div class="flex gap-x-10">
      <RouterLink class="flex items-center text-primaryblue font-semibold h-6" to="/agents">
        <img src="@/assets/images/agents-icon.svg" alt="Engineer Icon" class="h-6 mr-2" />
        <div>Agents</div>
      </RouterLink>
      <RouterLink class="flex items-center text-primaryblue font-semibold h-6" to="/status">
        <img src="@/assets/images/status-icon.svg" alt="Engineer Icon" class="h-8 mr-2" />
        <div>Status</div>
      </RouterLink>
      <RouterLink class="flex items-center text-primaryblue font-semibold h-6" to="/control">
        <img src="@/assets/images/map-and-control-icon.svg" alt="Engineer Icon" class="h-6 mr-2" />
        <div>Map & Control</div>
      </RouterLink>
    </div>
    <div class="flex items-center justify-center relative cursor-pointer" @click="togglePopover">
      <img src="@/assets/images/profile_pict.png" alt="Profile Pict" class="ml-4 w-12" />
      <img
        src="@/assets/images/profile_setting.svg"
        alt="Profile Setting"
        class="mx-4 w-5"
      />
      
      <Popover ref="op" class="!mt-6">
        <div>
          <button @click="logout" class=" text-primaryred rounded">Logout</button>
        </div>
      </Popover>
    </div>
  </div>
  <div class="mb-20" />
</template>

<style scoped></style>
