<script setup lang="ts">
defineProps({
  portStatus: {
    type: Object,
    required: true
  }
});

// Define the status object to map status to text and color (for example purposes)
const statusObject = {
  true: {
    text: 'Connected',
    color: 'text-green-500'
  },
  false: {
    text: 'Not Connected',
    color: 'text-red-500'
  }
};
</script>

<template>
  <div>
    <!-- Loop through the portStatus object -->
    <div v-for="(status, port) in portStatus" :key="port" class="flex items-center">
      <div class="mr-1.5 mt-2 text-sm" :class="statusObject[status].color">⬤</div>
      <div class="text-[.925rem] font-medium mt-2">{{ port }}: {{ statusObject[status].text }}</div>
    </div>
  </div>
</template>
