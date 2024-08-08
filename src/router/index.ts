import { createRouter, createWebHistory } from 'vue-router'
import LogInView from '../views/LogInView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'logIn',
      component: LogInView
    },
  ]
})

router.beforeEach

export default router
