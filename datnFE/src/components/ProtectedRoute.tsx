import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../redux/store";
import { authActions } from "../redux/auth/authSlice";
import { getAccessToken } from "../utils/authStorage";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();
  const { accessToken, user, loading } = useSelector(
    (state: RootState) => state.auth
  );

  useEffect(() => {
    // If we have a token but no user, fetch user info
    if (accessToken && !user && !loading) {
      dispatch(authActions.fetchMe());
    }
  }, [accessToken, user, loading, dispatch]);

  const hasValidToken = !!accessToken || !!getAccessToken();

  if (!hasValidToken) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
