<script setup lang="ts">
defineProps({
  status: {
    type: String,
    required: true
  }
})

const statusObject = {
  offline: {
    text: 'Offline',
    color: 'text-red-500'
  },
  idle: {
    text: 'Idle',
    color: 'text-yellow-500'
  },
  active: {
    text: 'Active',
    color: 'text-green-500'
  }
}

</script>

<template>
  <div class="flex items-center">
    <div class="mr-1.5 text-sm" :class="statusObject[status].color">⬤</div>
    <div class="text-[.925rem] font-medium">{{ statusObject[status].text }}</div>
  </div>
</template>
