
import { NextResponse } from 'next/server';
import { processBotMessage } from '@/lib/bot-logic';
import { UserSession } from '@/lib/bot-types';
import { initializeFirebase } from '@/firebase';
import { doc, getDoc, setDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';

export async function POST(req: Request) {
  try {
    const { firestore } = initializeFirebase();
    const body = await req.json();
    
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const message = value?.messages?.[0];

    if (!message) {
      return NextResponse.json({ success: true });
    }

    const phoneNumber = message.from;
    const messageText = message.text?.body || '';
    const adminNumber = '919116053238'; 

    // Retrieve session
    const sessionRef = doc(firestore, 'botSessions', phoneNumber);
    const sessionSnap = await getDoc(sessionRef);
    
    let session: UserSession = sessionSnap.exists() 
      ? sessionSnap.data() as UserSession 
      : {
          phoneNumber,
          state: 'START',
          lastMessage: '',
          data: {},
          updatedAt: Date.now(),
        };

    const { reply, nextState } = await processBotMessage(session, messageText);

    const updatedSession = {
      ...session,
      ...nextState,
      lastMessage: messageText,
      updatedAt: Date.now(),
    };

    await setDoc(sessionRef, updatedSession);

    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

    // IF ORDER PLACED: Write to ALL_ORDERS and Notify Admin
    if (updatedSession.state === 'ORDER_PLACED' && updatedSession.data?.orderId) {
      const { orderId, utrId, targetLink, serviceName, quantity, price } = updatedSession.data;
      
      const orderData = {
        id: orderId,
        phoneNumber,
        serviceName,
        quantity,
        price,
        targetLink,
        utrId,
        status: 'PROCESSING',
        createdAt: serverTimestamp(),
      };

      // Save to global master list for the tracker
      await setDoc(doc(firestore, 'all_orders', orderId), orderData);

      // Notify Admin via WhatsApp
      if (accessToken && phoneNumberId) {
        const adminMsg = `🚀 *Naya Order Aaya Hai!*

📦 *Order ID:* ${orderId}
🆔 *UTR ID:* ${utrId}
🔗 *Link:* ${targetLink}
🛠️ *Service:* ${serviceName}
📊 *Qty:* ${quantity}
💰 *Amount:* ₹${price}`;

        await fetch(`https://graph.facebook.com/v17.0/${phoneNumberId}/messages`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: adminNumber,
            type: 'text',
            text: { body: adminMsg },
          }),
        });
      }
    }

    // Send reply to user
    if (accessToken && phoneNumberId && phoneNumber !== 'demo_user') {
      await fetch(`https://graph.facebook.com/v17.0/${phoneNumberId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: phoneNumber,
          type: 'text',
          text: { body: reply },
        }),
      });
    }

    return NextResponse.json({ success: true, reply });
  } catch (error) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || 'instaflow_secret_token';
  if (searchParams.get('hub.mode') === 'subscribe' && searchParams.get('hub.verify_token') === verifyToken) {
    return new Response(searchParams.get('hub.challenge'), { status: 200 });
  }
  return new Response('Forbidden', { status: 403 });
}
