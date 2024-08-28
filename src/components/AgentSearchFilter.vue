<script setup lang="ts">
import { ref } from 'vue'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import InputText from 'primevue/inputtext'
import SelectButton from 'primevue/selectbutton'

const filterOptions = ['Active', 'Idle', 'Offline']

const searchValue = ref('')
const selectedFilter = ref('');

</script>

<template>
  <div class="flex space-x-5">
    <IconField class="drop-shadow">
      <InputIcon class="pi pi-search" />
      <InputText v-model="searchValue" placeholder="Search agents" class="w-[15rem]" />
    </IconField>
    <SelectButton
      v-model="selectedFilter"
      :options="filterOptions"
      pt:root="space-x-2 [&>button]:!border-0 [&>button]:!rounded-lg"
      aria-labelledby="basic"
      multiple
    />
  </div>
</template>
