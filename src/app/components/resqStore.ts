import { useSyncExternalStore } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import type { ResQAuthRole, ResQAuthUser } from "@/utils/supabase/auth";
import { createClient } from "@/utils/supabase/client";
import {
  acceptServiceRequest,
  advanceServiceRequestStatus as advanceServiceRequestStatusRemote,
  cancelServiceRequest as cancelServiceRequestRemote,
  completeServiceRequest as completeServiceRequestRemote,
  createServiceRequest as createServiceRequestRemote,
} from "@/utils/supabase/requestWorkflow";
import {
  HO_CHI_MINH_CITY_FALLBACK,
  type GeoPoint,
} from "./tracking/tracking-utils";
import { seedRequestLocation } from "./tracking/requestLocations";

export type VehicleType = "Xe máy" | "Ô tô";
export type ResQRequestStatus =
  | "Chờ fixer xác nhận"
  | "Fixer đã xác nhận"
  | "Đang tiếp cận"
  | "Đang hỗ trợ"
  | "Hoàn thành"
  | "Đã hủy";

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
  requesterId: string | null;
  requesterName: string;
  requesterPhone: string;
  fixerId: string | null;
  fixerName: string;
  fixerTeam: string;
  fixerVehicle: string;
  status: ResQRequestStatus;
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
  incomingRequests: ActiveResQRequest[];
  requestHistory: ResQHistoryItem[];
  isHydrating: boolean;
  lastSyncedAt: string | null;
};

type AddVehicleInput = {
  name: string;
  plate: string;
  year: string;
  type: VehicleType;
};

type StoreActor = Pick<ResQAuthUser, "id" | "name" | "phone" | "role">;

type VehicleRecord = {
  id: string;
  owner_id: string;
  name: string;
  plate: string;
  year: string;
  type: VehicleType;
  is_default: boolean;
  created_at?: string;
  updated_at?: string;
};

type RequestRecord = {
  id: string;
  requester_id: string;
  requester_name: string;
  requester_phone: string | null;
  service_id: string;
  service_title: string;
  service_price: string;
  service_eta: string;
  vehicle_id: string;
  vehicle_name: string;
  vehicle_plate: string;
  vehicle_type: VehicleType;
  location_address: string;
  location_lat: number;
  location_lng: number;
  location_source: "browser" | "fallback" | "manual";
  notes: string | null;
  fixer_id: string | null;
  fixer_name: string | null;
  fixer_team: string | null;
  fixer_vehicle: string | null;
  status: ResQRequestStatus;
  created_at: string;
  updated_at?: string;
};

const VEHICLES_STORAGE_KEY = "resq_vehicles";
const ACTIVE_REQUEST_STORAGE_KEY = "resq_active_request";
const REQUEST_HISTORY_STORAGE_KEY = "resq_request_history";
const INCOMING_REQUESTS_STORAGE_KEY = "resq_incoming_requests";

const VEHICLES_TABLE = "vehicles";
const REQUESTS_TABLE = "service_requests";
const ACTIVE_REQUEST_STATUS_FILTER =
  '("Chờ fixer xác nhận","Fixer đã xác nhận","Đang tiếp cận","Đang hỗ trợ")';

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

let currentActor: StoreActor | null = null;
let currentVehicles = defaultVehicles;
let currentActiveRequest: ActiveResQRequest | null = null;
let currentIncomingRequests: ActiveResQRequest[] = [];
let currentRequestHistory: ResQHistoryItem[] = createDefaultHistory();
let currentScopeKey = "guest";
let currentIsHydrating = false;
let currentLastSyncedAt: string | null = null;
let currentSnapshot: ResQStoreSnapshot = {
  vehicles: currentVehicles,
  activeRequest: currentActiveRequest,
  incomingRequests: currentIncomingRequests,
  requestHistory: currentRequestHistory,
  isHydrating: currentIsHydrating,
  lastSyncedAt: currentLastSyncedAt,
};
const listeners = new Set<() => void>();
let requestsRealtimeChannel: RealtimeChannel | null = null;
let vehiclesRealtimeChannel: RealtimeChannel | null = null;

hydrateStore();

function hydrateStore() {
  currentVehicles = currentActor ? [] : defaultVehicles;
  currentActiveRequest = null;
  currentIncomingRequests = [];
  currentRequestHistory = currentActor ? [] : createDefaultHistory();
  currentLastSyncedAt = null;

  if (typeof window === "undefined") {
    syncSnapshot();
    return;
  }

  try {
    const savedVehicles = window.localStorage.getItem(
      getScopedStorageKey(VEHICLES_STORAGE_KEY),
    );
    if (savedVehicles) {
      currentVehicles = normalizeVehicles(
        JSON.parse(savedVehicles) as ResQVehicle[],
      );
    }

    const savedRequest = window.localStorage.getItem(
      getScopedStorageKey(ACTIVE_REQUEST_STORAGE_KEY),
    );
    if (savedRequest) {
      currentActiveRequest = normalizeRequest(
        JSON.parse(savedRequest) as ActiveResQRequest,
      );
    }

    const savedIncomingRequests = window.localStorage.getItem(
      getScopedStorageKey(INCOMING_REQUESTS_STORAGE_KEY),
    );
    if (savedIncomingRequests) {
      currentIncomingRequests = normalizeIncomingRequests(
        JSON.parse(savedIncomingRequests) as ActiveResQRequest[],
      );
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
    currentVehicles = currentActor ? [] : defaultVehicles;
    currentActiveRequest = null;
    currentIncomingRequests = [];
    currentRequestHistory = currentActor ? [] : createDefaultHistory();
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

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

function emitChange() {
  syncSnapshot();
  persistStore();
  notifyListeners();
}

function syncSnapshot() {
  currentSnapshot = {
    vehicles: currentVehicles,
    activeRequest: currentActiveRequest,
    incomingRequests: currentIncomingRequests,
    requestHistory: currentRequestHistory,
    isHydrating: currentIsHydrating,
    lastSyncedAt: currentLastSyncedAt,
  };
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
      window.localStorage.removeItem(
        getScopedStorageKey(ACTIVE_REQUEST_STORAGE_KEY),
      );
    }

    if (currentIncomingRequests.length > 0) {
      window.localStorage.setItem(
        getScopedStorageKey(INCOMING_REQUESTS_STORAGE_KEY),
        JSON.stringify(currentIncomingRequests),
      );
    } else {
      window.localStorage.removeItem(
        getScopedStorageKey(INCOMING_REQUESTS_STORAGE_KEY),
      );
    }

    window.localStorage.setItem(
      getScopedStorageKey(REQUEST_HISTORY_STORAGE_KEY),
      JSON.stringify(currentRequestHistory),
    );
  } catch {
    // Ignore local persistence failures and keep the in-memory state.
  }
}

function createEntityId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function createRequestId() {
  return `RSQ-${Math.floor(100000 + Math.random() * 900000)}`;
}

function getScopedStorageKey(baseKey: string) {
  return `${baseKey}:${currentScopeKey}`;
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
    plate: vehicle.plate.trim().toUpperCase(),
    isDefault: index === defaultIndex,
  }));
}

function normalizeStatus(status: string): ResQRequestStatus {
  switch (status) {
    case "Fixer đã xác nhận":
    case "Đang tiếp cận":
    case "Đang hỗ trợ":
    case "Hoàn thành":
    case "Đã hủy":
      return status;
    default:
      return "Chờ fixer xác nhận";
  }
}

function normalizeRequest(request: ActiveResQRequest): ActiveResQRequest {
  return {
    ...request,
    vehiclePlate: request.vehiclePlate.trim().toUpperCase(),
    requesterPhone: request.requesterPhone ?? "",
    requesterName: request.requesterName || "Khách ResQ",
    requesterId: request.requesterId ?? null,
    fixerId: request.fixerId ?? null,
    fixerName: request.fixerName || "Fixer ResQ",
    fixerTeam: request.fixerTeam || "Đội ResQ chờ xác nhận",
    fixerVehicle: request.fixerVehicle || "Xe cứu hộ lưu động",
    status: normalizeStatus(request.status),
    locationPoint: request.locationPoint ?? HO_CHI_MINH_CITY_FALLBACK,
  };
}

function normalizeIncomingRequests(requests: ActiveResQRequest[]) {
  return [...requests]
    .map((request) => normalizeRequest(request))
    .sort(
      (left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt),
    );
}

function normalizeHistory(history: ResQHistoryItem[]) {
  return [...history]
    .map((entry) => ({
      ...normalizeRequest(entry),
      paymentStatus:
        entry.paymentStatus === "Đã thanh toán"
          ? "Đã thanh toán"
          : "Chưa thanh toán",
    }))
    .sort(
      (left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt),
    )
    .slice(0, 12);
}

function toHistoryItem(
  request: ActiveResQRequest,
  overrides?: Partial<ResQHistoryItem>,
) {
  return {
    ...request,
    paymentStatus:
      request.status === "Hoàn thành" ? "Đã thanh toán" : "Chưa thanh toán",
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

function mapVehicleRecordToVehicle(record: VehicleRecord): ResQVehicle {
  return {
    id: record.id,
    name: record.name,
    plate: record.plate,
    year: record.year,
    type: record.type,
    isDefault: Boolean(record.is_default),
  };
}

function mapVehicleToRecord(vehicle: ResQVehicle): VehicleRecord | null {
  if (!currentActor?.id) {
    return null;
  }

  return {
    id: vehicle.id,
    owner_id: currentActor.id,
    name: vehicle.name.trim(),
    plate: vehicle.plate.trim().toUpperCase(),
    year: vehicle.year.trim(),
    type: vehicle.type,
    is_default: vehicle.isDefault,
  };
}

function mapRequestRecordToRequest(record: RequestRecord): ActiveResQRequest {
  return normalizeRequest({
    id: record.id,
    serviceId: record.service_id,
    serviceTitle: record.service_title,
    servicePrice: record.service_price,
    serviceEta: record.service_eta,
    vehicleId: record.vehicle_id,
    vehicleName: record.vehicle_name,
    vehiclePlate: record.vehicle_plate,
    vehicleType: record.vehicle_type,
    locationAddress: record.location_address,
    locationPoint: {
      lat: record.location_lat,
      lng: record.location_lng,
    },
    locationSource: record.location_source,
    notes: record.notes ?? "",
    createdAt: record.created_at,
    requesterId: record.requester_id,
    requesterName: record.requester_name,
    requesterPhone: record.requester_phone ?? "",
    fixerId: record.fixer_id ?? null,
    fixerName: record.fixer_name ?? "Fixer ResQ",
    fixerTeam: record.fixer_team ?? "Đội ResQ chờ xác nhận",
    fixerVehicle: record.fixer_vehicle ?? "Xe cứu hộ lưu động",
    status: record.status,
  });
}

async function persistVehiclesSnapshot(nextVehicles: ResQVehicle[]) {
  if (!currentActor?.id) {
    return;
  }

  const rows = nextVehicles
    .map((vehicle) => mapVehicleToRecord(vehicle))
    .filter((row): row is VehicleRecord => Boolean(row));

  try {
    const supabase = createClient();

    if (rows.length > 0) {
      await supabase.from(VEHICLES_TABLE).upsert(rows, { onConflict: "id" });
    }

    let deleteQuery = supabase
      .from(VEHICLES_TABLE)
      .delete()
      .eq("owner_id", currentActor.id);

    if (rows.length > 0) {
      const keepIds = rows.map((row) => JSON.stringify(row.id)).join(",");
      deleteQuery = deleteQuery.not("id", "in", `(${keepIds})`);
    }

    await deleteQuery;
  } catch {
    // Keep the local state usable even if the remote sync fails.
  }
}

function teardownRealtimeChannels() {
  const supabase = createClient();

  if (requestsRealtimeChannel) {
    void supabase.removeChannel(requestsRealtimeChannel);
    requestsRealtimeChannel = null;
  }

  if (vehiclesRealtimeChannel) {
    void supabase.removeChannel(vehiclesRealtimeChannel);
    vehiclesRealtimeChannel = null;
  }
}

function syncRealtimeChannels(actor: StoreActor | null) {
  teardownRealtimeChannels();

  if (!actor?.id) {
    return;
  }

  const supabase = createClient();
  const refreshSnapshot = () => {
    void refreshResQStore(actor);
  };

  requestsRealtimeChannel = supabase
    .channel(`resq-store-requests:${actor.id}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: REQUESTS_TABLE,
      },
      refreshSnapshot,
    )
    .subscribe();

  vehiclesRealtimeChannel = supabase
    .channel(`resq-store-vehicles:${actor.id}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: VEHICLES_TABLE,
      },
      refreshSnapshot,
    )
    .subscribe();
}

function getNextActiveStatus(status: ResQRequestStatus): ResQRequestStatus {
  switch (status) {
    case "Fixer đã xác nhận":
      return "Đang tiếp cận";
    case "Đang tiếp cận":
      return "Đang hỗ trợ";
    case "Đang hỗ trợ":
      return "Hoàn thành";
    default:
      return status;
  }
}

function refreshRemoteRequestState() {
  if (!currentActor) {
    return;
  }

  void refreshResQStore(currentActor);
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
  void persistVehiclesSnapshot(currentVehicles);
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
  void persistVehiclesSnapshot(currentVehicles);
}

export function removeVehicle(vehicleId: string) {
  currentVehicles = normalizeVehicles(
    currentVehicles.filter((vehicle) => vehicle.id !== vehicleId),
  );
  emitChange();
  void persistVehiclesSnapshot(currentVehicles);
}

export function setActiveRequest(request: ActiveResQRequest) {
  currentActiveRequest = normalizeRequest(request);
  currentRequestHistory = upsertHistoryEntry(
    toHistoryItem(currentActiveRequest),
  );
  emitChange();
  void createServiceRequestRemote({
    id: currentActiveRequest.id,
    serviceId: currentActiveRequest.serviceId,
    serviceTitle: currentActiveRequest.serviceTitle,
    servicePrice: currentActiveRequest.servicePrice,
    serviceEta: currentActiveRequest.serviceEta,
    vehicleId: currentActiveRequest.vehicleId,
    vehicleName: currentActiveRequest.vehicleName,
    vehiclePlate: currentActiveRequest.vehiclePlate,
    vehicleType: currentActiveRequest.vehicleType,
    locationAddress: currentActiveRequest.locationAddress,
    locationLat: currentActiveRequest.locationPoint.lat,
    locationLng: currentActiveRequest.locationPoint.lng,
    locationSource: currentActiveRequest.locationSource,
    notes: currentActiveRequest.notes,
  })
    .then(() => {
      refreshRemoteRequestState();
    })
    .catch(() => {
      // Keep the optimistic request visible and let the next sync reconcile remote state.
    });
  seedRequestLocation({
    requestId: currentActiveRequest.id,
    actorId: currentActiveRequest.requesterId,
    actorRole: "user",
    point: currentActiveRequest.locationPoint,
    source: currentActiveRequest.locationSource,
    address: currentActiveRequest.locationAddress,
  });
}

export function clearActiveRequest() {
  currentActiveRequest = null;
  emitChange();
}

export function cancelActiveRequest() {
  if (!currentActiveRequest) {
    return null;
  }

  const cancelledRequest = normalizeRequest({
    ...currentActiveRequest,
    status: "Đã hủy",
  });

  currentActiveRequest = null;
  currentRequestHistory = upsertHistoryEntry(toHistoryItem(cancelledRequest));
  emitChange();
  void cancelServiceRequestRemote(cancelledRequest.id)
    .then(() => {
      refreshRemoteRequestState();
    })
    .catch(() => {
      // Keep the optimistic cancellation visible and let the next sync reconcile remote state.
    });
  return cancelledRequest;
}

export function confirmIncomingRequest(requestId: string) {
  if (!currentActor || currentActor.role !== "fixer") {
    return null;
  }

  const nextRequest = currentIncomingRequests.find(
    (request) => request.id === requestId,
  );
  if (!nextRequest) {
    return null;
  }

  const confirmedRequest = normalizeRequest({
    ...nextRequest,
    fixerId: currentActor.id,
    fixerName: currentActor.name,
    fixerTeam: `Fixer ${currentActor.name.split(" ").at(-1) ?? "ResQ"}`,
    fixerVehicle:
      nextRequest.vehicleType === "Xe máy"
        ? "Xe máy toolkit ResQ"
        : "Van cứu hộ ResQ",
    status: "Fixer đã xác nhận",
  });

  currentIncomingRequests = currentIncomingRequests.filter(
    (request) => request.id !== requestId,
  );
  currentActiveRequest = confirmedRequest;
  currentRequestHistory = upsertHistoryEntry(toHistoryItem(confirmedRequest));
  emitChange();
  void acceptServiceRequest(requestId)
    .then(() => {
      refreshRemoteRequestState();
    })
    .catch(() => {
      // Keep the optimistic confirmation visible and let the next sync reconcile remote state.
    });
  return confirmedRequest;
}

export function advanceActiveRequestStatus() {
  if (!currentActiveRequest) {
    return null;
  }

  const nextStatus = getNextActiveStatus(currentActiveRequest.status);
  const nextRequest = normalizeRequest({
    ...currentActiveRequest,
    status: nextStatus,
  });

  currentActiveRequest = nextRequest;
  currentRequestHistory = upsertHistoryEntry(
    toHistoryItem(
      nextRequest,
      nextStatus === "Hoàn thành"
        ? {
            paymentStatus: "Đã thanh toán",
            paymentMethod: "Thanh toán tại hiện trường",
            totalAmount: nextRequest.servicePrice,
            completedAt: new Date().toISOString(),
          }
        : undefined,
    ),
  );
  emitChange();
  void advanceServiceRequestStatusRemote(nextRequest.id)
    .then(() => {
      refreshRemoteRequestState();
    })
    .catch(() => {
      // Keep the optimistic progress visible and let the next sync reconcile remote state.
    });
  return nextRequest;
}

export function completeActiveRequest(input: {
  paymentMethod: string;
  totalAmount: string;
}) {
  if (!currentActiveRequest) {
    return null;
  }

  const completedRequest = normalizeRequest({
    ...currentActiveRequest,
    status: "Hoàn thành",
  });

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
  void completeServiceRequestRemote(completedRequest.id)
    .then(() => {
      refreshRemoteRequestState();
    })
    .catch(() => {
      // Keep the optimistic completion visible and let the next sync reconcile remote state.
    });
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
  return normalizeRequest({
    id: createRequestId(),
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
    requesterId:
      currentActor?.role === "user"
        ? currentActor.id
        : (currentActor?.id ?? null),
    requesterName: currentActor?.name || "Khách ResQ",
    requesterPhone: currentActor?.phone || "",
    fixerId: null,
    fixerName: "",
    fixerTeam: "Đội ResQ chờ xác nhận",
    fixerVehicle: "Fixer sẽ xác nhận sau",
    status: "Chờ fixer xác nhận",
  });
}

export async function refreshResQStore(actorOverride?: StoreActor | null) {
  const actor = actorOverride ?? currentActor;
  if (!actor?.id) {
    return;
  }

  currentActor = actor;
  currentIsHydrating = true;
  syncSnapshot();
  notifyListeners();

  try {
    const supabase = createClient();
    const vehiclesQuery = supabase
      .from(VEHICLES_TABLE)
      .select(
        "id, owner_id, name, plate, year, type, is_default, created_at, updated_at",
      )
      .eq("owner_id", actor.id)
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false });

    if (actor.role === "fixer") {
      const [vehiclesResult, incomingResult, activeResult, historyResult] =
        await Promise.all([
          vehiclesQuery,
          supabase
            .from(REQUESTS_TABLE)
            .select("*")
            .eq("status", "Chờ fixer xác nhận")
            .order("created_at", { ascending: false })
            .limit(12),
          supabase
            .from(REQUESTS_TABLE)
            .select("*")
            .eq("fixer_id", actor.id)
            .not("status", "in", '("Hoàn thành","Đã hủy")')
            .order("created_at", { ascending: false })
            .limit(1),
          supabase
            .from(REQUESTS_TABLE)
            .select("*")
            .eq("fixer_id", actor.id)
            .order("created_at", { ascending: false })
            .limit(12),
        ]);

      if (vehiclesResult.data) {
        currentVehicles = normalizeVehicles(
          vehiclesResult.data.map((record) =>
            mapVehicleRecordToVehicle(record as VehicleRecord),
          ),
        );
      }

      if (incomingResult.data) {
        currentIncomingRequests = normalizeIncomingRequests(
          incomingResult.data.map((record) =>
            mapRequestRecordToRequest(record as RequestRecord),
          ),
        );
      }

      currentActiveRequest =
        activeResult.data && activeResult.data.length > 0
          ? mapRequestRecordToRequest(activeResult.data[0] as RequestRecord)
          : null;

      if (historyResult.data) {
        currentRequestHistory = normalizeHistory(
          historyResult.data.map((record) =>
            toHistoryItem(mapRequestRecordToRequest(record as RequestRecord)),
          ),
        );
      }
    } else {
      const [vehiclesResult, activeResult, historyResult] = await Promise.all([
        vehiclesQuery,
        supabase
          .from(REQUESTS_TABLE)
          .select("*")
          .eq("requester_id", actor.id)
          .not("status", "in", '("Hoàn thành","Đã hủy")')
          .order("created_at", { ascending: false })
          .limit(1),
        supabase
          .from(REQUESTS_TABLE)
          .select("*")
          .eq("requester_id", actor.id)
          .order("created_at", { ascending: false })
          .limit(12),
      ]);

      if (vehiclesResult.data) {
        currentVehicles = normalizeVehicles(
          vehiclesResult.data.map((record) =>
            mapVehicleRecordToVehicle(record as VehicleRecord),
          ),
        );
      }

      currentIncomingRequests = [];
      currentActiveRequest =
        activeResult.data && activeResult.data.length > 0
          ? mapRequestRecordToRequest(activeResult.data[0] as RequestRecord)
          : null;

      if (historyResult.data) {
        currentRequestHistory = normalizeHistory(
          historyResult.data.map((record) =>
            toHistoryItem(mapRequestRecordToRequest(record as RequestRecord)),
          ),
        );
      }
    }

    currentLastSyncedAt = new Date().toISOString();
  } catch {
    // Keep the current local snapshot visible if refresh fails.
  } finally {
    currentIsHydrating = false;
    emitChange();
  }
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
    cancelActiveRequest,
    confirmIncomingRequest,
    advanceActiveRequestStatus,
    completeActiveRequest,
    refreshResQStore,
  };
}

export function setResQStoreScope(user: StoreActor | null) {
  currentActor = user;
  const nextScopeKey = user ? `user:${user.id}` : "guest";

  if (nextScopeKey === currentScopeKey) {
    syncRealtimeChannels(user);
    return;
  }

  currentScopeKey = nextScopeKey;
  hydrateStore();
  syncRealtimeChannels(user);
  notifyListeners();
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
      requesterId: null,
      requesterName: "Nguyễn Văn An",
      requesterPhone: "0901 234 567",
      fixerId: null,
      fixerName: "Fixer ResQ 03",
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
      requesterId: null,
      requesterName: "Lê Minh Khang",
      requesterPhone: "0934 111 222",
      fixerId: null,
      fixerName: "Fixer ResQ 05",
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
