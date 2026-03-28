import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: Request) {
  const { searchParams, origin } = new URL(req.url);
  const ref = searchParams.get('ref');

  if (!ref) {
    return NextResponse.redirect(`${origin}/dashboard?error=missing_ref`);
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(`${origin}/login`);
  }

  // 1. Fetch the pending transaction safely using RLS
  const { data: txn, error: txnError } = await supabase
    .from('transactions')
    .select('*')
    .eq('transaction_ref', ref)
    .single();

  if (txnError || !txn || txn.status !== 'pending') {
    return NextResponse.redirect(`${origin}/dashboard?error=invalid_transaction`);
  }

  // 2. Mark transaction as completed (assuming gateway fired an IPN successfully)
  await supabase
    .from('transactions')
    .update({ status: 'completed' })
    .eq('id', txn.id);

  // 3. Upgrade the user's Profile to VIP!
  const isLifetime = txn.amount === 2000;
  
  const vipExpiresAt = isLifetime 
    ? null // No expiration for lifetime
    : new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString(); // +1 month

  await supabase
    .from('profiles')
    .update({
      vip_level: isLifetime ? 'lifetime' : 'monthly',
      vip_expires_at: vipExpiresAt
    })
    .eq('id', user.id);

  // 4. Redirect back to User Dashboard with the Crown!
  return NextResponse.redirect(`${origin}/dashboard?success=vip_upgraded`);
}
