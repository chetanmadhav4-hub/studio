
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

    // Log user message to Firestore
    await addDoc(collection(firestore, 'chatSessions', phoneNumber, 'messages'), {
      text: messageText,
      sender: 'user',
      timestamp: serverTimestamp(),
    });

    // Retrieve session from Firestore (Mocking database persistence)
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

    // Send the message back via Meta Graph API
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

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
