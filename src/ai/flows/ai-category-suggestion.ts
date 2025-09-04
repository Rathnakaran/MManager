'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting a transaction category based on a transaction description.
 *
 * - suggestCategory - A function that takes a transaction description and a list of existing categories and suggests the most appropriate category.
 * - SuggestCategoryInput - The input type for the suggestCategory function.
 * - SuggestCategoryOutput - The return type for the suggestCategory function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestCategoryInputSchema = z.object({
  description: z
    .string()
    .describe('The description of the transaction to categorize.'),
  categories: z
    .array(z.string())
    .describe('A list of existing transaction categories.'),
});
export type SuggestCategoryInput = z.infer<typeof SuggestCategoryInputSchema>;

const SuggestCategoryOutputSchema = z.object({
  suggestedCategory: z
    .string()
    .describe('The AI-suggested transaction category.'),
});
export type SuggestCategoryOutput = z.infer<typeof SuggestCategoryOutputSchema>;

export async function suggestCategory(input: SuggestCategoryInput): Promise<SuggestCategoryOutput> {
  return suggestCategoryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestCategoryPrompt',
  input: {schema: SuggestCategoryInputSchema},
  output: {schema: SuggestCategoryOutputSchema},
  prompt: `Given the following transaction description and a list of existing categories, suggest the most appropriate category for the transaction.

Transaction Description: {{{description}}}

Existing Categories:
{{#each categories}}- {{{this}}}\n{{/each}}

Suggest the single most appropriate category from the list above. Only respond with the category name. If none of the categories are appropriate, respond with "Other".`,
});

const suggestCategoryFlow = ai.defineFlow(
  {
    name: 'suggestCategoryFlow',
    inputSchema: SuggestCategoryInputSchema,
    outputSchema: SuggestCategoryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
