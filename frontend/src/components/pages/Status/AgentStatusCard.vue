<script setup lang="ts">
import SignalIcon from '@/components/icon/SignalIcon.vue'

defineProps({
  agent: {
    type: Object,
    required: true,
  },
});
</script>

<template>
  <div class="flex-col justify-center w-72 h-96 bg-white shadow-md p-4 rounded-lg">
    <h1 class="font-semibold text-2xl text-primaryblue text-center">
      {{ agent.name }}
    </h1>

    <!-- Battery Progress -->
    <div class="text-center mt-4">
      <v-progress-circular
        :model-value="agent.battery"
        :rotate="360"
        :size="100"
        :width="9"
        class="v-progress-circular"
        :class="agent.battery <= 20 ? 'text-primaryred' : 'text-primaryblue'"
        :style="{ strokeLinecap: 'round' }"
      >
        <template v-slot:default>
          <span class="font-semibold text-primaryblue-500">{{ agent.battery }}%</span>
        </template>
      </v-progress-circular>
      <!-- Linear & Angular Velocity -->
      <div class="mt-6">
        <div class="flex justify-between w-full px-4 text-sm">
          <h2 class="font-semibold text-primaryblue">Linear Vel.</h2>
          <h2 class="font-semibold text-primaryblue">Angular Vel.</h2>
        </div>
        <div class="border-t-2 border-gray-300 mt-2 mb-1 w-full"></div>
        <div class="flex justify-between w-full px-4">
          <p class="font-semibold text-primaryblue mt-1">
            {{ agent.linearVelocity.x.toFixed(2) + " m/s" }}
          </p>
          <p class="font-semibold text-primaryblue mt-1">
            {{ agent.angularVelocity.z.toFixed(2) + " rad/s" }}
          </p>
        </div>
      </div>
      <!-- Roll, Pitch, Yaw
      <div class="mt-6">
        <div class="flex justify-between w-full px-4">
          <h2 class="font-semibold text-primaryblue">Roll</h2>
          <h2 class="font-semibold text-primaryblue">Pitch</h2>
          <h2 class="font-semibold text-primaryblue">Yaw</h2>
        </div>
        <div class="border-t-2 border-gray-300 mt-2 mb-1 w-full"></div>
        <div class="flex justify-between w-full px-4">
          <p class="font-semibold text-primaryblue mt-1">{{ agent.imu.orientation.x }}°</p>
          <p class="font-semibold text-primaryblue mt-1">{{ agent.imu.orientation.y }}°</p>
          <p class="font-semibold text-primaryblue mt-1">{{ agent.imu.orientation.z }}°</p>
        </div>
      </div> -->
      <!-- Signal, Status, Health -->
      <div class="flex gap-x-8 mt-2 p-2 justify-center ml-6">
        <div class="text-center">
          <!-- <img
            src="@/assets/images/signal-icon.svg"
            alt="Signal Icon"
            class="h-8 mx-auto"
          /> -->
          <SignalIcon alt="Signal Icon" class="h-8"/>
          <p class="font-semibold text-primaryblue">Signal</p>
        </div>
        <!-- <div class="text-center">
          <h2 class="font-bold text-2xl text-primaryblue">{{ agent.velocity }}<span class="text-base">m/s</span></h2>
          <p class="font-semibold text-primaryblue">Velocity</p>
        </div> -->
        <div class="text-center">
          <h2 class="font-bold text-2xl text-primaryblue">{{ agent.health }}H</h2>
          <p class="font-semibold text-primaryblue mb-4">Maintenance Cycle</p>
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
