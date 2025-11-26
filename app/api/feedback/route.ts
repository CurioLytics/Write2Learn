import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, category, message, images, timestamp } = body;

    const feedbackEntry = {
      id: Date.now().toString(),
      name: name || 'Anonymous',
      email: email || '',
      category,
      message,
      images: images || [],
      timestamp: timestamp || new Date().toISOString(),
      submittedAt: new Date().toISOString()
    };

    // Path to feedback file
    const dataDir = path.join(process.cwd(), 'data');
    const feedbackFile = path.join(dataDir, 'feedback.json');

    // Ensure data directory exists
    if (!existsSync(dataDir)) {
      await mkdir(dataDir, { recursive: true });
    }

    // Read existing feedback or create empty array
    let feedbackData = [];
    if (existsSync(feedbackFile)) {
      const fileContent = await readFile(feedbackFile, 'utf-8');
      feedbackData = JSON.parse(fileContent);
    }

    // Add new feedback
    feedbackData.push(feedbackEntry);

    // Write back to file
    await writeFile(feedbackFile, JSON.stringify(feedbackData, null, 2), 'utf-8');

    return NextResponse.json({ 
      success: true, 
      message: 'Feedback saved successfully',
      id: feedbackEntry.id 
    });
  } catch (error) {
    console.error('Error saving feedback:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to save feedback' },
      { status: 500 }
    );
  }
}
