export type Coordinates = {
  latitude: number;
  longitude: number;
};

export function distanceKmBetween(from: Coordinates, to: Coordinates) {
  const earthRadiusKm = 6371;
  const latDelta = toRadians(to.latitude - from.latitude);
  const lngDelta = toRadians(to.longitude - from.longitude);
  const fromLat = toRadians(from.latitude);
  const toLat = toRadians(to.latitude);

  const haversine =
    Math.sin(latDelta / 2) ** 2 +
    Math.cos(fromLat) * Math.cos(toLat) * Math.sin(lngDelta / 2) ** 2;

  return Math.round(earthRadiusKm * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine)));
}

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}
