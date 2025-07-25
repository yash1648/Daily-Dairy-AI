package com.dairy.backend.ai;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.ollama.OllamaChatModel;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.Map;

public class AIWebSocketHandler extends TextWebSocketHandler {
    private static final Logger logger = LoggerFactory.getLogger(AIWebSocketHandler.class);
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final OllamaChatModel chatModel;

    public AIWebSocketHandler(OllamaChatModel chatModel) {
        this.chatModel = chatModel;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        logger.info("New WebSocket connection: {}", session.getId());
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        AiRequest request = objectMapper.readValue(message.getPayload(), AiRequest.class);

        chatModel.stream(new Prompt(request.prompt()))
                .doOnError(error -> sendError(session, error))
                .subscribe(chunk -> {
                    sendChunk(session, chunk);
                }, error -> {
                    logger.error("Stream error: {}", error.getMessage());
                    try {
                        session.close(CloseStatus.SERVER_ERROR);
                    } catch (IOException e) {
                        throw new RuntimeException(e);
                    }
                }, () -> {
                    sendCompletion(session);
                });
    }

    private void sendChunk(WebSocketSession session, ChatResponse chunk) {
        try {
            String content = chunk.getResult().getOutput().getText();
            session.sendMessage(new TextMessage(objectMapper.writeValueAsString(
                    Map.of("type", "chunk", "content", content)
            )));
        } catch (IOException e) {
            logger.error("Failed to send chunk: {}", e.getMessage());
        }
    }

    private void sendCompletion(WebSocketSession session) {
        try {
            session.sendMessage(new TextMessage(objectMapper.writeValueAsString(
                    Map.of("type", "complete")
            )));
        } catch (IOException e) {
            logger.error("Failed to send completion: {}", e.getMessage());
        }
    }

    private void sendError(WebSocketSession session, Throwable error) {
        try {
            session.sendMessage(new TextMessage(objectMapper.writeValueAsString(
                    Map.of("type", "error", "message", error.getMessage())
            )));
        } catch (IOException e) {
            logger.error("Failed to send error: {}", e.getMessage());
        }
    }

    record AiRequest(String prompt, String templateId) {}
}
