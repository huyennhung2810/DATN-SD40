export interface ProductImageResponse {
  id: string;
  idProduct: string;
  productName: string;
  displayOrder?: number;
  url: string;
  createdDate: number;
}

export interface ProductImageRequest {
  id?: string;
  idProduct: string;
  displayOrder?: number;
  url?: string;
}

export interface ProductImageUploadRequest {
  file?: File;
  image?: File;
}

