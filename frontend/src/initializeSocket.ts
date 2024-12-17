import { io } from 'socket.io-client';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import agentMarker from '@/services/agentMarker';
import { useMainStore } from '@/stores/main';
import { setJwtToken } from '@/utils';
import { Agent, AgentCondition } from '@/types/agent';
// import { SlamMap } from '@/types/slam';

function initializeSocket() {
  const toast = useToast();
  const router = useRouter();
  const mainStore = useMainStore();

  const socket = io(mainStore.backendUrl, {
    auth: { token: mainStore.jwtToken }
  });

  socket.on('connect_error', (err) => {
    if (err.message === 'xhr poll error') return;

    toast.add({
      severity: 'error',
      summary: 'JWT verification failed',
      detail: err.message + '\nRedirecting to login page...',
      life: 3000
    });

    setTimeout(() => {
      setJwtToken(null);
      router.push('/login');
    }, 3000);
  });

  socket.emit('agent:getAll', (agentsData: Agent[]) => {
    mainStore.agents = agentsData;
    mainStore.isAgentsLoaded = true;
  });

  socket.emit('site:getAll', (sitesData) => {
    mainStore.sites = sitesData.map((site) => ({ label: site.name, value: site.id }));
  });

  socket.on('agent:updated', (agentId: number, agentData: AgentCondition) => {
    const agentIndex = mainStore.agents.findIndex((a) => a.id === agentId);
    if (agentIndex !== -1) {
      mainStore.agents[agentIndex] = {
        ...mainStore.agents[agentIndex],
        ...agentData
      };

      if (mainStore.agents[agentIndex]?.position) {
        agentMarker.setAgentMarker(
          agentId,
          mainStore.agents[agentIndex].position!,
          mainStore.agents[agentIndex].heading ?? 0
        );
      }
    }
  });

  socket.on('agent:mapUpdated', (agentId: number, mapData) => {
    if (mapData.type === 'static') {
      mainStore.slamMap = mapData;
    } else if (mapData.type === 'globalCostmap') {
      mainStore.costMap = mapData;
    }
  });

  socket.on('staticMap:response', (map) => {
    if (map.data) {
      mainStore.slamMap = map.data;
      
      toast.add({
        severity: 'info',
        summary: 'Static map received',
        detail: 'Map name: ' + map.name,
        life: 3000
      });
    } else {
      toast.add({
        severity: 'error',
        summary: 'Static map not available',
        detail: 'Map name: ' + map.name,
        life: 3000
      });
    }
  });

  mainStore.socket = socket;
}

export default initializeSocket;
