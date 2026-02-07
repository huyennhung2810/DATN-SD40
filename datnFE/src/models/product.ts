import type { CommonStatus } from "./base";
import type {TechSpecRequest, TechSpecResponse} from "./techSpec";

export interface ProductResponse {
  id: string;
  name: string;
  description?: string;
  idProductCategory?: string;
  productCategoryName?: string;
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
  idTechSpec?: string | null;
  techSpec?: TechSpecRequest | null;
  price?: number | null;
  status?: CommonStatus;
  imageUrls?: string[];
}

export interface ProductPageParams {
  page: number;
  size: number;
  name?: string;
  idProductCategory?: string;
  idTechSpec?: string;
  status?: CommonStatus;
  // TechSpec filters
  sensorType?: string;
  lensMount?: string;
  resolution?: string;
  processor?: string;
  imageFormat?: string;
  videoFormat?: string;
  iso?: string;
}

export const initialProduct: ProductRequest = {
  name: "",
  description: "",
  idProductCategory: "",
  status: "ACTIVE",
  price: null,
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

