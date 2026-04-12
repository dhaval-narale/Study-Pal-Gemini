package com.studypal.backend.controller;

import com.studypal.backend.dto.Dto.*;
import com.studypal.backend.service.NoteService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notes")
public class NoteController {

    private final NoteService noteService;

    public NoteController(NoteService noteService) {
        this.noteService = noteService;
    }

    @PostMapping
    public ResponseEntity<NoteResponse> saveNote(@RequestBody NoteRequest req) {
        return ResponseEntity.ok(noteService.saveNote(req));
    }

    @GetMapping
    public ResponseEntity<List<NoteResponse>> getAllNotes() {
        return ResponseEntity.ok(noteService.getAllNotes());
    }

    @GetMapping("/chapter")
    public ResponseEntity<List<NoteResponse>> getNotesByChapter(
            @RequestParam String subject, @RequestParam String chapter) {
        return ResponseEntity.ok(noteService.getNotesByChapter(subject, chapter));
    }

    @PutMapping("/{id}")
    public ResponseEntity<NoteResponse> updateNote(@PathVariable Long id, @RequestBody NoteRequest req) {
        return ResponseEntity.ok(noteService.updateNote(id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNote(@PathVariable Long id) {
        noteService.deleteNote(id);
        return ResponseEntity.noContent().build();
    }
}
