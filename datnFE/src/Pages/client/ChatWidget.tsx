import React, { useState, useEffect, useRef } from "react";
import { Button, Card, Input, Badge, Typography, Avatar } from "antd";
import {
  MessageFilled,
  CloseOutlined,
  SendOutlined,
  RobotOutlined,
  UserOutlined,
  CustomerServiceOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  requestStaff,
  sendMessageRequest,
  setMessages,
} from "../../redux/chat/chatSlice";
import { useWebSocket } from "../../app/useWebSocket";
import { clearMessages } from "../../redux/chat/chatSlice";
import axiosClient from "../../api/axiosClient";

const { Text } = Typography;

import type { RootState } from "../../redux/store";
import type { ChatMessage } from "../../models/chat";

const styles: Record<string, React.CSSProperties> = {
  container: { position: "fixed", bottom: "30px", right: "30px", zIndex: 1000 },
  floatBtn: {
    width: "60px",
    height: "60px",
    fontSize: "24px",
    backgroundColor: "#ff4d4f",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "none",
  },
  window: {
    width: "380px",
    height: "550px",
    display: "flex",
    flexDirection: "column",
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow: "0 12px 48px rgba(0,0,0,0.15)",
    border: "none",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#ff4d4f",
    padding: "12px 20px",
    color: "#fff",
  },
  messageList: {
    flex: 1,
    overflowY: "auto",
    padding: "16px",
    backgroundColor: "#f9f9f9",
    display: "flex",
    flexDirection: "column",
  },
  inputArea: {
    padding: "12px",
    borderTop: "1px solid #eee",
    backgroundColor: "#fff",
  },
  bubble: {
    maxWidth: "85%",
    padding: "10px 14px",
    borderRadius: "15px",
    marginBottom: "4px",
    fontSize: "14px",
    lineHeight: "1.5",
    position: "relative",
  },
  systemMsg: {
    textAlign: "center",
    margin: "12px 0",
    fontSize: "12px",
    color: "#999",
    fontStyle: "italic",
  },
};

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch();

  // 3. Lấy dữ liệu từ Redux Store

  const { messages, loading, sessionId } = useSelector(
    (state: RootState) => state.chat,
  );
  const userId = useSelector((state: RootState) => state.auth.user?.userId);
  const customerName = useSelector(
    (state: RootState) => state.auth.user?.fullName,
  );
  const customerImage = useSelector(
    (state: RootState) => state.auth.user?.pictureUrl ?? state.auth.user?.image,
  );

  // Kích hoạt kết nối WebSocket
  const wsRef = useWebSocket(sessionId);

  // Khi userId hoặc sessionId thay đổi (đăng nhập/đăng xuất), reset chat state và disconnect websocket
  useEffect(() => {
    dispatch(clearMessages());
    // Nếu có thể, disconnect websocket cũ
    if (wsRef && wsRef.current) {
      wsRef.current.disconnect?.(() => {
        console.log("Đã ngắt kết nối WebSocket khi đổi user/session.");
      });
    }
  }, [userId, sessionId]);

  // 4. Logic: Tự động tải lịch sử chat
  useEffect(() => {
    const loadHistory = async () => {
      if (isOpen && sessionId && userId) {
        try {
          const response = await axiosClient.get(
            `/support/history/${sessionId}?userId=${userId}`,
          );
          dispatch(setMessages(response.data));
        } catch (error) {
          console.error("Không thể tải lịch sử chat:", error);
        }
      }
    };
    loadHistory();
  }, [isOpen, sessionId, userId, dispatch]);

  // 5. Logic: Tự động cuộn xuống tin nhắn mới nhất
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading, isOpen]); // Thêm isOpen để cuộn xuống khi vừa mở chat

  const handleSend = async () => {
    if (!inputValue.trim() || loading) return;
    try {
      dispatch(
        sendMessageRequest({
          content: inputValue,
          sessionId,
          userId,
          customerName: customerName ?? undefined,
        }),
      );
      setInputValue("");
    } catch (error) {
      console.error("Lỗi gửi tin nhắn:", error);
    }
  };

  const handleRequestStaff = () => {
    dispatch(
      requestStaff({
        sessionId,
        userId,
        customerName: customerName ?? undefined,
        customerImage: customerImage ?? undefined,
      }),
    );
  };

  return (
    <div style={styles.container}>
      {/* Nút bong bóng Chat */}
      {!isOpen && (
        <Badge dot={loading}>
          <Button
            type="primary"
            shape="circle"
            icon={<MessageFilled />}
            style={styles.floatBtn}
            onClick={() => setIsOpen(true)}
          />
        </Badge>
      )}

      {/* Cửa sổ Chat chính */}
      {isOpen && (
        <Card
          style={styles.window}
          title={
            <div style={styles.header}>
              <div
                style={{ display: "flex", alignItems: "center", gap: "5px" }}
              >
                <Badge status="processing" color="#52c41a" />
                <Text strong style={{ color: "#fff" }}>
                  Hikari Camera Support
                </Text>
              </div>
              <CloseOutlined
                onClick={() => setIsOpen(false)}
                style={{ cursor: "pointer" }}
              />
            </div>
          }
          headStyle={{ padding: 0, border: "none" }}
          bodyStyle={{
            padding: 0,
            display: "flex",
            flexDirection: "column",
            flex: 1,
            minHeight: 0, // BẮT BUỘC để Flexbox con có thể scroll được
          }}
        >
          {/* Nút chuyển sang nhân viên */}
          <div
            style={{
              padding: "8px 16px",
              background: "#fff2f0",
              textAlign: "center",
              borderBottom: "1px solid #ffd8d3",
            }}
          >
            <Button
              type="link"
              size="small"
              danger
              icon={<CustomerServiceOutlined />}
              onClick={handleRequestStaff}
              style={{ fontSize: "12px" }}
            >
              Bạn cần gặp nhân viên hỗ trợ?
            </Button>
          </div>

          {/* Danh sách tin nhắn */}
          <div style={styles.messageList}>
            {messages.map((item: ChatMessage, index: number) => {
              const isCustomer = item.sender === "CUSTOMER";
              const isSystem = item.sender === "SYSTEM";
              if (isSystem) {
                return (
                  <div
                    key={item.sessionId + "-" + index}
                    style={styles.systemMsg as React.CSSProperties}
                  >
                    {item.content}
                  </div>
                );
              }
              return (
                <div
                  key={item.sessionId + "-" + index}
                  style={{
                    display: "flex",
                    justifyContent: isCustomer ? "flex-end" : "flex-start",
                    marginBottom: "12px",
                    alignItems: "flex-end",
                  }}
                >
                  {!isCustomer && (
                    <div style={{ marginRight: 8, marginBottom: 4 }}>
                      {item.sender === "AI" ? (
                        <RobotOutlined
                          style={{ fontSize: 22, color: "#ff4d4f" }}
                        />
                      ) : (
                        <Avatar
                          size="small"
                          icon={<UserOutlined />}
                          style={{ backgroundColor: "#1890ff" }}
                        />
                      )}
                    </div>
                  )}
                  <div
                    style={{
                      ...styles.bubble,
                      backgroundColor: isCustomer ? "#ff4d4f" : "#fff",
                      color: isCustomer ? "#fff" : "#333",
                      borderBottomRightRadius: isCustomer ? "2px" : "15px",
                      borderBottomLeftRadius: isCustomer ? "15px" : "2px",
                      boxShadow: isCustomer
                        ? "none"
                        : "0 2px 6px rgba(0,0,0,0.06)",
                    }}
                  >
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {item.content}
                    </ReactMarkdown>
                  </div>
                </div>
              );
            })}

            {/* Hiệu ứng loading */}
            {loading && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginLeft: "30px",
                }}
              >
                <Text type="secondary" italic style={{ fontSize: "12px" }}>
                  Hikari AI đang tìm máy ảnh...
                </Text>
              </div>
            )}

            {/* THẺ DIV ẨN ĐỂ LÀM MỤC TIÊU CUỘN (SCROLL ANCHOR) */}
            <div ref={scrollRef} />
          </div>

          {/* Ô nhập liệu */}
          <div style={styles.inputArea}>
            <Input
              placeholder="Hỏi về Canon EOS, giá lens..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onPressEnter={handleSend}
              disabled={loading}
              suffix={
                <Button
                  type="text"
                  icon={
                    <SendOutlined
                      style={{
                        color: loading ? "#ccc" : "#ff4d4f",
                        fontSize: "18px",
                      }}
                    />
                  }
                  onClick={handleSend}
                />
              }
              style={{ borderRadius: "20px", padding: "8px 16px" }}
            />
          </div>
        </Card>
      )}
    </div>
  );
};

export default ChatWidget;
