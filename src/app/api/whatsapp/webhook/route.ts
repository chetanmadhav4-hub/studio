
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

    // If it's just a status update or empty change, ignore
    if (!message) {
      return NextResponse.json({ success: true });
    }

    const phoneNumber = message.from;
    const messageText = message.text?.body || '';
    
    // ADMIN NUMBER: User requested 9116053238. For Meta API, we use country code (91) + number.
    const adminNumber = '919116053238'; 

    // Log user message to Firestore for history
    await addDoc(collection(firestore, 'chatSessions', phoneNumber, 'messages'), {
      text: messageText,
      sender: 'user',
      timestamp: serverTimestamp(),
    });

    // Retrieve session from Firestore
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

    // Save session back to Firestore
    await setDoc(sessionRef, updatedSession);

    // Log bot reply to Firestore
    await addDoc(collection(firestore, 'chatSessions', phoneNumber, 'messages'), {
      text: reply,
      sender: 'bot',
      timestamp: serverTimestamp(),
    });

    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

    if (accessToken && phoneNumberId) {
      // 1. Send reply back to user (if not a demo/preview call)
      if (phoneNumber !== 'demo_user') {
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

      // 2. Notify ADMIN if order is placed
      // We check if the state JUST transitioned to ORDER_PLACED
      if (updatedSession.state === 'ORDER_PLACED' && updatedSession.data && updatedSession.data.orderId) {
        const { orderId, utrId, targetLink, serviceName, quantity, price } = updatedSession.data;
        
        const adminMsg = `🚀 *Naya Order Aaya Hai!*

📦 *Order ID:* ${orderId}
🆔 *UTR ID:* ${utrId}
🔗 *Link:* ${targetLink}
🛠️ *Service:* ${serviceName}
📊 *Qty:* ${quantity}
💰 *Amount:* ₹${price}

*Kripya payment aur link check karke panel me process karein.*`;

        // Send to Admin
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

    return NextResponse.json({ 
      success: true, 
      reply, 
      state: updatedSession.state,
      orderData: updatedSession.data 
    });
  } catch (error) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || 'instaflow_secret_token';

  if (mode === 'subscribe' && token === verifyToken) {
    return new Response(challenge, { status: 200 });
  }
  
  return new Response('Forbidden', { status: 403 });
}
