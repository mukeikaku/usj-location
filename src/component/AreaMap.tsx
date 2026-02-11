"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Polygon, CircleMarker, Tooltip, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

type Coord = { lat: number; lng: number };

function FitBounds({ polygon, marker }: { polygon: Coord[]; marker?: Coord }) {
  const map = useMap();
  useEffect(() => {
    const points: [number, number][] = polygon.map((c) => [c.lat, c.lng]);
    if (marker) points.push([marker.lat, marker.lng]);
    if (points.length > 0) {
      map.fitBounds(points, { padding: [30, 30] });
    }
  }, [map, polygon, marker]);
  return null;
}

export default function AreaMap({
  polygon,
  marker,
}: {
  polygon: Coord[];
  marker?: Coord;
}) {
  const positions: [number, number][] = polygon.map((c) => [c.lat, c.lng]);

  return (
    <MapContainer
      style={{ height: "300px", width: "100%" }}
      center={positions[0] || [34.666, 135.432]}
      zoom={18}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Polygon
        positions={positions}
        pathOptions={{ color: "#ff0000", fillColor: "#ff0000", fillOpacity: 0.3, weight: 3 }}
      />
      {marker && (
        <CircleMarker
          center={[marker.lat, marker.lng]}
          radius={8}
          pathOptions={{ color: "#ffffff", fillColor: "#e74c3c", fillOpacity: 1, weight: 2 }}
        >
          <Tooltip permanent direction="top" offset={[0, -10]}>
            現在地
          </Tooltip>
        </CircleMarker>
      )}
      <FitBounds polygon={polygon} marker={marker} />
    </MapContainer>
  );
}
