import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const webhookUrl = process.env.GET_ROLEPLAY_ASSESMENT_WEBHOOK_URL;

        if (!webhookUrl) {
            console.error('GET_ROLEPLAY_ASSESMENT_WEBHOOK_URL is not defined');
            return NextResponse.json(
                { error: 'Service configuration error' },
                { status: 500 }
            );
        }

        const body = await request.json();

        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            throw new Error(`Webhook returned ${response.status}`);
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error) {
        console.error('Error in roleplay feedback proxy:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to generate feedback' },
            { status: 500 }
        );
    }
}
