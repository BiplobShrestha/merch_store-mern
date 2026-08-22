import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const KATHMANDU_CENTER = [27.7172, 85.3240];

const pinIcon = L.divIcon({
  className: 'location-pin-icon',
  html: '<div class="location-pin-dot"></div>',
  iconSize: [24, 24],
  iconAnchor: [12, 24],
});

function ClickCapture({ onPick }) {
  useMapEvents({
    click(e) {
      onPick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

export default function LocationPicker({ value, onChange }) {
  const [hasPicked, setHasPicked] = useState(!!value);

  const handlePick = (point) => {
    setHasPicked(true);
    onChange(point);
  };

  return (
    <div className="location-picker">
      <MapContainer center={KATHMANDU_CENTER} zoom={12} scrollWheelZoom={false} className="location-picker-map">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickCapture onPick={handlePick} />
        {hasPicked && value && <Marker position={[value.lat, value.lng]} icon={pinIcon} />}
      </MapContainer>
      <p className="location-picker-hint">
        {hasPicked ? `Pin set at ${value.lat.toFixed(4)}, ${value.lng.toFixed(4)}` : 'Click on the map to set your delivery location'}
      </p>
    </div>
  );
}
