"use client";

import { useState, useEffect } from "react";

export type GeolocationState = {
  lat: number | null;
  lng: number | null;
  loading: boolean;
  error: string | null;
};

/**
 * 브라우저 navigator.geolocation으로 현재 위도·경도 획득
 */
export function useGeolocation(): GeolocationState {
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setLoading(false);
      setError("위치 서비스를 지원하지 않습니다.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLat(position.coords.latitude);
        setLng(position.coords.longitude);
        setError(null);
        setLoading(false);
      },
      (err) => {
        setLoading(false);
        setError(err.message || "위치를 가져올 수 없습니다.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  return { lat, lng, loading, error };
}
