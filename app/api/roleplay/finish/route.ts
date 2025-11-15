import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    const webhookUrl = 'https://n8n.elyandas.com/webhook/finish-roleplay';

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
    });

    const text = await response.text();
    return new NextResponse(text, { status: 200 });
  } catch (error) {
    console.error('Eok:', error);
    return new NextResponse('Webhook error', { status: 500 });
  }
}
