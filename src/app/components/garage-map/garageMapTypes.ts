export type GarageCategory = "car" | "motorcycle";
export type GarageDataProvider = "config" | "google-places" | "openstreetmap";

export type GarageRecord = {
  id: string;
  name: string;
  type: GarageCategory;
  lat: number;
  lng: number;
  address?: string | null;
  phone?: string | null;
  rating?: number | null;
  reviewCount?: number | null;
  isOpen?: boolean | null;
  openingHours?: string | null;
  directionsUrl?: string | null;
  sourceId?: string | null;
  provider?: GarageDataProvider;
  googleMapsUrl: string;
};

export type GarageSourceLink = {
  type: GarageCategory;
  url: string;
  label: string;
  labelEn: string;
};

export type GarageMapDataResponse = {
  provider: GarageDataProvider;
  garages: GarageRecord[];
  sourceLinks: GarageSourceLink[];
};
