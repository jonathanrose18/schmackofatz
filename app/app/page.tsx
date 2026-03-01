'use client';

import { ArrowRight, ChefHat, RotateCcw } from 'lucide-react';
import { useState, useCallback } from 'react';

import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { IngredientInput } from '@/components/ingredient-input';
import { RecipeStream } from '@/components/recipe-stream';
import { Suggestions } from '@/components/suggestions';

export default function Home() {
   const [ingredients, setIngredients] = useState<string[]>([]);
   const [result, setResult] = useState('');
   const [loading, setLoading] = useState(false);
   const [language, setLanguage] = useState<'de' | 'en'>('en');

   const addIngredient = useCallback((ingredient: string) => {
      setIngredients(prev => [...prev, ingredient]);
   }, []);

   const removeIngredient = useCallback((index: number) => {
      setIngredients(prev => prev.filter((_, i) => i !== index));
   }, []);

   async function fetchRecipes() {
      if (ingredients.length === 0) return;

      setResult('');
      setLoading(true);

      try {
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
         });

         if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
         }
         if (!response.body) {
            throw new Error('Empty streaming response');
         }

         const reader = response.body.getReader();
         const decoder = new TextDecoder();
         let buffer = '';
         let streamEnded = false;

         const appendEvent = (rawEvent: string) => {
            const data = rawEvent
               .split('\n')
               .filter(line => line.startsWith('data:'))
               .map(line => line.slice(5))
               .join('\n');

            if (!data) return;
            if (data === '[DONE]') {
               streamEnded = true;
               return;
            }

            setResult(prev => prev + data);
         };

         while (!streamEnded) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            buffer = buffer.replace(/\r\n/g, '\n');
            const events = buffer.split('\n\n');
            buffer = events.pop() ?? '';

            for (const event of events) {
               if (!event.trim()) continue;
               appendEvent(event);
               if (streamEnded) break;
            }
         }

         buffer += decoder.decode();
         buffer = buffer.replace(/\r\n/g, '\n');
         const remainingEvent = buffer.trim();
         if (!streamEnded && remainingEvent) {
            appendEvent(remainingEvent);
         }
      } catch (error) {
         console.error('Failed to fetch recipe:', error);
         setResult('There was an error loading the recipe. Please try again.');
      } finally {
         setLoading(false);
      }
   }

   function handleReset() {
      setIngredients([]);
      setResult('');
   }

   return (
      <main className='bg-background min-h-screen'>
         <div className='mx-auto max-w-6xl px-6 py-12 md:py-20'>
            {/* Header */}
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

            {/* Ingredient Input */}
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
                        onValueChange={value => setLanguage(value as 'de' | 'en')}
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
                  onAdd={addIngredient}
                  onRemove={removeIngredient}
                  disabled={loading}
               />
               <div className='mt-3'>
                  <Suggestions onSelect={addIngredient} existing={ingredients} disabled={loading} />
               </div>
            </section>

            {/* Actions */}
            <div className='mb-10 flex items-center gap-3'>
               <Button
                  onClick={fetchRecipes}
                  disabled={loading || ingredients.length === 0}
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
               {(ingredients.length > 0 || result) && !loading && (
                  <Button
                     variant='ghost'
                     size='lg'
                     onClick={handleReset}
                     className='text-muted-foreground hover:text-foreground rounded-xl'
                  >
                     <RotateCcw className='size-4' />
                     Reset
                  </Button>
               )}
            </div>

            {/* Recipe Result */}
            <section aria-label='Recipe result' aria-live='polite'>
               <RecipeStream content={result} loading={loading} />
            </section>
         </div>
      </main>
   );
}
