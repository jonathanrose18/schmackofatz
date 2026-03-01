import { readSseStream } from '@/lib/recipes/sse';
import { type RecipeLanguage } from '@/lib/recipes/types';

interface StreamRecipeSuggestionsParams {
   ingredients: string[];
   language: RecipeLanguage;
   onChunk: (chunk: string) => void;
   signal?: AbortSignal;
}

export async function streamRecipeSuggestions({
   ingredients,
   language,
   onChunk,
   signal,
}: StreamRecipeSuggestionsParams): Promise<void> {
   if (ingredients.length === 0) return;

   const baseUrl = process.env.NEXT_PUBLIC_API_URL;
   if (!baseUrl) {
      throw new Error('NEXT_PUBLIC_API_URL is not configured');
   }

   const apiUrl = new URL('/api/recipes/stream', baseUrl);
   apiUrl.searchParams.set('language', language);

   const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ingredients),
      signal,
   });

   if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
   }
   if (!response.body) {
      throw new Error('Empty streaming response');
   }

   await readSseStream(response.body, onChunk);
}
