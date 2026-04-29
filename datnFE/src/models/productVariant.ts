import type { CommonStatus } from "./base";
import { ProductVersion } from "./productVersion";

export type SerialBusinessStatus = 'AVAILABLE' | 'IN_ORDER' | 'SOLD' | 'DEFECTIVE' | 'WARRANTY';

export interface SerialResponse {
  id: string;
  serialNumber: string;
  code: string;
  status: string;
  serialStatus?: SerialBusinessStatus;
  productName?: string;
  productDetailId?: string;
  createdDate?: string;
}

export interface ProductVariantResponse {
  id: string;
  code?: string;
  /** Admin/public API thường dùng `version`; GET /client/product/:id trả `name`. */
  version?: string;
  /** Tên hiển thị từ CnVariantResponse (client product detail). */
  name?: string;

  // Phiên bản máy ảnh Canon - dimension bắt buộc cấp 1
  // Giá trị: BODY_ONLY, KIT_18_45, KIT_18_150
  variantVersion?: ProductVersion;

  colorId?: string;
  colorName: string;
  colorCode?: string;
  storageCapacityId?: string;
  storageCapacityName: string;
  salePrice: number;
  /** Giá gốc = salePrice. Dùng để hiển thị giá cũ gạch ngang khi có giảm giá. */
  originalPrice?: number;
  /** Giá sau khi áp dụng giảm giá (nếu có đang hoạt động). Null nếu không giảm. */
  discountedPrice?: number;
  /** Giá hiển thị trên UI = discountedPrice (nếu có) hoặc salePrice. */
  displayPrice?: number;
  /** True nếu variant này đang trong đợt giảm giá hợp lệ. */
  hasActiveSaleCampaign?: boolean;
  /** Tồn kho từ admin/public API. */
  quantity?: number;
  /** Tồn kho từ GET /client/product/:id (CnVariantResponse). */
  stock?: number;
  status?: CommonStatus;
  imageUrls?: string[];
  
  // Ảnh cũ của biến thể (url trực tiếp)
  imageUrl?: string;
  
  // ID của ảnh được chọn từ sản phẩm mẹ
  selectedImageId?: string;
  
  // URL của ảnh đại diện
  selectedImageUrl?: string;

  // Danh sách serial của biến thể (dùng cho modal edit)
  serials?: SerialResponse[];
}

export interface ProductWithVariantsResponse {
  // Thông tin sản phẩm cha
  id: string;
  name: string;
  description?: string;
  idProductCategory?: string;
  productCategoryName?: string;
  idTechSpec?: string;
  techSpecName?: string;
  price?: number;
  status: CommonStatus;
  createdDate?: number;
  lastModifiedDate?: number;
  imageUrls?: string[];
  techSpec?: any;

  /** Thông số kỹ thuật động (key-value), key: spec_{definitionCode} */
  techSpecDynamic?: Record<string, string | number | null | undefined>;

  // Danh sách ảnh của sản phẩm mẹ (để chọn cho biến thể)
  productImages?: ProductImageItem[];

  // Thông tin tổng hợp từ các biến thể con
  totalQuantity?: number;
  minPrice?: number;
  maxPrice?: number;
  variantCount?: number;

  // Danh sách biến thể con
  variants?: ProductVariantResponse[];
}

export interface ProductImageItem {
  id: string;
  url: string;
  displayOrder?: number;
}

// =============================================
// DTOs đầy đủ cho trang chi tiết sản phẩm client
// =============================================

/** Thông số kỹ thuật cố định gắn với Product */
export interface FixedSpecs {
  sensorType?: string | null;
  lensMount?: string | null;
  resolution?: string | null;
  iso?: string | null;
  processor?: string | null;
  imageFormat?: string | null;
  videoFormat?: string | null;
}

/** Một dòng thông số động */
export interface SpecItem {
  definitionId: string;
  definitionName: string | null;
  value: string | null;
  unit: string | null;
  displayOrder: number | null;
}

/** Nhóm thông số động */
export interface DynamicSpecGroup {
  groupId: string;
  groupName: string;
  groupOrder: number | null;
  items: SpecItem[];
}

/** Container chứa cả fixed + dynamic specs */
export interface TechSpecDetail {
  fixedSpecs?: FixedSpecs | null;
  dynamicSpecs?: DynamicSpecGroup[];
}

/** Response trả về cho trang chi tiết sản phẩm client */
export interface CnProductResponse {
  id: string;
  name: string;
  description?: string;
  /** Jackson có thể trả number hoặc string cho BigDecimal */
  displayPrice?: number | string | null;
  originalPrice?: number | string | null;
  cheapestVariantId?: string | null;
  hasActiveSaleCampaign?: boolean;
  discountAmount?: number | string | null;
  discountPercent?: number | string | null;
  images?: string[];
  variants?: ProductVariantResponse[];
  /** Thông số kỹ thuật đầy đủ (cố định + động) — dùng thay thế specifications[] */
  techSpec?: TechSpecDetail | null;
  /** @deprecated Dùng techSpec thay cho list phẳng này */
  specifications?: Array<{ name: string; value: string }>;
}

/** =============================================
 * Related Product DTO
 * ============================================= */

/** Tóm tắt thông số kỹ thuật dùng cho card hiển thị */
export interface RelatedTechSummary {
  sensorType?: string | null;
  lensMount?: string | null;
  resolution?: string | null;
  processor?: string | null;
  videoFormat?: string | null;
  iso?: string | null;
  imageFormat?: string | null;
}

/** Response cho endpoint /api/v1/client/product/{id}/related */
export interface RelatedProductResponse {
  productId: string;
  productName: string;
  slug?: string;
  thumbnail?: string;
  brand?: string;
  brandId?: string;
  category?: string;
  categoryId?: string;
  originalPrice?: number | null;
  displayPrice?: number | null;
  hasActiveSaleCampaign?: boolean;
  discountPercent?: number | null;
  techSummary?: RelatedTechSummary;
  /** Các lý do đề xuất, ví dụ: ["Cùng cảm biến Full Frame", "Tầm giá 15 – 30 triệu"] */
  matchReasons?: string[];
}
