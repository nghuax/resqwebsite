export function getServiceProgress(status: string, isEnglish = false) {
  const steps = isEnglish ? [
    {
      label: "Request sent",
      detail: "The system recorded the service and is preparing dispatch.",
    },
    {
      label: "Fixer confirmed",
      detail: "The ResQ team accepted the request and is ready to move.",
    },
    {
      label: "En route",
      detail: "The fixer is heading to your location on the updated route.",
    },
    {
      label: "Support in progress",
      detail: "The technician is handling the vehicle and completing the service on site.",
    },
  ] : [
    {
      label: "Yêu cầu đã gửi",
      detail: "Hệ thống đã ghi nhận dịch vụ và chuẩn bị điều phối.",
    },
    {
      label: "Fixer xác nhận",
      detail: "Đội ResQ đã nhận đơn và sẵn sàng di chuyển.",
    },
    {
      label: "Đang di chuyển",
      detail: "Fixer đang đến vị trí của bạn theo tuyến đường cập nhật.",
    },
    {
      label: "Đang hỗ trợ",
      detail: "Kỹ thuật viên xử lý xe và hoàn thiện dịch vụ tại chỗ.",
    },
  ];

  const normalizedStatus = status.toLowerCase();
  const currentIndex = normalizedStatus.includes("hoàn")
    ? 3
    : normalizedStatus.includes("hỗ trợ")
      ? 3
      : normalizedStatus.includes("chờ")
        ? 0
      : normalizedStatus.includes("xác nhận")
        ? 1
        : 2;

  return {
    steps,
    currentIndex,
    percent: ((currentIndex + 1) / steps.length) * 100,
    progressLabel: isEnglish
      ? `${currentIndex + 1}/${steps.length} stages`
      : `${currentIndex + 1}/${steps.length} giai đoạn`,
  };
}
