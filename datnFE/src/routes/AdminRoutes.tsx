import { Route } from "react-router-dom";
import PrivateRoute from "../components/PrivateRoute";
import StatisticsPage from "./Statistics";
import EmployeePage from "../Pages/admin/employee/EmployeeList";
import EmployeeForm from "../Pages/admin/employee/EmployeeForm";
import ShiftManagementHub from "./ShiftManagementHub";
import ProductPage from "../Pages/admin/product/ProductList";
import ProductCategoryPage from "../Pages/admin/product-category/ProductCategoryList";
import TechSpecListPage from "../Pages/admin/tech-spec/TechSpecList";
import SerialPage from "../Pages/admin/serial/SerialList";
import ColorPage from "../Pages/admin/color/ColorList";
import StorageCapacityPage from "../Pages/admin/storage/StorageList";
import ProductDetailPage from "../Pages/admin/productdetail/productDetailList";
import VoucherList from "../Pages/admin/voucher/VoucherList";
import VoucherForm from "../Pages/admin/voucher/VoucherForm";
import DiscountList from "../Pages/admin/discount/DiscountList";
import DiscountForm from "../Pages/admin/discount/DiscountForm";

export const AdminRoutes = () => [
  <Route
    key="admin-guard"
    element={<PrivateRoute allowedRoles={["ADMIN"]} loginPath="/admin/login" />}
  >
    {/* Thống kê */}
    <Route path="/statistics" element={<StatisticsPage />} />

    {/* Quản lý Nhân viên */}
    <Route path="/employee" element={<EmployeePage />} />
    <Route path="/employeeAdd" element={<EmployeeForm />} />
    <Route path="/admin/employees/:id" element={<EmployeeForm />} />

    {/* Cấu hình ca làm việc tập trung */}
    <Route path="/shiftManagement" element={<ShiftManagementHub />} />

    {/* Quản lý Sản phẩm & Thuộc tính  */}
    <Route path="/admin/products" element={<ProductPage />} />
    <Route path="/admin/product-categories" element={<ProductCategoryPage />} />
    <Route path="/admin/tech-spec" element={<TechSpecListPage />} />
    <Route path="/serial" element={<SerialPage />} />
    <Route path="/products/color" element={<ColorPage />} />
    <Route
      path="/products/storage-capacity"
      element={<StorageCapacityPage />}
    />
    <Route path="/products/product-detail" element={<ProductDetailPage />} />

    {/* Marketing & Khuyến mãi */}
    <Route path="/voucher" element={<VoucherList />} />
    <Route path="/voucher/create" element={<VoucherForm />} />
    <Route path="/voucher/edit/:id" element={<VoucherForm />} />

    <Route path="/discount" element={<DiscountList />} />
    <Route path="/discount/create" element={<DiscountForm />} />
    <Route path="/discount/edit/:id" element={<DiscountForm />} />
  </Route>,
];

export default AdminRoutes;
