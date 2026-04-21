import { HO_CHI_MINH_CITY_FALLBACK } from "../tracking/tracking-utils";
import { garageMapSeedData, garageMapSourceLinks } from "./garageMapConfig";
import type {
  GarageCategory,
  GarageMapDataResponse,
  GarageRecord,
  GarageSourceLink,
} from "./garageMapTypes";

const LOAD_DELAY_MS = 180;
const JSON_DATA_URL =
  import.meta.env.VITE_GARAGE_MAP_DATA_URL?.trim() ||
  "/data/garage-map-data.json";
const GOOGLE_PLACES_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.trim() || "";
const OVERPASS_ENDPOINTS = [
  import.meta.env.VITE_OVERPASS_API_URL?.trim(),
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass-api.de/api/interpreter",
].filter(Boolean) as string[];
const LIVE_RADIUS_METERS = 25_000;
const MAX_GARAGES_PER_CATEGORY = 14;

type GooglePlace = {
  id?: string;
  displayName?: {
    text?: string;
  };
  location?: {
    latitude?: number;
    longitude?: number;
  };
  formattedAddress?: string;
  shortFormattedAddress?: string;
  internationalPhoneNumber?: string;
  rating?: number;
  userRatingCount?: number;
  regularOpeningHours?: {
    openNow?: boolean;
    weekdayDescriptions?: string[];
  };
  googleMapsUri?: string;
};

type GooglePlacesResponse = {
  places?: GooglePlace[];
};

type OverpassElement = {
  type?: "node" | "way" | "relation";
  id?: number;
  lat?: number;
  lon?: number;
  center?: {
    lat?: number;
    lon?: number;
  };
  tags?: Record<string, string>;
};

type OverpassResponse = {
  elements?: OverpassElement[];
};

function sleep(ms: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function normalizeGarageRecord(record: GarageRecord, index: number): GarageRecord {
  const id = record.id.trim();
  const name = record.name.trim();
  const googleMapsUrl = record.googleMapsUrl.trim();
  const directionsUrl = record.directionsUrl?.trim() || googleMapsUrl;

  if (!id) {
    throw new Error(`Garage item at index ${index} is missing an id.`);
  }

  if (!name) {
    throw new Error(`Garage item "${id}" is missing a name.`);
  }

  if (!Number.isFinite(record.lat) || !Number.isFinite(record.lng)) {
    throw new Error(`Garage item "${id}" needs valid lat/lng coordinates.`);
  }

  if (!googleMapsUrl) {
    throw new Error(`Garage item "${id}" needs a Google Maps URL.`);
  }

  return {
    ...record,
    id,
    name,
    googleMapsUrl,
    directionsUrl,
    address: record.address?.trim() || null,
    phone: record.phone?.trim() || null,
    openingHours: record.openingHours?.trim() || null,
    rating: typeof record.rating === "number" ? Math.max(0, Math.min(5, record.rating)) : null,
    reviewCount:
      typeof record.reviewCount === "number" && Number.isFinite(record.reviewCount)
        ? Math.max(0, Math.floor(record.reviewCount))
        : null,
    isOpen: typeof record.isOpen === "boolean" ? record.isOpen : null,
    sourceId: record.sourceId?.trim() || null,
    provider: record.provider ?? "config",
  };
}

function normalizeGarageRecords(records: GarageRecord[]) {
  const seenIds = new Set<string>();

  return records.map((record, index) => {
    const nextRecord = normalizeGarageRecord(record, index);

    if (seenIds.has(nextRecord.id)) {
      throw new Error(`Garage item "${nextRecord.id}" is duplicated in the config.`);
    }

    seenIds.add(nextRecord.id);
    return nextRecord;
  });
}

function normalizeSourceLinks(links: GarageSourceLink[] | undefined) {
  if (!links || links.length === 0) {
    return garageMapSourceLinks;
  }

  return links.map((link) => ({
    ...link,
    url: link.url.trim(),
    label: link.label.trim(),
    labelEn: link.labelEn.trim(),
  }));
}

async function loadGarageMapDataFromJson(): Promise<GarageMapDataResponse | null> {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const response = await window.fetch(JSON_DATA_URL, {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as Partial<GarageMapDataResponse>;
    const garages = Array.isArray(payload.garages) ? payload.garages : [];
    const sourceLinks = Array.isArray(payload.sourceLinks)
      ? payload.sourceLinks
      : garageMapSourceLinks;

    return {
      provider: "config",
      garages: normalizeGarageRecords(garages),
      sourceLinks: normalizeSourceLinks(sourceLinks),
    };
  } catch {
    return null;
  }
}

async function loadGarageMapDataFromGooglePlaces(): Promise<GarageMapDataResponse> {
  const categories: GarageCategory[] = ["car", "motorcycle"];
  const placesByCategory = await Promise.all(
    categories.map(async (category) => {
      const response = await fetch("https://places.googleapis.com/v1/places:searchText", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": GOOGLE_PLACES_API_KEY,
          "X-Goog-FieldMask":
            "places.id,places.displayName,places.location,places.formattedAddress,places.shortFormattedAddress,places.internationalPhoneNumber,places.rating,places.userRatingCount,places.regularOpeningHours,places.googleMapsUri",
        },
        body: JSON.stringify({
          textQuery:
            category === "car"
              ? "car repair garage in Ho Chi Minh City, Vietnam"
              : "motorcycle repair garage in Ho Chi Minh City, Vietnam",
          languageCode: "vi",
          pageSize: MAX_GARAGES_PER_CATEGORY,
          locationBias: {
            circle: {
              center: {
                latitude: HO_CHI_MINH_CITY_FALLBACK.lat,
                longitude: HO_CHI_MINH_CITY_FALLBACK.lng,
              },
              radius: LIVE_RADIUS_METERS,
            },
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Google Places request failed: ${response.status}`);
      }

      const payload = (await response.json()) as GooglePlacesResponse;

      return (payload.places ?? []).map((place, index) => {
        const lat = place.location?.latitude;
        const lng = place.location?.longitude;

        if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
          return null;
        }

        const name = place.displayName?.text?.trim();

        if (!name) {
          return null;
        }

        const openingHours = place.regularOpeningHours?.weekdayDescriptions?.join(" | ") || null;
        const googleMapsUrl =
          place.googleMapsUri?.trim() ||
          buildDirectionsUrl(lat, lng);

        return {
          id: `google-${category}-${place.id ?? index}`,
          name,
          type: category,
          lat,
          lng,
          address: place.shortFormattedAddress || place.formattedAddress || null,
          phone: place.internationalPhoneNumber || null,
          rating: typeof place.rating === "number" ? place.rating : null,
          reviewCount:
            typeof place.userRatingCount === "number" ? place.userRatingCount : null,
          isOpen:
            typeof place.regularOpeningHours?.openNow === "boolean"
              ? place.regularOpeningHours.openNow
              : null,
          openingHours,
          googleMapsUrl,
          directionsUrl: googleMapsUrl,
          sourceId: place.id ?? null,
          provider: "google-places",
        } satisfies GarageRecord;
      });
    }),
  );

  const garages = placesByCategory.flat().filter(Boolean) as GarageRecord[];

  if (garages.length === 0) {
    throw new Error("Google Places did not return any garages.");
  }

  return {
    provider: "google-places",
    garages: normalizeGarageRecords(garages),
    sourceLinks: garageMapSourceLinks,
  };
}

function buildOverpassQuery() {
  const { lat, lng } = HO_CHI_MINH_CITY_FALLBACK;

  return [
    "[out:json][timeout:25];",
    "(",
    `node[shop=car_repair](around:${LIVE_RADIUS_METERS},${lat},${lng});`,
    `way[shop=car_repair](around:${LIVE_RADIUS_METERS},${lat},${lng});`,
    `relation[shop=car_repair](around:${LIVE_RADIUS_METERS},${lat},${lng});`,
    `node[amenity=car_repair](around:${LIVE_RADIUS_METERS},${lat},${lng});`,
    `way[amenity=car_repair](around:${LIVE_RADIUS_METERS},${lat},${lng});`,
    `relation[amenity=car_repair](around:${LIVE_RADIUS_METERS},${lat},${lng});`,
    `node[shop=motorcycle_repair](around:${LIVE_RADIUS_METERS},${lat},${lng});`,
    `way[shop=motorcycle_repair](around:${LIVE_RADIUS_METERS},${lat},${lng});`,
    `relation[shop=motorcycle_repair](around:${LIVE_RADIUS_METERS},${lat},${lng});`,
    ");",
    "out center tags;",
  ].join("");
}

async function fetchOverpassResponse(query: string): Promise<OverpassResponse> {
  let lastError: unknown = null;

  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const url = `${endpoint}?data=${encodeURIComponent(query)}`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Overpass request failed: ${response.status}`);
      }

      return (await response.json()) as OverpassResponse;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("OpenStreetMap garage search failed.");
}

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function isBicycleRepair(tags: Record<string, string>, name: string) {
  const haystack = normalizeText([name, tags.brand ?? ""].join(" "));
  return haystack.includes("xe dap") || haystack.includes("bicycle");
}

function inferGarageCategory(
  tags: Record<string, string>,
  name: string,
): GarageCategory | null {
  const normalizedName = normalizeText([name, tags.brand ?? ""].join(" "));

  if (isBicycleRepair(tags, name)) {
    return null;
  }

  if (tags.shop === "motorcycle_repair") {
    return "motorcycle";
  }

  if (
    normalizedName.includes("xe may") ||
    normalizedName.includes("tay ga") ||
    normalizedName.includes("motor") ||
    normalizedName.includes("moto") ||
    normalizedName.includes("vespa") ||
    normalizedName.includes("piaggio") ||
    normalizedName.includes("honda")
  ) {
    return "motorcycle";
  }

  return "car";
}

function buildAddress(tags: Record<string, string>) {
  if (tags["addr:full"]) {
    return tags["addr:full"];
  }

  const streetLine = [tags["addr:housenumber"], tags["addr:street"]]
    .filter(Boolean)
    .join(" ");
  const area = [
    tags["addr:district"],
    tags["addr:suburb"],
    tags["addr:quarter"],
    tags["addr:city"],
  ]
    .filter(Boolean)
    .join(", ");

  const address = [streetLine, area].filter(Boolean).join(", ");
  return address || null;
}

function parseMinutes(raw: string) {
  const [hours, minutes] = raw.split(":").map((value) => Number.parseInt(value, 10));

  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
    return null;
  }

  return hours * 60 + minutes;
}

function parseDayToken(token: string) {
  const lookup: Record<string, number> = {
    Su: 0,
    Mo: 1,
    Tu: 2,
    We: 3,
    Th: 4,
    Fr: 5,
    Sa: 6,
  };

  return lookup[token] ?? null;
}

function matchesDaySpec(spec: string, currentDay: number) {
  return spec.split(",").some((part) => {
    const token = part.trim();

    if (!token) {
      return false;
    }

    if (token.includes("-")) {
      const [startToken, endToken] = token.split("-");
      const start = parseDayToken(startToken);
      const end = parseDayToken(endToken);

      if (start === null || end === null) {
        return false;
      }

      if (start <= end) {
        return currentDay >= start && currentDay <= end;
      }

      return currentDay >= start || currentDay <= end;
    }

    return parseDayToken(token) === currentDay;
  });
}

function parseOpenState(openingHours: string | null | undefined) {
  if (!openingHours) {
    return null;
  }

  const normalized = openingHours.trim();

  if (!normalized) {
    return null;
  }

  if (normalized === "24/7") {
    return true;
  }

  const now = new Date();
  const currentDay = now.getDay();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  let matchedDay = false;

  for (const segment of normalized.split(";")) {
    const trimmedSegment = segment.trim();

    if (!trimmedSegment) {
      continue;
    }

    const match = trimmedSegment.match(/^([A-Za-z,\-]+)\s+(.+)$/);

    if (!match) {
      continue;
    }

    const [, daySpec, timeSpec] = match;

    if (!matchesDaySpec(daySpec, currentDay)) {
      continue;
    }

    matchedDay = true;

    if (timeSpec.toLowerCase() === "off" || timeSpec.toLowerCase() === "closed") {
      return false;
    }

    for (const range of timeSpec.split(",")) {
      const [startRaw, endRaw] = range.trim().split("-");
      const start = parseMinutes(startRaw);
      const end = parseMinutes(endRaw);

      if (start === null || end === null) {
        continue;
      }

      if (start <= end && currentMinutes >= start && currentMinutes <= end) {
        return true;
      }

      if (start > end && (currentMinutes >= start || currentMinutes <= end)) {
        return true;
      }
    }
  }

  return matchedDay ? false : null;
}

function buildDirectionsUrl(lat: number, lng: number) {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

function getElementCoordinates(element: OverpassElement) {
  if (Number.isFinite(element.lat) && Number.isFinite(element.lon)) {
    return {
      lat: element.lat as number,
      lng: element.lon as number,
    };
  }

  if (
    Number.isFinite(element.center?.lat) &&
    Number.isFinite(element.center?.lon)
  ) {
    return {
      lat: element.center?.lat as number,
      lng: element.center?.lon as number,
    };
  }

  return null;
}

function scoreGarage(record: GarageRecord) {
  return (
    (record.phone ? 5 : 0) +
    (record.address ? 4 : 0) +
    (record.openingHours ? 3 : 0) +
    (typeof record.rating === "number" ? 6 : 0) +
    (typeof record.reviewCount === "number" ? 5 : 0) +
    (record.name.length > 8 ? 2 : 0)
  );
}

function rankGarages(records: GarageRecord[]) {
  const seen = new Set<string>();

  return records
    .sort((left, right) => {
      const scoreDelta = scoreGarage(right) - scoreGarage(left);

      if (scoreDelta !== 0) {
        return scoreDelta;
      }

      return left.name.localeCompare(right.name, "vi");
    })
    .filter((record) => {
      const key = `${normalizeText(record.name)}-${record.lat.toFixed(4)}-${record.lng.toFixed(4)}`;

      if (seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    });
}

async function loadGarageMapDataFromOpenStreetMap(): Promise<GarageMapDataResponse> {
  const payload = await fetchOverpassResponse(buildOverpassQuery());
  const liveRecords = (payload.elements ?? [])
    .map((element) => {
      const tags = element.tags ?? {};
      const name = tags.name?.trim() || tags.brand?.trim() || "";

      if (!name) {
        return null;
      }

      const category = inferGarageCategory(tags, name);
      const point = getElementCoordinates(element);

      if (!category || !point) {
        return null;
      }

      const phone = tags.phone || tags["contact:phone"] || null;
      const openingHours = tags.opening_hours || null;
      const googleMapsUrl = buildDirectionsUrl(point.lat, point.lng);

      return {
        id: `osm-${element.type ?? "node"}-${element.id ?? name}`,
        name,
        type: category,
        lat: point.lat,
        lng: point.lng,
        address: buildAddress(tags),
        phone,
        rating: null,
        reviewCount: null,
        isOpen: parseOpenState(openingHours),
        openingHours,
        googleMapsUrl,
        directionsUrl: googleMapsUrl,
        sourceId: `${element.type ?? "node"}/${element.id ?? "unknown"}`,
        provider: "openstreetmap",
      } satisfies GarageRecord;
    })
    .filter(Boolean) as GarageRecord[];

  const carGarages = rankGarages(
    liveRecords.filter((record) => record.type === "car"),
  ).slice(0, MAX_GARAGES_PER_CATEGORY);
  const motorcycleGarages = rankGarages(
    liveRecords.filter((record) => record.type === "motorcycle"),
  ).slice(0, MAX_GARAGES_PER_CATEGORY);
  const garages = normalizeGarageRecords([...carGarages, ...motorcycleGarages]);

  if (garages.length === 0) {
    throw new Error("No live garages were found from OpenStreetMap.");
  }

  return {
    provider: "openstreetmap",
    garages,
    sourceLinks: garageMapSourceLinks,
  };
}

export async function loadGarageMapData(): Promise<GarageMapDataResponse> {
  await sleep(LOAD_DELAY_MS);

  const jsonData = await loadGarageMapDataFromJson();

  if (jsonData?.garages.length) {
    return jsonData;
  }

  if (GOOGLE_PLACES_API_KEY) {
    try {
      return await loadGarageMapDataFromGooglePlaces();
    } catch {
      // When a browser-restricted Google Places key is not available, the live
      // page falls back to OpenStreetMap so the UI can still render real
      // garages in-site. Replace this with your own server-side proxy if you
      // want to keep Google Maps Platform keys fully private.
    }
  }

  try {
    return await loadGarageMapDataFromOpenStreetMap();
  } catch (liveError) {
    if (jsonData?.garages.length) {
      return jsonData;
    }

    if (garageMapSeedData.length > 0) {
      return {
        provider: "config",
        garages: normalizeGarageRecords(garageMapSeedData),
        sourceLinks: garageMapSourceLinks,
      };
    }

    throw liveError instanceof Error
      ? liveError
      : new Error("Live garage data could not be loaded.");
  }
}
