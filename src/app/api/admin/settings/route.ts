import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/admin';

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Security Check
    const { data: { user } } = await supabase.auth.getUser();
    if (!isAdmin(user?.email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('site_settings')
      .select('*');

    if (error) throw error;

    const settings = data.reduce((acc, curr) => {
      acc[curr.id] = curr.value;
      return acc;
    }, {} as any);

    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    
    // Security Check
    const { data: { user } } = await supabase.auth.getUser();
    if (!isAdmin(user?.email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, value } = await req.json();

    const { error } = await supabase
      .from('site_settings')
      .upsert({ id, value })
      .select();

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Settings API error:", error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
