import React from "react";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import MainLayout from "./layout/MainLayout";
import CustomerPage from "./Pages/admin/customer/CustomerList";
import CustomerForm from "./Pages/admin/customer/CustomerForm";
import EmployeePage from "./Pages/admin/employee/EmployeeList";
import EmployeeForm from "./Pages/admin/employee/EmployeeForm";
import ProductCategoryPage from "./Pages/admin/product-category/ProductCategoryList";
import ProductPage from "./Pages/admin/product/ProductList";
import TechSpecPage from "./Pages/admin/tech-spec/TechSpecList";

const HomePage = () => (
  <div style={{ textAlign: "center", marginTop: "50px" }}>
    <h1>Hệ thống Quản lý Hikari Camera</h1>{" "}
    <p>Chọn chức năng trên thanh menu để bắt đầu.</p>
  </div>
);

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/customer" element={<CustomerPage />} />
          <Route path="/customerAdd" element={<CustomerForm />} />
          <Route path="/admin/customers/:id" element={<CustomerForm />} />
          <Route path="/employee" element={<EmployeePage />} />
          <Route path="/employeeAdd" element={<EmployeeForm />} />
          <Route path="/admin/employees/:id" element={<EmployeeForm />} />
          <Route path="/admin/product-categories" element={<ProductCategoryPage />} />
          <Route path="/admin/products" element={<ProductPage />} />
          <Route path="/admin/tech-spec" element={<TechSpecPage />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
};

export default App;
