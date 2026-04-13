import { useSyncExternalStore } from "react";
import { HO_CHI_MINH_CITY_FALLBACK, type GeoPoint } from "./tracking/tracking-utils";

export type VehicleType = "Xe máy" | "Ô tô";

export type ResQVehicle = {
  id: string;
  name: string;
  plate: string;
  year: string;
  type: VehicleType;
  isDefault: boolean;
};

export type ActiveResQRequest = {
  id: string;
  serviceId: string;
  serviceTitle: string;
  servicePrice: string;
  serviceEta: string;
  vehicleId: string;
  vehicleName: string;
  vehiclePlate: string;
  vehicleType: VehicleType;
  locationAddress: string;
  locationPoint: GeoPoint;
  locationSource: "browser" | "fallback" | "manual";
  notes: string;
  createdAt: string;
  fixerTeam: string;
  fixerVehicle: string;
  status: string;
};

export type ResQHistoryItem = ActiveResQRequest & {
  paymentStatus: "Chưa thanh toán" | "Đã thanh toán";
  paymentMethod?: string;
  totalAmount?: string;
  completedAt?: string;
};

type ResQStoreSnapshot = {
  vehicles: ResQVehicle[];
  activeRequest: ActiveResQRequest | null;
  requestHistory: ResQHistoryItem[];
};

type AddVehicleInput = {
  name: string;
  plate: string;
  year: string;
  type: VehicleType;
};

const VEHICLES_STORAGE_KEY = "resq_vehicles";
const ACTIVE_REQUEST_STORAGE_KEY = "resq_active_request";
const REQUEST_HISTORY_STORAGE_KEY = "resq_request_history";

const defaultVehicles: ResQVehicle[] = [
  {
    id: "wave-rsx",
    name: "Honda Wave RSX",
    plate: "59F1-12345",
    year: "2022",
    type: "Xe máy",
    isDefault: true,
  },
  {
    id: "toyota-vios",
    name: "Toyota Vios",
    plate: "51G-67890",
    year: "2021",
    type: "Ô tô",
    isDefault: false,
  },
];

let currentVehicles = defaultVehicles;
let currentActiveRequest: ActiveResQRequest | null = null;
let currentRequestHistory: ResQHistoryItem[] = createDefaultHistory();
let currentScopeKey = "guest";
let currentSnapshot: ResQStoreSnapshot = {
  vehicles: currentVehicles,
  activeRequest: currentActiveRequest,
  requestHistory: currentRequestHistory,
};
const listeners = new Set<() => void>();

hydrateStore();

function hydrateStore() {
  currentVehicles = defaultVehicles;
  currentActiveRequest = null;
  currentRequestHistory = createDefaultHistory();

  if (typeof window === "undefined") {
    syncSnapshot();
    return;
  }

  try {
    const savedVehicles = window.localStorage.getItem(
      getScopedStorageKey(VEHICLES_STORAGE_KEY),
    );

    if (savedVehicles) {
      currentVehicles = normalizeVehicles(JSON.parse(savedVehicles) as ResQVehicle[]);
    }

    const savedRequest = window.localStorage.getItem(
      getScopedStorageKey(ACTIVE_REQUEST_STORAGE_KEY),
    );

    if (savedRequest) {
      currentActiveRequest = JSON.parse(savedRequest) as ActiveResQRequest;
    }

    const savedHistory = window.localStorage.getItem(
      getScopedStorageKey(REQUEST_HISTORY_STORAGE_KEY),
    );

    if (savedHistory) {
      currentRequestHistory = normalizeHistory(
        JSON.parse(savedHistory) as ResQHistoryItem[],
      );
    }
  } catch {
    currentVehicles = defaultVehicles;
    currentActiveRequest = null;
    currentRequestHistory = createDefaultHistory();
  }

  syncSnapshot();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): ResQStoreSnapshot {
  return currentSnapshot;
}

function emitChange() {
  syncSnapshot();
  persistStore();
  listeners.forEach((listener) => listener());
}

function persistStore() {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(
      getScopedStorageKey(VEHICLES_STORAGE_KEY),
      JSON.stringify(currentVehicles),
    );

    if (currentActiveRequest) {
      window.localStorage.setItem(
        getScopedStorageKey(ACTIVE_REQUEST_STORAGE_KEY),
        JSON.stringify(currentActiveRequest),
      );
    } else {
      window.localStorage.removeItem(getScopedStorageKey(ACTIVE_REQUEST_STORAGE_KEY));
    }

    window.localStorage.setItem(
      getScopedStorageKey(REQUEST_HISTORY_STORAGE_KEY),
      JSON.stringify(currentRequestHistory),
    );
  } catch {
    // Ignore persistence failures and keep the in-memory state.
  }
}

function syncSnapshot() {
  currentSnapshot = {
    vehicles: currentVehicles,
    activeRequest: currentActiveRequest,
    requestHistory: currentRequestHistory,
  };
}

function normalizeVehicles(vehicles: ResQVehicle[]) {
  if (vehicles.length === 0) {
    return [];
  }

  const defaultIndex = Math.max(
    vehicles.findIndex((vehicle) => vehicle.isDefault),
    0,
  );

  return vehicles.map((vehicle, index) => ({
    ...vehicle,
    isDefault: index === defaultIndex,
  }));
}

export function addVehicle(input: AddVehicleInput) {
  const nextVehicle: ResQVehicle = {
    id: createEntityId("vehicle"),
    name: input.name.trim(),
    plate: input.plate.trim().toUpperCase(),
    year: input.year.trim(),
    type: input.type,
    isDefault: currentVehicles.length === 0,
  };

  currentVehicles = normalizeVehicles([...currentVehicles, nextVehicle]);
  emitChange();
  return nextVehicle;
}

export function setDefaultVehicle(vehicleId: string) {
  currentVehicles = normalizeVehicles(
    currentVehicles.map((vehicle) => ({
      ...vehicle,
      isDefault: vehicle.id === vehicleId,
    })),
  );
  emitChange();
}

export function removeVehicle(vehicleId: string) {
  currentVehicles = normalizeVehicles(
    currentVehicles.filter((vehicle) => vehicle.id !== vehicleId),
  );

  emitChange();
}

export function setActiveRequest(request: ActiveResQRequest) {
  currentActiveRequest = request;
  currentRequestHistory = upsertHistoryEntry(toHistoryItem(request));
  emitChange();
}

export function clearActiveRequest() {
  currentActiveRequest = null;
  emitChange();
}

export function completeActiveRequest(input: {
  paymentMethod: string;
  totalAmount: string;
}) {
  if (!currentActiveRequest) {
    return null;
  }

  const completedRequest = {
    ...currentActiveRequest,
    status: "Hoàn thành",
  } satisfies ActiveResQRequest;

  currentActiveRequest = completedRequest;
  currentRequestHistory = upsertHistoryEntry(
    toHistoryItem(completedRequest, {
      paymentStatus: "Đã thanh toán",
      paymentMethod: input.paymentMethod,
      totalAmount: input.totalAmount,
      completedAt: new Date().toISOString(),
    }),
  );
  emitChange();
  return completedRequest;
}

export function createRequestDraft(input: {
  serviceId: string;
  serviceTitle: string;
  servicePrice: string;
  serviceEta: string;
  vehicle: ResQVehicle;
  locationAddress: string;
  locationPoint?: GeoPoint;
  locationSource: "browser" | "fallback" | "manual";
  notes: string;
}) {
  return {
    id: `RSQ-${Math.floor(100000 + Math.random() * 900000)}`,
    serviceId: input.serviceId,
    serviceTitle: input.serviceTitle,
    servicePrice: input.servicePrice,
    serviceEta: input.serviceEta,
    vehicleId: input.vehicle.id,
    vehicleName: input.vehicle.name,
    vehiclePlate: input.vehicle.plate,
    vehicleType: input.vehicle.type,
    locationAddress: input.locationAddress,
    locationPoint: input.locationPoint ?? HO_CHI_MINH_CITY_FALLBACK,
    locationSource: input.locationSource,
    notes: input.notes.trim(),
    createdAt: new Date().toISOString(),
    fixerTeam: "Đội lưu động ResQ 07",
    fixerVehicle: "Box van cứu hộ",
    status: "Đang tiếp cận",
  } satisfies ActiveResQRequest;
}

export function useResQStore() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  return {
    ...snapshot,
    addVehicle,
    setDefaultVehicle,
    removeVehicle,
    setActiveRequest,
    clearActiveRequest,
    completeActiveRequest,
  };
}

export function setResQStoreScope(userId: string | null) {
  const nextScopeKey = userId ? `user:${userId}` : "guest";

  if (nextScopeKey === currentScopeKey) {
    return;
  }

  currentScopeKey = nextScopeKey;
  hydrateStore();
  listeners.forEach((listener) => listener());
}

function createEntityId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function getScopedStorageKey(baseKey: string) {
  return `${baseKey}:${currentScopeKey}`;
}

function createDefaultHistory() {
  return normalizeHistory([
    {
      id: "RSQ-320104",
      serviceId: "nhien-lieu",
      serviceTitle: "Tiếp nhiên liệu",
      servicePrice: "Từ 80.000đ",
      serviceEta: "18 phút",
      vehicleId: "wave-rsx",
      vehicleName: "Honda Wave RSX",
      vehiclePlate: "59F1-12345",
      vehicleType: "Xe máy",
      locationAddress: "Nguyễn Hữu Cảnh, Bình Thạnh, TP. Hồ Chí Minh",
      locationPoint: HO_CHI_MINH_CITY_FALLBACK,
      locationSource: "fallback",
      notes: "Cần 2 lít xăng RON95",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 19).toISOString(),
      fixerTeam: "Đội lưu động ResQ 03",
      fixerVehicle: "Xe bán tải tiếp nhiên liệu",
      status: "Hoàn thành",
      paymentStatus: "Đã thanh toán",
      paymentMethod: "QR ngân hàng",
      totalAmount: "135.000đ",
      completedAt: new Date(Date.now() - 1000 * 60 * 60 * 18.5).toISOString(),
    },
    {
      id: "RSQ-319772",
      serviceId: "ac-quy",
      serviceTitle: "Kích bình / Thay ắc quy",
      servicePrice: "Từ 100.000đ",
      serviceEta: "22 phút",
      vehicleId: "toyota-vios",
      vehicleName: "Toyota Vios",
      vehiclePlate: "51G-67890",
      vehicleType: "Ô tô",
      locationAddress: "Xa lộ Hà Nội, Thủ Đức, TP. Hồ Chí Minh",
      locationPoint: HO_CHI_MINH_CITY_FALLBACK,
      locationSource: "manual",
      notes: "Xe đỗ trong bãi chung cư",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
      fixerTeam: "Đội lưu động ResQ 05",
      fixerVehicle: "Van cứu hộ pin & điện",
      status: "Hoàn thành",
      paymentStatus: "Đã thanh toán",
      paymentMethod: "Tiền mặt",
      totalAmount: "215.000đ",
      completedAt: new Date(Date.now() - 1000 * 60 * 60 * 71.5).toISOString(),
    },
  ]);
}

function normalizeHistory(history: ResQHistoryItem[]) {
  return [...history]
    .sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt))
    .slice(0, 12);
}

function toHistoryItem(
  request: ActiveResQRequest,
  overrides?: Partial<ResQHistoryItem>,
) {
  return {
    ...request,
    paymentStatus: "Chưa thanh toán",
    ...overrides,
  } satisfies ResQHistoryItem;
}

function upsertHistoryEntry(nextEntry: ResQHistoryItem) {
  const currentIndex = currentRequestHistory.findIndex(
    (entry) => entry.id === nextEntry.id,
  );

  if (currentIndex === -1) {
    return normalizeHistory([nextEntry, ...currentRequestHistory]);
  }

  const nextHistory = [...currentRequestHistory];
  nextHistory[currentIndex] = nextEntry;
  return normalizeHistory(nextHistory);
}
