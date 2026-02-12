import React from "react";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import MainLayout from "./layout/admin/MainLayout";
import CustomerPage from "./Pages/admin/customer/CustomerList";
import CustomerForm from "./Pages/admin/customer/CustomerForm";
import EmployeePage from "./Pages/admin/employee/EmployeeList";
import EmployeeForm from "./Pages/admin/employee/EmployeeForm";
import SerialPage from "./Pages/admin/serial/SerialList";
import StorageCapacityPage from "./Pages/admin/storage/StorageList";
import ColorPage from "./Pages/admin/color/ColorList";

import ChangePasswordPage from "./Pages/admin/otp/DoiMatKhau";
import StatisticsPage from "./layout/admin/Statistics";


// --- Import thêm các trang Voucher ---
import VoucherList from "./Pages/admin/voucher/VoucherList";
import VoucherForm from "./Pages/admin/voucher/VoucherForm";
import DiscountList from "./Pages/admin/discount/DiscountList";
import DiscountForm from "./Pages/admin/discount/DiscountForm";

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
          
          <Route path="/serial" element={<SerialPage />} />
          <Route path="/products/color" element={<ColorPage />} />
          <Route path="/products/storage-capacity" element={<StorageCapacityPage />} />
          <Route path="/statistics" element={<StatisticsPage />} />

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
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
};

export default App;
