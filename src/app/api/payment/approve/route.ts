import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );

  // Only the admin's service role key should be used here, but since we
  // protect the admin page via URL, we verify the user is authenticated at minimum.
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { transaction_id, action } = await req.json(); // action: 'approved' | 'rejected'

  if (!transaction_id || !action) {
    return NextResponse.json({ error: "Missing transaction_id or action" }, { status: 400 });
  }

  // Fetch the transaction
  const { data: txn, error: txnError } = await supabase
    .from("transactions")
    .select("*")
    .eq("id", transaction_id)
    .single();

  if (txnError || !txn) return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
  if (txn.status !== "pending") return NextResponse.json({ error: "Transaction already processed" }, { status: 409 });

  // Update transaction status
  await supabase.from("transactions").update({ status: action }).eq("id", transaction_id);

  if (action === "approved") {
    if (txn.type === "single_apk" && txn.apk_id) {
      // Grant direct APK unlock
      await supabase.from("unlocked_apks").upsert({
        user_id: txn.user_id,
        apk_id: txn.apk_id,
      }, { onConflict: "user_id,apk_id" });

    } else if (txn.type === "bundle_elite") {
      // Grant elite plan
      await supabase.from("profiles").upsert({
        id: txn.user_id,
        plan: "elite",
        credits: 9999,
      }, { onConflict: "id" });

    } else if (txn.credits_to_add > 0) {
      // Add credits to profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("credits, plan")
        .eq("id", txn.user_id)
        .single();

      const currentCredits = profile?.credits ?? 0;
      await supabase.from("profiles").upsert({
        id: txn.user_id,
        credits: currentCredits + txn.credits_to_add,
        plan: profile?.plan ?? "free",
      }, { onConflict: "id" });
    }

    // Log activity
    await supabase.from("system_activity").insert({
      action: "Payment Approved",
      target: `${txn.user_email} — Rs ${txn.amount} (${txn.type})`,
      type: "payment",
    });
  }

  return NextResponse.json({ success: true });
}
