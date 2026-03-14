import React from "react";
import { Button, Result } from "antd";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../redux/store"; // Sửa lại đường dẫn import cho đúng

const ForbiddenPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  const handleBackHome = () => {
    if (!user || user.roles?.includes("CUSTOMER")) {
      navigate("/client", { replace: true });
    } else if (user.roles?.includes("ADMIN") || user.roles?.includes("STAFF")) {
      navigate("/", { replace: true });
    }
  };

  return (
    <Result
      status="403"
      title="403"
      subTitle="Xin lỗi, bạn không có quyền truy cập vào trang này."
      extra={
        <Button type="primary" onClick={handleBackHome}>
          Về trang chủ
        </Button>
      }
    />
  );
};

export default ForbiddenPage;
