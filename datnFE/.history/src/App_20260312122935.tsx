import React from "react";
import { Routes, Route, BrowserRouter, Navigate } from "react-router-dom";
import CustomerPage from "./Pages/admin/customer/CustomerList";
import CustomerForm from "./Pages/admin/customer/CustomerForm";
import EmployeePage from "./Pages/admin/employee/EmployeeList";
import EmployeeForm from "./Pages/admin/employee/EmployeeForm";
import ProductCategoryPage from "./Pages/admin/product-category/ProductCategoryList";
import ProductPage from "./Pages/admin/product/ProductList";
import TechSpecPage from "./Pages/admin/tech-spec/TechSpecList";
import SerialPage from "./Pages/admin/serial/SerialList";
import StorageCapacityPage from "./Pages/admin/storage/StorageList";
import ColorPage from "./Pages/admin/color/ColorList";
import ChangePasswordPage from "./Pages/admin/otp/DoiMatKhau";
import StatisticsPage from "./layout/admin/Statistics";
import VoucherList from "./Pages/admin/voucher/VoucherList";
import VoucherForm from "./Pages/admin/voucher/VoucherForm";
import DiscountList from "./Pages/admin/discount/DiscountList";
import DiscountForm from "./Pages/admin/discount/DiscountForm";
import ShiftTemplatePage from "./Pages/admin/shiftTemplate/ShiftTemplatePage";
import ProductDetailPage from "./Pages/admin/productdetail/productDetailList";
import CustomerHomePage from "./Pages/customer/HomePage";
import CustomerCatalogPage from "./Pages/customer/CatalogPage";
import CustomerLayout from "./layout/customer/CustomerLayout";
import WorkSchedulePage from "./Pages/admin/workSchedule/WorkSchedulePage";
import ShiftHandoverPage from "./Pages/admin/shiftHandover/ShiftHandoverPage";
import MainLayout from "./layout/admin/MainLayout";
import PosPage from "./Pages/admin/pos/PosPage";
import OrderPage from "./Pages/admin/order/OrderList";
import BannerList from "./Pages/admin/banner/BannerList";
import BannerForm from "./Pages/admin/banner/BannerForm";
import AccountList from "./Pages/admin/account/AccountList";
import AccountForm from "./Pages/admin/account/AccountForm";
import LoginPage from "./Pages/auth/LoginPage";
import RegisterPage from "./Pages/auth/RegisterPage";
import ForgotPasswordPage from "./Pages/auth/ForgotPasswordPage";
import OAuth2RedirectPage from "./Pages/auth/OAuth2RedirectPage";
import PrivateRoute from "./components/PrivateRoute";
import ForbiddenPage from "./Pages/403/Forbidden";
import "antd/dist/reset.css";
// Admin Home Page
const HomePage = () => (
  <div style={{ textAlign: "center", marginTop: "50px" }}>
    <h1>Hệ thống Quản lý Hikari Camera</h1>{" "}
    <p>Chọn chức năng trên thanh menu để bắt đầu.</p>
  </div>
);

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public auth routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/redirect" element={<OAuth2RedirectPage />} />
        <Route path="/403" element={<ForbiddenPage />} />


        
        {/* Client Pages */}
        <Route path="/client" element={<CustomerLayout />}>
          <Route index element={<CustomerHomePage />} />
          <Route path="catalog" element={<CustomerCatalogPage />} />
          <Route path="products" element={<CustomerCatalogPage />} />
        </Route>
        <Route path="/home" element={<Navigate to="/client" replace />} />
        <Route
          path="/catalog"
          element={<Navigate to="/client/catalog" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
