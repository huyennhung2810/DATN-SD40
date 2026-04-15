import { Route } from "react-router-dom";
import CustomerLoginPage from "../Pages/auth/CustomerLoginPage";
import AdminLoginPage from "../Pages/auth/AdminLoginPage";
import RegisterPage from "../Pages/auth/RegisterPage";
import ForbiddenPage from "../Pages/403/Forbidden";
import ForgotPasswordPage from "../Pages/auth/ForgotPasswordPage";
import OAuth2RedirectPage from "../Pages/auth/0Auth2RedirectPage";
import ChangePasswordPage from "../Pages/admin/otp/DoiMatKhau";
import VNPayReturnPage from "../Pages/client/VNPayReturnPage";
import OrderTrackingPage from "../Pages/client/OrderTrackingPage";

export const PublicRoutes = () => [
  <Route key="login" path="/login" element={<CustomerLoginPage />} />,
  <Route key="admin-login" path="/admin/login" element={<AdminLoginPage />} />,
  <Route key="register" path="/register" element={<RegisterPage />} />,
  <Route
    key="forgot-password"
    path="/forgot-password"
    element={<ForgotPasswordPage />}
  />,
  <Route
    key="oauth2-redirect"
    path="/oauth2/redirect"
    element={<OAuth2RedirectPage />}
  />,
  <Route key="403" path="/403" element={<ForbiddenPage />} />,
  <Route path="/client/order-tracking" element={<OrderTrackingPage />} />,
  <Route
    key="change-password"
    path="/change-password/:username"
    element={<ChangePasswordPage />}
  />,
  <Route
    key="vnpay-return"
    path="/payment/vnpay-return"
    element={<VNPayReturnPage />}
  />,
];

export default PublicRoutes;
