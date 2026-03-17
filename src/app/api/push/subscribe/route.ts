import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    console.error('Auth error in subscribe:', authError);
    return NextResponse.json({ error: 'Unauthorized', details: authError?.message }, { status: 401 });
  }

  const subscription = await req.json();
  console.log('Saving subscription for user:', user.id);

  const { error } = await supabase
    .from('push_subscriptions')
    .upsert({
      user_id: user.id,
      endpoint: subscription.endpoint,
      keys: subscription.keys,
    }, {
      onConflict: 'endpoint'
    });

  if (error) {
    console.error('Database error in subscribe:', error);
    return NextResponse.json({ error: 'Database error', details: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
