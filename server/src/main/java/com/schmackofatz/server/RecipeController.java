package com.schmackofatz.server;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;

import java.util.List;

@RestController
@RequestMapping("/api")
public class RecipeController {

    private final GroqService groqService;

    public RecipeController(GroqService groqService) {
        this.groqService = groqService;
    }

    @PostMapping(value = "/recipes/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<String> streamRecipes(@RequestBody List<String> ingredients) {
        return groqService.streamRecipeSuggestions(ingredients);
    }
}