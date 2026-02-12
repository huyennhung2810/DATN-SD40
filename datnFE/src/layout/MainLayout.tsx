import React from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div
      style={{
        display: "flex",
        height: "97vh",
        overflow: "hidden",
      }}
    >
      <Sidebar />
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
        }}
      >
        <Header />
        <main
          style={{
            flex: 1,
            padding: "15px",
            backgroundColor: "#f5f5f5",
            overflowY: "auto",
            overflowX: "hidden",
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
