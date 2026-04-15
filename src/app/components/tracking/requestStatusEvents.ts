import { useCallback, useEffect, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";
import { listWorkflowRequestStatusEvents, type WorkflowStatusEventRow } from "@/utils/supabase/requestWorkflow";

export type RequestStatusEvent = {
  id: string;
  requestId: string;
  actorId: string | null;
  actorRole: "user" | "fixer" | "system";
  eventType: "created" | "accepted" | "progressed" | "completed" | "cancelled";
  status:
    | "Chờ fixer xác nhận"
    | "Fixer đã xác nhận"
    | "Đang tiếp cận"
    | "Đang hỗ trợ"
    | "Hoàn thành"
    | "Đã hủy";
  detail: string | null;
  createdAt: string;
};

const REQUEST_STATUS_EVENTS_TABLE = "request_status_events";

function mapWorkflowEventToStatusEvent(event: WorkflowStatusEventRow): RequestStatusEvent {
  return {
    id: event.id,
    requestId: event.request_id,
    actorId: event.actor_id,
    actorRole: event.actor_role,
    eventType: event.event_type,
    status: event.status,
    detail: event.detail,
    createdAt: event.created_at,
  };
}

export function useRequestStatusEvents(requestId: string | null) {
  const [events, setEvents] = useState<RequestStatusEvent[]>([]);
  const [isLoading, setIsLoading] = useState(Boolean(requestId));

  const reload = useCallback(async () => {
    if (!requestId) {
      setEvents([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const nextEvents = await listWorkflowRequestStatusEvents(requestId);
      setEvents(nextEvents.map(mapWorkflowEventToStatusEvent));
    } catch {
      setEvents((currentValue) =>
        currentValue.filter((event) => event.requestId === requestId),
      );
    } finally {
      setIsLoading(false);
    }
  }, [requestId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  useEffect(() => {
    if (!requestId) {
      return;
    }

    const supabase = createClient();
    const channel: RealtimeChannel = supabase
      .channel(`resq-request-status-events:${requestId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: REQUEST_STATUS_EVENTS_TABLE,
          filter: `request_id=eq.${requestId}`,
        },
        () => {
          void reload();
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [reload, requestId]);

  return {
    events,
    isLoading,
  };
}
