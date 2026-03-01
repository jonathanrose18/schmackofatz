"use client";

import { ChefHat, ArrowRight, RotateCcw } from "lucide-react";
import { useState, useCallback } from "react";

import { Button } from "@/components/ui/button";
import { IngredientInput } from "@/components/ingredient-input";
import { RecipeStream } from "@/components/recipe-stream";
import { Suggestions } from "@/components/suggestions";

export default function Home() {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState<"de" | "en">("de");

  const addIngredient = useCallback((ingredient: string) => {
    setIngredients((prev) => [...prev, ingredient]);
  }, []);

  const removeIngredient = useCallback((index: number) => {
    setIngredients((prev) => prev.filter((_, i) => i !== index));
  }, []);

  async function fetchRecipes() {
    if (ingredients.length === 0) return;

    setResult("");
    setLoading(true);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!baseUrl) {
        throw new Error("NEXT_PUBLIC_API_URL ist nicht gesetzt");
      }

      const apiUrl = new URL("/api/recipes/stream", baseUrl);
      apiUrl.searchParams.set("language", language);

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ingredients),
      });

      if (!response.ok) {
        throw new Error(`API Fehler: ${response.status}`);
      }
      if (!response.body) {
        throw new Error("Leere Streaming-Antwort");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let streamEnded = false;

      const appendEvent = (rawEvent: string) => {
        const data = rawEvent
          .split("\n")
          .filter((line) => line.startsWith("data:"))
          .map((line) => line.slice(5))
          .join("\n");

        if (!data) return;
        if (data === "[DONE]") {
          streamEnded = true;
          return;
        }

        setResult((prev) => prev + data);
      };

      while (!streamEnded) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        buffer = buffer.replace(/\r\n/g, "\n");
        const events = buffer.split("\n\n");
        buffer = events.pop() ?? "";

        for (const event of events) {
          if (!event.trim()) continue;
          appendEvent(event);
          if (streamEnded) break;
        }
      }

      buffer += decoder.decode();
      buffer = buffer.replace(/\r\n/g, "\n");
      const remainingEvent = buffer.trim();
      if (!streamEnded && remainingEvent) {
        appendEvent(remainingEvent);
      }
    } catch (error) {
      console.error("Fehler beim Laden:", error);
      setResult(
        "Es gab einen Fehler beim Laden des Rezepts. Bitte versuche es erneut.",
      );
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setIngredients([]);
    setResult("");
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-6 py-12 md:py-20">
        {/* Header */}
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center justify-center size-10 rounded-xl bg-accent/10">
              <ChefHat className="size-5 text-foreground" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground text-balance">
              Schmackofatz
            </h1>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-md">
            Was hast du im Kuehlschrank? Gib deine Zutaten ein und erhalte
            sofort ein passendes Rezept.
          </p>
        </header>

        {/* Ingredient Input */}
        <section className="mb-6" aria-label="Zutaten">
          <div className="mb-3 flex flex-wrap items-end justify-between gap-4">
            <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Zutaten
            </label>
            <div className="flex flex-col gap-1">
              <label
                htmlFor="language"
                className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
              >
                Sprache
              </label>
              <select
                id="language"
                value={language}
                onChange={(event) =>
                  setLanguage(event.target.value as "de" | "en")
                }
                disabled={loading}
                className="h-10 min-w-36 rounded-lg border border-border bg-card px-3 text-sm text-foreground outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <option value="de">Deutsch</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>
          <IngredientInput
            ingredients={ingredients}
            onAdd={addIngredient}
            onRemove={removeIngredient}
            disabled={loading}
          />
          <div className="mt-3">
            <Suggestions
              onSelect={addIngredient}
              existing={ingredients}
              disabled={loading}
            />
          </div>
        </section>

        {/* Actions */}
        <div className="flex items-center gap-3 mb-10">
          <Button
            onClick={fetchRecipes}
            disabled={loading || ingredients.length === 0}
            size="lg"
            className="rounded-xl bg-accent text-accent-foreground hover:bg-accent/90 transition-all"
          >
            {loading ? (
              <>
                <span className="size-4 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full animate-spin" />
                Wird geladen...
              </>
            ) : (
              <>
                Rezept finden
                <ArrowRight className="size-4" />
              </>
            )}
          </Button>
          {(ingredients.length > 0 || result) && !loading && (
            <Button
              variant="ghost"
              size="lg"
              onClick={handleReset}
              className="rounded-xl text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="size-4" />
              Zuruecksetzen
            </Button>
          )}
        </div>

        {/* Recipe Result */}
        <section aria-label="Rezept Ergebnis" aria-live="polite">
          <RecipeStream content={result} loading={loading} />
        </section>
      </div>
    </main>
  );
}
