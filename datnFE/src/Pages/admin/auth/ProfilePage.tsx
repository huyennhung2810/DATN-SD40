import React from "react";
import { useSelector } from "react-redux";
import { Card, Avatar, Typography, Descriptions, Tag, Row, Col } from "antd";
import { UserOutlined, MailOutlined, PhoneOutlined, IdcardOutlined, CalendarOutlined, SafetyOutlined } from "@ant-design/icons";
import type { RootState } from "../../redux/store";

const { Title, Text } = Typography;

const ProfilePage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  const getRoleName = (role?: string | null): string => {
    if (!role) return "Nhân viên";
    switch (role) {
      case "ADMIN":
        return "Quản trị viên";
      case "STAFF":
        return "Nhân viên";
      case "CUSTOMER":
        return "Khách hàng";
      default:
        return "Nhân viên";
    }
  };

  const getRoleColor = (role?: string | null): string => {
    if (!role) return "default";
    switch (role) {
      case "ADMIN":
        return "red";
      case "STAFF":
        return "blue";
      case "CUSTOMER":
        return "green";
      default:
        return "default";
    }
  };

  return (
    <div style={{ padding: "0" }}>
      <Row gutter={24}>
        <Col xs={24} lg={8}>
          <Card style={{ textAlign: "center" }}>
            <div style={{ marginBottom: 24 }}>
              <Avatar
                size={120}
                src={user?.employeeImage}
                icon={!user?.employeeImage && <UserOutlined />}
                style={{
                  background: "linear-gradient(135deg, #0A84FF 0%, #0066CC 100%)",
                }}
              />
            </div>
            <Title level={3} style={{ marginBottom: 8 }}>
              {user?.name || "Chưa cập nhật"}
            </Title>
            <Tag color={getRoleColor(user?.role)} style={{ marginBottom: 16 }}>
              {getRoleName(user?.role)}
            </Tag>
            <Text type="secondary">
              {user?.code ? `Mã nhân viên: ${user.code}` : ""}
            </Text>
          </Card>
        </Col>
        <Col xs={24} lg={16}>
          <Card>
            <Title level={4} style={{ marginBottom: 24 }}>
              Thông tin cá nhân
            </Title>
            <Descriptions column={{ xs: 1, sm: 2 }} bordered>
              <Descriptions.Item label={<><IdcardOutlined /> Tên đăng nhập</>}>
                {user?.username || "Chưa cập nhật"}
              </Descriptions.Item>
              <Descriptions.Item label={<><UserOutlined /> Họ và tên</>}>
                {user?.name || "Chưa cập nhật"}
              </Descriptions.Item>
              <Descriptions.Item label={<><MailOutlined /> Email</>}>
                {user?.email || "Chưa cập nhật"}
              </Descriptions.Item>
              <Descriptions.Item label={<><PhoneOutlined /> Số điện thoại</>}>
                {user?.phoneNumber || "Chưa cập nhật"}
              </Descriptions.Item>
              <Descriptions.Item label={<><SafetyOutlined /> Vai trò</>}>
                <Tag color={getRoleColor(user?.role)}>
                  {getRoleName(user?.role)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={user?.status === "ACTIVE" ? "success" : "default"}>
                  {user?.status === "ACTIVE" ? "Hoạt động" : "Không hoạt động"}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ProfilePage;
