<script setup lang="ts">
import { computed } from 'vue';
import { useMainStore } from '@/stores/main';

const mainStore = useMainStore();

const contextMenuParam = computed(() => mainStore.controlMapContextMenu);

function navigate() {
  console.log('Navigate here');
  mainStore.controlMapContextMenu.isVisible = false;
}

function copyCoord() {
  const [x, y] = contextMenuParam.value.coordinate;
  navigator.clipboard.writeText(`${x.toFixed(3)}, ${y.toFixed(3)}`);
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
      <div class="px-4 py-1.5 hover:bg-gray-200 cursor-pointer" @click="navigate">Navigate here</div>
      <div class="px-4 py-1.5 hover:bg-gray-200 cursor-pointer" @click="copyCoord">Copy coordinate</div>
    </div>
  </div>
</template>
