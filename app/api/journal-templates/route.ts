import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { SUPABASE_CONFIG } from '@/config/supabase';

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data, error } = await supabase
      .from(SUPABASE_CONFIG.tables.templates)
      .select('*')
      .order('name');
    
    if (error) throw error;
    return NextResponse.json({ templates: data });
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}