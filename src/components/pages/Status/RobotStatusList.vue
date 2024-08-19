<template>
  <div
    class="flex-col justify-center w-72 h-96 bg-white shadow-md mx-auto p-4 mt-32 rounded-lg"
  >
    <h1 class="font-semibold text-2xl text-blue text-center">amr3_blue</h1>
    <div class="text-center mt-4">
      <v-progress-circular
        :model-value="value"
        :rotate="360"
        :size="100"
        :width="9"
        class="v-progress-circular"
        :class="value <= 20 ? 'text-red' : 'text-blue'"
      >
        <template v-slot:default>
          <span class="font-semibold text-blue-500"> {{ value }}% </span>
        </template>
      </v-progress-circular>
    </div>

    <!-- Roll, Pitch, Yaw -->
    <div class="mt-6">
      <div class="flex justify-between w-full px-4">
        <h2 class="font-semibold text-blue">Roll</h2>
        <h2 class="font-semibold text-blue">Pitch</h2>
        <h2 class="font-semibold text-blue">Yaw</h2>
      </div>
      <div class="border-t-2 border-gray-300 mt-2 mb-1 w-full"></div>
      <div class="flex justify-between w-full px-4">
        <p class="font-semibold text-blue mt-1">45°</p>
        <p class="font-semibold text-blue mt-1">120°</p>
        <p class="font-semibold text-blue mt-1">90°</p>
      </div>
    </div>

    <!-- Signal, Status, Health -->
    <div class="flex justify-between mt-2 p-4">
      <div class="text-center">
        <v-icon class="text-blue-500">mdi-wifi</v-icon>
        <p class="font-semibold text-blue">Signal</p>
      </div>
      <div class="text-center">
        <v-icon class="text-blue-500">mdi-bolt</v-icon>
        <p class="font-semibold text-blue">Status</p>
      </div>
      <div class="text-center">
        <h2 class="font-bold text-2xl text-blue">13H</h2>
        <p class="font-semibold text-blue">Health</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";

const value = ref(70); // Set the initial value to 70 to match the image
let interval: ReturnType<typeof setInterval> | undefined;

onMounted(() => {
  interval = setInterval(() => {
    if (value.value === 0) {
      value.value = 100;
    } else {
      value.value -= 10;
    }
  }, 1000);
});

onBeforeUnmount(() => {
  if (interval) {
    clearInterval(interval);
  }
});
</script>

<style scoped>
.v-progress-circular {
  margin: 1rem;
}
</style>
