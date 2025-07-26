package com.dairy.backend.websocket;

import com.dairy.backend.security.JwtUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.util.List;
import java.util.Map;

@Component
public class JwtWebSocketInterceptor implements HandshakeInterceptor {
    private static final Logger logger = LoggerFactory.getLogger(JwtWebSocketInterceptor.class);

    private final JwtUtil jwtTokenProvider;
    private final UserDetailsService userDetailsService;

    public JwtWebSocketInterceptor(JwtUtil jwtTokenProvider, UserDetailsService userDetailsService) {
        this.jwtTokenProvider = jwtTokenProvider;
        this.userDetailsService = userDetailsService;
    }

    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                   WebSocketHandler wsHandler, Map<String, Object> attributes) throws Exception {

        String token = extractToken(request);
        System.out.println("🧪 JWT Token Received: " + token);
        if (token == null) {
            logger.warn("WebSocket handshake failed: No JWT token provided");
            response.setStatusCode(org.springframework.http.HttpStatus.FORBIDDEN);
            return false;
        }

        try {
            // Validate JWT token
            if (!jwtTokenProvider.isTokenValid(token)) {
                logger.warn("WebSocket handshake failed: Invalid JWT token");
                response.setStatusCode(org.springframework.http.HttpStatus.FORBIDDEN);
                return false;
            }

            // Extract username from token
            String username = jwtTokenProvider.extractUsername(token);

            // Load user details
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);

            // Create authentication object
            Authentication authentication = new UsernamePasswordAuthenticationToken(
                    userDetails, null, userDetails.getAuthorities());

            // Store authentication in WebSocket session attributes
            attributes.put("SPRING_SECURITY_CONTEXT", authentication);
            attributes.put("username", username);
            attributes.put("token", token);

            logger.info("WebSocket handshake successful for user: {}", username);
            return true;

        } catch (Exception e) {
            logger.error("WebSocket handshake failed: {}", e.getMessage());
            response.setStatusCode(org.springframework.http.HttpStatus.FORBIDDEN);
            return false;
        }
    }

    private String extractToken(ServerHttpRequest request) {
        // Try Authorization header first (Bearer token)
        List<String> authHeaders = request.getHeaders().get("Authorization");
        if (authHeaders != null && !authHeaders.isEmpty()) {
            String authHeader = authHeaders.get(0);
            if (authHeader.startsWith("Bearer ")) {
                return authHeader.substring(7);
            }
        }

        // Fallback to query parameter
        String query = request.getURI().getQuery();
        if (query != null && query.contains("token=")) {
            String[] params = query.split("&");
            for (String param : params) {
                if (param.startsWith("token=")) {
                    return param.substring(6);
                }
            }
        }

        return null;
    }

    @Override
    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
                               WebSocketHandler wsHandler, Exception exception) {
        // No cleanup needed
    }
}
