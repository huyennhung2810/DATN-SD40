import { useEffect, useRef } from "react";
import SockJS from "sockjs-client";
import { over, Client } from "stompjs";
import { useDispatch } from "react-redux";
import { receiveMessage } from "../redux/chat/chatSlice";

export const useWebSocket = (sessionId: string) => {
  const dispatch = useDispatch();
  const stompClientRef = useRef<Client | null>(null);

  useEffect(() => {
    if (!sessionId) return;

    // ✅ Kiểm tra kỹ hơn: nếu là chuỗi "undefined" hoặc rỗng thì lấy port 8386
    let serverUrl = import.meta.env.VITE_BASE_URL_SERVER;
    
    if (!serverUrl || serverUrl === "undefined" || serverUrl === "") {
      serverUrl = "http://localhost:8386";
    }

    const socketUrl = `${serverUrl.replace(/\/$/, "")}/ws-chat`;
    console.log("🚀 Đang kết nối tới:", socketUrl);

    const socket = new SockJS(socketUrl);
    const client = over(socket);
    
    client.debug = () => {}; // Tắt log linh tinh

    client.connect({}, () => {
      console.log("✅ Kết nối thành công tới Backend!");
      stompClientRef.current = client;
      client.subscribe(`/topic/messages/${sessionId}`, (payload) => {
        const message = JSON.parse(payload.body);
        if (message.sender === "STAFF" || message.sender === "SYSTEM") {
          dispatch(receiveMessage(message));
        }
      });
    }, (error) => {
      console.error("❌ Lỗi kết nối Socket:", error);
    });

    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.disconnect(() => {
    console.log("Đã ngắt kết nối an toàn.");
});
      }
    };
  }, [sessionId, dispatch]);

  return stompClientRef;
};