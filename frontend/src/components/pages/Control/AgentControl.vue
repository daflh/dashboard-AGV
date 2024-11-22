<script setup lang="ts">
import { ref, computed } from 'vue'
import { useMainStore } from '@/stores/main'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Button from 'primevue/button'
// import RecentLogs from './RecentLogs.vue'
import ControlPad from './ControlPad.vue'
import { roundNumber } from '@/utils/numberUtils'

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
  mainStore.socket?.emit('agentCmd:direction', agentData.value?.id, direction);
}

function onNavigate() {
  // // check if the position is valid (format: x,y)
  // if (targetPosition.value.match(/,/g)?.length !== 1) return;

  // const position: Position2D = targetPosition.value.split(',')
  //   .map((coord) => parseFloat(coord)) as Position2D;
  
  // TODO: add validation for the position
  const targetPosFormatted = targetPosition.value.replace(/ /g, ',');
  mainStore.socket?.emit('agentCmd:targetPosition', agentData.value?.id, targetPosFormatted);

  targetPosition.value = '';
}

function isValid(value: any) {
  return value !== null && value !== undefined;
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
        {{ isValid(agentData?.position?.[0]) ? roundNumber(agentData.position[0], 4) : '-' }},
        {{ isValid(agentData?.position?.[1]) ? roundNumber(agentData.position[1], 4) : '-' }}
      </span></div>
      <div>Heading: <span class="font-medium">
        {{ isValid(agentData?.heading) ? roundNumber(agentData.heading, 2) : '-' }} rad
      </span></div>
      <div>Linear vel: <span class="font-medium">
        {{ isValid(agentData?.linearVelo) ? roundNumber(agentData.linearVelo, 2) : '-' }} m/s
      </span></div>
      <div>Angular vel: <span class="font-medium">
        {{ isValid(agentData?.angularVelo) ? roundNumber(agentData.angularVelo, 2) : '-' }} rad/s
      </span></div>
    </div>
    <div class="mt-8">
      <h2 class="text-lg font-medium">Actions</h2>
      <div class="mt-3">
        <InputText
          v-model="targetPosition"
          placeholder="Enter coordinate"
          class="w-[15rem] !rounded-r-none !border-r-0"
          @keyup="(evt) => { if (evt.key === 'Enter') onNavigate(); }"
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
    <!-- <RecentLogs class="mt-8" />  -->
  </div>
</template>
