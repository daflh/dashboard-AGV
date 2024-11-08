import { createRouter, createWebHistory } from 'vue-router'
import { useMainStore } from '@/stores/main';
import initializeSocket from '@/initializeSocket'
import { getJwtToken, setJwtToken } from '@/utils';
import LoginView from '@/views/LoginView.vue'
import AgentsView from '@/views/AgentsView.vue'
import StatusView from '@/views/StatusView.vue'
import ControlView from '@/views/ControlView.vue'

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
    {
      path: '/control',
      name: 'control',
      component: ControlView
    }
  ]
})

router.beforeEach((to) => {
  const mainStore = useMainStore()
  const jwtToken = getJwtToken()

  // if client doesn't have token, always redirect to login page
  if (!jwtToken) return to.name !== 'login' ? { name: 'login' } : true

  try {
    // check jwt token validity
    const jwtPayload = JSON.parse(window.atob(jwtToken.split('.')[1]))
    // check token expiration
    if (Date.now() > jwtPayload.exp * 1000) throw new Error('Token expired')
  } catch {
    setJwtToken(null)
    return to.name !== 'login' ? { name: 'login' } : true
  }

  mainStore.jwtToken = getJwtToken()

  return to.name === 'login' ? { name: 'agents' } : true
})

router.afterEach((to) => {
  if (to.name !== 'login') {
    const mainStore = useMainStore()
    if (!mainStore.socket) initializeSocket()
  }
})

export default router
