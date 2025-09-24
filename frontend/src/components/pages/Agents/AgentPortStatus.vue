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

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

</script>

<template>
  <div class="mb-3">
    <!-- Loop through the portStatus object -->
    <div v-for="(status, portName) in portStatus" :key="portName" class="flex items-center space-y-1">
      <div class="font-medium w-28">{{ capitalize(portName) }}</div>
      <div class="ml-4">
        <span class="mr-1" :class="statusObject[status].color">⬤</span>
        {{ statusObject[status].text }}
      </div>
    </div>
  </div>
</template>
