import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use service role key to bypass RLS for admin/system uploads
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function POST(req: Request) {
  try {
    const data = await req.formData();
    const file: File | null = data.get('file') as unknown as File;
    
    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" });
    }

    const bytes = await file.arrayBuffer();
    const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
    
    // Auto-create 'screenshots' bucket if it doesn't exist
    const { data: buckets } = await supabaseAdmin.storage.listBuckets();
    const bucketExists = buckets?.some(b => b.name === 'screenshots');
    
    if (!bucketExists) {
      const { error: createError } = await supabaseAdmin.storage.createBucket('screenshots', { 
        public: true,
        fileSizeLimit: 5242880 // 5MB
      });
      if (createError) console.error("Failed to auto-create bucket:", createError);
    }

    // Upload screenshot to 'screenshots' bucket
    const { data: uploadData, error: uploadError } = await supabaseAdmin
      .storage
      .from('screenshots')
      .upload(fileName, bytes, {
        contentType: file.type,
        upsert: true
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: { publicUrl } } = supabaseAdmin
      .storage
      .from('screenshots')
      .getPublicUrl(fileName);

    return NextResponse.json({ 
      success: true, 
      url: publicUrl
    });
  } catch (error: any) {
    console.error("Screenshot Upload error:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Upload failed.' 
    }, { status: 500 });
  }
}
