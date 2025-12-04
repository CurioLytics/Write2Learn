import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@/services/supabase/auth-helpers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, category, message, images, timestamp } = body;

    const supabase = createSupabaseClient();

    // Get current user (optional - feedback can be anonymous)
    const { data: { user } } = await supabase.auth.getUser();

    const feedbackEntry = {
      name: name || 'Anonymous',
      email: email || '',
      category,
      message,
      images: images || [],
      profile_id: user?.id || null,
      submitted_at: timestamp || new Date().toISOString()
    };

    // Insert feedback into Supabase
    const { data, error } = await supabase
      .from('user_feedbacks')
      .insert([feedbackEntry])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: 'Feedback saved successfully',
      id: data.id
    });
  } catch (error) {
    console.error('Error saving feedback:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to save feedback', error: String(error) },
      { status: 500 }
    );
  }
}
