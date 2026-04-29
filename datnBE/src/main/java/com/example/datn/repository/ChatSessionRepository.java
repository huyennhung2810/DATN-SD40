package com.example.datn.repository;

import com.example.datn.entity.ChatSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatSessionRepository extends JpaRepository<ChatSession, String> {
    // Tìm các phiên mà nhân viên đang phải hỗ trợ (AI đã tắt)
    List<ChatSession> findByIsAiActiveFalseOrderByUpdatedAtDesc();

    List<ChatSession> findByUserIdOrderByUpdatedAtDesc(String userId);

    // Tìm các phiên cần hiển thị ở Sidebar nhân viên
    @Query("SELECT s FROM ChatSession s WHERE s.lastMessage IS NOT NULL ORDER BY s.updatedAt DESC")
    List<ChatSession> findAllActiveSessions();
}
