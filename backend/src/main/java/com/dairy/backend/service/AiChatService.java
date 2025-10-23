package com.dairy.backend.service;

import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.chat.prompt.PromptTemplate;
import org.springframework.ai.ollama.OllamaChatModel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import java.util.Map;
@Service
public class AiChatService {
    private final OllamaChatModel chatModel;
    private final Map<String, PromptTemplate> promptTemplates;

    public AiChatService(OllamaChatModel chatModel,
                         @Qualifier("customPromptTemplate") PromptTemplate defaultTemplate,
                         @Qualifier("creativeWritingPrompt") PromptTemplate creativeTemplate) {
        this.chatModel = chatModel;
        this.promptTemplates = Map.of(
                "default", defaultTemplate,
                "creative", creativeTemplate
        );
    }
    public String generateResponse(String templateId, Map<String, Object> variables) {
        if (!promptTemplates.containsKey(templateId)) {
            throw new IllegalArgumentException("Invalid template ID");
        }

        Prompt prompt = promptTemplates.get(templateId).create(variables);
        return chatModel.call(prompt).getResult().getOutput().getText();
    }


}
