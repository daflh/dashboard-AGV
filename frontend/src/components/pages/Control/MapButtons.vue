<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useMainStore } from '@/stores/main';
import MapFollowIcon from '@/components/icon/MapFollowIcon.vue';
import MapIcon from '@/components/icon/MapIcon.vue';
import Button from "primevue/button";


const mainStore = useMainStore();
const showDialog = ref(false); // Control dialog visibility
const selectedMap = ref('');   // Holds the selected map
const availableMaps = ['basement', 'basement-lama', 'turtlebot']; // Static map options

const buttons = reactive([
  {
    text: 'Follow',
    icon: MapFollowIcon,
    action: () => console.log('Follow agent'),
  },
  {
    text: 'Static',
    icon: MapIcon,
    action: () => showDialog.value = true, // Show dialog
  },
]);

const sendMapRequest = () => {
  if (selectedMap.value) {
    mainStore.socket?.emit('staticMap:request', { mapName: selectedMap.value });
    showDialog.value = false; // Close dialog after sending
  }
};
</script>

<template>
  <div class="absolute top-5 left-5 z-40 select-none text-sm font-medium">
    <div class="flex flex-col gap-y-3">
      <div
        v-for="button in buttons"
        :key="button.text"
        class="bg-white rounded-md px-3 py-2 hover:bg-gray-200 shadow-md cursor-pointer"
        @click="button.action"
      >
        <component :is="button.icon" class="mb-1" />
        <div class="text-center">{{ button.text }}</div>
      </div>
    </div>
  </div>

  <!-- Dialog -->
  <div v-if="showDialog" class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white p-5 w-96 rounded-md shadow-md">
      <h3 class="text-lg font-semibold mb-3">Choose Static Map</h3>
      <select v-model="selectedMap" class="border p-2 w-full rounded-md mb-3">
        <option disabled value="">Choose Map</option>
        <option v-for="map in availableMaps" :key="map" :value="map">{{ map }}</option>
      </select>
      <div class="flex justify-end gap-2">
        <Button @click="showDialog = false" class="px-3 py-1 !bg-red-600 !border-none rounded-md">Cancel</Button>
        <Button @click="sendMapRequest" class="px-3 py-1 !bg-primaryblue !border-none text-white rounded-md">Select</Button>
      </div>
    </div>
  </div>
</template>
