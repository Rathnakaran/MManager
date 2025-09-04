'use server';

/**
 * @fileOverview AI-powered financial advisor flow that analyzes spending data and provides personalized tips and summaries.
 *
 * - getFinancialAdvice - A function that takes budget and spending data and returns personalized financial advice.
 * - FinancialAdviceInput - The input type for the getFinancialAdvice function.
 * - FinancialAdviceOutput - The return type for the getFinancialAdvice function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FinancialAdviceInputSchema = z.object({
  totalSpent: z.number().describe('The total amount spent by the user.'),
  remainingBudget: z.number().describe('The remaining budget of the user.'),
  expenseBreakdown: z.record(z.string(), z.number()).describe('A breakdown of expenses by category, with category names as keys and spending amounts as values.'),
});
export type FinancialAdviceInput = z.infer<typeof FinancialAdviceInputSchema>;

const FinancialAdviceOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the user\'s financial situation.'),
  tips: z.array(z.string()).describe('Personalized tips for improving the user\'s financial habits.'),
});
export type FinancialAdviceOutput = z.infer<typeof FinancialAdviceOutputSchema>;

export async function getFinancialAdvice(input: FinancialAdviceInput): Promise<FinancialAdviceOutput> {
  return financialAdviceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'financialAdvicePrompt',
  input: {schema: FinancialAdviceInputSchema},
  output: {schema: FinancialAdviceOutputSchema},
  prompt: `You are a friendly and helpful AI financial advisor. Analyze the user's spending data and provide a concise summary and personalized tips.

Total Spent: {{{totalSpent}}}
Remaining Budget: {{{remainingBudget}}}
Expense Breakdown:
{{#each expenseBreakdown}}
- {{key}}: {{{this}}}
{{/each}}

Based on this information, provide a summary of the user's financial situation and suggest personalized tips to improve their financial habits. Focus on being encouraging and supportive.`, 
});

const financialAdviceFlow = ai.defineFlow(
  {
    name: 'financialAdviceFlow',
    inputSchema: FinancialAdviceInputSchema,
    outputSchema: FinancialAdviceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
