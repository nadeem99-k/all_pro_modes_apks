import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const cookieStore = await cookies();
  
  // 1. Anon client to verify the admin's session
  const supabaseAnon = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );

  const { data: { user } } = await supabaseAnon.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // 2. Service Role client to bypass RLS for administrative updates
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { transaction_id, action } = await req.json(); // action: 'approved' | 'rejected'

  if (!transaction_id || !action) {
    return NextResponse.json({ error: "Missing transaction_id or action" }, { status: 400 });
  }

  // Fetch the transaction using admin privileges
  const { data: txn, error: txnError } = await supabaseAdmin
    .from("transactions")
    .select("*")
    .eq("id", transaction_id)
    .single();

  if (txnError || !txn) return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
  if (txn.status !== "pending") return NextResponse.json({ error: "Transaction already processed" }, { status: 409 });

  // Update transaction status
  const { error: updateTxnError } = await supabaseAdmin
    .from("transactions")
    .update({ status: action })
    .eq("id", transaction_id);
  
  if (updateTxnError) return NextResponse.json({ error: "Failed to update transaction status", details: updateTxnError.message }, { status: 500 });

  if (action === "approved") {
    try {
      if (txn.type === "single_apk" && txn.apk_id) {
        // 1. Grant direct APK unlock
        const { error: unlockError } = await supabaseAdmin.from("unlocked_apks").upsert({
          user_id: txn.user_id,
          apk_id: txn.apk_id,
        }, { onConflict: "user_id,apk_id" });
        if (unlockError) throw new Error("Failed to grant APK access: " + unlockError.message);

      } else {
        // 2. Fetch current profile
        const { data: profile } = await supabaseAdmin
          .from("profiles")
          .select("credits, plan, email")
          .eq("id", txn.user_id)
          .single();

        const currentCredits = profile?.credits ?? 0;
        const currentPlan = profile?.plan ?? "free";
        const userEmail = txn.user_email || profile?.email;

        if (!userEmail) throw new Error("Missing user email for profile update");

        // 3. Handle Plan/Credits
        let newPlan = currentPlan;
        let newCredits = currentCredits;

        if (txn.type === "bundle_elite") {
          newPlan = "elite";
          newCredits = 9999;
        } else if (txn.credits_to_add > 0) {
          newCredits += txn.credits_to_add;
        }

        // 4. Upsert Profile
        const { error: profileUpdateError } = await supabaseAdmin.from("profiles").upsert({
          id: txn.user_id,
          email: userEmail,
          credits: newCredits,
          plan: newPlan,
        }, { onConflict: "id" });

        if (profileUpdateError) throw new Error("Failed to update profile: " + profileUpdateError.message);
      }

      // 5. Log activity
      await supabaseAdmin.from("system_activity").insert({
        action: "Payment Approved",
        target: `${txn.user_email} — Rs ${txn.amount} (${txn.type})`,
        type: "payment",
      });
    } catch (err: any) {
      console.error("Critical Approval Error:", err.message);
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true });
}
