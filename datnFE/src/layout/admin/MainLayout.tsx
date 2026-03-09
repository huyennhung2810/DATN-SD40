import React from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { Outlet } from "react-router-dom";

const MainLayout: React.FC = () => {
  return (
    <div
      className="admin-layout"
      style={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        backgroundColor: "var(--color-bg-layout)",
      }}
    >
      <Sidebar />

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          overflow: "hidden",
        }}
      >
        <Header />

        <main
          style={{
            flex: 1,
            padding: "var(--spacing-xl)",
            backgroundColor: "var(--color-bg-layout)",
            overflowY: "auto",
            overflowX: "hidden",
          }}
        >
          <div
            style={{
              maxWidth: "1600px",
              margin: "0 auto",
            }}
          >
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
