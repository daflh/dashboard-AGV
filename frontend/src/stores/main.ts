import { defineStore } from 'pinia'
import { Socket } from 'socket.io-client'
import Agent from '@/types/Agent'

interface MainState {
  socket: Socket | null,
  agentsData: Agent[],
  controlMapContextMenu: {
    isVisible: boolean,
    anchorPosition: [number, number],
    coordinate: [number, number]
  }
}

export const useMainStore = defineStore('main', {
  state: (): MainState => ({
    socket: null,
    agentsData: [],
    controlMapContextMenu: {
      isVisible: false,
      anchorPosition: [0, 0],
      coordinate: [0, 0]
    }
  }),
  actions: {}
})
