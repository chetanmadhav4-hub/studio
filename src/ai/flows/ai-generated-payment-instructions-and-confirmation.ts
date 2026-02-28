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
  quantity: z.number().optional().describe('The number of followers/likes for the order.'),
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
  prompt: `You are an AI assistant for the InstaFlow Bot, helping users with SMM services.

Context:
- Message Type: {{{type}}}
- Quantity: {{{quantity}}}
- Price: ₹{{{price}}}
- Order ID: {{{orderId}}}
- Start Time: {{{startTimeText}}}

Instructions:
1. If type is 'payment_instructions': Create a short and clear message. Start with "Pay via any UPI app". Mention the amount ₹{{{price}}} and the account name CHETAN KUMAR MEGHWAL. Use emojis.
2. If type is 'order_confirmation': Create a happy message for Order ID {{{orderId}}}. Reassure them it starts in {{{startTimeText}}}.

Keep it friendly, using Hindi/English mix (Hinglish). Do NOT include URLs directly in the message text.`,
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
