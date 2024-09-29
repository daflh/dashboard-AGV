import { AgentConfiguration, AgentCondition } from "../models/agent";

interface AgentData extends AgentConfiguration {
  condition?: AgentCondition;
}

// temporary "real" agents data
const agents: AgentData[] = [
  {
    id: 202409151505235,
    name: 'green',
    description: '',
    ipAddress: '127.0.0.1',
    hsmKey: null,
    siteId: 1,
    companyId: 1,
    lastMaintenance: -1
  },
  {
    id: 202409151505123,
    name: 'black',
    description: '',
    ipAddress: '192.168.2.8',
    hsmKey: null,
    siteId: 1,
    companyId: 1,
    lastMaintenance: -1
  }
];

// TODO: implement the MySQL database service
class DatabaseService {
  constructor() {}

  public getAgents() {
    return agents;
  }
}

export default DatabaseService;
