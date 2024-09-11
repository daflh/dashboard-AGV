<script setup lang="ts">
import { ref, onMounted, onBeforeMount, onBeforeUnmount } from 'vue'
import { useMainStore } from '@/stores/main';
import leafletMap from '@/services/leafletMap'
import UserLayout from '@/components/UserLayout.vue'
import AgentList from '@/components/pages/Control/AgentList.vue'
import AgentControl from '@/components/pages/Control/AgentControl.vue'
import MapButtons from '@/components/pages/Control/MapButtons.vue'
import MapContextMenu from '@/components/pages/Control/MapContextMenu.vue'

const mainStore = useMainStore();

const selectedAgent = ref(null)

// add these classes to the root element when the component is mounted
onBeforeMount(() => {
  window.document.getElementById('app').classList.add('app-screen')
})
// remove the classes when the component is unmounted
onBeforeUnmount(() => {
  window.document.getElementById('app').classList.remove('app-screen')
})

onMounted(() => {
  leafletMap.initializeMap()

  // add context menu listener
  leafletMap.map.on('contextmenu', (data) => {
    mainStore.controlMapContextMenu = {
      isVisible: true,
      anchorPosition: [data.containerPoint.x, data.containerPoint.y],
      coordinate: [data.latlng.lng * 1000, data.latlng.lat * 1000]
    }
  });
  leafletMap.map.on('click', () => {
    mainStore.controlMapContextMenu.isVisible = false;
  });
})

</script>

<template>
  <UserLayout>
    <div class="flex h-full">
      <!-- Left Side -->
      <div class="w-[65%] shrink-0 relative">
        <div id="leaflet-map" class="w-full h-full outline-none z-30" />
        <MapButtons />
        <MapContextMenu />
      </div>
      <!-- Right Side -->
      <div class="flex px-10 py-8">
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

<style>
.app-screen {
  @apply h-screen flex flex-col;
}
</style>
