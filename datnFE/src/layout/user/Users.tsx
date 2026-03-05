import React from "react";
import HeaderUser from "../../components/user/HeaderUser";
import { Outlet } from "react-router-dom";

const UserLayout = () => {
  return (
    // Xóa display: flex để Header và Content xếp chồng dọc tự nhiên
    <div style={{ minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
      {/* 1. Header luôn nằm trên cùng chiếm 100% chiều ngang */}
      <HeaderUser />

      {/* 2. Phần nội dung trang */}
      <main style={{ padding: "20px 0" }}>
        <div className="container">
          {/* Dùng class 'container' của Bootstrap để căn giữa nội dung */}
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default UserLayout;
