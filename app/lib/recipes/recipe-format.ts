const REQUIRED_RECIPE_PATTERNS = [
   /##\s*(rezeptvorschlag|recipe suggestion)\s*1/i,
   /###\s*(zutaten|ingredients)/i,
   /###\s*(schritte|steps)/i,
   /###\s*(zeit|time)/i,
];

export function hasExpectedRecipeStructure(markdown: string): boolean {
   return REQUIRED_RECIPE_PATTERNS.every(pattern => pattern.test(markdown));
}
