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

    public Flux<String> streamRecipeSuggestions(List<String> ingredients, String language) {
        String normalizedLanguage = normalizeLanguage(language);
        String systemPrompt = buildSystemPrompt(normalizedLanguage);
        String exampleUser = buildExampleUser(normalizedLanguage);
        String exampleAssistant = buildExampleAssistant(normalizedLanguage);
        String userPrompt = buildUserPrompt(ingredients, normalizedLanguage);

        var requestBody = Map.of(
                "model", "llama-3.3-70b-versatile",
                "stream", true,
                "messages", List.of(
                        Map.of("role", "system", "content", systemPrompt),
                        Map.of("role", "user", "content", exampleUser),
                        Map.of("role", "assistant", "content", exampleAssistant),
                        Map.of("role", "user", "content", userPrompt)
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

    private String normalizeLanguage(String language) {
        if (language == null) {
            return "de";
        }
        String normalized = language.trim().toLowerCase();
        return normalized.equals("en") ? "en" : "de";
    }

    private String buildSystemPrompt(String language) {
        if (language.equals("en")) {
            return """
                    You are a precise English-speaking cooking assistant.
                    Always answer as valid Markdown and exactly in this order:
                    1) ## Recipe Suggestion 1: <Name>
                    2) **Short description:** <one sentence>
                    3) ### Ingredients
                    4) ### Steps
                    5) ### Time
                    6) ### Tip
                    7) ## Recipe Suggestion 2: <Name>
                    8) **Short description:** <one sentence>
                    9) ### Ingredients
                    10) ### Steps
                    11) ### Time
                    12) ### Tip

                    Formatting rules:
                    - Under "Ingredients", use bullet lists only with "- ".
                    - Under "Steps", use a numbered list only with "1. 2. 3.".
                    - Under "Time", provide exactly three bullet points:
                      - Prep: <...>
                      - Cook: <...>
                      - Total: <...>
                    - Always put one space after Markdown markers: "## Title", "### Title", "- Item", "1. Step".
                    - No introduction, no conclusion, no extra headings.
                    - Maximum 2 recipe suggestions.
                    - Prioritize the provided ingredients and only use basic pantry items (salt, pepper, oil, water).
                    """;
        }

        return """
                Du bist ein praeziser deutschsprachiger Kochassistent.
                Antworte immer als gueltiges Markdown und exakt in dieser Reihenfolge:
                1) ## Rezeptvorschlag 1: <Name>
                2) **Kurzbeschreibung:** <ein Satz>
                3) ### Zutaten
                4) ### Schritte
                5) ### Zeit
                6) ### Tipp
                7) ## Rezeptvorschlag 2: <Name>
                8) **Kurzbeschreibung:** <ein Satz>
                9) ### Zutaten
                10) ### Schritte
                11) ### Zeit
                12) ### Tipp

                Formatregeln:
                - Unter "Zutaten" nur Bullet-Listen mit "- ".
                - Unter "Schritte" nur nummerierte Liste mit "1. 2. 3.".
                - Unter "Zeit" genau drei Bullet-Punkte:
                  - Vorbereitung: <...>
                  - Kochen: <...>
                  - Gesamt: <...>
                - Nutze nach Markdown-Markern immer ein Leerzeichen: "## Titel", "### Titel", "- Punkt", "1. Schritt".
                - Keine Einleitung, kein Fazit, keine zusaetzlichen Ueberschriften.
                - Maximal 2 Rezeptvorschlaege.
                - Nutze vorrangig die gegebenen Zutaten und nur einfache Basiszutaten (Salz, Pfeffer, Oel, Wasser).
                """;
    }

    private String buildExampleUser(String language) {
        if (language.equals("en")) {
            return "Ingredients: eggs, tomatoes, onion";
        }
        return "Zutaten: Eier, Tomaten, Zwiebel";
    }

    private String buildExampleAssistant(String language) {
        if (language.equals("en")) {
            return """
                    ## Recipe Suggestion 1: Tomato Scrambled Eggs
                    **Short description:** A quick and juicy scramble with fresh tomato flavor.
                    ### Ingredients
                    - 3 eggs
                    - 2 tomatoes
                    - 1 small onion
                    - 1 tbsp oil
                    - Salt and pepper
                    ### Steps
                    1. Finely chop the onion and saute in oil until translucent.
                    2. Dice the tomatoes, add them briefly, and season lightly with salt.
                    3. Beat the eggs, pour into the pan, and cook until just set.
                    4. Finish with pepper and serve immediately.
                    ### Time
                    - Prep: 5 minutes
                    - Cook: 8 minutes
                    - Total: 13 minutes
                    ### Tip
                    Serve with toasted bread.

                    ## Recipe Suggestion 2: Egg and Tomato Skillet
                    **Short description:** A rustic one-pan dish with just a few everyday ingredients.
                    ### Ingredients
                    - 2 eggs
                    - 3 tomatoes
                    - 1 onion
                    - 1 tbsp oil
                    - Salt and pepper
                    ### Steps
                    1. Saute the onion in oil.
                    2. Add tomatoes and simmer for 5 minutes.
                    3. Crack the eggs directly into the pan and cook until set.
                    4. Season with salt and pepper to taste.
                    ### Time
                    - Prep: 6 minutes
                    - Cook: 10 minutes
                    - Total: 16 minutes
                    ### Tip
                    Add a little chili if you like extra heat.
                    """;
        }

        return """
                ## Rezeptvorschlag 1: Tomaten-Ruehrei
                **Kurzbeschreibung:** Ein schnelles, saftiges Ruehrei mit frischer Tomatennote.
                ### Zutaten
                - 3 Eier
                - 2 Tomaten
                - 1 kleine Zwiebel
                - 1 EL Oel
                - Salz und Pfeffer
                ### Schritte
                1. Zwiebel fein schneiden und in Oel glasig braten.
                2. Tomaten wuerfeln, kurz mitbraten und leicht salzen.
                3. Eier verquirlen, in die Pfanne geben und stocken lassen.
                4. Mit Pfeffer abschmecken und sofort servieren.
                ### Zeit
                - Vorbereitung: 5 Minuten
                - Kochen: 8 Minuten
                - Gesamt: 13 Minuten
                ### Tipp
                Serviere dazu geroestetes Brot.

                ## Rezeptvorschlag 2: Eier-Tomaten-Pfanne
                **Kurzbeschreibung:** Eine rustikale Pfanne mit wenigen Zutaten fuer den Alltag.
                ### Zutaten
                - 2 Eier
                - 3 Tomaten
                - 1 Zwiebel
                - 1 EL Oel
                - Salz und Pfeffer
                ### Schritte
                1. Zwiebel in Oel anschwitzen.
                2. Tomaten zugeben und 5 Minuten einkochen.
                3. Eier direkt in die Pfanne schlagen und stocken lassen.
                4. Mit Salz und Pfeffer abschmecken.
                ### Zeit
                - Vorbereitung: 6 Minuten
                - Kochen: 10 Minuten
                - Gesamt: 16 Minuten
                ### Tipp
                Wer mag, gibt etwas Chili fuer Schaerfe dazu.
                """;
    }

    private String buildUserPrompt(List<String> ingredients, String language) {
        String ingredientList = String.join(", ", ingredients);
        if (language.equals("en")) {
            return "Ingredients: " + ingredientList +
                    ". Create exactly 2 recipe suggestions in the required format.";
        }
        return "Zutaten: " + ingredientList +
                ". Erstelle daraus genau 2 Rezeptvorschlaege im vorgegebenen Format.";
    }
}
