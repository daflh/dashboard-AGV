<script setup lang="ts">
import { ref, computed } from 'vue'
import { useMainStore } from '@/stores/main'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Button from 'primevue/button'
import RecentLogs from './RecentLogs.vue'
import ControlPad from './ControlPad.vue'

type PositionCoordinate = [x: number, y: number];

const props = defineProps<{
  agent: string | null
}>();
defineEmits(['exit']);

const mainStore = useMainStore();

const movingSpeed = ref(2.5);
const targetPosition = ref('');
const agentData = computed(() => {
  return mainStore.agents.find((agent) => agent.name === props.agent) || null;
});

function onControlDirection(direction: string) {
  // passing to backend
  mainStore.socket?.emit('agentCmd:direction', props.agent, direction);
}

function onNavigate() {
  // check if the position is valid (format: x,y)
  if (targetPosition.value.match(/,/g)?.length !== 1) return;

  const position: PositionCoordinate = targetPosition.value.split(',')
    .map((coord) => parseFloat(coord));
  mainStore.socket?.emit('agentCmd:targetPosition', props.agent, position);

  targetPosition.value = '';
}

</script>

<template>
  <div class="">
    <div class="flex items-center mb-2.5 cursor-pointer" @click="() => $emit('exit')">
      <div class="w-2 mr-2">
        <svg viewBox="0 0 13 19" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M11 17.3846L3 9.39149L11 2" stroke="black" stroke-width="4"/>
        </svg>
      </div>
      <div>Back</div>
    </div>
    <h2 class="text-lg mb-4 font-medium">Controlling <span class="font-semibold">{{ agent }}</span></h2>
    <div class="flex">
      <ControlPad class="mr-4" @direction="onControlDirection" />
      <div class="mt-2">
        <div class="mb-5">Moving speed: <span class="font-medium">{{ movingSpeed.toFixed(1) }}</span></div>
        <InputNumber v-model="movingSpeed" :min="0" :max="5" :step="0.1" showButtons inputClass="w-24" />
      </div>
    </div>
    <div class="mt-4 space-y-0.5">
      <div>Position: <span class="font-medium">
        {{ agentData?.odom.position.x ?? '-' }}, {{ agentData?.odom.position.y ?? '-' }}
      </span></div>
      <div>Orientation: <span class="font-medium">{{ agentData?.odom.orientation.z ?? '-' }} rad</span></div>
      <div>Linear vel: <span class="font-medium">{{ agentData?.linearVelocity.x ?? '-' }} m/s</span></div>
      <div>Angular vel: <span class="font-medium">{{ agentData?.angularVelocity.z ?? '-' }} rad/s</span></div>
    </div>
    <div class="mt-8">
      <h2 class="text-lg font-medium">Actions</h2>
      <div class="mt-3">
        <InputText
          v-model="targetPosition"
          placeholder="Enter coordinate"
          class="w-[15rem] !rounded-r-none !border-r-0"
        />
        <Button
          type="button"
          label="Navigate"
          class="!bg-primaryblue !rounded-l-none !border-l-0"
          @click="() => onNavigate()"
        />
      </div>
      <div class="mt-3">
        <Button type="button" label="Map Entire Room" class="!bg-primaryblue" />
      </div>
    </div>
    <RecentLogs class="mt-8" /> 
  </div>
</template>
