import { NextResponse } from 'next/server';
import { processBotMessage } from '@/lib/bot-logic';
import { UserSession } from '@/lib/bot-types';

// Mock database for demo purposes (In production use Firestore)
const sessions: Record<string, UserSession> = {};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Check if it's a Meta Webhook payload
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const message = value?.messages?.[0];

    if (!message) {
      // Return success for preview or empty messages
      return NextResponse.json({ success: true });
    }

    const phoneNumber = message.from;
    const messageText = message.text?.body || '';

    // Retrieve or initialize session
    let session = sessions[phoneNumber] || {
      phoneNumber,
      state: 'START',
      lastMessage: '',
      data: {},
      updatedAt: Date.now(),
    };

    // Process message logic
    const { reply, nextState } = await processBotMessage(session, messageText);

    // Update session state
    sessions[phoneNumber] = {
      ...session,
      ...nextState,
      lastMessage: messageText,
      updatedAt: Date.now(),
    };

    // Send the message back via Meta Graph API if credentials exist
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
      state: sessions[phoneNumber].state 
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

  // Verify token from environment variables
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || 'instaflow_secret_token';

  if (mode === 'subscribe' && token === verifyToken) {
    return new Response(challenge, { status: 200 });
  }
  
  return new Response('Forbidden', { status: 403 });
}