import { defineStore } from 'pinia'
import { Socket } from 'socket.io-client'
import { Agent, SlamMap } from '@/types'

interface MainState {
  socket: Socket | null,
  slamMap: SlamMap | null,
  agents: Agent[],
  controlMapContextMenu: {
    isVisible: boolean,
    anchorPosition: [number, number],
    coordinate: [number, number]
  }
}

export const useMainStore = defineStore('main', {
  state: (): MainState => ({
    socket: null,
    slamMap: null,
    agents: [],
    controlMapContextMenu: {
      isVisible: false,
      anchorPosition: [0, 0],
      coordinate: [0, 0]
    }
  }),
  actions: {}
})
