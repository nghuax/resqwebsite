import { startTransition, useCallback, useEffect, useState } from "react";
import { loadGarageMapData } from "./garageMapService";
import type { GarageMapDataResponse } from "./garageMapTypes";

type GarageMapDataState =
  | {
      status: "loading";
      data: null;
      error: null;
    }
  | {
      status: "success";
      data: GarageMapDataResponse;
      error: null;
    }
  | {
      status: "error";
      data: null;
      error: string;
    };

const initialState: GarageMapDataState = {
  status: "loading",
  data: null,
  error: null,
};

const CACHE_STORAGE_KEY = "resq.garageMapData.v1";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

type CachedPayload = {
  cachedAt: number;
  data: GarageMapDataResponse;
};

function readCachedData(): GarageMapDataResponse | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(CACHE_STORAGE_KEY);

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as CachedPayload;

    if (
      !parsed ||
      typeof parsed.cachedAt !== "number" ||
      !parsed.data ||
      !Array.isArray(parsed.data.garages) ||
      parsed.data.garages.length === 0
    ) {
      return null;
    }

    if (Date.now() - parsed.cachedAt > CACHE_TTL_MS) {
      return null;
    }

    return parsed.data;
  } catch {
    return null;
  }
}

function writeCachedData(data: GarageMapDataResponse) {
  if (typeof window === "undefined" || data.garages.length === 0) {
    return;
  }

  try {
    const payload: CachedPayload = { cachedAt: Date.now(), data };
    window.localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Storage can be unavailable (private mode, quota). Ignore silently.
  }
}

export function useGarageMapData() {
  const [state, setState] = useState<GarageMapDataState>(() => {
    const cached = readCachedData();

    if (cached) {
      return { status: "success", data: cached, error: null };
    }

    return initialState;
  });
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let isCancelled = false;

    void loadGarageMapData()
      .then((data) => {
        if (isCancelled) {
          return;
        }

        writeCachedData(data);

        startTransition(() => {
          setState({
            status: "success",
            data,
            error: null,
          });
        });
      })
      .catch((error: unknown) => {
        if (isCancelled) {
          return;
        }

        startTransition(() => {
          setState((previous) => {
            if (previous.status === "success") {
              return previous;
            }

            return {
              status: "error",
              data: null,
              error:
                error instanceof Error
                  ? error.message
                  : "Garage data could not be loaded.",
            };
          });
        });
      });

    return () => {
      isCancelled = true;
    };
  }, [reloadToken]);

  const reload = useCallback(() => {
    setReloadToken((value) => value + 1);
  }, []);

  return {
    ...state,
    reload,
  };
}
