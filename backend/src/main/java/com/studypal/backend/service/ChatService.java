package com.studypal.backend.service;

import com.studypal.backend.dto.Dto;
import com.studypal.backend.dto.Dto.*;
import com.studypal.backend.model.ChatHistory;
import com.studypal.backend.model.User;
import com.studypal.backend.repository.ChatHistoryRepository;
import com.studypal.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ChatService {

    private final ChatHistoryRepository chatHistoryRepository;
    private final UserRepository userRepository;
    private final RestTemplate restTemplate;

    @Value("${ai.service.url}")
    private String aiServiceUrl;

    public ChatService(ChatHistoryRepository chatHistoryRepository,
                       UserRepository userRepository,
                       RestTemplate restTemplate) {
        this.chatHistoryRepository = chatHistoryRepository;
        this.userRepository = userRepository;
        this.restTemplate = restTemplate;
    }

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username).orElseThrow();
    }

    public ChatResponse chat(ChatRequest req) {
        User user = getCurrentUser();

        List<ChatHistory> dbHistory = chatHistoryRepository
                .findByUserAndSubjectAndChapterOrderByCreatedAtAsc(user, req.getSubject(), req.getChapter());

        List<ChatMessage> history = dbHistory.stream().map(h -> {
            ChatMessage msg = new ChatMessage();
            msg.setRole(h.getRole());
            msg.setContent(h.getMessage());
            return msg;
        }).collect(Collectors.toList());

        req.setHistory(history);

        ChatResponse aiResponse = restTemplate.postForObject(
                aiServiceUrl + "/chat", req, ChatResponse.class);

        saveMessage(user, req.getSubject(), req.getChapter(), "user", req.getQuestion());
        saveMessage(user, req.getSubject(), req.getChapter(), "model", aiResponse.getAnswer());

        return aiResponse;
    }

    private void saveMessage(User user, String subject, String chapter, String role, String message) {
        ChatHistory history = new ChatHistory();
        history.setUser(user);
        history.setSubject(subject);
        history.setChapter(chapter);
        history.setRole(role);
        history.setMessage(message);
        chatHistoryRepository.save(history);
    }

    public List<Dto.ChatSessionResponse> getSessions() {
        return chatHistoryRepository.findDistinctSessionsByUser(getCurrentUser());
    }

    public List<HistoryResponse> getHistory(String subject, String chapter) {
        User user = getCurrentUser();
        return chatHistoryRepository
                .findByUserAndSubjectAndChapterOrderByCreatedAtAsc(user, subject, chapter)
                .stream().map(h -> {
                    HistoryResponse res = new HistoryResponse();
                    res.setId(h.getId());
                    res.setSubject(h.getSubject());
                    res.setChapter(h.getChapter());
                    res.setRole(h.getRole());
                    res.setMessage(h.getMessage());
                    res.setCreatedAt(h.getCreatedAt().toString());
                    return res;
                }).collect(Collectors.toList());
    }
}
