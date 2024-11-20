<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { RouterLink } from "vue-router";
import AgentStatus from "./AgentStatus.vue";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import Button from "primevue/button";
import Dropdown from "primevue/dropdown"; // Import Dropdown component
import StatusIcon from "@/components/icon/StatusIcon.vue";
import EditIcon from "@/components/icon/EditIcon.vue";
import MapAndControlIcon from "@/components/icon/MapAndControlIcon.vue";
import { Agent } from "@/types/agent";
import AgentPortStatus from "./AgentPortStatus.vue";
import { useMainStore } from "@/stores/main";

const emit = defineEmits<{
  (e: "agentDeleted", agentId: number): void;
}>();

const props = defineProps<{
  agent: Agent | null;
}>();

const mainStore = useMainStore();
const { socket } = mainStore;

const agentName = ref(props.agent?.name || "");
const agentIpAddress = ref(props.agent?.ipAddress || "");
const agentHsmKey = ref(props.agent?.hsmKey || "");
const agentSite = ref(props.agent?.siteId || null); // Initialize with the current siteId

const displayEditAgentDialog = ref(false);
const displayCheckPortStatus = ref(false);

// Watch for changes in props.agent to update agentSite with the current siteId
watch(() => props.agent, (newAgent) => {
  if (newAgent) {
    agentName.value = newAgent.name || "";
    agentIpAddress.value = newAgent.ipAddress || "";
    agentHsmKey.value = newAgent.hsmKey || "";
    agentSite.value = newAgent.siteId || null;
  }
});

// Compute the site name based on siteId
const siteName = computed(() => {
  const site = mainStore.sites.find(s => s.value === props.agent?.siteId);
  return site ? site.label : "Unknown site";
});

const toggleEditAgentDialog = () => {
  displayEditAgentDialog.value = !displayEditAgentDialog.value;
};

const toggleCheckPortStatus = () => {
  displayCheckPortStatus.value = !displayCheckPortStatus.value;
};

const submitEditAgent = () => {
  if (!props.agent) return;

  const updatedAgent = {
    ...props.agent,
    name: agentName.value,
    ipAddress: agentIpAddress.value,
    hsmKey: agentHsmKey.value,
    siteId: agentSite.value // Ensure siteId is updated based on dropdown selection
  };

  if (socket) {
    socket.emit("agent:edit", updatedAgent, (response: { success: boolean; message: string }) => {
      if (response.success) {
        console.log("Agent updated successfully");
      } else {
        console.error("Failed to update agent:", response.message);
      }
      toggleEditAgentDialog();
    });
  } else {
    console.error("Socket connection is not available.");
  }
};

const deleteAgent = () => {
  if (!props.agent || !socket) return;

  const confirmation = confirm("Are you sure you want to delete this agent?");
  if (!confirmation) return;

  const agentId = props.agent.id;

  socket.emit("agent:delete", agentId, (response: { success: boolean; message: string }) => {
    if (response.success) {
      console.log("Agent deleted successfully");
      toggleEditAgentDialog();
      emit("agentDeleted", agentId); // Emit event to parent
    } else {
      console.error("Failed to delete agent:", response.message);
    }
  });
};
</script>

<template>
  <div class="px-5 py-4 shadow-md rounded-md border border-slate-200 min-w-[15rem]">
    <div class="flex justify-between mb-1">
      <div class="text-lg font-medium text-gray-800">{{ props.agent?.name || '' }}</div>
      <AgentStatus
        :status="props.agent?.status || 'offline'"
        @click="toggleCheckPortStatus"
        class="cursor-pointer"
      />
      <Dialog v-model:visible="displayCheckPortStatus" header="Port Status" :draggable="false" modal>
        <div class="flex flex-col gap-4 w-96 p-1 bg-white">
          <AgentPortStatus :portStatus="props.agent?.portStatus ?? {}" />
        </div>
      </Dialog>
    </div>
    <div class="font-medium text-sm text-slate-700">
      {{ siteName }} – {{ props.agent?.ipAddress || 'Unknown host' }}
    </div>
    <hr class="my-3" />
    <div class="flex justify-around">
      <RouterLink to="/status" title="Go to agent status" class="text-primaryblue hover:text-blue-800">
        <StatusIcon alt="Status Icon" class="h-6 mr-2" />
      </RouterLink>
      <RouterLink to="control" title="Go to agent control" class="text-primaryblue hover:text-blue-800">
        <MapAndControlIcon alt="Map And Control Icon" class="h-5 mr-2" />
      </RouterLink>
      <div class="cursor-pointer text-primaryblue hover:text-blue-800" title="Edit agent" @click="toggleEditAgentDialog">
        <EditIcon alt="Edit Icon" class="h-6 mr-2" />
        <Dialog v-model:visible="displayEditAgentDialog" header="Edit Agent" :draggable="false" modal>
          <div class="flex flex-col gap-4 w-96 p-1 bg-white">
            <div class="flex flex-col space-y-3 w-full">
              <div>
                <h1 class="font-medium mb-1">Agent Name</h1>
                <InputText v-model="agentName" placeholder="Enter Agent Name" class="w-full p-2 border rounded" />
              </div>
              <div>
                <h1 class="font-medium mb-1">Register Site</h1>
                <Dropdown 
                  v-model="agentSite" 
                  :options="mainStore.sites" 
                  option-label="label" 
                  option-value="value" 
                  placeholder="Select a Site" 
                  class="w-full border rounded" 
                />
              </div>
              <div>
                <h1 class="font-medium mb-1">IP Address</h1>
                <InputText v-model="agentIpAddress" placeholder="Enter IP Address" class="w-full p-2 border rounded" />
              </div>
              <div>
                <h1 class="font-medium mb-1">HSM Key</h1>
                <InputText v-model="agentHsmKey" placeholder="Enter HSM Key" class="w-full p-2 border rounded" />
              </div>              
              <div class="flex space-x-3 !mt-4">
                <Button label="Save" class="px-4 py-2 w-fit !rounded-xl !h-10 !bg-primaryblue hover:!bg-blue-800 !border-primaryblue text-white" @click="submitEditAgent" />
                <Button label="Delete" class="px-4 py-2 w-fit !rounded-xl !h-10 !bg-red-700 hover:!bg-red-600 !border-red-500 text-white" @click="deleteAgent" />
              </div>
            </div>
          </div>
        </Dialog>
      </div>
    </div>
  </div>
</template>
