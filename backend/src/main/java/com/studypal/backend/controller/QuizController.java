package com.studypal.backend.controller;

import com.studypal.backend.dto.Dto.*;
import com.studypal.backend.service.QuizService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.HttpServerErrorException;

import java.util.List;

@RestController
@RequestMapping("/api/quiz")
public class QuizController {

    private final QuizService quizService;

    public QuizController(QuizService quizService) {
        this.quizService = quizService;
    }

    @PostMapping("/generate")
    public ResponseEntity<Object> generateQuiz(@RequestBody QuizGenerateRequest req) {
        try {
            return ResponseEntity.ok(quizService.generateQuiz(req));
        } catch (ResourceAccessException e) {
            return ResponseEntity.status(503).body("AI service is unavailable.");
        } catch (HttpServerErrorException e) {
            return ResponseEntity.status(502).body("AI service error: " + e.getResponseBodyAsString());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Unexpected error: " + e.getMessage());
        }
    }

    @PostMapping("/result")
    public ResponseEntity<QuizResultResponse> saveResult(@RequestBody QuizSaveRequest req) {
        return ResponseEntity.ok(quizService.saveResult(req));
    }

    @GetMapping("/results")
    public ResponseEntity<List<QuizResultResponse>> getResults() {
        return ResponseEntity.ok(quizService.getResults());
    }
}
