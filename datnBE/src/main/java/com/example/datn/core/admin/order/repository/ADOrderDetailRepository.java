package com.example.datn.core.admin.order.repository;

import com.example.datn.core.admin.order.model.response.ADOrderDetailResponse;
import com.example.datn.entity.OrderDetail;
import com.example.datn.repository.OrderDetailRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ADOrderDetailRepository extends OrderDetailRepository {

    List<OrderDetail> findByOrderId(String orderId);

    @Query(value = """
            SELECT
                hd.id AS orderId,
                hd.code AS maHoaDon,
                hd.code AS tenHoaDon,
                hd.order_type AS loaiHoaDon,

                hdct.id AS id,
                hdct.id AS maHoaDonChiTiet,
                hdct.quantity AS soLuong,
                hdct.unit_price AS giaBan,
                hdct.total_price AS tongTien,
                hd.total_after_discount AS tongTienSauGiam,

                v.code AS maVoucher,
                v.name AS tenVoucher,
                COALESCE(hd.total_amount - hd.total_after_discount, 0) AS giaTriVoucher,

                s.name AS tenNhanVien,

                sp.name AS tenSanPham,
                spct.id AS productDetailId,
                spct.image_url AS anhSanPham,
                brand.name AS thuongHieu,
                color.name AS mauSac,
                COALESCE(sc.name, '') AS size,


                hd.order_status AS trangThaiHoaDon,
                hd.payment_status AS trangThaiThanhToan,
                hd.created_date AS ngayTao,
                hd.payment_date AS ngayThanhToan,
                COALESCE(hd.shipping_fee, 0) AS phiVanChuyen,
                hd.payment_method AS phuongThucThanhToan,


                spct.sale_price AS giaBanGoc,

                sp.code AS maSanPham,
                spct.code AS maChiTietSanPham,

                (
                    SELECT COALESCE(SUM(hdsub.quantity * hdsub.unit_price), 0)
                    FROM order_detail hdsub
                    WHERE hdsub.id_order = hd.id
                ) AS thanhTien,

                COALESCE(hd.recipient_name, '') AS tenKhachHang,
                COALESCE(hd.recipient_phone, '') AS sdtKH,
                kh.email AS email,
                kh.image AS avatarKhachHang,
                COALESCE(hd.recipient_address, '') AS diaChi,

                -- ===== LỊCH SỬ TRẠNG THÁI (FIX THEO ENTITY ORDERHISTORY) =====
                (
                    SELECT JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'id', lst.id,
                            'trangThai', lst.trang_thai,
                            'tenTrangThai',
                                CASE lst.trang_thai
                                    WHEN 'CHO_XAC_NHAN' THEN 'Chờ xác nhận'
                                    WHEN 'DA_XAC_NHAN' THEN 'Đã xác nhận'
                                    WHEN 'CHO_GIAO' THEN 'Chờ giao hàng'
                                    WHEN 'DANG_GIAO' THEN 'Đang giao hàng'
                                    WHEN 'HOAN_THANH' THEN 'Hoàn thành'
                                    WHEN 'DA_HUY' THEN 'Đã hủy'
                                    ELSE 'Không xác định'
                                END,
                            'thoiGian', lst.thoi_gian,
                            'ghiChu', COALESCE(lst.ghi_chu, ''),
                            'nhanVien', COALESCE(nv.name, '')
                        )
                    )
                    FROM order_history lst
                    LEFT JOIN employee nv ON lst.id_nhan_vien = nv.id
                    WHERE lst.id_order = hd.id
                ) AS lichSuTrangThai,

                -- ===== DANH SÁCH SERIAL =====
                COALESCE(
                    (
                        SELECT JSON_ARRAYAGG(
                            JSON_OBJECT(
                                'id', i.id,
                                'code', i.serial_number,
                                'status', i.serial_status,
                                'statusText',
                                    CASE i.serial_status
                                        WHEN 'AVAILABLE' THEN 'Khả dụng'
                                        WHEN 'IN_ORDER' THEN 'Đang trong đơn'
                                        WHEN 'SOLD' THEN 'Đã bán'
                                        WHEN 'DEFECTIVE' THEN 'Lỗi'
                                        WHEN 'WARRANTY' THEN 'Đang bảo hành'
                                        ELSE 'Không xác định'
                                    END,
                                'assignedAt', i.created_date
                            )
                        )
                        FROM serial i
                        WHERE i.id_order_detail = hdct.id
                    ),
                    JSON_ARRAY()
                ) AS danhSachImei,

                (
                    SELECT COUNT(*)
                    FROM serial i
                    WHERE i.id_order_detail = hdct.id
                ) AS soLuongImei

            FROM `order` hd
            INNER JOIN order_detail hdct ON hdct.id_order = hd.id
            LEFT JOIN product_detail spct ON hdct.id_product_detail = spct.id
            LEFT JOIN product sp ON spct.id_product = sp.id
            LEFT JOIN brand brand ON sp.id_brand = brand.id
            LEFT JOIN color color ON spct.id_color = color.id
            LEFT JOIN storage_capacity sc ON spct.id_storage_capacity = sc.id
            LEFT JOIN customer kh ON hd.id_customer = kh.id
            LEFT JOIN voucher v ON hd.id_voucher = v.id
            LEFT JOIN employee s ON hd.id_employee = s.id

            WHERE hd.code = :maHoaDon
            ORDER BY hdct.created_date ASC
            """, countQuery = """
            SELECT COUNT(*)
            FROM order_detail hdct
            LEFT JOIN `order` hd ON hdct.id_order = hd.id
            WHERE hd.code = :maHoaDon
            """, nativeQuery = true)
    Page<ADOrderDetailResponse> getHoaDonChiTiet(@Param("maHoaDon") String maHoaDon, Pageable pageable);
}