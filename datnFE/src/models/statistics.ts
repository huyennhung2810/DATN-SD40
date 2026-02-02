export interface DashboardSummary {
    period: string;
    totalRevenue: number;
    totalOrders: number;
    totalItemsSold: number;
    revenueGrowthPercentage: number;
    orderGrowthPercentage: number;
    productGrowthPercentage: number;
    successCount: number;
    canceledCount: number;
    returnedCount: number;
}

export interface OrderStatusStatistics {
    key: string;
    label: string;
    color: string;
    orderCount: number;
    percentage: number;
}

export interface EmployeeSales {
    employeeId: string;
    employeeName: string;
    employeeCode: string;
    totalOrders: number;
    totalRevenue: number;
}

export interface OrderDaily {
    date: string;
    orderCount: number;
}

export interface TopSellingProduct {
    rank: number;
  id: string;
  productCode: string;
  productName: string;
  productImage: string;
  quantitySold: number;
  revenue: number;
  sellingPrice: number;
}