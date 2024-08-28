<script setup lang="ts">
import { ref, computed } from 'vue'
import { useMainStore } from '@/stores/main'
import Button from 'primevue/button'
import SelectButton from 'primevue/selectbutton'
import UserLayout from '@/components/UserLayout.vue'
import AgentSearchFilter from '@/components/AgentSearchFilter.vue'
import AgentCard from '@/components/pages/Agents/AgentCard.vue'

const filterOptions = [
  { label: 'Active', value: 'active' },
  { label: 'Idle', value: 'idle' },
  { label: 'Offline', value: 'offline' }
]

const mainStore = useMainStore()
const searchValue = ref('')
const selectedTags = ref<string[]>([])

const filteredAgents = computed(() => {
  return mainStore.agentsData.filter((agent) => {
    if (selectedTags.value.length === 0) return true
    return selectedTags.value.includes(agent.status)
  })
})

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
          <Button type="button" label="Add" icon="pi pi-plus" class="!bg-primaryblue" />
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
