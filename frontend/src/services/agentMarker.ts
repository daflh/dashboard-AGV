import L from 'leaflet';
import { Position2D } from "@/types/agent"
import amrImage from "@/assets/images/amr.png"

interface AgentsMarkerLayerId {
  [id: number]: number
}

const amrIcon = L.icon({
  iconUrl: amrImage,
  iconSize: [48/3, 70/3],
  iconAnchor: [24/3, 35/3]
});

class AgentMarker {
  private layerGroup: L.LayerGroup | null;
  private agents: AgentsMarkerLayerId;

  constructor() {
    this.layerGroup = null;
    this.agents = {};
  }

  public setLayerGroup(layerGroup: L.LayerGroup) {
    this.layerGroup = layerGroup;
  }

  public setAgentMarker(agentId: number, position: Position2D) {
    if (!this.layerGroup) return;

    if (this.agents[agentId]) {
      const markerLayer = this.layerGroup.getLayer(this.agents[agentId]) as L.Marker;
      markerLayer?.setLatLng(position);
    } else {
      const flippedPosition: [number, number] = [position[1], position[0]];
      const markerLayer = L.marker(
        flippedPosition,
        { icon: amrIcon }
      ).addTo(this.layerGroup);

      this.agents[agentId] = this.layerGroup.getLayerId(markerLayer);
    }
  }
}

const agentMarker = new AgentMarker();

export default agentMarker;
