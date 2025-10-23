package com.dairy.backend.ai;

import org.springframework.ai.chat.prompt.PromptTemplate;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class PromptConfig {
    @Bean
    public PromptTemplate customPromptTemplate() {
        return  new PromptTemplate("""
                 You are a helpful AI assistant specialized in {domain}.
                            Your response must be formatted as {format}.
                            Always include these key points: {keyPoints}
                            User question: {input}
                """);
    }
    @Bean
    public PromptTemplate creativeWritingPrompt() {
        return new PromptTemplate("""
            Write a {genre} story in {style} style with these elements:
            - Characters: {characters}
            - Setting: {setting}
            - Theme: {theme}
            """);
    }
}
