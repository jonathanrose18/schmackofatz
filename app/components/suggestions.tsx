"use client";

import { Button } from "@/components/ui/button";

const SUGGESTIONS = [
  "Tomaten",
  "Zwiebeln",
  "Knoblauch",
  "Kartoffeln",
  "Paprika",
  "Reis",
  "Nudeln",
  "Haehnchen",
  "Eier",
  "Kaese",
];

interface SuggestionsProps {
  onSelect: (ingredient: string) => void;
  existing: string[];
  disabled?: boolean;
}

export function Suggestions({
  onSelect,
  existing,
  disabled,
}: SuggestionsProps) {
  const available = SUGGESTIONS.filter((s) => !existing.includes(s));

  if (available.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {available.map((suggestion) => (
        <Button
          key={suggestion}
          variant="outline"
          size="sm"
          onClick={() => onSelect(suggestion)}
          disabled={disabled}
          className="rounded-lg text-xs h-7 px-2.5 text-muted-foreground hover:text-foreground border-border/60 hover:border-border hover:bg-secondary/50 transition-all"
        >
          {suggestion}
        </Button>
      ))}
    </div>
  );
}
