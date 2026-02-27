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
    .describe('The user\u2019s Instagram profile URL for the order.'),
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
  prompt: `You are a friendly and helpful assistant for the InstaFlow Bot.

Generate a warm, friendly, and personalized order confirmation message for a customer who has successfully placed an SMM order.

The message should include the following details:
- Order ID: {{{orderId}}}
- Service: {{{serviceName}}}
- Quantity: {{{quantity}}}
- Instagram Profile: {{{instagramProfileLink}}}
- Total Price: ₹{{{price}}}
- Estimated Start Time: {{{startTime}}}

Ensure the tone is reassuring and celebratory. Add relevant emojis to make it more engaging.

Example:
🎉 Your InstaFlow order (ID: XYZ123) for 1000 Instagram Followers has been successfully placed! We're excited to help you grow. Your profile: https://instagram.com/myprofile. Total paid: ₹120. Expect your order to start in 0-30 minutes. Thank you for choosing InstaFlow! ✨

Now, generate the message for the following details:
Order ID: {{{orderId}}}
Service: {{{serviceName}}}
Quantity: {{{quantity}}}
Instagram Profile: {{{instagramProfileLink}}}
Total Price: ₹{{{price}}}
Estimated Start Time: {{{startTime}}} `,
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
