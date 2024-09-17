<script setup lang="ts">
import { ref, computed } from "vue";
import { useMainStore } from "@/stores/main";
import Button from "primevue/button";
import SelectButton from "primevue/selectbutton";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import UserLayout from "@/components/UserLayout.vue";
import AgentSearchFilter from "@/components/AgentSearchFilter.vue";
import AgentCard from "@/components/pages/Agents/AgentCard.vue";

// Filter options for agent status
const filterOptions = [
  { label: "Active", value: "active" },
  { label: "Idle", value: "idle" },
  { label: "Offline", value: "offline" },
];

const mainStore = useMainStore();
const searchValue = ref("");
const selectedTags = ref<string[]>([]);
const displayDialog = ref(false); // Dialog visibility

// Computed property to filter agents based on selected tags
const filteredAgents = computed(() => {
  return mainStore.agents.filter((agent) => {
    if (selectedTags.value.length === 0) return true;
    return selectedTags.value.includes(agent.status);
  });
});

// Function to toggle dialog visibility
const toggleDialog = () => {
  displayDialog.value = !displayDialog.value;
};
</script>

<template>
  <UserLayout>
    <div class="container mx-auto py-8 px-20">
      <div class="flex justify-between mb-7">
        <div class="flex space-x-5">
          <AgentSearchFilter v-model="searchValue" />
          <SelectButton
            v-model="selectedTags"
            :options="filterOptions"
            option-label="label"
            option-value="value"
            pt:root="space-x-2 [&>button]:!border-0 [&>button]:!rounded-lg"
            aria-labelledby="basic"
            multiple
          />
        </div>
        <div>
          <Button
            type="button"
            label="Add"
            icon="pi pi-plus"
            @click="toggleDialog"
            class="!bg-primaryblue !border-primaryblue"
          />
          <Dialog v-model:visible="displayDialog" header="Add New Agent" modal>
            <div class="flex flex-col gap-4 w-96 p-1 bg-white">
              <div class="flex flex-col">
                <h1 class="font-medium">Agent Name</h1>
                <InputText placeholder="Enter Agent Name" class=" p-2 border rounded" />
                <h1 class="mt-2 font-medium">IP Address</h1>
                <InputText placeholder="Enter IP Address" class=" p-2 border rounded" />
                <h1 class="mt-2 font-medium">HSM Key</h1>
                <InputText placeholder="Enter HSM Key" class=" p-2 border rounded" />
                <h1 class="mt-2 font-medium">Regiter Plant</h1>
                <InputText placeholder="Enter Register Plant" class=" p-2 border rounded" />
                <Button
                  label="Submit"
                  class="mt-6 px-4 py-2 w-fit !rounded-xl !h-10 !bg-primaryblue !border-primaryblue text-white"
                  @click="toggleDialog"
                />
              </div>
            </div>
          </Dialog>
        </div>
      </div>
      <div class="flex flex-wrap gap-6 justify-left">
        <AgentCard
          v-for="agent of filteredAgents"
          :key="agent.name"
          :agent="agent"
        />
      </div>
    </div>
  </UserLayout>
</template>

<style scoped></style>