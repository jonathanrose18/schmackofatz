const DEFAULT_INGREDIENT_SUGGESTIONS = [
   'Tomatoes',
   'Onions',
   'Garlic',
   'Potatoes',
   'Bell pepper',
   'Rice',
   'Pasta',
   'Chicken',
   'Eggs',
   'Cheese',
];

function ingredientKey(value: string): string {
   return value.trim().toLowerCase();
}

export function normalizeIngredient(value: string): string {
   return value.trim().replace(/,/g, '');
}

export function addUniqueIngredient(existing: string[], candidate: string): string[] {
   const normalizedCandidate = normalizeIngredient(candidate);
   if (!normalizedCandidate) {
      return existing;
   }

   const candidateKey = ingredientKey(normalizedCandidate);
   const alreadyExists = existing.some(item => ingredientKey(item) === candidateKey);
   if (alreadyExists) {
      return existing;
   }

   return [...existing, normalizedCandidate];
}

export function getAvailableIngredientSuggestions(
   existing: string[],
   suggestions = DEFAULT_INGREDIENT_SUGGESTIONS
): string[] {
   const existingKeys = new Set(existing.map(ingredientKey));
   const seenSuggestionKeys = new Set<string>();

   return suggestions.filter(suggestion => {
      const normalizedSuggestion = normalizeIngredient(suggestion);
      if (!normalizedSuggestion) {
         return false;
      }

      const key = ingredientKey(normalizedSuggestion);
      if (existingKeys.has(key) || seenSuggestionKeys.has(key)) {
         return false;
      }

      seenSuggestionKeys.add(key);
      return true;
   });
}
