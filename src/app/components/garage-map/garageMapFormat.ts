import type { GarageCategory, GarageRecord } from "./garageMapTypes";

export function formatGarageCategoryLabel(
  category: GarageCategory,
  isEnglish: boolean,
) {
  if (category === "car") {
    return isEnglish ? "Car Garage" : "Garage o to";
  }

  return isEnglish ? "Motorcycle Garage" : "Garage xe may";
}

export function formatReviewCount(value: number, isEnglish: boolean) {
  const formatted = new Intl.NumberFormat(isEnglish ? "en-US" : "vi-VN").format(value);
  return isEnglish ? `${formatted} reviews` : `${formatted} danh gia`;
}

export function formatRatingCopy(
  garage: GarageRecord,
  isEnglish: boolean,
) {
  if (typeof garage.rating === "number") {
    return garage.rating.toFixed(1);
  }

  return isEnglish ? "No public rating" : "Chua co diem danh gia";
}

export function formatReviewCopy(
  garage: GarageRecord,
  isEnglish: boolean,
) {
  if (typeof garage.reviewCount === "number") {
    return formatReviewCount(garage.reviewCount, isEnglish);
  }

  return isEnglish ? "No review count yet" : "Chua co so luong danh gia";
}

export function formatPhoneCopy(
  garage: GarageRecord,
  isEnglish: boolean,
) {
  return garage.phone || (isEnglish ? "Phone not listed" : "Chua co so dien thoai");
}

export function formatAddressCopy(
  garage: GarageRecord,
  isEnglish: boolean,
) {
  return garage.address || (isEnglish ? "Location shown on the map" : "Vi tri da hien tren ban do");
}

export function formatOpeningHoursCopy(
  garage: GarageRecord,
  isEnglish: boolean,
) {
  if (garage.openingHours) {
    return garage.openingHours;
  }

  return isEnglish ? "Hours not listed" : "Chua co gio mo cua";
}

export function getGarageStatusCopy(
  garage: GarageRecord,
  isEnglish: boolean,
) {
  if (garage.isOpen === true) {
    return isEnglish ? "Open now" : "Dang mo cua";
  }

  if (garage.isOpen === false) {
    return isEnglish ? "Closed now" : "Dang dong cua";
  }

  return isEnglish ? "Hours unavailable" : "Chua ro gio mo cua";
}
