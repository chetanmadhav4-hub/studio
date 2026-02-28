import { BotState, UserSession } from './bot-types';
import { aiGeneratedOrderConfirmation } from '@/ai/flows/ai-generated-order-confirmation';
import { generateContextualErrorMessage } from '@/ai/flows/ai-generated-contextual-error-messages';
import { aiGeneratedPaymentInstructionsAndConfirmation } from '@/ai/flows/ai-generated-payment-instructions-and-confirmation';

export const SERVICES_CONFIG: Record<string, { name: string; pricePer1000: number; min: number }> = {
  '1': { name: 'Instagram Followers', pricePer1000: 87, min: 100 },
  '2': { name: 'Instagram Likes', pricePer1000: 18, min: 100 },
  '3': { name: 'Instagram Views', pricePer1000: 0.8, min: 100 },
  '4': { name: 'Instagram Shares', pricePer1000: 7, min: 100 },
  '5': { name: 'Instagram Comments', pricePer1000: 278, min: 10 },
  '6': { name: 'Instagram Story Views', pricePer1000: 10, min: 100 },
};

export function calculatePrice(quantity: number, pricePer1000: number): number {
  // Ensure minimum price of ₹1
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
    if (normalizedMsg.includes(service.name.toLowerCase()) || (normalizedMsg.length < 3 && normalizedMsg === key)) {
      interceptedServiceKey = key;
    }
  });

  if (interceptedServiceKey) {
    const selectedService = SERVICES_CONFIG[interceptedServiceKey];
    return {
      reply: `📊 Aapne *${selectedService.name}* select kiya hai.\n\nKitni quantity chahiye? (Minimum ${selectedService.min})`,
      nextState: { 
        state: 'AWAITING_QUANTITY',
        data: { ...session.data, serviceId: interceptedServiceKey, serviceName: selectedService.name }
      },
    };
  }

  // 2. MENU COMMAND
  if (normalizedMsg === 'hi' || normalizedMsg === 'start' || normalizedMsg === 'menu') {
    let menu = "👋 *Welcome to InstaFlow Bot!*\n\nNiche di gayi list mein se koi bhi service select karein:\n\n";
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
        reply: "⚠️ Kripya niche diye gaye buttons mein se ek select karein.\n\nType 'MENU' to see all services.",
        nextState: { state: 'AWAITING_SERVICE_SELECTION' },
      };
    }

    case 'AWAITING_QUANTITY': {
      // Try to extract only numbers from the message
      const numberMatch = normalizedMsg.match(/\d+/);
      const quantity = numberMatch ? parseInt(numberMatch[0]) : NaN;
      
      const serviceId = session.data.serviceId || '1';
      const service = SERVICES_CONFIG[serviceId];

      if (isNaN(quantity) || quantity < service.min) {
        let errorMessage = `⚠️ Kripya sahi quantity enter karein. *${service.name}* ke liye minimum *${service.min}* chahiye.`;
        try {
          const errorRes = await generateContextualErrorMessage({
            errorType: 'INVALID_QUANTITY',
            details: `User input: ${messageText}. Minimum for ${service.name} is ${service.min}.`,
            currentState: `Selecting quantity for ${service.name}`,
          });
          errorMessage = errorRes.errorMessage;
        } catch (e) {
          console.error("AI Error:", e);
        }
        
        return {
          reply: errorMessage,
          nextState: { state: 'AWAITING_QUANTITY' },
        };
      }

      const price = calculatePrice(quantity, service.pricePer1000);
      return {
        reply: `✅ Aapne *${quantity} ${service.name}* select kiye hain.\n💰 Total price: *₹${price}*\n\nAage badhne ke liye confirm karein:\n\nOPTION: YES, PAY NOW\nOPTION: MENU`,
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
        
        const upiPayload = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(accountName)}&am=${price}&cu=INR`;
        const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(upiPayload)}`;

        let instructionsText = `Dost, aapko *${quantity}* followers ke liye *₹${price}* pay karne honge. QR code scan karein ya UPI ID use karein. Payment hone ke baad link bhejein.`;
        try {
          const instructions = await aiGeneratedPaymentInstructionsAndConfirmation({
            type: 'payment_instructions',
            quantity,
            price,
            paymentLink: upiPayload,
          });
          instructionsText = instructions.message;
        } catch (e) {
          console.error("AI Error:", e);
        }

        return {
          reply: `${instructionsText}\n\n👤 *Account:* ${accountName}\n🆔 *UPI ID:* ${upiId}\n💰 *Amount:* ₹${price}\n\n📸 *SCAN TO PAY ₹${price} FOR ${serviceName}:*\n${qrImageUrl}\n\n${upiPayload}\n\n✅ Payment ke baad, apna *Instagram Link* bhejein order start karne ke liye.`,
          nextState: {
            state: 'AWAITING_LINK',
            data: { ...session.data },
          },
        };
      }
      
      return {
        reply: "⚠️ Aage badhne ke liye niche diye gaye buttons ka istemal karein.\n\nOPTION: YES, PAY NOW\nOPTION: MENU",
        nextState: { state: 'AWAITING_PAYMENT_CONFIRMATION' },
      };
    }

    case 'AWAITING_LINK': {
      if (isValidInstagramUrl(messageText)) {
        const targetLink = messageText;
        const orderId = `INSTA-${Math.floor(100000 + Math.random() * 900000)}`;
        
        let confirmationText = `🎉 *Woohoo! Your InstaFlow order successfully created!*\n\n- *Order ID:* ${orderId}\n- *Service:* ${session.data.serviceName}\n- *Quantity:* ${session.data.quantity}\n- *Amount:* ₹${session.data.price}\n- *Start Time:* 0-30 minutes\n- *Target Link:* ${targetLink}`;
        
        try {
          const confirmation = await aiGeneratedOrderConfirmation({
            orderId,
            quantity: session.data.quantity || 0,
            serviceName: session.data.serviceName || 'Instagram Service',
            instagramProfileLink: targetLink,
            price: session.data.price || 0,
            startTime: '0-30 minutes',
          });
          confirmationText = confirmation.message;
        } catch (e) {
          console.error("AI Error:", e);
        }

        return {
          reply: confirmationText + "\n\nNaya order lagane ke liye niche select karein:\n\nOPTION: MENU\nOPTION: SUPPORT",
          nextState: {
            state: 'ORDER_PLACED',
            data: { ...session.data, targetLink, orderId },
          },
        };
      }

      let errorMsg = "⚠️ Kripya sahi Instagram link bhejein (e.g., https://instagram.com/username)";
      try {
        const error = await generateContextualErrorMessage({
          errorType: 'INVALID_URL',
          details: `User provided: ${messageText}. Needs to be a valid Instagram link.`,
          currentState: 'Providing link after payment',
        });
        errorMsg = error.errorMessage;
      } catch (e) {
        console.error("AI Error:", e);
      }
      
      return {
        reply: errorMsg + "\n\nKripya sahi Instagram link bhejein.",
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