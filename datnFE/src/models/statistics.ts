
export interface TopSellingProduct {
    id: string;
    name: string;
    version: string;
    category: string;
    soldCount: number;
    revenue: number;
    price: number;
    imageUrl: string | null;
}

export interface DashboardSummary {
    // Doanh thu
    revenueToday: number;
    revenueThisWeek: number;
    revenueThisMonth: number;
    revenueThisYear: number;
    growthPercentage: number;

    // Đơn hàng
    totalOrders: number;
    completionRate: number;
    pendingCount: number;
    processingCount: number;
    completedCount: number;
    cancelledCount: number;

    // Sản phẩm
    totalProducts: number;
    lowStockCount: number;
    topSellingProducts: TopSellingProduct[];

    // Khách hàng
    totalCustomers: number;
    newCustomersThisMonth: number;
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