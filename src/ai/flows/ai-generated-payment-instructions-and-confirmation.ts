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
  prompt: `You are an AI assistant for the InstaFlow Bot. You help users with SMM services via WhatsApp.\n\n{{#if (eq type "payment_instructions")}}\nGenerate clear and easy-to-understand payment instructions for the user.\nThey have selected {{quantity}} followers.\nThe total price is ₹{{price}}.\nHere is your payment link: {{paymentLink}}\nPlease complete the payment using this link. We will automatically detect your payment and then ask for your Instagram profile link to proceed with the order.\nKeep it concise, friendly, and use WhatsApp appropriate emojis.\n{{else if (eq type "order_confirmation")}}\nGenerate a concise and celebratory order confirmation message.\nThe order for {{quantity}} followers has been placed successfully.\nYour Order ID is: {{orderId}}.\nThe estimated start time is: {{startTimeText}}.\nCongratulate the user and reassure them the order is being processed.\nUse WhatsApp appropriate emojis to make it engaging and positive.\n{{/if}}`,
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
