"use client";

import ReactMarkdown from "react-markdown";
import { useEffect, useRef } from "react";

interface RecipeStreamProps {
  content: string;
  loading: boolean;
}

export function RecipeStream({ content, loading }: RecipeStreamProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [content]);

  if (!content && !loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 text-5xl" role="img" aria-label="Kochtopf">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-12 text-muted-foreground/40"
          >
            <path d="M3 11h18" />
            <path d="M5 11v6a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3v-6" />
            <path d="M12 11V4" />
            <path d="M9 7c0-1.5 1.5-3 3-3s3 1.5 3 3" />
          </svg>
        </div>
        <p className="text-muted-foreground text-sm leading-relaxed max-w-[260px]">
          Gib deine Zutaten ein und lass dir
          <br />
          ein passendes Rezept vorschlagen.
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative max-h-[60vh] overflow-y-auto rounded-xl bg-card border border-border p-6"
    >
      <div className="prose prose-sm prose-neutral max-w-none dark:prose-invert">
        <div className="text-sm text-foreground leading-relaxed font-sans">
          <ReactMarkdown>{content}</ReactMarkdown>
          {loading && (
            <span className="inline-block ml-0.5 w-[2px] h-4 bg-accent animate-pulse" />
          )}
        </div>
      </div>
      {loading && !content && (
        <div className="flex items-center gap-3 py-4">
          <div className="flex gap-1">
            <span className="size-1.5 rounded-full bg-accent animate-bounce [animation-delay:0ms]" />
            <span className="size-1.5 rounded-full bg-accent animate-bounce [animation-delay:150ms]" />
            <span className="size-1.5 rounded-full bg-accent animate-bounce [animation-delay:300ms]" />
          </div>
          <span className="text-sm text-muted-foreground">
            Rezept wird erstellt...
          </span>
        </div>
      )}
    </div>
  );
}
