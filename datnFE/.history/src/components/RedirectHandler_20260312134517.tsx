import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { jwtDecode } from "jwt-decode"; // Thư viện giải mã JWT
import { AUTH_STORAGE_KEYS, type AuthUser } from "../models/auth";
import { notification } from "antd";

const RedirectHandler: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const stateBase64 = searchParams.get("state");

    if (stateBase64) {
      try {
        // 1. Giải mã Base64 từ URL (Dữ liệu từ TokenUriResponse của Backend)
        // atob giải mã chuỗi base64 thành string JSON
        const decodedString = atob(stateBase64);
        const { accessToken, refreshToken } = JSON.parse(decodedString);

        // 2. Giải mã JWT để lấy thông tin User (Payload)
        // Lưu ý: Cấu trúc này phải khớp với hàm getBodyClaims ở Backend TokenProvider
        const decodedToken: any = jwtDecode(accessToken);

        const user: AuthUser = {
          userId: decodedToken.userId,
          username: decodedToken.username,
          fullName: decodedToken.fullName,
          email: decodedToken.email,
          pictureUrl: decodedToken.pictureUrl,
          roles: decodedToken.rolesCode, // Backend dùng key rolesCode
        };

        // 3. Cập nhật vào Redux và LocalStorage (Thông qua action loginSuccess)
        dispatch(
          authActions.loginSuccess({
            user,
            accessToken,
            refreshToken,
          }),
        );

        notification.success({
          message: "Đăng nhập thành công",
          description: `Chào mừng ${user.fullName} quay trở lại!`,
        });

        // 4. Điều hướng thông minh dựa trên Role
        const isAdmin = user.roles.some(
          (role) => role === "ADMIN" || role === "STAFF",
        );
        if (isAdmin) {
          navigate("/admin/dashboard");
        } else {
          navigate("/"); // Về trang chủ bán máy ảnh cho khách hàng
        }
      } catch (error) {
        console.error("Lỗi xử lý Redirect OAuth2:", error);
        notification.error({
          message: "Lỗi đăng nhập",
          description: "Không thể xác thực tài khoản Google. Vui lòng thử lại!",
        });
        navigate("/login");
      }
    }
  }, [searchParams, dispatch, navigate]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        flexDirection: "column",
      }}
    >
      {/* Bạn có thể thêm Spin của Antd ở đây */}
      <p>Đang xác thực thông tin máy ảnh của bạn...</p>
    </div>
  );
};

export default RedirectHandler;
