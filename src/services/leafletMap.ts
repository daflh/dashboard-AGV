import L from 'leaflet';
import slamMapUrl from '@/assets/images/slam_example.png';

const slamMapRes = [1596, 1010]; // hard-coded slam map resolution

class LeafletMap {
  map: L.Map | null;
  isInitialized: boolean;
  
  constructor() {
    this.map = null;
    this.isInitialized = false;
  }

  initializeMap() {
    this.map = L.map('leaflet-map', {
      crs: L.CRS.Simple, // use flat surface (x y) coordinate
      attributionControl: false,
      zoomControl: false
    });

    // set map view to center of the map
    this.map.setView([0, 0], 10);

    // add zoom in/out control
    L.control.zoom({ position: 'bottomright' }).addTo(this.map);

    // add slam mapping result to the map and set as center point
    const latLngBounds = L.latLngBounds([
      [0, 0],
      [-slamMapRes[1]/1000, slamMapRes[0]/1000] // coord divide by 1000
    ]);
    this.map.addLayer(L.imageOverlay(slamMapUrl, latLngBounds));
    this.map.setView(latLngBounds.getCenter());

    this.isInitialized = true;
  }
}

const leafletMap = new LeafletMap();

export default leafletMap;
