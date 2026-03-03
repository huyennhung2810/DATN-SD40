import type { CommonStatus } from "./base";

export interface BannerResponse {
  id: string;
  code?: string;
  title?: string;
  imageUrl: string;
  linkUrl?: string;
  position?: string;
  priority?: number;
  startAt?: string;
  endAt?: string;
  status: CommonStatus;
  createdDate?: number;
  lastModifiedDate?: number;
}

export interface BannerRequest {
  id?: string;
  code?: string;
  title?: string;
  imageUrl: string;
  linkUrl?: string;
  position?: string;
  priority?: number;
  startAt?: string;
  endAt?: string;
  status?: CommonStatus;
}

