import L from 'leaflet';

interface AgentMarkerLayerOptions extends L.MarkerOptions {
  rotationAngle?: number | undefined;
  rotationOrigin?: string | undefined;
}

class AgentMarkerLayer extends L.Marker {
  constructor(latlng: LatLngExpression, options?: AgentMarkerLayerOptions);
  setRotationAngle(angle: number): this;
  setRotationOrigin(origin: string): this;

  options: AgentMarkerLayerOptions;
}

export default AgentMarkerLayer;
