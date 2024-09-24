<script setup lang="ts">
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import InputText from 'primevue/inputtext'

// Define props for modelValue
const props = defineProps<{
  modelValue: string
}>()

// Emit event for modelValue
const emit = defineEmits(['update:modelValue'])

</script>

<template>
  <IconField class="drop-shadow">
    <InputIcon class="pi pi-search" />
    <InputText
      v-model="props.modelValue"
      placeholder="Search agents"
      class="w-[15rem]"
      @input="(e) => emit('update:modelValue', e.target.value)"  
    />
  </IconField>
</template>
