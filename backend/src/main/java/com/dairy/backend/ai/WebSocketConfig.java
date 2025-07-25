package com.dairy.backend.ai;

import org.springframework.ai.ollama.OllamaChatModel;
import org.springframework.ai.ollama.api.OllamaApi;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    private final OllamaChatModel chatModel;

    public WebSocketConfig(OllamaChatModel chatModel) {
        this.chatModel = chatModel;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(aiWebSocketHandler(), "/ws/ai-chat")
                .setAllowedOrigins("*");
    }

    @Bean
    public WebSocketHandler aiWebSocketHandler() {
        return new AIWebSocketHandler(chatModel);
    }
}
