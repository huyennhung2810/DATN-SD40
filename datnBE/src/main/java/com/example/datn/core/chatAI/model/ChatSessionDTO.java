package com.example.datn.core.chatAI.model;


import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ChatSessionDTO {
    private String sessionId;
    private String lastMessage;
    private int unreadCount;
    private boolean isAiActive;
    private String customerName;
    private String userId;
}
