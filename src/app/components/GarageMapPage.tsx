import {
  startTransition,
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { LoaderCircle, MapPin, TriangleAlert } from "lucide-react";
import { useLanguage } from "./LanguageContext";
import { useIsMobile } from "./ui/use-mobile";
import {
  getUserLocation,
  measureDistanceMeters,
  type GeoPoint,
} from "./tracking/tracking-utils";
import { garageMapSourceLinks } from "./garage-map/garageMapConfig";
import { GarageDetailsOverlay } from "./garage-map/GarageDetailsOverlay";
import { GarageListOverlay } from "./garage-map/GarageListOverlay";
import { GarageMap, type GarageMapCommand } from "./garage-map/GarageMap";
import { GarageTopOverlay, type GarageSortMode } from "./garage-map/GarageTopOverlay";
import { useGarageMapData } from "./garage-map/useGarageMapData";
import type {
  GarageCategory,
  GarageDataProvider,
  GarageRecord,
} from "./garage-map/garageMapTypes";

function t(isEnglish: boolean, vi: string, en: string) {
  return isEnglish ? en : vi;
}

function getProviderLabel(provider: GarageDataProvider | undefined, isEnglish: boolean) {
  if (provider === "google-places") {
    return isEnglish ? "Google Places live" : "Google Places live";
  }

  if (provider === "openstreetmap") {
    return isEnglish ? "OpenStreetMap live" : "OpenStreetMap live";
  }

  return isEnglish ? "Curated ResQ data" : "Du lieu ResQ da duyet";
}

function formatDistanceLabel(distanceMeters: number, isEnglish: boolean) {
  if (distanceMeters < 1000) {
    const rounded = Math.round(distanceMeters);
    return isEnglish ? `${rounded} m away` : `${rounded} m cach ban`;
  }

  const rounded = (distanceMeters / 1000).toFixed(distanceMeters >= 10_000 ? 0 : 1);
  return isEnglish ? `${rounded} km away` : `${rounded} km cach ban`;
}

function compareSmart(left: GarageRecord, right: GarageRecord) {
  const openScore = (garage: GarageRecord) =>
    garage.isOpen === true ? 0 : garage.isOpen === false ? 2 : 1;

  return (
    openScore(left) - openScore(right) ||
    (right.rating ?? -1) - (left.rating ?? -1) ||
    (right.reviewCount ?? -1) - (left.reviewCount ?? -1) ||
    left.name.localeCompare(right.name, "vi")
  );
}

export default function GarageMapPage() {
  const { language } = useLanguage();
  const isEnglish = language === "en";
  const isMobile = useIsMobile();
  const { status, data, error, reload } = useGarageMapData();
  const [activeCategory, setActiveCategory] = useState<GarageCategory>("car");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortMode, setSortMode] = useState<GarageSortMode>("smart");
  const [selectedGarageId, setSelectedGarageId] = useState<string | null>(null);
  const [isListExpanded, setIsListExpanded] = useState(true);
  const [userLocation, setUserLocation] = useState<GeoPoint | null>(null);
  const [isLocatingUser, setIsLocatingUser] = useState(false);
  const [mapCommand, setMapCommand] = useState<GarageMapCommand | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const deferredSearchTerm = useDeferredValue(searchTerm);

  useEffect(() => {
    if (isMobile) {
      setIsListExpanded(true);
      return;
    }

    setIsListExpanded(false);
  }, [isMobile]);

  const queueMapCommand = useCallback((kind: GarageMapCommand["kind"]) => {
    setMapCommand((previous) => ({
      kind,
      token: (previous?.token ?? 0) + 1,
    }));
  }, []);

  const handleMapReady = useCallback(() => {
    setIsMapReady(true);
    setMapError(null);
  }, []);

  const handleMapError = useCallback((message: string) => {
    setIsMapReady(false);
    setMapError(message);
  }, []);

  const requestUserLocation = useCallback(async (shouldCenter: boolean) => {
    setIsLocatingUser(true);

    try {
      const location = await getUserLocation();
      setUserLocation(location.point);

      if (shouldCenter) {
        queueMapCommand("center-user");
      }
    } finally {
      setIsLocatingUser(false);
    }
  }, [queueMapCommand]);

  useEffect(() => {
    if (sortMode === "nearest" && !userLocation && !isLocatingUser) {
      void requestUserLocation(false);
    }
  }, [isLocatingUser, requestUserLocation, sortMode, userLocation]);

  const counts = useMemo(
    () => ({
      car: data?.garages.filter((garage) => garage.type === "car").length ?? 0,
      motorcycle:
        data?.garages.filter((garage) => garage.type === "motorcycle").length ?? 0,
    }),
    [data],
  );

  const distanceById = useMemo(() => {
    if (!userLocation) {
      return {};
    }

    return Object.fromEntries(
      (data?.garages ?? []).map((garage) => [
        garage.id,
        measureDistanceMeters(userLocation, { lat: garage.lat, lng: garage.lng }),
      ]),
    ) as Record<string, number>;
  }, [data, userLocation]);

  const distanceLabelsById = useMemo(() => {
    return Object.fromEntries(
      Object.entries(distanceById).map(([garageId, distance]) => [
        garageId,
        formatDistanceLabel(distance, isEnglish),
      ]),
    );
  }, [distanceById, isEnglish]);

  const filteredGarages = useMemo(() => {
    const trimmedSearch = deferredSearchTerm.trim().toLowerCase();
    const categoryGarages =
      data?.garages.filter((garage) => garage.type === activeCategory) ?? [];

    const searchedGarages = !trimmedSearch
      ? categoryGarages
      : categoryGarages.filter((garage) => {
          const haystack = [
            garage.name,
            garage.address ?? "",
            garage.phone ?? "",
          ]
            .join(" ")
            .toLowerCase();

          return haystack.includes(trimmedSearch);
        });

    const sorted = [...searchedGarages];

    if (sortMode === "rating") {
      sorted.sort((left, right) => {
        return (
          (right.rating ?? -1) - (left.rating ?? -1) ||
          (right.reviewCount ?? -1) - (left.reviewCount ?? -1) ||
          left.name.localeCompare(right.name, "vi")
        );
      });

      return sorted;
    }

    if (sortMode === "reviews") {
      sorted.sort((left, right) => {
        return (
          (right.reviewCount ?? -1) - (left.reviewCount ?? -1) ||
          (right.rating ?? -1) - (left.rating ?? -1) ||
          left.name.localeCompare(right.name, "vi")
        );
      });

      return sorted;
    }

    if (sortMode === "nearest" && userLocation) {
      sorted.sort((left, right) => {
        return (
          (distanceById[left.id] ?? Number.POSITIVE_INFINITY) -
            (distanceById[right.id] ?? Number.POSITIVE_INFINITY) ||
          compareSmart(left, right)
        );
      });

      return sorted;
    }

    sorted.sort(compareSmart);
    return sorted;
  }, [
    activeCategory,
    data,
    deferredSearchTerm,
    distanceById,
    sortMode,
    userLocation,
  ]);

  const selectedGarage = useMemo(
    () => filteredGarages.find((garage) => garage.id === selectedGarageId) ?? null,
    [filteredGarages, selectedGarageId],
  );

  const activeSourceLink = useMemo(
    () =>
      (data?.sourceLinks ?? garageMapSourceLinks).find(
        (link) => link.type === activeCategory,
      ),
    [activeCategory, data],
  );

  useEffect(() => {
    if (filteredGarages.length === 0) {
      setSelectedGarageId(null);
      return;
    }

    if (selectedGarageId && !filteredGarages.some((garage) => garage.id === selectedGarageId)) {
      setSelectedGarageId(null);
    }
  }, [filteredGarages, selectedGarageId]);

  const handleSelectGarage = useCallback((garageId: string) => {
    setSelectedGarageId(garageId);
    queueMapCommand("center-selection");

    if (isMobile) {
      setIsListExpanded(false);
    }
  }, [isMobile, queueMapCommand]);

  const isLoadingScene = status === "loading" || (!isMapReady && !mapError);
  const sceneError = status === "error" ? error : mapError;
  const providerLabel = getProviderLabel(data?.provider, isEnglish);
  const visibleLabel =
    activeCategory === "car"
      ? t(isEnglish, "Garage o to", "Car garages")
      : t(isEnglish, "Garage xe may", "Motorcycle garages");

  return (
    <div className="relative isolate min-h-[calc(100vh-76px)] overflow-hidden bg-[#0f1318] sm:min-h-[calc(100vh-76px)] lg:min-h-[calc(100vh-88px)]">
      <div className="absolute inset-0 z-0">
        <GarageMap
          garages={filteredGarages}
          selectedGarageId={selectedGarageId}
          userLocation={userLocation}
          command={mapCommand}
          onSelectGarage={handleSelectGarage}
          onReady={handleMapReady}
          onError={handleMapError}
        />
        <div className="pointer-events-none absolute inset-0 z-[2] bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.36)_0%,rgba(255,255,255,0)_34%),linear-gradient(180deg,rgba(8,11,13,0.1)_0%,rgba(8,11,13,0.12)_100%)]" />
      </div>

      <GarageTopOverlay
        activeCategory={activeCategory}
        counts={counts}
        isEnglish={isEnglish}
        searchTerm={searchTerm}
        providerLabel={providerLabel}
        visibleCount={filteredGarages.length}
        sortMode={sortMode}
        isLocatingUser={isLocatingUser}
        activeSourceLink={activeSourceLink}
        onCategoryChange={(nextCategory) => {
          startTransition(() => {
            setActiveCategory(nextCategory);
            setSearchTerm("");
            setSelectedGarageId(null);
            queueMapCommand("fit-results");
          });
        }}
        onSearchChange={setSearchTerm}
        onSortChange={(nextMode) => {
          startTransition(() => {
            setSortMode(nextMode);
          });
        }}
        onLocateUser={() => {
          void requestUserLocation(true);
        }}
        onFitResults={() => {
          queueMapCommand("fit-results");
        }}
      />

      <GarageListOverlay
        garages={filteredGarages}
        isEnglish={isEnglish}
        isLoading={status === "loading"}
        errorMessage={status === "error" ? error : null}
        selectedGarageId={selectedGarageId}
        distanceLabelsById={distanceLabelsById}
        activeSourceLink={activeSourceLink}
        searchTerm={searchTerm}
        expanded={isListExpanded}
        visibleLabel={visibleLabel}
        onClearSearch={() => setSearchTerm("")}
        onRetry={reload}
        onToggleExpanded={() => setIsListExpanded((value) => !value)}
        onSelectGarage={handleSelectGarage}
      />

      <GarageDetailsOverlay
        garage={selectedGarage}
        isEnglish={isEnglish}
        isMobile={isMobile}
        onClose={() => setSelectedGarageId(null)}
      />

      {isLoadingScene && (
        <SceneOverlay>
          <div className="rounded-[26px] border border-white/42 bg-[rgba(255,255,255,0.88)] px-5 py-5 shadow-[0_28px_80px_rgba(8,11,13,0.18)] backdrop-blur-[20px]">
            <div className="flex items-center gap-3">
              <LoaderCircle size={18} className="animate-spin text-[#ee3224]" />
              <div>
                <p className="resq-eyebrow text-[#ee3224]">
                  {t(isEnglish, "Dang tai garage", "Loading garages")}
                </p>
                <p className="resq-body mt-2 text-[14px] leading-[22px] text-[#4e5766]">
                  {t(
                    isEnglish,
                    "Dang khoi tao man hinh ban do song va dua cac garage vao giao dien ResQ.",
                    "Setting up the live map scene and plotting garages into ResQ.",
                  )}
                </p>
              </div>
            </div>
          </div>
        </SceneOverlay>
      )}

      {!isLoadingScene && sceneError && (
        <SceneOverlay>
          <div className="max-w-[380px] rounded-[28px] border border-[#f7c9c3] bg-[rgba(255,255,255,0.92)] px-5 py-5 text-center shadow-[0_28px_80px_rgba(8,11,13,0.18)] backdrop-blur-[20px]">
            <div className="mx-auto flex size-[48px] items-center justify-center rounded-full bg-[rgba(238,50,36,0.08)]">
              <TriangleAlert size={20} className="text-[#ee3224]" />
            </div>
            <h2 className="resq-display mt-4 text-[28px] leading-[0.96] font-[700] text-[#080b0d]">
              {t(isEnglish, "Ban do chua san sang", "Map unavailable")}
            </h2>
            <p className="resq-body mt-3 text-[14px] leading-[22px] text-[#4e5766]">
              {sceneError}
            </p>
            <button
              type="button"
              onClick={reload}
              className="resq-button-pill resq-button-pill--primary mt-5 px-5 py-3"
            >
              {t(isEnglish, "Thu lai", "Retry")}
            </button>
          </div>
        </SceneOverlay>
      )}

      {!isLoadingScene && !sceneError && filteredGarages.length === 0 && (
        <SceneOverlay>
          <div className="max-w-[380px] rounded-[28px] border border-white/42 bg-[rgba(255,255,255,0.92)] px-5 py-5 text-center shadow-[0_28px_80px_rgba(8,11,13,0.18)] backdrop-blur-[20px]">
            <div className="mx-auto flex size-[48px] items-center justify-center rounded-full bg-[rgba(238,50,36,0.08)]">
              <MapPin size={20} className="text-[#ee3224]" />
            </div>
            <h2 className="resq-display mt-4 text-[28px] leading-[0.96] font-[700] text-[#080b0d]">
              {searchTerm.trim()
                ? t(isEnglish, "Khong tim thay garage", "No garages match this search")
                : t(isEnglish, "Chua co garage hien thi", "No garages available right now")}
            </h2>
            <p className="resq-body mt-3 text-[14px] leading-[22px] text-[#4e5766]">
              {searchTerm.trim()
                ? t(
                    isEnglish,
                    "Thu ten khac, doi danh muc, hoac xoa tim kiem de xem lai toan bo ket qua.",
                    "Try another name, change category, or clear the search to bring all results back.",
                  )
                : t(
                    isEnglish,
                    "He thong ban do da san sang, nhung hien tai chua co garage phu hop cho bo loc nay.",
                    "The map scene is ready, but there are no garages for the current filters yet.",
                  )}
            </p>
          </div>
        </SceneOverlay>
      )}
    </div>
  );
}

function SceneOverlay({ children }: { children: ReactNode }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-[1500] flex items-center justify-center px-4">
      <div className="pointer-events-auto">{children}</div>
    </div>
  );
}
