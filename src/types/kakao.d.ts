/**
 * 카카오맵 API 전역 타입 (HunterMap, KakaoMap 등에서 공용)
 */
export interface KakaoMapInstance {
  setCenter: (latlng: unknown) => void;
}

declare global {
  interface Window {
    kakao?: {
      maps: {
        load: (callback: () => void) => void;
        LatLng: new (lat: number, lng: number) => unknown;
        Map: new (
          container: HTMLElement,
          options: { center: unknown; level?: number }
        ) => KakaoMapInstance;
        Size: new (width: number, height: number) => unknown;
        Point: new (x: number, y: number) => unknown;
        Marker: new (options: {
          position: unknown;
          image?: unknown;
          map?: unknown;
        }) => { setMap: (map: unknown) => void };
        MarkerImage: new (
          url: string,
          size: unknown,
          option?: { offset?: unknown }
        ) => unknown;
        InfoWindow: new (options: { content: string | HTMLElement }) => {
          open: (map: unknown, marker: unknown) => void;
          close: () => void;
        };
        event: {
          addListener: (
            target: unknown,
            type: string,
            handler: () => void
          ) => void;
        };
      };
    };
  }
}

export {};
