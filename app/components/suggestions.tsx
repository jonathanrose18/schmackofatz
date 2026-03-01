'use client';

import { Button } from '@/components/ui/button';

const SUGGESTIONS = [
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

interface SuggestionsProps {
   onSelect: (ingredient: string) => void;
   existing: string[];
   disabled?: boolean;
}

export function Suggestions({ onSelect, existing, disabled }: SuggestionsProps) {
   const available = SUGGESTIONS.filter(s => !existing.includes(s));

   if (available.length === 0) return null;

   return (
      <div className='flex flex-wrap gap-1.5'>
         {available.map(suggestion => (
            <Button
               key={suggestion}
               variant='outline'
               size='sm'
               onClick={() => onSelect(suggestion)}
               disabled={disabled}
               className='text-muted-foreground hover:text-foreground border-border/60 hover:border-border hover:bg-secondary/50 h-7 rounded-lg px-2.5 text-xs transition-all'
            >
               {suggestion}
            </Button>
         ))}
      </div>
   );
}
