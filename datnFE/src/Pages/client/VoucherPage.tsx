import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Spin, message, Empty, Tooltip } from "antd";
import { TagOutlined, CopyOutlined, CheckOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { getClientVouchers } from "../../api/voucherApi";

interface Voucher {
  id: string;
  code: string;
  name: string;
  voucherType: string;
  discountUnit: string;
  discountValue: number;
  maxDiscountAmount: number | null;
  conditions: number | null;
  startDate: number;
  endDate: number;
  quantity: number;
  note: string | null;
  status: number;
}

const formatPrice = (value: number | null | undefined): string => {
  if (value == null) return "—";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
};

const formatDiscount = (v: Voucher): string => {
  if (v.discountUnit === "%" || v.voucherType === "PERCENTAGE") {
    const pct = `${v.discountValue}%`;
    return v.maxDiscountAmount
      ? `${pct} (tối đa ${formatPrice(v.maxDiscountAmount)})`
      : pct;
  }
  return formatPrice(v.discountValue);
};

const VoucherPage: React.FC = () => {
  const navigate = useNavigate();
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res: any = await getClientVouchers();
        const data = res?.data ?? res;
        setVouchers(Array.isArray(data) ? data : []);
      } catch {
        message.error("Không thể tải danh sách phiếu giảm giá");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedId(id);
      message.success(`Đã sao chép mã "${code}"`);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f9fafb",
        paddingTop: 32,
        paddingBottom: 48,
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        {/* Breadcrumb */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 13,
            color: "#9ca3af",
            marginBottom: 24,
          }}
        >
          <span
            style={{ cursor: "pointer" }}
            onClick={() => navigate("/client")}
          >
            Trang chủ
          </span>
          <span>/</span>
          <span style={{ color: "#374151", fontWeight: 500 }}>
            Phiếu giảm giá
          </span>
        </div>

        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 28,
          }}
        >
          <TagOutlined style={{ fontSize: 24, color: "#D32F2F" }} />
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: 22,
                fontWeight: 700,
                color: "#111827",
              }}
            >
              Phiếu giảm giá
            </h1>
            <p style={{ margin: 0, fontSize: 13, color: "#6b7280" }}>
              Các mã giảm giá đang áp dụng
            </p>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", paddingTop: 80 }}>
            <Spin size="large" />
          </div>
        ) : vouchers.length === 0 ? (
          <div style={{ textAlign: "center", paddingTop: 80 }}>
            <Empty description="Hiện không có phiếu giảm giá nào" />
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: 20,
            }}
          >
            {vouchers.map((v) => (
              <div
                key={v.id}
                style={{
                  background: "#fff",
                  borderRadius: 12,
                  overflow: "hidden",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                  border: "1px solid #f0f0f0",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {/* Red top accent */}
                <div style={{ background: "#D32F2F", height: 6 }} />

                <div style={{ padding: "16px 20px 20px" }}>
                  {/* Name */}
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 15,
                      color: "#111827",
                      marginBottom: 6,
                    }}
                  >
                    {v.name}
                  </div>

                  {/* Discount amount */}
                  <div
                    style={{
                      fontSize: 22,
                      fontWeight: 800,
                      color: "#D32F2F",
                      marginBottom: 14,
                    }}
                  >
                    {formatDiscount(v)}
                  </div>

                  {/* Details */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                      fontSize: 13,
                      color: "#6b7280",
                      marginBottom: 16,
                    }}
                  >
                    {v.conditions != null && v.conditions > 0 && (
                      <div>
                        Đơn hàng tối thiểu:{" "}
                        <span style={{ color: "#374151", fontWeight: 600 }}>
                          {formatPrice(v.conditions)}
                        </span>
                      </div>
                    )}
                    <div>
                      Còn lại:{" "}
                      <span style={{ color: "#374151", fontWeight: 600 }}>
                        {v.quantity} lượt
                      </span>
                    </div>
                    <div>
                      Hiệu lực:{" "}
                      <span style={{ color: "#374151" }}>
                        {dayjs(v.startDate).format("DD/MM/YYYY")} –{" "}
                        {dayjs(v.endDate).format("DD/MM/YYYY")}
                      </span>
                    </div>
                    {v.note && (
                      <div
                        style={{
                          color: "#9ca3af",
                          fontStyle: "italic",
                          fontSize: 12,
                        }}
                      >
                        {v.note}
                      </div>
                    )}
                  </div>

                  {/* Code + Copy */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      background: "#fef2f2",
                      border: "1px dashed #fca5a5",
                      borderRadius: 8,
                      padding: "10px 14px",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "monospace",
                        fontSize: 16,
                        fontWeight: 700,
                        letterSpacing: 2,
                        color: "#DC2626",
                      }}
                    >
                      {v.code}
                    </span>
                    <Tooltip
                      title={copiedId === v.id ? "Đã sao chép!" : "Sao chép mã"}
                    >
                      <button
                        onClick={() => handleCopy(v.code, v.id)}
                        style={{
                          background: copiedId === v.id ? "#16a34a" : "#D32F2F",
                          color: "#fff",
                          border: "none",
                          borderRadius: 6,
                          padding: "6px 14px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          fontSize: 13,
                          fontWeight: 600,
                          transition: "background 0.2s",
                        }}
                      >
                        {copiedId === v.id ? (
                          <CheckOutlined />
                        ) : (
                          <CopyOutlined />
                        )}
                        {copiedId === v.id ? "Đã sao chép" : "Sao chép"}
                      </button>
                    </Tooltip>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VoucherPage;
