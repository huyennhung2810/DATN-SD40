package com.example.datn.core.chatAI.service;

import com.example.datn.core.chatAI.model.ChatSessionDTO;
import com.example.datn.entity.ChatMessage;
import com.example.datn.entity.ChatSession;
import com.example.datn.repository.ChatMessageRepository;
import com.example.datn.repository.ChatSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatSessionService {

    private final ChatSessionRepository sessionRepository;

    private final ChatMessageRepository messageRepository;

    @Transactional

        public void saveMessage(String sessionId, String content, String sender, String userId, String customerName) {
        ChatSession session = sessionRepository.findById(sessionId)
            .orElseGet(() -> sessionRepository.save(
                ChatSession.builder()
                    .sessionId(sessionId)
                    .userId(userId)
                    .customerName(customerName)
                    .isAiActive(true)
                    .createdAt(LocalDateTime.now())
                    .build()
            ));
        // Nếu session đã tồn tại nhưng chưa có userId thì cập nhật
        if (session.getUserId() == null && userId != null) {
            session.setUserId(userId);
        }
        if (session.getCustomerName() == null && customerName != null) {
            session.setCustomerName(customerName);
        }

        ChatMessage message = ChatMessage.builder()
                .session(session)
                .content(content)
                .sender(sender)
                .createdAt(LocalDateTime.now())
                .build();
        messageRepository.save(message);

        session.setLastMessage(content);
        session.setUpdatedAt(LocalDateTime.now());
        sessionRepository.save(session);
    }


    // Lấy lịch sử tin nhắn cho user (nếu có userId, ưu tiên lấy sessionId đúng user)
    public List<ChatMessage> getChatHistory(String sessionId, String userId) {
        if (userId != null && !userId.isEmpty()) {
            // Tìm session đúng userId
            List<ChatSession> sessions = sessionRepository.findByUserIdOrderByUpdatedAtDesc(userId);
            if (!sessions.isEmpty()) {
                // Ưu tiên sessionId truyền vào nếu đúng user, nếu không lấy session mới nhất
                ChatSession session = sessions.stream().filter(s -> s.getSessionId().equals(sessionId)).findFirst().orElse(sessions.get(0));
                return messageRepository.findBySession_SessionIdOrderByCreatedAtAsc(session.getSessionId());
            }
        }
        // Fallback: lấy theo sessionId cũ
        return messageRepository.findBySession_SessionIdOrderByCreatedAtAsc(sessionId);
    }

    public List<ChatSessionDTO> getAllActiveSessions() {
        return sessionRepository.findAllActiveSessions().stream()
                .map(s -> new ChatSessionDTO(
                        s.getSessionId(),
                        s.getLastMessage(),
                        0,
                        s.isAiActive(),
                        s.getCustomerName(),
                        s.getUserId()
                ))
                .collect(Collectors.toList());
    }

    @Transactional
    public void endStaffSupport(String sessionId) {
        sessionRepository.findById(sessionId).ifPresent(s -> {
            s.setAiActive(true); // Bật lại AI
            s.setUpdatedAt(LocalDateTime.now());
            sessionRepository.save(s);
        });
    }

    public boolean checkIfStaffHandling(String sessionId) {
        return sessionRepository.findById(sessionId)
                .map(s -> !s.isAiActive())
                .orElse(false);
    }

    public void markSessionForStaff(String sessionId) {
        ChatSession session = sessionRepository.findById(sessionId)
                .orElse(ChatSession.builder().sessionId(sessionId).build());
        session.setAiActive(false);
        session.setUpdatedAt(LocalDateTime.now());
        sessionRepository.save(session);
    }

    // Cập nhật tên khách hàng cho session
    @Transactional
    public void updateCustomerName(String sessionId, String customerName) {
        sessionRepository.findById(sessionId).ifPresent(s -> {
            if (s.getCustomerName() == null || s.getCustomerName().isBlank()) {
                s.setCustomerName(customerName);
                sessionRepository.save(s);
            }
        });
    }

    // Cập nhật tin nhắn cuối cùng để nhân viên xem ở danh sách
    public void updateLastMessage(String sessionId, String content) {
        ChatSession session = sessionRepository.findById(sessionId)
                .orElse(ChatSession.builder().sessionId(sessionId).build());
        session.setLastMessage(content);
        session.setUpdatedAt(LocalDateTime.now());
        sessionRepository.save(session);
    }
}
