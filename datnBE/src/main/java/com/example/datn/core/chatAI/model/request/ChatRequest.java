package com.example.datn.core.chatAI.model.request;

import lombok.Data;

@Data
public class ChatRequest {
    private String message;
    private String sessionId; // dùng để định danh cuộc hội thoại
    private String userId; // phân biệt user
}
