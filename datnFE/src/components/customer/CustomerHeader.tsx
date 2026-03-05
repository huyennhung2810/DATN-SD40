import React, { useState } from "react";
import { Input, Button, Badge, Space, Typography } from "antd";
import { ShoppingCartOutlined, SearchOutlined, UserOutlined, MenuOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Text } = Typography;

interface CustomerHeaderProps {
  onMenuClick?: () => void;
}

const CustomerHeader: React.FC<CustomerHeaderProps> = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState("");

  const handleSearch = (value: string) => {
    console.log("Search:", value);
    // Navigate to catalog with search - use /client path
    navigate(`/client/catalog?q=${encodeURIComponent(value)}`);
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20 gap-4">
          {/* Mobile menu button */}
          <Button
            type="text"
            icon={<MenuOutlined />}
            className="md:hidden"
            onClick={onMenuClick}
          />

          {/* Logo */}
          <div 
            className="flex-shrink-0 cursor-pointer flex items-center gap-2"
            onClick={() => navigate("/client")}
          >
            <img 
              src="/logo_hikari.png" 
              alt="Hikari Camera" 
              className="h-10 md:h-12"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://via.placeholder.com/150x50?text=Hikari";
              }}
            />
            <div className="hidden sm:block">
              <Text strong className="text-red-600 text-lg">HIKARI</Text>
              <br />
              <Text type="secondary" className="text-xs">Camera Store</Text>
            </div>
          </div>

          {/* Search box - desktop */}
          <div className="hidden md:flex flex-1 max-w-xl mx-8">
            <Input.Search
              placeholder="Tìm kiếm sản phẩm..."
              allowClear
              enterButton={<SearchOutlined />}
              size="large"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onSearch={handleSearch}
              className="w-full"
            />
          </div>

          {/* Actions */}
          <Space size="middle" className="flex-shrink-0">
            {/* Mobile search button */}
            <Button 
              type="text" 
              icon={<SearchOutlined />} 
              className="md:hidden"
              onClick={() => navigate("/client/catalog")}
            />

            {/* User */}
            <Button 
              type="text" 
              icon={<UserOutlined />} 
              className="hidden sm:flex"
            >
              <span className="hidden lg:inline">Tài khoản</span>
            </Button>

            {/* Cart */}
            <Badge count={0} showZero={false}>
              <Button 
                type="primary" 
                icon={<ShoppingCartOutlined />}
                className="!bg-red-600 !border-red-600 hover:!bg-red-700 hover:!border-red-700"
              >
                <span className="hidden lg:inline">Giỏ hàng</span>
              </Button>
            </Badge>
          </Space>
        </div>

        {/* Mobile search */}
        <div className="md:hidden pb-3">
          <Input.Search
            placeholder="Tìm kiếm sản phẩm..."
            allowClear
            enterButton
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onSearch={handleSearch}
          />
        </div>
      </div>

      {/* Navigation - desktop */}
      <nav className="hidden md:flex bg-red-600 text-white">
        <div className="container mx-auto px-4">
          <Space size="large" className="h-12">
            <a 
              href="/client" 
              className="text-white hover:text-white hover:opacity-80 font-medium"
            >
              Trang chủ
            </a>
            <a 
              href="/client/catalog" 
              className="text-white hover:text-white hover:opacity-80 font-medium"
            >
              Sản phẩm
            </a>
            <a 
              href="/client/catalog?category=may-anh" 
              className="text-white hover:text-white hover:opacity-80 font-medium"
            >
              Máy ống kính
            </a>
            <a 
              href="/client/catalog?category=kinh-may-anh" 
              className="text-white hover:text-white hover:opacity-80 font-medium"
            >
              Kính lọc
            </a>
            <a 
              href="/client/catalog?category=phu-kien" 
              className="text-white hover:text-white hover:opacity-80 font-medium"
            >
              Phụ kiện
            </a>
            <a 
              href="/client/contact" 
              className="text-white hover:text-white hover:opacity-80 font-medium"
            >
              Liên hệ
            </a>
          </Space>
        </div>
      </nav>
    </header>
  );
};

export default CustomerHeader;

