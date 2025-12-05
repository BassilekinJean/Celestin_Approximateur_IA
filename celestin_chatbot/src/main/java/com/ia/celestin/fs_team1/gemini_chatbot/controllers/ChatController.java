package com.ia.celestin.fs_team1.gemini_chatbot.controllers;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ia.celestin.fs_team1.gemini_chatbot.service.GeminiDirectApiService;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final GeminiDirectApiService geminiDirectApiService; 

    public ChatController(GeminiDirectApiService geminiDirectApiService) { 
        this.geminiDirectApiService = geminiDirectApiService;
    }

    @PostMapping
    public ChatResponse processChatMessage(@RequestBody ChatRequest request) {
        System.out.println("Message reçu du front-end : " + request.getMessage());

        // Appelle la méthode du nouveau service Gemini
        String botResponse = geminiDirectApiService.getGeminiResponse(request.getMessage());
        return new ChatResponse(botResponse);
    }

    
    public static class ChatRequest {
        private String message;
        public ChatRequest() {}
        public ChatRequest(String message) { this.message = message; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }

    public static class ChatResponse {
        private String response;
        public ChatResponse() {}
        public ChatResponse(String response) { this.response = response; }
        public String getResponse() { return response; }
        public void setResponse(String response) { this.response = response; }
    }
}