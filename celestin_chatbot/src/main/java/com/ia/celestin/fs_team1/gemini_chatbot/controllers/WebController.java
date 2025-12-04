package com.ia.celestin.fs_team1.gemini_chatbot.controllers;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller // Utilise @Controller pour les contrôleurs qui renvoient des noms de vue (templates)
public class WebController {

    @GetMapping("/") // Gère les requêtes GET à la racine de ton application
    public String index() {
        return "bot"; // Renvoie le nom du template Thymeleaf (Spring Boot cherchera src/main/resources/templates/index.html)
    }
}