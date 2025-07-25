import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/supabase';

export const supabaseBrowser = createBrowserSupabaseClient<Database>();
