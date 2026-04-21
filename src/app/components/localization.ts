import { resqServices } from "./resqData";

export function t(isEnglish: boolean, vi: string, en: string) {
  return isEnglish ? en : vi;
}

export function localizeVehicleType(value: string | null | undefined, isEnglish: boolean) {
  if (!value || !isEnglish) {
    return value ?? "";
  }

  if (value === "Xe máy") {
    return "Motorbike";
  }

  if (value === "Ô tô") {
    return "Car";
  }

  return value;
}

export function localizeRequestStatus(value: string | null | undefined, isEnglish: boolean) {
  if (!value || !isEnglish) {
    return value ?? "";
  }

  const statusMap: Record<string, string> = {
    "Chờ fixer xác nhận": "Waiting for fixer confirmation",
    "Fixer đã xác nhận": "Fixer confirmed",
    "Đang tiếp cận": "Fixer en route",
    "Đang hỗ trợ": "Support in progress",
    "Hoàn thành": "Completed",
    "Đã hủy": "Cancelled",
    "Chưa thanh toán": "Unpaid",
    "Đã thanh toán": "Paid",
  };

  return statusMap[value] ?? value;
}

export function localizeServiceTitle(input: {
  serviceId?: string | null;
  serviceTitle?: string | null;
}, isEnglish: boolean) {
  const service = resqServices.find(
    (item) =>
      item.id === input.serviceId ||
      item.title === input.serviceTitle ||
      item.titleEn === input.serviceTitle,
  );

  if (!service) {
    return input.serviceTitle ?? "";
  }

  return isEnglish ? service.titleEn : service.title;
}

export function localizeServiceEta(value: string | null | undefined, isEnglish: boolean) {
  if (!value || !isEnglish) {
    return value ?? "";
  }

  return value
    .replace("Dưới 1 phút", "Under 1 min")
    .replace(/phút/gi, "min");
}

export function localizeServicePrice(value: string | null | undefined, isEnglish: boolean) {
  if (!value || !isEnglish) {
    return value ?? "";
  }

  if (value === "Liên hệ") {
    return "Contact us";
  }

  return value
    .replace(/^Từ\s+/i, "From ")
    .replace(/(\d[\d.]*)đ/g, (_, amount: string) => `${amount.replace(/\./g, ",")} VND`);
}

export function localizeRoleLabel(value: string | null | undefined, isEnglish: boolean) {
  if (value === "fixer") {
    return isEnglish ? "ResQ fixer" : "Fixer ResQ";
  }

  return isEnglish ? "Customer" : "Khách hàng";
}

export function localizeFixerMeta(value: string | null | undefined, isEnglish: boolean) {
  if (!value || !isEnglish) {
    return value ?? "";
  }

  return value
    .replace(/^Đội lưu động ResQ/i, "ResQ mobile team")
    .replace(/^Box van cứu hộ$/i, "Recovery box van");
}

export function localizeTrackingStatusLabel(value: string, isEnglish: boolean) {
  if (!isEnglish) {
    return value;
  }

  const statusMap: Record<string, string> = {
    "Đã tới nơi": "Arrived",
    "Sắp đến": "Almost there",
    "Đang đến": "En route",
    "Đang điều phối": "Dispatching",
  };

  return statusMap[value] ?? value;
}

export function localizeStatusEventDetail(input: {
  eventType?: string;
  status?: string;
  detail?: string | null;
}, isEnglish: boolean) {
  if (!isEnglish) {
    return input.detail || "ResQ đã ghi nhận thay đổi mới cho yêu cầu này.";
  }

  if (input.eventType === "created") {
    return "ResQ recorded the request and is waiting for a fixer to confirm.";
  }

  if (input.eventType === "accepted") {
    return "A fixer accepted the request and is ready to move.";
  }

  if (input.eventType === "progressed") {
    return `The request moved to ${localizeRequestStatus(input.status, true).toLowerCase()}.`;
  }

  if (input.eventType === "completed") {
    return "The request was completed and is ready for payment or review.";
  }

  if (input.eventType === "cancelled") {
    return "The request was cancelled.";
  }

  return "ResQ recorded a new update for this request.";
}
