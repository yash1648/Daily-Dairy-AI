package com.dairy.backend.websocket;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.ollama.OllamaChatModel;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Configuration
public class AuthenticatedAIWebSocketHandler extends TextWebSocketHandler {
    private static final Logger logger = LoggerFactory.getLogger(AuthenticatedAIWebSocketHandler.class);
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final OllamaChatModel chatModel;

    // Store active user sessions
    private final Map<String, WebSocketSession> userSessions = new ConcurrentHashMap<>();

    public AuthenticatedAIWebSocketHandler(OllamaChatModel chatModel) {
        this.chatModel = chatModel;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        // Extract authentication from session attributes
        Authentication auth = (Authentication) session.getAttributes().get("SPRING_SECURITY_CONTEXT");
        String username = (String) session.getAttributes().get("username");

        if (auth != null && username != null) {
            // Set security context for this thread
            SecurityContextHolder.getContext().setAuthentication(auth);

            // Store user session
            userSessions.put(username, session);

            logger.info("Authenticated WebSocket connection established for user: {}", username);

            // Send welcome message
            sendMessage(session, Map.of(
                    "type", "connected",
                    "message", "Welcome " + username + "! AI Chat is ready.",
                    "user", username
            ));
        } else {
            logger.error("WebSocket connection without proper authentication");
            try {
                session.close(CloseStatus.SERVER_ERROR);
            } catch (IOException e) {
                logger.error("Failed to close unauthenticated session", e);
            }
        }
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        // Get user from session
        String username = (String) session.getAttributes().get("username");
        Authentication auth = (Authentication) session.getAttributes().get("SPRING_SECURITY_CONTEXT");

        if (username == null || auth == null) {
            logger.error("Message received from unauthenticated session");
            session.close(CloseStatus.SERVER_ERROR);
            return;
        }

        // Set security context
        SecurityContextHolder.getContext().setAuthentication(auth);

        try {
            AiRequest request = objectMapper.readValue(message.getPayload(), AiRequest.class);
            logger.info("Processing AI request from user: {} - Template: {}", username, request.templateId());

            // Send acknowledgment
            sendMessage(session, Map.of(
                    "type", "processing",
                    "message", "Processing your request..."
            ));

            // Stream AI response
            chatModel.stream(new Prompt(request.prompt()))
                    .doOnError(error -> sendError(session, error))
                    .subscribe(
                            chunk -> sendChunk(session, chunk),
                            error -> {
                                logger.error("Stream error for user {}: {}", username, error.getMessage());
                                sendError(session, error);
                            },
                            () -> sendCompletion(session)
                    );

        } catch (Exception e) {
            logger.error("Error processing message from user {}: {}", username, e.getMessage());
            sendError(session, e);
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        String username = (String) session.getAttributes().get("username");
        if (username != null) {
            userSessions.remove(username);
            logger.info("WebSocket connection closed for user: {} - Status: {}", username, status);
        }

        // Clear security context
        SecurityContextHolder.clearContext();
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) {
        String username = (String) session.getAttributes().get("username");
        logger.error("WebSocket transport error for user: {} - Error: {}", username, exception.getMessage());

        try {
            session.close(CloseStatus.SERVER_ERROR);
        } catch (IOException e) {
            logger.error("Failed to close error session", e);
        }
    }

    private void sendChunk(WebSocketSession session, ChatResponse chunk) {
        String content = chunk.getResult().getOutput().getText();
        sendMessage(session, Map.of(
                "type", "chunk",
                "content", content,
                "timestamp", System.currentTimeMillis()
        ));
    }

    private void sendCompletion(WebSocketSession session) {
        sendMessage(session, Map.of(
                "type", "complete",
                "timestamp", System.currentTimeMillis()
        ));
    }

    private void sendError(WebSocketSession session, Throwable error) {
        sendMessage(session, Map.of(
                "type", "error",
                "message", error.getMessage(),
                "timestamp", System.currentTimeMillis()
        ));
    }

    private void sendMessage(WebSocketSession session, Map<String, Object> message) {
        try {
            if (session.isOpen()) {
                String json = objectMapper.writeValueAsString(message);
                session.sendMessage(new TextMessage(json));
            }
        } catch (IOException e) {
            logger.error("Failed to send WebSocket message: {}", e.getMessage());
        }
    }

    // Get active user sessions (for admin purposes)
    public Map<String, WebSocketSession> getActiveSessions() {
        return Map.copyOf(userSessions);
    }

    record AiRequest(String prompt, String templateId) {}
}