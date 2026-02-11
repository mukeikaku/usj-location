"use client";
// This component uses the Geolocation API to get the user's current location
import { useState } from "react";
import mapData from "@/data/map_data.json";

type Point = { lat: number; lng: number };

// Ray casting algorithm for point-in-polygon check
function isInsidePolygon(point: Point, polygon: Point[]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lat, yi = polygon[i].lng;
    const xj = polygon[j].lat, yj = polygon[j].lng;
    const intersect =
      yi > point.lng !== yj > point.lng &&
      point.lat < ((xj - xi) * (point.lng - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

// Haversine distance in meters
function haversineDistance(a: Point, b: Point): number {
  const R = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const h =
    sinLat * sinLat +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * sinLng * sinLng;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

// Closest point on a line segment AB from point P
function closestPointOnSegment(p: Point, a: Point, b: Point): Point {
  const dx = b.lat - a.lat;
  const dy = b.lng - a.lng;
  if (dx === 0 && dy === 0) return a;
  let t = ((p.lat - a.lat) * dx + (p.lng - a.lng) * dy) / (dx * dx + dy * dy);
  t = Math.max(0, Math.min(1, t));
  return { lat: a.lat + t * dx, lng: a.lng + t * dy };
}

// Find the closest point on the polygon boundary
function closestPointOnPolygon(
  point: Point,
  polygon: Point[]
): { closest: Point; distance: number } {
  let minDist = Infinity;
  let closest: Point = polygon[0];
  for (let i = 0; i < polygon.length - 1; i++) {
    const cp = closestPointOnSegment(point, polygon[i], polygon[i + 1]);
    const d = haversineDistance(point, cp);
    if (d < minDist) {
      minDist = d;
      closest = cp;
    }
  }
  return { closest, distance: minDist };
}

// Bearing from boundary point to the current position (where you are relative to the boundary)
function bearing(from: Point, to: Point): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const toDeg = (rad: number) => (rad * 180) / Math.PI;
  const dLng = toRad(to.lng - from.lng);
  const y = Math.sin(dLng) * Math.cos(toRad(to.lat));
  const x =
    Math.cos(toRad(from.lat)) * Math.sin(toRad(to.lat)) -
    Math.sin(toRad(from.lat)) * Math.cos(toRad(to.lat)) * Math.cos(dLng);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

function bearingToDirection(deg: number): string {
  const dirs = ["北", "北東", "東", "南東", "南", "南西", "西", "北西"];
  const idx = Math.round(deg / 45) % 8;
  return dirs[idx];
}

type Result =
  | { type: "success" }
  | { type: "outside"; distance: number; direction: string };

export default function Location() {
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [target, setTarget] = useState("");
  const [result, setResult] = useState<Result | null>(null);

  const allPlacemarks = mapData.folders.flatMap((folder) => folder.placemarks);
  const targetPlaces = allPlacemarks.map((p) => p.name);
  const selectedCoordinates =
    allPlacemarks.find((p) => p.name === target)?.coordinates ?? [];

  const handleMeasure = () => {
    if (!navigator.geolocation) {
      setError("このブラウザは位置情報取得に対応していません。");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setLatitude(lat.toString());
        setLongitude(lng.toString());

        if (selectedCoordinates.length === 0) return;

        const point: Point = { lat, lng };
        const polygon: Point[] = selectedCoordinates.map((c) => ({
          lat: c.lat,
          lng: c.lng,
        }));

        if (isInsidePolygon(point, polygon)) {
          setResult({ type: "success" });
        } else {
          const { closest, distance } = closestPointOnPolygon(point, polygon);
          const deg = bearing(closest, point);
          setResult({
            type: "outside",
            distance: Math.round(distance * 10) / 10,
            direction: bearingToDirection(deg),
          });
        }
      },
      (err) => {
        setError(err.message);
      },
      { enableHighAccuracy: true, maximumAge: 0 }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      latitude,
      longitude,
      target,
    };

    try {
      const response = await fetch("/api/add-to-sheet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        alert("データがGoogle Spreadsheetに追加されました！");
        setLatitude("");
        setLongitude("");
        setTarget("");
        setResult(null);
      } else {
        alert("データの追加に失敗しました。");
      }
    } catch (error) {
      console.error(error);
      alert("エラーが発生しました。");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">現在の位置情報</h1>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="flex items-center gap-x-4">
          <label htmlFor="target" className="w-32 font-medium">
            ターゲット:
          </label>
          <select
            id="target"
            value={target}
            onChange={(e) => {
              setTarget(e.target.value);
              setResult(null);
            }}
            className="flex-1 p-2 border border-gray-300 rounded"
            required={true}
          >
            <option value="" disabled>
              選択してください
            </option>
            {targetPlaces.map((place) => (
              <option key={place} value={place}>
                {place}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-x-4">
          <button
            type="button"
            onClick={handleMeasure}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            計測
          </button>
        </div>
        <div className="flex items-center gap-x-4">
          <label htmlFor="latitude" className="w-32 font-medium">
            現在の緯度:
          </label>
          <input
            type="text"
            id="latitude"
            value={latitude}
            readOnly
            placeholder="緯度がここに表示されます"
            className="flex-1 p-2 border border-gray-300 rounded"
            required={true}
          />
        </div>
        <div className="flex items-center gap-x-4">
          <label htmlFor="longitude" className="w-32 font-medium">
            現在の経度:
          </label>
          <input
            type="text"
            id="longitude"
            value={longitude}
            readOnly
            placeholder="経度がここに表示されます"
            className="flex-1 p-2 border border-gray-300 rounded"
            required={true}
          />
        </div>
        {latitude && longitude && (
          <div className="flex items-center gap-x-4">
            <span className="w-32" />
            <a
              href={`https://www.google.com/maps?q=${latitude},${longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline text-sm"
            >
              Google Maps で確認
            </a>
          </div>
        )}
      </form>
      {error && <p className="text-red-500 mt-4">エラー: {error}</p>}
      {target && selectedCoordinates.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center gap-x-4 mb-2">
            <h2 className="font-medium">座標:</h2>
            <a
              href={`https://geojson.io/#data=data:application/json,${encodeURIComponent(
                JSON.stringify({
                  type: "FeatureCollection",
                  features: [
                    {
                      type: "Feature",
                      properties: { name: target },
                      geometry: {
                        type: "Polygon",
                        coordinates: [
                          selectedCoordinates.map((c) => [c.lng, c.lat]),
                        ],
                      },
                    },
                  ],
                })
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline text-sm"
            >
              地図で領域を確認
            </a>
          </div>
          <ul className="list-disc list-inside space-y-1 text-sm">
            {selectedCoordinates.map((coord, i) => (
              <li key={i}>
                lat: {coord.lat}, lng: {coord.lng}
              </li>
            ))}
          </ul>
        </div>
      )}
      {result && (
        <div className="mt-6 p-4 rounded border">
          <h2 className="font-medium mb-2">結果:</h2>
          {result.type === "success" ? (
            <p className="text-green-600 font-bold text-lg">成功</p>
          ) : (
            <p className="text-red-600">
              境界線から <span className="font-bold">{result.distance}m</span>{" "}
              <span className="font-bold">{result.direction}</span> に外れています
            </p>
          )}
        </div>
      )}
    </div>
  );
}
