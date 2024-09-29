<script setup lang="ts">
import { computed } from 'vue';
import { Agent } from '@/types/agent';

const props = defineProps<{
  agent: Agent
}>();
defineEmits(['click'])

const isOffline = computed(() => !props.agent.status || props.agent.status === 'offline');

</script>

<template>
  <div
    class="px-2.5 py-2 flex justify-between items-center"
    :class="isOffline ? 'cursor-default text-gray-400' : 'cursor-pointer'"
    :title="`Control agent ${agent.name}`"
    @click="() => !isOffline && $emit('click', agent.name)"
  >
    <div>{{ agent.name }}</div>
    <div v-if="!isOffline" class="w-2.5">
      <svg viewBox="0 0 13 19" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M2 17.3846L10 9.39152L2 2.00003" stroke="black" stroke-width="4"/>
      </svg>
    </div>
  </div>
</template>
