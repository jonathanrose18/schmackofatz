export const RECIPE_LANGUAGES = ['de', 'en'] as const;

export type RecipeLanguage = (typeof RECIPE_LANGUAGES)[number];

export function isRecipeLanguage(value: string): value is RecipeLanguage {
   return RECIPE_LANGUAGES.includes(value as RecipeLanguage);
}
