import { defineStore } from 'pinia'

interface Agent {
  name: string
  currentTask: string | null
  status: 'active' | 'idle' | 'offline'
  battery: number
  signal: number
  health: number
  hsm: boolean
  imu: {
    roll: number
    pitch: number
    yaw: number
  },
  location: [number, number] | null
}

interface MainState {
  agentsData: Agent[],
  controlMapContextMenu: {
    isVisible: boolean,
    anchorPosition: [number, number],
    coordinate: [number, number]
  }
}

export const useMainStore = defineStore('main', {
  state: (): MainState => ({
    agentsData: [
      {
        name: 'amr1',
        currentTask: 'Status robot',
        status: 'active',
        battery: 100,
        signal: 80,
        health: 12,
        hsm: true,
        imu: {
          roll: 45,
          pitch: 120,
          yaw: 90
        },
        location: [933.28, -428.75]
      },
      {
        name: 'amr_new',
        currentTask: 'Status robot',
        status: 'idle',
        battery: 90,
        signal: 100,
        health: 12,
        hsm: true,
        imu: {
          roll: 45,
          pitch: 120,
          yaw: 90
        },
        location: [782, -500.98]
      },
      {
        name: 'amr2_blue',
        currentTask: 'Status robot',
        status: 'active',
        battery: 85,
        signal: 100,
        health: 12,
        hsm: false,
        imu: {
          roll: 45,
          pitch: 120,
          yaw: 90
        },
        location: null
      },
      {
        name: 'amr3_blue',
        currentTask: 'Status robot',
        status: 'offline',
        battery: 18,
        signal: 5,
        health: 12,
        hsm: false,
        imu: {
          roll: 45,
          pitch: 120,
          yaw: 90
        },
        location: [495.06, -765.46]
      },
      {
        name: 'amr4',
        currentTask: 'Status robot',
        status: 'active',
        battery: 100,
        signal: 100,
        health: 12,
        hsm: true,
        imu: {
          roll: 45,
          pitch: 120,
          yaw: 90
        },
        location: null
      },
      {
        name: 'amr_2021',
        currentTask: 'Status robot',
        status: 'offline',
        battery: 100,
        signal: 100,
        health: 12,
        hsm: false,
        imu: {
          roll: 45,
          pitch: 120,
          yaw: 90
        },
        location: null
      }
    ],
    controlMapContextMenu: {
      isVisible: false,
      anchorPosition: [0, 0],
      coordinate: [0, 0]
    }
  }),
  actions: {}
})
