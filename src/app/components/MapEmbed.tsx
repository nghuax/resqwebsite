import { useEffect, useRef } from "react";
import L from "leaflet";

type MapEmbedProps = {
  className?: string;
  lat?: number;
  lng?: number;
  zoom?: number;
  label?: string;
  description?: string;
};

export function MapEmbed({
  className = "",
  lat = 10.7769,
  lng = 106.7009,
  zoom = 13,
  label = "ResQ đang hỗ trợ khu vực này",
  description = "Đội cứu hộ có thể tiếp cận trong khoảng 15-30 phút.",
}: MapEmbedProps) {
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.CircleMarker | null>(null);
  const coverageRef = useRef<L.Circle | null>(null);

  useEffect(() => {
    if (!mapElementRef.current || mapRef.current) {
      return;
    }

    const map = L.map(mapElementRef.current, {
      zoomControl: false,
      scrollWheelZoom: false,
      attributionControl: true,
    }).setView([lat, lng], zoom);

    L.control.zoom({ position: "bottomright" }).addTo(map);

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    const coverage = L.circle([lat, lng], {
      radius: 850,
      color: "#ee3224",
      weight: 1,
      fillColor: "#ee3224",
      fillOpacity: 0.12,
      interactive: false,
    }).addTo(map);

    const marker = L.circleMarker([lat, lng], {
      radius: 10,
      color: "#ffffff",
      weight: 4,
      fillColor: "#ee3224",
      fillOpacity: 1,
    }).addTo(map);

    marker.bindPopup(
      `<div><strong>${label}</strong><br />${description}</div>`,
      {
        closeButton: false,
        autoClose: false,
        closeOnClick: false,
      },
    );
    marker.openPopup();

    mapRef.current = map;
    markerRef.current = marker;
    coverageRef.current = coverage;

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => {
        map.invalidateSize();
      });
      resizeObserver.observe(mapElementRef.current);
    }

    window.requestAnimationFrame(() => {
      map.invalidateSize();
    });

    return () => {
      resizeObserver?.disconnect();
      map.remove();
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

    const nextLatLng = L.latLng(lat, lng);
    map.setView(nextLatLng, zoom, { animate: false });
    marker.setLatLng(nextLatLng);
    marker.setPopupContent(
      `<div><strong>${label}</strong><br />${description}</div>`,
    );
    coverage.setLatLng(nextLatLng);
  }, [description, label, lat, lng, zoom]);

  return (
    <div
      className={`overflow-hidden rounded-[20px] border border-[rgba(4,38,153,0.08)] bg-[#f3f4f6] shadow-[0_20px_70px_rgba(8,11,13,0.08)] ${className}`}
    >
      <div ref={mapElementRef} className="h-full w-full" />
    </div>
  );
}
