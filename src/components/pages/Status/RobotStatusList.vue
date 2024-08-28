<script setup lang="ts">
import { ref, computed } from 'vue'
import { useMainStore } from '@/stores/main'
import SelectButton from 'primevue/selectbutton'
import AgentSearchFilter from "@/components/AgentSearchFilter.vue";

const filterOptions = [
  { label: 'Active', value: 'active' },
  { label: 'Idle', value: 'idle' },
]

const mainStore = useMainStore()
const searchValue = ref('')
const selectedTag = ref(null)

const filteredAgents = computed(() => {
  return mainStore.agentsData.filter((agent) => {
    if (agent.status === 'offline') return false
    if (selectedTag.value === null) return true
    return selectedTag.value === agent.status
  })
})

</script>

<template>
  <div class="flex justify-between py-8 px-20">
    <div class="flex space-x-5">
      <AgentSearchFilter v-model="searchValue" />
      <SelectButton
        v-model="selectedTag"
        :options="filterOptions"
        option-label="label"
        option-value="value"
        pt:root="space-x-2 [&>button]:!border-0 [&>button]:!rounded-lg"
        aria-labelledby="basic"
      />
    </div>
    <div>
      <Button type="button" label="Add" icon="pi pi-plus" class="!bg-primaryblue" />
    </div>
  </div>
  <div class="flex justify-center mx-10 flex-wrap gap-8 mb-10">
    <div
      v-for="(agent, index) in filteredAgents"
      :key="index"
      class="flex-col justify-center w-72 h-96 bg-white shadow-md p-4 rounded-lg"
    >
      <h1 class="font-semibold text-2xl text-primaryblue text-center">{{ agent.name }}</h1>
      <div class="text-center mt-4">
        <v-progress-circular
          :model-value="agent.battery"
          :rotate="360"
          :size="100"
          :width="9"
          class="v-progress-circular"
          :class="agent.battery <= 20 ? 'text-primaryred' : 'text-primaryblue'"
        >
          <template v-slot:default>
            <span class="font-semibold text-primaryblue-500"> {{ agent.battery }}% </span>
          </template>
        </v-progress-circular>
      </div>

      <!-- Roll, Pitch, Yaw -->
      <div class="mt-6">
        <div class="flex justify-between w-full px-4">
          <h2 class="font-semibold text-primaryblue">Roll</h2>
          <h2 class="font-semibold text-primaryblue">Pitch</h2>
          <h2 class="font-semibold text-primaryblue">Yaw</h2>
        </div>
        <div class="border-t-2 border-gray-300 mt-2 mb-1 w-full"></div>
        <div class="flex justify-between w-full px-4">
          <p class="font-semibold text-primaryblue mt-1">{{ agent.imu.roll }}°</p>
          <p class="font-semibold text-primaryblue mt-1">{{ agent.imu.pitch }}°</p>
          <p class="font-semibold text-primaryblue mt-1">{{ agent.imu.yaw }}°</p>
        </div>
      </div>

      <!-- Signal, Status, Health -->
      <div class="flex justify-between mt-2 p-4">
        <div class="text-center">
          <img
            src="@/assets/images/signal-icon.svg"
            alt="Signal Icon"
            class="h-8 mx-auto"
          />
          <p class="font-semibold text-primaryblue">Signal</p>
        </div>
        <div class="text-center">
          <img
            src="@/assets/images/status-card-icon.svg"
            alt="Status-card Icon"
            class="h-8 mx-auto"
          />
          <p class="font-semibold text-primaryblue">Status</p>
        </div>
        <div class="text-center">
          <h2 class="font-bold text-2xl text-primaryblue">{{ agent.health }}H</h2>
          <p class="font-semibold text-primaryblue">Health</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.v-progress-circular {
  margin: 1rem;
}
</style>
