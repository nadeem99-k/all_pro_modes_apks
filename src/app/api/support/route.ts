import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const body = await req.json();
    const { subject, message, email } = body;

    if (!subject || !message) {
      return NextResponse.json({ error: 'Missing subject or message fields' }, { status: 400 });
    }

    // Insert into support_tickets table
    const { data, error } = await supabase.from('support_tickets').insert({
      subject,
      message,
      email: user?.email || email || 'Anonymous',
      status: 'open'
    }).select().single();

    if (error) {
      console.error("Support API error:", error);
      return NextResponse.json({ error: 'Failed to create support ticket' }, { status: 500 });
    }

    // Log to system activity
    await supabase.from('system_activity').insert({
      action: 'New Support Ticket',
      target: subject,
      type: 'ticket'
    });

    return NextResponse.json({ 
      success: true, 
      ticket_id: `TKT-${data.id.substring(0, 8).toUpperCase()}`,
      message: "Priority support ticket received. Our team will look into it within 24-48 hours." 
    });

  } catch (error) {
    console.error("Support API internal error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
