/** Kakao Maps SDK - minimal type declarations */

export interface KakaoLatLng {
  getLat(): number;
  getLng(): number;
}

export interface KakaoMap {
  setCenter(latlng: KakaoLatLng): void;
  setLevel(level: number): void;
  getLevel(): number;
}

export interface KakaoMarker {
  setMap(map: KakaoMap | null): void;
}

export interface KakaoInfoWindow {
  open(map: KakaoMap, marker: KakaoMarker): void;
  close(): void;
}

export interface KakaoMapsSDK {
  LatLng: new (latitude: number, longitude: number) => KakaoLatLng;
  Map: new (
    container: HTMLElement,
    options: { center: KakaoLatLng; level: number }
  ) => KakaoMap;
  Marker: new (options: {
    map?: KakaoMap;
    position: KakaoLatLng;
    title?: string;
  }) => KakaoMarker;
  InfoWindow: new (options: { content: string }) => KakaoInfoWindow;
  event: {
    addListener(
      target: KakaoMarker | KakaoMap,
      type: string,
      handler: () => void
    ): void;
  };
  load(callback: () => void): void;
}

declare global {
  interface Window {
    kakao?: {
      maps: KakaoMapsSDK;
    };
  }
}
