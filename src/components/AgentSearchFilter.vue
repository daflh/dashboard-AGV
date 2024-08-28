<script setup lang="ts">
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import InputText from 'primevue/inputtext'

defineProps<{
  modelValue: string
}>()
defineEmits(['update:modelValue'])

</script>

<template>
  <IconField class="drop-shadow">
    <InputIcon class="pi pi-search" />
    <InputText
      x-model="modelValue"
      placeholder="Search agents"
      class="w-[15rem]"
      @input="(e) => $emit('update:modelValue', e.value)"
    />
  </IconField>
</template>
