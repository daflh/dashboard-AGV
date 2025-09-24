<script setup lang="ts">
import { ref } from 'vue'
import Button from 'primevue/button'

interface Log {
  timestamp: number
  message: string
  severity: 'info' | 'warning' | 'error'
}

const recentLogs = ref<Log[]>([ // still hard-coded
  {
    timestamp: new Date('2024-08-28 13:05:12').getTime(),
    message: 'Obstacle: Block on the way',
    severity: 'info'
  },
  {
    timestamp: new Date('2024-08-28 13:04:12').getTime(),
    message: 'Obstacle: Block on the way',
    severity: 'info'
  },
  {
    timestamp: new Date('2024-08-28 12:58:38').getTime(),
    message: 'Battery low: 10%',
    severity: 'warning'
  },
  {
    timestamp: new Date('2024-08-28 12:54:12').getTime(),
    message: 'Obstacle: Block on the way',
    severity: 'info'
  },
  {
    timestamp: new Date('2024-08-28 12:42:58').getTime(),
    message: 'Battery low: 20%',
    severity: 'warning'
  },
  {
    timestamp: new Date('2024-08-28 08:02:45').getTime(),
    message: 'LED malfunctioned',
    severity: 'error'
  },
])

const severityColors = {
  info: 'text-blue-500',
  warning: 'text-yellow-500',
  error: 'text-red-500'
}

function formatTime(timestamp: number): string {
  const pad = (n: number) => n.toString().padStart(2, '0')
  const date = new Date(timestamp)
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

</script>

<template>
  <div>
    <div class="flex justify-between items-center">
      <h2 class="text-lg font-medium">Recent Logs</h2>
      <Button type="button" size="small" icon="pi pi-filter" severity="secondary" label="Filter" />
    </div>
    <div class="mt-3 space-y-2.5">
      <div v-for="log in recentLogs" :key="log.timestamp" class="flex">
        <div class="mr-4" :class="severityColors[log.severity]">⬤</div>
        <div class="w-[5.25rem] shrink-0 text-slate-600">{{ formatTime(log.timestamp) }}</div>
        <div>{{ log.message }}</div>
      </div>
    </div>
  </div>
</template>
