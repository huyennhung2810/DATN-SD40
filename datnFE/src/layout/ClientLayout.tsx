import React from "react";
import ClientHeader from "./ClientHeader";

const ClientLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
      <ClientHeader />
      <main style={{ minHeight: "calc(100vh - 200px)" }}>
        {children}
      </main>
      {/* Footer */}
      <footer
        style={{
          backgroundColor: "#1a1a1a",
          color: "#fff",
          padding: "40px 16px 20px",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: 40,
          }}
        >
          {/* Column 1 - About */}
          <div>
            <h3 style={{ color: "#fff", marginBottom: 16, fontSize: 18 }}>
              Về Hikari Camera
            </h3>
            <p style={{ color: "#999", lineHeight: 1.8, fontSize: 14 }}>
              Hikari Camera là địa chỉ uy tín chuyên cung cấp các sản phẩm máy ảnh
              và linh phụ kiện chính hãng. Chúng tôi cam kết mang đến cho khách hàng
              những sản phẩm chất lượng với giá cả hợp lý nhất.
            </p>
          </div>

          {/* Column 2 - Quick Links */}
          <div>
            <h3 style={{ color: "#fff", marginBottom: 16, fontSize: 18 }}>
              Liên kết nhanh
            </h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              <li style={{ marginBottom: 10 }}>
                <a href="/client" style={{ color: "#999", textDecoration: "none" }}>
                  Trang chủ
                </a>
              </li>
              <li style={{ marginBottom: 10 }}>
                <a href="/client/products" style={{ color: "#999", textDecoration: "none" }}>
                  Sản phẩm
                </a>
              </li>
              <li style={{ marginBottom: 10 }}>
                <a href="/client/about" style={{ color: "#999", textDecoration: "none" }}>
                  Giới thiệu
                </a>
              </li>
              <li style={{ marginBottom: 10 }}>
                <a href="/client/contact" style={{ color: "#999", textDecoration: "none" }}>
                  Liên hệ
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3 - Contact Info */}
          <div>
            <h3 style={{ color: "#fff", marginBottom: 16, fontSize: 18 }}>
              Thông tin liên hệ
            </h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, color: "#999", lineHeight: 2 }}>
              <li>📍 Địa chỉ: Hà Nội, Việt Nam</li>
              <li>📞 Điện thoại: 0123 456 789</li>
              <li>✉️ Email: contact@hikaricamera.com</li>
              <li>🌐 Website: www.hikaricamera.com</li>
            </ul>
          </div>

          {/* Column 4 - Newsletter */}
          <div>
            <h3 style={{ color: "#fff", marginBottom: 16, fontSize: 18 }}>
              Đăng ký nhận tin
            </h3>
            <p style={{ color: "#999", marginBottom: 16, fontSize: 14 }}>
              Nhận thông tin về sản phẩm mới và khuyến mãi hấp dẫn
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                type="email"
                placeholder="Nhập email của bạn"
                style={{
                  flex: 1,
                  padding: "10px 12px",
                  border: "none",
                  borderRadius: 4,
                  outline: "none",
                }}
              />
              <button
                style={{
                  backgroundColor: "#ff4d4f",
                  color: "#fff",
                  border: "none",
                  padding: "10px 16px",
                  borderRadius: 4,
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                Đăng ký
              </button>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div
          style={{
            maxWidth: 1200,
            margin: "40px auto 0",
            paddingTop: 20,
            borderTop: "1px solid #333",
            textAlign: "center",
            color: "#666",
            fontSize: 14,
          }}
        >
          © 2026 Hikari Camera. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default ClientLayout;
