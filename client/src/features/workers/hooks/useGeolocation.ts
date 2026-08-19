import { useState, useCallback } from "react";

interface Coords {
  latitude: number;
  longitude: number;
}

/** Thin wrapper over the browser Geolocation API — permission-gated, no fallback IP geolocation (keeps this simple and honest about what it actually knows). */
export function useGeolocation() {
  const [coords, setCoords] = useState<Coords | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const request = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Location is not supported on this device");
      return;
    }
    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
        setIsLoading(false);
      },
      () => {
        setError("Could not get your location. Please allow location access.");
        setIsLoading(false);
      },
      { timeout: 10000 }
    );
  }, []);

  return { coords, error, isLoading, request };
}