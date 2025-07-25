package com.dairy.backend.controller;

import com.dairy.backend.service.AiChatService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    private final AiChatService chatService;

    public AiController(AiChatService chatService) {
        this.chatService = chatService;
    }

    @PostMapping("/generate")
    public ResponseEntity<String> generateText(
            @RequestParam(defaultValue = "default") String template,
            @RequestBody Map<String, Object> variables) {
        try {
            String response = chatService.generateResponse(template, variables);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body("Error generating response: " + e.getMessage());
        }
    }
}
