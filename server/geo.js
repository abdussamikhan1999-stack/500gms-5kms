// Pure geo math — no I/O, no framework imports. Mirrors this account's other
// projects' split between pure decision logic and the I/O that feeds it.

const EARTH_RADIUS_KM = 6371;

function toRadians(deg) {
  return (deg * Math.PI) / 180;
}

// Haversine great-circle distance in km between two lat/lng points.
function distanceKm(a, b) {
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

function isWithinRadiusKm(storeLocation, customerLocation, radiusKm) {
  return distanceKm(storeLocation, customerLocation) <= radiusKm;
}

module.exports = { distanceKm, isWithinRadiusKm };
