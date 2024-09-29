<script setup lang="ts">
import { useMainStore } from '@/stores/main'
import AgentListItem from './AgentListItem.vue';

defineEmits(['agent-click'])

const mainStore = useMainStore()

</script>

<template>
  <div class="w-full">
    <div class="mb-3">
      <h2 class="text-lg font-medium">Select agent to control</h2>
    </div>
    <div class="flex flex-col divide-y-2">
      <AgentListItem
        v-for="agent in mainStore.agents"
        :key="agent.id"
        :agent="agent"
        @click="() => $emit('agent-click', agent.name)"
      />
    </div>
  </div>
</template>
