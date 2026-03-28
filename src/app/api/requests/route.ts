import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const body = await req.json();
    const { app_name, store_link, features_wanted } = body;

    if (!app_name || !features_wanted) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await supabase.from('mod_requests').insert({
      app_name,
      store_link,
      features_wanted,
      status: 'pending'
    }).select().single();

    if (error) {
      console.error("Mod Request API error:", error);
      return NextResponse.json({ error: 'Failed to submit mod request' }, { status: 500 });
    }

    // Log to system activity
    await supabase.from('system_activity').insert({
      action: 'New Mod Request',
      target: app_name,
      type: 'request'
    });

    return NextResponse.json({ 
      success: true, 
      request_id: data.id.substring(0, 8),
      message: "Mod request submitted successfully. Our team will review it soon." 
    });

  } catch (error) {
    console.error("Mod Request API internal error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
