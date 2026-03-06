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
  title: string;
  slot: string;
  imageUrl: string;
  targetUrl?: string;
  altText?: string;
  startAt?: number;
  endAt?: number;
  description?: string;
  createdAt?: number;
  updatedAt?: number;
}

export interface BannerRequest {
  id?: string;
<<<<<<< HEAD
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

=======
  title: string;
  slot: string;
  imageUrl: string;
  targetUrl?: string;
  altText?: string;
  startAt?: number | null;
  endAt?: number | null;
  priority?: number;
  description?: string;
  status?: CommonStatus;
}

export interface BannerSearchParams {
  page: number;
  size: number;
  keyword?: string;
  status?: CommonStatus;
  slot?: string;
}

export const initialBanner: BannerRequest = {
  title: "",
  slot: "HOME_HERO",
  imageUrl: "",
  targetUrl: "",
  altText: "",
  priority: 0,
  description: "",
  status: "ACTIVE",
  startAt: null,
  endAt: null,
};

// Banner slot constants
export const BANNER_SLOTS = [
  { value: "HOME_HERO", label: "Banner chính (Hero)", ratio: "16/9" },
  { value: "HOME_STRIP", label: "Banner dải ngang", ratio: "10/3" },
  { value: "SIDEBAR", label: "Banner Sidebar", ratio: "1/1" },
  { value: "CATEGORY_TOP", label: "Banner đầu danh mục", ratio: "21/9" },
];

export const getSlotRatio = (slot: string): string => {
  const found = BANNER_SLOTS.find((s) => s.value === slot);
  return found?.ratio || "16/9";
};
>>>>>>> origin/hungbt3103
