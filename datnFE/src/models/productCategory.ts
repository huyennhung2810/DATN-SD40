import type { CommonStatus } from "./base";

export interface ProductCategoryResponse {
  id: string;
  code: string;
  name: string;
  description?: string;
  status: CommonStatus;
  createdAt?: number;
  updatedAt?: number;
}

export interface ProductCategoryRequest {
  id?: string;
  code?: string;
  name: string;
  description?: string;
  status?: CommonStatus;
}

export interface ProductCategoryPageParams {
  page: number;
  size: number;
  keyword?: string;
  status?: CommonStatus;
}

export const initialProductCategory: ProductCategoryRequest = {
  code: "",
  name: "",
  description: "",
  status: "ACTIVE",
};

