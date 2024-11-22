<script setup lang="ts">
import { reactive } from 'vue';
import MapFollowIcon from '@/components/icon/MapFollowIcon.vue';
// import MapCloudIcon from '@/components/icon/MapCloudIcon.vue';
import MapIcon from '@/components/icon/MapIcon.vue';

const buttons = reactive([
  {
    text: 'Follow',
    icon: MapFollowIcon,
    action: () => console.log('Follow agent')
  },
  // {
  //   text: 'Cloud',
  //   icon: MapCloudIcon,
  //   action: () => console.log('Toggle point cloud')
  // },
  {
    text: 'Static',
    icon: MapIcon,
    action: () => console.log('Toggle static map')
  }
]);

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
</template>
