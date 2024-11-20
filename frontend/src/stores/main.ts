import { defineStore } from 'pinia'
import { Socket } from 'socket.io-client'
import { Agent } from '@/types/agent'
import { SlamMap } from '@/types/slam'
import { getBackendUrl } from '@/utils'

interface MainState {
  backendUrl: string,
  jwtToken: string | null,
  socket: Socket | null,
  slamMap: SlamMap | null,
  agents: Agent[],
  sites: { label: string, value: number }[], // Add sites to MainState
  isAgentsLoaded: boolean,
  controlMapContextMenu: {
    isVisible: boolean,
    anchorPosition: [number, number],
    coordinate: [number, number]
  }
}

export const useMainStore = defineStore('main', {
  state: (): MainState => ({
    backendUrl: getBackendUrl(),
    jwtToken: null,
    socket: null,
    slamMap: null,
    agents: [],
    sites: [], // Initialize sites as an empty array
    isAgentsLoaded: false,
    controlMapContextMenu: {
      isVisible: false,
      anchorPosition: [0, 0],
      coordinate: [0, 0]
    }
  }),
  getters: {
    userData: (state) => {
      if (!state.jwtToken) return null
      const jwtPayload = JSON.parse(window.atob(state.jwtToken.split('.')[1]))
      return jwtPayload.data
    }
  },
  actions: {}
})
