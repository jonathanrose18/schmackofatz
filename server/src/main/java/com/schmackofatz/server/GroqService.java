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
        String systemPrompt = """
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

        String exampleUser = "Zutaten: Eier, Tomaten, Zwiebel";
        String exampleAssistant = """
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

        String userPrompt = "Zutaten: " + String.join(", ", ingredients) +
                ". Erstelle daraus genau 2 Rezeptvorschlaege im vorgegebenen Format.";

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
}
