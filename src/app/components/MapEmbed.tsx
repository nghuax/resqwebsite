import { useEffect, useRef, useState } from "react";
import type {
  Circle,
  CircleMarker,
  Map as LeafletMap,
  Polyline,
} from "leaflet";
import { useLanguage } from "./LanguageContext";
import { t } from "./localization";

type MapEmbedProps = {
  className?: string;
  lat?: number;
  lng?: number;
  zoom?: number;
  label?: string;
  description?: string;
};

function buildSupportPoints(lat: number, lng: number): [number, number][] {
  return [
    [lat + 0.011, lng - 0.018],
    [lat - 0.008, lng + 0.014],
    [lat + 0.004, lng + 0.02],
  ];
}

export function MapEmbed({
  className = "",
  lat = 10.7769,
  lng = 106.7009,
  zoom = 13,
  label,
  description,
}: MapEmbedProps) {
  const { language } = useLanguage();
  const isEnglish = language === "en";
  const displayLabel = label ?? t(
    isEnglish,
    "ResQ đang hỗ trợ khu vực này",
    "ResQ is supporting this area",
  );
  const displayDescription = description ?? t(
    isEnglish,
    "Đội cứu hộ có thể tiếp cận trong khoảng 15-30 phút.",
    "The rescue team can arrive in about 15-30 minutes.",
  );
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<CircleMarker | null>(null);
  const coverageRef = useRef<Circle | null>(null);
  const supportRouteRef = useRef<Polyline | null>(null);
  const supportMarkersRef = useRef<CircleMarker[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!mapElementRef.current || mapRef.current) {
      return;
    }

    let cancelled = false;
    let resizeObserver: ResizeObserver | null = null;

    const initialize = async () => {
      const L = await import("leaflet");

      if (!mapElementRef.current || mapRef.current || cancelled) {
        return;
      }

      const nextCenter: [number, number] = [lat, lng];
      const map = L.map(mapElementRef.current, {
        zoomControl: false,
        scrollWheelZoom: false,
        attributionControl: true,
      }).setView(nextCenter, zoom);

      L.control.zoom({ position: "bottomright" }).addTo(map);

      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        subdomains: "abcd",
        maxZoom: 20,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; CARTO',
      }).addTo(map);

      coverageRef.current = L.circle(nextCenter, {
        radius: 850,
        color: "#ee3224",
        weight: 1,
        fillColor: "#ee3224",
        fillOpacity: 0.12,
        interactive: false,
      }).addTo(map);

      markerRef.current = L.circleMarker(nextCenter, {
        radius: 10,
        color: "#ffffff",
        weight: 4,
        fillColor: "#ee3224",
        fillOpacity: 1,
      }).addTo(map);

      mapRef.current = map;
      setIsReady(true);

      if (typeof ResizeObserver !== "undefined") {
        resizeObserver = new ResizeObserver(() => {
          map.invalidateSize();
        });
        resizeObserver.observe(mapElementRef.current);
      }

      window.requestAnimationFrame(() => {
        map.invalidateSize();
        window.setTimeout(() => map.invalidateSize(), 180);
      });
    };

    void initialize();

    return () => {
      cancelled = true;
      resizeObserver?.disconnect();
      supportMarkersRef.current.forEach((marker) => marker.remove());
      supportMarkersRef.current = [];
      supportRouteRef.current?.remove();
      supportRouteRef.current = null;
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
      coverageRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const marker = markerRef.current;
    const coverage = coverageRef.current;

    if (!map || !marker || !coverage) {
      return;
    }

    const nextCenter: [number, number] = [lat, lng];
    const supportPoints = buildSupportPoints(lat, lng);

    map.setView(nextCenter, zoom, { animate: false });
    marker.setLatLng(nextCenter);
    coverage.setLatLng(nextCenter);

    if (supportRouteRef.current) {
      supportRouteRef.current.setLatLngs([
        supportPoints[0],
        nextCenter,
        supportPoints[1],
        nextCenter,
        supportPoints[2],
      ]);
    } else {
      void import("leaflet").then((L) => {
        if (!mapRef.current || supportRouteRef.current) {
          return;
        }

        supportRouteRef.current = L.polyline(
          [
            supportPoints[0],
            nextCenter,
            supportPoints[1],
            nextCenter,
            supportPoints[2],
          ],
          {
            color: "#080b0d",
            weight: 2,
            opacity: 0.28,
            dashArray: "6 8",
            lineCap: "round",
            lineJoin: "round",
            interactive: false,
          },
        ).addTo(mapRef.current);
      });
    }

    if (supportMarkersRef.current.length === supportPoints.length) {
      supportMarkersRef.current.forEach((markerItem, index) => {
        markerItem.setLatLng(supportPoints[index]);
      });
    } else {
      supportMarkersRef.current.forEach((markerItem) => markerItem.remove());
      supportMarkersRef.current = [];

      void import("leaflet").then((L) => {
        if (!mapRef.current) {
          return;
        }

        supportMarkersRef.current = supportPoints.map((point) =>
          L.circleMarker(point, {
            radius: 6,
            color: "#ffffff",
            weight: 3,
            fillColor: "#080b0d",
            fillOpacity: 1,
            interactive: false,
          }).addTo(mapRef.current!),
        );
      });
    }

    map.fitBounds([nextCenter, ...supportPoints], {
      padding: [38, 38],
      maxZoom: zoom,
    });
    map.invalidateSize();
  }, [lat, lng, zoom]);

  return (
    <div
      className={`resq-card-lift resq-map-float relative overflow-hidden rounded-[20px] border border-[rgba(4,38,153,0.08)] bg-[#f3f4f6] shadow-[0_20px_70px_rgba(8,11,13,0.08)] ${className}`}
    >
      <div ref={mapElementRef} className="absolute inset-0" />

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.5),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.12),transparent_28%,transparent_72%,rgba(8,11,13,0.08)_100%)]" />

      <div className="pointer-events-none absolute left-4 top-4 max-w-[min(280px,calc(100%-2rem))] rounded-[18px] border border-white/75 bg-white/88 px-4 py-3 shadow-[0_14px_36px_rgba(8,11,13,0.08)] backdrop-blur-[14px] sm:left-5 sm:top-5">
        <p className="font-['IBM_Plex_Mono',monospace] text-[11px] uppercase tracking-[0.18em] text-[#99a1af]">
          {t(isEnglish, "Bản đồ ResQ", "ResQ map")}
        </p>
        <p className="mt-1 font-['IBM_Plex_Mono',monospace] text-[14px] font-[700] leading-[1.5] text-[#080b0d]">
          {displayLabel}
        </p>
        <p className="mt-1 font-['IBM_Plex_Mono',monospace] text-[12px] leading-[1.7] text-[#4a5565]">
          {displayDescription}
        </p>
      </div>

      <div className="pointer-events-none absolute bottom-4 left-4 right-4 flex flex-wrap gap-2 sm:bottom-5 sm:left-5 sm:right-auto">
        <span className="font-['IBM_Plex_Mono',monospace] rounded-full border border-white/75 bg-white/90 px-3 py-1.5 text-[11px] uppercase tracking-[0.16em] text-[#080b0d] shadow-[0_10px_24px_rgba(8,11,13,0.08)] backdrop-blur-[14px]">
          {t(isEnglish, "Phủ sóng 24/7", "24/7 coverage")}
        </span>
        <span className="font-['IBM_Plex_Mono',monospace] rounded-full border border-white/75 bg-white/90 px-3 py-1.5 text-[11px] uppercase tracking-[0.16em] text-[#4a5565] shadow-[0_10px_24px_rgba(8,11,13,0.08)] backdrop-blur-[14px]">
          {t(isEnglish, "Điều phối gần nhất", "Nearest dispatch")}
        </span>
      </div>

      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/55 backdrop-blur-[2px]">
          <div className="rounded-full border border-[rgba(4,38,153,0.08)] bg-white/90 px-4 py-2 font-['IBM_Plex_Mono',monospace] text-[11px] uppercase tracking-[0.18em] text-[#4a5565] shadow-[0_10px_24px_rgba(8,11,13,0.08)]">
            {t(isEnglish, "Đang tải bản đồ", "Loading map")}
          </div>
        </div>
      )}
    </div>
  );
}
