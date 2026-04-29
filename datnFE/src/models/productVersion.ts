/**
 * Enum đại diện cho "Phiên bản" của máy ảnh Canon.
 * Đây là dimension bắt buộc cấp 1 cho biến thể sản phẩm.
 *
 * LEVEL 1: Chỉ hỗ trợ 3 giá trị cố định:
 * - BODY_ONLY: Body Only (chỉ thân máy)
 * - KIT_18_45: Kit 18-45mm (thân máy + lens 18-45mm)
 * - KIT_18_150: Kit 18-150mm (thân máy + lens 18-150mm)
 *
 * Chuẩn bị mở rộng cho LEVEL 2:
 * - Thêm bundle phụ kiện
 * - Thêm memory card bundle
 * - Tự động generate SKU
 */
export enum ProductVersion {
  BODY_ONLY = "BODY_ONLY",
  KIT_18_45 = "KIT_18_45",
  KIT_18_150 = "KIT_18_150",
}

/**
 * Display names cho ProductVersion - dùng để hiển thị
 */
export const ProductVersionLabels: Record<ProductVersion, string> = {
  [ProductVersion.BODY_ONLY]: "Body Only",
  [ProductVersion.KIT_18_45]: "Kit 18-45",
  [ProductVersion.KIT_18_150]: "Kit 18-150",
};

/**
 * Options cho select field - dùng trong form Ant Design
 */
export const ProductVersionOptions = [
  { value: ProductVersion.BODY_ONLY, label: "Body Only" },
  { value: ProductVersion.KIT_18_45, label: "Kit 18-45" },
  { value: ProductVersion.KIT_18_150, label: "Kit 18-150" },
];

/**
 * Lấy display name từ enum value
 * @param version - Giá trị enum (VD: "BODY_ONLY")
 * @returns Display name (VD: "Body Only")
 */
export function getProductVersionDisplayName(version: string | undefined | null): string {
  if (!version) return ProductVersionLabels[ProductVersion.BODY_ONLY];
  return ProductVersionLabels[version as ProductVersion] ?? ProductVersionLabels[ProductVersion.BODY_ONLY];
}

/**
 * Lấy label hiển thị ngắn gọn cho variant (dùng trong card header)
 * Format: "Phiên bản / Màu sắc / Dung lượng"
 * VD: "Body Only / Đen / 64GB"
 */
export function getVariantShortLabel(
  variantVersion: string | undefined,
  colorName: string,
  storageCapacityName: string
): string {
  const version = variantVersion
    ? ProductVersionLabels[variantVersion as ProductVersion] ?? "Chưa xác định"
    : "Body Only";
  return `${version} / ${colorName || "Không rõ"} / ${storageCapacityName || "Không rõ"}`;
}

/**
 * Format thông tin variant đầy đủ cho hiển thị card
 * @returns Object chứa các trường đã format để hiển thị
 */
export function formatVariantDisplayInfo(variant: {
  code: string;
  version?: string;
  variantVersion?: ProductVersion;
  colorName: string;
  storageCapacityName: string;
  salePrice: number;
  quantity: number;
  status: string;
}) {
  const versionDisplay = variant.variantVersion
    ? ProductVersionLabels[variant.variantVersion] ?? "Body Only"
    : variant.version || "Body Only";

  const colorDisplay = variant.colorName || "Không rõ";
  const storageDisplay = variant.storageCapacityName || "Không rõ";

  return {
    sku: variant.code || "Không có mã",
    versionDisplay,
    colorDisplay,
    storageDisplay,
    shortLabel: `${versionDisplay} / ${colorDisplay} / ${storageDisplay}`,
    priceDisplay: variant.salePrice?.toLocaleString('vi-VN') + " đ" || "0 đ",
    priceRaw: variant.salePrice || 0,
    quantityDisplay: `${variant.quantity || 0} máy`,
    quantityRaw: variant.quantity || 0,
    statusDisplay: variant.status === "ACTIVE" ? "Đang bán" : "Ngừng bán",
    statusColor: variant.status === "ACTIVE" ? "success" : "default",
    quantityColor: variant.quantity > 0 ? "green" : "red",
    isInStock: variant.quantity > 0,
  };
}

/**
 * Kiểm tra giá trị có hợp lệ không
 */
export function isValidProductVersion(version: string | undefined | null): boolean {
  if (!version) return false;
  return Object.values(ProductVersion).includes(version as ProductVersion);
}

/**
 * Get all valid ProductVersion values
 */
export function getAllProductVersionValues(): ProductVersion[] {
  return Object.values(ProductVersion);
}
