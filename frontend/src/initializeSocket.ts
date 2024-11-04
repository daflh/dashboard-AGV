import { io } from 'socket.io-client';
import { useMainStore } from '@/stores/main';
import { Agent, AgentCondition } from '@/types/agent';
// import { SlamMap } from '@/types/slam';

function getBackendLocation() {
  const { protocol, host } = window.location;
  const isProd = import.meta.env['PROD'];
  const backendPort = import.meta.env['VITE_BACKEND_PORT'] ?? '8001';
  const backendLocation = isProd
    ? `${protocol}//${host}`
    : `${protocol}//${host.split(':')[0]}:${backendPort}`;

  return backendLocation;
}

function initializeSocket() {
  const socket = io(getBackendLocation());
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

  // uncomment this block of code to show the dummy map
  // socket.emit('slamMap:get', (slamMapData: any) => {
  //   if (slamMapData !== null) {
  //     mainStore.slamMap = slamMapData;
  //   }
  // });

  mainStore.socket = socket;
}

export default initializeSocket;
