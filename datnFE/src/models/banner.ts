import type { CommonStatus } from "./base";

export type BannerPosition =
  | "HOME_HERO"
  | "HOME_TOP"
  | "HOME_MIDDLE"
  | "HOME_BOTTOM"
  | "SIDEBAR"
  | "POPUP";

export type BannerType = "HERO" | "IMAGE" | "SLIDE";

export type LinkTarget = "NEW_TAB" | "SAME_TAB";

export interface BannerResponse {
  id: string;
  code: string;
  status: CommonStatus;
  title: string;
  subtitle?: string;
  description?: string;
  imageUrl: string;
  mobileImageUrl?: string;
  linkUrl?: string;
  linkTarget?: LinkTarget;
  position: BannerPosition;
  type: BannerType;
  priority?: number;
  startAt?: string;
  endAt?: string;
  buttonText?: string;
  backgroundColor?: string;
  createdDate: number;
  lastModifiedDate: number;
}

export interface BannerRequest {
  title: string;
  subtitle?: string;
  description?: string;
  imageUrl: string;
  mobileImageUrl?: string;
  linkUrl?: string;
  linkTarget?: LinkTarget;
  position: BannerPosition;
  type: BannerType;
  priority?: number;
  startAt?: string;
  endAt?: string;
  buttonText?: string;
  backgroundColor?: string;
}

export interface BannerSearchParams {
  page?: number;
  size?: number;
  keyword?: string;
  status?: CommonStatus;
  position?: BannerPosition;
  type?: BannerType;
}

export const initialBannerRequest: BannerRequest = {
  title: "",
  subtitle: "",
  description: "",
  imageUrl: "",
  mobileImageUrl: "",
  linkUrl: "",
  linkTarget: "SAME_TAB",
  position: "HOME_HERO",
  type: "IMAGE",
  priority: 0,
  startAt: undefined,
  endAt: undefined,
  buttonText: "",
  backgroundColor: "",
};

export const BANNER_POSITIONS: { value: BannerPosition; label: string }[] = [
  { value: "HOME_HERO", label: "Banner chính trang chủ" },
  { value: "HOME_TOP", label: "Banner phía trên trang chủ" },
  { value: "HOME_MIDDLE", label: "Banner giữa trang chủ" },
  { value: "HOME_BOTTOM", label: "Banner phía dưới trang chủ" },
  { value: "SIDEBAR", label: "Banner sidebar" },
  { value: "POPUP", label: "Banner popup" },
];

export const BANNER_TYPES: { value: BannerType; label: string }[] = [
  { value: "IMAGE", label: "Banner hình ảnh đơn" },
  { value: "HERO", label: "Banner dạng hero" },
  { value: "SLIDE", label: "Banner dạng slide/carousel" },
];

export const LINK_TARGETS: { value: LinkTarget; label: string }[] = [
  { value: "SAME_TAB", label: "Mở trong tab hiện tại" },
  { value: "NEW_TAB", label: "Mở trong tab mới" },
];
