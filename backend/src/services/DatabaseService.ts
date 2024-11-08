import { PrismaClient } from '@prisma/client';
import { AgentConfiguration } from '../models/agent';

export default class DatabaseService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  // Fetch all agents from the database
  public async getAgents(): Promise<AgentConfiguration[]> {
    try {
      const agents = await this.prisma.agents.findMany();
      return agents.map((agent: any) => ({
        id: agent.id,
        name: agent.name ?? "",                   
        description: agent.description ?? "",      
        ipAddress: agent.ip_address ?? "127.0.0.1",
        hsmKey: agent.hsm_key ?? null,             
        siteId: agent.site_id,
        companyId: agent.company_id ?? 1,         
        lastMaintenance: agent.last_maintenance?.getTime() ?? 0, 
      }));
    } catch (error) {
      console.error('Error fetching agents:', error);
      throw error;
    }
  }

  // Add a new agent to the database
  public async addAgent(agent: AgentConfiguration): Promise<void> {
    try {
      await this.prisma.agents.create({
        data: {
          name: agent.name,
          description: agent.description || "",
          ip_address: agent.ipAddress ?? "",
          hsm_key: agent.hsmKey || null,
          site_id: agent.siteId || 1, //masih kukasih default 1, karena nanti dibikin dropdown                     
          company_id: agent.companyId || 1,           
          last_maintenance: agent.lastMaintenance ? new Date(agent.lastMaintenance) : new Date(),
          next_maintenance: new Date(),
        },
      });
      console.log('Agent added successfully');
    } catch (error) {
      console.error('Error adding new agent:', error);
      throw error;
    }
  }

  // Edit an existing agent in the database
  public async editAgent(agent: AgentConfiguration): Promise<void> {
    try {
      const result = await this.prisma.agents.update({
        where: { id: agent.id },
        data: {
          name: agent.name,
          description: agent.description || "",
          ip_address: agent.ipAddress ?? "", 
          hsm_key: agent.hsmKey || null,
          site_id: agent.siteId,                      
          company_id: agent.companyId || 1,         
          last_maintenance: agent.lastMaintenance ? new Date(agent.lastMaintenance) : null,
          next_maintenance: new Date(),
        },
      });

      if (!result) {
        console.warn(`No agent found with id ${agent.id}`);
      } else {
        console.log(`Agent with id ${agent.id} successfully updated`);
      }
    } catch (error) {
      console.error('Error updating agent:', error);
      throw error;
    }
  }

  // Method to delete an agent by ID
  public async deleteAgent(agentId: number): Promise<void> {
    try {
      await this.prisma.agents.delete({
        where: { id: agentId },
      });
      console.log(`Agent with ID ${agentId} deleted successfully.`);
    } catch (error) {
      console.error(`Error deleting agent with ID ${agentId}:`, error);
      throw error;
    }
  }

  // Fetch a user by username
  public async getUser(username: string) {
    try {
      const user = await this.prisma.users.findUnique({
        where: { username },
      });
      if (!user) {
        console.warn(`User with username "${username}" not found.`);
        return null;
      }
      return user;
    } catch (error) {
      console.error(`Error fetching user with username "${username}":`, error);
      throw error;
    }
  }

  // Close the Prisma client connection
  public async closeConnection() {
    await this.prisma.$disconnect();
  }
}




// import { AgentConfiguration, AgentCondition } from "../models/agent";

// interface AgentData extends AgentConfiguration {
//   condition?: AgentCondition;
// }

// // temporary "real" agents data
// const agents: AgentData[] = [
//   {
//     id: 202409151505235,
//     name: 'green',
//     description: '',
//     ipAddress: '127.0.0.1',
//     hsmKey: null,
//     siteId: 1,
//     companyId: 1,
//     lastMaintenance: -1
//   },
//   {
//     id: 202409151505123,
//     name: 'black',
//     description: '',
//     ipAddress: '192.168.2.8',
//     hsmKey: null,
//     siteId: 1,
//     companyId: 1,
//     lastMaintenance: -1
//   }
// ];

// // TODO: implement the MySQL database service
// class DatabaseService {
//   constructor() {}

//   public getAgents() {
//     return agents;
//   }
// }

// export default DatabaseService;
