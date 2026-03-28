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

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { trx_id, amount, type, apk_id } = body;

  if (!trx_id || !amount || !type) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Check for duplicate TRX ID
  const { data: existing } = await supabase
    .from("transactions")
    .select("id")
    .eq("trx_id", trx_id)
    .single();

  if (existing) {
    return NextResponse.json({ error: "This Transaction ID has already been submitted." }, { status: 409 });
  }

  const creditsMap: Record<string, number> = {
    bundle_starter: 10,
    bundle_pro: 50,
    bundle_elite: -1, // -1 = unlimited/elite
    single_apk: 0,
  };

  const { error } = await supabase.from("transactions").insert({
    user_id: user.id,
    user_email: user.email,
    type,
    amount,
    trx_id,
    apk_id: apk_id || null,
    credits_to_add: creditsMap[type] ?? 0,
    status: "pending",
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, message: "Payment submitted! Admin will approve within minutes." });
}
