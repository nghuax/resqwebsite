"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { Map as LeafletMap, Marker as LeafletMarker, Polyline as LeafletPolyline } from "leaflet";
import {
  BadgeCheck,
  Crosshair,
  LocateFixed,
  LoaderCircle,
  Navigation,
  Shield,
} from "lucide-react";
import {
  buildCumulativeDistances,
  createVehicleOrigin,
  fetchRouteData,
  formatDistance,
  formatEta,
  getBearingAlongRoute,
  getPointAlongRoute,
  getSegmentIndexAtDistance,
  getSimulationSpeedMetersPerSecond,
  getTrackingStatus,
  getUserLocation,
  type GeoPoint,
  type LocationSource,
  type RouteData,
  type RouteSource,
} from "./tracking-utils";

type RuntimeRoute = RouteData & {
  cumulativeDistances: number[];
};

const MAP_TICK_MS = 120;
const DEFAULT_ZOOM = 14;

const mono = "font-['IBM_Plex_Mono',monospace]";
const display = "font-['Syne',sans-serif]";

export function TrackingLiveMap() {
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const userMarkerRef = useRef<LeafletMarker | null>(null);
  const vehicleMarkerRef = useRef<LeafletMarker | null>(null);
  const routeShadowRef = useRef<LeafletPolyline | null>(null);
  const activeRouteRef = useRef<LeafletPolyline | null>(null);
  const travelledRouteRef = useRef<LeafletPolyline | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const movementIntervalRef = useRef<number | null>(null);
  const travelledDistanceRef = useRef(0);
  const simulationSpeedRef = useRef(0);
  const routeRef = useRef<RuntimeRoute | null>(null);
  const followVehicleRef = useRef(true);
  const lastFollowPanAtRef = useRef(0);

  const [hasMounted, setHasMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [followVehicle, setFollowVehicle] = useState(true);
  const [userPosition, setUserPosition] = useState<GeoPoint | null>(null);
  const [vehiclePosition, setVehiclePosition] = useState<GeoPoint | null>(null);
  const [locationSource, setLocationSource] = useState<LocationSource>("fallback");
  const [routeSource, setRouteSource] = useState<RouteSource>("fallback");
  const [remainingDistanceMeters, setRemainingDistanceMeters] = useState(0);
  const [etaMinutes, setEtaMinutes] = useState(0);

  const trackingStatus = useMemo(
    () => getTrackingStatus(remainingDistanceMeters),
    [remainingDistanceMeters],
  );

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    followVehicleRef.current = followVehicle;
  }, [followVehicle]);

  useEffect(() => {
    if (!hasMounted || !mapElementRef.current) {
      return;
    }

    let cancelled = false;
    const routeAbortController = new AbortController();

    const teardownMovement = () => {
      if (movementIntervalRef.current !== null) {
        window.clearInterval(movementIntervalRef.current);
        movementIntervalRef.current = null;
      }
    };

    const teardownLayers = () => {
      routeShadowRef.current?.remove();
      activeRouteRef.current?.remove();
      travelledRouteRef.current?.remove();
      userMarkerRef.current?.remove();
      vehicleMarkerRef.current?.remove();

      routeShadowRef.current = null;
      activeRouteRef.current = null;
      travelledRouteRef.current = null;
      userMarkerRef.current = null;
      vehicleMarkerRef.current = null;
    };

    const initialize = async () => {
      const L = await import("leaflet");

      if (cancelled || !mapElementRef.current) {
        return;
      }

      const map = L.map(mapElementRef.current, {
        zoomControl: false,
        attributionControl: true,
        preferCanvas: true,
      }).setView([10.776889, 106.700806], DEFAULT_ZOOM);

      mapRef.current = map;

      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        subdomains: "abcd",
        maxZoom: 20,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; CARTO',
      }).addTo(map);

      if (typeof ResizeObserver !== "undefined") {
        resizeObserverRef.current = new ResizeObserver(() => {
          map.invalidateSize();
        });
        resizeObserverRef.current.observe(mapElementRef.current);
      }
      window.requestAnimationFrame(() => map.invalidateSize());

      const { point: userPoint, source } = await getUserLocation();

      if (cancelled) {
        return;
      }

      setLocationSource(source);
      setUserPosition(userPoint);

      const vehicleOrigin = createVehicleOrigin(userPoint);
      const route = await fetchRouteData(
        vehicleOrigin,
        userPoint,
        routeAbortController.signal,
      );

      if (cancelled) {
        return;
      }

      const runtimeRoute: RuntimeRoute = {
        ...route,
        cumulativeDistances: buildCumulativeDistances(route.points),
      };

      routeRef.current = runtimeRoute;
      travelledDistanceRef.current = 0;
      simulationSpeedRef.current = getSimulationSpeedMetersPerSecond(
        runtimeRoute.totalDistanceMeters,
      );

      setRouteSource(runtimeRoute.source);
      setVehiclePosition(vehicleOrigin);
      setRemainingDistanceMeters(runtimeRoute.totalDistanceMeters);
      setEtaMinutes(
        runtimeRoute.totalDistanceMeters / simulationSpeedRef.current / 60,
      );

      const routeLatLngs = runtimeRoute.points.map(toLeafletPoint);
      const bounds = L.latLngBounds(routeLatLngs);

      routeShadowRef.current = L.polyline(routeLatLngs, {
        color: "#e5e7eb",
        weight: 12,
        opacity: 0.9,
        lineCap: "round",
        lineJoin: "round",
      }).addTo(map);

      activeRouteRef.current = L.polyline(routeLatLngs, {
        color: "#111827",
        weight: 4,
        opacity: 0.92,
        lineCap: "round",
        lineJoin: "round",
      }).addTo(map);

      travelledRouteRef.current = L.polyline([toLeafletPoint(vehicleOrigin)], {
        color: "#9ca3af",
        weight: 5,
        opacity: 0.95,
        lineCap: "round",
        lineJoin: "round",
      }).addTo(map);

      userMarkerRef.current = L.marker(toLeafletPoint(userPoint), {
        icon: L.divIcon({
          className: "",
          iconSize: [28, 28],
          iconAnchor: [14, 14],
          html: `
            <div class="resq-user-marker">
              <span class="resq-user-marker__pulse"></span>
              <span class="resq-user-marker__core"></span>
            </div>
          `,
        }),
      }).addTo(map);

      vehicleMarkerRef.current = L.marker(toLeafletPoint(vehicleOrigin), {
        icon: L.divIcon({
          className: "",
          iconSize: [68, 44],
          iconAnchor: [34, 22],
          html: `
            <div class="resq-vehicle-marker" style="--vehicle-bearing: 0deg;">
              <div class="resq-vehicle-marker__bubble">
                <svg viewBox="0 0 80 52" aria-hidden="true">
                  <rect x="8" y="15" width="34" height="22" rx="8"></rect>
                  <path d="M42 20.5C42 17.4624 44.4624 15 47.5 15H56.7C58.1783 15 59.5866 15.6284 60.5736 16.7288L67.8736 24.8667C68.7766 25.8735 69.2766 27.1779 69.2766 28.5302V37C69.2766 40.3137 66.5903 43 63.2766 43H60.5C60.5 38.8579 57.1421 35.5 53 35.5C48.8579 35.5 45.5 38.8579 45.5 43H34.5C34.5 38.8579 31.1421 35.5 27 35.5C22.8579 35.5 19.5 38.8579 19.5 43H16.5C13.1863 43 10.5 40.3137 10.5 37V20.5H42Z"></path>
                  <rect x="47" y="19" width="10" height="8" rx="3"></rect>
                  <circle cx="27" cy="43" r="5.5"></circle>
                  <circle cx="53" cy="43" r="5.5"></circle>
                </svg>
              </div>
            </div>
          `,
        }),
      }).addTo(map);

      map.fitBounds(bounds, {
        paddingTopLeft: [72, 72],
        paddingBottomRight: [72, 240],
        maxZoom: 15,
      });

      setIsLoading(false);

      movementIntervalRef.current = window.setInterval(() => {
        const currentRoute = routeRef.current;
        const currentMap = mapRef.current;

        if (!currentRoute || !currentMap) {
          return;
        }

        const nextTravelledDistance = Math.min(
          travelledDistanceRef.current +
            simulationSpeedRef.current * (MAP_TICK_MS / 1000),
          currentRoute.totalDistanceMeters,
        );

        travelledDistanceRef.current = nextTravelledDistance;

        const nextVehiclePoint = getPointAlongRoute(
          currentRoute.points,
          currentRoute.cumulativeDistances,
          nextTravelledDistance,
        );
        const remainingDistance = Math.max(
          currentRoute.totalDistanceMeters - nextTravelledDistance,
          0,
        );
        const nextEtaMinutes = remainingDistance / simulationSpeedRef.current / 60;
        const segmentIndex = getSegmentIndexAtDistance(
          currentRoute.cumulativeDistances,
          nextTravelledDistance,
        );
        const heading = getBearingAlongRoute(
          currentRoute.points,
          currentRoute.cumulativeDistances,
          nextTravelledDistance,
        );

        vehicleMarkerRef.current?.setLatLng(toLeafletPoint(nextVehiclePoint));
        vehicleMarkerRef.current
          ?.getElement()
          ?.style.setProperty("--vehicle-bearing", `${heading}deg`);

        const travelledPoints = [
          ...currentRoute.points.slice(0, segmentIndex + 1),
          nextVehiclePoint,
        ].map(toLeafletPoint);
        const remainingPoints = [
          nextVehiclePoint,
          ...currentRoute.points.slice(segmentIndex + 1),
        ].map(toLeafletPoint);

        travelledRouteRef.current?.setLatLngs(travelledPoints);
        activeRouteRef.current?.setLatLngs(remainingPoints);

        if (
          followVehicleRef.current &&
          Date.now() - lastFollowPanAtRef.current > 850
        ) {
          lastFollowPanAtRef.current = Date.now();
          currentMap.panTo(toLeafletPoint(nextVehiclePoint), {
            animate: true,
            duration: 0.9,
          });
        }

        setVehiclePosition(nextVehiclePoint);
        setRemainingDistanceMeters(remainingDistance);
        setEtaMinutes(nextEtaMinutes);

        if (remainingDistance <= 0) {
          teardownMovement();
        }
      }, MAP_TICK_MS);
    };

    initialize().catch(() => {
      if (!cancelled) {
        setIsLoading(false);
      }
    });

    return () => {
      cancelled = true;
      routeAbortController.abort();
      teardownMovement();
      resizeObserverRef.current?.disconnect();
      resizeObserverRef.current = null;
      teardownLayers();
      mapRef.current?.remove();
      mapRef.current = null;
      routeRef.current = null;
    };
  }, [hasMounted]);

  const handleLocateMe = () => {
    if (!mapRef.current || !userPosition) {
      return;
    }

    setFollowVehicle(false);
    mapRef.current.flyTo(toLeafletPoint(userPosition), 16, {
      animate: true,
      duration: 1.1,
    });
  };

  const handleRecenter = () => {
    const currentMap = mapRef.current;
    const currentUser = userPosition;
    const currentVehicle = vehiclePosition;

    if (!currentMap || !currentUser || !currentVehicle) {
      return;
    }

    setFollowVehicle(false);

    currentMap.flyToBounds(
      [toLeafletPoint(currentUser), toLeafletPoint(currentVehicle)],
      {
        paddingTopLeft: [72, 72],
        paddingBottomRight: [72, 240],
        maxZoom: 15,
        duration: 1.1,
      },
    );
  };

  const handleToggleFollow = () => {
    setFollowVehicle((currentValue) => {
      const nextValue = !currentValue;

      if (nextValue && mapRef.current && vehiclePosition) {
        mapRef.current.flyTo(toLeafletPoint(vehiclePosition), 15, {
          animate: true,
          duration: 1.1,
        });
      }

      return nextValue;
    });
  };

  const routeModeLabel =
    routeSource === "osrm" ? "OSRM live route" : "Straight-line fallback";
  const locationModeLabel =
    locationSource === "browser" ? "Your browser GPS" : "Ho Chi Minh City fallback";

  return (
    <div className="relative isolate overflow-hidden rounded-[32px] border border-black/8 bg-[#e7eaee] shadow-[0_32px_90px_rgba(15,23,42,0.16)]">
      <div
        ref={mapElementRef}
        className="h-[75vh] min-h-[560px] w-full max-w-full bg-[#dfe3e8]"
      />

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.58),transparent_36%),linear-gradient(180deg,rgba(255,255,255,0.42),transparent_24%,transparent_68%,rgba(15,23,42,0.14)_100%)]" />

      <div className="pointer-events-none absolute left-4 top-4 flex max-w-[calc(100%-92px)] flex-wrap gap-2 sm:left-6 sm:top-6 sm:max-w-none">
        <Chip label={routeModeLabel} />
        <Chip label={locationModeLabel} />
        <Chip label={`Status · ${trackingStatus.label}`} />
      </div>

      <div className="pointer-events-none absolute right-4 top-4 flex flex-col gap-3 sm:right-6 sm:top-6">
        <MapActionButton
          active={false}
          icon={<LocateFixed size={16} />}
          label="Locate me"
          onClick={handleLocateMe}
        />
        <MapActionButton
          active={false}
          icon={<Crosshair size={16} />}
          label="Recenter"
          onClick={handleRecenter}
        />
        <MapActionButton
          active={followVehicle}
          icon={<Navigation size={16} />}
          label="Follow vehicle"
          onClick={handleToggleFollow}
        />
      </div>

      <div className="pointer-events-none absolute inset-x-3 bottom-3 sm:inset-x-6 sm:bottom-6">
        <div className="pointer-events-auto rounded-[30px] border border-white/70 bg-white/90 p-4 shadow-[0_28px_60px_rgba(15,23,42,0.2)] backdrop-blur-xl sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <div className="mb-3 flex flex-wrap gap-2">
                <StatusBadge label={trackingStatus.label} />
                <Chip label="Vehicle · Box van" muted />
              </div>

              <p className={`${display} text-[1.65rem] leading-[1.08] text-[#0f172a] sm:text-[2rem]`}>
                ResQ Vehicle is on the way
              </p>
              <p className={`${mono} mt-2 max-w-[520px] text-[12px] leading-6 text-[#475569] sm:text-[12.5px]`}>
                {trackingStatus.detail} Simulated movement is running fully on the
                client for frontend development, with browser geolocation and
                OSRM routing when available.
              </p>
            </div>

            <div className="inline-flex shrink-0 items-center gap-2 rounded-full border border-black/8 bg-[#f5f5f4] px-4 py-2">
              <Shield size={16} className="text-[#0f172a]" />
              <span className={`${mono} text-[11px] uppercase tracking-[0.2em] text-[#0f172a]`}>
                Unit 07 Ready
              </span>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <MetricCard label="Distance" value={formatDistance(remainingDistanceMeters)} />
            <MetricCard label="ETA" value={formatEta(etaMinutes)} />
            <MetricCard label="Status" value={trackingStatus.label} />
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Chip label="User marker uses browser geolocation" muted />
            <Chip label="Vehicle marker uses simulated live movement" muted />
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/65 backdrop-blur-[4px]">
          <div className="rounded-[24px] border border-black/8 bg-white/90 px-5 py-4 shadow-[0_24px_60px_rgba(15,23,42,0.14)]">
            <div className="flex items-center gap-3">
              <LoaderCircle className="animate-spin text-[#0f172a]" size={18} />
              <div>
                <p className={`${mono} text-[11px] uppercase tracking-[0.22em] text-[#64748b]`}>
                  Preparing map
                </p>
                <p className={`${display} text-[1.1rem] text-[#0f172a]`}>
                  Locking route and vehicle position...
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Chip({
  label,
  muted = false,
}: {
  label: string;
  muted?: boolean;
}) {
  return (
    <span
      className={`${mono} inline-flex items-center rounded-full border px-3 py-1.5 text-[11px] uppercase tracking-[0.16em] ${
        muted
          ? "border-black/8 bg-[#f8fafc] text-[#475569]"
          : "border-white/70 bg-white/88 text-[#0f172a] shadow-[0_10px_24px_rgba(15,23,42,0.08)]"
      }`}
    >
      {label}
    </span>
  );
}

function StatusBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-[#111827] px-3 py-1.5">
      <BadgeCheck size={14} className="text-white" />
      <span className={`${mono} text-[11px] uppercase tracking-[0.16em] text-white`}>
        {label}
      </span>
    </span>
  );
}

function MetricCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[22px] border border-black/8 bg-[#f8fafc] px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.68)]">
      <p className={`${mono} text-[11px] uppercase tracking-[0.18em] text-[#64748b]`}>
        {label}
      </p>
      <p className={`${display} mt-2 text-[1.4rem] leading-none text-[#0f172a]`}>
        {value}
      </p>
    </div>
  );
}

function MapActionButton({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`pointer-events-auto flex items-center gap-2 rounded-full border px-3 py-3 shadow-[0_20px_36px_rgba(15,23,42,0.18)] transition-all hover:-translate-y-[1px] ${
        active
          ? "border-[#111827] bg-[#111827] text-white"
          : "border-white/80 bg-white/92 text-[#111827] backdrop-blur-xl"
      }`}
      aria-pressed={active}
    >
      <span className="grid size-4 place-items-center">{icon}</span>
      <span className={`${mono} hidden text-[11px] uppercase tracking-[0.16em] sm:inline`}>
        {label}
      </span>
    </button>
  );
}

function toLeafletPoint(point: GeoPoint): [number, number] {
  return [point.lat, point.lng];
}
