import React from "react";
import { Outlet } from "react-router-dom";
import ChatWidget from "../../Pages/client/ChatWidget";
import { Header, Footer, TopBar } from "../../components/homepage";

interface CustomerLayoutProps {
  children?: React.ReactNode;
}

const CustomerLayout: React.FC<CustomerLayoutProps> = () => {
  return (
    <div className="customer-layout" style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <TopBar />
      <Header />
      <main className="flex-grow" style={{ flex: 1 }}>
        <Outlet />
      </main>
      <Footer />
      <ChatWidget />
    </div>
  );
};

export default CustomerLayout;
