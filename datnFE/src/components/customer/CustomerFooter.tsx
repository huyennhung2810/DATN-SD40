import React from "react";
import { Typography, Space, Divider } from "antd";
import { PhoneOutlined, MailOutlined, EnvironmentOutlined } from "@ant-design/icons";

const { Text, Title, Link } = Typography;

const CustomerFooter: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <Title level={4} className="!text-white !mb-4">
              Về HIKARI Camera
            </Title>
            <Text className="text-gray-400">
              HIKARI Camera - Địa chỉ mua sắm máy ảnh uy tín hàng đầu Việt Nam. 
              Chúng tôi cung cấp đa dạng các sản phẩm máy ảnh, lens và phụ kiện chính hãng.
            </Text>
          </div>

          {/* Quick Links */}
          <div>
            <Title level={4} className="!text-white !mb-4">
              Liên kết nhanh
            </Title>
            <Space direction="vertical" className="!text-gray-400">
              <Link href="/" className="!text-gray-400 hover:!text-red-500">
                Trang chủ
              </Link>
              <Link href="/catalog" className="!text-gray-400 hover:!text-red-500">
                Sản phẩm
              </Link>
              <Link href="/catalog?new=true" className="!text-gray-400 hover:!text-red-500">
                Sản phẩm mới
              </Link>
              <Link href="/contact" className="!text-gray-400 hover:!text-red-500">
                Liên hệ
              </Link>
            </Space>
          </div>

          {/* Categories */}
          <div>
            <Title level={4} className="!text-white !mb-4">
              Danh mục
            </Title>
            <Space direction="vertical" className="!text-gray-400">
              <Link href="/catalog?category=may-anh" className="!text-gray-400 hover:!text-red-500">
                Máy ảnh
              </Link>
              <Link href="/catalog?category=lens" className="!text-gray-400 hover:!text-red-500">
                Ống kính
              </Link>
              <Link href="/catalog?category=phu-kien" className="!text-gray-400 hover:!text-red-500">
                Phụ kiện
              </Link>
            </Space>
          </div>

          {/* Contact */}
          <div>
            <Title level={4} className="!text-white !mb-4">
              Liên hệ
            </Title>
            <Space direction="vertical" className="!text-gray-400">
              <div className="flex items-center gap-2">
                <EnvironmentOutlined />
                <Text className="!text-gray-400">
                  Hoàng Sa, TP.HCM
                </Text>
              </div>
              <div className="flex items-center gap-2">
                <PhoneOutlined />
                <Text className="!text-gray-400">
                  0901 234 567
                </Text>
              </div>
              <div className="flex items-center gap-2">
                <MailOutlined />
                <Text className="!text-gray-400">
                  contact@hikaricamera.vn
                </Text>
              </div>
            </Space>
          </div>
        </div>

        <Divider className="!border-gray-700 my-8" />

        {/* Copyright */}
        <div className="text-center">
          <Text className="text-gray-500">
            © {new Date().getFullYear()} HIKARI Camera. All rights reserved.
          </Text>
        </div>
      </div>
    </footer>
  );
};

export default CustomerFooter;

