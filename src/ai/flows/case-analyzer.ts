// src/ai/flows/case-analyzer.ts
'use server';
/**
 * @fileOverview Analyzes a case description and extracts relevant points.
 *
 * - analyzeCase - A function that handles the case analysis process.
 * - AnalyzeCaseInput - The input type for the analyzeCase function.
 * - AnalyzeCaseOutput - The return type for the analyzeCase function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeCaseInputSchema = z.object({
  caseDescription: z
    .string()
    .describe('A description of the case to be analyzed.'),
});
export type AnalyzeCaseInput = z.infer<typeof AnalyzeCaseInputSchema>;

const AnalyzeCaseOutputSchema = z.object({
  relevantPoints: z
    .string()
    .describe('The relevant points extracted from the case description.'),
});
export type AnalyzeCaseOutput = z.infer<typeof AnalyzeCaseOutputSchema>;

export async function analyzeCase(input: AnalyzeCaseInput): Promise<AnalyzeCaseOutput> {
  return analyzeCaseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeCasePrompt',
  input: {schema: AnalyzeCaseInputSchema},
  output: {schema: AnalyzeCaseOutputSchema},
  prompt: `You are a legal assistant. Your task is to analyze the case description provided and extract the relevant points.

Case Description: {{{caseDescription}}}

Relevant Points:`,
});

const analyzeCaseFlow = ai.defineFlow(
  {
    name: 'analyzeCaseFlow',
    inputSchema: AnalyzeCaseInputSchema,
    outputSchema: AnalyzeCaseOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
