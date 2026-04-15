import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import type { ResQAuthRole } from "@/utils/supabase/auth";
import { createClient } from "@/utils/supabase/client";
import {
  getBrowserGeolocationState,
  HO_CHI_MINH_CITY_FALLBACK,
  measureDistanceMeters,
  type GeoPoint,
} from "./tracking-utils";

export type RequestLocationRole = ResQAuthRole;

export type RequestLiveLocation = {
  requestId: string;
  actorId: string | null;
  actorRole: RequestLocationRole;
  point: GeoPoint;
  heading: number | null;
  accuracy: number | null;
  source: "browser" | "fallback" | "manual";
  address: string | null;
  updatedAt: string;
};

type RequestLocationRecord = {
  request_id: string;
  actor_id: string | null;
  actor_role: RequestLocationRole;
  latitude: number;
  longitude: number;
  heading: number | null;
  accuracy: number | null;
  source: "browser" | "fallback" | "manual";
  address: string | null;
  updated_at: string;
};

type RequestLocationState = {
  user: RequestLiveLocation | null;
  fixer: RequestLiveLocation | null;
};

const REQUEST_LOCATIONS_TABLE = "service_request_locations";
const REQUEST_LOCATION_EVENT = "resq-request-location-change";
const LOCATION_PUSH_MIN_METERS = 10;
const LOCATION_PUSH_MIN_MS = 8_000;
const LOCATION_REFRESH_MS = 12_000;

function toLocationState(records: RequestLocationRecord[]) {
  return records.reduce<RequestLocationState>(
    (accumulator, record) => {
      const nextLocation: RequestLiveLocation = {
        requestId: record.request_id,
        actorId: record.actor_id,
        actorRole: record.actor_role,
        point: {
          lat: record.latitude,
          lng: record.longitude,
        },
        heading: record.heading,
        accuracy: record.accuracy,
        source: record.source,
        address: record.address,
        updatedAt: record.updated_at,
      };

      accumulator[record.actor_role] = nextLocation;
      return accumulator;
    },
    {
      user: null,
      fixer: null,
    },
  );
}

async function fetchRequestLocations(requestId: string) {
  const { data, error } = await createClient()
    .from(REQUEST_LOCATIONS_TABLE)
    .select(
      "request_id, actor_id, actor_role, latitude, longitude, heading, accuracy, source, address, updated_at",
    )
    .eq("request_id", requestId)
    .order("updated_at", { ascending: false });

  if (error) {
    throw error;
  }

  return toLocationState((data ?? []) as RequestLocationRecord[]);
}

export async function publishRequestLocation(input: {
  requestId: string;
  actorId: string;
  actorRole: RequestLocationRole;
  point: GeoPoint;
  heading?: number | null;
  accuracy?: number | null;
  source?: "browser" | "fallback" | "manual";
  address?: string | null;
}) {
  const { error } = await createClient()
    .from(REQUEST_LOCATIONS_TABLE)
    .upsert(
      {
        request_id: input.requestId,
        actor_id: input.actorId,
        actor_role: input.actorRole,
        latitude: input.point.lat,
        longitude: input.point.lng,
        heading: input.heading ?? null,
        accuracy: input.accuracy ?? null,
        source: input.source ?? "browser",
        address: input.address ?? null,
      },
      {
        onConflict: "request_id,actor_role",
      },
    );

  if (error) {
    throw error;
  }
}

export function seedRequestLocation(input: {
  requestId: string;
  actorId: string | null;
  actorRole: RequestLocationRole;
  point: GeoPoint;
  source?: "browser" | "fallback" | "manual";
  address?: string | null;
}) {
  if (!input.actorId) {
    return;
  }

  void publishRequestLocation({
    requestId: input.requestId,
    actorId: input.actorId,
    actorRole: input.actorRole,
    point: input.point,
    source: input.source,
    address: input.address,
  }).catch(() => {
    // Keep request creation responsive even if live-location sync is temporarily unavailable.
  });
}

function useRequestLocations(input: {
  requestId: string | null;
  actorId?: string | null;
  actorRole?: RequestLocationRole;
  fallbackUserPoint?: GeoPoint | null;
  fallbackUserAddress?: string | null;
}) {
  const {
    requestId,
    fallbackUserPoint,
    fallbackUserAddress,
  } = input;
  const [locations, setLocations] = useState<RequestLocationState>({
    user: null,
    fixer: null,
  });
  const [isLoading, setIsLoading] = useState(Boolean(requestId));
  const activeChannelRef = useRef<RealtimeChannel | null>(null);

  const reload = useCallback(async () => {
    if (!requestId) {
      setLocations({
        user: null,
        fixer: null,
      });
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const nextLocations = await fetchRequestLocations(requestId);

      if (!nextLocations.user && fallbackUserPoint) {
        nextLocations.user = {
          requestId,
          actorId: null,
          actorRole: "user",
          point: fallbackUserPoint,
          heading: null,
          accuracy: null,
          source: "manual",
          address: fallbackUserAddress ?? null,
          updatedAt: new Date(0).toISOString(),
        };
      }

      setLocations(nextLocations);
    } catch {
      setLocations((currentValue) => {
        if (currentValue.user || !fallbackUserPoint || !requestId) {
          return currentValue;
        }

        return {
          ...currentValue,
          user: {
            requestId,
            actorId: null,
            actorRole: "user",
            point: fallbackUserPoint,
            heading: null,
            accuracy: null,
            source: "manual",
            address: fallbackUserAddress ?? null,
            updatedAt: new Date(0).toISOString(),
          },
        };
      });
    } finally {
      setIsLoading(false);
    }
  }, [fallbackUserAddress, fallbackUserPoint, requestId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  useEffect(() => {
    if (!requestId) {
      activeChannelRef.current = null;
      return;
    }

    const supabase = createClient();
    const channel = supabase
      .channel(`resq-request-locations:${requestId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: REQUEST_LOCATIONS_TABLE,
          filter: `request_id=eq.${requestId}`,
        },
        () => {
          void reload();
          if (typeof window !== "undefined") {
            window.dispatchEvent(
              new CustomEvent(REQUEST_LOCATION_EVENT, {
                detail: { requestId },
              }),
            );
          }
        },
      )
      .subscribe();

    activeChannelRef.current = channel;

    return () => {
      void supabase.removeChannel(channel);
      activeChannelRef.current = null;
    };
  }, [reload, requestId]);

  useEffect(() => {
    if (!requestId || typeof window === "undefined") {
      return;
    }

    const intervalId = window.setInterval(() => {
      void reload();
    }, LOCATION_REFRESH_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [
    reload,
    requestId,
  ]);

  return {
    locations,
    isLoading,
  };
}

export function useResolvedRequestLocations(input: {
  requestId: string | null;
  actorId?: string | null;
  actorRole?: RequestLocationRole;
  fallbackUserPoint?: GeoPoint | null;
  fallbackUserAddress?: string | null;
}) {
  const { locations, isLoading } = useRequestLocations(input);

  const resolvedLocations = useMemo(() => {
    const userLocation =
      locations.user ??
      (input.requestId
        ? {
            requestId: input.requestId,
            actorId: null,
            actorRole: "user" as const,
            point: input.fallbackUserPoint ?? HO_CHI_MINH_CITY_FALLBACK,
            heading: null,
            accuracy: null,
            source: "manual" as const,
            address: input.fallbackUserAddress ?? null,
            updatedAt: new Date(0).toISOString(),
          }
        : null);

    const fixerLocation =
      locations.fixer ??
      (userLocation
        ? {
            requestId: userLocation.requestId,
            actorId: null,
            actorRole: "fixer" as const,
            point: {
              lat: userLocation.point.lat + 0.0205,
              lng: userLocation.point.lng - 0.026,
            },
            heading: null,
            accuracy: null,
            source: "fallback" as const,
            address: null,
            updatedAt: new Date(0).toISOString(),
          }
        : null);

    return {
      user: userLocation,
      fixer: fixerLocation,
    };
  }, [
    input.fallbackUserAddress,
    input.fallbackUserPoint,
    input.requestId,
    locations.fixer,
    locations.user,
  ]);

  return {
    locations: resolvedLocations,
    isLoading,
  };
}

export function useLiveRequestLocationSync(input: {
  requestId: string | null;
  actorId?: string | null;
  actorRole?: RequestLocationRole;
  fallbackUserPoint?: GeoPoint | null;
  fallbackUserAddress?: string | null;
}) {
  const {
    requestId,
    actorId,
    actorRole,
    fallbackUserPoint,
    fallbackUserAddress,
  } = input;
  const watchIdRef = useRef<number | null>(null);
  const lastPublishedRef = useRef<{
    point: GeoPoint;
    publishedAt: number;
  } | null>(null);

  useEffect(() => {
    if (!requestId || !actorId || !actorRole || typeof window === "undefined") {
      return;
    }

    const geolocationState = getBrowserGeolocationState();

    if (!geolocationState.supported) {
      if (actorRole === "user" && fallbackUserPoint) {
        void publishRequestLocation({
          requestId,
          actorId,
          actorRole,
          point: fallbackUserPoint,
          source: "manual",
          address: fallbackUserAddress ?? null,
        }).catch(() => {
          // Keep the request visible with the saved pickup point even without live GPS.
        });
      }
      return;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const nextPoint = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        const now = Date.now();
        const lastPublished = lastPublishedRef.current;

        if (
          lastPublished &&
          measureDistanceMeters(lastPublished.point, nextPoint) < LOCATION_PUSH_MIN_METERS &&
          now - lastPublished.publishedAt < LOCATION_PUSH_MIN_MS
        ) {
          return;
        }

        lastPublishedRef.current = {
          point: nextPoint,
          publishedAt: now,
        };

        void publishRequestLocation({
          requestId,
          actorId,
          actorRole,
          point: nextPoint,
          accuracy: position.coords.accuracy,
          heading:
            typeof position.coords.heading === "number" && !Number.isNaN(position.coords.heading)
              ? position.coords.heading
              : null,
          source: "browser",
          address: actorRole === "user" ? fallbackUserAddress ?? null : null,
        }).catch(() => {
          // Keep the tracking flow responsive even if a location push misses one cycle.
        });
      },
      () => {
        if (actorRole === "user" && fallbackUserPoint) {
          void publishRequestLocation({
            requestId,
            actorId,
            actorRole,
            point: fallbackUserPoint,
            source: "manual",
            address: fallbackUserAddress ?? null,
          }).catch(() => {
            // Ignore fallback sync errors and keep the last known request point visible.
          });
        }
      },
      {
        enableHighAccuracy: true,
        maximumAge: 8_000,
        timeout: 12_000,
      },
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [
    actorId,
    actorRole,
    fallbackUserAddress,
    fallbackUserPoint,
    requestId,
  ]);
}
