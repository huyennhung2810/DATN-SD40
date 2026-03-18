import { Route } from "react-router-dom";
import PrivateRoute from "../components/PrivateRoute";
import StatisticsPage from "./Statistics";
import EmployeePage from "../Pages/admin/employee/EmployeeList";
import EmployeeForm from "../Pages/admin/employee/EmployeeForm";
import AccountList from "../Pages/admin/account/AccountList";
import AccountForm from "../Pages/admin/account/AccountForm";
import ShiftManagementHub from "./ShiftManagementHub";

export const AdminRoutes = () => [
  <Route key="admin-guard" element={<PrivateRoute allowedRoles={["ADMIN"]} />}>
    {/* Thống kê */}
    <Route path="/statistics" element={<StatisticsPage />} />

    {/* Quản lý Nhân viên */}
    <Route path="/employee" element={<EmployeePage />} />
    <Route path="/employeeAdd" element={<EmployeeForm />} />
    <Route path="/admin/employees/:id" element={<EmployeeForm />} />

    {/* Quản lý Tài khoản hệ thống */}
    <Route path="/admin/accounts" element={<AccountList />} />
    <Route path="/admin/accounts/create" element={<AccountForm />} />
    <Route path="/admin/accounts/:id/edit" element={<AccountForm />} />
    <Route path="/admin/accounts/:id" element={<AccountForm />} />

    {/* Cấu hình ca làm việc tập trung */}
    <Route path="/shiftManagement" element={<ShiftManagementHub />} />
  </Route>,
];

export default AdminRoutes;
