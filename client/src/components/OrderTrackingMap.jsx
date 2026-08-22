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

export default function OrderTrackingMap({ data }) {
  if (!data || !data.mainWarehouse || !data.assignedWarehouse) {
    return <div className="tracking-empty">Warehouse info not available for this order.</div>;
  }

  const { mainWarehouse, assignedWarehouse, deliveryLocation, distanceToWarehouseKm } = data;
  const mainPos = [mainWarehouse.lat, mainWarehouse.lng];
  const assignedPos = [assignedWarehouse.lat, assignedWarehouse.lng];
  const customerPos = deliveryLocation ? [deliveryLocation.lat, deliveryLocation.lng] : null;

  const center = assignedPos;

  return (
    <div className="tracking-map-wrap">
      <MapContainer center={center} zoom={12} scrollWheelZoom={false} className="tracking-leaflet-map">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Main warehouse -> assigned regional warehouse, the dispatch route */}
        <Polyline positions={[mainPos, assignedPos]} pathOptions={{ color: '#5a8f00', weight: 4 }} />

        {/* assigned warehouse -> customer, last-mile (dashed, informational only) */}
        {customerPos && (
          <Polyline positions={[assignedPos, customerPos]} pathOptions={{ color: '#8a8474', weight: 2, dashArray: '5 6' }} />
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

      <div className="tracking-status-row">
        <span className="tracking-stage-badge stage-leg2">Dispatched from {assignedWarehouse.name}</span>
        {typeof distanceToWarehouseKm === 'number' && (
          <span className="tracking-eta">{distanceToWarehouseKm.toFixed(1)} km from warehouse to you</span>
        )}
      </div>
    </div>
  );
}
