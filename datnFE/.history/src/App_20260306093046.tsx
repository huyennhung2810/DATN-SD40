import React from "react";
<<<<<<< HEAD

import { Routes, Route, BrowserRouter, Navigate } from "react-router-dom";
import MainLayout from "./layout/MainLayout";
=======
import { Routes, Route, BrowserRouter } from "react-router-dom";
import MainLayout from "./layout/MainLayout";
import ClientLayout from "./layout/ClientLayout";
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
>>>>>>> origin/hungbt3103

import ChangePasswordPage from "./Pages/admin/otp/DoiMatKhau";
import StatisticsPage from "./layout/admin/Statistics";

// --- Import thêm các trang Voucher ---
import VoucherList from "./Pages/admin/voucher/VoucherList";
import VoucherForm from "./Pages/admin/voucher/VoucherForm";
import DiscountList from "./Pages/admin/discount/DiscountList";
import DiscountForm from "./Pages/admin/discount/DiscountForm";
<<<<<<< HEAD
import ShiftTemplatePage from "./Pages/admin/shiftTemplate/ShiftTemplatePage";
=======
import ProductDetailPage from "./Pages/admin/productdetail/productDetailList";
import ProductCategoryPage from "./Pages/admin/product-category/ProductCategoryList";
import ProductPage from "./Pages/admin/product/ProductList";
import TechSpecPage from "./Pages/admin/tech-spec/TechSpecList";
import ClientHomePage from "./Pages/client/ClientHomePage";
>>>>>>> origin/hungbt3103

// Customer (Client) Pages
import CustomerHomePage from "./Pages/customer/HomePage";
import CustomerCatalogPage from "./Pages/customer/CatalogPage";
import CustomerLayout from "./layout/customer/CustomerLayout";

// Admin Home Page (default)
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
<<<<<<< HEAD
        {/* ============================================ */}
        {/* ADMIN ROUTES - Uses MainLayout (with Sidebar/Header) */}
        {/* Path: /, /customer, /employee, /admin/* */}
        {/* ============================================ */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />

          {/* Admin Customer Management */}
          <Route path="/customer" element={<CustomerPage />} />
          <Route path="/customerAdd" element={<CustomerForm />} />
          <Route path="/admin/customers/:id" element={<CustomerForm />} />

          {/* Admin Employee Management */}
          <Route path="/employee" element={<EmployeePage />} />
          <Route path="/employeeAdd" element={<EmployeeForm />} />
=======
        {/* Admin Routes - sử dụng MainLayout */}
        <Route path="/" element={<MainLayout><HomePage /></MainLayout>} />
        <Route path="/customer" element={<MainLayout><CustomerPage /></MainLayout>} />
        <Route path="/customerAdd" element={<MainLayout><CustomerForm /></MainLayout>} />
        <Route path="/admin/customers/:id" element={<MainLayout><CustomerForm /></MainLayout>} />
        <Route path="/employee" element={<MainLayout><EmployeePage /></MainLayout>} />
        <Route path="/employeeAdd" element={<MainLayout><EmployeeForm /></MainLayout>} />
        <Route path="/admin/employees/:id" element={<MainLayout><EmployeeForm /></MainLayout>} />
        <Route path="/admin/product-categories" element={<MainLayout><ProductCategoryPage /></MainLayout>} />
        <Route path="/admin/products" element={<MainLayout><ProductPage /></MainLayout>} />
        <Route path="/admin/tech-spec" element={<MainLayout><TechSpecPage /></MainLayout>} />
        <Route path="/admin/employees/:id" element={<EmployeeForm />} />
          
        <Route path="/serial" element={<MainLayout><SerialPage /></MainLayout>} />
        <Route path="/products/color" element={<MainLayout><ColorPage /></MainLayout>} />
        <Route path="/products/product-detail" element={<MainLayout><ProductDetailPage /></MainLayout>} />
        <Route path="/products/storage-capacity" element={<MainLayout><StorageCapacityPage /></MainLayout>} />
        <Route path="/statistics" element={<StatisticsPage />} />
>>>>>>> origin/hungbt3103

        <Route path="/change-password/:username" element={<ChangePasswordPage />}/>

<<<<<<< HEAD
          <Route
            path="/change-password/:username"
            element={<ChangePasswordPage />}
          />

          <Route path="/employees/:id" element={<EmployeeForm />} />
          <Route path="/voucher" element={<VoucherList />} />
          <Route path="/voucher/create" element={<VoucherForm />} />
          <Route path="/voucher/edit/:id" element={<VoucherForm />} />
          <Route path="/discount" element={<DiscountList />} />
          <Route path="/discount/create" element={<DiscountForm />} />
          <Route path="/discount/edit/:id" element={<DiscountForm />} />
          <Route path="/discount" element={<DiscountList />} />
          <Route path="/shift-template" element={<ShiftTemplatePage />} />
          {/* Admin Product Management */}
          <Route
            path="/admin/product-categories"
            element={<ProductCategoryPage />}
          />
          <Route path="/admin/products" element={<ProductPage />} />
          <Route path="/admin/tech-spec" element={<TechSpecPage />} />
        </Route>

        <Route element={<CustomerLayout />}>
          <Route path="/client" element={<CustomerHomePage />} />
          <Route path="/client/catalog" element={<CustomerCatalogPage />} />
          <Route path="/client/products" element={<CustomerCatalogPage />} />
        </Route>

        {/* ============================================ */}
        {/* LEGACY/REDIRECT ROUTES */}
        {/* ============================================ */}
        {/* Redirect /home and /catalog to client routes */}
        <Route path="/home" element={<Navigate to="/client" replace />} />
        <Route
          path="/catalog"
          element={<Navigate to="/client/catalog" replace />}
        />

        {/* 404 - Redirect unknown routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
=======
        <Route path="/employees/:id" element={<EmployeeForm />} />
        <Route path="/voucher" element={<VoucherList />} />
        <Route path="/voucher/create" element={<VoucherForm />} />
        <Route path="/voucher/edit/:id" element={<VoucherForm />} />
        <Route path="/discount" element={<DiscountList />} />
        <Route path="/discount/create" element={<DiscountForm />} />
        <Route path="/discount/edit/:id" element={<DiscountForm />} />
        {/* Client Routes - sử dụng ClientLayout */}
        <Route path="/client" element={<ClientLayout><ClientHomePage /></ClientLayout>} />
        <Route path="/client/*" element={<ClientLayout><ClientHomePage /></ClientLayout>} />
>>>>>>> origin/hungbt3103
      </Routes>
    </BrowserRouter>
  );
};

export default App;
