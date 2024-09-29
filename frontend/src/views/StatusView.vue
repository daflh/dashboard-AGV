<script setup lang="ts">
import { ref, computed } from "vue";
import { useMainStore } from "@/stores/main";
import SelectButton from "primevue/selectbutton";
import UserLayout from "@/components/UserLayout.vue";
import AgentSearchFilter from "@/components/AgentSearchFilter.vue";
import AgentStatusCard from "@/components/pages/Status/AgentStatusCard.vue";

// Filter options for agent status
const filterOptions = [
  { label: "Active", value: "active" },
  { label: "Idle", value: "idle" },
];

const mainStore = useMainStore();
const searchValue = ref(""); // Search value for agent names
const selectedTag = ref(null); // Selected agent status

// Computed property to filter agents based on search value and status
const filteredAgents = computed(() => {
  return mainStore.agents.filter((agent) => {
    const matchesSearch = agent.name
      .toLowerCase()
      .includes(searchValue.value.toLowerCase());
    const matchesTag = selectedTag.value === null || selectedTag.value === agent.status;
    return matchesSearch && matchesTag;
  });
});
</script>

<template>
  <UserLayout>
    <div class="flex justify-between py-8 px-20">
      <div class="flex space-x-5">
        <!-- Bind searchValue to AgentSearchFilter -->
        <AgentSearchFilter v-model="searchValue" />

        <!-- Filter by status using SelectButton -->
        <SelectButton
          v-model="selectedTag"
          :options="filterOptions"
          option-label="label"
          option-value="value"
          pt:root="space-x-2 [&>button]:!border-0 [&>button]:!rounded-lg"
          aria-labelledby="basic"
        />
      </div>
    </div>

    <!-- Display filtered agents -->
    <div class="flex justify-left mx-20 flex-wrap gap-16 mb-10">
        <AgentStatusCard
          v-for="(agent, index) in filteredAgents"
          :key="index"
          :agent="agent"
        />
    </div>
  </UserLayout>
</template>
