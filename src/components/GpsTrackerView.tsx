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

// Component to handle map centering logic
function MapRecenter({ center, zoom = 16 }: { center: [number, number]; zoom?: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { animate: true, duration: 1 });
  }, [center, zoom, map]);
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

  // Map view state
  const [mapCenter, setMapCenter] = useState<[number, number]>([gps.latitude, gps.longitude]);
  const [selectedSpotId, setSelectedSpotId] = useState<number | null>(null);

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
          speed: pos.coords.speed ? Math.round(pos.coords.speed * 3.6) : null,
          heading: pos.coords.heading,
          altitude: pos.coords.altitude ? Math.round(pos.coords.altitude) : null,
          timestamp: pos.timestamp,
        };
        setGps(newPoint);
        setMapCenter([newPoint.latitude, newPoint.longitude]);
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
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 10000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [trackingActive, isSimulating]);

  // Patrol movement simulator
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      setGps((prev) => {
        const nextLat = prev.latitude + (Math.random() - 0.45) * 0.0003;
        const nextLng = prev.longitude + (Math.random() - 0.45) * 0.0003;
        const speed = Math.round(3.5 + Math.random() * 2.5);
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
        
        // Auto-follow the simulated patrol
        setMapCenter([nextLat, nextLng]);
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
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* 1. Telemetry HUD Banner */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Latitude</p>
          <p className="text-sm font-mono font-bold text-slate-800">{gps.latitude.toFixed(5)}°</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Longitude</p>
          <p className="text-sm font-mono font-bold text-slate-800">{gps.longitude.toFixed(5)}°</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Speed</p>
          <p className="text-sm font-bold text-brand-blue">
            {gps.speed !== null ? `${gps.speed} km/h` : "Stopped"}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">GPS Accuracy</p>
          <p className="text-sm font-bold text-emerald-600">±{gps.accuracy} m</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Altitude</p>
          <p className="text-sm font-bold text-slate-700">
            {gps.altitude ? `${gps.altitude} m` : "1,600 m"}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Nearest Issue</p>
          <p className="text-sm font-bold text-red-600">
            {nearbySpots.length > 0 ? `${nearbySpots[0].distanceMeters} m` : "None"}
          </p>
        </div>
      </div>

      {/* Error / Alert Banner */}
      {geoError && (
        <div className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 shadow-sm">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            <span>{geoError}</span>
          </div>
          <button
            onClick={() => setIsSimulating(true)}
            className="rounded-lg bg-amber-200 px-3 py-1 font-semibold text-amber-900 transition-colors hover:bg-amber-300"
          >
            Start Simulation
          </button>
        </div>
      )}

      {/* 2. Action Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSimulating((prev) => !prev)}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all shadow-sm ${
              isSimulating
                ? "bg-amber-500 text-white hover:bg-amber-600"
                : "bg-slate-900 text-white hover:bg-slate-800"
            }`}
          >
            {isSimulating ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
                Stop Simulation
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                Simulate Patrol
              </>
            )}
          </button>

          <button
            onClick={() => setTrail([{ latitude: gps.latitude, longitude: gps.longitude, timestamp: Date.now() }])}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            Clear Trail
          </button>
        </div>

        <Link
          href={`/report?lat=${gps.latitude}&lng=${gps.longitude}`}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-green px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-brand-green-dark hover:shadow-md"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
          Report Spot Here
        </Link>
      </div>

      {/* 3. Map and Sidebar Grid */}
      <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
        
        {/* Map Container */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 shadow-sm h-[65vh]">
          <MapContainer
            center={[gps.latitude, gps.longitude]}
            zoom={16}
            className="h-full w-full z-0"
          >
            <MapRecenter center={mapCenter} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Breadcrumb Trail */}
            <Polyline
              positions={polylineCoords}
              pathOptions={{ color: "#2563eb", weight: 4, opacity: 0.7, dashArray: "6, 8" }}
            />

            {/* Accuracy Radius */}
            <Circle
              center={[gps.latitude, gps.longitude]}
              radius={gps.accuracy}
              pathOptions={{ color: "#2563eb", fillColor: "#3b82f6", fillOpacity: 0.15, weight: 1 }}
            />

            {/* Live Patrol Marker */}
            <Marker position={[gps.latitude, gps.longitude]} icon={patrolIcon()}>
              <Popup>
                <div className="p-1 text-xs space-y-1">
                  <p className="font-bold text-brand-blue">Active Patrol (You)</p>
                  <p>Speed: {gps.speed ? `${gps.speed} km/h` : "Stopped"}</p>
                  <p>Accuracy: ±{gps.accuracy}m</p>
                </div>
              </Popup>
            </Marker>

            {/* Nearby Spots */}
            {locations.map((loc) => (
              <Marker
                key={loc.id}
                position={[loc.latitude, loc.longitude]}
                icon={spotIcon(loc.status === "flagged")}
                eventHandlers={{
                  click: () => setSelectedSpotId(loc.id),
                }}
              >
                <Popup>
                  <div className="p-1 text-xs space-y-1">
                    <p className="font-bold">Location #{loc.id} ({loc.status.toUpperCase()})</p>
                    <p>{loc.report_count} reports from {loc.unique_reporters} citizens</p>
                    <p className="text-brand-blue font-medium">
                      Distance: {getDistanceInMeters(gps.latitude, gps.longitude, loc.latitude, loc.longitude)} m
                    </p>
                    <Link href={`/flagged/${loc.id}`} className="mt-1 block text-brand-green font-semibold underline">
                      Inspect Details →
                    </Link>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          {/* Floating "Recenter" Button */}
          <button
            onClick={() => {
              setMapCenter([gps.latitude, gps.longitude]);
              setSelectedSpotId(null);
            }}
            className="absolute bottom-6 right-6 z-[400] flex h-12 w-12 items-center justify-center rounded-full bg-white text-brand-blue shadow-lg transition-transform hover:scale-110 active:scale-95"
            title="Center on my location"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="3"></circle></svg>
          </button>
        </div>

        {/* Sidebar: Nearby Spots List */}
        <div className="flex flex-col h-[65vh] rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-4">
            <h3 className="font-bold text-slate-900">Patrol Perimeter</h3>
            <p className="text-xs text-slate-500">Sorted by nearest distance</p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-3 space-y-3 [scrollbar-width:thin]">
            {nearbySpots.length === 0 ? (
               <p className="text-center text-sm text-slate-500 py-10">No spots found in this area.</p>
            ) : (
              nearbySpots.map((spot) => {
                const isSelected = selectedSpotId === spot.id;
                return (
                  <div
                    key={spot.id}
                    onClick={() => {
                      setSelectedSpotId(spot.id);
                      setMapCenter([spot.latitude, spot.longitude]);
                    }}
                    className={`cursor-pointer rounded-xl border p-3 transition-all duration-200 ${
                      isSelected 
                        ? "border-brand-blue bg-brand-blue/5 ring-1 ring-brand-blue/20" 
                        : spot.status === "flagged"
                        ? "border-red-100 bg-red-50/30 hover:border-red-300"
                        : "border-slate-200 bg-white hover:border-brand-green/50 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-800">Spot #{spot.id}</span>
                      <span className={`text-[10px] font-bold uppercase tracking-wide rounded-md px-2 py-0.5 ${
                        spot.status === "flagged" ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"
                      }`}>
                        {spot.status}
                      </span>
                    </div>
                    
                    <div className="mt-2 flex items-center justify-between text-xs">
                      <span className="font-semibold text-brand-blue">{spot.distanceMeters} m away</span>
                      <span className="text-slate-400">{spot.unique_reporters} reporters</span>
                    </div>
                    
                    {isSelected && (
                      <Link
                        href={`/flagged/${spot.id}`}
                        className="mt-3 flex items-center justify-center gap-1 rounded-lg bg-brand-blue py-1.5 text-xs font-bold text-white transition-colors hover:bg-brand-blue-dark"
                      >
                        View Evidence
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                      </Link>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
}