package com.studypal.backend.dto;

import java.util.List;

public class Dto {

    public static class RegisterRequest {
        private String username;
        private String email;
        private String password;
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class LoginRequest {
        private String username;
        private String password;
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class AuthResponse {
        private String token;
        private String username;
        public AuthResponse(String token, String username) {
            this.token = token;
            this.username = username;
        }
        public String getToken() { return token; }
        public String getUsername() { return username; }
    }

    public static class ChatMessage {
        private String role;
        private String content;
        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
    }

    public static class ChatRequest {
        private String subject;
        private String chapter;
        private List<ChatMessage> history;
        private String question;
        public String getSubject() { return subject; }
        public void setSubject(String subject) { this.subject = subject; }
        public String getChapter() { return chapter; }
        public void setChapter(String chapter) { this.chapter = chapter; }
        public List<ChatMessage> getHistory() { return history; }
        public void setHistory(List<ChatMessage> history) { this.history = history; }
        public String getQuestion() { return question; }
        public void setQuestion(String question) { this.question = question; }
    }

    public static class ChatResponse {
        private String answer;
        public ChatResponse() {}
        public ChatResponse(String answer) { this.answer = answer; }
        public String getAnswer() { return answer; }
        public void setAnswer(String answer) { this.answer = answer; }
    }

    public static class QuizGenerateRequest {
        private String subject;
        private String chapter;
        private int numQuestions;
        private String difficulty;
        public String getSubject() { return subject; }
        public void setSubject(String s) { this.subject = s; }
        public String getChapter() { return chapter; }
        public void setChapter(String c) { this.chapter = c; }
        public int getNumQuestions() { return numQuestions; }
        public void setNumQuestions(int n) { this.numQuestions = n; }
        public String getDifficulty() { return difficulty; }
        public void setDifficulty(String d) { this.difficulty = d; }
    }

    public static class QuizSaveRequest {
        private String subject;
        private String chapter;
        private int score;
        private int total;
        private String difficulty;
        private String questionsJson;
        public String getSubject() { return subject; }
        public void setSubject(String s) { this.subject = s; }
        public String getChapter() { return chapter; }
        public void setChapter(String c) { this.chapter = c; }
        public int getScore() { return score; }
        public void setScore(int s) { this.score = s; }
        public int getTotal() { return total; }
        public void setTotal(int t) { this.total = t; }
        public String getDifficulty() { return difficulty; }
        public void setDifficulty(String d) { this.difficulty = d; }
        public String getQuestionsJson() { return questionsJson; }
        public void setQuestionsJson(String q) { this.questionsJson = q; }
        private String answersJson;
        public String getAnswersJson() { return answersJson; }
        public void setAnswersJson(String a) { this.answersJson = a; }
    }

    public static class QuizResultResponse {
        private Long id;
        private String subject;
        private String chapter;
        private int score;
        private int total;
        private String difficulty;
        private String questionsJson;
        private String answersJson;
        private String createdAt;
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getSubject() { return subject; }
        public void setSubject(String s) { this.subject = s; }
        public String getChapter() { return chapter; }
        public void setChapter(String c) { this.chapter = c; }
        public int getScore() { return score; }
        public void setScore(int s) { this.score = s; }
        public int getTotal() { return total; }
        public void setTotal(int t) { this.total = t; }
        public String getDifficulty() { return difficulty; }
        public void setDifficulty(String d) { this.difficulty = d; }
        public String getQuestionsJson() { return questionsJson; }
        public void setQuestionsJson(String q) { this.questionsJson = q; }
        public String getAnswersJson() { return answersJson; }
        public void setAnswersJson(String a) { this.answersJson = a; }
        public String getCreatedAt() { return createdAt; }
        public void setCreatedAt(String c) { this.createdAt = c; }
    }

    public static class ChatSessionResponse {
        private String subject;
        private String chapter;
        private String lastActive;
        public ChatSessionResponse(String subject, String chapter, java.time.LocalDateTime lastActive) {
            this.subject = subject;
            this.chapter = chapter;
            this.lastActive = lastActive.toString();
        }
        public String getSubject() { return subject; }
        public String getChapter() { return chapter; }
        public String getLastActive() { return lastActive; }
    }

    public static class NoteRequest {
        private String subject;
        private String chapter;
        private String title;
        private String content;
        public String getSubject() { return subject; }
        public void setSubject(String subject) { this.subject = subject; }
        public String getChapter() { return chapter; }
        public void setChapter(String chapter) { this.chapter = chapter; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
    }

    public static class NoteResponse {
        private Long id;
        private String subject;
        private String chapter;
        private String title;
        private String content;
        private String createdAt;
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getSubject() { return subject; }
        public void setSubject(String subject) { this.subject = subject; }
        public String getChapter() { return chapter; }
        public void setChapter(String chapter) { this.chapter = chapter; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
        public String getCreatedAt() { return createdAt; }
        public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
    }

    public static class HistoryResponse {
        private Long id;
        private String subject;
        private String chapter;
        private String role;
        private String message;
        private String createdAt;
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getSubject() { return subject; }
        public void setSubject(String subject) { this.subject = subject; }
        public String getChapter() { return chapter; }
        public void setChapter(String chapter) { this.chapter = chapter; }
        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        public String getCreatedAt() { return createdAt; }
        public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
    }
}
