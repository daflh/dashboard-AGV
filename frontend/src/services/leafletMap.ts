import L from 'leaflet';
import CoordConversion from '@/utils/CoordConversion';
import { SlamMap, Agent } from '@/types';

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
  }

  public initializeMap() {
    this.map = L.map('leaflet-map', {
      crs: L.CRS.Simple, // use flat surface (x y) coordinate
      attributionControl: false,
      zoomControl: false
    });

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
      [0, 0],
      CoordConversion.slamToLeaflet([slamMapData.width, slamMapData.height])
    ]);
    const slamMapImg = 'data:image/png;base64,' + slamMapData.content;
    this.slamMapLayer.setBounds(slamMapBounds);
    this.slamMapLayer.setUrl(slamMapImg);
    
    // set view to the center of SLAM map
    this.map.setView(slamMapBounds.getCenter(), 10);
  }

  public setAgents(agents: Agent[]) {
    if (!this.map) {
      console.error('Leaflet map is not initialized');
      return;
    }

    // remove previous agents layer before adding new layers
    this.agentsLayerGroup.clearLayers();

    agents.forEach((agent) => {
      if (agent.location) {
        L.circle(CoordConversion.slamToLeaflet(agent.location), {
          radius: 0.0025,
          color: 'red',
          weight: 3,
          fillColor: 'transparent'
        }).addTo(this.agentsLayerGroup);
      }
    });
  }
}

const leafletMap = new LeafletMap();

export default leafletMap;
