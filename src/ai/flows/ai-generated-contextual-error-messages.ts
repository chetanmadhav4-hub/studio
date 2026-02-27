'use server';
/**
 * @fileOverview This file implements a Genkit flow for generating contextual and empathetic error messages.
 *
 * - generateContextualErrorMessage - A function that handles the generation of error messages.
 * - GenerateErrorMessageInput - The input type for the generateContextualErrorMessage function.
 * - GenerateErrorMessageOutput - The return type for the generateContextualErrorMessage function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateErrorMessageInputSchema = z.object({
  errorType: z
    .enum(['INVALID_QUANTITY', 'PAYMENT_FAILURE', 'SMM_API_FAILURE', 'INVALID_URL', 'UNKNOWN'])
    .describe('The type of error that occurred.'),
  details: z.string().describe('Specific details about the error.'),
  currentState: z
    .string()
    .describe(
      'A brief description of the current state or step in the user \'s interaction flow.'
    ),
});
export type GenerateErrorMessageInput = z.infer<
  typeof GenerateErrorMessageInputSchema
>;

const GenerateErrorMessageOutputSchema = z.object({
  errorMessage: z.string().describe('A helpful, empathetic, and contextual error message.'),
});
export type GenerateErrorMessageOutput = z.infer<
  typeof GenerateErrorMessageOutputSchema
>;

export async function generateContextualErrorMessage(
  input: GenerateErrorMessageInput
): Promise<GenerateErrorMessageOutput> {
  return generateContextualErrorMessageFlow(input);
}

const generateErrorMessagePrompt = ai.definePrompt({
  name: 'generateErrorMessagePrompt',
  input: { schema: GenerateErrorMessageInputSchema },
  output: { schema: GenerateErrorMessageOutputSchema },
  prompt: `You are an empathetic and helpful AI assistant for the InstaFlow Bot.
Your task is to generate a contextual error message for a user based on the provided error details.
The message should be clear, empathetic, explain what went wrong, and suggest a next step if appropriate.

Error Type: {{{errorType}}}
Details: {{{details}}}
Current State: {{{currentState}}}

Craft a message that guides the user effectively. Start the message with an emoji relevant to the error, e.g. ⚠️, ❌, or ⛔.
`,
});

const generateContextualErrorMessageFlow = ai.defineFlow(
  {
    name: 'generateContextualErrorMessageFlow',
    inputSchema: GenerateErrorMessageInputSchema,
    outputSchema: GenerateErrorMessageOutputSchema,
  },
  async (input) => {
    const { output } = await generateErrorMessagePrompt(input);
    return output!;
  }
);
