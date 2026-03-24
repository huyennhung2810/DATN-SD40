package com.example.datn.infrastructure.config;

import com.example.datn.core.chatAI.service.ChatSessionService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

@Component
@RequiredArgsConstructor
public class WebSocketEventListener {
    private static final Logger logger = LoggerFactory.getLogger(WebSocketEventListener.class);
    private final ChatSessionService chatSessionService;
    private final SimpMessagingTemplate messagingTemplate;

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = (String) headerAccessor.getSessionAttributes().get("sessionId");
        String staffSessionId = (String) headerAccessor.getSessionAttributes().get("staffSessionId");
        // Nếu là nhân viên rời khỏi, fallback về AI
        if (staffSessionId != null) {
            logger.info("Nhân viên rời khỏi session: {}. Fallback về AI.", staffSessionId);
            chatSessionService.endStaffSupport(staffSessionId);
            messagingTemplate.convertAndSend("/topic/messages/" + staffSessionId,
                    com.example.datn.core.chatAI.model.response.ChatResponse.builder()
                            .content("Nhân viên đã rời phòng hỗ trợ. AI Hikari sẽ tiếp tục đồng hành cùng bạn!")
                            .sender("SYSTEM")
                            .build());
        }
    }
}
