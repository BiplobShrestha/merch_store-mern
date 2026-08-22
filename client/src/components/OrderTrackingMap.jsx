import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, CircleMarker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const mainIcon = L.divIcon({
  className: 'warehouse-marker-icon',
  html: '<div class="warehouse-marker-main"></div>',
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

const assignedIcon = L.divIcon({
  className: 'warehouse-marker-icon',
  html: '<div class="warehouse-marker-assigned"></div>',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

const customerIcon = L.divIcon({
  className: 'location-pin-icon',
  html: '<div class="location-pin-dot"></div>',
  iconSize: [24, 24],
  iconAnchor: [12, 24],
});

// Fetch a real road-following route from OSRM's free public demo server.
// Falls back to a straight line if the request fails for any reason.
async function fetchRoadRoute(from, to) {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    const data = await res.json();
    const coords = data?.routes?.[0]?.geometry?.coordinates;
    if (coords) return coords.map(([lng, lat]) => [lat, lng]);
  } catch (err) {
    // fall through to straight line
  }
  return [[from.lat, from.lng], [to.lat, to.lng]];
}

export default function OrderTrackingMap({ data }) {
  const [mainToAssignedRoute, setMainToAssignedRoute] = useState(null);
  const [assignedToCustomerRoute, setAssignedToCustomerRoute] = useState(null);

  const mainWarehouse = data?.mainWarehouse;
  const assignedWarehouse = data?.assignedWarehouse;
  const deliveryLocation = data?.deliveryLocation;

  useEffect(() => {
    if (!mainWarehouse || !assignedWarehouse) return;
    fetchRoadRoute(mainWarehouse, assignedWarehouse).then(setMainToAssignedRoute);
  }, [mainWarehouse, assignedWarehouse]);

  useEffect(() => {
    if (!assignedWarehouse || !deliveryLocation) return;
    fetchRoadRoute(assignedWarehouse, deliveryLocation).then(setAssignedToCustomerRoute);
  }, [assignedWarehouse, deliveryLocation]);

  if (!mainWarehouse || !assignedWarehouse) {
    return <div className="tracking-empty">Warehouse info not available for this order.</div>;
  }

  const mainPos = [mainWarehouse.lat, mainWarehouse.lng];
  const assignedPos = [assignedWarehouse.lat, assignedWarehouse.lng];
  const customerPos = deliveryLocation ? [deliveryLocation.lat, deliveryLocation.lng] : null;
  const distanceToWarehouseKm = data?.distanceToWarehouseKm;

  return (
    <div className="tracking-map-wrap">
      <MapContainer center={assignedPos} zoom={12} scrollWheelZoom={false} className="tracking-leaflet-map">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Main warehouse -> assigned regional warehouse, following real roads */}
        <Polyline
          positions={mainToAssignedRoute || [mainPos, assignedPos]}
          pathOptions={{ color: '#9fe030', weight: 5, opacity: 0.9 }}
        />

        {/* assigned warehouse -> customer, following real roads (dashed, informational) */}
        {customerPos && (
          <Polyline
            positions={assignedToCustomerRoute || [assignedPos, customerPos]}
            pathOptions={{ color: '#b7afe0', weight: 3, dashArray: '6 6', opacity: 0.85 }}
          />
        )}

        <Marker position={mainPos} icon={mainIcon}>
          <Popup>{mainWarehouse.name}</Popup>
        </Marker>
        <Marker position={assignedPos} icon={assignedIcon}>
          <Popup>{assignedWarehouse.name} (assigned)</Popup>
        </Marker>
        {customerPos && (
          <Marker position={customerPos} icon={customerIcon}>
            <Popup>Delivery location</Popup>
          </Marker>
        )}
      </MapContainer>

      <div className="tracking-legend">
        <span className="legend-item"><span className="legend-swatch legend-main" /> Main Warehouse</span>
        <span className="legend-item"><span className="legend-swatch legend-assigned" /> Nearest Warehouse (assigned to this order)</span>
        <span className="legend-item"><span className="legend-swatch legend-pin" /> Your delivery location</span>
      </div>

      <div className="tracking-status-row">
        <span className="tracking-stage-badge stage-leg2">Dispatched from {assignedWarehouse.name}</span>
        {typeof distanceToWarehouseKm === 'number' && (
          <span className="tracking-eta">{distanceToWarehouseKm.toFixed(1)} km from warehouse to you</span>
        )}
      </div>
    </div>
  );
}
