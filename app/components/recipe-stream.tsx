'use client';

import ReactMarkdown, { type Components } from 'react-markdown';

import { hasExpectedRecipeStructure } from '@/lib/recipes/recipe-format';

interface RecipeStreamProps {
   content: string;
   loading: boolean;
}

const markdownComponents: Components = {
   h2: ({ children }) => (
      <h2 className='border-border text-foreground mt-8 border-b pb-2 text-xl font-semibold tracking-tight first:mt-0'>
         {children}
      </h2>
   ),
   h3: ({ children }) => (
      <h3 className='text-muted-foreground mt-4 text-xs font-semibold tracking-wider uppercase'>{children}</h3>
   ),
   p: ({ children }) => <p className='text-foreground mt-2 text-sm leading-relaxed'>{children}</p>,
   ul: ({ children }) => <ul className='marker:text-accent mt-2 list-disc space-y-1 pl-5'>{children}</ul>,
   ol: ({ children }) => (
      <ol className='marker:text-accent mt-2 list-decimal space-y-2 pl-5 marker:font-medium'>{children}</ol>
   ),
   li: ({ children }) => <li className='pl-1 text-sm leading-relaxed'>{children}</li>,
   strong: ({ children }) => <strong className='text-foreground font-semibold'>{children}</strong>,
};

export function RecipeStream({ content, loading }: RecipeStreamProps) {
   const showFallback = !loading && !!content && !hasExpectedRecipeStructure(content);

   if (!content && !loading) {
      return (
         <div className='flex flex-col items-center justify-center py-16 text-center'>
            <p className='text-muted-foreground max-w-[320px] text-sm leading-relaxed'>
               Enter your ingredients and let us suggest
               <br />a matching recipe.
            </p>
         </div>
      );
   }

   return (
      <div className='relative'>
         <div className='max-w-none'>
            {showFallback ? (
               <div className='border-border bg-muted/30 space-y-4 rounded-lg border border-dashed p-4'>
                  <h2 className='text-foreground text-lg font-semibold'>Recipe output</h2>
                  <p className='text-muted-foreground text-sm'>
                     The response did not fully match the expected format. The raw text is shown below.
                  </p>
                  <div>
                     <h3 className='text-muted-foreground mb-2 text-xs font-semibold tracking-wider uppercase'>
                        Raw text
                     </h3>
                     <pre className='text-foreground font-sans text-sm leading-relaxed wrap-break-word whitespace-pre-wrap'>
                        {content}
                     </pre>
                  </div>
               </div>
            ) : (
               <div className='text-foreground font-sans text-sm leading-relaxed'>
                  <ReactMarkdown components={markdownComponents}>{content}</ReactMarkdown>
                  {loading && <span className='bg-accent ml-0.5 inline-block h-4 w-[2px] animate-pulse' />}
               </div>
            )}
         </div>
         {loading && !content && (
            <div className='flex items-center gap-3 py-4'>
               <div className='flex gap-1'>
                  <span className='bg-accent size-1.5 animate-bounce rounded-full [animation-delay:0ms]' />
                  <span className='bg-accent size-1.5 animate-bounce rounded-full [animation-delay:150ms]' />
                  <span className='bg-accent size-1.5 animate-bounce rounded-full [animation-delay:300ms]' />
               </div>
               <span className='text-muted-foreground text-sm'>Generating recipe...</span>
            </div>
         )}
      </div>
   );
}
