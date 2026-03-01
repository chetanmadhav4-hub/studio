'use server';
/**
 * @fileOverview This file implements a Genkit flow to generate a friendly and personalized order confirmation message
 * after an SMM order is successfully placed.
 *
 * - aiGeneratedOrderConfirmation - A function that handles generating the order confirmation message.
 * - AiGeneratedOrderConfirmationInput - The input type for the aiGeneratedOrderConfirmation function.
 * - AiGeneratedOrderConfirmationOutput - The return type for the aiGeneratedOrderConfirmation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiGeneratedOrderConfirmationInputSchema = z.object({
  orderId: z.string().describe('The unique identifier for the SMM order.'),
  quantity: z.number().describe('The quantity of the service ordered (e.g., number of followers).'),
  serviceName: z.string().describe('The name of the service ordered (e.g., "Instagram Followers").'),
  instagramProfileLink: z
    .string()
    .url()
    .describe('The user’s Instagram profile URL for the order.'),
  price: z.number().describe('The total price of the order.'),
  startTime: z
    .string()
    .describe('The estimated start time for the order (e.g., "0-30 minutes").'),
});
export type AiGeneratedOrderConfirmationInput = z.infer<
  typeof AiGeneratedOrderConfirmationInputSchema
>;

const AiGeneratedOrderConfirmationOutputSchema = z.object({
  message: z.string().describe('The AI-generated friendly and personalized order confirmation message.'),
});
export type AiGeneratedOrderConfirmationOutput = z.infer<
  typeof AiGeneratedOrderConfirmationOutputSchema
>;

export async function aiGeneratedOrderConfirmation(
  input: AiGeneratedOrderConfirmationInput
): Promise<AiGeneratedOrderConfirmationOutput> {
  return aiGeneratedOrderConfirmationFlow(input);
}

const orderConfirmationPrompt = ai.definePrompt({
  name: 'orderConfirmationPrompt',
  input: {schema: AiGeneratedOrderConfirmationInputSchema},
  output: {schema: AiGeneratedOrderConfirmationOutputSchema},
  prompt: `You are a helpful assistant for the InstaFlow Bot.

Generate a clean and structured order confirmation message. 

CRITICAL: You MUST use multiple lines and bullet points exactly like this (each detail on a NEW line):

🎉 *Woohoo! Your InstaFlow order successfully created!*

- *Order ID:* {{{orderId}}}
- *Service:* {{{serviceName}}}
- *Quantity:* {{{quantity}}}
- *Amount:* ₹{{{price}}}
- *Start Time:* {{{startTime}}}
- *Target Link:* {{{instagramProfileLink}}}

Keep it professional yet friendly. Ensure each point is on its own line. Do NOT merge them into a single block of text. Use double newlines between the header and the list.`,
});

const aiGeneratedOrderConfirmationFlow = ai.defineFlow(
  {
    name: 'aiGeneratedOrderConfirmationFlow',
    inputSchema: AiGeneratedOrderConfirmationInputSchema,
    outputSchema: AiGeneratedOrderConfirmationOutputSchema,
  },
  async input => {
    const {output} = await orderConfirmationPrompt(input);
    return output!;
  }
);