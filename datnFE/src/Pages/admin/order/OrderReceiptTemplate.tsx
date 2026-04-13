import React from "react";
import { Divider, Typography } from "antd";
import dayjs from "dayjs";
import type { OrderDetailResponse } from "../../../models/order";

const { Text, Title } = Typography;

export interface OrderReceiptProps {
  order: OrderDetailResponse;
  items: OrderDetailResponse[];
}

const fmt = (n?: number | null) =>
  n == null ? "0" : n.toLocaleString("vi-VN");

const OrderReceiptTemplate = React.forwardRef<
  HTMLDivElement,
  OrderReceiptProps
>(({ order, items }, ref) => {
  const printDate = dayjs().format("HH:mm DD/MM/YYYY");
  const isDelivery =
    order.loaiHoaDon === "ONLINE" || order.loaiHoaDon === "GIAO_HANG";

  return (
    <div style={{ display: "none" }}>
      <div
        ref={ref}
        style={{
          padding: "10px",
          width: "80mm",
          color: "#000",
          fontFamily: "monospace",
          fontSize: "12px",
        }}
      >
        <style type="text/css" media="print">
          {`@page { size: 80mm auto; margin: 0; } body { margin: 0; -webkit-print-color-adjust: exact; }`}
        </style>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 10 }}>
          <Title level={4} style={{ margin: 0, fontSize: 16 }}>
            HIKARI STORE
          </Title>
          <Text style={{ display: "block", fontSize: 11 }}>
            123 Đường Máy Ảnh, Quận 1, TP.HCM
          </Text>
          <Text style={{ display: "block", fontSize: 11 }}>
            SĐT: 0987.654.321
          </Text>
        </div>

        <Divider dashed style={{ margin: "5px 0", borderColor: "#000" }} />

        {/* Order info */}
        <div style={{ marginBottom: 8 }}>
          <Row label="Mã HĐ" value={order.maHoaDon} bold />
          <Row label="Ngày in" value={printDate} />
          <Row label="Loại đơn" value={isDelivery ? "Giao hàng" : "Tại quầy"} />
          {order.tenKhachHang && (
            <Row label="Khách hàng" value={order.tenKhachHang} />
          )}
          {order.sdtKH && <Row label="SĐT" value={order.sdtKH} />}
          {isDelivery && order.diaChi && (
            <div style={{ marginTop: 4 }}>
              <Text style={{ fontSize: 11 }}>Địa chỉ giao:</Text>
              <Text style={{ fontSize: 11, display: "block", paddingLeft: 8 }}>
                {order.diaChi}
              </Text>
            </div>
          )}
          {order.tenNhanVien && (
            <Row label="Nhân viên" value={order.tenNhanVien} />
          )}
        </div>

        <Divider dashed style={{ margin: "5px 0", borderColor: "#000" }} />

        {/* Items table */}
        <table style={{ width: "100%", marginBottom: 8 }}>
          <thead>
            <tr>
              <th
                style={{
                  textAlign: "left",
                  fontSize: 11,
                  borderBottom: "1px dashed #000",
                  paddingBottom: 4,
                }}
              >
                Sản phẩm
              </th>
              <th
                style={{
                  textAlign: "center",
                  fontSize: 11,
                  borderBottom: "1px dashed #000",
                  paddingBottom: 4,
                }}
              >
                SL
              </th>
              <th
                style={{
                  textAlign: "right",
                  fontSize: 11,
                  borderBottom: "1px dashed #000",
                  paddingBottom: 4,
                }}
              >
                T.Tiền
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <React.Fragment key={item.maHoaDonChiTiet || idx}>
                <tr>
                  <td
                    colSpan={3}
                    style={{ fontSize: 11, paddingTop: 4, fontWeight: 600 }}
                  >
                    {item.tenSanPham}
                  </td>
                </tr>
                {item.mauSac || item.size ? (
                  <tr>
                    <td
                      colSpan={3}
                      style={{ fontSize: 10, color: "#555", paddingBottom: 2 }}
                    >
                      {[item.mauSac, item.size].filter(Boolean).join(" / ")}
                    </td>
                  </tr>
                ) : null}
                <tr>
                  <td style={{ fontSize: 11, color: "#555" }}>
                    {fmt(item.giaBan)}
                  </td>
                  <td style={{ textAlign: "center", fontSize: 11 }}>
                    {item.soLuong}
                  </td>
                  <td style={{ textAlign: "right", fontSize: 11 }}>
                    {fmt(item.tongTien)} đ
                  </td>
                </tr>
              </React.Fragment>
            ))}
          </tbody>
        </table>

        <Divider dashed style={{ margin: "5px 0", borderColor: "#000" }} />

        {/* Summary */}
        {order.maVoucher && (
          <Row
            label={`Voucher (${order.maVoucher})`}
            value={`-${fmt(order.giaTriVoucher)} đ`}
          />
        )}
        {isDelivery && (order.phiVanChuyen ?? 0) > 0 && (
          <Row label="Phí vận chuyển" value={`+${fmt(order.phiVanChuyen)} đ`} />
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            margin: "6px 0",
          }}
        >
          <Text strong style={{ fontSize: 14 }}>
            TỔNG CỘNG:
          </Text>
          <Text strong style={{ fontSize: 14 }}>
            {fmt(order.tongTienSauGiam)} đ
          </Text>
        </div>

        {order.phuongThucThanhToan && (
          <Row label="Thanh toán" value={order.phuongThucThanhToan} />
        )}

        <Divider dashed style={{ margin: "5px 0", borderColor: "#000" }} />

        <div style={{ textAlign: "center", marginTop: 10 }}>
          <Text
            style={{
              display: "block",
              fontSize: 11,
              fontStyle: "italic",
            }}
          >
            Cảm ơn quý khách và hẹn gặp lại!
          </Text>
          <Text style={{ display: "block", fontSize: 10, marginTop: 5 }}>
            Powered by Hikari POS
          </Text>
        </div>
      </div>
    </div>
  );
});

// Small helper component for key-value rows
const Row: React.FC<{ label: string; value: string; bold?: boolean }> = ({
  label,
  value,
  bold,
}) => (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      marginBottom: 2,
    }}
  >
    <Text style={{ fontSize: 11 }}>{label}:</Text>
    <Text style={{ fontSize: 11, fontWeight: bold ? 700 : 400 }}>{value}</Text>
  </div>
);

export default OrderReceiptTemplate;
