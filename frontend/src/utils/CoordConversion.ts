type LeafletCoord = [lat: number, lng: number, alt?: number];
type SlamCoord = [x: number, y: number];

// coordinate conversion utils
// TODO: account for map resolution & origin
export default class CoordConversion {
  static leafletToSlam(leafletCoord: LeafletCoord): SlamCoord {
    return [leafletCoord[1] * 1000, leafletCoord[0] * 1000];
  }

  static slamToLeaflet(slamCoord: SlamCoord): LeafletCoord {
    return [slamCoord[1] / 1000, slamCoord[0] / 1000];
  }
}
