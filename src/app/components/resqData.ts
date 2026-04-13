import {
  Battery,
  Disc3,
  Droplets,
  Fuel,
  HelpCircle,
  Settings,
  Truck,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";

export type ServiceTarget = "xe-may" | "o-to";

export interface ResQService {
  id: string;
  title: string;
  desc: string;
  price: string;
  eta: string;
  icon: LucideIcon;
  types: ServiceTarget[];
  includes?: string[];
}

export const resqServices: ResQService[] = [
  {
    id: "va-lop",
    title: "Vá lốp / Thay lốp",
    desc: "Xử lý nhanh lốp xe bị thủng, xẹp hoặc hư hỏng trên đường.",
    price: "Từ 50.000đ",
    eta: "15-25 phút",
    icon: Wrench,
    types: ["xe-may", "o-to"],
    includes: ["Kiểm tra tình trạng lốp", "Vá hoặc thay lốp mới", "Bơm hơi đúng áp suất"],
  },
  {
    id: "ac-quy",
    title: "Kích bình / Thay ắc quy",
    desc: "Kích nổ hoặc thay ắc quy mới ngay tại chỗ.",
    price: "Từ 100.000đ",
    eta: "15-25 phút",
    icon: Battery,
    types: ["xe-may", "o-to"],
    includes: ["Kiểm tra ắc quy", "Kích bình hoặc thay mới", "Test hệ thống sạc"],
  },
  {
    id: "nhien-lieu",
    title: "Tiếp nhiên liệu (Xăng/Dầu)",
    desc: "Giao xăng hoặc dầu diesel đến vị trí của bạn.",
    price: "Từ 80.000đ",
    eta: "15-30 phút",
    icon: Fuel,
    types: ["xe-may", "o-to"],
    includes: ["Giao xăng/dầu tận nơi", "Đổ nhiên liệu an toàn", "Kiểm tra hệ thống nhiên liệu"],
  },
  {
    id: "dong-co",
    title: "Sự cố động cơ",
    desc: "Kiểm tra và xử lý các sự cố động cơ tại hiện trường.",
    price: "Từ 200.000đ",
    eta: "20-30 phút",
    icon: Settings,
    types: ["xe-may", "o-to"],
    includes: ["Chẩn đoán lỗi động cơ", "Sửa chữa tại chỗ", "Tư vấn bảo dưỡng"],
  },
  {
    id: "dien",
    title: "Sự cố điện",
    desc: "Khắc phục lỗi hệ thống điện, đèn, còi xe.",
    price: "Từ 150.000đ",
    eta: "15-25 phút",
    icon: Zap,
    types: ["xe-may", "o-to"],
    includes: ["Kiểm tra hệ thống điện", "Sửa lỗi đèn, còi", "Thay cầu chì, rơ le"],
  },
  {
    id: "phanh",
    title: "Phanh / Thắng",
    desc: "Kiểm tra và sửa chữa hệ thống phanh.",
    price: "Từ 120.000đ",
    eta: "20-30 phút",
    icon: Disc3,
    types: ["xe-may", "o-to"],
    includes: ["Kiểm tra má phanh", "Thay má phanh", "Xả gió phanh"],
  },
  {
    id: "dau",
    title: "Thay dầu",
    desc: "Dịch vụ thay dầu nhớt tại nhà hoặc tại chỗ.",
    price: "Từ 100.000đ",
    eta: "15-20 phút",
    icon: Droplets,
    types: ["xe-may", "o-to"],
    includes: ["Xả dầu cũ", "Thay dầu mới chính hãng", "Kiểm tra lọc dầu"],
  },
  {
    id: "cuu-ho",
    title: "Cứu hộ / Kéo xe",
    desc: "Xe cứu hộ đến kéo xe về garage an toàn.",
    price: "Từ 300.000đ",
    eta: "15-30 phút",
    icon: Truck,
    types: ["xe-may", "o-to"],
    includes: ["Kéo xe về garage", "Bảo hiểm khi vận chuyển", "Tư vấn garage uy tín"],
  },
  {
    id: "bugi",
    title: "Thay bugi",
    desc: "Kiểm tra và thay bugi cho xe máy tại chỗ.",
    price: "Từ 40.000đ",
    eta: "10-15 phút",
    icon: Wrench,
    types: ["xe-may"],
    includes: ["Kiểm tra bugi cũ", "Thay bugi mới", "Điều chỉnh khe hở"],
  },
  {
    id: "nhong-sen",
    title: "Thay nhông sên dĩa",
    desc: "Thay bộ nhông sên dĩa cho xe máy tận nơi.",
    price: "Từ 250.000đ",
    eta: "30-45 phút",
    icon: Settings,
    types: ["xe-may"],
    includes: ["Tháo bộ cũ", "Lắp nhông sên dĩa mới", "Căn chỉnh sên"],
  },
  {
    id: "dieu-hoa",
    title: "Điều hòa / Máy lạnh ô tô",
    desc: "Kiểm tra, bơm gas và sửa chữa hệ thống điều hòa.",
    price: "Từ 300.000đ",
    eta: "30-45 phút",
    icon: Droplets,
    types: ["o-to"],
    includes: ["Kiểm tra gas lạnh", "Bơm gas điều hòa", "Vệ sinh dàn lạnh"],
  },
  {
    id: "mo-khoa",
    title: "Mở khóa ô tô",
    desc: "Mở khóa xe khi bị nhốt chìa bên trong hoặc mất chìa.",
    price: "Từ 400.000đ",
    eta: "20-30 phút",
    icon: HelpCircle,
    types: ["o-to"],
    includes: ["Mở khóa chuyên nghiệp", "Không làm hỏng khóa", "Làm chìa dự phòng"],
  },
  {
    id: "chung",
    title: "Hỗ trợ chung",
    desc: "Bất kỳ sự cố nào khác trên đường.",
    price: "Liên hệ",
    eta: "15-30 phút",
    icon: HelpCircle,
    types: ["xe-may", "o-to"],
    includes: ["Đánh giá tình trạng", "Xử lý tại chỗ", "Tư vấn giải pháp"],
  },
];

export const resqServiceFilters = [
  { label: "Tất cả", value: "all" },
  { label: "Xe máy", value: "xe-may" },
  { label: "Ô tô", value: "o-to" },
] as const;
