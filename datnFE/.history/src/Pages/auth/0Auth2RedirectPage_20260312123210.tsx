import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Spin } from "antd";
import { authActions } from "../../redux/auth/authSlice";
import type { AuthUser } from "../../models/auth";

const decodeJwtPayload = (token: string): Record<string, unknown> => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    return JSON.parse(jsonPayload);
  } catch {
    return {};
  }
};

const OAuth2RedirectPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const state = searchParams.get("state");

    if (!state) {
      navigate("/login", { replace: true });
      return;
    }

    try {
      // The state param is Base64-encoded JSON: {"accessToken":"...","refreshToken":"..."}
      const decoded = atob(state);
      const { accessToken, refreshToken } = JSON.parse(decoded) as {
        accessToken: string;
        refreshToken: string;
      };

      if (!accessToken || !refreshToken) {
        navigate("/login", { replace: true });
        return;
      }

      // Decode JWT payload to build the AuthUser object
      const claims = decodeJwtPayload(accessToken);

      const user: AuthUser = {
        userId: (claims.userId as string) ?? "",
        username: (claims.username as string) ?? "",
        fullName: (claims.fullName as string) ?? "",
        email: (claims.email as string) ?? "",
        pictureUrl: (claims.pictureUrl as string) ?? undefined,
        // OAuth2 tokens use "rolesCode"; regular tokens use "roles"
        roles: ((claims.rolesCode ?? claims.roles) as string[]) ?? [],
      };

      dispatch(authActions.loginSuccess({ user, accessToken, refreshToken }));

      // Redirect based on role
      const roles: string[] = user.roles ?? [];
      if (roles.includes("ADMIN") || roles.includes("STAFF")) {
        navigate("/", { replace: true });
      } else {
        navigate("/client", { replace: true });
      }
    } catch {
      navigate("/login", { replace: true });
    }
  }, []);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <Spin size="large" tip="Đang xử lý đăng nhập..." />
    </div>
  );
};

export default OAuth2RedirectPage;
