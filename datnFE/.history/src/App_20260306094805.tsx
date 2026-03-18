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
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          //Khách hàng
          <Route path="/customer" element={<CustomerPage />} />
          <Route path="/customerAdd" element={<CustomerForm />} />
          <Route path="/admin/customers/:id" element={<CustomerForm />} />
          //Nhân viên
          <Route path="/employee" element={<EmployeePage />} />
          <Route path="/employeeAdd" element={<EmployeeForm />} />
          <Route path="/admin/employees/:id" element={<EmployeeForm />} />
          //Sản phẩm
          <Route
            path="/admin/product-categories"
            element={<ProductCategoryPage />}
          />
          <Route path="/admin/products" element={<ProductPage />} />
          <Route path="/admin/tech-spec" element={<TechSpecPage />} />
          <Route path="/serial" element={<SerialPage />} />
          <Route path="/products/color" element={<ColorPage />} />
          <Route
            path="/products/product-detail"
            element={<ProductDetailPage />}
          />
          <Route
            path="/products/storage-capacity"
            element={<StorageCapacityPage />}
          />
          //Thống kê
          <Route path="/statistics" element={<StatisticsPage />} />
          //Lịch làm việc
          <Route path="/work-schedule" element={<WorkSchedulePage />} />
          //Thay đổi mật khẩu
          <Route
            path="/change-password/:username"
            element={<ChangePasswordPage />}
          />
          //Giảm giá
          <Route path="/voucher" element={<VoucherList />} />
          <Route path="/voucher/create" element={<VoucherForm />} />
          <Route path="/voucher/edit/:id" element={<VoucherForm />} />
          <Route path="/discount/create" element={<DiscountForm />} />
          <Route path="/discount/edit/:id" element={<DiscountForm />} />
          <Route path="/discount" element={<DiscountList />} />
          <Route path="/shift-template" element={<ShiftTemplatePage />} />
        </Route>
        // Client Pages
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
