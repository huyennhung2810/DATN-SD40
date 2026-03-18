import type { CommonStatus } from "./base";

export interface BrandResponse {
  id: string;
  code: string;
  name: string;
  description?: string;
  status: CommonStatus;
  createdAt?: number;
  updatedAt?: number;
}

export interface BrandRequest {
  id?: string;
  code?: string;
  name: string;
  description?: string;
  status?: CommonStatus;
}

export interface BrandPageParams {
  page: number;
  size: number;
  keyword?: string;
  status?: CommonStatus;
}

export const initialBrand: BrandRequest = {
  code: "",
  name: "",
  description: "",
  status: "ACTIVE",
};
