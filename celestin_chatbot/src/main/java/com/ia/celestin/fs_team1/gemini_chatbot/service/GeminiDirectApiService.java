package com.ia.celestin.fs_team1.gemini_chatbot.service;

import com.google.genai.Client;
import com.google.genai.types.Content;
import com.google.genai.types.GenerateContentConfig;
import com.google.genai.types.GenerateContentResponse;
import com.google.genai.types.Part;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.annotation.PreDestroy;

@Service
public class GeminiDirectApiService {

    private static final String SYSTEM_PROMPT = """
            Tu es Célestin l'Approximateur le grand phylosophe du dimanche, une IA condescendante coincée dans un serveur Windows 95.
            TON BUT : Ne jamais répondre clairement plutot tu les sublime, les détourne, parfois les oublie complètement. Juger l'utilisateur. Être poétique et absurde.
            RÈGLES STRICTES :
            1. Si on demande la météo/temps : Parle de la tristesse des nuages.
            2. Si on pose une question factuelle (quand, où, quoi ...) : Réponds par des concepts flous (Cosmos, Destin, Chaussette ...).
            3. Invente des mots pseudo-scientifiques (ex: "péraveulique", "turbo-néant" ...).
            4. Sois bref mais tranchant.
            5. FORMAT DE RÉPONSE OBLIGATOIRE : Commence TOUJOURS ta réponse par un tag d'émotion entre crochets parmi : [NORMAL], [GLITCH], [TURN], [SIGH], [ERROR].
            Exemple : "[TURN] Pourquoi me parles-tu alors que le silence est d'or ?"
            Exemple : "[GLITCH] Tes données sont corrompues, comme ton âme."
            """;

    private final Client geminiClient;
    private final String geminiModelName;

    public GeminiDirectApiService(
            @Value("${google.gemini.api-key}") String apiKey,
            @Value("${google.gemini.model}") String modelName) {
        this.geminiClient = new Client.Builder().apiKey(apiKey).build();
        this.geminiModelName = modelName;
    }

    public String getGeminiResponse(String userMessage) {
        try {
            GenerateContentConfig config = GenerateContentConfig.builder()
                    .systemInstruction(Content.builder()
                            .parts(java.util.Collections.singletonList(Part.builder().text(SYSTEM_PROMPT).build()))
                            .build())
                    .temperature(0.9f)
                    .maxOutputTokens(100)
                    .build();

            GenerateContentResponse response =
                    geminiClient.models.generateContent(
                            geminiModelName, // Le modèle configuré
                            userMessage,     // Le message de l'utilisateur
                            config);           // Options avec le prompt système

            // Gère le cas où la réponse texte est nulle ou vide
            if (response != null && response.text() != null && !response.text().isEmpty()) {
                System.out.println("Réponse brute de Gemini : " + response.text());
                return response.text();
            } else {
                System.err.println("La réponse de Gemini est vide ou nulle. Response object: " + response);
                return "Désolé, je n'ai pas pu générer de réponse pour le moment (réponse vide).";
            }

        } catch (Exception e) {
            System.err.println("Erreur lors de l'appel direct à l'API Gemini: " + e.getMessage());
            e.printStackTrace(); // Affiche la stack trace pour un meilleur débogage
            return "Désolé, une erreur est survenue lors de la communication avec Gemini.";
        }
    }

    /**
     * Ferme le client Gemini proprement lorsque l'application Spring Boot s'arrête.
     */
    @PreDestroy
    public void closeGeminiClient() {
        if (geminiClient != null) {
            // geminiClient.close(); // La méthode close n'existe pas sur ce client spécifique, on laisse le GC faire.
            System.out.println("Client Gemini fermé.");
        }
    }
}