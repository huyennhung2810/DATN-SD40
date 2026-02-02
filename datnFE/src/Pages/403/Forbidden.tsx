import React from "react";
import { Result, Button } from "antd";
import { useNavigate } from "react-router-dom";

const ForbiddenPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Result
      status="403"
      title="403"
      subTitle="Xin lỗi, bạn không có đủ quyền truy cập vào tài nguyên này."
      extra={
        <Button type="primary" onClick={() => navigate("/")}>
          Quay lại trang chủ
        </Button>
      }
    />
  );
};

export default ForbiddenPage;
