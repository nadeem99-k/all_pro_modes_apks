import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { isAdmin } from '@/lib/admin';

export const maxDuration = 300; // 5 min for large APKs

const GITHUB_TOKEN = process.env.GITHUB_TOKEN!;
let GITHUB_REPO = process.env.GITHUB_REPO!; // e.g. "nadeem99-k/all_pro_modes_apks"
if (GITHUB_REPO && GITHUB_REPO.includes('github.com/')) {
  GITHUB_REPO = GITHUB_REPO.split('github.com/')[1].replace(/\/$/, '');
}
const RELEASE_TAG = 'apk-storage'; // single permanent release used as a storage bucket

/**
 * Gets or creates the permanent "apk-storage" release.
 * We reuse one release so all APKs are neatly in one place.
 */
async function getOrCreateRelease(): Promise<number> {
  const headers = {
    Authorization: `Bearer ${GITHUB_TOKEN}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'Content-Type': 'application/json',
    'User-Agent': 'VipMods-Uploader',
  };

  // Try to fetch existing release by tag
  const getRes = await fetch(
    `https://api.github.com/repos/${GITHUB_REPO}/releases/tags/${RELEASE_TAG}`,
    { headers }
  );

  if (getRes.ok) {
    const rel = await getRes.json();
    return rel.id as number;
  }

  // Release doesn't exist — create it
  const createRes = await fetch(
    `https://api.github.com/repos/${GITHUB_REPO}/releases`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify({
        tag_name: RELEASE_TAG,
        name: '📦 APK Storage',
        body: 'Auto-managed APK storage release. Do not delete.',
        draft: false,
        prerelease: false,
      }),
    }
  );

  if (!createRes.ok) {
    const err = await createRes.json();
    throw new Error(`Failed to create GitHub release: ${err.message}. Ensure GITHUB_TOKEN has 'repo' scope and GITHUB_REPO (${GITHUB_REPO}) is correct.`);
  }

  const rel = await createRes.json();
  return rel.id as number;
}

/**
 * Deletes an existing asset with the same name to allow re-uploads.
 */
async function deleteExistingAsset(releaseId: number, fileName: string) {
  const headers = {
    Authorization: `Bearer ${GITHUB_TOKEN}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'VipMods-Uploader',
  };

  const listRes = await fetch(
    `https://api.github.com/repos/${GITHUB_REPO}/releases/${releaseId}/assets?per_page=100`,
    { headers }
  );
  if (!listRes.ok) return;

  const assets: any[] = await listRes.json();
  const existing = assets.find((a) => a.name === fileName);
  if (existing) {
    await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/releases/assets/${existing.id}`,
      { method: 'DELETE', headers }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // 1. Verify admin (Strict protection — only the admin can get the token)
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!isAdmin(user?.email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!GITHUB_TOKEN || GITHUB_TOKEN === 'YOUR_GITHUB_TOKEN_HERE') {
      return NextResponse.json(
        { error: 'GITHUB_TOKEN not configured in .env.local' },
        { status: 500 }
      );
    }

    // 2. Parse request JSON (fileName) instead of binary FormData
    const body = await req.json();
    if (!body?.fileName) {
      return NextResponse.json({ error: 'No fileName provided' }, { status: 400 });
    }

    // Safe filename: timestamp + cleaned name
    const safeName = `${Date.now()}-${body.fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

    // 3. Get or create the storage release
    const releaseId = await getOrCreateRelease();

    // 4. Remove any existing asset with the same name (upsert behaviour)
    await deleteExistingAsset(releaseId, safeName);

    // 5. Return secure upload credentials back to the client
    // The client will upload directly to GitHub bypassing Vercel's 4.5MB limit!
    const uploadUrl = `https://uploads.github.com/repos/${GITHUB_REPO}/releases/${releaseId}/assets?name=${encodeURIComponent(safeName)}`;

    return NextResponse.json({ 
      uploadUrl,
      token: GITHUB_TOKEN,
    });
  } catch (err: any) {
    console.error('GitHub auth route error:', err);
    return NextResponse.json({ error: err.message || 'Upload setup failed' }, { status: 500 });
  }
}
