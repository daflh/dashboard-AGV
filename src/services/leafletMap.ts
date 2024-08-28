import L from 'leaflet';

class LeafletMap {
  map: L.Map | null;
  isInitialized: boolean;
  
  constructor() {
    this.map = null;
    this.isInitialized = false;
  }

  initializeMap() {
    this.map = L.map('leaflet-map').setView([51.505, -0.09], 13);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(this.map);

    this.isInitialized = true;
  }
}

const leafletMap = new LeafletMap();

export default leafletMap;
