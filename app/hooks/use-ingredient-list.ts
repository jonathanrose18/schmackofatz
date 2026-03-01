'use client';

import { useCallback, useState } from 'react';

import { addUniqueIngredient } from '@/lib/ingredients';

export function useIngredientList(initialIngredients: string[] = []) {
   const [ingredients, setIngredients] = useState<string[]>(() =>
      initialIngredients.reduce<string[]>((acc, ingredient) => addUniqueIngredient(acc, ingredient), [])
   );

   const addIngredient = useCallback((ingredient: string) => {
      setIngredients(prev => addUniqueIngredient(prev, ingredient));
   }, []);

   const removeIngredient = useCallback((index: number) => {
      setIngredients(prev => prev.filter((_, currentIndex) => currentIndex !== index));
   }, []);

   const clearIngredients = useCallback(() => {
      setIngredients([]);
   }, []);

   return {
      ingredients,
      addIngredient,
      removeIngredient,
      clearIngredients,
   };
}
