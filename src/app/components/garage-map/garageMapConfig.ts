import type { GarageRecord, GarageSourceLink } from "./garageMapTypes";

export const garageMapSourceLinks: GarageSourceLink[] = [
  {
    type: "car",
    url: "https://maps.app.goo.gl/CDC9TLkuoXNfPse68",
    label: "Nguon tham chieu o to",
    labelEn: "Car source reference",
  },
  {
    type: "motorcycle",
    url: "https://maps.app.goo.gl/J9RtpC4BUJzrNh2E8",
    label: "Nguon tham chieu xe may",
    labelEn: "Motorcycle source reference",
  },
];

// Optional curated override. Leave this empty to use the live provider chain
// from garageMapService.ts, or populate it with approved garage records when
// you want manual control over what appears in the UI.
export const garageMapSeedData: GarageRecord[] = [];
