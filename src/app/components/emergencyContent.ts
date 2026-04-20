import type { Language } from "./LanguageContext";

export interface EmergencyLine {
  label: string;
  labelEn: string;
  number: string;
  note: string;
  noteEn: string;
}

export interface LocalSupportPlace {
  title: string;
  titleEn: string;
  address: string;
  addressEn: string;
  phone: string;
  note: string;
  noteEn: string;
}

export const emergencyLines: EmergencyLine[] = [
  {
    label: "Cứu nạn tổng hợp",
    labelEn: "Unified emergency",
    number: "112",
    note: "Đầu số quốc gia cho tình huống khẩn cấp và cứu nạn.",
    noteEn: "National line for urgent incidents and rescue support.",
  },
  {
    label: "Công an",
    labelEn: "Police",
    number: "113",
    note: "Dùng khi cần hỗ trợ an ninh hoặc tai nạn giao thông nghiêm trọng.",
    noteEn: "Use for security incidents or serious road accidents.",
  },
  {
    label: "Cứu hỏa",
    labelEn: "Fire & rescue",
    number: "114",
    note: "Dùng khi có cháy nổ, kẹt người hoặc nguy cơ lan rộng.",
    noteEn: "Use for fires, entrapment, or escalating danger.",
  },
  {
    label: "Cấp cứu y tế",
    labelEn: "Ambulance",
    number: "115",
    note: "Gọi ngay nếu có chấn thương, khó thở hoặc cần vận chuyển y tế.",
    noteEn: "Call immediately for injuries, breathing trouble, or urgent medical transport.",
  },
  {
    label: "Điều phối ResQ",
    labelEn: "ResQ dispatch",
    number: "1900 1234",
    note: "Hotline điều phối cứu hộ xe máy và ô tô của ResQ.",
    noteEn: "ResQ dispatch line for roadside support and towing.",
  },
];

export const localSupportPlaces: LocalSupportPlace[] = [
  {
    title: "Bệnh viện Đại học Y Dược TP.HCM - Cơ sở 2",
    titleEn: "University Medical Center HCMC - Campus 2",
    address: "201 Nguyễn Chí Thanh, Phường Chợ Lớn, TP. Hồ Chí Minh",
    addressEn: "201 Nguyen Chi Thanh, Cho Lon Ward, Ho Chi Minh City",
    phone: "(84.8) 3955 5548",
    note: "Điểm cấp cứu trung tâm gần các trục Q.5 - Q.10.",
    noteEn: "Central medical option near the District 5 and District 10 corridors.",
  },
  {
    title: "Bệnh viện Nhân dân Gia Định",
    titleEn: "Gia Dinh People's Hospital",
    address: "01 Nơ Trang Long, Phường 7, Bình Thạnh, TP. Hồ Chí Minh",
    addressEn: "01 No Trang Long, Ward 7, Binh Thanh, Ho Chi Minh City",
    phone: "028 3841 2692",
    note: "Thuận tiện cho Bình Thạnh, Phú Nhuận và cửa ngõ phía đông.",
    noteEn: "Convenient for Binh Thanh, Phu Nhuan, and the eastern gateway.",
  },
  {
    title: "ResQ Hub ưu tiên",
    titleEn: "ResQ priority hub",
    address: "Cụm điều phối Quận 1 - Bình Thạnh - Thủ Đức",
    addressEn: "Dispatch corridor across District 1, Binh Thanh, and Thu Duc",
    phone: "1900 1234",
    note: "Điểm hỗ trợ nhanh cho các tuyến nội đô và xa lộ chính.",
    noteEn: "Fast-response corridor for key inner-city roads and major highways.",
  },
];

export function getLocalizedText(
  language: Language,
  vietnamese: string,
  english: string,
) {
  return language === "en" ? english : vietnamese;
}
