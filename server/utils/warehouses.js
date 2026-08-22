// Four regional warehouses spread across real, distinct areas of the Kathmandu Valley
// (north/south/east/west), plus a computed "main" warehouse at their geometric center.
// No live GPS tracking - this just determines which warehouse is nearest to a
// customer's delivery point, once, at order time.

const WAREHOUSES = [
  { name: 'Boudha Warehouse', lat: 27.7215, lng: 85.3620 },      // East
  { name: 'Kalanki Warehouse', lat: 27.6939, lng: 85.2820 },     // West
  { name: 'Koteshwor Warehouse', lat: 27.6789, lng: 85.3486 },   // South
  { name: 'Budhanilkantha Warehouse', lat: 27.7809, lng: 85.3617 }, // North
];

function computeCentroid(points) {
  const lat = points.reduce((sum, p) => sum + p.lat, 0) / points.length;
  const lng = points.reduce((sum, p) => sum + p.lng, 0) / points.length;
  return { lat, lng };
}

const MAIN_WAREHOUSE = {
  name: 'Main Warehouse',
  ...computeCentroid(WAREHOUSES),
};

// Haversine formula - real-world great-circle distance in km between two lat/lng points
function haversineKm(a, b) {
  const R = 6371; // Earth radius in km
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  return R * c;
}

// Given a customer's delivery point, find the nearest of the 4 regional warehouses.
function findNearestWarehouse(customerPoint) {
  let nearest = null;
  let minDist = Infinity;
  for (const wh of WAREHOUSES) {
    const dist = haversineKm(customerPoint, wh);
    if (dist < minDist) {
      minDist = dist;
      nearest = wh;
    }
  }
  return { warehouse: nearest, distanceKm: minDist };
}

module.exports = { WAREHOUSES, MAIN_WAREHOUSE, haversineKm, findNearestWarehouse };
