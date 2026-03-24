import React, { useEffect, useState } from "react";
import { Result, Button, Spin, Typography, Descriptions } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { useSearchParams } from "react-router-dom";
import axiosClient from "../../../api/axiosClient";

const { Text } = Typography;

interface VNPayResult {
  success: boolean;
  responseCode?: string;
  orderId?: string;
  transactionNo?: string;
  amount?: string;
  message?: string;
}

const formatPrice = (vnpayAmount: string | undefined) => {
  if (!vnpayAmount) return "—";
  const amount = parseInt(vnpayAmount, 10) / 100;
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

const PosVnPayReturnPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<VNPayResult | null>(null);

  useEffect(() => {
    const params: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });

    axiosClient
      .get("/admin/pos/orders/vnpay-return", { params })
      .then((res) => setResult(res.data))
      .catch(() =>
        setResult({
          success: false,
          message: "Không thể xác thực kết quả thanh toán!",
        }),
      )
      .finally(() => setLoading(false));
  }, [searchParams]);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <Spin size="large" tip="Đang xác thực kết quả thanh toán VNPay..." />
      </div>
    );
  }

  const isSuccess = result?.success && result?.responseCode === "00";

  return (
    <div
      style={{
        background: "#f5f5f5",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          padding: "40px 48px",
          maxWidth: 520,
          width: "100%",
          boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
          textAlign: "center",
        }}
      >
        {isSuccess ? (
          <>
            <CheckCircleOutlined
              style={{ fontSize: 72, color: "#52c41a", marginBottom: 16 }}
            />
            <Result
              status="success"
              title="Thanh toán VNPay thành công!"
              subTitle="Đơn hàng tại quầy đã được xác nhận. Bạn có thể đóng tab này."
              extra={
                <Button type="primary" onClick={() => window.close()}>
                  Đóng tab này
                </Button>
              }
            />
            <Descriptions
              bordered
              column={1}
              size="small"
              style={{ marginTop: 16, textAlign: "left" }}
            >
              <Descriptions.Item label="Mã đơn hàng">
                <Text strong>{result?.orderId}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Mã giao dịch VNPay">
                <Text>{result?.transactionNo}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Số tiền">
                <Text strong style={{ color: "#52c41a" }}>
                  {formatPrice(result?.amount)}
                </Text>
              </Descriptions.Item>
            </Descriptions>
          </>
        ) : (
          <>
            <CloseCircleOutlined
              style={{ fontSize: 72, color: "#ff4d4f", marginBottom: 16 }}
            />
            <Result
              status="error"
              title="Thanh toán VNPay thất bại"
              subTitle={
                result?.message ||
                `Mã lỗi: ${result?.responseCode}. Vui lòng thử lại hoặc chọn phương thức thanh toán khác.`
              }
              extra={
                <Button onClick={() => window.close()}>Đóng tab này</Button>
              }
            />
          </>
        )}
      </div>
    </div>
  );
};

export default PosVnPayReturnPage;
