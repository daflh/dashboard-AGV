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
        <div class="flex items-center mb-2">
          <div class="w-12 h-12 rounded-full mr-4">
              <h1 class="text-blue font-bold">LOGO</h1>
          </div>
          <!-- <span class="text-2xl font-bold text-gray-800">Sem<span class="text-blue">Barang</span></span> -->
        </div>
        <h2 class="text-3xl font-bold mb-2 text-center">
          Stechoq AGV Dashboard
        </h2>
        <p class="text-gray-600 mb-8 font-productsans text-center">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
          incididunt ut labore et dolore magna aliqua.
        </p>
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
            <!-- <a href="#" class="text-blue text-sm">Forgot Password</a> -->
          </div>
          <button type="submit" class="w-full bg-blue text-white p-2 rounded">
            Log In
          </button>
        </form>
        <p class="text-gray-700 text-center mt-4">
          Already have an account? <a href="/status" class="text-blue">Log In</a>
        </p>
      </div>
    </div>
    <!-- Right Side -->
    <div
      class="hidden lg:flex lg:w-1/2 bg-blue text-white justify-left items-center p-20"
    >
      <div class="max-w-full">
        <h2 class="text-3xl font-bold mb-2 text-left w-3/4">
          Lorem ipsum dolor sit amet, cons ectetur !
        </h2>
        <p class="mb-8 text-left w-3/4">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
          incididunt ut labore et dolore magna aliqua.
        </p>
        <div class="w-full h-96 bg-white rounded-lg"></div>
      </div>
    </div>
  </div>
</template>
