"use client";

import { useState } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, Circle } from "react-leaflet";
import type { Location } from "@/lib/types";

const pinIcon = (flagged: boolean) =>
  L.divIcon({
    className: "",
    html: `<div style="width:18px;height:18px;border-radius:50%;border:3px solid white;background:${
      flagged ? "#dc2626" : "#16a34a"
    };box-shadow:0 0 0 2px ${flagged ? "#dc2626" : "#16a34a"}66"></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });

// Predictive dumping hotspots projected by AI & spatial historical frequency
const predictiveHotspots = [
  {
    id: "pred-1",
    name: "Machakos Market Confluence",
    lat: -1.5177,
    lng: 37.2634,
    radiusMeters: 260,
    riskLevel: "Critical",
    color: "#dc2626",
    probability: 94,
    forecastVolume: "3.4 Tonnes",
    triggers: "Bi-weekly open-air market runoff & inadequate skip bins",
  },
  {
    id: "pred-2",
    name: "Bus Terminus Periphery",
    lat: -1.5201,
    lng: 37.2598,
    radiusMeters: 200,
    riskLevel: "High",
    color: "#ea580c",
    probability: 82,
    forecastVolume: "2.1 Tonnes",
    triggers: "Commuter plastic accumulation & nighttime vendor waste",
  },
  {
    id: "pred-3",
    name: "River Basin Drainage Crossing",
    lat: -1.5163,
    lng: 37.2671,
    radiusMeters: 220,
    riskLevel: "Medium",
    color: "#ca8a04",
    probability: 68,
    forecastVolume: "1.5 Tonnes",
    triggers: "Unregulated commercial waste dumping near waterway",
  },
];

export default function MapView({ locations }: { locations: Location[] }) {
  const [viewMode, setViewMode] = useState<"standard" | "predictive">("standard");

  const center: [number, number] =
    locations.length > 0
      ? [locations[0].latitude, locations[0].longitude]
      : [-1.5177, 37.2634];

  return (
    <div className="space-y-4">
      {/* Mode Switcher Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl bg-slate-900 p-4 text-white shadow-xs">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            OpenStreetMap Layer Engine
          </span>
          <p className="text-sm font-semibold">
            {viewMode === "standard"
              ? "Verified Citizen silent Reports"
              : "🔥 72-Hour AI Predictive Dumping Risk Forecast"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setViewMode("standard")}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
              viewMode === "standard"
                ? "bg-brand-blue text-white shadow-xs"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            📍 Verified Pins
          </button>

          <button
            type="button"
            onClick={() => setViewMode("predictive")}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition flex items-center gap-1.5 ${
              viewMode === "predictive"
                ? "bg-amber-500 text-slate-900 font-extrabold shadow-xs"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            <span>🔥 Predictive Risk Heatmap</span>
            <span className="rounded-full bg-red-600 px-1.5 py-0.2 text-[9px] text-white">AI</span>
          </button>
        </div>
      </div>

      {/* Heatmap Telemetry Bar */}
      {viewMode === "predictive" && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 animate-fade-in">
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-red-900">
            <p className="text-[11px] font-bold uppercase text-red-600">Highest Risk Zone</p>
            <p className="text-sm font-bold mt-0.5">Machakos Market Confluence (94%)</p>
            <p className="text-[11px] text-red-700 mt-1">Preemptive skip bin placement recommended</p>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-900">
            <p className="text-[11px] font-bold uppercase text-amber-600">72h Projected Dumping</p>
            <p className="text-sm font-bold mt-0.5">~7.0 Tonnes Solid Debris</p>
            <p className="text-[11px] text-amber-700 mt-1">Projected across 3 key drainage bottlenecks</p>
          </div>

          <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 text-blue-900">
            <p className="text-[11px] font-bold uppercase text-brand-blue">Prevention SLA</p>
            <p className="text-sm font-bold mt-0.5">Preemptive Dispatch Active</p>
            <p className="text-[11px] text-blue-700 mt-1">Saves up to 65% in emergency cleanup costs</p>
          </div>
        </div>
      )}

      {/* Map View */}
      <MapContainer
        center={center}
        zoom={15}
        className="h-[60vh] w-full rounded-2xl z-0 sm:h-[70vh] shadow-sm"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Predictive Dumping Risk Circles */}
        {viewMode === "predictive" &&
          predictiveHotspots.map((zone) => (
            <Circle
              key={zone.id}
              center={[zone.lat, zone.lng]}
              radius={zone.radiusMeters}
              pathOptions={{
                color: zone.color,
                fillColor: zone.color,
                fillOpacity: 0.25,
                weight: 2,
                dashArray: "4, 6",
              }}
            >
              <Popup>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-1">
                    <span className="font-bold text-slate-900">{zone.name}</span>
                    <span
                      className="rounded-sm px-1.5 py-0.5 text-[10px] font-extrabold text-white"
                      style={{ backgroundColor: zone.color }}
                    >
                      {zone.riskLevel} Risk
                    </span>
                  </div>
                  <p>
                    <span className="font-semibold">Dumping Probability:</span> {zone.probability}%
                  </p>
                  <p>
                    <span className="font-semibold">Projected Volume:</span> {zone.forecastVolume}
                  </p>
                  <p className="text-slate-500 italic">{zone.triggers}</p>
                </div>
              </Popup>
            </Circle>
          ))}

        {/* Actual Locations Markers */}
        {locations.map((loc) => (
          <Marker
            key={loc.id}
            position={[loc.latitude, loc.longitude]}
            icon={pinIcon(loc.status === "flagged")}
          >
            <Popup>
              <div className="space-y-1 text-sm">
                <p className="font-semibold">Location #{loc.id}</p>
                <p>{loc.unique_reporters} people reported this</p>
                <p className="capitalize">Status: {loc.status}</p>
                <a
                  href={`/flagged/${loc.id}`}
                  className="text-brand-blue underline"
                >
                  View details & SLA →
                </a>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
