export interface TopProduct {
  name: string;
  soldCount: number;
  revenue: number;
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


export interface TopSellingProduct {
    name: string;
    soldCount: number;
    revenue: number;
    imageUrl: string | null;
}