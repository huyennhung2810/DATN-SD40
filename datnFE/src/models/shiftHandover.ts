export interface CheckInRequest {
  scheduleId: string;
  initialCash?: number;
  note?: string;
}

export interface CheckOutRequest {
  scheduleId: string;
  actualCash: number;    
  withdrawAmount?: number;   
  note?: string;          
}

// Thông tin kiểm kê 1 sản phẩm
export interface ProductAuditRequest {
  productId: string;
  actualQuantity: number;
  conditionNote?: string; // Tình trạng: "Trầy xước", "Bình thường"...
}

export interface ShiftHandoverStatsResponse {
  handoverId: string;
  scheduleId: string;
  initialCash: number;
  totalCashSales: number;
  totalBankSales: number; 
}

export interface ShiftHistoryItem {
  id: string;
  code: string;
  employeeName: string;
  checkInTime: number;
  checkOutTime?: number;
  initialCash: number;
  totalCashSales: number;
  totalBankSales?: number;
  cashWithdraw?: number;
  actualCashAtEnd: number;
  differenceAmount: number;
  note?: string;
  status: string;
}

// Thông tin chi tiết của 1 Phiếu giao ca 
export interface ShiftHandoverResponse {
  id: string;
  scheduleId?: string; 
  checkInTime: number; 
  checkOutTime?: number; 
  initialCash: number;
  totalCashSales?: number;
  totalBankSales?: number; 
  cashWithdraw?: number;
  actualCashAtEnd?: number;
  differenceAmount?: number;
  note?: string;
  handoverStatus: 'OPEN' | 'PENDING' | 'CLOSED';
  workScheduleId: string;
}

export type HandoverStatus = 'OPEN' | 'PENDING' | 'CLOSED';