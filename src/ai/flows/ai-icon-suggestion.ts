'use server';

/**
 * @fileOverview This file contains the AI icon suggestion flow.
 *
 * - suggestIcon - A function that suggests a Lucide icon based on the category name.
 * - SuggestIconInput - The input type for the suggestIcon function.
 * - SuggestIconOutput - The return type for the suggestIcon function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestIconInputSchema = z.object({
  categoryName: z.string().describe('The name of the budget category.'),
});
export type SuggestIconInput = z.infer<typeof SuggestIconInputSchema>;

const SuggestIconOutputSchema = z.object({
  iconName: z.string().describe('The name of the Lucide icon to use.'),
});
export type SuggestIconOutput = z.infer<typeof SuggestIconOutputSchema>;

export async function suggestIcon(input: SuggestIconInput): Promise<SuggestIconOutput> {
  return suggestIconFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestIconPrompt',
  input: {schema: SuggestIconInputSchema},
  output: {schema: SuggestIconOutputSchema},
  prompt: `You are an expert in financial applications and user interface design.

  Given the name of a budget category, you will suggest the most appropriate Lucide icon name to visually represent it in a user interface.

  Category Name: {{{categoryName}}}

  Suggest a relevant Lucide icon name:`,
});

const suggestIconFlow = ai.defineFlow(
  {
    name: 'suggestIconFlow',
    inputSchema: SuggestIconInputSchema,
    outputSchema: SuggestIconOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
