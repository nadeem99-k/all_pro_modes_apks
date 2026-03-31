import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { isAdmin } from '@/lib/admin';

// Service-role client – bypasses all RLS
function getServiceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// Allow up to 5 minutes for large APK uploads
export const maxDuration = 300;

export async function POST(req: NextRequest) {
  try {
    // 1. Verify admin session
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

    // 2. Parse multipart form
    const form = await req.formData();
    const file = form.get('file') as File | null;
    const bucket = (form.get('bucket') as string | null) || 'apks';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const allowed = ['apks', 'icons', 'screenshots'];
    if (!allowed.includes(bucket)) {
      return NextResponse.json({ error: 'Invalid bucket' }, { status: 400 });
    }

    const safeName = file.name.replace(/\s+/g, '_');
    const path = `${Date.now()}-${safeName}`;

    // 3. Upload to Supabase with service-role key (bypasses all RLS)
    const service = getServiceClient();
    const fileBuffer = await file.arrayBuffer();

    const { error } = await service.storage
      .from(bucket)
      .upload(path, fileBuffer, {
        contentType: file.type || 'application/octet-stream',
        upsert: true,
      });

    if (error) {
      console.error('Storage upload error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data: { publicUrl } } = service.storage.from(bucket).getPublicUrl(path);

    return NextResponse.json({ url: publicUrl });
  } catch (err: any) {
    console.error('Upload route error:', err);
    return NextResponse.json({ error: err.message || 'Upload failed' }, { status: 500 });
  }
}
