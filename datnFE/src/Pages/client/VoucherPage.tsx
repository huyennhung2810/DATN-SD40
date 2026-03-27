import React, { useState, useEffect } from "react";
import { Spin, message, Empty, Tooltip, Pagination, Tabs } from "antd";
import { CopyOutlined, CheckOutlined, TagOutlined } from "@ant-design/icons";
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
  if (v.discountUnit === "PERCENT") {
    const pct = `${v.discountValue}%`;
    return v.maxDiscountAmount
      ? `${pct} (tối đa ${formatPrice(v.maxDiscountAmount)})`
      : pct;
  }
  return formatPrice(v.discountValue);
};

const VoucherPage: React.FC = () => {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState("ALL");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 6;

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

  const handleTabChange = (key: string) => {
    setActiveTab(key);
    setPage(1);
  };

  const filteredVouchers = vouchers.filter((v) => {
    if (activeTab === "ALL") {
      return v.voucherType === "ALL";
    } else {
      return v.voucherType !== "ALL";
    }
  });

  const paged = filteredVouchers.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 16,
        padding: "24px",
        boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
        border: "1px solid #f0f0f0",
        alignSelf: "flex-start",
        width: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 10,
          paddingBottom: 16,
          borderBottom: "1px solid #f3f4f6",
        }}
      >
        <TagOutlined style={{ fontSize: 18, color: "#D32F2F" }} />
        <span style={{ fontSize: 16, fontWeight: 700, color: "#111827" }}>
          Phiếu giảm giá
        </span>
        <span
          style={{
            marginLeft: "auto",
            fontSize: 12,
            color: "#9ca3af",
            background: "#f3f4f6",
            borderRadius: 12,
            padding: "2px 10px",
          }}
        >
          {filteredVouchers.length} mã
        </span>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={handleTabChange}
        items={[
          { key: "ALL", label: "Tất cả voucher" },
          { key: "PERSONAL", label: "Dành riêng cho bạn" },
        ]}
        style={{ marginBottom: 16 }}
      />

      {loading ? (
        <div style={{ textAlign: "center", paddingTop: 40 }}>
          <Spin size="large" />
        </div>
      ) : filteredVouchers.length === 0 ? (
        <div style={{ textAlign: "center", paddingTop: 40 }}>
          <Empty
            description={
              activeTab === "ALL"
                ? "Hiện không có phiếu giảm giá nào"
                : "Bạn chưa có voucher đặc quyền nào"
            }
          />
        </div>
      ) : (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: 12,
            }}
          >
            {paged.map((v) => (
              <div
                key={v.id}
                style={{
                  background: "#fff",
                  borderRadius: 10,
                  overflow: "hidden",
                  border: "1px solid #f0f0f0",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div style={{ background: "#D32F2F", height: 4 }} />
                <div
                  style={{
                    flex: 1,
                    padding: "12px 14px 10px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 3,
                  }}
                >
                  <div
                    style={{ fontWeight: 700, fontSize: 13, color: "#111827" }}
                  >
                    {v.name}
                  </div>
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 800,
                      color: "#D32F2F",
                    }}
                  >
                    {formatDiscount(v)}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "#6b7280",
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                      marginTop: 2,
                    }}
                  >
                    {v.conditions != null && v.conditions > 0 && (
                      <span>
                        Tối thiểu{" "}
                        <strong style={{ color: "#374151" }}>
                          {formatPrice(v.conditions)}
                        </strong>
                      </span>
                    )}
                    <span>
                      HSD:{" "}
                      <strong style={{ color: "#374151" }}>
                        {dayjs(v.endDate).format("DD/MM/YYYY")}
                      </strong>
                    </span>
                    <span>
                      Còn{" "}
                      <strong style={{ color: "#374151" }}>
                        {v.quantity} lượt
                      </strong>
                    </span>
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "8px 14px",
                    background: "#fef2f2",
                    borderTop: "1px dashed #fca5a5",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "monospace",
                      fontSize: 12,
                      fontWeight: 700,
                      letterSpacing: 1.5,
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
                        borderRadius: 5,
                        padding: "3px 10px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        fontSize: 11,
                        fontWeight: 600,
                        transition: "background 0.2s",
                      }}
                    >
                      {copiedId === v.id ? <CheckOutlined /> : <CopyOutlined />}
                      {copiedId === v.id ? "Đã sao chép" : "Sao chép"}
                    </button>
                  </Tooltip>
                </div>
              </div>
            ))}
          </div>

          {filteredVouchers.length > PAGE_SIZE && (
            <div
              style={{
                marginTop: 20,
                display: "flex",
                justifyContent: "center",
              }}
            >
              <Pagination
                current={page}
                pageSize={PAGE_SIZE}
                total={filteredVouchers.length}
                onChange={(p) => setPage(p)}
                showSizeChanger={false}
                size="small"
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default VoucherPage;
