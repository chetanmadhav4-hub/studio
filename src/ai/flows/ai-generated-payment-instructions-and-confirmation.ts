'use server';
/**
 * @fileOverview A Genkit flow for generating clear payment instructions and order confirmation messages.
 *
 * - aiGeneratedPaymentInstructionsAndConfirmation - A function that generates AI-powered messages for payment instructions or order confirmation.
 * - AiGeneratedPaymentInstructionsAndConfirmationInput - The input type for the aiGeneratedPaymentInstructionsAndConfirmation function.
 * - AiGeneratedPaymentInstructionsAndConfirmationOutput - The return type for the aiGeneratedPaymentInstructionsAndConfirmation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiGeneratedPaymentInstructionsAndConfirmationInputSchema = z.object({
  type: z.enum(['payment_instructions', 'order_confirmation']).describe('The type of message to generate.'),
  quantity: z.number().optional().describe('The number of followers for the order.'),
  price: z.number().optional().describe('The calculated total price for the order.'),
  paymentLink: z.string().optional().describe('The dynamic payment link for the user.'),
  orderId: z.string().optional().describe('The SMM panel order ID.'),
  startTimeText: z.string().optional().describe('Text indicating the estimated start time for the order.'),
});
export type AiGeneratedPaymentInstructionsAndConfirmationInput = z.infer<typeof AiGeneratedPaymentInstructionsAndConfirmationInputSchema>;

const AiGeneratedPaymentInstructionsAndConfirmationOutputSchema = z.object({
  message: z.string().describe('The AI-generated clear and easy-to-understand message.'),
});
export type AiGeneratedPaymentInstructionsAndConfirmationOutput = z.infer<typeof AiGeneratedPaymentInstructionsAndConfirmationOutputSchema>;

export async function aiGeneratedPaymentInstructionsAndConfirmation(
  input: AiGeneratedPaymentInstructionsAndConfirmationInput
): Promise<AiGeneratedPaymentInstructionsAndConfirmationOutput> {
  return aiGeneratedPaymentInstructionsAndConfirmationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePaymentConfirmationPrompt',
  input: {schema: AiGeneratedPaymentInstructionsAndConfirmationInputSchema},
  output: {schema: AiGeneratedPaymentInstructionsAndConfirmationOutputSchema},
  prompt: `You are an AI assistant for the InstaFlow Bot. You help users with SMM services via WhatsApp.

Context:
- Message Type: {{{type}}}
- Quantity: {{{quantity}}}
- Price: ₹{{{price}}}
- Order ID: {{{orderId}}}
- Start Time: {{{startTimeText}}}

Instructions:
1. If type is 'payment_instructions': Generate clear instructions to pay ₹{{{price}}} for {{{quantity}}} followers. Mention that they can use the UPI link or scan the QR code provided below the message. Tell them to pay to CHETAN KUMAR MEGHWAL (smmxpressbot@slc).
2. If type is 'order_confirmation': Generate a celebratory message for Order ID {{{orderId}}}. Reassure them it will start in {{{startTimeText}}}.

Keep it friendly, professional, and use WhatsApp emojis. Do NOT include any URLs in your message as they are provided separately.`,
});

const aiGeneratedPaymentInstructionsAndConfirmationFlow = ai.defineFlow(
  {
    name: 'aiGeneratedPaymentInstructionsAndConfirmationFlow',
    inputSchema: AiGeneratedPaymentInstructionsAndConfirmationInputSchema,
    outputSchema: AiGeneratedPaymentInstructionsAndConfirmationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
