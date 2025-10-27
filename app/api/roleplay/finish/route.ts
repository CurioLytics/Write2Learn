import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const webhookUrl =
      process.env.NEXT_PUBLIC_FINISH_ROLEPLAY_WEBHOOK_URL ||
      'https://n8n.elyandas.com/webhook/finish-roleplay';

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error finishing roleplay:', error);
    return NextResponse.json({ message: 'Error finishing roleplay.' }, { status: 500 });
  }
}
