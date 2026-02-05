import React from "react";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import MainLayout from "./layout/MainLayout";
import CustomerPage from "./Pages/admin/customer/CustomerList";
import CustomerForm from "./Pages/admin/customer/CustomerForm";
import EmployeePage from "./Pages/admin/employee/EmployeeList";
import EmployeeForm from "./Pages/admin/employee/EmployeeForm";
// --- Import thêm các trang Voucher ---
import VoucherList from "./Pages/admin/voucher/VoucherList";
import VoucherForm from "./Pages/admin/voucher/VoucherForm";
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
          <Route path="/employees/:id" element={<EmployeeForm />} />
          <Route path="/voucher" element={<VoucherList />} />
          <Route path="/voucher/create" element={<VoucherForm />} />
          <Route path="/voucher/edit/:id" element={<VoucherForm />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
};

export default App;
