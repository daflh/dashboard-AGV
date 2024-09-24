interface Vector3D {
  x: number
  y: number
  z: number
}

interface Quaternion {
  x: number
  y: number
  z: number
  w: number
}

type AgentStatus = 'active' | 'idle' | 'offline'

interface AgentOdometry {
  position: Vector3D
  orientation: Quaternion
}

interface AgentImu {
  orientation: Quaternion
  angular_velocity: Vector3D
  linear_acceleration: Vector3D
}

export default interface Agent {
  id: number
  name: string
  currentTask: string | null
  plant: string
  status: AgentStatus
  battery: number
  signal: number
  velocity: number,
  health: number
  hsm: boolean
  attitude: {
    roll: number
    pitch: number
    yaw: number
  },
  location: [number, number] | null,
  odom: AgentOdometry,
  imu: AgentImu,
  linearVelocity: Vector3D,
  angularVelocity: Vector3D
}
