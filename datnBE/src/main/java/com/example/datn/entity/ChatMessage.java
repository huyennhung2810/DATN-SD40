package com.example.datn.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "chat_messages")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    @JsonIgnore
    private ChatSession session;

    @Column(columnDefinition = "TEXT")
    private String content;

    private String sender; // "CUSTOMER", "AI", "STAFF", "SYSTEM"

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}