package com.ia.celestin.fs_team1.gemini_chatbot.controllers;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller 
public class WebController {

    @GetMapping("/") 
    public String index() {
        return "bot"; 
    }
}