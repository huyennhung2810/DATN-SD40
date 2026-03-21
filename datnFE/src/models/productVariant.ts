import type { CommonStatus } from "./base";
import { ProductVersion } from "./productVersion";

export interface SerialResponse {
  id: string;
  serialNumber: string;
  code: string;
  status: string;
  serialStatus?: string;
  productName?: string;
  productDetailId?: string;
  createdDate?: string;
}

export interface ProductVariantResponse {
  id: string;
  code: string;
  version: string;

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
  quantity: number;
  status: CommonStatus;
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
