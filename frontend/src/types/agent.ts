export type Position2D = [x: number, y: number]

export type Position3D = [x: number, y: number, z: number]

export interface Vector3D {
  x: number
  y: number
  z: number
}

export interface Quaternion {
  x: number
  y: number
  z: number
  w: number
}

export interface AgentRawOdometry {
  position: Vector3D
  orientation: Quaternion
}

export interface AgentRawIMU {
  orientation: Quaternion
  angularVelocity: Vector3D
  linearAcceleration: Vector3D
}

export type AgentStatus = 'active' | 'idle' | 'offline'

// obtained from database
export interface AgentConfiguration {
  id: number
  name: string
  description: string
  ipAddress: string | null // IPv4
  hsmKey: string | null
  site: string
  company: string
  lastMaintenance: number // unix timestamp
}

// all properties are optional in backend
export interface AgentCondition {
  status?: AgentStatus
  battery?: number // percentage
  signal?: number // percentage
  useHsm?: boolean
  heading?: number // degrees
  position?: Position2D
  linearVelo?: number // m/s
  angularVelo?: number // m/s
}

export type Agent = AgentConfiguration & AgentCondition
