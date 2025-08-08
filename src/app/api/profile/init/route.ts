// src/app/api/profile/init/route.ts (Node runtime)
import { NextResponse } from 'next/server';
import { createSupabaseRouteServerClient } from '@/lib/supabaseServer';

export async function POST() {
  const supabase = await createSupabaseRouteServerClient();
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();

  if (authErr || !user) return NextResponse.json({ error: 'AUTH' }, { status: 401 });

  // luôn bảo đảm có một dòng profile
  await supabase.from('profiles').upsert({ user_id: user.id }, { onConflict: 'user_id' });

  return NextResponse.json({ ok: true });
}
