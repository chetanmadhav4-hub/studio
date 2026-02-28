
import { BotState, UserSession } from './bot-types';
import { aiGeneratedOrderConfirmation } from '@/ai/flows/ai-generated-order-confirmation';
import { generateContextualErrorMessage } from '@/ai/flows/ai-generated-contextual-error-messages';

export const SERVICES_CONFIG: Record<string, { name: string; pricePer1000: number; min: number }> = {
  '1': { name: 'Instagram Followers', pricePer1000: 87, min: 100 },
  '2': { name: 'Instagram Likes', pricePer1000: 18, min: 100 },
  '3': { name: 'Instagram Views', pricePer1000: 0.8, min: 100 },
  '4': { name: 'Instagram Shares', pricePer1000: 7, min: 100 },
  '5': { name: 'Instagram Comments', pricePer1000: 278, min: 10 },
  '6': { name: 'Instagram Story Views', pricePer1000: 10, min: 100 },
};

export function calculatePrice(quantity: number, pricePer1000: number): number {
  return Math.max(1, Math.ceil((quantity / 1000) * pricePer1000));
}

export function isValidInstagramUrl(url: string): boolean {
  const regex = /^(https?:\/\/)?(www\.)?instagram\.com\/[a-zA-Z0-9_.]+/;
  return regex.test(url);
}

export function isValidUtr(utr: string): boolean {
  const regex = /^\d{12}$/;
  return regex.test(utr.trim());
}

export async function processBotMessage(
  session: UserSession,
  messageText: string
): Promise<{ reply: string; nextState: Partial<UserSession> }> {
  const normalizedMsg = messageText.trim().toLowerCase();

  // GLOBAL SERVICE INTERRUPTION
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

  // MENU COMMAND
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

  // STATE-BASED LOGIC
  switch (session.state) {
    case 'AWAITING_SERVICE_SELECTION': {
      return {
        reply: "⚠️ Kripya niche diye gaye buttons mein se ek select karein.\n\nType 'MENU' to see all services.",
        nextState: { state: 'AWAITING_SERVICE_SELECTION' },
      };
    }

    case 'AWAITING_QUANTITY': {
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
        } catch (e) {}
        
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
        const price = session.data.price || 0;
        const upiId = 'smmxpressbot@slc';
        const accountName = 'CHETAN KUMAR MEGHWAL';
        const upiPayload = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(accountName)}&am=${price}&cu=INR`;
        const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(upiPayload)}`;

        return {
          reply: `📲 *Pay via any UPI app*\n\nAapko ₹*${price}* pay karne hain. QR code scan karein ya UPI ID use karein.\n\n👤 *Account:* ${accountName}\n🆔 *UPI ID:* ${upiId}\n💰 *Amount:* ₹${price}\n\n📸 *SCAN TO PAY:*\n${qrImageUrl}\n\n${upiPayload}\n\n✅ Payment ke baad, apna Instagram Link and UTR ID bhejein order start karne ke liye:\n\nOPTION: 🔗 Send Instagram Link\nOPTION: 🆔 Send UTR ID`,
          nextState: {
            state: 'AWAITING_PAYMENT_DETAILS',
            data: { ...session.data },
          },
        };
      }
      return {
        reply: "⚠️ Aage badhne ke liye niche diye gaye buttons ka istemal karein.\n\nOPTION: YES, PAY NOW\nOPTION: MENU",
        nextState: { state: 'AWAITING_PAYMENT_CONFIRMATION' },
      };
    }

    case 'AWAITING_PAYMENT_DETAILS': {
      if (normalizedMsg.includes('instagram link')) {
        return { reply: "🔗 Kripya apna *Instagram Profile/Post Link* bhejein:", nextState: { state: 'AWAITING_LINK' } };
      }
      if (normalizedMsg.includes('utr id')) {
        return { reply: "🆔 Kripya apna 12-digit *UTR ID / Transaction ID* bhejein:", nextState: { state: 'AWAITING_UTR_ID' } };
      }
      if (normalizedMsg.includes('submit order')) {
        if (!session.data.targetLink || !session.data.utrId) {
          return { reply: "⚠️ Dono details (Link aur UTR ID) dena zaroori hai.\n\nOPTION: 🔗 Send Instagram Link\nOPTION: 🆔 Send UTR ID", nextState: { state: 'AWAITING_PAYMENT_DETAILS' } };
        }
        
        const orderId = `INSTA-${Math.floor(100000 + Math.random() * 900000)}`;
        try {
          const confirmation = await aiGeneratedOrderConfirmation({
            orderId,
            quantity: session.data.quantity || 0,
            serviceName: session.data.serviceName || 'Instagram Service',
            instagramProfileLink: session.data.targetLink,
            price: session.data.price || 0,
            startTime: '0-30 minutes',
          });
          return {
            reply: confirmation.message + "\n\nNaya order lagane ke liye click karein:\n\nOPTION: MENU",
            nextState: { state: 'ORDER_PLACED', data: { ...session.data, orderId } }
          };
        } catch (e) {
          return {
            reply: `🎉 *Order Created!* ID: ${orderId}\n\nNaya order lagane ke liye click karein:\n\nOPTION: MENU`,
            nextState: { state: 'ORDER_PLACED', data: { ...session.data, orderId } }
          };
        }
      }

      const hasLink = !!session.data.targetLink;
      const hasUtr = !!session.data.utrId;
      let prompt = "✅ Details fill karein:\n\n";
      if (!hasLink) prompt += "OPTION: 🔗 Send Instagram Link\n";
      else prompt += "✅ Instagram Link: Received\n";
      
      if (!hasUtr) prompt += "OPTION: 🆔 Send UTR ID\n";
      else prompt += "✅ UTR ID: Received\n";
      
      if (hasLink && hasUtr) prompt += "\n✨ Ab order submit karein:\nOPTION: 🚀 SUBMIT ORDER";

      return { reply: prompt, nextState: { state: 'AWAITING_PAYMENT_DETAILS' } };
    }

    case 'AWAITING_LINK': {
      if (isValidInstagramUrl(messageText)) {
        const newData = { ...session.data, targetLink: messageText };
        const hasUtr = !!newData.utrId;
        return {
          reply: `✅ Link save ho gaya!${!hasUtr ? "\n\nAb UTR ID bhejein:" : "\n\nDetails check karke submit karein:"}\n\n${!hasUtr ? "OPTION: 🆔 Send UTR ID" : "OPTION: 🚀 SUBMIT ORDER"}`,
          nextState: { state: 'AWAITING_PAYMENT_DETAILS', data: newData },
        };
      }
      return { reply: "⚠️ Sahi Instagram link bhejein (e.g., https://instagram.com/username)", nextState: { state: 'AWAITING_LINK' } };
    }

    case 'AWAITING_UTR_ID': {
      if (isValidUtr(messageText)) {
        const newData = { ...session.data, utrId: messageText.trim() };
        const hasLink = !!newData.targetLink;
        return {
          reply: `✅ UTR ID save ho gaya!${!hasLink ? "\n\nAb Instagram Link bhejein:" : "\n\nDetails check karke submit karein:"}\n\n${!hasLink ? "OPTION: 🔗 Send Instagram Link" : "OPTION: 🚀 SUBMIT ORDER"}`,
          nextState: { state: 'AWAITING_PAYMENT_DETAILS', data: newData },
        };
      }
      return { reply: "⚠️ Kripya sahi 12-digit UTR ID bhejein jo payment app mein dikhta hai.", nextState: { state: 'AWAITING_UTR_ID' } };
    }

    default:
      return {
        reply: "👋 Welcome back! Menu dekhne ke liye *HI* bhejein.\n\nOPTION: MENU",
        nextState: { state: 'START', data: {} },
      };
  }
}
