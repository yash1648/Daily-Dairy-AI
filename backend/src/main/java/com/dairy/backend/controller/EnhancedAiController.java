package com.dairy.backend.controller;

import com.dairy.backend.service.AiChatService;

import com.dairy.backend.websocket.AuthenticatedAIWebSocketHandler;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
@RestController
@RequestMapping("/api/ai")
public class EnhancedAiController {

    private final AiChatService chatService;
    private final AuthenticatedAIWebSocketHandler webSocketHandler;

    public EnhancedAiController(AiChatService chatService,
                                AuthenticatedAIWebSocketHandler webSocketHandler) {
        this.chatService = chatService;
        this.webSocketHandler = webSocketHandler;
    }

    @PostMapping("/generate")
    public ResponseEntity<String> generateText(
            @RequestParam(defaultValue = "default") String template,
            @RequestBody Map<String, Object> variables,
            Authentication authentication) {
        try {
            String response = chatService.generateResponse(template, variables);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body("Error generating response: " + e.getMessage());
        }
    }

    @GetMapping("/websocket/status")
    public ResponseEntity<Map<String, Object>> getWebSocketStatus(Authentication authentication) {
        int activeSessions = webSocketHandler.getActiveSessions().size();
        boolean userConnected = webSocketHandler.getActiveSessions().containsKey(authentication.getName());

        return ResponseEntity.ok(Map.of(
                "activeSessions", activeSessions,
                "userConnected", userConnected,
                "currentUser", authentication.getName()
        ));
    }
}