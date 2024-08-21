<script setup lang="ts">
import { reactive } from 'vue'
import Button from 'primevue/button'
import UserLayout from '@/components/UserLayout.vue'
import SearchFilter from '@/components/pages/Agents/SearchFilter.vue'
import AgentCard from '@/components/pages/Agents/AgentCard.vue'

const agentsData = reactive([
  {
    name: 'amr1',
    currentTask: 'Status robot',
    status: 'active',
    battery: 100,
    signal: 80,
    hsm: true
  },
  {
    name: 'amr_new',
    currentTask: 'Status robot',
    status: 'idle',
    battery: 90,
    signal: 100,
    hsm: true
  },
  {
    name: 'amr3_blue',
    currentTask: 'Status robot',
    status: 'offline',
    battery: 18,
    signal: 5,
    hsm: false
  },
  {
    name: 'amr4',
    currentTask: 'Status robot',
    status: 'active',
    battery: 100,
    signal: 100,
    hsm: true
  },
  {
    name: 'amr_2021',
    currentTask: 'Status robot',
    status: 'offline',
    battery: 100,
    signal: 100,
    hsm: false
  }
])

</script>

<template>
  <UserLayout>
    <div class="container mx-auto py-8 px-20">
      <div class="flex justify-between mb-7">
        <SearchFilter />
        <div>
          <Button type="button" label="Add" icon="pi pi-plus" class="!bg-primaryblue" />
        </div>
      </div>
      <div class="flex flex-wrap gap-6 justify-left">
        <AgentCard
          v-for="agent of agentsData"
          :key="agent.name"
          :agent="agent"
        />
      </div>
    </div>
  </UserLayout>
</template>
