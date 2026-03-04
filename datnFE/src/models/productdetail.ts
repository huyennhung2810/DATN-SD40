import type { CommonStatus } from "./base";


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
  version: string;
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

  // Danh sách serials
  serials?: SerialResponse[]; 
}

export interface ProductDetailFormValues {
  code: string;
  note: string;
  version: string;
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
}

export const initialProductDetail: ProductDetailFormValues = {
  code: "",
  note: "",
  version: "",
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