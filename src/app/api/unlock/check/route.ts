import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );

  const { searchParams } = new URL(req.url);
  const apk_id = searchParams.get("apk_id");

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ unlocked: false, credits: 0, plan: "free", loggedIn: false });
  }

  // Get user profile (credits + plan)
  const { data: profile } = await supabase
    .from("profiles")
    .select("credits, plan")
    .eq("id", user.id)
    .single();

  const credits = profile?.credits ?? 0;
  const plan = profile?.plan ?? "free";

  // Elite users have everything unlocked
  if (plan === "elite") {
    return NextResponse.json({ unlocked: true, credits, plan, loggedIn: true });
  }

  // Check specific APK unlock
  if (apk_id) {
    const { data: unlocked } = await supabase
      .from("unlocked_apks")
      .select("id")
      .eq("user_id", user.id)
      .eq("apk_id", apk_id)
      .single();

    return NextResponse.json({ unlocked: !!unlocked, credits, plan, loggedIn: true });
  }

  return NextResponse.json({ unlocked: false, credits, plan, loggedIn: true });
}
