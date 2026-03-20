export interface ADOrderSearchRequest {
    q?: string;           // Tìm kiếm theo mã HĐ, tên KH, SĐT...
    startDate?: number;   // Timestamp từ ngày
    endDate?: number;     // Timestamp đến ngày
    status?: string;      // Trạng thái hóa đơn (CHO_XAC_NHAN, DANG_GIAO...)
    page?: number;        // Trang hiện tại (mặc định 0)
    size?: number;        // Số bản ghi / trang
    sortBy?: string;
    orderBy?: string;     // ASC hoặc DESC
}

export interface ADChangeStatusRequest {
    maHoaDon: string;
    statusTrangThaiHoaDon: string;
    note?: string;
    idNhanVien?: string;
}

export interface ADAssignSerialRequest {
    hoaDonChiTietId: string;
    oldImeiId: string;
    newImeiId: string;
}

export interface ADUpdateCustomerRequest {
    maHoaDon: string;
    tenKhachHang?: string;
    sdtKH?: string;
    email?: string;
    diaChi?: string;
}


// Kiểu trả về chung của Base ResponseObject từ Backend
export interface ResponseObject<T> {
    isSuccess: boolean;
    status: string;
    data: T;
    message: string;
    timestamp: string;
}

// Thông tin cơ bản của 1 Hóa đơn (Hiển thị ở Table danh sách)
export interface OrderResponse {
    id: string;
    maHoaDon: string;
    tenKhachHang: string;
    sdtKhachHang: string;
    maNhanVien: string;
    tenNhanVien: string;
    tongTien: number;
    loaiHoaDon: string;
    createdDate: number;
    status: string;
}

// Kiểu phân trang (Pagination)
export interface OrderPageResponse {
    page: {
        content: OrderResponse[];
        pageable: any;
        totalElements: number;
        totalPages: number;
        size: number;
        number: number;
    };
    countByStatus: Record<string, number>; 
}

// Lịch sử trạng thái (Timeline)
export interface OrderHistoryType {
    id: string;
    trangThai: string;
    tenTrangThai: string;
    thoiGian: number;
    ghiChu: string;
    nhanVien: string;
}

// Serial/IMEI của sản phẩm
export interface SerialType {
    id: string;
    code: string;
    status: string;
    statusText: string;
    assignedAt: number;
}

export interface OrderDetailResponse {
    id: string;
    orderId: string;
    maHoaDon: string;
    tenHoaDon: string;
    loaiHoaDon: string;
    maHoaDonChiTiet: string;
    soLuong: number;
    giaBan: number;
    tongTien: number;
    tongTienSauGiam: number;
    
    // Khách hàng
    tenKhachHang: string;
    sdtKH: string;
    email: string;
    diaChi: string;

    // Sản phẩm
    productDetailId: string;
    tenSanPham: string;
    anhSanPham: string;
    thuongHieu: string;
    mauSac: string;
    size: string;

    // Trạng thái & Thanh toán
    trangThaiHoaDon: string;
    trangThaiThanhToan: string;
    phuongThucThanhToan: string;
    ngayTao: number;
    ngayThanhToan: number | null;
    phiVanChuyen: number;
    
    // Voucher
    maVoucher: string;
    tenVoucher: string;
    giaTriVoucher: number;
    
    // Nhân viên xử lý
    tenNhanVien: string;

    lichSuTrangThai: string;
    danhSachImei: string;  
    soLuongImei: number;
}

export interface OrderDetailPageResponse {
    content: OrderDetailResponse[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}