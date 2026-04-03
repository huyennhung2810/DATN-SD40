import React, { useState, useEffect, useRef } from "react";
import {
  Layout,
  List,
  Avatar,
  Input,
  Button,
  Badge,
  Typography,
  Card,
  Empty,
  message,
  Space,
  Tag,
} from "antd";
import {
  SendOutlined,
  UserOutlined,
  CustomerServiceOutlined,
  PhoneOutlined,
} from "@ant-design/icons";
import SockJS from "sockjs-client";
import Stomp from "stompjs";
import axiosClient from "../../../api/axiosClient";

const { Sider, Content } = Layout;
const { Text, Title } = Typography;

interface ChatSession {
  sessionId: string;
  lastMessage: string;
  unreadCount: number;
  isAiActive: boolean;
  customerName?: string;
  userId?: string;
  customerImage?: string;
}

function getInitials(name?: string): string {
  if (!name) return "KH";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/** Màu avatar ngẫu nhiên nhưng cố định theo sessionId */
const AVATAR_COLORS = [
  "#f56a00",
  "#7265e6",
  "#ffbf00",
  "#00a2ae",
  "#87d068",
  "#ff4d4f",
  "#1890ff",
];
function avatarColor(sessionId: string): string {
  let hash = 0;
  for (let i = 0; i < sessionId.length; i++)
    hash = sessionId.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

const EmployeeChatPage: React.FC = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState("");

  const stompClientRef = useRef<any>(null);
  const subscriptionRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Khởi tạo: Lấy danh sách session cũ từ DB
  useEffect(() => {
    const fetchActiveSessions = async () => {
      try {
        const res = await axiosClient.get("/support/active-sessions");
        setSessions(res.data);
      } catch (error) {
        console.error("Lỗi lấy danh sách phiên chat:", error);
      }
    };
    fetchActiveSessions();
  }, []);

  //Kết nối WebSocket duy nhất (Global)
  useEffect(() => {
    let reconnectTimeout: NodeJS.Timeout | null = null;
    let socket: any = null;
    let client: any = null;

    const connectWebSocket = () => {
      socket = new SockJS("http://localhost:8386/ws-chat");
      client = Stomp.over(socket);
      client.debug = () => {};

      client.connect(
        {},
        () => {
          stompClientRef.current = client;
          // Lắng nghe thông báo có khách hàng mới cần hỗ trợ
          client.subscribe("/topic/admin/notifications", (payload: any) => {
            try {
              const notif = JSON.parse(payload.body);
              if (notif.type !== "CHAT_REQUEST") return;
              const sessionId: string = notif.refId;
              const customerName: string | undefined =
                notif.refCode || undefined;
              const customerImage: string | undefined =
                notif.customerImage || undefined;
              message.info(notif.message || "Khách hàng đang cần hỗ trợ!");
              setSessions((prev) => {
                if (prev.find((s) => s.sessionId === sessionId)) return prev;
                return [
                  {
                    sessionId,
                    lastMessage: "Đang đợi hỗ trợ...",
                    unreadCount: 1,
                    isAiActive: false,
                    customerName,
                    customerImage,
                  },
                  ...prev,
                ];
              });
            } catch {
              // legacy plain-text fallback
              const sessionId = payload.body;
              setSessions((prev) => {
                if (prev.find((s) => s.sessionId === sessionId)) return prev;
                return [
                  {
                    sessionId,
                    lastMessage: "Đang đợi hỗ trợ...",
                    unreadCount: 1,
                    isAiActive: false,
                  },
                  ...prev,
                ];
              });
            }
          });
        },
        (error: any) => {
          console.error("Lỗi kết nối WebSocket:", error);
          reconnectTimeout = setTimeout(connectWebSocket, 3000);
        },
      );
    };

    connectWebSocket();

    return () => {
      if (stompClientRef.current) stompClientRef.current.disconnect(() => {});
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, []);

  // Xử lý khi nhân viên chọn một khách hàng
  useEffect(() => {
    if (selectedSession && stompClientRef.current) {
      const fetchHistory = async () => {
        try {
          const userId = null;
          const url = userId
            ? `/support/history/${selectedSession}?userId=${userId}`
            : `/support/history/${selectedSession}`;
          const res = await axiosClient.get(url);
          setMessages(Array.isArray(res.data) ? res.data : []);

          setSessions((prev) =>
            prev.map((s) =>
              s.sessionId === selectedSession ? { ...s, unreadCount: 0 } : s,
            ),
          );
        } catch (error) {
          console.error("Lỗi tải lịch sử chat:", error);
          setMessages([]);
        }
      };
      fetchHistory();

      if (subscriptionRef.current) {
        try {
          subscriptionRef.current.unsubscribe();
        } catch (e) {
          console.error("Lỗi hủy subscription cũ:", e);
        }
        subscriptionRef.current = null;
      }

      subscriptionRef.current = stompClientRef.current.subscribe(
        `/topic/messages/${selectedSession}`,
        (payload: any) => {
          const msg = JSON.parse(payload.body);
          setMessages((prev) => [...prev, msg]);
          setSessions((prevS) =>
            prevS.map((s) =>
              s.sessionId === selectedSession
                ? { ...s, lastMessage: msg.content }
                : s,
            ),
          );
        },
      );
    }
  }, [selectedSession]);

  //gửi tn
  const handleSendMessage = () => {
    if (!inputValue.trim() || !selectedSession) return;
    try {
      stompClientRef.current.send(
        `/app/chat.staffReply/${selectedSession}`,
        {},
        inputValue,
      );
      setInputValue("");
    } catch (error) {
      message.error(
        "Không thể gửi tin nhắn. Kết nối máy chủ có thể đã bị mất!",
      );
      console.error("Lỗi gửi tin nhắn qua WebSocket:", error);
    }
  };

  //kết thúc hỗ trợ
  const handleEndSupport = async () => {
    if (!selectedSession) return;
    try {
      await axiosClient.post(
        `/support/end-support?sessionId=${selectedSession}`,
      );

      // Unsubscribe khỏi topic WebSocket của session này
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }

      setSessions((prev) =>
        prev.filter((s) => s.sessionId !== selectedSession),
      );
      setSelectedSession(null);
      setMessages([]);
      message.success("Đã kết thúc hỗ trợ thành công.");
    } catch (error) {
      console.error("Lỗi kết thúc hỗ trợ:", error);
    }
  };

  // Tự động cuộn
  useEffect(() => {
    if (scrollRef.current)
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const activeSession = sessions.find((s) => s.sessionId === selectedSession);
  const displayName = (s: ChatSession) =>
    s.customerName || `Khách #${s.sessionId.slice(-6)}`;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 104px)",
        overflow: "hidden",
      }}
    >
      {/* HEADER CARD */}
      <div
        className="solid-card"
        style={{
          padding: "var(--spacing-lg)",
          marginBottom: 16,
          flexShrink: 0,
        }}
      >
        <Space align="center" size={16}>
          <div
            style={{
              backgroundColor: "var(--color-primary-light)",
              padding: "12px",
              borderRadius: "var(--radius-md)",
            }}
          >
            <CustomerServiceOutlined
              style={{ fontSize: "24px", color: "var(--color-primary)" }}
            />
          </div>

          <div>
            <Title level={4} style={{ margin: 0, fontWeight: 600 }}>
              Hỗ trợ khách hàng (Live Chat)
            </Title>
            <Text type="secondary" style={{ fontSize: "13px" }}>
              Trò chuyện và hỗ trợ khách hàng theo thời gian thực
            </Text>
          </div>
        </Space>
      </div>

      {/* MAIN CHAT */}
      <Layout
        style={{
          flex: 1,
          minHeight: 0,
          background: "#fff",
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        {/* SIDEBAR — danh sách khách */}
        <Sider
          width={300}
          theme="light"
          style={{ borderRight: "1px solid #f0f0f0" }}
        >
          <div
            style={{
              padding: "16px 20px",
              borderBottom: "1px solid #f0f0f0",
              background: "#fafafa",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <CustomerServiceOutlined
              style={{ color: "#ff4d4f", fontSize: 18 }}
            />
            <Title level={5} style={{ margin: 0, color: "#ff4d4f" }}>
              Khách đang chờ ({sessions.length})
            </Title>
          </div>

          {sessions.filter((s) => !s.isAiActive).length === 0 ? (
            <Empty
              description="Chưa có khách hàng"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              style={{ marginTop: 40 }}
            />
          ) : (
            <List
              dataSource={sessions.filter((s) => !s.isAiActive)}
              style={{ overflowY: "auto", height: "calc(100% - 57px)" }}
              renderItem={(item) => {
                const isSelected = selectedSession === item.sessionId;
                const initials = getInitials(item.customerName);
                const color = avatarColor(item.sessionId);
                return (
                  <List.Item
                    onClick={() => setSelectedSession(item.sessionId)}
                    style={{
                      cursor: "pointer",
                      padding: "14px 16px",
                      background: isSelected ? "#fff2f0" : "transparent",
                      borderLeft: isSelected
                        ? "4px solid #ff4d4f"
                        : "4px solid transparent",
                      transition: "background 0.2s",
                    }}
                  >
                    <List.Item.Meta
                      avatar={
                        <Badge count={item.unreadCount} size="small">
                          <Avatar
                            size={44}
                            src={item.customerImage || undefined}
                            style={
                              item.customerImage
                                ? undefined
                                : {
                                    backgroundColor: color,
                                    fontWeight: 600,
                                    fontSize: 16,
                                  }
                            }
                            icon={
                              !item.customerImage && !item.customerName ? (
                                <UserOutlined />
                              ) : undefined
                            }
                          >
                            {!item.customerImage && item.customerName
                              ? initials
                              : undefined}
                          </Avatar>
                        </Badge>
                      }
                      title={
                        <Text strong style={{ fontSize: 14 }}>
                          {displayName(item)}
                        </Text>
                      }
                      description={
                        <Text
                          ellipsis
                          type="secondary"
                          style={{
                            fontSize: 12,
                            maxWidth: 180,
                            display: "block",
                          }}
                        >
                          {item.lastMessage}
                        </Text>
                      }
                    />
                  </List.Item>
                );
              }}
            />
          )}
        </Sider>

        <Content style={{ display: "flex", flexDirection: "column" }}>
          {selectedSession && activeSession ? (
            <>
              {/* HEADER CHAT */}
              <div
                style={{
                  padding: "12px 24px",
                  borderBottom: "1px solid #f0f0f0",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  background: "#fafafa",
                }}
              >
                <Space size={12}>
                  <Avatar
                    size={40}
                    src={activeSession.customerImage || undefined}
                    style={
                      activeSession.customerImage
                        ? undefined
                        : {
                            backgroundColor: avatarColor(
                              activeSession.sessionId,
                            ),
                            fontWeight: 600,
                          }
                    }
                    icon={
                      !activeSession.customerImage &&
                      !activeSession.customerName ? (
                        <UserOutlined />
                      ) : undefined
                    }
                  >
                    {!activeSession.customerImage && activeSession.customerName
                      ? getInitials(activeSession.customerName)
                      : undefined}
                  </Avatar>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>
                      {displayName(activeSession)}
                    </div>
                    <Space size={6}>
                      <Tag color="red" style={{ fontSize: 11, margin: 0 }}>
                        Đang hỗ trợ
                      </Tag>
                      {activeSession.userId && (
                        <Text type="secondary" style={{ fontSize: 11 }}>
                          <PhoneOutlined style={{ marginRight: 3 }} />
                          ID: {activeSession.userId.slice(0, 8)}...
                        </Text>
                      )}
                    </Space>
                  </div>
                </Space>

                {activeSession && !activeSession.isAiActive && (
                  <Button
                    type="primary"
                    danger
                    ghost
                    size="small"
                    onClick={handleEndSupport}
                  >
                    Kết thúc hỗ trợ
                  </Button>
                )}
              </div>

              {/* MESSAGES */}
              <div
                style={{
                  flex: 1,
                  overflowY: "auto",
                  padding: "20px",
                  background: "#f5f5f5",
                }}
                ref={scrollRef}
              >
                {Array.isArray(messages) && messages.length > 0 ? (
                  messages.map((msg, index) => {
                    const isStaff = msg.sender === "STAFF";
                    const isSystem =
                      msg.sender === "SYSTEM" || msg.sender === "AI";
                    if (isSystem) {
                      return (
                        <div
                          key={index}
                          style={{
                            textAlign: "center",
                            color: "#999",
                            fontSize: 12,
                            margin: "8px 0",
                            fontStyle: "italic",
                          }}
                        >
                          {msg.content}
                        </div>
                      );
                    }
                    return (
                      <div
                        key={index}
                        style={{
                          display: "flex",
                          justifyContent: isStaff ? "flex-end" : "flex-start",
                          alignItems: "flex-end",
                          gap: 8,
                          marginBottom: 10,
                        }}
                      >
                        {!isStaff && (
                          <Avatar
                            size={28}
                            src={activeSession.customerImage || undefined}
                            style={
                              activeSession.customerImage
                                ? undefined
                                : {
                                    backgroundColor: avatarColor(
                                      activeSession.sessionId,
                                    ),
                                    flexShrink: 0,
                                  }
                            }
                            icon={
                              !activeSession.customerImage &&
                              !activeSession.customerName ? (
                                <UserOutlined />
                              ) : undefined
                            }
                          >
                            {!activeSession.customerImage &&
                            activeSession.customerName
                              ? getInitials(activeSession.customerName)
                              : undefined}
                          </Avatar>
                        )}
                        <Card
                          size="small"
                          style={{
                            maxWidth: "72%",
                            borderRadius: isStaff
                              ? "16px 16px 4px 16px"
                              : "16px 16px 16px 4px",
                            background: isStaff ? "#ff4d4f" : "#fff",
                            color: isStaff ? "#fff" : "#333",
                            boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                            border: "none",
                          }}
                          styles={{ body: { padding: "8px 14px" } }}
                        >
                          {!isStaff && (
                            <div
                              style={{
                                fontSize: 11,
                                fontWeight: 600,
                                color: "#ff4d4f",
                                marginBottom: 2,
                              }}
                            >
                              {displayName(activeSession)}
                            </div>
                          )}
                          <div style={{ fontSize: 14, lineHeight: 1.5 }}>
                            {msg.content}
                          </div>
                        </Card>
                        {isStaff && (
                          <Avatar
                            size={28}
                            icon={<CustomerServiceOutlined />}
                            style={{
                              backgroundColor: "#ff4d4f",
                              flexShrink: 0,
                            }}
                          />
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div
                    style={{
                      textAlign: "center",
                      color: "#999",
                      marginTop: 60,
                    }}
                  >
                    Chưa có tin nhắn...
                  </div>
                )}
              </div>

              {/* INPUT */}
              <div
                style={{
                  padding: "16px 20px",
                  background: "#fff",
                  borderTop: "1px solid #f0f0f0",
                }}
              >
                <Input
                  size="large"
                  placeholder={`Nhắn tin cho ${displayName(activeSession)}...`}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onPressEnter={handleSendMessage}
                  suffix={
                    <Button
                      type="primary"
                      icon={<SendOutlined />}
                      onClick={handleSendMessage}
                      style={{ background: "#ff4d4f", borderColor: "#ff4d4f" }}
                    />
                  }
                />
              </div>
            </>
          ) : (
            <Empty
              description="Hãy chọn một khách hàng để bắt đầu tư vấn"
              style={{ marginTop: "150px" }}
            />
          )}
        </Content>
      </Layout>
    </div>
  );
};

export default EmployeeChatPage;
