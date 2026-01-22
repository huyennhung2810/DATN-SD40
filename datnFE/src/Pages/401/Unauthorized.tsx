import React from "react";
import { Result, Button } from "antd";
import { useNavigate } from "react-router-dom";

const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Result
      status="403" // AntD không có status 401 riêng, dùng 403 visual hoặc icon custom
      title="401"
      subTitle="Rất tiếc, phiên làm việc đã hết hạn hoặc bạn chưa đăng nhập."
      extra={
        <Button type="primary" onClick={() => navigate("/login")}>
          Đăng nhập ngay
        </Button>
      }
    />
  );
};

export default UnauthorizedPage;
