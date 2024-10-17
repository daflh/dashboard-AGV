import mysql from 'mysql2/promise';
import { AgentConfiguration } from '../models/agent';
import dotenv from 'dotenv';

dotenv.config();

class DatabaseService {
  private pool: mysql.Pool | null;

  constructor() {
    try {
      // Create a connection pool to the MySQL database using environment variables
      this.pool = mysql.createPool({
        host: process.env.DB_HOST, // Load from .env
        user: process.env.DB_USER, // Load from .env
        password: process.env.DB_PASSWORD, // Load from .env
        database: process.env.DB_NAME, // Load from .env
        connectionLimit: 10,
        queueLimit: 0,
      });
    } catch (err) {
      console.error('Error connecting to MySQL database:', err);
      this.pool = null;
    }
  }

  // Method to fetch agents from the database
  public async getAgents(): Promise<AgentConfiguration[]> {
    if (!this.pool) return [];

    try {
      const [rows] = await this.pool.query<mysql.RowDataPacket[]>('SELECT * FROM agents');
      const agents: AgentConfiguration[] = []
      rows.forEach((row) => {
        agents.push({
          id: row.id,
          name: row.name,
          description: row.description,
          ipAddress: row.ip_address, // IPv4
          hsmKey: row.hsm_key,
          siteId: row.site_id,
          companyId: row.company_id,
          lastMaintenance: row.last_maintenance // unix timestamp
        })
      })
      return agents; 
    } catch (error) {
      console.error('Error fetching agents:', error);
      throw error;
    }
  }

  public closePool() {
    if (!this.pool) return;
    this.pool.end();
  }
}

export default DatabaseService;

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
