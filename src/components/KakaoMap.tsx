"use client";

import { useEffect, useRef } from "react";

const SEOUL_CITY_HALL = { lat: 37.5666805, lng: 126.9784147 };

export function KakaoMap({ className }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const initMap = () => {
      const { kakao } = window;
      if (!kakao?.maps || !containerRef.current) return;

      const center = new kakao.maps.LatLng(SEOUL_CITY_HALL.lat, SEOUL_CITY_HALL.lng);
      const map = new kakao.maps.Map(containerRef.current, {
        center,
        level: 3,
      });

      const markerPosition = new kakao.maps.LatLng(SEOUL_CITY_HALL.lat, SEOUL_CITY_HALL.lng);
      const marker = new kakao.maps.Marker({ position: markerPosition });
      marker.setMap(map);
    };

    if (window.kakao?.maps) {
      window.kakao.maps.load(initMap);
    } else {
      const checkKakao = setInterval(() => {
        if (window.kakao?.maps) {
          clearInterval(checkKakao);
          window.kakao.maps.load(initMap);
        }
      }, 100);
      return () => clearInterval(checkKakao);
    }
  }, []);

  return <div ref={containerRef} className={className} aria-label="카카오맵" />;
}
