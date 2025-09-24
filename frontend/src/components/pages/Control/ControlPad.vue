<script setup>
import { reactive, onMounted, onUnmounted } from 'vue';

const emit = defineEmits(['direction']);

const directions = reactive({
  forward: {
    key: 'w',
    isActive: false,
    intervalId: null
  },
  backward: {
    key: 's',
    isActive: false,
    intervalId: null
  },
  left: {
    key: 'a',
    isActive: false,
    intervalId: null
  },
  right: {
    key: 'd',
    isActive: false,
    intervalId: null
  }
});

function emitDirection(direction) {
  emit('direction', direction);
}

function startInterval(direction) {
  if (directions[direction].intervalId) return;

  const callbackFn = () => emitDirection(direction);
  callbackFn();
  directions[direction].intervalId = setInterval(callbackFn, 100);
}

function stopInterval(direction) {
  clearInterval(directions[direction].intervalId);
  directions[direction].intervalId = null;
}

function controlPadOnKeydown(ev) {
  for (const direction in directions) {
    if (ev.key === directions[direction].key) {
      startInterval(direction);
      directions[direction].isActive = true;
    }
  }
}

function controlPadOnKeyUp(ev) {
  for (const direction in directions) {
    if (ev.key === directions[direction].key) {
      stopInterval(direction);
      directions[direction].isActive = false;
    }
  }
}

onMounted(() => {
  document.addEventListener('keydown', controlPadOnKeydown);
  document.addEventListener('keyup', controlPadOnKeyUp);
});

onUnmounted(() => {
  document.removeEventListener('keydown', controlPadOnKeydown);
  document.removeEventListener('keyup', controlPadOnKeyUp);
});

</script>

<template>
  <div class="w-28 h-28 ml-2.5 select-none font-semibold text-sm">
    <svg viewBox="0 0 100 100">
      <!-- Background shape -->
      <path d="M10,10 L90,10 L90,90 L10,90 Z" fill="none"/>

      <!-- W button -->
      <g @click="emitDirection('forward')" class="cursor-pointer hover:opacity-70">
        <rect x="30" y="5" width="30" height="30" :fill="directions.forward.isActive ? '#940000' : '#000080'" stroke="white" />
        <text x="45" y="25" text-anchor="middle" fill="white">W</text>
      </g>

      <!-- A button -->
      <g @click="emitDirection('left')" class="cursor-pointer hover:opacity-70">
        <rect x="0" y="35" width="30" height="30" :fill="directions.left.isActive ? '#940000' : '#000080'" stroke="white" />
        <text x="15" y="55" text-anchor="middle" fill="white">A</text>
      </g>

      <!-- S button -->
      <g @click="emitDirection('backward')" class="cursor-pointer hover:opacity-70">
        <rect x="30" y="65" width="30" height="30" :fill="directions.backward.isActive ? '#940000' : '#000080'" stroke="white" />
        <text x="45" y="85" text-anchor="middle" fill="white">S</text>
      </g>

      <!-- D button -->
      <g @click="emitDirection('right')" class="cursor-pointer hover:opacity-70">
        <rect x="60" y="35" width="30" height="30" :fill="directions.right.isActive ? '#940000' : '#000080'" stroke="white" />
        <text x="75" y="55" text-anchor="middle" fill="white">D</text>
      </g>

      <!-- Center circle -->
      <circle cx="45" cy="50" r="8" fill="#000080"/>
    </svg>
  </div>
</template>
