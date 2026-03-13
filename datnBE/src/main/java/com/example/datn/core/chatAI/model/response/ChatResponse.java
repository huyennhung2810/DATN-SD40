package com.example.datn.core.chatAI.model.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ChatResponse {
    private String content;
    private String sender;   //AI hoặc nhân viên
    private LocalDateTime timestamp;
}
