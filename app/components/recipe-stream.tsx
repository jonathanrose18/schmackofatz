"use client";

import ReactMarkdown, { type Components } from "react-markdown";

interface RecipeStreamProps {
  content: string;
  loading: boolean;
}

const markdownComponents: Components = {
  h2: ({ children }) => (
    <h2 className="mt-8 first:mt-0 border-b border-border pb-2 text-xl font-semibold tracking-tight text-foreground">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className="mt-2 text-sm leading-relaxed text-foreground">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="mt-2 list-disc space-y-1 pl-5 marker:text-accent">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="mt-2 list-decimal space-y-2 pl-5 marker:font-medium marker:text-accent">
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li className="pl-1 text-sm leading-relaxed">{children}</li>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-foreground">{children}</strong>
  ),
};

function hasExpectedStructure(markdown: string) {
  const requiredPatterns = [
    /##\s*(rezeptvorschlag|recipe suggestion)\s*1/i,
    /###\s*(zutaten|ingredients)/i,
    /###\s*(schritte|steps)/i,
    /###\s*(zeit|time)/i,
  ];

  return requiredPatterns.every((pattern) => pattern.test(markdown));
}

export function RecipeStream({ content, loading }: RecipeStreamProps) {
  const showFallback = !loading && !!content && !hasExpectedStructure(content);

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
    <div className="relative">
      <div className="max-w-none">
        {showFallback ? (
          <div className="space-y-4 rounded-lg border border-dashed border-border bg-muted/30 p-4">
            <h2 className="text-lg font-semibold text-foreground">
              Rezeptausgabe
            </h2>
            <p className="text-sm text-muted-foreground">
              Die Antwort kam nicht komplett im erwarteten Format. Der Rohtext
              bleibt unten sichtbar.
            </p>
            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Rohtext
              </h3>
              <pre className="whitespace-pre-wrap wrap-break-word font-sans text-sm leading-relaxed text-foreground">
                {content}
              </pre>
            </div>
          </div>
        ) : (
          <div className="text-sm text-foreground leading-relaxed font-sans">
            <ReactMarkdown components={markdownComponents}>
              {content}
            </ReactMarkdown>
            {loading && (
              <span className="inline-block ml-0.5 w-[2px] h-4 bg-accent animate-pulse" />
            )}
          </div>
        )}
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
