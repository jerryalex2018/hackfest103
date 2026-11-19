"use client";

import { useState } from "react";

export type Coords = { latitude: number; longitude: number };

export function useGeolocation() {
  const [coords, setCoords] = useState<Coords | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function locate() {
    if (!navigator.geolocation) {
      setError("Your browser does not support location.");
      return;
    }
    setLoading(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
        setLoading(false);
      },
      () => {
        setError(
          "Could not get your location. Check that location access is allowed.",
        );
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000 },
    );
  }

  return { coords, loading, error, locate };
}
