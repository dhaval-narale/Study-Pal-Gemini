package com.studypal.backend.repository;

import com.studypal.backend.model.QuizResult;
import com.studypal.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface QuizResultRepository extends JpaRepository<QuizResult, Long> {
    List<QuizResult> findByUserOrderByCreatedAtDesc(User user);
}
