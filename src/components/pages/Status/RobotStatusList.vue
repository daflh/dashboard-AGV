<template>
  <div class="flex justify-between py-8 px-20">
    <SearchFilter />
    <div>
      <Button type="button" label="Add" icon="pi pi-plus" class="!bg-primaryblue" />
    </div>
  </div>
  <div class="flex justify-center mx-10 flex-wrap gap-x-4">
    <div
      v-for="(robot, index) in robots"
      :key="index"
      class="flex-col justify-center w-72 h-96 bg-white shadow-md mx-auto p-4 mt-8 rounded-lg"
    >
      <h1 class="font-semibold text-2xl text-primaryblue text-center">{{ robot.name }}</h1>
      <div class="text-center mt-4">
        <v-progress-circular
          :model-value="robot.value"
          :rotate="360"
          :size="100"
          :width="9"
          class="v-progress-circular"
          :class="robot.value <= 20 ? 'text-primaryred' : 'text-primaryblue'"
        >
          <template v-slot:default>
            <span class="font-semibold text-primaryblue-500"> {{ robot.value }}% </span>
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
          <p class="font-semibold text-primaryblue mt-1">{{ robot.roll }}°</p>
          <p class="font-semibold text-primaryblue mt-1">{{ robot.pitch }}°</p>
          <p class="font-semibold text-primaryblue mt-1">{{ robot.yaw }}°</p>
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
          <h2 class="font-bold text-2xl text-primaryblue">{{ robot.health }}H</h2>
          <p class="font-semibold text-primaryblue">Health</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import SearchFilter from "@/components/pages/Agents/SearchFilter.vue";

const robots = ref([
  {
    name: "amr3_blue",
    value: 70,
    roll: 45,
    pitch: 120,
    yaw: 90,
    health: 13,
  },
  {
    name: "amr4_red",
    value: 85,
    roll: 60,
    pitch: 110,
    yaw: 100,
    health: 12,
  },
  {
    name: "amr5_red",
    value: 85,
    roll: 60,
    pitch: 110,
    yaw: 100,
    health: 12,
  },
  {
    name: "amr5_red",
    value: 85,
    roll: 60,
    pitch: 110,
    yaw: 100,
    health: 12,
  },
  {
    name: "amr5_red",
    value: 85,
    roll: 60,
    pitch: 110,
    yaw: 100,
    health: 12,
  },

  // Tambahkan lebih banyak robot sesuai kebutuhan
]);

let intervals: ReturnType<typeof setInterval>[] = [];

onMounted(() => {
  robots.value.forEach((robot) => {
    const interval = setInterval(() => {
      if (robot.value <= 0) {
        robot.value = 100;
      } else {
        robot.value -= 5;
      }
    }, 1000);
    intervals.push(interval);
  });
});

onBeforeUnmount(() => {
  intervals.forEach((interval) => clearInterval(interval));
});
</script>

<style scoped>
.v-progress-circular {
  margin: 1rem;
}
</style>
