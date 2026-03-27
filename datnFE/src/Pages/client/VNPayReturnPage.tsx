import React, { useEffect, useState } from "react";
import { Result, Button, Spin, Typography, Descriptions } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined, FileTextOutlined } from "@ant-design/icons";
import { useNavigate, useSearchParams } from "react-router-dom";
import axiosClient from "../../api/axiosClient";

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
  // VNPay gửi amount * 100
  const amount = parseInt(vnpayAmount, 10) / 100;
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

const VNPayReturnPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<VNPayResult | null>(null);

  useEffect(() => {
    const params: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });

    // Gọi backend xác thực kết quả VNPay
    axiosClient
      .get("/client/payment/vnpay-return", { params })
      .then((res) => {
        console.log("[VNPay Return] Response:", res.data);
        setResult(res.data);
      })
      .catch((err) => {
        console.error("[VNPay Return] Error:", err);
        setResult({
          success: false,
          message: "Không thể xác thực kết quả thanh toán!",
        });
      })
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
        <Spin size="large" description="Đang xác thực kết quả thanh toán..." />
      </div>
    );
  }

  const isSuccess = result?.success && result?.responseCode === "00";

  return (
    <div
      style={{
        background: "#f5f5f5",
        minHeight: "80vh",
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
          padding: "48px 40px",
          maxWidth: 520,
          width: "100%",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
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
              title="Thanh toán thành công!"
              subTitle="Đơn hàng của bạn đã được xác nhận. Chúng tôi sẽ xử lý và giao hàng sớm nhất!"
              style={{ padding: 0 }}
            />
          </>
        ) : (
          <>
            <CloseCircleOutlined
              style={{ fontSize: 72, color: "#ff4d4f", marginBottom: 16 }}
            />
            <Result
              status="error"
              title="Thanh toán thất bại!"
              subTitle={
                result?.message ||
                "Giao dịch không thành công. Vui lòng thử lại hoặc chọn phương thức thanh toán khác."
              }
              style={{ padding: 0 }}
            />
          </>
        )}

        {result && (
          <Descriptions
            column={1}
            bordered
            size="small"
            style={{ marginTop: 24, textAlign: "left" }}
          >
            {result.orderId && (
              <Descriptions.Item label="Mã đơn hàng">
                <Text copyable>{result.orderId}</Text>
              </Descriptions.Item>
            )}
            {result.transactionNo && (
              <Descriptions.Item label="Mã giao dịch VNPay">
                <Text copyable>{result.transactionNo}</Text>
              </Descriptions.Item>
            )}
            {result.amount && (
              <Descriptions.Item label="Số tiền">
                {formatPrice(result.amount)}
              </Descriptions.Item>
            )}
            {result.responseCode && (
              <Descriptions.Item label="Mã phản hồi">
                {result.responseCode}
              </Descriptions.Item>
            )}
          </Descriptions>
        )}

        <div
          style={{
            marginTop: 32,
            display: "flex",
            gap: 12,
            justifyContent: "center",
          }}
        >
          <Button
            type="primary"
            size="large"
            onClick={() => navigate("/client")}
            style={{ borderRadius: 8 }}
          >
            Về trang chủ
          </Button>
          {isSuccess && result?.orderId && (
            <Button
              size="large"
              icon={<FileTextOutlined />}
              onClick={() => navigate(`/client/orders/${result.orderId}`)}
              style={{ borderRadius: 8, borderColor: "#52c41a", color: "#52c41a" }}
            >
              Xem đơn hàng
            </Button>
          )}
          {!isSuccess && (
            <Button
              size="large"
              onClick={() => navigate("/client/checkout")}
              style={{ borderRadius: 8 }}
            >
              Thử lại
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VNPayReturnPage;
