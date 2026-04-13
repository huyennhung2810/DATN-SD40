import React from "react";
import { Typography, Divider } from "antd";

const { Text, Title } = Typography;

export interface ReceiptProps {
  orderCode: string;
  cartItems: any[];
  totalAmount: number;
  customerCash: number;
  change: number;
  voucherSaving?: number;
  customerName?: string;
  staffName?: string;
}

const ReceiptTemplate = React.forwardRef<HTMLDivElement, ReceiptProps>(
  (props, ref) => {
    const {
      orderCode,
      cartItems,
      totalAmount,
      customerCash,
      change,
      voucherSaving = 0,
      customerName,
      staffName,
    } = props;

    const now = new Date();
    const formattedDate = `${now.getDate().toString().padStart(2, "0")}/${(
      now.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}/${now.getFullYear()} ${now
      .getHours()
      .toString()
      .padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

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
            {`
              @page { size: 80mm auto; margin: 0; }
              body { margin: 0; -webkit-print-color-adjust: exact; }
            `}
          </style>

          <div style={{ textAlign: "center", marginBottom: "10px" }}>
            <Title level={4} style={{ margin: 0, fontSize: "16px" }}>
              HIKARI STORE
            </Title>
            <Text style={{ display: "block", fontSize: "11px" }}>
              123 Đường Máy Ảnh, Quận 1, TP.HCM
            </Text>
            <Text style={{ display: "block", fontSize: "11px" }}>
              SĐT: 0987.654.321
            </Text>
          </div>

          <Divider dashed style={{ margin: "5px 0", borderColor: "#000" }} />

          <div style={{ marginBottom: "10px" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <Text style={{ fontSize: "11px" }}>Mã HĐ:</Text>
              <Text strong style={{ fontSize: "11px" }}>
                {orderCode}
              </Text>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <Text style={{ fontSize: "11px" }}>Ngày in:</Text>
              <Text style={{ fontSize: "11px" }}>{formattedDate}</Text>
            </div>
            {customerName && (
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Text style={{ fontSize: "11px" }}>Khách hàng:</Text>
                <Text style={{ fontSize: "11px" }}>{customerName}</Text>
              </div>
            )}
            {staffName && (
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Text style={{ fontSize: "11px" }}>Nhân viên:</Text>
                <Text style={{ fontSize: "11px" }}>{staffName}</Text>
              </div>
            )}
          </div>

          <Divider dashed style={{ margin: "5px 0", borderColor: "#000" }} />

          <table style={{ width: "100%", marginBottom: "10px" }}>
            <thead>
              <tr>
                <th
                  style={{
                    textAlign: "left",
                    fontSize: "11px",
                    borderBottom: "1px dashed #000",
                    paddingBottom: "4px",
                  }}
                >
                  SP
                </th>
                <th
                  style={{
                    textAlign: "center",
                    fontSize: "11px",
                    borderBottom: "1px dashed #000",
                    paddingBottom: "4px",
                  }}
                >
                  SL
                </th>
                <th
                  style={{
                    textAlign: "right",
                    fontSize: "11px",
                    borderBottom: "1px dashed #000",
                    paddingBottom: "4px",
                  }}
                >
                  T.Tiền
                </th>
              </tr>
            </thead>
            <tbody>
              {cartItems?.map((item, index) => {
                const name = item.productDetail?.product?.name || "Sản phẩm";
                const original = item.productDetail?.originalPrice;
                const hasDiscount = original && original > item.unitPrice;
                // Lấy thông tin đợt giảm giá nếu có
                const discount = item.productDetail?.discount || item.discount;
                // Nếu có nhiều đợt giảm giá, lấy mảng
                const discounts =
                  item.productDetail?.discounts || item.discounts;
                return (
                  <React.Fragment key={item.id || index}>
                    <tr>
                      <td
                        colSpan={3}
                        style={{ fontSize: "11px", paddingTop: "4px" }}
                      >
                        {name}
                      </td>
                    </tr>
                    {/* Hiển thị giá trước giảm và sau giảm đẹp như mẫu */}
                    {hasDiscount && (
                      <tr>
                        <td
                          colSpan={3}
                          style={{ textAlign: "right", padding: 0 }}
                        >
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "flex-end",
                            }}
                          >
                            <span
                              style={{
                                fontSize: 12,
                                color: "#888",
                                textDecoration: "line-through",
                                lineHeight: 1,
                              }}
                            >
                              {original.toLocaleString("vi-VN")} đ
                            </span>
                            <span
                              style={{
                                fontSize: 15,
                                color: "#d7263d",
                                fontWeight: 700,
                                lineHeight: 1,
                              }}
                            >
                              {item.unitPrice.toLocaleString("vi-VN")} đ
                            </span>
                          </div>
                        </td>
                      </tr>
                    )}
                    {/* Hiển thị đợt giảm giá nếu có */}
                    {discount && (
                      <tr>
                        <td
                          colSpan={3}
                          style={{
                            fontSize: "10px",
                            color: "#fa8c16",
                            paddingBottom: 2,
                          }}
                        >
                          Đợt giảm giá: {discount.name || discount.code || "-"}
                        </td>
                      </tr>
                    )}
                    {/* Nếu có nhiều đợt giảm giá */}
                    {Array.isArray(discounts) && discounts.length > 0 && (
                      <tr>
                        <td
                          colSpan={3}
                          style={{
                            fontSize: "10px",
                            color: "#fa8c16",
                            paddingBottom: 2,
                          }}
                        >
                          Đợt giảm giá:
                          {discounts.map((d: any, idx: number) => (
                            <span key={d.id || idx} style={{ marginLeft: 4 }}>
                              {d.name || d.code || "-"}
                            </span>
                          ))}
                        </td>
                      </tr>
                    )}
                    {item.assignedSerials &&
                      item.assignedSerials.length > 0 && (
                        <tr>
                          <td
                            colSpan={3}
                            style={{
                              fontSize: "10px",
                              color: "#555",
                              paddingBottom: 2,
                            }}
                          >
                            Serial:{" "}
                            {item.assignedSerials
                              .map((s: any) => s.serialNumber)
                              .join(", ")}
                          </td>
                        </tr>
                      )}
                    <tr>
                      <td style={{ fontSize: "11px", color: "#555" }}>
                        {item.unitPrice?.toLocaleString("vi-VN")}
                      </td>
                      <td style={{ textAlign: "center", fontSize: "11px" }}>
                        {item.quantity}
                      </td>
                      <td style={{ textAlign: "right", fontSize: "11px" }}>
                        {item.totalPrice?.toLocaleString("vi-VN")}
                      </td>
                    </tr>
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>

          <Divider dashed style={{ margin: "5px 0", borderColor: "#000" }} />

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "2px",
            }}
          >
            <Text style={{ fontSize: "12px" }}>Giảm giá (Voucher):</Text>
            <Text style={{ fontSize: "12px" }}>
              -{voucherSaving?.toLocaleString("vi-VN")} đ
            </Text>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "5px",
            }}
          >
            <Text strong style={{ fontSize: "14px" }}>
              KHÁCH CẦN TRẢ:
            </Text>
            <Text strong style={{ fontSize: "14px" }}>
              {totalAmount?.toLocaleString("vi-VN")} đ
            </Text>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "2px",
            }}
          >
            <Text style={{ fontSize: "11px" }}>Tiền khách đưa:</Text>
            <Text style={{ fontSize: "11px" }}>
              {customerCash?.toLocaleString("vi-VN")} đ
            </Text>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Text style={{ fontSize: "11px" }}>Tiền thối lại:</Text>
            <Text style={{ fontSize: "11px" }}>
              {change?.toLocaleString("vi-VN")} đ
            </Text>
          </div>

          <Divider dashed style={{ margin: "5px 0", borderColor: "#000" }} />

          <div style={{ textAlign: "center", marginTop: "10px" }}>
            <Text
              style={{
                display: "block",
                fontSize: "11px",
                fontStyle: "italic",
              }}
            >
              Cảm ơn quý khách và hẹn gặp lại!
            </Text>
            <Text
              style={{ display: "block", fontSize: "10px", marginTop: "5px" }}
            >
              Powered by Hikari POS
            </Text>
          </div>
        </div>
      </div>
    );
  },
);

export default ReceiptTemplate;
