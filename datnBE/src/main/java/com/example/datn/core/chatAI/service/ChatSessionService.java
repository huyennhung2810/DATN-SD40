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
    public void saveMessage(String sessionId, String content, String sender) {
        ChatSession session = sessionRepository.findById(sessionId)
                .orElseGet(() -> sessionRepository.save(
                        ChatSession.builder()
                                .sessionId(sessionId)
                                .isAiActive(true)
                                .createdAt(LocalDateTime.now())
                                .build()
                ));

        ChatMessage message = ChatMessage.builder()
                .session(session)
                .content(content)
                .sender(sender)
                .createdAt(LocalDateTime.now())
                .build();
        messageRepository.save(message);

        // ✅ CHỈ lưu content (chữ thuần), không lưu Object tin nhắn vào đây
        session.setLastMessage(content);
        session.setUpdatedAt(LocalDateTime.now());
        sessionRepository.save(session);
    }

    // Lấy lịch sử tin nhắn để hiển thị khi load lại trang
    public List<ChatMessage> getChatHistory(String sessionId) {
        return messageRepository.findBySession_SessionIdOrderByCreatedAtAsc(sessionId);
    }

    public List<ChatSessionDTO> getAllActiveSessions() {
        return sessionRepository.findAllActiveSessions().stream()
                .map(s -> new ChatSessionDTO(
                        s.getSessionId(),
                        s.getLastMessage(),
                        0,
                        s.isAiActive()
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

    // Cập nhật tin nhắn cuối cùng để nhân viên xem ở danh sách
    public void updateLastMessage(String sessionId, String content) {
        ChatSession session = sessionRepository.findById(sessionId)
                .orElse(ChatSession.builder().sessionId(sessionId).build());
        session.setLastMessage(content);
        session.setUpdatedAt(LocalDateTime.now());
        sessionRepository.save(session);
    }
}
