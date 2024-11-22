import L from 'leaflet';
import agentMarker from '@/services/agentMarker';
import { Agent } from '@/types/agent';
import { SlamMap } from '@/types/slam';

class LeafletMap {
  public map: L.Map | null;
  private slamMapLayer: L.ImageOverlay;
  private agentsLayerGroup: L.LayerGroup;
  
  constructor() {
    this.map = null;
    this.slamMapLayer = L.imageOverlay('', [[0, 0], [0, 0]], {
      className: 'slam-map'
    });
    this.agentsLayerGroup = L.layerGroup();
    agentMarker.setLayerGroup(this.agentsLayerGroup);
  }

  public initializeMap() {
    // set bottom right as (0, 0)
    const SimpleCRSMod = L.extend({}, L.CRS.Simple, {
      transformation: L.transformation(-1, 0, -1, 0)
    });

    this.map = L.map('leaflet-map', {
      crs: SimpleCRSMod, // use flat surface (x y) coordinate
      attributionControl: false,
      zoomControl: false
    });

    this.map.setView([0, 0], 6);

    // coordinate (0, 0) marker
    L.polyline([[0, 0], [0, 0.25]], { color: 'green', weight: 1 }).addTo(this.map)
    L.polyline([[0.25, 0], [0, 0]], { color: 'blue', weight: 1 }).addTo(this.map)

    // add zoom in/out control
    L.control.zoom({ position: 'bottomright' }).addTo(this.map);

    this.slamMapLayer.addTo(this.map);
    this.agentsLayerGroup.addTo(this.map);
  }

  public setSlamMap(slamMapData: SlamMap) {
    if (!this.map) {
      console.error('Leaflet map is not initialized');
      return;
    }
    
    const slamMapBounds = L.latLngBounds([
      [
        slamMapData.origin[0],
        slamMapData.origin[1]
      ],
      [
        slamMapData.width * slamMapData.resolution + slamMapData.origin[0],
        slamMapData.height * slamMapData.resolution + slamMapData.origin[1]
      ]
    ]);
    const slamMapImg = 'data:image/png;base64,' + slamMapData.content;
    this.slamMapLayer.setBounds(slamMapBounds);
    this.slamMapLayer.setUrl(slamMapImg);
  }

  public setAgents(agents: Agent[]) {
    if (!this.map) {
      console.error('Leaflet map is not initialized');
      return;
    }

    // remove previous agents layer before adding new layers
    this.agentsLayerGroup.clearLayers();

    agents.forEach((agent) => {
      if (agent.position) {
        agentMarker.setAgentMarker(agent.id, agent.position);
      }
    });
  }
}

const leafletMap = new LeafletMap();

export default leafletMap;
