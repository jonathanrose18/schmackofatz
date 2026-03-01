'use client';

import { Button } from '@/components/ui/button';

interface SuggestionsProps {
   suggestions: string[];
   onSelect: (ingredient: string) => void;
   disabled?: boolean;
}

export function Suggestions({ suggestions, onSelect, disabled }: SuggestionsProps) {
   if (suggestions.length === 0) return null;

   return (
      <div className='flex flex-wrap gap-1.5'>
         {suggestions.map(suggestion => (
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
