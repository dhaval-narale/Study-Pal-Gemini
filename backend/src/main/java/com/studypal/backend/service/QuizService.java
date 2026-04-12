package com.studypal.backend.service;

import com.studypal.backend.dto.Dto.*;
import com.studypal.backend.model.QuizResult;
import com.studypal.backend.model.User;
import com.studypal.backend.repository.QuizResultRepository;
import com.studypal.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class QuizService {

    private final QuizResultRepository quizResultRepository;
    private final UserRepository userRepository;
    private final RestTemplate restTemplate;

    @Value("${ai.service.url}")
    private String aiServiceUrl;

    public QuizService(QuizResultRepository quizResultRepository,
                       UserRepository userRepository,
                       RestTemplate restTemplate) {
        this.quizResultRepository = quizResultRepository;
        this.userRepository = userRepository;
        this.restTemplate = restTemplate;
    }

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username).orElseThrow();
    }

    public Object generateQuiz(QuizGenerateRequest req) {
        return restTemplate.postForObject(aiServiceUrl + "/quiz", req, Object.class);
    }

    public QuizResultResponse saveResult(QuizSaveRequest req) {
        User user = getCurrentUser();
        QuizResult result = new QuizResult();
        result.setUser(user);
        result.setSubject(req.getSubject());
        result.setChapter(req.getChapter());
        result.setScore(req.getScore());
        result.setTotal(req.getTotal());
        result.setDifficulty(req.getDifficulty());
        result.setQuestionsJson(req.getQuestionsJson());
        result.setAnswersJson(req.getAnswersJson());
        quizResultRepository.save(result);
        return toResponse(result);
    }

    public List<QuizResultResponse> getResults() {
        return quizResultRepository.findByUserOrderByCreatedAtDesc(getCurrentUser())
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    private QuizResultResponse toResponse(QuizResult r) {
        QuizResultResponse res = new QuizResultResponse();
        res.setId(r.getId());
        res.setSubject(r.getSubject());
        res.setChapter(r.getChapter());
        res.setScore(r.getScore());
        res.setTotal(r.getTotal());
        res.setDifficulty(r.getDifficulty());
        res.setQuestionsJson(r.getQuestionsJson());
        res.setAnswersJson(r.getAnswersJson());
        res.setCreatedAt(r.getCreatedAt().toString());
        return res;
    }
}
