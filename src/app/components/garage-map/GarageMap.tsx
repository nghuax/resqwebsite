import { useEffect, useRef, useState } from "react";
import type { LatLngBounds, LayerGroup, Map as LeafletMap, Marker as LeafletMarker } from "leaflet";
import type { GeoPoint } from "../tracking/tracking-utils";
import { HO_CHI_MINH_CITY_FALLBACK } from "../tracking/tracking-utils";
import type { GarageRecord } from "./garageMapTypes";

export type GarageMapCommand =
  | { kind: "fit-results"; token: number }
  | { kind: "center-user"; token: number }
  | { kind: "center-selection"; token: number };

function truncateLabel(value: string, limit = 22) {
  if (value.length <= limit) {
    return value;
  }

  return `${value.slice(0, limit - 1)}…`;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getViewportPadding() {
  if (typeof window === "undefined") {
    return {
      paddingTopLeft: [32, 32] as [number, number],
      paddingBottomRight: [32, 32] as [number, number],
    };
  }

  if (window.innerWidth >= 1024) {
    return {
      paddingTopLeft: [420, 210] as [number, number],
      paddingBottomRight: [420, 90] as [number, number],
    };
  }

  return {
    paddingTopLeft: [32, 180] as [number, number],
    paddingBottomRight: [32, 280] as [number, number],
  };
}

function buildMarkerMarkup({
  label,
  isSelected,
  showLabel,
}: {
  label: string;
  isSelected: boolean;
  showLabel: boolean;
}) {
  const ringColor = isSelected ? "rgba(238,50,36,0.2)" : "rgba(8,11,13,0.14)";
  const coreColor = isSelected ? "#ee3224" : "#080b0d";
  const labelBackground = isSelected ? "#ee3224" : "rgba(255,255,255,0.92)";
  const labelColor = isSelected ? "#ffffff" : "#080b0d";
  const labelShadow = isSelected
    ? "0 16px 36px rgba(238,50,36,0.28)"
    : "0 14px 30px rgba(8,11,13,0.16)";
  const markerSize = isSelected ? 30 : 24;
  const innerInset = isSelected ? 5 : 4;
  const safeLabel = escapeHtml(truncateLabel(label));

  return `
    <div style="display:flex;flex-direction:column;align-items:center;gap:8px;transform:translateY(-14px);">
      ${showLabel ? `
        <div style="max-width:160px;border-radius:999px;padding:7px 12px;background:${labelBackground};color:${labelColor};box-shadow:${labelShadow};font-family:'IBM Plex Mono',monospace;font-size:10px;font-weight:500;line-height:1;letter-spacing:0.12em;text-transform:uppercase;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
          ${safeLabel}
        </div>
      ` : ""}
      <div style="position:relative;width:${markerSize}px;height:${markerSize}px;">
        <span style="position:absolute;inset:0;border-radius:999px;background:${ringColor};box-shadow:0 18px 30px rgba(8,11,13,0.18);"></span>
        <span style="position:absolute;inset:${innerInset}px;border-radius:999px;background:${coreColor};border:2px solid white;"></span>
      </div>
    </div>
  `;
}

function getLabelIds({
  garages,
  bounds,
  zoom,
  selectedGarageId,
}: {
  garages: GarageRecord[];
  bounds: LatLngBounds | null;
  zoom: number;
  selectedGarageId: string | null;
}) {
  const ids = new Set<string>();

  if (selectedGarageId) {
    ids.add(selectedGarageId);
  }

  if (!bounds || zoom < 13) {
    return ids;
  }

  const visibleGarages = garages.filter((garage) =>
    bounds.pad(0.12).contains([garage.lat, garage.lng]),
  );
  const labelLimit = zoom >= 15 ? 14 : zoom >= 14 ? 9 : 5;

  visibleGarages.slice(0, labelLimit).forEach((garage) => {
    ids.add(garage.id);
  });

  return ids;
}

export function GarageMap({
  garages,
  selectedGarageId,
  userLocation,
  command,
  onSelectGarage,
  onReady,
  onError,
}: {
  garages: GarageRecord[];
  selectedGarageId: string | null;
  userLocation: GeoPoint | null;
  command: GarageMapCommand | null;
  onSelectGarage: (garageId: string) => void;
  onReady: () => void;
  onError: (message: string) => void;
}) {
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerLayerRef = useRef<LayerGroup | null>(null);
  const markersRef = useRef<Map<string, LeafletMarker>>(new Map());
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const lastBoundsKeyRef = useRef("");
  const [viewportTick, setViewportTick] = useState(0);

  useEffect(() => {
    if (!mapElementRef.current) {
      return;
    }

    let isCancelled = false;

    const initialize = async () => {
      try {
        const L = await import("leaflet");

        if (isCancelled || !mapElementRef.current) {
          return;
        }

        const map = L.map(mapElementRef.current, {
          zoomControl: true,
          attributionControl: true,
        }).setView(
          [HO_CHI_MINH_CITY_FALLBACK.lat, HO_CHI_MINH_CITY_FALLBACK.lng],
          12,
        );

        L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
          subdomains: "abcd",
          maxZoom: 20,
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; CARTO',
        }).addTo(map);

        map.on("zoomend moveend", () => {
          setViewportTick((value) => value + 1);
        });

        markerLayerRef.current = L.layerGroup().addTo(map);
        mapRef.current = map;

        if (typeof ResizeObserver !== "undefined") {
          resizeObserverRef.current = new ResizeObserver(() => {
            map.invalidateSize();
          });
          resizeObserverRef.current.observe(mapElementRef.current);
        }

        window.requestAnimationFrame(() => {
          map.invalidateSize();
        });

        onReady();
      } catch (error) {
        onError(
          error instanceof Error
            ? error.message
            : "The map renderer could not be started.",
        );
      }
    };

    void initialize();

    return () => {
      isCancelled = true;
      resizeObserverRef.current?.disconnect();
      resizeObserverRef.current = null;
      markerLayerRef.current?.clearLayers();
      markerLayerRef.current?.remove();
      markerLayerRef.current = null;
      markersRef.current.clear();
      mapRef.current?.remove();
      mapRef.current = null;
      lastBoundsKeyRef.current = "";
    };
  }, [onError, onReady]);

  useEffect(() => {
    if (!mapRef.current || !markerLayerRef.current) {
      return;
    }

    let isCancelled = false;

    const syncMarkers = async () => {
      const L = await import("leaflet");

      if (isCancelled || !mapRef.current || !markerLayerRef.current) {
        return;
      }

      markerLayerRef.current.clearLayers();
      markersRef.current.clear();

      if (garages.length === 0) {
        mapRef.current.setView(
          [HO_CHI_MINH_CITY_FALLBACK.lat, HO_CHI_MINH_CITY_FALLBACK.lng],
          12,
        );
        lastBoundsKeyRef.current = "";
        return;
      }

      const bounds = L.latLngBounds(
        garages.map((garage) => [garage.lat, garage.lng] as [number, number]),
      );
      const labelIds = getLabelIds({
        garages,
        bounds: mapRef.current.getBounds(),
        zoom: mapRef.current.getZoom(),
        selectedGarageId,
      });

      garages.forEach((garage) => {
        const isSelected = garage.id === selectedGarageId;
        const icon = L.divIcon({
          html: buildMarkerMarkup({
            label: garage.name,
            isSelected,
            showLabel: labelIds.has(garage.id),
          }),
          className: "",
          iconSize: [180, 78],
          iconAnchor: [90, 70],
        });

        const marker = L.marker([garage.lat, garage.lng], { icon }).on("click", () => {
          onSelectGarage(garage.id);
        });

        marker.addTo(markerLayerRef.current!);
        markersRef.current.set(garage.id, marker);
      });

      if (userLocation) {
        const userIcon = L.divIcon({
          html: `
            <div style="display:flex;align-items:center;justify-content:center;transform:translateY(-10px);">
              <div style="position:relative;width:20px;height:20px;">
                <span style="position:absolute;inset:0;border-radius:999px;background:rgba(9,132,227,0.22);box-shadow:0 14px 28px rgba(9,132,227,0.2);"></span>
                <span style="position:absolute;inset:4px;border-radius:999px;background:#0984e3;border:2px solid white;"></span>
              </div>
            </div>
          `,
          className: "",
          iconSize: [28, 28],
          iconAnchor: [14, 24],
        });

        L.marker([userLocation.lat, userLocation.lng], { icon: userIcon }).addTo(
          markerLayerRef.current,
        );
      }

      const currentBoundsKey = garages.map((garage) => garage.id).join("|");
      const activeGarage = selectedGarageId
        ? garages.find((garage) => garage.id === selectedGarageId) ?? null
        : null;

      if (currentBoundsKey !== lastBoundsKeyRef.current) {
        const padding = getViewportPadding();
        mapRef.current.fitBounds(bounds, {
          ...padding,
          maxZoom: garages.length === 1 ? 15 : 14,
        });
        lastBoundsKeyRef.current = currentBoundsKey;
      } else if (activeGarage) {
        mapRef.current.flyTo(
          [activeGarage.lat, activeGarage.lng],
          Math.max(mapRef.current.getZoom(), 14),
          {
            animate: true,
            duration: 0.7,
          },
        );
      }
    };

    void syncMarkers();

    return () => {
      isCancelled = true;
    };
  }, [command, garages, onSelectGarage, selectedGarageId, userLocation, viewportTick]);

  useEffect(() => {
    if (!mapRef.current || !command) {
      return;
    }

    const selectedGarage = selectedGarageId
      ? garages.find((garage) => garage.id === selectedGarageId) ?? null
      : null;

    if (command.kind === "center-user" && userLocation) {
      mapRef.current.flyTo([userLocation.lat, userLocation.lng], 14, {
        animate: true,
        duration: 0.8,
      });
      return;
    }

    if (command.kind === "center-selection" && selectedGarage) {
      mapRef.current.flyTo([selectedGarage.lat, selectedGarage.lng], 15, {
        animate: true,
        duration: 0.75,
      });
      return;
    }

    if (command.kind === "fit-results" && garages.length > 0) {
      void import("leaflet").then((L) => {
        if (!mapRef.current || garages.length === 0) {
          return;
        }

        const bounds = L.latLngBounds(
          garages.map((garage) => [garage.lat, garage.lng] as [number, number]),
        );
        const padding = getViewportPadding();
        mapRef.current.fitBounds(bounds, {
          ...padding,
          maxZoom: garages.length === 1 ? 15 : 14,
        });
      });
    }
  }, [command, garages, selectedGarageId, userLocation]);

  return (
    <div
      ref={mapElementRef}
      className="absolute inset-0 z-0 h-full w-full bg-[#dce3ea]"
    />
  );
}
