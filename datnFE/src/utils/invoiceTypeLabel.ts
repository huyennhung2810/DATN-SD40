/** Nhãn hiển thị theo enum backend TypeInvoice (order_type) */
export function invoiceTypeLabel(t?: string | null): string {
  switch (t) {
    case "OFFLINE":
      return "Tại quầy";
    case "ONLINE":
      return "Online";
    case "GIAO_HANG":
      return "Giao hàng (quầy)";
    default:
      return t ?? "—";
  }
}

export function invoiceTypeTagColor(t?: string | null): string {
  switch (t) {
    case "OFFLINE":
      return "orange";
    case "ONLINE":
      return "blue";
    case "GIAO_HANG":
      return "purple";
    default:
      return "default";
  }
}
