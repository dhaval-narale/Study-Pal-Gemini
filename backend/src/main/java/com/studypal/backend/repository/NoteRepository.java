package com.studypal.backend.repository;

import com.studypal.backend.model.Note;
import com.studypal.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NoteRepository extends JpaRepository<Note, Long> {
    List<Note> findByUserOrderByCreatedAtDesc(User user);
    List<Note> findByUserAndSubjectAndChapterOrderByCreatedAtDesc(User user, String subject, String chapter);
}
