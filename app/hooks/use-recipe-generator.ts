'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { streamRecipeSuggestions } from '@/lib/recipes/recipe-api';
import { type RecipeLanguage } from '@/lib/recipes/types';

const DEFAULT_RECIPE_ERROR_MESSAGE = 'There was an error loading the recipe. Please try again.';

function isAbortError(error: unknown): boolean {
   return error instanceof DOMException && error.name === 'AbortError';
}

export function useRecipeGenerator(initialLanguage: RecipeLanguage = 'en') {
   const [recipe, setRecipe] = useState('');
   const [isLoading, setIsLoading] = useState(false);
   const [language, setLanguage] = useState<RecipeLanguage>(initialLanguage);
   const activeRequestRef = useRef<AbortController | null>(null);

   const clearRecipe = useCallback(() => {
      activeRequestRef.current?.abort();
      activeRequestRef.current = null;
      setIsLoading(false);
      setRecipe('');
   }, []);

   const generateRecipe = useCallback(
      async (ingredients: string[]) => {
         if (ingredients.length === 0) return;

         activeRequestRef.current?.abort();
         const controller = new AbortController();
         activeRequestRef.current = controller;

         setRecipe('');
         setIsLoading(true);

         try {
            await streamRecipeSuggestions({
               ingredients,
               language,
               signal: controller.signal,
               onChunk: chunk => setRecipe(prev => prev + chunk),
            });
         } catch (error) {
            if (isAbortError(error)) {
               return;
            }

            console.error('Failed to fetch recipe:', error);
            setRecipe(DEFAULT_RECIPE_ERROR_MESSAGE);
         } finally {
            if (activeRequestRef.current === controller) {
               activeRequestRef.current = null;
               setIsLoading(false);
            }
         }
      },
      [language]
   );

   useEffect(
      () => () => {
         activeRequestRef.current?.abort();
      },
      []
   );

   return {
      recipe,
      isLoading,
      language,
      setLanguage,
      generateRecipe,
      clearRecipe,
   };
}
