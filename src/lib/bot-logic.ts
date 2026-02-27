
import { BotState, UserSession } from './bot-types';
import { aiGeneratedOrderConfirmation } from '@/ai/flows/ai-generated-order-confirmation';
import { generateContextualErrorMessage } from '@/ai/flows/ai-generated-contextual-error-messages';
import { aiGeneratedPaymentInstructionsAndConfirmation } from '@/ai/flows/ai-generated-payment-instructions-and-confirmation';
import placeholderData from './placeholder-images.json';

export const PRICE_PER_1000 = 120;
export const MINIMUM_QUANTITY = 100;

// Get static QR code from placeholder images
const STATIC_QR_URL = placeholderData.placeholderImages.find(img => img.id === 'static-qr-code')?.imageUrl || '';

export function calculatePrice(quantity: number): number {
  return Math.ceil((quantity / 1000) * PRICE_PER_1000);
}

export function isValidInstagramUrl(url: string): boolean {
  const regex = /^(https?:\/\/)?(www\.)?instagram\.com\/[a-zA-Z0-9_.]+\/?/;
  return regex.test(url);
}

/**
 * Handles the state machine logic for the bot.
 * Returns the message to be sent back to the user and the next state data.
 */
export async function processBotMessage(
  session: UserSession,
  messageText: string
): Promise<{ reply: string; nextState: Partial<UserSession> }> {
  const normalizedMsg = messageText.trim().toLowerCase();

  // Reset if user says Hi or Start
  if (normalizedMsg === 'hi' || normalizedMsg === 'start' || normalizedMsg === 'menu') {
    return {
      reply: "👋 Welcome to InstaFlow Bot!\n\nChoose your service:\n1️⃣ Instagram Followers",
      nextState: {
        state: 'AWAITING_QUANTITY',
        data: {},
      },
    };
  }

  switch (session.state) {
    case 'AWAITING_QUANTITY': {
      if (normalizedMsg === '1' || normalizedMsg === 'instagram followers') {
        return {
          reply: "📊 How many followers do you want? (Minimum 100)",
          nextState: { state: 'AWAITING_QUANTITY' },
        };
      }

      const quantity = parseInt(normalizedMsg);
      if (isNaN(quantity) || quantity < MINIMUM_QUANTITY) {
        const error = await generateContextualErrorMessage({
          errorType: 'INVALID_QUANTITY',
          details: `User input: ${messageText}. Minimum required is ${MINIMUM_QUANTITY}.`,
          currentState: 'Selecting quantity for Instagram Followers',
        });
        return {
          reply: error.errorMessage,
          nextState: { state: 'AWAITING_QUANTITY' },
        };
      }

      const price = calculatePrice(quantity);
      return {
        reply: `✅ You selected ${quantity} followers.\n💰 Total price: ₹${price}\n\nReply *YES* to see the payment QR code for ₹${price}.`,
        nextState: {
          state: 'AWAITING_PAYMENT_CONFIRMATION',
          data: { ...session.data, quantity, price },
        },
      };
    }

    case 'AWAITING_PAYMENT_CONFIRMATION': {
      if (normalizedMsg === 'yes') {
        const quantity = session.data.quantity || 0;
        const price = session.data.price || 0;
        
        const accountHolder = 'CHETAN KUMAR MEGHWAL';
        const upiId = 'smmxpressbot@slc';
        
        const instructions = await aiGeneratedPaymentInstructionsAndConfirmation({
          type: 'payment_instructions' as any,
          quantity,
          price,
          paymentLink: `upi://pay?pa=${upiId}&pn=${encodeURIComponent(accountHolder)}&am=${price}&cu=INR`,
        });

        return {
          reply: `${instructions.message}\n\n👤 *Account:* ${accountHolder}\n🆔 *UPI ID:* ${upiId}\n📸 *Scan this QR to pay:* \n${STATIC_QR_URL}\n\n✅ Payment karne ke baad, apna *Instagram Profile Link* yahan bheje order start karne ke liye.`,
          nextState: {
            state: 'AWAITING_PROFILE_LINK',
            data: { ...session.data },
          },
        };
      }
      return {
        reply: "⚠️ Please reply *YES* to proceed to payment or *MENU* to start over.",
        nextState: { state: 'AWAITING_PAYMENT_CONFIRMATION' },
      };
    }

    case 'AWAITING_PROFILE_LINK': {
      if (!isValidInstagramUrl(messageText)) {
        const error = await generateContextualErrorMessage({
          errorType: 'INVALID_URL',
          details: `User provided: ${messageText}. Needs to be a valid Instagram profile link.`,
          currentState: 'Providing profile link after payment',
        });
        return {
          reply: error.errorMessage + "\n\nKripya sahi Instagram profile link bheje.",
          nextState: { state: 'AWAITING_PROFILE_LINK' },
        };
      }

      const profileLink = messageText;
      const orderId = `INSTA-${Math.floor(100000 + Math.random() * 900000)}`;
      
      const confirmation = await aiGeneratedOrderConfirmation({
        orderId,
        quantity: session.data.quantity || 0,
        serviceName: 'Instagram Followers',
        instagramProfileLink: profileLink,
        price: session.data.price || 0,
        startTime: '0-30 minutes',
      });

      return {
        reply: confirmation.message,
        nextState: {
          state: 'ORDER_PLACED',
          data: { ...session.data, profileLink, orderId },
        },
      };
    }

    default:
      return {
        reply: "👋 Welcome back! Send *HI* to see the menu.",
        nextState: { state: 'START', data: {} },
      };
  }
}
