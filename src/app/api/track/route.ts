import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { path, referrer, email } = await req.json();
    const userAgent = req.headers.get('user-agent') || 'Unknown';
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    
    // Ignore bots and website monitoring services
    const lowerUA = userAgent.toLowerCase();
    const botKeywords = ['bot', 'spider', 'crawler', 'monitor', 'ping', 'uptime', 'headless', 'lighthouse', 'vercel', 'status'];
    const isBotOrMonitor = botKeywords.some(keyword => lowerUA.includes(keyword));

    if (isBotOrMonitor) {
      return NextResponse.json({ success: true, ignored: true });
    }

    // Create a privacy-preserving hash of the IP adress for uniqueness tracking
    const ipHash = crypto.createHash('sha256').update(ip).digest('hex').substring(0, 16);

    const supabase = await createClient();
    const { error } = await supabase.from('visitors').insert({
      path: path || '/',
      user_agent: userAgent,
      ip_hash: ipHash,
      referrer: referrer || null,
      user_email: email || null
    });

    if (error) {
      console.error("Tracking error:", error);
      return NextResponse.json({ success: false }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Internal tracking error:", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
