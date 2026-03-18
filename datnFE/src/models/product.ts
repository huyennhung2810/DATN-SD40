import type { CommonStatus } from "./base";
import type {TechSpecRequest, TechSpecResponse} from "./techSpec";

export interface ProductResponse {
  id: string;
  name: string;
  description?: string;
  idProductCategory?: string;
  productCategoryName?: string;
  idBrand?: string;
  brandName?: string;
  idTechSpec?: string;
  techSpecName?: string;
  techSpec?: TechSpecResponse;
  price?: number;
  status: CommonStatus;
  createdDate: number;
  lastModifiedDate: number;
  imageUrls?: string[];
}

export interface ProductRequest {
  id?: string;
  name: string;
  description?: string;
  idProductCategory?: string | null;
  idBrand?: string | null;
  idTechSpec?: string | null;
  techSpec?: TechSpecRequest | null;
  status?: CommonStatus;
  imageUrls?: string[];
}

export interface ProductPageParams {
  page: number;
  size: number;
  name?: string;
  idProductCategory?: string;
  idBrand?: string;
  idTechSpec?: string;
  status?: CommonStatus;
  // Price filters
  minPrice?: number;
  maxPrice?: number;
  // TechSpec filters
  sensorType?: string;
  lensMount?: string;
  resolution?: string;
  processor?: string;
  imageFormat?: string;
  videoFormat?: string;
  iso?: string;
  // Sorting
  sortBy?: string;
  orderBy?: string;
}

export const initialProduct: ProductRequest = {
  name: "",
  description: "",
  idProductCategory: "",
  idBrand: "",
  status: "ACTIVE",
  techSpec: {
    sensorType: undefined,
    lensMount: undefined,
    resolution: undefined,
    iso: "",
    processor: undefined,
    imageFormat: undefined,
    videoFormat: undefined,
  },
};

