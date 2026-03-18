import type { CommonStatus } from "./base";

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
  colorId?: string;
  colorName: string;
  colorCode?: string;
  storageCapacityId?: string;
  storageCapacityName: string;
  salePrice: number;
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
