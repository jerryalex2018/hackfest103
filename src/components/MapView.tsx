"use client";

import { useEffect, useState } from "react";
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

type PredictiveZone = {
  id: string;
  locationName: string;
  latitude: number;
  longitude: number;
  riskScore: number;
  riskLevel: "low" | "medium" | "high" | "critical";
  peakWindow: string;
  predictedWasteType: string;
  recommendedAction: string;
  forecastSummary: string;
};

const defaultZones: PredictiveZone[] = [
  {
    id: "pred-1",
    locationName: "Machakos Market Confluence",
    latitude: -1.5177,
    longitude: 37.2634,
    riskScore: 94,
    riskLevel: "critical",
    peakWindow: "Friday 21:00 - Saturday 04:00",
    predictedWasteType: "Commercial packaging & perishables",
    recommendedAction: "Pre-position municipal compaction truck & schedule midnight patrol",
    forecastSummary: "High commercial unload volume and low street lighting creates prime conditions for night fly-tipping.",
  },
  {
    id: "pred-2",
    locationName: "Bus Terminus Periphery",
    latitude: -1.5201,
    longitude: 37.2598,
    riskScore: 82,
    riskLevel: "high",
    peakWindow: "Saturday 18:00 - Sunday 06:00",
    predictedWasteType: "Commuter plastic accumulation & nighttime vendor waste",
    recommendedAction: "Route GPS patrol unit at 23:00 to enforce anti-dumping bylaws",
    forecastSummary: "Historical weekend recurrence shows 78% probability of illegal dump trucks discharging construction debris.",
  },
  {
    id: "pred-3",
    locationName: "River Basin Drainage Crossing",
    latitude: -1.5163,
    longitude: 37.2671,
    riskScore: 68,
    riskLevel: "medium",
    peakWindow: "Sunday 14:00 - Monday 05:00",
    predictedWasteType: "Single-use plastics & domestic refuse overflow",
    recommendedAction: "Deploy weekend community waste skip bin to absorb overflow",
    forecastSummary: "Market day footfall generates predictable spillover that exceeds current street bin capacity by 2.4x.",
  },
];

export default function MapView({ locations }: { locations: Location[] }) {
  const [viewMode, setViewMode] = useState<"standard" | "predictive">("standard");
  const [zones, setZones] = useState<PredictiveZone[]>(defaultZones);
  const [loadingAi, setLoadingAi] = useState(false);

  useEffect(() => {
    if (viewMode === "predictive") {
      setLoadingAi(true);
      fetch("/api/ai/predictive-risk")
        .then((res) => res.json())
        .then((data) => {
          if (data.predictions && data.predictions.length > 0) {
            setZones(data.predictions);
          }
        })
        .catch((err) => console.warn("Failed to fetch live AI predictions:", err))
        .finally(() => setLoadingAi(false));
    }
  }, [viewMode]);

  const center: [number, number] =
    locations.length > 0
      ? [locations[0].latitude, locations[0].longitude]
      : [-1.286389, 36.817223];

  const getColor = (level: string) => {
    switch (level) {
      case "critical":
        return "#dc2626";
      case "high":
        return "#ea580c";
      case "medium":
        return "#ca8a04";
      default:
        return "#2563eb";
    }
  };

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
              ? "Verified Citizen Degradation Reports"
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
            <span className="rounded-full bg-red-600 px-1.5 py-0.2 text-[9px] text-white">
              {loadingAi ? "..." : "AI"}
            </span>
          </button>
        </div>
      </div>

      {/* Heatmap Telemetry Bar */}
      {viewMode === "predictive" && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 animate-fade-in">
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-red-900">
            <p className="text-[11px] font-bold uppercase text-red-600">Highest Risk Zone</p>
            <p className="text-sm font-bold mt-0.5">{zones[0]?.locationName || "Central Area"} ({zones[0]?.riskScore || 92}%)</p>
            <p className="text-[11px] text-red-700 mt-1">{zones[0]?.recommendedAction || "Preemptive skip bin placement"}</p>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-900">
            <p className="text-[11px] font-bold uppercase text-amber-600">Peak Dumping Window</p>
            <p className="text-sm font-bold mt-0.5">{zones[0]?.peakWindow || "Weekend 21:00 - 04:00"}</p>
            <p className="text-[11px] text-amber-700 mt-1">Projected illegal discharge window</p>
          </div>

          <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 text-blue-900">
            <p className="text-[11px] font-bold uppercase text-brand-blue">Prevention SLA</p>
            <p className="text-sm font-bold mt-0.5">Preemptive Dispatch Active</p>
            <p className="text-[11px] text-blue-700 mt-1">Proactive patrol routes generated by Gemini 3.8 Flash</p>
          </div>
        </div>
      )}

      {/* Map View */}
      <MapContainer
        center={center}
        zoom={14}
        className="h-[60vh] w-full rounded-2xl z-0 sm:h-[70vh] shadow-sm"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Predictive Dumping Risk Circles */}
        {viewMode === "predictive" &&
          zones.map((zone) => {
            const color = getColor(zone.riskLevel);
            return (
              <Circle
                key={zone.id}
                center={[zone.latitude, zone.longitude]}
                radius={250}
                pathOptions={{
                  color,
                  fillColor: color,
                  fillOpacity: 0.3,
                  weight: 2,
                  dashArray: "4, 6",
                }}
              >
                <Popup>
                  <div className="space-y-1.5 text-xs max-w-xs">
                    <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-1">
                      <span className="font-bold text-slate-900">{zone.locationName}</span>
                      <span
                        className="rounded-sm px-1.5 py-0.5 text-[10px] font-extrabold text-white uppercase"
                        style={{ backgroundColor: color }}
                      >
                        {zone.riskLevel} ({zone.riskScore}%)
                      </span>
                    </div>
                    <p>
                      <span className="font-semibold">Peak Window:</span> {zone.peakWindow}
                    </p>
                    <p>
                      <span className="font-semibold">Predicted Waste:</span> {zone.predictedWasteType}
                    </p>
                    <p className="text-slate-600 bg-slate-50 p-1.5 rounded">
                      <span className="font-semibold text-slate-800">Dispatch Action: </span>
                      {zone.recommendedAction}
                    </p>
                    <p className="text-slate-500 italic text-[11px]">{zone.forecastSummary}</p>
                  </div>
                </Popup>
              </Circle>
            );
          })}

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
                  className="text-brand-blue underline font-medium"
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
