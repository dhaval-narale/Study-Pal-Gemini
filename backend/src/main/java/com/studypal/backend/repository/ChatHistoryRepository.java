package com.studypal.backend.repository;

import com.studypal.backend.model.ChatHistory;
import com.studypal.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ChatHistoryRepository extends JpaRepository<ChatHistory, Long> {
    List<ChatHistory> findByUserAndSubjectAndChapterOrderByCreatedAtAsc(User user, String subject, String chapter);
    List<ChatHistory> findByUserOrderByCreatedAtDesc(User user);

    @org.springframework.data.jpa.repository.Query(
        "SELECT DISTINCT new com.studypal.backend.dto.Dto$ChatSessionResponse(h.subject, h.chapter, MAX(h.createdAt)) " +
        "FROM ChatHistory h WHERE h.user = :user GROUP BY h.subject, h.chapter ORDER BY MAX(h.createdAt) DESC")
    List<com.studypal.backend.dto.Dto.ChatSessionResponse> findDistinctSessionsByUser(@org.springframework.data.repository.query.Param("user") User user);
}
