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

enum MessageType {
  PAYMENT_INSTRUCTIONS = 'payment_instructions',
  ORDER_CONFIRMATION = 'order_confirmation',
}

const AiGeneratedPaymentInstructionsAndConfirmationInputSchema = z.object({
  type: z.nativeEnum(MessageType).describe('The type of message to generate (payment_instructions or order_confirmation).'),
  quantity: z.number().optional().describe('The number of followers for the order.'),
  price: z.number().optional().describe('The calculated total price for the order.'),
  paymentLink: z.string().url().optional().describe('The dynamic payment link for the user.'),
  qrCodeUrl: z.string().url().optional().describe('The URL of the generated QR code image.'),
  orderId: z.string().optional().describe('The SMM panel order ID.'),
  startTimeText: z.string().optional().describe('Text indicating the estimated start time for the order (e.g., "0-30 minutes").'),
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

{{#if (eq type "payment_instructions")}}
Generate clear and easy-to-understand payment instructions for the user.
They have selected {{quantity}} followers.
The total price is ₹{{price}}.
Here is your payment link: {{paymentLink}}

IMPORTANT: Also mention that they can scan the QR code sent below to pay quickly.
Instructions:
1. Open any UPI app (PhonePe, Google Pay, Paytm).
2. Scan the QR code or click the link.
3. Complete the ₹{{price}} payment.
4. We will automatically detect your payment.

Keep it concise, friendly, and use WhatsApp appropriate emojis.
{{else if (eq type "order_confirmation")}}
Generate a concise and celebratory order confirmation message.
The order for {{quantity}} followers has been placed successfully.
Your Order ID is: {{orderId}}.
The estimated start time is: {{startTimeText}}.
Congratulate the user and reassure them the order is being processed.
Use WhatsApp appropriate emojis to make it engaging and positive.
{{/if}}`,
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
