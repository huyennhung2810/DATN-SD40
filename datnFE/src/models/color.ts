import type { CommonStatus } from "./base";

export interface ColorResponse {
  id: string;
  code: string;
  name: string;
  status: CommonStatus;
  createdTime: string; // Trùng với createdTime ở BE
}

export interface ColorFormValues {
  code: string;
  name: string;
  status?: number | string | CommonStatus;
}

export const initialColor: ColorFormValues = {
  code: "",
  name: "",
  status: "ACTIVE",
};

export interface ColorPageParams {
  keyword?: string;
  status?: string;
  page: number;
  size: number;
}