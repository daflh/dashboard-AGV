<script setup lang="ts">
import { useMainStore } from '@/stores/main'
import Button from 'primevue/button'
import UserLayout from '@/components/UserLayout.vue'
import AgentSearchFilter from '@/components/AgentSearchFilter.vue'
import AgentCard from '@/components/pages/Agents/AgentCard.vue'

const mainStore = useMainStore()

</script>

<template>
  <UserLayout>
    <div class="container mx-auto py-8 px-20">
      <div class="flex justify-between mb-7">
        <AgentSearchFilter />
        <div>
          <Button type="button" label="Add" icon="pi pi-plus" class="!bg-primaryblue" />
        </div>
      </div>
      <div class="flex flex-wrap gap-6 justify-left">
        <AgentCard
          v-for="agent of mainStore.agentsData"
          :key="agent.name"
          :agent="agent"
        />
      </div>
    </div>
  </UserLayout>
</template>
