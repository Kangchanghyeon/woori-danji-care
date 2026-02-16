"use client";

import { useEffect, useRef } from "react";
import {
  DUMMY_APARTMENTS,
  HUNTER_MAP_CENTER,
  type DummyApartment,
  type PinType,
} from "@/data/dummyApartments";
import type { KakaoMapInstance } from "@/types/kakao";

const ZOOM_LEVEL_DEFAULT = 5;

/** 컬러별 핀 이미지 (SVG 원형) */
function getPinSvg(hexFill: string, hexStroke: string) {
  return (
    "data:image/svg+xml," +
    encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36">
        <circle cx="18" cy="18" r="14" fill="${hexFill}" stroke="${hexStroke}" stroke-width="2"/>
      </svg>
    `)
  );
}
const PIN_CONFIG: Record<
  PinType,
  { src: string; size: [number, number]; offset: [number, number] }
> = {
  red: {
    src: getPinSvg("#EF4444", "#DC2626"),
    size: [36, 36],
    offset: [18, 36],
  },
  yellow: {
    src: getPinSvg("#FACC15", "#EAB308"),
    size: [36, 36],
    offset: [18, 36],
  },
  gray: {
    src: getPinSvg("#9CA3AF", "#6B7280"),
    size: [36, 36],
    offset: [18, 36],
  },
  green: {
    src: getPinSvg("#22C55E", "#16A34A"),
    size: [36, 36],
    offset: [18, 36],
  },
};

export type HunterMapProps = {
  className?: string;
  /** 표시할 아파트 목록. 미제공 시 DUMMY_APARTMENTS 전체 표시 */
  apartments?: DummyApartment[];
  /** 지도 중심 좌표. 미제공 시 기본 중심 사용 */
  center?: { lat: number; lng: number };
};

export function HunterMap({ className, apartments, center }: HunterMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<KakaoMapInstance | null>(null);
  const aptList = apartments ?? DUMMY_APARTMENTS;

  useEffect(() => {
    if (!containerRef.current) return;

    const initMap = () => {
      const { kakao } = window;
      if (!kakao?.maps || !containerRef.current) return;

      const centerLatLng = new kakao.maps.LatLng(
        HUNTER_MAP_CENTER.lat,
        HUNTER_MAP_CENTER.lng
      );
      const map = new kakao.maps.Map(containerRef.current, {
        center: centerLatLng,
        level: ZOOM_LEVEL_DEFAULT,
      });
      mapRef.current = map;
      aptList.forEach((apt: DummyApartment) => {
        const position = new kakao.maps.LatLng(apt.lat, apt.lng);
        const config = PIN_CONFIG[apt.pinType];
        const imageSize = new kakao.maps.Size(config.size[0], config.size[1]);
        const imageOption = {
          offset: new kakao.maps.Point(config.offset[0], config.offset[1]),
        };
        const markerImage = new kakao.maps.MarkerImage(
          config.src,
          imageSize,
          imageOption
        );
        const marker = new kakao.maps.Marker({
          position,
          image: markerImage,
          map,
        });

        const content = `
          <div style="padding:8px 12px;min-width:140px;font-size:12px;line-height:1.4;">
            <div style="font-weight:700;margin-bottom:4px;">${apt.name}</div>
            <div style="color:#666;">보험 갱신일: ${apt.renewalDate}</div>
            <div style="color:#888;font-size:11px;">${apt.label}</div>
          </div>
        `;
        const infowindow = new kakao.maps.InfoWindow({ content });

        kakao.maps.event.addListener(marker, "click", () => {
          infowindow.open(map, marker);
        });
        kakao.maps.event.addListener(marker, "mouseout", () => {
          infowindow.close();
        });
        let touchCloseTimer: ReturnType<typeof setTimeout> | null = null;
        kakao.maps.event.addListener(marker, "touchend", () => {
          if (touchCloseTimer) clearTimeout(touchCloseTimer);
          touchCloseTimer = setTimeout(() => {
            infowindow.close();
            touchCloseTimer = null;
          }, 400);
        });
      });
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
      return () => {
        clearInterval(checkKakao);
        mapRef.current = null;
      };
    }
  }, [aptList]);

  useEffect(() => {
    if (!center || !mapRef.current || !window.kakao?.maps) return;
    const latlng = new window.kakao.maps.LatLng(center.lat, center.lng);
    mapRef.current.setCenter(latlng);
  }, [center?.lat, center?.lng]);

  return (
    <div ref={containerRef} className={className} aria-label="영업용 지도" />
  );
}
