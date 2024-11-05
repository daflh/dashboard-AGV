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
import { Agent } from '@/types/agent';

const mainStore = useMainStore();
const { socket } = mainStore;

const agentName = ref("");
const agentIpAddress = ref("");
const agentHsmKey = ref("");
const agentRegisterPlant = ref("");

const successMessage = ref("");
const errorMessage = ref("");

const filterOptions = [
  { label: "Active", value: "active" },
  { label: "Idle", value: "idle" },
  { label: "Offline", value: "offline" },
];

const searchValue = ref("");
const selectedTags = ref<string[]>([]);
const displayAddAgentDialog = ref(false);

const filteredAgents = computed(() => {
  return mainStore.agents.filter((agent) => {
    const matchesSearch = agent.name.toLowerCase().includes(searchValue.value.toLowerCase());
    const matchesTags = selectedTags.value.length === 0 || selectedTags.value.includes(agent.status ?? '');
    return matchesSearch && matchesTags;
  });
});

const toggleAddAgentDialog = () => {
  displayAddAgentDialog.value = !displayAddAgentDialog.value;
};

const submitAgent = () => {
  const newAgent = {
    name: agentName.value,
    ipAddress: agentIpAddress.value,
    hsmKey: agentHsmKey.value,
    siteId: agentRegisterPlant.value,
  };

  if (socket !== null) {
    socket.emit('agent:add', newAgent, (response: { success: boolean, message: string }) => {
      if (response.success) {
        toggleAddAgentDialog();
        socket.emit('agent:getAll', (agentsData: Agent[]) => {
          mainStore.agents = agentsData;
        });
      } else {
        errorMessage.value = response.message;
      }
    });
  } else {
    errorMessage.value = "Socket connection is not available";
    console.error("Socket is null, unable to submit agent");
  }
};

const handleAgentDeleted = (agentId: number) => {
  mainStore.agents = mainStore.agents.filter(agent => agent.id !== agentId);
};

</script>

<template>
  <UserLayout>
    <div class="container mx-auto py-8 px-20">
      <div v-if="successMessage" class="alert alert-success">{{ successMessage }}</div>
      <div v-if="errorMessage" class="alert alert-error">{{ errorMessage }}</div>

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
            @click="toggleAddAgentDialog"
            class="!bg-primaryblue !border-primaryblue"
          />
          <Dialog v-model:visible="displayAddAgentDialog" header="Add New Agent" :draggable="false" modal>
            <div class="flex flex-col gap-4 w-96 p-1 bg-white">
              <div class="flex flex-col space-y-3 w-full">
                <div>
                  <h1 class="font-medium mb-1">Agent Name</h1>
                  <InputText v-model="agentName" placeholder="Enter Agent Name" class="w-full p-2 border rounded" />
                </div>
                <div>
                  <h1 class="font-medium mb-1">IP Address</h1>
                  <InputText v-model="agentIpAddress" placeholder="Enter IP Address" class="w-full p-2 border rounded" />
                </div>
                <div>
                  <h1 class="font-medium mb-1">HSM Key</h1>
                  <InputText v-model="agentHsmKey" placeholder="Enter HSM Key" class="w-full p-2 border rounded" />
                </div>
                <div>
                  <h1 class="font-medium mb-1">Register Plant</h1>
                  <InputText v-model="agentRegisterPlant" placeholder="Enter Register Plant" class="w-full p-2 border rounded" />
                </div>
                <Button
                  label="Submit"
                  class="!mt-5 px-4 py-2 w-fit !rounded-xl !h-10 !bg-primaryblue !border-primaryblue text-white"
                  @click="submitAgent"
                />
              </div>
            </div>
          </Dialog>
        </div>
      </div>
      <div class="content-grid gap-6">
        <AgentCard
          v-for="agent in filteredAgents"
          :key="agent.name"
          :agent="agent"
          @agentDeleted="handleAgentDeleted"
        />
      </div>
    </div>
  </UserLayout>
</template>

<style scoped>
.content-grid {
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
}

@media (min-width: 640px) {
  .content-grid {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
}

@media (min-width: 768px) {
  .content-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1024px) {
  .content-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>
