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
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/recipes/stream`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(ingredients),
        },
      );

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split("\n").filter((l) => l.startsWith("data:"));
        for (const line of lines) {
          setResult((prev) => prev + line.replace("data:", ""));
        }
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
      <div className="mx-auto max-w-2xl px-6 py-12 md:py-20">
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
          <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
            Zutaten
          </label>
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

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-border">
          <p className="text-xs text-muted-foreground/60 text-center">
            Rezepte werden per KI generiert und koennen variieren.
          </p>
        </footer>
      </div>
    </main>
  );
}
