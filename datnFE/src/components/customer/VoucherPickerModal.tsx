import React, { useState, useEffect, useMemo } from "react";
import { Modal, Input, Button, Spin, Empty, Tag, message, Divider, Badge } from "antd";
import {
  TagOutlined,
  SearchOutlined,
  CheckCircleFilled,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  StarFilled,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { getClientVouchers, type AvailableCoupon } from "../../api/voucherApi";
import type { Voucher } from "../../models/Voucher";

interface VoucherPickerModalProps {
  open: boolean;
  onClose: () => void;
  subTotal: number;
  onApply: (voucher: Voucher | AvailableCoupon) => void;
  appliedCode?: string | null;
  availableCoupons?: AvailableCoupon[];
  onRefreshCoupons?: () => void;
}

interface VoucherItem extends Voucher {
  calculatedDiscount?: number;
}

const formatPrice = (value: number | null | undefined): string => {
  if (value == null) return "—";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
};

const VoucherPickerModal: React.FC<VoucherPickerModalProps> = ({
  open,
  onClose,
  subTotal,
  onApply,
  appliedCode,
  availableCoupons = [],
  onRefreshCoupons,
}) => {
  const [vouchers, setVouchers] = useState<VoucherItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const now = useMemo(() => Date.now(), [open]);

  useEffect(() => {
    if (!open) return;
    // If availableCoupons passed from parent, use them directly
    if (availableCoupons.length > 0) {
      const voucherItems: VoucherItem[] = availableCoupons.map(c => ({
        id: c.id,
        code: c.code,
        name: c.name,
        voucherType: c.voucherType,
        discountUnit: c.discountUnit,
        discountValue: c.discountValue,
        maxDiscountAmount: c.maxDiscountAmount,
        conditions: c.conditions,
        startDate: c.startDate,
        endDate: c.endDate,
        note: c.note,
        quantity: c.quantity,
        status: c.status,
        discountValue: c.discountValue,
        customerIds: [],
        calculatedDiscount: c.calculatedDiscount,
      }));
      setVouchers(voucherItems);
      return;
    }
    // Otherwise fetch from API
    setLoading(true);
    getClientVouchers()
      .then((res: any) => {
        console.log("[DEBUG VoucherPickerModal] Raw response:", res);
        let data: any[] = [];
        if (Array.isArray(res)) {
          data = res;
        } else if (res?.data) {
          data = Array.isArray(res.data) ? res.data : [];
        }
        console.log("[DEBUG VoucherPickerModal] Parsed vouchers:", data);
        setVouchers(data);
      })
      .catch((err) => {
        console.error("[DEBUG VoucherPickerModal] Error:", err);
        message.error("Không thể tải danh sách phiếu giảm giá");
      })
      .finally(() => setLoading(false));
  }, [open, availableCoupons.length]);

  const handleManualApply = () => {
    const code = manualCode.trim().toUpperCase();
    if (!code) {
      message.warning("Vui lòng nhập mã giảm giá!");
      return;
    }
    const found = vouchers.find((v) => v.code.toUpperCase() === code);
    if (!found) {
      message.error("Mã giảm giá không hợp lệ hoặc không áp dụng cho bạn!");
      return;
    }
    applyVoucher(found);
  };

  const applyVoucher = (v: VoucherItem) => {
    if (v.conditions && subTotal < v.conditions) {
      message.warning(
        `Đơn hàng tối thiểu ${formatPrice(v.conditions)} để áp dụng mã này!`,
      );
      return;
    }
    onApply(v);
    setManualCode("");
    onClose();
  };

  const getDiscountLabel = (v: VoucherItem): string => {
    if (v.discountUnit === "PERCENT") {
      const pct = `${v.discountValue}%`;
      return v.maxDiscountAmount
        ? `Giảm ${pct} (tối đa ${formatPrice(v.maxDiscountAmount)})`
        : `Giảm ${pct}`;
    }
    return `Giảm ${formatPrice(v.discountValue)}`;
  };

  const calcSavings = (v: VoucherItem): number => {
    if (v.calculatedDiscount !== undefined) {
      return Math.min(v.calculatedDiscount, subTotal);
    }
    let discount = 0;
    if (v.discountUnit === "PERCENT") {
      discount = (subTotal * v.discountValue) / 100;
      if (v.maxDiscountAmount) {
        discount = Math.min(discount, v.maxDiscountAmount);
      }
    } else {
      discount = v.discountValue;
    }
    return Math.min(discount, subTotal);
  };

  const canApply = (v: VoucherItem): boolean => {
    if (!v.conditions) return true;
    return subTotal >= v.conditions;
  };

  const sortedVouchers = useMemo(() => {
    return [...vouchers].sort((a, b) => {
      const eligibleA = canApply(a) && !(a.endDate && a.endDate < now);
      const eligibleB = canApply(b) && !(b.endDate && b.endDate < now);
      if (eligibleA && !eligibleB) return -1;
      if (!eligibleA && eligibleB) return 1;
      if (eligibleA && eligibleB) {
        const savingsA = calcSavings(a);
        const savingsB = calcSavings(b);
        return savingsB - savingsA;
      }
      return 0;
    });
  }, [vouchers, subTotal, now]);

  const bestCouponCode = useMemo(() => {
    if (sortedVouchers.length === 0) return null;
    const eligibleVouchers = sortedVouchers.filter(v => canApply(v) && !(v.endDate && v.endDate < now));
    if (eligibleVouchers.length === 0) return null;
    const best = eligibleVouchers.reduce((prev, curr) => {
      const prevSavings = calcSavings(prev);
      const currSavings = calcSavings(curr);
      return currSavings > prevSavings ? curr : prev;
    });
    return best.code;
  }, [sortedVouchers, subTotal, now]);

  return (
    <Modal
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <TagOutlined style={{ color: "#D32F2F" }} />
          <span>Chọn phiếu giảm giá</span>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={540}
      styles={{ body: { padding: "16px 24px 24px" } }}
    >
      {/* Manual code input */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <Input
          placeholder="Nhập mã giảm giá..."
          value={manualCode}
          onChange={(e) => setManualCode(e.target.value.toUpperCase())}
          onPressEnter={handleManualApply}
          prefix={<SearchOutlined style={{ color: "#9ca3af" }} />}
          allowClear
        />
        <Button
          type="primary"
          onClick={handleManualApply}
          style={{ background: "#D32F2F", borderColor: "#D32F2F" }}
        >
          Áp dụng
        </Button>
      </div>

      <Divider style={{ margin: "0 0 16px" }}>Hoặc chọn từ danh sách</Divider>

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <Spin />
        </div>
      ) : vouchers.length === 0 ? (
        <Empty description="Không có phiếu giảm giá nào" />
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            maxHeight: 420,
            overflowY: "auto",
            paddingRight: 4,
          }}
        >
          {sortedVouchers.map((v) => {
            const isApplied = appliedCode === v.code;
            const eligible = canApply(v);
            const expired = v.endDate && v.endDate < now;
            const savings = calcSavings(v);
            const isBest = bestCouponCode === v.code && !isApplied && eligible && !expired;

            return (
              <div
                key={v.id}
                style={{
                  border: `2px solid ${isApplied ? "#D32F2F" : isBest ? "#faad14" : eligible && !expired ? "#e5e7eb" : "#f3f4f6"}`,
                  borderRadius: 10,
                  padding: "14px 16px",
                  display: "flex",
                  gap: 14,
                  alignItems: "flex-start",
                  background: isApplied
                    ? "#fff5f5"
                    : isBest
                      ? "#fffbe6"
                      : !eligible || expired
                        ? "#fafafa"
                        : "#fff",
                  opacity: !eligible || expired ? 0.65 : 1,
                  position: "relative",
                }}
              >
                {/* Icon strip */}
                <div
                  style={{
                    width: 48,
                    minWidth: 48,
                    height: 48,
                    borderRadius: 8,
                    background: "#D32F2F",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <TagOutlined style={{ color: "#fff", fontSize: 22 }} />
                </div>

                {/* Details */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: 15,
                      color: "#111827",
                      marginBottom: 4,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    {v.name}
                    {isBest && (
                      <Badge
                        count="Ưu đãi tốt nhất"
                        style={{
                          backgroundColor: "#faad14",
                          fontSize: 10,
                          height: 18,
                          lineHeight: "18px",
                          padding: "0 6px",
                        }}
                      />
                    )}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: "#D32F2F",
                      fontWeight: 500,
                      marginBottom: 4,
                    }}
                  >
                    {getDiscountLabel(v)}
                  </div>
                  {eligible && !expired && savings > 0 && (
                    <div
                      style={{
                        fontSize: 12,
                        color: "#52c41a",
                        fontWeight: 500,
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      Tiết kiệm: {formatPrice(savings)}
                    </div>
                  )}
                  {v.conditions > 0 && (
                    <div
                      style={{
                        fontSize: 12,
                        color: "#6b7280",
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <ExclamationCircleOutlined />
                      Đơn tối thiểu {formatPrice(v.conditions)}
                      {!eligible && (
                        <Tag
                          color="warning"
                          style={{ marginLeft: 4, fontSize: 11 }}
                        >
                          Chưa đủ điều kiện
                        </Tag>
                      )}
                    </div>
                  )}
                  <div
                    style={{
                      fontSize: 12,
                      color: "#9ca3af",
                      marginTop: 4,
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <ClockCircleOutlined />
                    HSD: {dayjs(v.endDate).format("DD/MM/YYYY")}
                  </div>
                  <div style={{ marginTop: 6 }}>
                    <Tag
                      style={{
                        fontFamily: "monospace",
                        fontWeight: 700,
                        fontSize: 13,
                        letterSpacing: 1,
                        background: "#f3f4f6",
                        border: "1px dashed #d1d5db",
                        color: "#374151",
                      }}
                    >
                      {v.code}
                    </Tag>
                  </div>
                </div>

                {/* Action button */}
                <div style={{ display: "flex", alignItems: "center" }}>
                  {isApplied ? (
                    <CheckCircleFilled
                      style={{ color: "#D32F2F", fontSize: 22 }}
                    />
                  ) : (
                    <Button
                      type="primary"
                      size="small"
                      disabled={!eligible || !!expired}
                      onClick={() => applyVoucher(v)}
                      style={{
                        background:
                          eligible && !expired ? "#D32F2F" : undefined,
                        borderColor:
                          eligible && !expired ? "#D32F2F" : undefined,
                        fontSize: 12,
                      }}
                    >
                      Chọn
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Modal>
  );
};

export default VoucherPickerModal;
