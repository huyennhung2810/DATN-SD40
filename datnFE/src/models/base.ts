export type CommonStatus = "ACTIVE" | "INACTIVE";
export type UserRole = "ADMIN" | "CUSTOMER" | "STAFF";

export interface BaseEntity {
  id: string;
  createdDate: number;
  lastModifiedDate: number;
}

export interface BaseSearchParams {
  page?: number;
  size?: number;
  sortBy?: string;
  orderBy?: string;
}

export interface ResponseObject<T> {
  isSuccess: boolean;
  status: any;
  data: T;
  message: string;
  timestamp?: string;
}

export interface PageResponse<T> {
  data: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}