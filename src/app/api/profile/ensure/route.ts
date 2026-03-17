import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { config } = await req.json();

  // Check if profile exists
  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ success: true, existed: true });
  }

  // Create profile — requires email (NOT NULL in schema)
  const { error } = await supabase
    .from('profiles')
    .insert({ 
      id: user.id, 
      email: user.email || '',
      config 
    });

  if (error) {
    console.error('Error creating profile:', error);
    return NextResponse.json({ error: error.message, details: error }, { status: 500 });
  }

  return NextResponse.json({ success: true, existed: false });
}
