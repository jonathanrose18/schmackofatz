'use client';

import { ArrowRight, ChefHat, RotateCcw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { IngredientInput } from '@/components/ingredient-input';
import { RecipeStream } from '@/components/recipe-stream';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Suggestions } from '@/components/suggestions';
import { isRecipeLanguage, type RecipeLanguage } from '@/lib/recipes/types';

interface RecipeBuilderProps {
   ingredients: string[];
   suggestions: string[];
   recipeContent: string;
   loading: boolean;
   language: RecipeLanguage;
   onLanguageChange: (language: RecipeLanguage) => void;
   onAddIngredient: (ingredient: string) => void;
   onRemoveIngredient: (index: number) => void;
   onGenerateRecipe: () => void;
   onReset: () => void;
}

export function RecipeBuilder({
   ingredients,
   suggestions,
   recipeContent,
   loading,
   language,
   onLanguageChange,
   onAddIngredient,
   onRemoveIngredient,
   onGenerateRecipe,
   onReset,
}: RecipeBuilderProps) {
   const canGenerateRecipe = !loading && ingredients.length > 0;
   const canReset = !loading && (ingredients.length > 0 || recipeContent.length > 0);

   return (
      <main className='bg-background min-h-screen'>
         <div className='mx-auto max-w-6xl px-6 py-12 md:py-20'>
            <header className='mb-12'>
               <div className='mb-3 flex items-center gap-3'>
                  <div className='bg-accent/10 flex size-10 items-center justify-center rounded-xl'>
                     <ChefHat className='text-foreground size-5' />
                  </div>
                  <h1 className='text-foreground text-2xl font-bold tracking-tight text-balance'>Schmackofatz</h1>
               </div>
               <p className='text-muted-foreground max-w-md text-sm leading-relaxed'>
                  What do you have in your fridge? Enter your ingredients and get a fitting recipe in seconds.
               </p>
            </header>

            <section className='mb-6' aria-label='Ingredients'>
               <div className='mb-3 flex flex-wrap items-end justify-between gap-4'>
                  <label className='text-muted-foreground block text-xs font-medium tracking-wider uppercase'>
                     Ingredients
                  </label>
                  <div className='flex flex-col gap-1'>
                     <label
                        htmlFor='language'
                        className='text-muted-foreground text-xs font-medium tracking-wider uppercase'
                     >
                        Response language
                     </label>
                     <Select
                        value={language}
                        onValueChange={value => {
                           if (isRecipeLanguage(value)) {
                              onLanguageChange(value);
                           }
                        }}
                        disabled={loading}
                     >
                        <SelectTrigger
                           id='language'
                           className='border-border bg-card text-foreground focus-visible:ring-accent/20 h-10 min-w-36 rounded-lg shadow-none focus-visible:ring-2'
                        >
                           <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                           <SelectItem value='de'>Deutsch</SelectItem>
                           <SelectItem value='en'>English</SelectItem>
                        </SelectContent>
                     </Select>
                     <p className='text-muted-foreground text-xs'>
                        This controls the language of the recipe returned by the server.
                     </p>
                  </div>
               </div>
               <IngredientInput
                  ingredients={ingredients}
                  onAdd={onAddIngredient}
                  onRemove={onRemoveIngredient}
                  disabled={loading}
               />
               <div className='mt-3'>
                  <Suggestions suggestions={suggestions} onSelect={onAddIngredient} disabled={loading} />
               </div>
            </section>

            <div className='mb-10 flex items-center gap-3'>
               <Button
                  onClick={onGenerateRecipe}
                  disabled={!canGenerateRecipe}
                  size='lg'
                  className='bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl transition-all'
               >
                  {loading ? (
                     <>
                        <span className='border-accent-foreground/30 border-t-accent-foreground size-4 animate-spin rounded-full border-2' />
                        Loading...
                     </>
                  ) : (
                     <>
                        Find recipe
                        <ArrowRight className='size-4' />
                     </>
                  )}
               </Button>
               {canReset && (
                  <Button
                     variant='ghost'
                     size='lg'
                     onClick={onReset}
                     className='text-muted-foreground hover:text-foreground rounded-xl'
                  >
                     <RotateCcw className='size-4' />
                     Reset
                  </Button>
               )}
            </div>

            <section aria-label='Recipe result' aria-live='polite'>
               <RecipeStream content={recipeContent} loading={loading} />
            </section>
         </div>
      </main>
   );
}
