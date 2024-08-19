import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import AgentsView from '../views/AgentsView.vue'
import StatusView from '../views/StatusView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: { name: 'agents' }
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/agents',
      name: 'agents',
      component: AgentsView
    },
    {
      path: '/status',
      name: 'status',
      component: StatusView
    },
  ]
})

router.beforeEach((to) => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'

  if (to.name !== 'login' && !isLoggedIn) {
    return { name: 'login' }
  } else if (to.name === 'login' && isLoggedIn) {
    return { name: 'agents' }
  } else {
    return true
  }
})

export default router
