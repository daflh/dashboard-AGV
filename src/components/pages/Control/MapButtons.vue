<script setup lang="ts">
import { reactive } from 'vue';

const buttons = reactive([
  {
    text: 'Follow',
    icon: '',
    action: () => console.log('Follow agent')
  },
  {
    text: 'Cloud',
    icon: '',
    action: () => console.log('Toggle point cloud')
  }
]);

</script>

<template>
  <div class="absolute top-4 left-4 z-40 select-none text-sm font-medium">
    <div class="flex flex-col gap-y-3">
      <div
        v-for="button in buttons"
        :key="button.text"
        class="bg-white rounded-md px-4 py-1.5 hover:bg-gray-200 shadow-md cursor-pointer"
        @click="button.action"
      >
        {{ button.text }}
      </div>
    </div>
  </div>
</template>
