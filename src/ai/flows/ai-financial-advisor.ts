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
  summary: z.string().describe("A concise summary of the user's financial situation, in Thanglish (Tamil-English mix). The summary must be exactly two sentences."),
  tips: z.array(z.string()).describe('A maximum of three personalized tips for improving the user\'s financial habits, in Thanglish (Tamil-English mix).'),
});
export type FinancialAdviceOutput = z.infer<typeof FinancialAdviceOutputSchema>;

export async function getFinancialAdvice(input: FinancialAdviceInput): Promise<FinancialAdviceOutput> {
  return financialAdviceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'financialAdvicePrompt',
  input: {schema: FinancialAdviceInputSchema},
  output: {schema: FinancialAdviceOutputSchema},
  prompt: `You are a friendly and helpful AI financial advisor from Chennai. Your responses must be in Thanglish (a mix of Tamil and English). Analyze the user's spending data and provide a concise summary and personalized tips. Keep it fun and encouraging.

Total Spent: {{{totalSpent}}}
Remaining Budget: {{{remainingBudget}}}
Expense Breakdown:
{{#each expenseBreakdown}}
- {{key}}: {{{this}}}
{{/each}}

Based on this information, provide a summary of the user's financial situation that is exactly two sentences long. Then, suggest a maximum of three personalized tips to improve their financial habits. Make sure the entire response is in Thanglish. For example: "Semma spending, thalaiva! Budget-a konjam paathu handle pannunga."`, 
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
