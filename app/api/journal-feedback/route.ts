import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const webhookUrl =
    process.env.NEXT_PUBLIC_GET_FEEDBACK_WEBHOOK_URL ||
    'https://n8n.elyandas.com/webhook/journal-feedback';

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const data = await res.json();

    // 👇 Flatten the structure so the frontend gets a simple feedback object
    const feedback =
      Array.isArray(data) && data[0]?.output
        ? data[0].output
        : data.output
        ? data.output
        : data;

    return NextResponse.json(feedback, { status: res.status });
  } catch (err) {
    console.error('Webhook error:', err);

    return NextResponse.json(
      {
        title: body.title || 'Journal Entry',
        summary:
          "We couldn't generate a detailed summary for your journal entry at this time.",
        improvedVersion: body.content,
        originalVersion: body.content,
        vocabSuggestions: [],
      },
      { status: 200 }
    );
  }
}
