package com.studypal.backend.controller;

import com.studypal.backend.dto.Dto;
import com.studypal.backend.dto.Dto.*;
import com.studypal.backend.service.ChatService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @PostMapping
    public ResponseEntity<ChatResponse> chat(@RequestBody ChatRequest req) {
        return ResponseEntity.ok(chatService.chat(req));
    }

    @GetMapping("/sessions")
    public ResponseEntity<List<Dto.ChatSessionResponse>> getSessions() {
        return ResponseEntity.ok(chatService.getSessions());
    }

    @GetMapping("/history")
    public ResponseEntity<List<HistoryResponse>> getHistory(
            @RequestParam String subject,
            @RequestParam String chapter) {
        return ResponseEntity.ok(chatService.getHistory(subject, chapter));
    }
}
