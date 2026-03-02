'use client';

import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';
import { useState, useRef, type KeyboardEvent } from 'react';

import { normalizeIngredient } from '@/lib/ingredients';

interface IngredientInputProps {
   ingredients: string[];
   onAdd: (ingredient: string) => void;
   onRemove: (index: number) => void;
   disabled?: boolean;
}

export function IngredientInput({ ingredients, onAdd, onRemove, disabled = false }: IngredientInputProps) {
   const [value, setValue] = useState('');
   const inputRef = useRef<HTMLInputElement>(null);

   function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
      if (e.key === 'Enter' || e.key === ',') {
         e.preventDefault();
         addIngredient();
      }
      if (e.key === 'Backspace' && value === '' && ingredients.length > 0) {
         onRemove(ingredients.length - 1);
      }
   }

   function addIngredient() {
      const normalized = normalizeIngredient(value);
      if (!normalized) return;

      onAdd(normalized);
      setValue('');
   }

   return (
      <div
         className='border-border bg-card focus-within:border-accent focus-within:ring-accent/20 flex min-h-[52px] cursor-text flex-wrap items-center gap-2 rounded-xl border px-4 py-3 transition-colors focus-within:ring-2'
         onClick={() => inputRef.current?.focus()}
         role='group'
         aria-label='Enter ingredients'
      >
         {ingredients.map((ingredient, index) => (
            <Badge
               key={`${ingredient}-${index}`}
               variant='secondary'
               className='bg-secondary text-secondary-foreground flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium select-none'
            >
               {ingredient}
               {!disabled && (
                  <button
                     type='button'
                     onClick={e => {
                        e.stopPropagation();
                        onRemove(index);
                     }}
                     className='hover:bg-foreground/10 ml-0.5 rounded-full p-0.5 transition-colors'
                     aria-label={`Remove ${ingredient}`}
                  >
                     <X className='size-3' />
                  </button>
               )}
            </Badge>
         ))}
         <div className='flex min-w-[140px] flex-1 items-center gap-1'>
            <input
               ref={inputRef}
               type='text'
               value={value}
               onChange={e => setValue(e.target.value)}
               onKeyDown={handleKeyDown}
               disabled={disabled}
               placeholder={ingredients.length === 0 ? 'Tomatoes, onions, garlic...' : 'Add another ingredient...'}
               className='text-foreground placeholder:text-muted-foreground flex-1 bg-transparent text-sm outline-none disabled:cursor-not-allowed disabled:opacity-50'
               aria-label='Enter ingredient'
            />
            {value.trim() && (
               <button
                  type='button'
                  onClick={addIngredient}
                  className='text-muted-foreground hover:text-foreground hover:bg-secondary rounded-full p-1 transition-colors'
                  aria-label='Add ingredient'
               >
                  <Plus className='size-4' />
               </button>
            )}
         </div>
      </div>
   );
}
