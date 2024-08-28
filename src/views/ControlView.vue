<script setup lang="ts">
import { ref, onMounted } from 'vue'
// import leafletMap from '@/services/leafletMap'
// import Divider from 'primevue/divider'
import UserLayout from '@/components/UserLayout.vue'
import AgentList from '@/components/pages/Control/AgentList.vue'
import AgentControl from '@/components/pages/Control/AgentControl.vue'

const selectedAgent = ref(null)

onMounted(() => {
  // leafletMap.initializeMap()
})

</script>

<template>
  <UserLayout>
    <div class="flex h-full">
      <!-- Left Side -->
      <div class="w-[65%] shrink-0 flex h-full">
        <img
          src="@/assets/images/map-temporary.png"
          class="w-full"
        />
        <!-- <div id="leaflet-map" class="w-full h-full outline-none" /> -->
      </div>
      <!-- <Divider layout="vertical" class="!ml-0" /> -->
      <!-- Right Side -->
      <div class="flex px-10 py-8 min-h-svh">
        <AgentList
          v-show="!selectedAgent"
          @agent-click="(a) => selectedAgent = a"
        />
        <AgentControl
          v-show="selectedAgent"
          :agent="selectedAgent"
          @exit="() => selectedAgent = null"
        />
      </div>
    </div>
  </UserLayout>
</template>
