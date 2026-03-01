
import { BotState, UserSession } from './bot-types';

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

function formatOrderConfirmation(details: any): string {
  return `🎉 *Woohoo! Your InstaFlow order successfully created!*

- *Order ID:* ${details.orderId}
- *Service:* ${details.serviceName}
- *Quantity:* ${details.quantity}
- *Amount:* ₹${details.price}
- *Start Time:* 0-30 minutes
- *Target Link:* ${details.targetLink}`;
}

export async function processBotMessage(
  session: UserSession,
  messageText: string
): Promise<{ reply: string; nextState: Partial<UserSession> }> {
  const normalizedMsg = messageText.trim().toLowerCase();
  
  if (normalizedMsg.startsWith('submit_payment:')) {
    const detailsPart = messageText.substring('submit_payment:'.length).trim();
    const [link, utr] = detailsPart.split('|');

    if (!link || !isValidInstagramUrl(link.trim())) {
      return { 
        reply: "⚠️ Kripya sahi Instagram Profile/Post Link enter karein.\n\n[PAYMENT_FORM]", 
        nextState: { state: 'AWAITING_PAYMENT_DETAILS' } 
      };
    }
    if (!utr || !isValidUtr(utr.trim())) {
      return { 
        reply: "⚠️ Kripya sahi 12-digit UTR ID enter karein.\n\n[PAYMENT_FORM]", 
        nextState: { state: 'AWAITING_PAYMENT_DETAILS' } 
      };
    }

    const orderId = `INSTA-${Math.floor(100000 + Math.random() * 900000)}`;
    const serviceName = session.data.serviceName || 'Instagram Service';
    const quantity = session.data.quantity || 0;
    const price = session.data.price || 0;
    const targetLink = link.trim();
    const utrId = utr.trim();

    const whatsappAdminPayload = `Link: ${targetLink}\nService: ${serviceName}\nUTR ID: ${utrId}\nQuantity: ${quantity}`;
    const whatsappTag = `[WHATSAPP_ADMIN:${encodeURIComponent(whatsappAdminPayload)}]`;

    const finalMsg = formatOrderConfirmation({
      orderId,
      quantity,
      serviceName,
      targetLink,
      price
    }) + "\n\n" + 
    "Send Order Details to Admin and conform your order\n\n" + 
    whatsappTag + "\n\n" +
    "OPTION: 🏠 MAIN MENU";
    
    return {
      reply: finalMsg,
      nextState: { 
        state: 'ORDER_PLACED', 
        data: { ...session.data, orderId, targetLink, utrId } 
      }
    };
  }

  if (normalizedMsg === 'hi' || normalizedMsg === 'start' || normalizedMsg === 'menu' || normalizedMsg === 'main menu' || normalizedMsg === '🏠 main menu') {
    let menu = "👋 *Welcome to InstaFlow Bot!*\n\nNiche di gayi list mein se koi bhi service select karein:\n\n";
    Object.entries(SERVICES_CONFIG).forEach(([key, service]) => {
      menu += `OPTION: ${key}. ${service.name}\n`;
    });
    
    return {
      reply: menu,
      nextState: {
        state: 'AWAITING_SERVICE_SELECTION',
        data: {},
      },
    };
  }

  let interceptedServiceKey = '';
  Object.entries(SERVICES_CONFIG).forEach(([key, service]) => {
    const serviceLabel = `${key}. ${service.name}`.toLowerCase();
    const pureName = service.name.toLowerCase();
    if (normalizedMsg === serviceLabel || normalizedMsg === key || normalizedMsg === pureName) {
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
        return {
          reply: `⚠️ Kripya sahi quantity enter karein. *${service.name}* ke liye minimum *${service.min}* chahiye.`,
          nextState: { state: 'AWAITING_QUANTITY' },
        };
      }

      const price = calculatePrice(quantity, service.pricePer1000);

      return {
        reply: `✅ Aapne *${quantity} ${service.name}* select kiye hain.\n💰 Total price: *₹${price}*\n\nKya aap aage badhna chahte hain?\n\nOPTION: ✅ YES, PROCEED\nOPTION: 🏠 MAIN MENU`,
        nextState: {
          state: 'AWAITING_PAYMENT_DETAILS',
          data: { ...session.data, quantity, price },
        },
      };
    }

    case 'AWAITING_PAYMENT_DETAILS': {
       if (normalizedMsg === 'yes, proceed' || normalizedMsg === '✅ yes, proceed') {
         return {
           reply: `📸 *Payment QR Code*\n\nKripya niche diye gaye QR code ko scan ya save karke ₹${session.data.price} ka payment karein.\n\nUPI ID: *smmxpressbot@slc*\n\n[PAYMENT_QR]\n\nPayment ke baad 12-digit UTR ID niche form mein bharein:\n\n[PAYMENT_FORM]\n\nOPTION: 🏠 MAIN MENU`,
           nextState: { state: 'AWAITING_PAYMENT_DETAILS' },
         };
       }
       
       if (normalizedMsg === 'main menu' || normalizedMsg === '🏠 main menu') {
         let menu = "👋 *Welcome to InstaFlow Bot!*\n\nNiche di gayi list mein se koi bhi service select karein:\n\n";
         Object.entries(SERVICES_CONFIG).forEach(([key, service]) => {
           menu += `OPTION: ${key}. ${service.name}\n`;
         });
         return {
           reply: menu,
           nextState: {
             state: 'AWAITING_SERVICE_SELECTION',
             data: {},
           },
         };
       }

       return {
         reply: "⚠️ Kripya '✅ YES, PROCEED' button par click karein ya '🏠 MAIN MENU' par wapas jayein.",
         nextState: { state: 'AWAITING_PAYMENT_DETAILS' }
       };
    }

    default:
      return {
        reply: "👋 Welcome back! Menu dekhne ke liye *HI* bhejein.\n\nOPTION: 🏠 MAIN MENU",
        nextState: { state: 'START', data: {} },
      };
  }
}
