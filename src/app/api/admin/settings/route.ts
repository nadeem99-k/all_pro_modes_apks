import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
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
    
    // Check if user is admin (simplified for now)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      // return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
