package com.example.datn.repository;

import com.example.datn.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, String> {

    List<ChatMessage> findBySession_SessionIdOrderByCreatedAtAsc(String sessionId);

    List<ChatMessage> findTop10BySession_SessionIdOrderByCreatedAtDesc(String sessionId);
}
