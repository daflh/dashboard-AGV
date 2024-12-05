import L from 'leaflet';
import AgentMarkerLayer from "./agentMarkerLayer";
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

  public setAgentMarker(agentId: number, position: Position2D, heading: number) {
    if (!this.layerGroup) return;

    if (this.agents[agentId]) {
      const markerLayer = this.layerGroup.getLayer(this.agents[agentId]) as AgentMarkerLayer;
      markerLayer?.setLatLng(position);
      markerLayer?.setRotationAngle(heading);
    } else {
      const flippedPosition: [number, number] = [position[1], position[0]];
      const markerLayer = new AgentMarkerLayer(
        flippedPosition,
        { icon: amrIcon, rotationAngle: heading }
      ).addTo(this.layerGroup);

      // const svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      // svgElement.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      // svgElement.setAttribute('viewBox', '0 0 34 49');
      // svgElement.setAttribute('fill', '#EEC522');
      // svgElement.setAttribute('stroke', '#000000');
      // svgElement.setAttribute('style', 'transform:rotate(45deg)');
      // svgElement.innerHTML = '<path d="M30.0227 42.9091V30.0227H32H32.75V29.2727V18.3636V17.6136H32H30.0227L30.0227 10.1818C30.0227 7.75776 28.4382 5.51116 26.1025 3.90835C23.7491 2.29341 20.5311 1.25 17 1.25C13.4688 1.25 10.2509 2.29341 7.89751 3.90835C5.56182 5.51116 3.97727 7.75777 3.97727 10.1818V17.6136H2H1.25V18.3636V29.2727V30.0227H2H3.97727V42.9091V43.6591H4.72727H6.71283L6.75005 47.0083L6.75829 47.75H7.45455H7.5H19.7273H20.0379L20.2576 47.5303L24.1288 43.6591H29.2727H30.0227V42.9091ZM10.9318 14.8864V9.86123C12.7436 8.97886 14.8077 8.20455 17 8.20455C19.1923 8.20455 21.2564 8.97886 23.0682 9.86123V14.8864H10.9318Z" stroke-width="1.5" stroke-miterlimit="16"/>';
      // const svgElementBounds = [[0, 0], [4.9, 3.4]] as L.LatLngBoundsLiteral;
      // L.svgOverlay(svgElement, svgElementBounds).addTo(this.layerGroup);

      this.agents[agentId] = this.layerGroup.getLayerId(markerLayer);
    }
  }
}

const agentMarker = new AgentMarker();

export default agentMarker;
