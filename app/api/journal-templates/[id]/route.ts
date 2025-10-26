import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { SUPABASE_CONFIG } from '@/config/supabase';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data, error } = await supabase
      .from(SUPABASE_CONFIG.tables.templates)
      .select('*')
      .eq('id', params.id)
      .single();
    
    if (!data) return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    if (error) throw error;
    
    return NextResponse.json(data);
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch template' },
      { status: 500 }
    );
  }
}