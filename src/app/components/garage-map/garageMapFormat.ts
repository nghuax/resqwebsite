import type { GarageCategory, GarageRecord } from "./garageMapTypes";

export function formatGarageCategoryLabel(
  category: GarageCategory,
  isEnglish: boolean,
) {
  if (category === "car") {
    return isEnglish ? "Car Garage" : "Garage ô tô";
  }

  return isEnglish ? "Motorcycle Garage" : "Garage xe máy";
}

export function formatReviewCount(value: number, isEnglish: boolean) {
  const formatted = new Intl.NumberFormat(isEnglish ? "en-US" : "vi-VN").format(value);
  return isEnglish ? `${formatted} reviews` : `${formatted} đánh giá`;
}

export function formatRatingCopy(
  garage: GarageRecord,
  isEnglish: boolean,
) {
  if (typeof garage.rating === "number") {
    return garage.rating.toFixed(1);
  }

  return isEnglish ? "No public rating" : "Chưa có điểm đánh giá";
}

export function formatReviewCopy(
  garage: GarageRecord,
  isEnglish: boolean,
) {
  if (typeof garage.reviewCount === "number") {
    return formatReviewCount(garage.reviewCount, isEnglish);
  }

  return isEnglish ? "No review count yet" : "Chưa có số lượng đánh giá";
}

export function formatPhoneCopy(
  garage: GarageRecord,
  isEnglish: boolean,
) {
  return garage.phone || (isEnglish ? "Phone not listed" : "Chưa có số điện thoại");
}

export function formatAddressCopy(
  garage: GarageRecord,
  isEnglish: boolean,
) {
  return garage.address || (isEnglish ? "Location shown on the map" : "Vị trí đã hiện trên bản đồ");
}

export function formatOpeningHoursCopy(
  garage: GarageRecord,
  isEnglish: boolean,
) {
  if (garage.openingHours) {
    return garage.openingHours;
  }

  return isEnglish ? "Hours not listed" : "Chưa có giờ mở cửa";
}

export function getGarageStatusCopy(
  garage: GarageRecord,
  isEnglish: boolean,
) {
  if (garage.isOpen === true) {
    return isEnglish ? "Open now" : "Đang mở cửa";
  }

  if (garage.isOpen === false) {
    return isEnglish ? "Closed now" : "Đang đóng cửa";
  }

  return isEnglish ? "Hours unavailable" : "Chưa rõ giờ mở cửa";
}
