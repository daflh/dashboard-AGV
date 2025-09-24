<script setup lang="ts">
import { computed } from 'vue';
import { useMainStore } from '@/stores/main';

const props = defineProps<{
  agent: string | null
}>();

const mainStore = useMainStore();

const contextMenuParam = computed(() => mainStore.controlMapContextMenu);
const agentData = computed(() => {
  return mainStore.agents.find((agent) => agent.name === props.agent) || null;
});

function navigate() {
  const [x, y] = contextMenuParam.value.coordinate;
  mainStore.socket?.emit(
    'agentCmd:targetPosition',
    agentData.value?.id,
    `${x.toFixed(3)},${y.toFixed(3)}`
  );
  mainStore.controlMapContextMenu.isVisible = false;
}

function copyCoord() {
  const [x, y] = contextMenuParam.value.coordinate;
  navigator.clipboard.writeText(`${x.toFixed(5)}, ${y.toFixed(5)}`);
  mainStore.controlMapContextMenu.isVisible = false;
}

</script>

<template>
  <div
    v-show="contextMenuParam.isVisible"
    class="absolute w-48 py-1.5 z-50 shadow-md select-none bg-white rounded-md rounded-tl-none text-sm"
    :style="{
      top: contextMenuParam.anchorPosition[1] + 'px',
      left: contextMenuParam.anchorPosition[0] + 'px'
    }"
  >
    <div class="flex flex-col">
      <div class="px-4 py-1.5 font-medium">
        {{ contextMenuParam.coordinate[0].toFixed(5) }}, {{ contextMenuParam.coordinate[1].toFixed(5) }}
      </div>
      <div class="px-4 py-1.5 hover:bg-gray-200 cursor-pointer" @click="navigate">Navigate here</div>
      <div class="px-4 py-1.5 hover:bg-gray-200 cursor-pointer" @click="copyCoord">Copy coordinate</div>
    </div>
  </div>
</template>
