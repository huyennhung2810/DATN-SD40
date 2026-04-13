import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../redux/store";

interface PrivateRouteProps {
  allowedRoles?: string[];
  loginPath?: string;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({
  allowedRoles,
  loginPath = "/admin/login",
}) => {
  const { isLoggedIn, user } = useSelector((state: RootState) => state.auth);

  if (!isLoggedIn || !user) {
    return <Navigate to={loginPath} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const hasRole = user.roles?.some((role) => allowedRoles.includes(role));
    if (!hasRole) {
      return <Navigate to="/403" replace />;
    }
  }

  return <Outlet />;
};

export default PrivateRoute;
