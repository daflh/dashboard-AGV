import L from 'leaflet';

// credits: github.com/bbecquet/Leaflet.RotatedMarker
const AgentMarkerLayer = L.Marker.extend({
  options: {
    rotationAngle: 0,
    rotationOrigin: 'center center'
  },
  _setPos: function(pos) {
    L.Marker.prototype._setPos.call(this, pos);
    this._applyRotation();
  },
  _applyRotation: function() {
    if (this.options.rotationAngle) {
      this._icon.style[L.DomUtil.TRANSFORM + 'Origin'] = this.options.rotationOrigin;
      this._icon.style[L.DomUtil.TRANSFORM] += ' rotateZ(' + this.options.rotationAngle + 'deg)';
    }
  },
  setRotationAngle: function(angle) {
    this.options.rotationAngle = angle;
    this.update();
    return this;
  },
  setRotationOrigin: function(origin) {
    this.options.rotationOrigin = origin;
    this.update();
    return this;
  }
});

export default AgentMarkerLayer;
