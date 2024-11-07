<script setup lang="ts">
import { useRouter, useRoute, RouterLink } from "vue-router";
import { ref, computed } from "vue";
import Popover from "primevue/popover";
import AgentsIcon from "@/components/icon/AgentsIcon.vue";
import StatusIcon from "@/components/icon/StatusIcon.vue";
import MapAndControlIcon from "@/components/icon/MapAndControlIcon.vue";
import ProfileSettingIcon from "@/components/icon/ProfileSettingIcon.vue";

const menus = [
  {
    label: 'Agents',
    icon: AgentsIcon,
    route: { name: 'agents' }
  },
  {
    label: 'Status',
    icon: StatusIcon,
    route: { name: 'status' }
  },
  {
    label: 'Map & Control',
    icon: MapAndControlIcon,
    route: { name: 'control' }
  }
];

const router = useRouter();
const route = useRoute();

const op = ref<typeof Popover | null>(null); // Pastikan ref bisa berupa null awalnya
const activeRoute = computed(() => route.name);

const logout = () => {
  localStorage.removeItem("isLoggedIn");
  router.push("/login");
};

const togglePopover = (event: Event) => {
  op.value!.toggle(event); // Non-null assertion untuk memastikan op.value tidak null
};
</script>

<template>
  <div
    class="flex items-center justify-between h-20 bg-slate-100 px-8 border-b shadow border-gray-200 fixed top-0 left-0 w-full z-50"
  >
    <div class="text-xl text-primaryblue italic ml-4 cursor-default">
      <span class="font-medium">e-</span>
      <span class="font-semibold">Dabot</span>
    </div>
    <div class="flex gap-x-4">
      <RouterLink
        v-for="menu in menus"
        :key="menu.label"
        class="flex items-center text-primaryblue relative px-3 py-2 rounded-lg hover:bg-gray-200"
        :class="activeRoute === menu.route.name ? 'font-semibold' : 'font-medium'"
        :to="menu.route"
      >
        <component :is="menu.icon" :alt="menu.label + ' Icon'" class="h-6 mr-2" />
        <div>{{ menu.label }}</div>
        <div v-show="activeRoute === menu.route.name" class="absolute mx-4 h-2 border-b-[3px] border-orange-400 inset-x-0 top-10"></div>
      </RouterLink>
    </div>
    <div class="flex items-center justify-center relative cursor-pointer" @click="togglePopover">
      <img src="@/assets/images/profile_pict.png" alt="Profile Pict" class="ml-4 w-12" />
      <!-- <img
        src="@/assets/images/profile_setting.svg"
        alt="Profile Setting"
        class="mx-4 w-5"
        @click="togglePopover"
      /> -->

      <ProfileSettingIcon alt="Profile Setting" class="mx-4 w-5"  />

      <Popover ref="op" class="!mt-6 min-w-40">
        <div class="text-gray-800">
          <div class="text-[.925rem] mb-0.5">Logged in as</div>
          <div class="font-semibold">admin</div>
          <hr class="my-3 bg-gray-800" />
          <div class="space-y-1">
            <div class="cursor-pointer">Settings</div>
            <div class="text-primaryred cursor-pointer" @click="logout">Logout</div>
          </div>
        </div>
      </Popover>
    </div>
  </div>
  <div class="mb-20" />
</template>

<style scoped></style>
