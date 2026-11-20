"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  Polyline,
  Circle,
  useMap,
} from "react-leaflet";
import Link from "next/link";
import type { Location, GPSPosition, PatrolBreadcrumb } from "@/lib/types";

// Helper: Haversine distance in meters
function getDistanceInMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

// Custom icons
const patrolIcon = () =>
  L.divIcon({
    className: "",
    html: `
      <div style="position:relative;width:24px;height:24px;">
        <div style="position:absolute;width:24px;height:24px;border-radius:50%;background:#2563eb;opacity:0.3;animation:pulse 2s infinite;"></div>
        <div style="position:absolute;top:4px;left:4px;width:16px;height:16px;border-radius:50%;background:#2563eb;border:3px solid white;box-shadow:0 0 10px rgba(0,0,0,0.3);"></div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });

const spotIcon = (flagged: boolean) =>
  L.divIcon({
    className: "",
    html: `
      <div style="width:20px;height:20px;border-radius:50%;border:3px solid white;background:${
        flagged ? "#dc2626" : "#16a34a"
      };box-shadow:0 2px 6px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;color:white;font-size:10px;font-weight:bold;">
        ${flagged ? "!" : "•"}
      </div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });

function MapRecenter({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, map.getZoom(), { animate: true, duration: 1 });
  }, [center, map]);
  return null;
}

export default function GpsTrackerView({ locations }: { locations: Location[] }) {
  // Current user GPS position
  const [gps, setGps] = useState<GPSPosition>({
    latitude: -1.5177,
    longitude: 37.2634,
    accuracy: 8,
    speed: 1.2,
    heading: 90,
    altitude: 1604,
    timestamp: Date.now(),
  });

  const [trail, setTrail] = useState<PatrolBreadcrumb[]>([
    { latitude: -1.5185, longitude: 37.2625, timestamp: Date.now() - 60000 },
    { latitude: -1.5181, longitude: 37.263, timestamp: Date.now() - 30000 },
    { latitude: -1.5177, longitude: 37.2634, timestamp: Date.now() },
  ]);

  const [isSimulating, setIsSimulating] = useState(false);
  const [trackingActive, setTrackingActive] = useState(true);
  const [geoError, setGeoError] = useState<string | null>(null);

  // Watch position using browser HTML5 Geolocation API
  useEffect(() => {
    if (!trackingActive || isSimulating) return;

    if (!("geolocation" in navigator)) {
      setGeoError("Geolocation is not supported by your browser.");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const newPoint: GPSPosition = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: Math.round(pos.coords.accuracy),
          speed: pos.coords.speed ? Math.round(pos.coords.speed * 3.6) : null, // convert m/s to km/h
          heading: pos.coords.heading,
          altitude: pos.coords.altitude ? Math.round(pos.coords.altitude) : null,
          timestamp: pos.timestamp,
        };
        setGps(newPoint);
        setTrail((prev) => [
          ...prev.slice(-40),
          { latitude: newPoint.latitude, longitude: newPoint.longitude, timestamp: Date.now() },
        ]);
        setGeoError(null);
      },
      (err) => {
        console.warn("GPS watch error:", err.message);
        setGeoError("Using simulated ground patrol coordinates (GPS signal unavailable indoors).");
      },
      {
        enableHighAccuracy: true,
        maximumAge: 2000,
        timeout: 10000,
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [trackingActive, isSimulating]);

  // Patrol movement simulator for indoor demo / testing
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      setGps((prev) => {
        const nextLat = prev.latitude + (Math.random() - 0.45) * 0.0003;
        const nextLng = prev.longitude + (Math.random() - 0.45) * 0.0003;
        const speed = Math.round(3.5 + Math.random() * 2.5); // 3.5 - 6 km/h walking patrol
        const newPos = {
          latitude: nextLat,
          longitude: nextLng,
          accuracy: 5,
          speed,
          heading: (prev.heading || 0) + 15,
          altitude: 1604,
          timestamp: Date.now(),
        };
        setTrail((t) => [
          ...t.slice(-40),
          { latitude: nextLat, longitude: nextLng, timestamp: Date.now() },
        ]);
        return newPos;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [isSimulating]);

  // Compute nearby spots with distance
  const nearbySpots = useMemo(() => {
    return locations
      .map((loc) => ({
        ...loc,
        distanceMeters: getDistanceInMeters(
          gps.latitude,
          gps.longitude,
          loc.latitude,
          loc.longitude
        ),
      }))
      .sort((a, b) => a.distanceMeters - b.distanceMeters);
  }, [locations, gps.latitude, gps.longitude]);

  const polylineCoords: [number, number][] = trail.map((p) => [p.latitude, p.longitude]);

  return (
    <div className="space-y-6">
      {/* Telemetry HUD Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs">
          <p className="text-[11px] font-bold uppercase text-slate-400">Current Latitude</p>
          <p className="text-sm font-mono font-bold text-slate-800">{gps.latitude.toFixed(5)}°</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs">
          <p className="text-[11px] font-bold uppercase text-slate-400">Current Longitude</p>
          <p className="text-sm font-mono font-bold text-slate-800">{gps.longitude.toFixed(5)}°</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs">
          <p className="text-[11px] font-bold uppercase text-slate-400">Patrol Speed</p>
          <p className="text-sm font-bold text-brand-blue">
            {gps.speed !== null ? `${gps.speed} km/h` : "Stationary"}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs">
          <p className="text-[11px] font-bold uppercase text-slate-400">GPS Accuracy</p>
          <p className="text-sm font-bold text-emerald-600">±{gps.accuracy} meters</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs">
          <p className="text-[11px] font-bold uppercase text-slate-400">Altitude</p>
          <p className="text-sm font-bold text-slate-700">
            {gps.altitude ? `${gps.altitude} m ASL` : "1,600 m"}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs">
          <p className="text-[11px] font-bold uppercase text-slate-400">Nearest Degradation</p>
          <p className="text-sm font-bold text-red-600">
            {nearbySpots.length > 0 ? `${nearbySpots[0].distanceMeters} m` : "None nearby"}
          </p>
        </div>
      </div>

      {geoError && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800 flex items-center justify-between">
          <span>⚠️ {geoError}</span>
          <button
            onClick={() => setIsSimulating(true)}
            className="font-semibold text-brand-blue underline"
          >
            Start Movement Simulation
          </button>
        </div>
      )}

      {/* Action Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSimulating((prev) => !prev)}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition shadow-xs ${
              isSimulating
                ? "bg-amber-600 text-white hover:bg-amber-700"
                : "bg-slate-900 text-white hover:bg-slate-800"
            }`}
          >
            {isSimulating ? "⏸ Stop Patrol Movement Sim" : "▶ Simulate Field Patrol Movement"}
          </button>

          <button
            onClick={() => {
              setTrail([{ latitude: gps.latitude, longitude: gps.longitude, timestamp: Date.now() }]);
            }}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
          >
            Clear Breadcrumbs
          </button>
        </div>

        <Link
          href={`/report?lat=${gps.latitude}&lng=${gps.longitude}`}
          className="rounded-xl bg-brand-green px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition flex items-center gap-1.5"
        >
          <span>📸 Pin Spot at My Exact GPS Location</span>
        </Link>
      </div>

      {/* Leaflet OpenStreetMap Container */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
        <MapContainer
          center={[gps.latitude, gps.longitude]}
          zoom={16}
          className="h-[65vh] w-full z-0"
        >
          <MapRecenter center={[gps.latitude, gps.longitude]} />

          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* User Breadcrumb Trail */}
          <Polyline
            positions={polylineCoords}
            pathOptions={{ color: "#2563eb", weight: 4, opacity: 0.7, dashArray: "6, 8" }}
          />

          {/* User Accuracy Radius */}
          <Circle
            center={[gps.latitude, gps.longitude]}
            radius={gps.accuracy}
            pathOptions={{ color: "#2563eb", fillColor: "#3b82f6", fillOpacity: 0.15, weight: 1 }}
          />

          {/* User Current Live Patrol Marker */}
          <Marker position={[gps.latitude, gps.longitude]} icon={patrolIcon()}>
            <Popup>
              <div className="p-1 text-xs space-y-1">
                <p className="font-bold text-brand-blue">Active Field Patrol / You</p>
                <p>Coordinates: {gps.latitude.toFixed(5)}, {gps.longitude.toFixed(5)}</p>
                <p>Speed: {gps.speed ? `${gps.speed} km/h` : "Stopped"}</p>
                <p>Accuracy: ±{gps.accuracy}m</p>
              </div>
            </Popup>
          </Marker>

          {/* Nearby Degradation Sites */}
          {locations.map((loc) => (
            <Marker
              key={loc.id}
              position={[loc.latitude, loc.longitude]}
              icon={spotIcon(loc.status === "flagged")}
            >
              <Popup>
                <div className="p-1 text-xs space-y-1">
                  <p className="font-bold">
                    Location #{loc.id} ({loc.status.toUpperCase()})
                  </p>
                  <p>{loc.report_count} reports from {loc.unique_reporters} citizens</p>
                  <p className="text-brand-blue font-medium">
                    Distance: {getDistanceInMeters(gps.latitude, gps.longitude, loc.latitude, loc.longitude)} m
                  </p>
                  <Link
                    href={`/flagged/${loc.id}`}
                    className="mt-1 block text-brand-green font-semibold underline"
                  >
                    Inspect Flagged Details →
                  </Link>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Proximity Warning & Ground Spots List */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-3">
          Degradation Spots Within Patrol Perimeter
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {nearbySpots.slice(0, 3).map((spot) => (
            <div
              key={spot.id}
              className={`rounded-xl border p-3 ${
                spot.status === "flagged"
                  ? "border-red-200 bg-red-50/40"
                  : "border-slate-200 bg-slate-50/50"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">Spot #{spot.id}</span>
                <span
                  className={`text-[10px] font-bold uppercase rounded-md px-1.5 py-0.5 ${
                    spot.status === "flagged"
                      ? "bg-red-100 text-red-700"
                      : "bg-emerald-100 text-emerald-700"
                  }`}
                >
                  {spot.status}
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-600 mt-2">
                Distance: <span className="text-brand-blue">{spot.distanceMeters} meters away</span>
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {spot.unique_reporters} distinct citizen reporters
              </p>
              <Link
                href={`/flagged/${spot.id}`}
                className="mt-2 block text-xs font-bold text-brand-blue hover:underline"
              >
                View Details & Evidence →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
