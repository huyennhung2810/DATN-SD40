
export interface TopSellingProduct {
    id: string;
    name: string;
    price: number;
    imageUrl: string | null;
    soldCount: number;
}

export interface DashboardSummary {
  // 1. Hôm nay
  revenueToday: number;
  ordersToday: number;
  productsSoldToday: number;

  // 2. Tuần này
  revenueThisWeek: number;
  ordersThisWeek: number;
  productsSoldThisWeek: number;

  // 3. Tháng này
  revenueThisMonth: number;
  ordersThisMonth: number;
  productsSoldThisMonth: number;
  growthPercentage: number; // % Tăng trưởng

  // 4. Năm nay
  revenueThisYear: number;
  ordersThisYear: number;
  productsSoldThisYear: number;
}

export interface OrderStatusStat {
  status: string;
  count: number;
}

export interface RevenueStat {
  date: string;
  revenue: number;
}

export interface LowStockProduct {
    id: string;
    name: string;
    price: number;
    quantity: number;
    imageUrl: string
}

export interface GrowthStat {
  label: string;
  value: number;
  growth: number;
  isCurrency: boolean;
}

export interface FilteredStat {
  totalRevenue: number;
  totalOrders: number;
  totalProductsSold: number;
}

export const TimeRangeType = {
  TODAY: "TODAY",
  THIS_WEEK: "THIS_WEEK",
  THIS_MONTH: "THIS_MONTH",
  THIS_YEAR: "THIS_YEAR",
  CUSTOM: "CUSTOM"
} as const;

export type TimeRangeType = typeof TimeRangeType[keyof typeof TimeRangeType];