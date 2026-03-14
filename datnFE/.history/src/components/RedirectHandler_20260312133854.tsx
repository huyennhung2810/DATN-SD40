import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../redux/slices/authSlice";
import { AUTH_STORAGE_KEYS } from "../models/auth";

const RedirectHandler: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const stateBase64 = searchParams.get("state");
    if (stateBase64) {
      try {
        // 1. Giải mã Base64 từ URL
        const decodedData = JSON.parse(atob(stateBase64));
        const { accessToken, refreshToken } = decodedData;

        // 2. Lưu vào Storage
        localStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, accessToken);
        localStorage.setItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN, refreshToken);

        // 3. Cập nhật Redux (Bạn có thể gọi thêm API get-profile ở đây nếu cần)
        dispatch(loginSuccess({ accessToken, refreshToken }));

        // 4. Chuyển hướng về Admin hoặc Home tùy role
        navigate("/admin/dashboard");
      } catch (error) {
        console.error("Lỗi giải mã token OAuth2:", error);
        navigate("/login?error=social_failed");
      }
    }
  }, [searchParams, dispatch, navigate]);

  return <div>Đang xác thực đăng nhập...</div>;
};

export default RedirectHandler;
