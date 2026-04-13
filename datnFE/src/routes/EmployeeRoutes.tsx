import { Route } from "react-router-dom";
import PrivateRoute from "../components/PrivateRoute";
import PosPage from "../Pages/admin/pos/PosPage";
import OrderPage from "../Pages/admin/order/OrderList";
import EmployeeChatPage from "../Pages/admin/chat/EmployeeChatPage";
import CustomerPage from "../Pages/admin/customer/CustomerList";
import CustomerForm from "../Pages/admin/customer/CustomerForm";
import ShiftHandoverPage from "../Pages/admin/shiftHandover/ShiftHandoverPage";
import BannerList from "../Pages/admin/banner/BannerList";
import BannerForm from "../Pages/admin/banner/BannerForm";
import OrderDetailPage from "../Pages/admin/order/OrderDetail";
import AdminProfilePage from "../Pages/admin/profile/AdminProfilePage";
import EmployeeWeeklySchedule from "../Pages/admin/workSchedule/EmployeeWeeklySchedule";

export const EmployeeRoutes = () => [
  <Route
    key="staff-guard"
    element={
      <PrivateRoute
        allowedRoles={["ADMIN", "STAFF"]}
        loginPath="/admin/login"
      />
    }
  >
    {/* Nghiệp vụ chính */}
    <Route path="/pos" element={<PosPage />} />
    <Route path="/orders" element={<OrderPage />} />
    <Route path="/admin/orders/:id" element={<OrderDetailPage />} />
    <Route path="/EChatAi" element={<EmployeeChatPage />} />
    <Route path="/shift-handover" element={<ShiftHandoverPage />} />
    <Route path="/weekly-schedule" element={<EmployeeWeeklySchedule />} />

    {/* Quản lý Khách hàng */}
    <Route path="/customer" element={<CustomerPage />} />
    <Route path="/customerAdd" element={<CustomerForm />} />
    <Route path="/admin/customers/:id" element={<CustomerForm />} />

    <Route path="/admin/banners" element={<BannerList />} />
    <Route path="/admin/banners/create" element={<BannerForm />} />
    <Route path="/admin/banners/:id/edit" element={<BannerForm />} />
    <Route path="/admin/banners/:id" element={<BannerForm />} />

    {/* Hồ sơ cá nhân */}
    <Route path="/profile" element={<AdminProfilePage />} />
  </Route>,
];

export default EmployeeRoutes;
