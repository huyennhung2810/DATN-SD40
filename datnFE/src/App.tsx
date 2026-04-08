// Mình rút gọn các phần import nhé
import React from "react";
import { Routes, Route, BrowserRouter, Navigate } from "react-router-dom";
import MainLayout from "./layout/admin/MainLayout";
import { AdminRoutes } from "./routes/AdminRoutes";
import { CustomerRoutes } from "./routes/CustomerRoutes";
import { PublicRoutes } from "./routes/PublicRoutes";
import EmployeeRoutes from "./routes/EmployeeRoutes";
import PrivateRoute from "./components/PrivateRoute";

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
        {/* Các trang Login/Register công khai */}
        {PublicRoutes()}

        <Route element={<MainLayout />}>
          <Route
            element={
              <PrivateRoute
                allowedRoles={["ADMIN", "STAFF"]}
                loginPath="/admin/login"
              />
            }
          >
            <Route path="/" element={<HomePage />} />
          </Route>

          {AdminRoutes()}
          {EmployeeRoutes()}
        </Route>

        {/* Trang cho Khách hàng */}
        {CustomerRoutes()}

        {/* Điều hướng linh hoạt */}
        <Route path="/home" element={<Navigate to="/client" replace />} />
        <Route path="*" element={<Navigate to="/403" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
