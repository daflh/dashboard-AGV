import { EventEmitter } from 'events';
import { AgentConfiguration, AgentCondition } from "../models/agent";

type OnAgentUpdateCallback = (agentId: number, agentData: AgentCondition) => void;

interface AgentData extends AgentConfiguration {
  condition?: AgentCondition;
}

const dummyAgents: AgentData[] = [
  {
    id: 202409151505924,
    name: 'amr_new',
    description: '',
    ipAddress: null,
    hsmKey: null,
    siteId: 1,
    companyId: 1,
    lastMaintenance: -1,
    condition: {
      status: 'idle',
      position: [210.668, 159.549]
    }
  },
  {
    id: 202409151505432,
    name: 'amr2_blue',
    description: '',
    ipAddress: null,
    hsmKey: null,
    siteId: 1,
    companyId: 1,
    lastMaintenance: -1,
    condition: {
      status: 'active',
      battery: 100,
      position: [313.383, 176.510]
    }
  },
  {
    id: 202409151505053,
    name: 'amr3_blue',
    description: '',
    ipAddress: null,
    hsmKey: null,
    siteId: 1,
    companyId: 1,
    lastMaintenance: -1,
    condition: {
      status: 'active',
      battery: 18
    }
  },
  {
    id: 202409151505842,
    name: 'amr4',
    description: '',
    ipAddress: null,
    hsmKey: null,
    siteId: 1,
    companyId: 1,
    lastMaintenance: -1,
    condition: {
      status: 'active',
      position: [354.413, 221.167]
    }
  },
  {
    id: 202409151505284,
    name: 'amr_2021',
    description: '',
    ipAddress: null,
    hsmKey: null,
    siteId: 1,
    companyId: 1,
    lastMaintenance: -1,
    condition: {
      status: 'offline',
    }
  }
];

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

class DummyAgentsGenerator {
  private agents: AgentConfiguration[];
  private eventEmitter: EventEmitter;

  constructor() {
    this.agents = dummyAgents.map((a) => {
      a = { ...a }; // prevent mutating the original object
      delete a.condition;
      return a;
    });
    this.eventEmitter = new EventEmitter();

    this.simulateAgentDynamics();
  }

  public getAgents() {
    return this.agents;
  }

  public onAgentUpdate(cb: OnAgentUpdateCallback) {
    this.eventEmitter.on('agentUpdate', cb);
  }

  public requestAgentsCondition() {
    for (const agent of dummyAgents) {
      if (agent.condition) {
        this.eventEmitter.emit('agentUpdate', agent.id, agent.condition);
      }
    }
  }

  // imitate battery reduction for agents
  private simulateAgentDynamics() {
    for (const agent of dummyAgents) {
      if (!agent.condition) agent.condition = {};
      if (!agent.condition.battery) agent.condition.battery = 100;

      setInterval(() => {
        if (!agent.condition || agent.condition.battery === undefined) return;

        if (agent.condition.battery <= 5) {
          agent.condition.battery = 100;
        } else {
          agent.condition.battery -= randomInt(1, 5);
        }

        this.eventEmitter.emit('agentUpdate', agent.id, { battery: agent.condition.battery });
      }, 1000);
    }
  }  
}

export default DummyAgentsGenerator;
