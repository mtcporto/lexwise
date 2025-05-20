// src/ai/flows/counterargument-predictor.ts
'use server';
/**
 * @fileOverview Predicts potential counterarguments for a given case description.
 *
 * - predictCounterarguments - A function that handles the counterargument prediction process.
 * - PredictCounterargumentsInput - The input type for the predictCounterarguments function.
 * - PredictCounterargumentsOutput - The return type for the predictCounterarguments function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PredictCounterargumentsInputSchema = z.object({
  caseDescription: z
    .string()
    .describe('A detailed description of the case for which counterarguments are needed.'),
});
export type PredictCounterargumentsInput = z.infer<typeof PredictCounterargumentsInputSchema>;

const PredictCounterargumentsOutputSchema = z.object({
  counterarguments: z
    .array(z.string())
    .describe('A list of potential counterarguments based on laws and jurisprudence.'),
});
export type PredictCounterargumentsOutput = z.infer<typeof PredictCounterargumentsOutputSchema>;

export async function predictCounterarguments(
  input: PredictCounterargumentsInput
): Promise<PredictCounterargumentsOutput> {
  return predictCounterargumentsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'predictCounterargumentsPrompt',
  input: {schema: PredictCounterargumentsInputSchema},
  output: {schema: PredictCounterargumentsOutputSchema},
  prompt: `You are an AI legal assistant specializing in predicting counterarguments.

  Given the following case description, identify potential counterarguments that could be made based on relevant laws and jurisprudence. Provide a list of these counterarguments.

  Case Description: {{{caseDescription}}}`,
});

const predictCounterargumentsFlow = ai.defineFlow(
  {
    name: 'predictCounterargumentsFlow',
    inputSchema: PredictCounterargumentsInputSchema,
    outputSchema: PredictCounterargumentsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
