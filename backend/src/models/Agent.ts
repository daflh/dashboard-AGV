interface Agent {
  id: number
  name: string
  currentTask: string | null
  plant: string
  status: 'active' | 'idle' | 'offline'
  battery: number
  signal: number
  velocity: 75,
  health: number
  hsm: boolean
  imu: {
    roll: number
    pitch: number
    yaw: number
  },
  location: [number, number] | null
}

export default Agent;
