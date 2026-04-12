package com.studypal.backend.service;

import com.studypal.backend.dto.Dto.*;
import com.studypal.backend.model.Note;
import com.studypal.backend.model.User;
import com.studypal.backend.repository.NoteRepository;
import com.studypal.backend.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NoteService {

    private final NoteRepository noteRepository;
    private final UserRepository userRepository;

    public NoteService(NoteRepository noteRepository, UserRepository userRepository) {
        this.noteRepository = noteRepository;
        this.userRepository = userRepository;
    }

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username).orElseThrow();
    }

    public NoteResponse saveNote(NoteRequest req) {
        User user = getCurrentUser();
        Note note = new Note();
        note.setUser(user);
        note.setSubject(req.getSubject());
        note.setChapter(req.getChapter());
        note.setTitle(req.getTitle());
        note.setContent(req.getContent());
        noteRepository.save(note);
        return toResponse(note);
    }

    public List<NoteResponse> getAllNotes() {
        return noteRepository.findByUserOrderByCreatedAtDesc(getCurrentUser())
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<NoteResponse> getNotesByChapter(String subject, String chapter) {
        return noteRepository.findByUserAndSubjectAndChapterOrderByCreatedAtDesc(getCurrentUser(), subject, chapter)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public NoteResponse updateNote(Long id, NoteRequest req) {
        Note note = noteRepository.findById(id).orElseThrow();
        note.setTitle(req.getTitle());
        note.setContent(req.getContent());
        noteRepository.save(note);
        return toResponse(note);
    }

    public void deleteNote(Long id) {
        noteRepository.deleteById(id);
    }

    private NoteResponse toResponse(Note note) {
        NoteResponse res = new NoteResponse();
        res.setId(note.getId());
        res.setSubject(note.getSubject());
        res.setChapter(note.getChapter());
        res.setTitle(note.getTitle());
        res.setContent(note.getContent());
        res.setCreatedAt(note.getCreatedAt().toString());
        return res;
    }
}
