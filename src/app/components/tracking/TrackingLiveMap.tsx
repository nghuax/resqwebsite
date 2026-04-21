"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { Map as LeafletMap, Marker as LeafletMarker, Polyline as LeafletPolyline } from "leaflet";
import {
  Crosshair,
  LocateFixed,
  LoaderCircle,
  LockKeyhole,
  Navigation,
} from "lucide-react";
import type { ResQAuthRole } from "@/utils/supabase/auth";
import { useLanguage } from "../LanguageContext";
import { localizeTrackingStatusLabel, t } from "../localization";
import { useResolvedRequestLocations } from "./requestLocations";
import {
  buildSecureWebsiteUrl,
  createVehicleOrigin,
  fetchRouteData,
  getBrowserGeolocationState,
  getTrackingStatus,
  HO_CHI_MINH_CITY_FALLBACK,
  measureDistanceMeters,
  type GeoPoint,
} from "./tracking-utils";

const DEFAULT_ZOOM = 14;
const MAP_TOP_PADDING = 72;
const MAP_EDGE_PADDING = 72;

const mono = "font-['IBM_Plex_Mono',monospace]";

export function TrackingLiveMap({
  requestId,
  actorId,
  actorRole,
  destinationPoint,
  destinationAddress,
  compact = false,
}: {
  requestId: string;
  actorId?: string | null;
  actorRole: ResQAuthRole;
  destinationPoint?: GeoPoint | null;
  destinationAddress?: string | null;
  compact?: boolean;
}) {
  const { language } = useLanguage();
  const isEnglish = language === "en";
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const userMarkerRef = useRef<LeafletMarker | null>(null);
  const vehicleMarkerRef = useRef<LeafletMarker | null>(null);
  const routeShadowRef = useRef<LeafletPolyline | null>(null);
  const activeRouteRef = useRef<LeafletPolyline | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const hasFitBoundsRef = useRef(false);
  const lastFollowPanAtRef = useRef(0);

  const [hasMounted, setHasMounted] = useState(false);
  const [isRouting, setIsRouting] = useState(true);
  const [followVehicle, setFollowVehicle] = useState(true);
  const [remainingDistanceMeters, setRemainingDistanceMeters] = useState(0);
  const geolocationState = useMemo(() => getBrowserGeolocationState(), []);
  const secureWebsiteUrl = useMemo(() => {
    if (typeof window === "undefined") {
      return null;
    }

    return buildSecureWebsiteUrl(
      window.location.pathname,
      window.location.search,
      window.location.hash,
    );
  }, []);

  const { locations, isLoading: isLoadingLocations } = useResolvedRequestLocations({
    requestId,
    actorId,
    actorRole,
    fallbackUserPoint: destinationPoint,
    fallbackUserAddress: destinationAddress,
  });

  const userPosition = useMemo(() => {
    return (
      locations.user?.point ??
      destinationPoint ??
      HO_CHI_MINH_CITY_FALLBACK
    );
  }, [destinationPoint, locations.user?.point]);

  const fixerPosition = useMemo(() => {
    return locations.fixer?.point ?? createVehicleOrigin(userPosition);
  }, [locations.fixer?.point, userPosition]);

  const trackingStatus = useMemo(
    () => getTrackingStatus(remainingDistanceMeters),
    [remainingDistanceMeters],
  );

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    hasFitBoundsRef.current = false;
  }, [requestId]);

  useEffect(() => {
    if (!hasMounted || !mapElementRef.current) {
      return;
    }

    let cancelled = false;

    const initialize = async () => {
      const L = await import("leaflet");

      if (cancelled || !mapElementRef.current) {
        return;
      }

      const map = L.map(mapElementRef.current, {
        zoomControl: false,
        attributionControl: true,
        preferCanvas: true,
      }).setView([userPosition.lat, userPosition.lng], DEFAULT_ZOOM);

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

      window.requestAnimationFrame(() => {
        map.invalidateSize();
        window.setTimeout(() => map.invalidateSize(), 180);
      });

      userMarkerRef.current = L.marker(toLeafletPoint(userPosition), {
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

      vehicleMarkerRef.current = L.marker(toLeafletPoint(fixerPosition), {
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

      routeShadowRef.current = L.polyline([toLeafletPoint(fixerPosition), toLeafletPoint(userPosition)], {
        color: "#f7d6d2",
        weight: 12,
        opacity: 0.9,
        lineCap: "round",
        lineJoin: "round",
      }).addTo(map);

      activeRouteRef.current = L.polyline([toLeafletPoint(fixerPosition), toLeafletPoint(userPosition)], {
        color: "#ee3224",
        weight: 4,
        opacity: 0.92,
        lineCap: "round",
        lineJoin: "round",
      }).addTo(map);
    };

    void initialize();

    return () => {
      cancelled = true;
      resizeObserverRef.current?.disconnect();
      resizeObserverRef.current = null;
      routeShadowRef.current?.remove();
      activeRouteRef.current?.remove();
      userMarkerRef.current?.remove();
      vehicleMarkerRef.current?.remove();
      routeShadowRef.current = null;
      activeRouteRef.current = null;
      userMarkerRef.current = null;
      vehicleMarkerRef.current = null;
      mapRef.current?.remove();
      mapRef.current = null;
      hasFitBoundsRef.current = false;
    };
  }, [hasMounted]);

  useEffect(() => {
    if (!hasMounted || !mapRef.current) {
      return;
    }

    const currentMap = mapRef.current;
    const currentUser = userPosition;
    const currentFixer = fixerPosition;
    let cancelled = false;
    const routeAbortController = new AbortController();

    setIsRouting(true);
    userMarkerRef.current?.setLatLng(toLeafletPoint(currentUser));
    vehicleMarkerRef.current?.setLatLng(toLeafletPoint(currentFixer));

    void fetchRouteData(currentFixer, currentUser, routeAbortController.signal)
      .then((route) => {
        if (cancelled) {
          return;
        }

        const routeLatLngs = route.points.map(toLeafletPoint);
        const bounds = routeLatLngs.length > 1
          ? [toLeafletPoint(currentFixer), ...routeLatLngs, toLeafletPoint(currentUser)]
          : [toLeafletPoint(currentFixer), toLeafletPoint(currentUser)];

        routeShadowRef.current?.setLatLngs(routeLatLngs);
        activeRouteRef.current?.setLatLngs(routeLatLngs);
        setRemainingDistanceMeters(route.totalDistanceMeters);

        if (!hasFitBoundsRef.current) {
          currentMap.flyToBounds(bounds, {
            paddingTopLeft: [MAP_EDGE_PADDING, MAP_TOP_PADDING],
            paddingBottomRight: [MAP_EDGE_PADDING, MAP_EDGE_PADDING],
            maxZoom: 15,
            duration: 1.1,
          });
          hasFitBoundsRef.current = true;
        } else if (
          followVehicle &&
          Date.now() - lastFollowPanAtRef.current > 850
        ) {
          lastFollowPanAtRef.current = Date.now();
          currentMap.panTo(toLeafletPoint(currentFixer), {
            animate: true,
            duration: 0.9,
          });
        }
      })
      .catch(() => {
        if (!cancelled) {
          const directDistance = measureDistanceMeters(currentFixer, currentUser);
          const straightRoute = [toLeafletPoint(currentFixer), toLeafletPoint(currentUser)];
          routeShadowRef.current?.setLatLngs(straightRoute);
          activeRouteRef.current?.setLatLngs(straightRoute);
          setRemainingDistanceMeters(directDistance);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsRouting(false);
        }
      });

    return () => {
      cancelled = true;
      routeAbortController.abort();
    };
  }, [fixerPosition, followVehicle, hasMounted, userPosition]);

  const handleLocateMe = () => {
    if (!mapRef.current) {
      return;
    }

    mapRef.current.flyTo(toLeafletPoint(userPosition), 16, {
      animate: true,
      duration: 1.1,
    });
  };

  const handleRecenter = () => {
    if (!mapRef.current) {
      return;
    }

    setFollowVehicle(false);
    mapRef.current.flyToBounds(
      [toLeafletPoint(userPosition), toLeafletPoint(fixerPosition)],
      {
        paddingTopLeft: [MAP_EDGE_PADDING, MAP_TOP_PADDING],
        paddingBottomRight: [MAP_EDGE_PADDING, MAP_EDGE_PADDING],
        maxZoom: 15,
        duration: 1.1,
      },
    );
  };

  const handleToggleFollow = () => {
    setFollowVehicle((currentValue) => {
      const nextValue = !currentValue;

      if (nextValue && mapRef.current) {
        mapRef.current.flyTo(toLeafletPoint(fixerPosition), 15, {
          animate: true,
          duration: 1.1,
        });
      }

      return nextValue;
    });
  };

  return (
    <div className="relative isolate overflow-hidden rounded-[20px] border border-[rgba(4,38,153,0.08)] bg-white shadow-[0_18px_50px_rgba(8,11,13,0.08)]">
      <div
        ref={mapElementRef}
        className={`w-full max-w-full bg-[#e9edf1] ${
          compact ? "h-[240px] sm:h-[260px] lg:h-[280px]" : "h-[360px] sm:h-[500px] lg:h-[640px]"
        }`}
      />

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.54),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.24),transparent_24%,transparent_70%,rgba(8,11,13,0.12)_100%)]" />

      <div className="pointer-events-none absolute left-3 top-3 sm:left-6 sm:top-6">
        <span className={`${mono} inline-flex items-center rounded-full border border-white/70 bg-white/92 px-3 py-2 text-[11px] uppercase tracking-[0.16em] text-[#4a5565] shadow-[0_14px_30px_rgba(8,11,13,0.08)] backdrop-blur-[14px]`}>
          {localizeTrackingStatusLabel(trackingStatus.label, isEnglish)}
        </span>
      </div>

      <div className="pointer-events-none absolute bottom-3 right-3 flex flex-col gap-3 sm:bottom-auto sm:right-6 sm:top-6">
        <MapActionButton
          active={false}
          icon={<LocateFixed size={16} />}
          label={t(isEnglish, "Vị trí tôi", "My location")}
          onClick={handleLocateMe}
        />
        <MapActionButton
          active={false}
          icon={<Crosshair size={16} />}
          label={t(isEnglish, "Căn giữa", "Center")}
          onClick={handleRecenter}
        />
        <MapActionButton
          active={followVehicle}
          icon={<Navigation size={16} />}
          label={t(isEnglish, "Theo fixer", "Follow fixer")}
          onClick={handleToggleFollow}
        />
      </div>

      {(isLoadingLocations || isRouting) && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/65 backdrop-blur-[4px]">
          <div className="rounded-[20px] border border-[rgba(4,38,153,0.08)] bg-white px-5 py-4 shadow-[0_18px_50px_rgba(8,11,13,0.12)]">
            <div className="flex items-center gap-3">
              <LoaderCircle className="animate-spin text-[#ee3224]" size={18} />
              <div>
                <p className={`${mono} text-[11px] uppercase tracking-[0.22em] text-[#99a1af]`}>
                  {t(isEnglish, "Đang đồng bộ theo thời gian thực", "Syncing in real time")}
                </p>
                <p className={`${mono} text-[15px] font-[500] text-[#080b0d]`}>
                  {t(isEnglish, "Đang lấy vị trí user và fixer...", "Loading user and fixer locations...")}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {geolocationState.reason === "insecure-context" && (
        <div className="pointer-events-none absolute inset-x-3 bottom-3 sm:left-6 sm:bottom-6 sm:right-auto sm:max-w-[420px]">
          <div className="pointer-events-auto rounded-[18px] border border-[rgba(238,50,36,0.16)] bg-[rgba(255,247,245,0.96)] px-4 py-4 shadow-[0_18px_32px_rgba(8,11,13,0.12)] backdrop-blur-[14px]">
            <div className="flex items-start gap-3">
              <div className="mt-[2px] flex size-[30px] items-center justify-center rounded-full bg-[rgba(238,50,36,0.12)]">
                <LockKeyhole size={14} className="text-[#ee3224]" />
              </div>
              <div className="min-w-0">
                <p className={`${mono} text-[11px] uppercase tracking-[0.18em] text-[#ee3224]`}>
                  {t(isEnglish, "GPS bị chặn trên bản HTTP", "GPS is blocked on HTTP")}
                </p>
                <p className={`${mono} mt-2 text-[12px] leading-[20px] text-[#4a5565]`}>
                  {t(
                    isEnglish,
                    "Trình duyệt sẽ không cấp quyền vị trí trên domain public hiện tại. Mở bản HTTPS để theo dõi user và fixer bằng GPS thực.",
                    "The browser will not grant location permission on the current public HTTP domain. Open the HTTPS version to track the user and fixer with live GPS.",
                  )}
                </p>
                {secureWebsiteUrl && (
                  <a
                    href={secureWebsiteUrl}
                    className="mt-3 inline-flex h-[36px] items-center justify-center rounded-full bg-[#ee3224] px-4 no-underline transition-colors hover:bg-[#d42b1e]"
                  >
                    <span className={`${mono} text-[10px] uppercase tracking-[0.16em] text-white`}>
                      {t(isEnglish, "Mở bản HTTPS", "Open HTTPS")}
                    </span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
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
      className={`pointer-events-auto flex items-center gap-2 rounded-full border px-3 py-3 shadow-[0_18px_30px_rgba(8,11,13,0.14)] transition-all hover:-translate-y-[1px] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(238,50,36,0.14)] ${
        active
          ? "border-[#ee3224] bg-[#ee3224] text-white"
          : "border-[rgba(4,38,153,0.08)] bg-white text-[#080b0d] hover:border-[rgba(238,50,36,0.18)]"
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
