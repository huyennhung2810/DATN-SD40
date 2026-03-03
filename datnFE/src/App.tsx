import React from "react";
import { Routes, Route, BrowserRouter, Navigate } from "react-router-dom";
import MainLayout from "./layout/MainLayout";
import CustomerPage from "./Pages/admin/customer/CustomerList";
import CustomerForm from "./Pages/admin/customer/CustomerForm";
import EmployeePage from "./Pages/admin/employee/EmployeeList";
import EmployeeForm from "./Pages/admin/employee/EmployeeForm";
import ProductCategoryPage from "./Pages/admin/product-category/ProductCategoryList";
import ProductPage from "./Pages/admin/product/ProductList";
import TechSpecPage from "./Pages/admin/tech-spec/TechSpecList";

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
          <Route path="/admin/employees/:id" element={<EmployeeForm />} />
          
          {/* Admin Product Management */}
          <Route path="/admin/product-categories" element={<ProductCategoryPage />} />
          <Route path="/admin/products" element={<ProductPage />} />
          <Route path="/admin/tech-spec" element={<TechSpecPage />} />
        </Route>

        {/* ============================================ */}
        {/* CLIENT ROUTES - Uses CustomerLayout (standalone) */}
        {/* Path: /client, /client/catalog, /client/products */}
        {/* ============================================ */}
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
        <Route path="/catalog" element={<Navigate to="/client/catalog" replace />} />
        
        {/* 404 - Redirect unknown routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
