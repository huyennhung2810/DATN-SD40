import React from "react";
import { Routes, Route, BrowserRouter, Navigate } from "react-router-dom";

import MainLayout from "./layout/admin/MainLayout";
import CustomerLayout from "./layout/customer/CustomerLayout";

// Admin Pages
import CustomerPage from "./Pages/admin/customer/CustomerList";
import CustomerForm from "./Pages/admin/customer/CustomerForm";
import EmployeePage from "./Pages/admin/employee/EmployeeList";
import EmployeeForm from "./Pages/admin/employee/EmployeeForm";
import ProductCategoryPage from "./Pages/admin/product-category/ProductCategoryList";
import ProductPage from "./Pages/admin/product/ProductList";
import TechSpecPage from "./Pages/admin/tech-spec/TechSpecList";

import ChangePasswordPage from "./Pages/admin/otp/DoiMatKhau";
import StatisticsPage from "./layout/admin/Statistics";
import ShiftHandoverPage from "./Pages/admin/shiftHandover/ShiftHandoverPage";
import WorkSchedulePage from "./Pages/admin/workSchedule/WorkSchedulePage";

import VoucherList from "./Pages/admin/voucher/VoucherList";
import VoucherForm from "./Pages/admin/voucher/VoucherForm";
import DiscountList from "./Pages/admin/discount/DiscountList";
import DiscountForm from "./Pages/admin/discount/DiscountForm";
import ShiftTemplatePage from "./Pages/admin/shiftTemplate/ShiftTemplatePage";

// Client Pages
import CustomerHomePage from "./Pages/customer/HomePage";
import CustomerCatalogPage from "./Pages/customer/CatalogPage";

const HomePage = () => (
  <div style={{ textAlign: "center", marginTop: "50px" }}>
    <h1>Hệ thống Quản lý Hikari Camera</h1>
    <p>Chọn chức năng trên thanh menu để bắt đầu.</p>
  </div>
);

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* ================= ADMIN ROUTES ================= */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />

          {/* Customer */}
          <Route path="/customer" element={<CustomerPage />} />
          <Route path="/customerAdd" element={<CustomerForm />} />
          <Route path="/admin/customers/:id" element={<CustomerForm />} />

          {/* Employee */}
          <Route path="/employee" element={<EmployeePage />} />
          <Route path="/employeeAdd" element={<EmployeeForm />} />
          <Route path="/admin/employees/:id" element={<EmployeeForm />} />

          {/* Product */}
          <Route
            path="/admin/product-categories"
            element={<ProductCategoryPage />}
          />
          <Route path="/admin/products" element={<ProductPage />} />
          <Route path="/admin/tech-spec" element={<TechSpecPage />} />

          {/* System */}
          <Route path="/statistics" element={<StatisticsPage />} />
          <Route path="/work-schedule" element={<WorkSchedulePage />} />
          <Route path="/shift-handover" element={<ShiftHandoverPage />} />

          <Route
            path="/change-password/:username"
            element={<ChangePasswordPage />}
          />

          {/* Voucher */}
          <Route path="/voucher" element={<VoucherList />} />
          <Route path="/voucher/create" element={<VoucherForm />} />
          <Route path="/voucher/edit/:id" element={<VoucherForm />} />

          {/* Discount */}
          <Route path="/discount" element={<DiscountList />} />
          <Route path="/discount/create" element={<DiscountForm />} />
          <Route path="/discount/edit/:id" element={<DiscountForm />} />

          {/* Shift */}
          <Route path="/shift-template" element={<ShiftTemplatePage />} />
        </Route>

        {/* ================= CLIENT ROUTES ================= */}
        <Route element={<CustomerLayout />}>
          <Route path="/client" element={<CustomerHomePage />} />
          <Route path="/client/catalog" element={<CustomerCatalogPage />} />
          <Route path="/client/products" element={<CustomerCatalogPage />} />
        </Route>

        {/* ================= REDIRECT ================= */}
        <Route path="/home" element={<Navigate to="/client" replace />} />
        <Route
          path="/catalog"
          element={<Navigate to="/client/catalog" replace />}
        />

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
