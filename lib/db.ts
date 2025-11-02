import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database.types';

// 🚨 Use the *service role key*, not the anon key
export const db = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
