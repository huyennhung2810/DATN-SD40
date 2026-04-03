import type { CommonStatus } from "./base";
import { ProductVersion } from "./productVersion";


export interface SerialResponse {
  id: string;
  serialNumber: string;
  // Sửa từ serialCode thành code để khớp với logic: data.serials[0].code
  code: string; 
  status: string;
  productName?: string;
  productDetailId?: string;
  createdDate?: string;
}

export interface ProductDetailResponse {
  id: string;
  code: string;
  note: string;

  // Tên phiên bản hiển thị đầy đủ (format: "{VariantVersion} / {Color} / {Storage}")
  version: string;

  // Phiên bản máy ảnh Canon - dimension bắt buộc cấp 1
  // Giá trị: BODY_ONLY, KIT_18_45, KIT_18_150
  variantVersion: ProductVersion;

  // Display name của variantVersion (VD: "Body Only", "Kit 18-45", "Kit 18-150")
  variantVersionDisplayName?: string;

  quantity: number;
  salePrice: number;
  status: CommonStatus;
  colorName: string;
  productName: string;
  storageCapacityName: string;
  creationDate: string;

  // BỔ SUNG 3 DÒNG NÀY: Để TypeScript hiểu được data.productId, colorId...
  productId: string;
  colorId: string;
  storageCapacityId: string;

  // Thêm trường ảnh cho biến thể
  imageUrl?: string;

  // ID của ảnh được chọn từ sản phẩm mẹ
  selectedImageId?: string;

  // Thông tin ảnh đã chọn (để frontend hiển thị trực tiếp)
  selectedImage?: {
    id: string;
    url: string;
    displayOrder?: number;
  };

  // Danh sách serials
  serials?: SerialResponse[];
}

export interface ProductDetailFormValues {
  code: string;
  note: string;

  // Tên phiên bản hiển thị đầy đủ (format: "{VariantVersion} / {Color} / {Storage}")
  // NOTE: Trường này sẽ được backend auto-generate, frontend chỉ cần hiển thị
  version: string;

  // Phiên bản máy ảnh Canon - dimension bắt buộc cấp 1
  // Giá trị: BODY_ONLY, KIT_18_45, KIT_18_150
  // LEVEL 1: Bắt buộc phải có khi submit form
  variantVersion: ProductVersion;

  quantity: number;
  salePrice: number;
  status: CommonStatus;
  colorId?: string;
  productId?: string;
  storageCapacityId?: string;
  serialCode?: string; // Thêm trường này để quản lý mã Serial chung trên Form
  serials?: {
    serialNumber: string;
    code: string;
    status: string;
  }[];
  serialList?: string;

  // ID của ảnh được chọn từ sản phẩm mẹ
  selectedImageId?: string;
}

export const initialProductDetail: ProductDetailFormValues = {
  code: "",
  note: "",
  version: "",
  variantVersion: ProductVersion.BODY_ONLY, // Default value
  quantity: 0,
  salePrice: 0,
  status: "ACTIVE",
};

export interface ProductDetailPageParams {
  keyword?: string;
  status?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  minPrice?: number;
  maxPrice?: number;
}

// Request interface for creating/updating product detail (variant)
export interface ProductDetailRequest {
  code: string;

  // Tên phiên bản hiển thị đầy đủ (format: "{VariantVersion} / {Color} / {Storage}")
  // NOTE: Backend sẽ auto-generate, frontend có thể bỏ qua trường này khi submit
  version?: string;

  // Phiên bản máy ảnh Canon - dimension bắt buộc cấp 1
  // Giá trị: BODY_ONLY, KIT_18_45, KIT_18_150
  // LEVEL 1: Bắt buộc phải có khi submit form
  variantVersion: ProductVersion;

  colorId: string;
  storageCapacityId: string;
  salePrice: number;
  quantity?: number;
  status?: CommonStatus;
  imageUrl?: string;
  note?: string;

  // ID của ảnh được chọn từ sản phẩm mẹ
  selectedImageId?: string;

  // Danh sách serial khi thêm mới biến thể
  serials?: {
    serialNumber: string;
    code: string;
    status: string;
  }[];

  // Danh sách serial mới được thêm khi cập nhật biến thể (chỉ append, không ghi đè)
  newSerials?: string[];
}

// ===== BATCH CREATE TYPES =====

export interface BatchCreateItem {
  productCode: string;
  versionId: string;
  colorId: string;
  storageCapacityId: string;
  price: number;
  imageUrl?: string;
  note?: string;
  serials?: {
    serialNumber: string;
    code?: string;
    status?: string;
  }[];
}

export interface BatchCreateRequest {
  items: BatchCreateItem[];
}

export interface BatchCreatedItem {
  rowIndex: number;
  id: string;
  code: string;
  version: string;
  colorName: string;
  storageCapacityName: string;
  serialCount: number;
}

export interface BatchCreateError {
  rowIndex: number;
  field: string;
  code?: string;
  message: string;
}

export interface BatchCreateResponse {
  success: boolean;
  message: string;
  totalRequested: number;
  totalCreated: number;
  createdItems: BatchCreatedItem[];
  errors: BatchCreateError[];
}

// ===== PREVIEW ROW TYPE =====

export interface BatchVariantRow {
  id?: string; // temp id for react key
  rowIndex: number;
  versionId: string;
  versionName: string;
  colorId: string;
  colorName: string;
  storageId: string;
  storageName: string;
  productCode: string;
  price: number;
  imageUrl?: string;
  note?: string;
  serials: string[];
  error?: string;
  errorField?: string;
}