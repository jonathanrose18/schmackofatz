'use client';

import { useCallback, useMemo } from 'react';

import { RecipeBuilder } from '@/components/recipe-builder';
import { getAvailableIngredientSuggestions } from '@/lib/ingredients';
import { useIngredientList } from '@/hooks/use-ingredient-list';
import { useRecipeGenerator } from '@/hooks/use-recipe-generator';

export default function Home() {
   const { ingredients, addIngredient, removeIngredient, clearIngredients } = useIngredientList();
   const { recipe, isLoading, language, setLanguage, generateRecipe, clearRecipe } = useRecipeGenerator('en');

   const suggestions = useMemo(() => getAvailableIngredientSuggestions(ingredients), [ingredients]);

   const handleGenerateRecipe = useCallback(() => {
      void generateRecipe(ingredients);
   }, [generateRecipe, ingredients]);

   const handleReset = useCallback(() => {
      clearIngredients();
      clearRecipe();
   }, [clearIngredients, clearRecipe]);

   return (
      <RecipeBuilder
         ingredients={ingredients}
         language={language}
         loading={isLoading}
         onLanguageChange={setLanguage}
         recipeContent={recipe}
         suggestions={suggestions}
         onAddIngredient={addIngredient}
         onRemoveIngredient={removeIngredient}
         onGenerateRecipe={handleGenerateRecipe}
         onReset={handleReset}
      />
   );
}
