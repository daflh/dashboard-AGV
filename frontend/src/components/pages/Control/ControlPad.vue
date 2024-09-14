<script setup>
import { defineEmits } from 'vue';

const emit = defineEmits(['direction']);

function emitDirection(direction) {
  emit('direction', direction);
}

</script>

<template>
  <div class="w-28 h-28 ml-2.5 select-none font-semibold text-sm">
    <svg viewBox="0 0 100 100">
      <!-- Background shape -->
      <path d="M10,10 L90,10 L90,90 L10,90 Z" fill="none"/>

      <!-- W button -->
      <g @click="emitDirection('W')" class="cursor-pointer hover:opacity-70">
        <rect x="30" y="5" width="30" height="30" fill="#000080" stroke="white" />
        <text x="45" y="25" text-anchor="middle" fill="white">W</text>
      </g>

      <!-- A button -->
      <g @click="emitDirection('A')" class="cursor-pointer hover:opacity-70">
        <rect x="0" y="35" width="30" height="30" fill="#000080" stroke="white" />
        <text x="15" y="55" text-anchor="middle" fill="white">A</text>
      </g>

      <!-- S button -->
      <g @click="emitDirection('S')" class="cursor-pointer hover:opacity-70">
        <rect x="30" y="65" width="30" height="30" fill="#000080" stroke="white" />
        <text x="45" y="85" text-anchor="middle" fill="white">S</text>
      </g>

      <!-- D button -->
      <g @click="emitDirection('D')" class="cursor-pointer hover:opacity-70">
        <rect x="60" y="35" width="30" height="30" fill="#000080" stroke="white" />
        <text x="75" y="55" text-anchor="middle" fill="white">D</text>
      </g>

      <!-- Center circle -->
      <circle cx="45" cy="50" r="8" fill="#000080"/>
    </svg>
  </div>
</template>
