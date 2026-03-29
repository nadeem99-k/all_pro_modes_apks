import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { apk_id } = await req.json();
    if (!apk_id) return NextResponse.json({ error: "Missing APK ID" }, { status: 400 });

    // 1. Fetch Profile to check credits
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("credits, plan")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // 2. If Elite, just grant access (extra safety)
    if (profile.plan === "elite") {
      await supabase.from("unlocked_apks").upsert({
        user_id: user.id,
        apk_id,
      }, { onConflict: "user_id,apk_id" });
      return NextResponse.json({ success: true, message: "Elite access granted" });
    }

    // 3. Check Credits
    if ((profile.credits || 0) < 1) {
      return NextResponse.json({ error: "Insufficient credits" }, { status: 403 });
    }

    // 4. Deduct credit and grant access (Transaction)
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ credits: profile.credits - 1 })
      .eq("id", user.id);

    if (updateError) throw updateError;

    const { error: unlockError } = await supabase.from("unlocked_apks").upsert({
      user_id: user.id,
      apk_id,
    }, { onConflict: "user_id,apk_id" });

    if (unlockError) throw unlockError;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Unlock API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
