package com.schmackofatz.server;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import reactor.core.publisher.Flux;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.List;
import java.util.Map;

@Service
public class GroqService {

    private final RestClient restClient;
    private final ObjectMapper mapper = new ObjectMapper();

    public GroqService(@Value("${groq.api.key}") String apiKey) {
        this.restClient = RestClient.builder()
                .baseUrl("https://api.groq.com/openai/v1")
                .defaultHeader("Authorization", "Bearer " + apiKey)
                .defaultHeader("Content-Type", "application/json")
                .build();
    }

    public Flux<String> streamRecipeSuggestions(List<String> ingredients) {
        String prompt = "Ich habe folgende Zutaten: " + String.join(", ", ingredients) +
                ". Was kann ich daraus kochen? Gib mir 2-3 Rezeptvorschläge.";

        var requestBody = Map.of(
                "model", "llama-3.3-70b-versatile",
                "stream", true,
                "messages", List.of(
                        Map.of("role", "user", "content", prompt)
                )
        );

        return Flux.create(emitter -> {
            restClient.post()
                    .uri("/chat/completions")
                    .body(requestBody)
                    .exchange((request, response) -> {
                        try (BufferedReader reader = new BufferedReader(
                                new InputStreamReader(response.getBody()))) {
                            String line;
                            while ((line = reader.readLine()) != null) {
                                if (line.startsWith("data: ")) {
                                    String data = line.substring(6);
                                    if (data.equals("[DONE]")) break;
                                    JsonNode node = mapper.readTree(data);
                                    JsonNode content = node.path("choices")
                                            .get(0).path("delta").path("content");
                                    if (!content.isMissingNode()) {
                                        emitter.next(content.asText());
                                    }
                                }
                            }
                        }
                        emitter.complete();
                        return null;
                    });
        });
    }
}