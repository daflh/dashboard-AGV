import { io } from 'socket.io-client';
import { useMainStore } from '@/stores/main';
import Agent from '@/types/Agent';

const HOSTNAME = window.location.host.split(':')[0];

function initializeSocket() {
  const socket = io(`http://${HOSTNAME}:5001`);
  const mainStore = useMainStore();

  socket.emit('agent:get_all', (agentsData: Agent[]) => {
    mainStore.agentsData = agentsData;
  });

  socket.on('agent:updated', (agentId: number, agentData: object) => {
    const agentIndex = mainStore.agentsData.findIndex((a) => a.id === agentId);
    if (agentIndex !== -1) {
      mainStore.agentsData[agentIndex] = {
        ...mainStore.agentsData[agentIndex],
        ...agentData
      }
    }
  });

  mainStore.socket = socket;
}

export default initializeSocket;
