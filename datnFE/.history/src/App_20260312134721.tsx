import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useSelector } from "react-redux";
import { Spin } from "antd";

// Layouts
import MainLayout from "./layout/admin/MainLayout";
import CustomerLayout from "./layout/customer/CustomerLayout";

// Auth Pages
import LoginPage from "./Pages/auth/LoginPage";
import RegisterPage from "./Pages/auth/RegisterPage";
import ForgotPasswordPage from "./Pages/auth/ForgotPasswordPage";
import OAuth2RedirectPage from "./Pages/auth/0Auth2RedirectPage";
import ForbiddenPage from "./Pages/403/Forbidden";

// Admin Pages
import Dashboard from "./layout/admin/Statistics"; // Giả định là Statistics làm dashboard
import CustomerPage from "./Pages/admin/customer/CustomerList";
import CustomerForm from "./Pages/admin/customer/CustomerForm";
import EmployeePage from "./Pages/admin/employee/EmployeeList";
import EmployeeForm from "./Pages/admin/employee/EmployeeForm";
import ProductCategoryPage from "./Pages/admin/product-category/ProductCategoryList";
import ProductPage from "./Pages/admin/product/ProductList";
import ProductDetailPage from "./Pages/admin/productdetail/productDetailList";
import OrderPage from "./Pages/admin/order/OrderList";
import PosPage from "./Pages/admin/pos/PosPage";

// Customer Pages
import CustomerHomePage from "./Pages/customer/HomePage";
import CustomerCatalogPage from "./Pages/customer/CatalogPage";

// Components
import PrivateRoute from "./components/PrivateRoute";
import { RootState } from "./redux/store";

import "antd/dist/reset.css";

/**
 * Component điều hướng thông minh tại đường dẫn gốc "/"
 * Nếu là ADMIN/STAFF -> vào trang quản trị
 * Nếu là CUSTOMER -> vào trang mua sắm
 * Nếu chưa đăng nhập -> sang trang login
 */
const RootRedirect = () => {
  const { isLoggedIn, user, loading } = useSelector(
    (state: RootState) => state.auth,
  );

  if (loading)
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Spin size="large" />
      </div>
    );

  if (!isLoggedIn) return <Navigate to="/login" replace />;

  const isAdmin = user?.roles?.some(
    (role) => role === "ADMIN" || role === "STAFF",
  );
  return isAdmin ? (
    <Navigate to="/admin/dashboard" replace />
  ) : (
    <Navigate to="/client" replace />
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* ================= PUBLIC ROUTES (AUTH) ================= */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/redirect" element={<OAuth2RedirectPage />} />
        <Route path="/403" element={<ForbiddenPage />} />

        {/* Điều hướng gốc */}
        <Route path="/" element={<RootRedirect />} />

        {/* ================= ADMIN / STAFF ROUTES (Bảo vệ bởi PrivateRoute) ================= */}
        <Route element={<PrivateRoute allowedRoles={["ADMIN", "STAFF"]} />}>
          <Route element={<MainLayout />}>
            <Route path="/admin/dashboard" element={<Dashboard />} />
            <Route path="/pos" element={<PosPage />} />
            <Route path="/orders" element={<OrderPage />} />

            {/* Quản lý Sản phẩm máy ảnh */}
            <Route path="/admin/products" element={<ProductPage />} />
            <Route
              path="/admin/product-categories"
              element={<ProductCategoryPage />}
            />
            <Route
              path="/products/product-detail"
              element={<ProductDetailPage />}
            />

            {/* Quản lý Nhân sự */}
            <Route path="/employee" element={<EmployeePage />} />
            <Route path="/employeeAdd" element={<EmployeeForm />} />
            <Route path="/admin/employees/:id" element={<EmployeeForm />} />

            <Route path="/customer" element={<CustomerPage />} />
            <Route path="/admin/customers/:id" element={<CustomerForm />} />
          </Route>
        </Route>

        {/* ================= CUSTOMER ROUTES (Bảo vệ bởi PrivateRoute) ================= */}
        <Route element={<PrivateRoute allowedRoles={["CUSTOMER"]} />}>
          <Route path="/client" element={<CustomerLayout />}>
            <Route index element={<CustomerHomePage />} />
            <Route path="catalog" element={<CustomerCatalogPage />} />
            <Route path="products" element={<CustomerCatalogPage />} />
          </Route>
        </Route>

        {/* ================= CATCH ALL (404 Redirect) ================= */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
