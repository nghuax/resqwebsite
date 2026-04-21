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

export function useGarageMapData() {
  const [state, setState] = useState<GarageMapDataState>(initialState);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let isCancelled = false;

    startTransition(() => {
      setState(initialState);
    });

    void loadGarageMapData()
      .then((data) => {
        if (isCancelled) {
          return;
        }

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
          setState({
            status: "error",
            data: null,
            error:
              error instanceof Error
                ? error.message
                : "Garage data could not be loaded.",
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
