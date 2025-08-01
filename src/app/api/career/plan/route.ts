import { NextResponse } from 'next/server';
import { cookies, headers } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';

export async function PATCH(req: Request) {
  const { goalId, how, when, who } = await req.json();
  if (!goalId) {
    return new NextResponse('Missing goalId', { status: 400 });
  }
  const supabase = createServerComponentClient({ cookies, headers });
  const { error } = await supabase
    .from('career_plan')
    .update({ how, when, who })
    .eq('id', goalId);
  if (error) {
    return new NextResponse(error.message, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
