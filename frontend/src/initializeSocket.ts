import { io } from 'socket.io-client';
import { useMainStore } from '@/stores/main';
import { Agent, AgentCondition } from '@/types/agent';
// import { SlamMap } from '@/types/slam';

const HOSTNAME = window.location.host.split(':')[0];

function initializeSocket() {
  const socket = io(`http://${HOSTNAME}:5001`);
  const mainStore = useMainStore();

  socket.emit('agent:getAll', (agentsData: Agent[]) => {
    mainStore.agents = agentsData;
  });

  socket.on('agent:updated', (agentId: number, agentData: AgentCondition) => {
    const agentIndex = mainStore.agents.findIndex((a) => a.id === agentId);
    if (agentIndex !== -1) {
      mainStore.agents[agentIndex] = {
        ...mainStore.agents[agentIndex],
        ...agentData
      }
    }
  });

  socket.on('agent:mapUpdated', (agentId: number, mapData) => {
    mainStore.slamMap = mapData;
  });

  // socket.emit('slamMap:get', (slamMapData: SlamMap | null) => {
  //   if (slamMapData !== null) {
  //     mainStore.slamMap = slamMapData;
  //   }
  // });

  mainStore.socket = socket;
}

export default initializeSocket;
