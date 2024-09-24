<script setup lang="ts">
import { computed } from 'vue'
import { useMainStore } from '@/stores/main'

defineEmits(['agent-click'])

const mainStore = useMainStore()

// agents that are not offline
const availableAgents = computed(() => {
  return mainStore.agents.filter((agent) => {
    return agent.status !== "offline";
  });
});

</script>

<template>
  <div class="w-full">
    <div class="mb-3">
      <h2 class="text-lg font-medium">Select agent to control</h2>
    </div>
    <div class="flex flex-col divide-y-2">
      <div
        v-for="agent in availableAgents"
        :key="agent.name"
        class="px-2.5 py-2 flex justify-between items-center cursor-pointer"
        :title="`Control agent ${agent.name}`"
        @click="() => $emit('agent-click', agent.name)"
      >
        <div>{{ agent.name }}</div>
        <div class="w-2.5">
          <svg viewBox="0 0 13 19" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 17.3846L10 9.39152L2 2.00003" stroke="black" stroke-width="4"/>
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>
