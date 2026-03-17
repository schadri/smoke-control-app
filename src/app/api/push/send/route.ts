import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import webpush from 'web-push';

webpush.setVapidDetails(
  'mailto:adrian@example.com',
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function POST(req: Request) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { title, body } = await req.json();

  // Get all subscriptions for this user
  const { data: subscriptions, error: fetchError } = await supabase
    .from('push_subscriptions')
    .select('*')
    .eq('user_id', user.id);

  if (fetchError || !subscriptions) {
    return NextResponse.json({ error: 'Subscriptions not found' }, { status: 404 });
  }

  const results = await Promise.allSettled(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: sub.keys,
          },
          JSON.stringify({ title, body })
        );
      } catch (err: any) {
        if (err.statusCode === 404 || err.statusCode === 410) {
          // Remove expired subscription
          await supabase.from('push_subscriptions').delete().eq('id', sub.id);
        }
        throw err;
      }
    })
  );

  return NextResponse.json({ success: true, results });
}
