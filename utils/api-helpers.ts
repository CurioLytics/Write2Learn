import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

/**
 * Authenticate user from request and return user object
 * Throws error if user is not authenticated
 */
export async function authenticateUser() {
  const cookieStore = await cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    throw new Error('Unauthorized');
  }
  
  return user;
}

/**
 * Standard error handler for API routes
 */
export function handleApiError(error: unknown) {
  console.error('API Error:', error);
  
  if (error instanceof Error) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: error.message }, 
      { status: 400 }
    );
  }
  
  return NextResponse.json(
    { error: 'Internal Server Error' },
    { status: 500 }
  );
}

/**
 * Parse and validate JSON request body
 */
export async function parseRequestBody<T>(request: Request): Promise<T> {
  try {
    return await request.json();
  } catch {
    throw new Error('Invalid JSON in request body');
  }
}

/**
 * Create successful response
 */
export function createSuccessResponse(data: any, message?: string) {
  return NextResponse.json({
    success: true,
    ...data,
    ...(message && { message })
  });
}