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
} from "antd";
import {
  SendOutlined,
  UserOutlined,
  CustomerServiceOutlined,
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
            const sessionId = payload.body;
            message.info(`Khách hàng ${sessionId} đang cần hỗ trợ!`);
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

  return (
    <>
      {/* HEADER CARD */}
      <div
        className="solid-card"
        style={{ padding: "var(--spacing-lg)", marginBottom: 16 }}
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
          height: "85vh",
          background: "#fff",
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        <Sider
          width={320}
          theme="light"
          style={{ borderRight: "1px solid #f0f0f0" }}
        >
          <div
            style={{
              padding: "20px",
              borderBottom: "1px solid #f0f0f0",
              background: "#fafafa",
            }}
          >
            <Title level={4} style={{ margin: 0, color: "#ff4d4f" }}>
              <CustomerServiceOutlined /> Khách đang chờ
            </Title>
          </div>

          <List
            dataSource={sessions}
            renderItem={(item) => (
              <List.Item
                onClick={() => setSelectedSession(item.sessionId)}
                style={{
                  cursor: "pointer",
                  padding: "16px",
                  background:
                    selectedSession === item.sessionId
                      ? "#fff2f0"
                      : "transparent",
                  borderLeft:
                    selectedSession === item.sessionId
                      ? "4px solid #ff4d4f"
                      : "none",
                }}
              >
                <List.Item.Meta
                  avatar={
                    <Badge count={item.unreadCount}>
                      <Avatar size="large" icon={<UserOutlined />} />
                    </Badge>
                  }
                  title={<Text strong>{item.sessionId}</Text>}
                  description={
                    <Text ellipsis style={{ width: 200 }}>
                      {item.lastMessage}
                    </Text>
                  }
                />
              </List.Item>
            )}
          />
        </Sider>

        <Content style={{ display: "flex", flexDirection: "column" }}>
          {selectedSession ? (
            <>
              {/* HEADER CHAT */}
              <div
                style={{
                  padding: "16px 24px",
                  borderBottom: "1px solid #f0f0f0",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Title level={5} style={{ margin: 0 }}>
                  Đang hỗ trợ: {selectedSession}
                </Title>

                <Button
                  type="primary"
                  danger
                  ghost
                  size="small"
                  onClick={handleEndSupport}
                >
                  Kết thúc hỗ trợ
                </Button>
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
                {Array.isArray(messages) ? (
                  messages.map((msg, index) => (
                    <div
                      key={index}
                      style={{
                        display: "flex",
                        justifyContent:
                          msg.sender === "STAFF" ? "flex-end" : "flex-start",
                        marginBottom: "12px",
                      }}
                    >
                      <Card
                        size="small"
                        style={{
                          maxWidth: "75%",
                          borderRadius: "15px",
                          background:
                            msg.sender === "STAFF" ? "#ff4d4f" : "#fff",
                          color: msg.sender === "STAFF" ? "#fff" : "#333",
                        }}
                      >
                        {msg.content}
                      </Card>
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: "center", color: "#999" }}>
                    Chưa có tin nhắn...
                  </div>
                )}
              </div>

              {/* INPUT */}
              <div
                style={{
                  padding: "20px",
                  background: "#fff",
                  borderTop: "1px solid #f0f0f0",
                }}
              >
                <Input
                  size="large"
                  placeholder="Nhập nội dung tư vấn..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onPressEnter={handleSendMessage}
                  suffix={
                    <Button
                      type="text"
                      icon={<SendOutlined style={{ color: "#ff4d4f" }} />}
                      onClick={handleSendMessage}
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
    </>
  );
};

export default EmployeeChatPage;
