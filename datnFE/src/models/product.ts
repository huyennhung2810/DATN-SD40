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
}

export const initialProduct: ProductRequest = {
  name: "",
  description: "",
  idProductCategory: "",
  status: "ACTIVE",
  techSpec: {
    sensorType: "",
    lensMount: "",
    resolution: "",
    iso: "",
    processor: "",
    imageFormat: "",
    videoFormat: "",
  },
};

