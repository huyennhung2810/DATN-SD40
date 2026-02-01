import type { CommonStatus } from "./base";

export interface TechSpecResponse {
  id: string;
  sensorType?: string;
  lensMount?: string;
  resolution?: string;
  iso?: string;
  processor?: string;
  imageFormat?: string;
  videoFormat?: string;
  status: CommonStatus;
  createdAt: number;
  updatedAt: number;
}

export interface TechSpecRequest {
  id?: string;
  sensorType?: string;
  lensMount?: string;
  resolution?: string;
  iso?: string;
  processor?: string;
  imageFormat?: string;
  videoFormat?: string;
  status?: CommonStatus;
}

export interface TechSpecPageParams {
  page: number;
  size: number;
  keyword?: string;
  status?: CommonStatus;
}

export const initialTechSpec: TechSpecRequest = {
  sensorType: "",
  lensMount: "",
  resolution: "",
  iso: "",
  processor: "",
  imageFormat: "",
  videoFormat: "",
  status: "ACTIVE",
};

