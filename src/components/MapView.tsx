"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import type { Location } from "@/lib/types";

const pinIcon = (flagged: boolean) =>
  L.divIcon({
    className: "",
    html: `<div style="width:18px;height:18px;border-radius:50%;border:3px solid white;background:${
      flagged ? "#2563eb" : "#16a34a"
    };box-shadow:0 0 0 2px ${flagged ? "#2563eb" : "#16a34a"}66"></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });

export default function MapView({ locations }: { locations: Location[] }) {
  const center: [number, number] =
    locations.length > 0
      ? [locations[0].latitude, locations[0].longitude]
      : [-1.5177, 37.2634];

  return (
    <MapContainer
      center={center}
      zoom={15}
      className="h-[60vh] w-full rounded-2xl z-0 sm:h-[70vh]"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
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
                View details
              </a>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
