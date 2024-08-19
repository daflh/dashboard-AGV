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
      <InputText v-model="searchValue" placeholder="Search agents" class="w-56" />
    </IconField>
    <SelectButton v-model="selectedFilter" :options="filterOptions" aria-labelledby="basic" />
  </div>
</template>

<style scoped>
</style>
