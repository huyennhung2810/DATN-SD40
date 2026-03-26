package com.example.datn.core.chatAI.controller;

import com.example.datn.core.chatAI.model.ChatSessionDTO;
import com.example.datn.core.chatAI.model.request.ChatRequest;
import com.example.datn.core.chatAI.model.response.ChatResponse;
import com.example.datn.core.chatAI.service.ChatSessionService;
import com.example.datn.core.chatAI.service.GeminiService;
import com.example.datn.entity.ChatMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/support")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:6688", "http://localhost:5173", "http://localhost:3000"})
public class ChatController {

    private final GeminiService geminiService;
    private final ChatSessionService sessionService;
    private final SimpMessagingTemplate messagingTemplate;

    // kh gửi tn
    @PostMapping("/chat")

    public ResponseEntity<ChatResponse> handleCustomerChat(@RequestBody ChatRequest request) {
        String sessionId = request.getSessionId();
        String messageContent = request.getMessage();
        String userId = request.getUserId();
        String customerName = request.getCustomerName();

        // Lưu tin nhắn của khách vào Database
        sessionService.saveMessage(sessionId, messageContent, "CUSTOMER", userId, customerName);

        // NHÂN VIÊN ĐANG TRỰC
        if (sessionService.checkIfStaffHandling(sessionId)) {
            ChatResponse forwardMsg = ChatResponse.builder()
                    .content(messageContent)
                    .sender("CUSTOMER")
                    .timestamp(LocalDateTime.now())
                    .build();

            // Đẩy tin nhắn lên Topic để Dashboard nhân viên nhận được real-time
            messagingTemplate.convertAndSend("/topic/messages/" + sessionId, forwardMsg);

            return ResponseEntity.ok(ChatResponse.builder()
                    .content("Đang kết nối với nhân viên hỗ trợ...")
                    .sender("SYSTEM")
                    .timestamp(LocalDateTime.now())
                    .build());
        }

        // AI TRỰC (Dùng Gemini RAG tư vấn máy ảnh)
        String aiReply = geminiService.getChatResponse(messageContent, sessionId);
        sessionService.saveMessage(sessionId, aiReply, "AI", userId, null);

        return ResponseEntity.ok(ChatResponse.builder()
                .content(aiReply)
                .sender("AI")
                .timestamp(LocalDateTime.now())
                .build());
    }

    // nv trả lời
    @MessageMapping("/chat.staffReply/{sessionId}")
    public void handleStaffReply(@DestinationVariable String sessionId, String content) {
        // Lưu tin nhắn của nhân viên vào DB
        sessionService.saveMessage(sessionId, content, "STAFF", null, null);

        // Gửi xuống cho Khách hàng qua WebSocket topic chung
        messagingTemplate.convertAndSend("/topic/messages/" + sessionId,
                ChatResponse.builder()
                        .content(content)
                        .sender("STAFF")
                        .timestamp(LocalDateTime.now())
                        .build());
    }

    // lấy ls chat
    @GetMapping("/history/{sessionId}")
    public ResponseEntity<List<ChatMessage>> getHistory(@PathVariable String sessionId,
            @RequestParam(required = false) String userId) {
        return ResponseEntity.ok(sessionService.getChatHistory(sessionId, userId));
    }

    // y cầu nvien
    @PostMapping("/request-staff")
    public ResponseEntity<Void> requestStaff(@RequestParam String sessionId,
                                             @RequestParam(required = false) String customerName) {
        sessionService.markSessionForStaff(sessionId);

        // Cập nhật tên khách hàng vào session nếu có
        if (customerName != null && !customerName.isBlank()) {
            sessionService.updateCustomerName(sessionId, customerName);
        }

        // Bắn thông báo JSON cho Dashboard Admin/Staff biết có khách đang đợi
        Map<String, Object> notif = new HashMap<>();
        notif.put("type", "CHAT_REQUEST");
        notif.put("title", "Yêu cầu hỗ trợ mới");
        notif.put("message", (customerName != null && !customerName.isBlank())
                ? customerName + " đang cần hỗ trợ trực tiếp!"
                : "Khách hàng đang cần hỗ trợ trực tiếp!");
        notif.put("refId", sessionId);
        notif.put("refCode", customerName);
        notif.put("timestamp", System.currentTimeMillis());
        messagingTemplate.convertAndSend("/topic/admin/notifications", notif);

        return ResponseEntity.ok().build();
    }

    // kết thúc sp
    @PostMapping("/end-support")
    public ResponseEntity<Void> endSupport(@RequestParam String sessionId) {
        sessionService.endStaffSupport(sessionId);

        messagingTemplate.convertAndSend("/topic/messages/" + sessionId,
                ChatResponse.builder()
                        .content("Nhân viên đã rời phòng hỗ trợ. AI Hikari sẽ tiếp tục đồng hành cùng bạn!")
                        .sender("SYSTEM")
                        .timestamp(LocalDateTime.now())
                        .build());

        return ResponseEntity.ok().build();
    }

    // lấy ds phiên đang chowf
    @GetMapping("/active-sessions")
    public ResponseEntity<List<ChatSessionDTO>> getActiveSessions() {
        return ResponseEntity.ok(sessionService.getAllActiveSessions());
    }
}