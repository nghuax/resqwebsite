import { createClient } from "./client";

export type WorkflowRequestRow = {
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
  vehicle_type: "Xe máy" | "Ô tô";
  location_address: string;
  location_lat: number;
  location_lng: number;
  location_source: "browser" | "fallback" | "manual";
  notes: string | null;
  fixer_id: string | null;
  fixer_name: string | null;
  fixer_team: string | null;
  fixer_vehicle: string | null;
  status:
    | "Chờ fixer xác nhận"
    | "Fixer đã xác nhận"
    | "Đang tiếp cận"
    | "Đang hỗ trợ"
    | "Hoàn thành"
    | "Đã hủy";
  created_at: string;
  updated_at?: string;
};

export type WorkflowMessageRow = {
  id: string;
  request_id: string;
  sender_id: string | null;
  sender_name: string;
  sender_role: "user" | "fixer" | "system";
  body: string;
  created_at: string;
};

export type WorkflowStatusEventRow = {
  id: string;
  request_id: string;
  actor_id: string | null;
  actor_role: "user" | "fixer" | "system";
  event_type: "created" | "accepted" | "progressed" | "completed" | "cancelled";
  status:
    | "Chờ fixer xác nhận"
    | "Fixer đã xác nhận"
    | "Đang tiếp cận"
    | "Đang hỗ trợ"
    | "Hoàn thành"
    | "Đã hủy";
  detail: string | null;
  created_at: string;
};

export type WorkflowLiveState = {
  actor_role: "user" | "fixer";
  active_request: WorkflowRequestRow | null;
  pending_requests: WorkflowRequestRow[];
  request_history: WorkflowRequestRow[];
  fixer_approval_status?: "pending" | "approved" | "suspended" | null;
  fixer_is_available?: boolean | null;
};

function unwrapSingleRow<T>(value: T | T[] | null) {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

async function callRequestRpc(
  functionName:
    | "create_service_request"
    | "accept_service_request"
    | "advance_service_request_status"
    | "complete_service_request"
    | "cancel_service_request",
  args: Record<string, unknown>,
) {
  const { data, error } = await createClient().rpc(functionName, args);

  if (error) {
    throw error;
  }

  return unwrapSingleRow(
    data as WorkflowRequestRow | WorkflowRequestRow[] | null,
  );
}

export async function createServiceRequest(input: {
  id: string;
  serviceId: string;
  serviceTitle: string;
  servicePrice: string;
  serviceEta: string;
  vehicleId: string;
  vehicleName: string;
  vehiclePlate: string;
  vehicleType: "Xe máy" | "Ô tô";
  locationAddress: string;
  locationLat: number;
  locationLng: number;
  locationSource: "browser" | "fallback" | "manual";
  notes?: string;
}) {
  return callRequestRpc("create_service_request", {
    p_request_id: input.id,
    p_service_id: input.serviceId,
    p_service_title: input.serviceTitle,
    p_service_price: input.servicePrice,
    p_service_eta: input.serviceEta,
    p_vehicle_id: input.vehicleId,
    p_vehicle_name: input.vehicleName,
    p_vehicle_plate: input.vehiclePlate,
    p_vehicle_type: input.vehicleType,
    p_location_address: input.locationAddress,
    p_location_lat: input.locationLat,
    p_location_lng: input.locationLng,
    p_location_source: input.locationSource,
    p_notes: input.notes?.trim() || null,
  });
}

export async function acceptServiceRequest(requestId: string) {
  return callRequestRpc("accept_service_request", {
    p_request_id: requestId,
  });
}

export async function advanceServiceRequestStatus(requestId: string) {
  return callRequestRpc("advance_service_request_status", {
    p_request_id: requestId,
  });
}

export async function completeServiceRequest(requestId: string) {
  return callRequestRpc("complete_service_request", {
    p_request_id: requestId,
  });
}

export async function cancelServiceRequest(requestId: string) {
  return callRequestRpc("cancel_service_request", {
    p_request_id: requestId,
  });
}

export async function sendWorkflowRequestMessage(input: {
  requestId: string;
  body: string;
}) {
  const nextBody = input.body.trim();
  if (!nextBody) {
    return null;
  }

  const { data, error } = await createClient().rpc("send_request_message", {
    p_request_id: input.requestId,
    p_body: nextBody,
  });

  if (error) {
    throw error;
  }

  return unwrapSingleRow(
    data as WorkflowMessageRow | WorkflowMessageRow[] | null,
  );
}

export async function loadWorkflowLiveState() {
  const { data, error } = await createClient().rpc("load_live_request_state");

  if (error) {
    throw error;
  }

  return (data ?? {
    actor_role: "user",
    active_request: null,
    pending_requests: [],
    request_history: [],
    fixer_approval_status: null,
    fixer_is_available: null,
  }) as WorkflowLiveState;
}

export async function listWorkflowRequestStatusEvents(requestId: string) {
  if (!requestId) {
    return [];
  }

  const { data, error } = await createClient().rpc("list_request_status_events", {
    p_request_id: requestId,
  });

  if (error) {
    throw error;
  }

  return (data ?? []) as WorkflowStatusEventRow[];
}
