import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Spin, message } from "antd";
import { setTokens, decodeOAuthState } from "../../../utils/authStorage";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../../redux/store";
import { authActions } from "../../../redux/auth/authSlice";

const RedirectPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    if (error) {
      message.error("Đăng nhập Google thất bại: " + error);
      navigate("/login");
      return;
    }

    if (!state) {
      message.error("Không nhận được thông tin đăng nhập");
      navigate("/login");
      return;
    }

    try {
      // Decode the state to get tokens
      const tokens = decodeOAuthState(state);
      setTokens(tokens.accessToken, tokens.refreshToken);
      dispatch(authActions.loginSuccess(tokens));
      dispatch(authActions.fetchMe());
      message.success("Đăng nhập thành công!");
      navigate("/");
    } catch (e) {
      console.error("Error parsing OAuth state:", e);
      message.error("Đăng nhập thất bại");
      navigate("/login");
    }
  }, [searchParams, navigate, dispatch]);

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <Spin size="large" />
      <p>Đang xử lý đăng nhập...</p>
    </div>
  );
};

export default RedirectPage;
