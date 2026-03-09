export const BannerPosition = {
  HOME_HERO: "HOME_HERO",
  HOME_TOP: "HOME_TOP",
  HOME_MIDDLE: "HOME_MIDDLE",
  HOME_BOTTOM: "HOME_BOTTOM",
  SIDEBAR: "SIDEBAR",
  POPUP: "POPUP",
} as const;
export type BannerPosition = typeof BannerPosition[keyof typeof BannerPosition];

export const BannerPositionLabel: Record<BannerPosition, string> = {
  HOME_HERO: "Banner chính trang chủ",
  HOME_TOP: "Banner phía trên trang chủ",
  HOME_MIDDLE: "Banner giữa trang chủ",
  HOME_BOTTOM: "Banner phía dưới trang chủ",
  SIDEBAR: "Banner sidebar",
  POPUP: "Banner popup",
};

export const BannerType = {
  IMAGE: "IMAGE",
  HERO: "HERO",
  SLIDE: "SLIDE",
} as const;
export type BannerType = typeof BannerType[keyof typeof BannerType];

export const BannerTypeLabel: Record<BannerType, string> = {
  IMAGE: "Banner hình ảnh đơn",
  HERO: "Banner dạng hero",
  SLIDE: "Banner dạng slide/carousel",
};

export const LinkTarget = {
  SAME_TAB: "SAME_TAB",
  NEW_TAB: "NEW_TAB",
} as const;
export type LinkTarget = typeof LinkTarget[keyof typeof LinkTarget];

export const LinkTargetLabel: Record<LinkTarget, string> = {
  SAME_TAB: "Mở trong tab hiện tại",
  NEW_TAB: "Mở trong tab mới",
};

export const EntityStatus = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  DELETED: "DELETED",
} as const;
export type EntityStatus = typeof EntityStatus[keyof typeof EntityStatus];

export const EntityStatusLabel: Record<EntityStatus, string> = {
  ACTIVE: "Hoạt động",
  INACTIVE: "Không hoạt động",
  DELETED: "Đã xóa",
};

export interface BannerRequest {
  id?: string;
  code?: string;
  title: string;
  subtitle?: string;
  description?: string;
  imageUrl: string;
  mobileImageUrl?: string;
  linkUrl?: string;
  linkTarget?: LinkTarget;
  position: BannerPosition;
  type?: BannerType;
  status?: EntityStatus;
  priority?: number;
  startAt?: string;
  endAt?: string;
  buttonText?: string;
  backgroundColor?: string;
}

export interface BannerResponse {
  id: string;
  code?: string;
  title: string;
  subtitle?: string;
  description?: string;
  imageUrl: string;
  mobileImageUrl?: string;
  linkUrl?: string;
  linkTarget?: LinkTarget;
  position: BannerPosition;
  type?: BannerType;
  status: EntityStatus;
  priority: number;
  startAt?: string;
  endAt?: string;
  buttonText?: string;
  backgroundColor?: string;
  createdDate?: string;
  lastModifiedDate?: string;
}

export interface BannerSearchRequest {
  page?: number;
  size?: number;
  keyword?: string;
  status?: EntityStatus;
  position?: BannerPosition;
  startDateFrom?: string;
  startDateTo?: string;
  sortBy?: string;
  sortDirection?: string;
}

export interface BannerPageResponse {
  data: BannerResponse[];
  totalPages: number;
  currentPage: number;
  totalElements: number;
}
