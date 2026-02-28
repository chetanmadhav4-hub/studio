
import { BotState, UserSession } from './bot-types';
import { aiGeneratedOrderConfirmation } from '@/ai/flows/ai-generated-order-confirmation';
import { generateContextualErrorMessage } from '@/ai/flows/ai-generated-contextual-error-messages';
import { aiGeneratedPaymentInstructionsAndConfirmation } from '@/ai/flows/ai-generated-payment-instructions-and-confirmation';

export const SERVICES_CONFIG: Record<string, { name: string; pricePer1000: number; min: number }> = {
  '1': { name: 'Instagram Followers', pricePer1000: 120, min: 100 },
  '2': { name: 'Instagram Likes', pricePer1000: 60, min: 100 },
  '3': { name: 'Instagram Views', pricePer1000: 30, min: 100 },
  '4': { name: 'Instagram Shares', pricePer1000: 80, min: 100 },
  '5': { name: 'Instagram Comments', pricePer1000: 250, min: 10 },
  '6': { name: 'Instagram Story Views', pricePer1000: 50, min: 100 },
};

export function calculatePrice(quantity: number, pricePer1000: number): number {
  return Math.max(1, Math.ceil((quantity / 1000) * pricePer1000));
}

export function isValidInstagramUrl(url: string): boolean {
  const regex = /^(https?:\/\/)?(www\.)?instagram\.com\/[a-zA-Z0-9_.]+/;
  return regex.test(url);
}

/**
 * Handles the state machine logic for the bot.
 */
export async function processBotMessage(
  session: UserSession,
  messageText: string
): Promise<{ reply: string; nextState: Partial<UserSession> }> {
  const normalizedMsg = messageText.trim().toLowerCase();

  // 1. GLOBAL SERVICE INTERRUPTION (Allows switching service anytime)
  let interceptedServiceKey = '';
  Object.entries(SERVICES_CONFIG).forEach(([key, service]) => {
    // Check if the input matches a service name (button click or text)
    if (normalizedMsg.includes(service.name.toLowerCase())) {
      interceptedServiceKey = key;
    }
  });

  if (interceptedServiceKey) {
    const selectedService = SERVICES_CONFIG[interceptedServiceKey];
    return {
      reply: `📊 Aapne *${selectedService.name}* select kiya hai.\n\nKitni quantity chahiye? (Minimum ${selectedService.min})`,
      nextState: { 
        state: 'AWAITING_QUANTITY',
        data: { serviceId: interceptedServiceKey, serviceName: selectedService.name }
      },
    };
  }

  // 2. MENU COMMAND
  if (normalizedMsg === 'hi' || normalizedMsg === 'start' || normalizedMsg === 'menu') {
    let menu = "👋 *Welcome to InstaFlow Bot!*\n\nAsli automation ka maza lein. 🚀\n\nNiche di gayi list mein se koi bhi service select karein:\n\n";
    Object.entries(SERVICES_CONFIG).forEach(([_, service]) => {
      menu += `OPTION: ${service.name}\n`;
    });
    
    return {
      reply: menu,
      nextState: {
        state: 'AWAITING_SERVICE_SELECTION',
        data: {},
      },
    };
  }

  // 3. STATE-BASED LOGIC
  switch (session.state) {
    case 'AWAITING_SERVICE_SELECTION': {
      return {
        reply: "⚠️ Kripya niche diye gaye buttons mein se ek select karein.",
        nextState: { state: 'AWAITING_SERVICE_SELECTION' },
      };
    }

    case 'AWAITING_QUANTITY': {
      const quantity = parseInt(normalizedMsg);
      const serviceId = session.data.serviceId || '1';
      const service = SERVICES_CONFIG[serviceId];

      if (isNaN(quantity) || quantity < service.min) {
        const error = await generateContextualErrorMessage({
          errorType: 'INVALID_QUANTITY',
          details: `User input: ${messageText}. Minimum for ${service.name} is ${service.min}.`,
          currentState: `Selecting quantity for ${service.name}`,
        });
        return {
          reply: error.errorMessage,
          nextState: { state: 'AWAITING_QUANTITY' },
        };
      }

      const price = calculatePrice(quantity, service.pricePer1000);
      return {
        reply: `✅ Aapne *${quantity} ${service.name}* select kiye hain.\n💰 Total price: *₹${price}*\n\nAage badhne ke liye 'YES, PAY NOW' par click karein.\n\nOPTION: YES, PAY NOW\nOPTION: MENU`,
        nextState: {
          state: 'AWAITING_PAYMENT_CONFIRMATION',
          data: { ...session.data, quantity, price },
        },
      };
    }

    case 'AWAITING_PAYMENT_CONFIRMATION': {
      if (normalizedMsg.includes('yes') || normalizedMsg.includes('pay')) {
        const quantity = session.data.quantity || 0;
        const price = session.data.price || 0;
        const serviceName = session.data.serviceName || 'Service';
        
        const upiId = 'smmxpressbot@slc';
        const accountName = 'CHETAN KUMAR MEGHWAL';
        
        // Use a cleaner intent link for better detection
        const upiPayload = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(accountName)}&am=${price}&cu=INR`;
        // Reliable QR Code generation via goqr.me
        const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(upiPayload)}`;

        const instructions = await aiGeneratedPaymentInstructionsAndConfirmation({
          type: 'payment_instructions',
          quantity,
          price,
          paymentLink: upiPayload,
        });

        return {
          reply: `${instructions.message}\n\n👤 *Account:* ${accountName}\n🆔 *UPI ID:* ${upiId}\n💰 *Amount:* ₹${price}\n\n📸 *SCAN TO PAY ₹${price} FOR ${serviceName}:*\n${qrImageUrl}\n\n${upiPayload}\n\n✅ Payment ke baad, apna *Instagram Link* bhejein order start karne ke liye.`,
          nextState: {
            state: 'AWAITING_LINK',
            data: { ...session.data },
          },
        };
      }
      
      // If user types something else, redirect to menu or error
      return {
        reply: "⚠️ Aage badhne ke liye kripya niche diye gaye buttons ka istemal karein.\n\nOPTION: YES, PAY NOW\nOPTION: MENU",
        nextState: { state: 'AWAITING_PAYMENT_CONFIRMATION' },
      };
    }

    case 'AWAITING_LINK': {
      // If user provides a link, place order
      if (isValidInstagramUrl(messageText)) {
        const targetLink = messageText;
        const orderId = `INSTA-${Math.floor(100000 + Math.random() * 900000)}`;
        
        const confirmation = await aiGeneratedOrderConfirmation({
          orderId,
          quantity: session.data.quantity || 0,
          serviceName: session.data.serviceName || 'Instagram Service',
          instagramProfileLink: targetLink,
          price: session.data.price || 0,
          startTime: '0-30 minutes',
        });

        return {
          reply: confirmation.message + "\n\nNaya order lagane ke liye *MENU* likhein.\n\nOPTION: MENU",
          nextState: {
            state: 'ORDER_PLACED',
            data: { ...session.data, targetLink, orderId },
          },
        };
      }

      // If it's not a link and not a service button, show error
      const error = await generateContextualErrorMessage({
        errorType: 'INVALID_URL',
        details: `User provided: ${messageText}. Needs to be a valid Instagram link.`,
        currentState: 'Providing link after payment',
      });
      
      let replyWithMenu = error.errorMessage + "\n\nKripya sahi Instagram link bhejein (e.g., https://instagram.com/username)\n\nYa koi nayi service select karein:\n";
      Object.entries(SERVICES_CONFIG).forEach(([_, service]) => {
        replyWithMenu += `OPTION: ${service.name}\n`;
      });

      return {
        reply: replyWithMenu,
        nextState: { state: 'AWAITING_LINK' },
      };
    }

    default:
      return {
        reply: "👋 Welcome back! Menu dekhne ke liye *HI* bhejein.\n\nOPTION: MENU",
        nextState: { state: 'START', data: {} },
      };
  }
}
