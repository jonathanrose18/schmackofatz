"use client";

import { useState, useRef, type KeyboardEvent } from "react";
import { X, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface IngredientInputProps {
  ingredients: string[];
  onAdd: (ingredient: string) => void;
  onRemove: (index: number) => void;
  disabled?: boolean;
}

export function IngredientInput({
  ingredients,
  onAdd,
  onRemove,
  disabled = false,
}: IngredientInputProps) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addIngredient();
    }
    if (e.key === "Backspace" && value === "" && ingredients.length > 0) {
      onRemove(ingredients.length - 1);
    }
  }

  function addIngredient() {
    const trimmed = value.trim().replace(/,/g, "");
    if (trimmed && !ingredients.includes(trimmed)) {
      onAdd(trimmed);
      setValue("");
    }
  }

  return (
    <div
      className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 transition-colors focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20 cursor-text min-h-[52px]"
      onClick={() => inputRef.current?.focus()}
      role="group"
      aria-label="Zutaten eingeben"
    >
      {ingredients.map((ingredient, index) => (
        <Badge
          key={`${ingredient}-${index}`}
          variant="secondary"
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium bg-secondary text-secondary-foreground select-none"
        >
          {ingredient}
          {!disabled && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRemove(index);
              }}
              className="ml-0.5 rounded-full p-0.5 hover:bg-foreground/10 transition-colors"
              aria-label={`${ingredient} entfernen`}
            >
              <X className="size-3" />
            </button>
          )}
        </Badge>
      ))}
      <div className="flex flex-1 items-center gap-1 min-w-[140px]">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={
            ingredients.length === 0
              ? "Tomaten, Zwiebeln, Knoblauch..."
              : "Weitere Zutat..."
          }
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Zutat eingeben"
        />
        {value.trim() && (
          <button
            type="button"
            onClick={addIngredient}
            className="rounded-full p-1 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            aria-label="Zutat hinzufuegen"
          >
            <Plus className="size-4" />
          </button>
        )}
      </div>
    </div>
  );
}
