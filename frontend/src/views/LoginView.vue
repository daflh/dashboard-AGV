<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { setJwtToken } from '@/utils';
import { useMainStore } from '@/stores/main'

const router = useRouter()
const mainStore = useMainStore()
const toast = useToast()

const username = ref('');
const password = ref('');
const remember = ref(false);

async function login() {
  if (username.value === '' || password.value === '') {
    toast.add({
      severity: 'error',
      summary: 'Failed to login',
      detail: 'Username or password is empty',
      life: 3000
    });
    return;
  }

  const fetchRes = await fetch(mainStore.backendUrl + '/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username: username.value,
      password: password.value,
      remember: remember.value
    }),
  });
  const data = await fetchRes.json();

  if (!data.success) {
    toast.add({
      severity: 'error',
      summary: 'Failed to login',
      detail: data.errorMsg,
      life: 3000
    });
    return;
  }

  setJwtToken(data.token);
  router.push('/');
}

</script>

<template>
  <div class="flex h-screen">
    <!-- Left Side -->
    <div class="w-full lg:w-1/2 flex flex-col justify-center items-center p-8">
      <div class="max-w-md w-full">
        <div class="flex items-center mb-10">
          <div class="text-2xl text-primaryblue italic cursor-default">
            <span class="font-medium">e-</span>
            <span class="font-semibold">Dabot</span>
          </div>
        </div>
        <h2 class="text-3xl font-bold mb-7 text-center">
          AMR Monitoring Dashboard
        </h2>
        <div>
          <div class="mb-4">
            <label class="block text-gray-700" for="name">Username</label>
            <input
              id="name"
              type="text"
              class="w-full border border-gray-300 p-2 rounded mt-1"
              v-model="username"
              placeholder="Enter your username [admin]"
            />
          </div>
          <div class="mb-4">
            <label class="block text-gray-700" for="password">Password</label>
            <input
              id="password"
              type="password"
              class="w-full border border-gray-300 p-2 rounded mt-1"
              v-model="password"
              placeholder="Enter your password [admin123]"
            />
          </div>
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center">
              <input id="remember" type="checkbox" class="mr-2" v-model="remember" />
              <label for="remember" class="text-gray-700">Remember Me</label>
            </div>
            <!-- <a href="#" class="text-primaryblue text-sm">Forgot Password</a> -->
          </div>
          <button class="w-full font-medium bg-primaryblue hover:bg-blue-800 text-white p-2 rounded" @click="login">
            Log In
          </button>
        </div>
      </div>
    </div>
    <!-- Right Side -->
    <div
      class="hidden lg:flex lg:w-1/2 bg-primaryblue text-white justify-left items-center p-20"
    >
      <div class="max-w-full">
        <h2 class="text-3xl font-bold mb-2 text-left w-3/4">
          Optimize Your AMR Operations with e-Dabot!
        </h2>
        <p class="mb-8 text-left mr-3">
          Effortlessly monitor and control your autonomous robots in real-time!
          Track locations, check performance stats, and keep data secure—all in one place.
        </p>
        <div class="w-full h-96 bg-white rounded-lg"></div>
      </div>
    </div>
  </div>
</template>
