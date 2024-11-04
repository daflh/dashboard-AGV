<script setup lang="ts">
import { ref } from "vue";
import { RouterLink } from "vue-router";
import AgentStatus from "./AgentStatus.vue";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import Button from "primevue/button";
import StatusIcon from "@/components/icon/StatusIcon.vue";
import EditIcon from "@/components/icon/EditIcon.vue";
import MapAndControlIcon from "@/components/icon/MapAndControlIcon.vue";
import { Agent } from "@/types/agent";
import AgentPortStatus from "./AgentPortStatus.vue";
import { useMainStore } from "@/stores/main";

const props = defineProps<{
  agent: Agent | null;
}>();

const mainStore = useMainStore();
const { socket } = mainStore;

// Refs for form fields with optional chaining
const agentName = ref(props.agent?.name || "");
const agentIpAddress = ref(props.agent?.ipAddress || "");
const agentHsmKey = ref(props.agent?.hsmKey || "");
const agentSite = ref(props.agent?.site || "");

// Dialog visibility states
const displayEditAgentDialog = ref(false);
const displayCheckPortStatus = ref(false);

const toggleEditAgentDialog = () => {
  displayEditAgentDialog.value = !displayEditAgentDialog.value;
};

const toggleCheckPortStatus = () => {
  displayCheckPortStatus.value = !displayCheckPortStatus.value;
};

const submitEditAgent = () => {
  if (!props.agent) return; // Early return if agent is null

  const updatedAgent = {
    ...props.agent,
    name: agentName.value,
    ipAddress: agentIpAddress.value,
    hsmKey: agentHsmKey.value,
    site: parseInt(agentSite.value, 10),
  };

  // Check if socket is available before emitting
  if (socket) {
    socket.emit("agent:edit", updatedAgent, (response: { success: boolean; message: string }) => {
      if (response.success) {
        console.log("Agent updated successfully");
      } else {
        console.error("Failed to update agent:", response.message);
      }
      toggleEditAgentDialog(); // Close the dialog on success
    });
  } else {
    console.error("Socket connection is not available.");
  }
};

</script>

<template>
  <div class="px-5 py-4 shadow-md rounded-md border border-slate-200 min-w-[15rem]">
    <div class="flex justify-between mb-1">
      <div class="text-lg font-medium">{{ props.agent?.name || '' }}</div>
      <AgentStatus
        :status="props.agent?.status || 'offline'"
        @click="toggleCheckPortStatus"
        class="cursor-pointer"
      />
      <Dialog v-model:visible="displayCheckPortStatus" header="Port Status" modal>
        <div class="flex flex-col gap-4 w-96 p-1 bg-white">
          <AgentPortStatus :portStatus="props.agent?.portStatus ?? {}" />
        </div>
      </Dialog>
    </div>
    <div class="font-medium text-sm text-slate-700">
      {{ props.agent?.site || '' }}
    </div>
    <hr class="my-3" />
    <div class="flex justify-around">
      <RouterLink to="/status" title="Go to agent status">
        <StatusIcon alt="Status Icon" class="h-6 mr-2" />
      </RouterLink>
      <RouterLink to="control" title="Go to agent control">
        <MapAndControlIcon alt="Map And Control Icon" class="h-5 mr-2" />
      </RouterLink>
      <div class="cursor-pointer" title="Edit agent" @click="toggleEditAgentDialog">
        <EditIcon alt="Edit Icon" class="h-6 mr-2" />
        <Dialog v-model:visible="displayEditAgentDialog" header="Edit Agent" modal>
          <div class="flex flex-col gap-4 w-96 p-1 bg-white">
            <div class="flex flex-col">
              <h1 class="font-medium">New Agent Name</h1>
              <InputText v-model="agentName" placeholder="Enter New Agent Name" class="p-2 border rounded" />
              
              <h1 class="mt-2 font-medium">New IP Address</h1>
              <InputText v-model="agentIpAddress" placeholder="Enter New IP Address" class="p-2 border rounded" />
              
              <h1 class="mt-2 font-medium">New HSM Key</h1>
              <InputText v-model="agentHsmKey" placeholder="Enter New HSM Key" class="p-2 border rounded" />
              
              <h1 class="mt-2 font-medium">New Register Plant</h1>
              <InputText v-model="agentSite" placeholder="Enter New Register Plant" class="p-2 border rounded" />
              
              <Button
                label="Submit"
                class="mt-6 px-4 py-2 w-fit !rounded-xl !h-10 !bg-primaryblue !border-primaryblue text-white"
                @click="submitEditAgent"
              />
            </div>
          </div>
        </Dialog>
      </div>
    </div>
  </div>
</template>
