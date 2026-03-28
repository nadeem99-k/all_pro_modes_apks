import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { plan, gateway } = body; // 'monthly' | 'lifetime', 'easypaisa' | 'jazzcash'

    // Mocking the Payment Gateway initialization
    const transactionRef = `TXN-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    // Log the pending transaction securely in Supabase
    await supabase.from('transactions').insert({
      user_id: user.id,
      amount: plan === 'lifetime' ? 2000 : 300,
      currency: 'PKR',
      gateway: gateway,
      transaction_ref: transactionRef,
      status: 'pending'
    });

    // In a real scenario, you would call EasyPaisa/JazzCash API here and securely return their Hosted Checkout URL.
    return NextResponse.json({ 
      success: true, 
      paymentUrl: `/api/checkout/callback?ref=${transactionRef}`,
      transactionRef 
    });

  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
