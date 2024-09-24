import Agent from "../models/Agent";

type OnAgentUpdateCallback = (agentId: number, agentData: object) => void;

const defaultAgentData = {
  odom: {
    position: { x: 0, y: 0, z: 0 },
    orientation: { x: 0, y: 0, z: 0, w: 0 }
  },
  imu: {
    orientation: { x: 0, y: 0, z: 0, w: 0 },
    angular_velocity: { x: 0, y: 0, z: 0 },
    linear_acceleration: { x: 0, y: 0, z: 0 }
  },
  linearVelocity: { x: 0, y: 0, z: 0 },
  angularVelocity: { x: 0, y: 0, z: 0 }
}

const dummyAgents: Agent[] = [
  {
    id: 202409151505235,
    name: 'amr1',
    currentTask: 'Status robot',
    plant: 'Robot plant',
    status: 'active',
    battery: 100,
    signal: 80,
    velocity: 75, 
    health: 12,
    hsm: true,
    attitude: {
      roll: 45,
      pitch: 120,
      yaw: 90
    },
    location: [202.981, 159.549],
    ...defaultAgentData
  },
  {
    id: 202409151505123,
    name: 'amr12',
    currentTask: 'Status robot',
    plant: 'Robot plant',
    status: 'active',
    battery: 100,
    signal: 80,
    velocity: 75, 
    health: 12,
    hsm: true,
    attitude: {
      roll: 45,
      pitch: 120,
      yaw: 90
    },
    location: [176.494, 200.183],
    ...defaultAgentData
  },
  {
    id: 202409151505924,
    name: 'amr_new',
    currentTask: 'Status robot',
    plant: 'Robot plant',
    status: 'idle',
    battery: 90,
    signal: 100,
    velocity: 75, 
    health: 12,
    hsm: true,
    attitude: {
      roll: 45,
      pitch: 120,
      yaw: 90
    },
    location: [210.668, 159.549],
    ...defaultAgentData
  },
  {
    id: 202409151505432,
    name: 'amr2_blue',
    currentTask: 'Status robot',
    plant: 'Robot plant',
    status: 'active',
    battery: 70,
    signal: 100,
    velocity: 75, 
    health: 12,
    hsm: false,
    attitude: {
      roll: 45,
      pitch: 120,
      yaw: 90
    },
    location: [313.383, 176.510],
    ...defaultAgentData
  },
  {
    id: 202409151505053,
    name: 'amr3_blue',
    currentTask: 'Status robot',
    plant: 'Robot plant',
    status: 'offline',
    battery: 18,
    signal: 5,
    velocity: 75, 
    health: 12,
    hsm: false,
    attitude: {
      roll: 45,
      pitch: 120,
      yaw: 90
    },
    location: null,
    ...defaultAgentData
  },
  {
    id: 202409151505842,
    name: 'amr4',
    currentTask: 'Status robot',
    plant: 'Robot plant',
    status: 'active',
    battery: 100,
    signal: 100,
    velocity: 75, 
    health: 12,
    hsm: true,
    attitude: {
      roll: 45,
      pitch: 120,
      yaw: 90
    },
    location: [354.413, 221.167],
    ...defaultAgentData
  },
  {
    id: 202409151505284,
    name: 'amr_2021',
    currentTask: 'Status robot',
    plant: 'Robot plant',
    status: 'offline',
    battery: 100,
    signal: 100,
    velocity: 75, 
    health: 12,
    hsm: false,
    attitude: {
      roll: 45,
      pitch: 120,
      yaw: 90
    },
    location: null,
    ...defaultAgentData
  }
];

class DummyAgentGenerator {
  private agents: Agent[];
  private agentUpdateCallbacks: OnAgentUpdateCallback[];

  constructor() {
    this.agents = dummyAgents;
    this.agentUpdateCallbacks = [];

    this.reduceAgentsBattery();
  }

  public getAllAgents() {
    return this.agents;
  }

  public getAgent(agentId: number) {
    return this.agents.find((a) => a.id === agentId) ?? null;
  }

  public onAgentUpdate(cb: OnAgentUpdateCallback) {
    this.agentUpdateCallbacks.push(cb);
  }

  private emitAgentUpdate(agentId: number, newAgentData: object) {
    for (const agentUpdateCb of this.agentUpdateCallbacks) {
      agentUpdateCb(agentId, newAgentData);
    }
  }

  // imitate battery reduction for agents
  private reduceAgentsBattery() {
    for (const agent of this.agents) {
      setInterval(() => {
        if (agent.battery <= 5) {
          agent.battery = 100;
        } else {
          agent.battery -= 5;
        }
        this.emitAgentUpdate(agent.id, { battery: agent.battery });
      }, 1000);
    }
  }  
}

export default DummyAgentGenerator;
