package com.example.datn.infrastructure.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Topic để Server đẩy tin nhắn xuống (Client sẽ subscribe ở đây)
        config.enableSimpleBroker("/topic");
        // Tiền tố cho các tin nhắn từ Client gửi lên Server
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Điểm kết nối WebSocket (Dùng SockJS để hỗ trợ các trình duyệt cũ)
        registry.addEndpoint("/ws-chat").setAllowedOrigins("http://localhost:6688").withSockJS();
    }

}
