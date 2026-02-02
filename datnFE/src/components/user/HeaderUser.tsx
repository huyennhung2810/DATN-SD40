import React, { useEffect, useState } from "react";
import {
  SearchOutlined,
  ShoppingCartOutlined,
  PhoneOutlined,
  UserOutlined,
} from "@ant-design/icons";

const HeaderUser: React.FC = () => {
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Logic fix cứng khi cuộn qua Banner quảng cáo (110px)
      setIsSticky(window.scrollY > 110);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="w-full shadow-sm font-sans">
      {/* TẦNG 1: TOP BANNER - Nhận diện thương hiệu Canon */}
      <div
        className="w-full bg-white border-b overflow-hidden"
        style={{ height: "110px" }}
      >
        <img
          src="/public/image/banner2.webp"
          alt="Canon Promotion"
          className="w-full h-full object-cover"
        />
      </div>

      {/* CỤM STICKY: Tầng 2 & Tầng 3 sẽ dính lên đầu khi scroll */}
      <div
        className={
          isSticky
            ? "fixed top-0 left-0 right-0 z-[1000] shadow-lg animate-fade-down"
            : "relative"
        }
      >
        {/* TẦNG 2: MAIN HEADER (Logo, Search, Action Icons) */}
        <div className="bg-white py-4 px-6 flex items-center justify-between gap-8 border-b">
          {/* Logo area - Hikari Store Branding */}
          <div
            className="flex items-center cursor-pointer min-w-fit group"
            onClick={() => (window.location.href = "/")}
          >
            <img
              src="/public/logo_hikari.png"
              alt="Hikari Logo"
              className="h-12 w-12 object-contain mr-3 transition-transform group-hover:scale-105"
            />
            <div className="border-b-4 border-[#D32F2F]">
              <span className="text-2xl font-black text-[#D32F2F] tracking-tight uppercase">
                Hikari Store
              </span>
            </div>
          </div>

          {/* Thanh tìm kiếm chuyên nghiệp - Tập trung dòng Canon */}
          <form className="hidden lg:flex flex-1 max-w-2xl relative">
            <input
              type="text"
              placeholder="Tìm kiếm máy ảnh Canon, ống kính..."
              className="w-full h-11 px-6 rounded-full border-2 border-[#EA2F38] focus:outline-none focus:ring-1 focus:ring-[#EA2F38] text-sm"
            />
            <button className="absolute right-0 top-0 h-11 w-16 bg-[#EA2F38] rounded-r-full hover:bg-red-700 transition-colors flex items-center justify-center border-none">
              <SearchOutlined className="text-white text-xl" />
            </button>
          </form>

          {/* Nhóm chức năng: Hotline, Tài khoản, Giỏ hàng */}
          <div className="flex items-center gap-4">
            {/* Hotline tư vấn khách hàng */}
            <div className="hidden xl:flex items-center border-2 border-[#EA2F38] rounded-full pl-5 pr-1 py-1 gap-3">
              <div className="text-center leading-none">
                <p className="text-[#EA2F38] text-[10px] font-bold uppercase tracking-wider">
                  Tư vấn Canon
                </p>
                <p className="font-extrabold text-gray-800 text-sm">
                  0979.085.701
                </p>
              </div>
              <div
                className="bg-[#EA2F38] p-2 rounded-full text-white cursor-pointer hover:rotate-12 transition-transform"
                onClick={() => window.open("tel:0979085701")}
              >
                <PhoneOutlined />
              </div>
            </div>

            {/* Icon Tài khoản */}
            <div className="bg-[#EA2F38] p-3 rounded-full text-white cursor-pointer hover:bg-red-700 transition-all shadow-sm">
              <UserOutlined className="text-xl" />
            </div>

            {/* Icon Giỏ hàng kèm Badge số lượng từ Redux */}
            <div
              className="relative bg-[#EA2F38] p-3 rounded-full text-white cursor-pointer hover:bg-red-700 transition-all shadow-sm group"
              onClick={() => (window.location.href = "/gio-hang")}
            >
              <ShoppingCartOutlined className="text-xl" />

              <span className="absolute -top-1 -right-1 bg-white text-[#EA2F38] text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-[#EA2F38] min-w-[20px] text-center shadow-sm"></span>
            </div>
          </div>
        </div>

        {/* TẦNG 3: NAVIGATION BAR (Màu đỏ Canon đặc trưng) */}
        <nav className="bg-[#EA2F38] h-12 flex items-center justify-center">
          <ul className="flex list-none p-0 m-0 gap-2 h-full">
            {[
              { label: "TRANG CHỦ", link: "/" },
              { label: "SẢN PHẨM", link: "/san-pham" },
              { label: "GIỚI THIỆU", link: "/gioi-thieu" },
              { label: "LIÊN HỆ", link: "/lien-he" },
              { label: "TRA CỨU ĐƠN HÀNG", link: "/tra-cuu" },
            ].map((item) => (
              <li key={item.label} className="h-full">
                <a
                  href={item.link}
                  className="text-white no-underline font-bold text-xs uppercase px-6 h-full flex items-center hover:bg-white hover:text-[#EA2F38] transition-all duration-300"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Phần đệm (Spacer) để tránh nội dung bị nhảy khi Header chuyển sang Fixed */}
      {isSticky && <div style={{ height: "158px" }}></div>}
    </header>
  );
};

export default HeaderUser;
