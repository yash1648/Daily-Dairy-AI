package com.dairy.backend.websocket;
import com.dairy.backend.security.JwtUtil;
import org.springframework.ai.ollama.OllamaChatModel;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
@Component
public class SecureWebSocketConfig implements WebSocketConfigurer {

    private final OllamaChatModel chatModel;
    private final JwtUtil jwtTokenProvider;
    private final UserDetailsService userDetailsService;

    public SecureWebSocketConfig(OllamaChatModel chatModel,
                                 JwtUtil jwtTokenProvider,
                                 UserDetailsService userDetailsService) {
        this.chatModel = chatModel;
        this.jwtTokenProvider = jwtTokenProvider;
        this.userDetailsService = userDetailsService;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(authenticatedAiWebSocketHandler(), "/ws/ai-chat")
                .setAllowedOriginPatterns("*")
                .addInterceptors(new JwtWebSocketInterceptor(jwtTokenProvider, userDetailsService));

    }

    @Bean
    public WebSocketHandler authenticatedAiWebSocketHandler() {
        return new AuthenticatedAIWebSocketHandler(chatModel);
    }
}