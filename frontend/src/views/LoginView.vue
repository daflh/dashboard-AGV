<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

function submitForm() {
  // Tambahkan logika pengiriman formulir di sini
  localStorage.setItem('isLoggedIn', 'true')
  router.push('/')
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
        <form @submit.prevent="submitForm">
          <div class="mb-4">
            <label class="block text-gray-700" for="name">Username</label>
            <input
              id="name"
              type="text"
              class="w-full border border-gray-300 p-2 rounded mt-1"
              placeholder="Enter your username"
            />
          </div>
          <div class="mb-4">
            <label class="block text-gray-700" for="password">Password</label>
            <input
              id="password"
              type="password"
              class="w-full border border-gray-300 p-2 rounded mt-1"
              placeholder="Enter your password"
            />
          </div>
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center">
              <input id="remember" type="checkbox" class="mr-2" />
              <label for="remember" class="text-gray-700">Remember Me</label>
            </div>
            <!-- <a href="#" class="text-primaryblue text-sm">Forgot Password</a> -->
          </div>
          <button type="submit" class="w-full bg-primaryblue text-white p-2 rounded">
            Log In
          </button>
        </form>
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
