import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use service role key to bypass RLS for admin uploads
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function POST(req: Request) {
  try {
    const data = await req.formData();
    const file: File | null = data.get('file') as unknown as File;
    const image: File | null = data.get('image') as unknown as File;
    
    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" });
    }

    // 1. Upload APK to 'apks' bucket
    const fileBytes = await file.arrayBuffer();
    const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
    
    const { data: fileData, error: fileError } = await supabaseAdmin
      .storage
      .from('apks')
      .upload(fileName, fileBytes, {
        contentType: file.type || 'application/vnd.android.package-archive',
        upsert: true
      });

    if (fileError) throw fileError;

    // Get public URL for the APK
    const { data: { publicUrl: downloadUrl } } = supabaseAdmin
      .storage
      .from('apks')
      .getPublicUrl(fileName);

    let imageUrl = null;
    if (image) {
      // 2. Upload Image to 'icons' bucket
      const imageBytes = await image.arrayBuffer();
      const imageName = `${Date.now()}-${image.name.replace(/\s+/g, '_')}`;
      
      const { data: imageData, error: imageError } = await supabaseAdmin
        .storage
        .from('icons')
        .upload(imageName, imageBytes, {
          contentType: image.type,
          upsert: true
        });

      if (imageError) throw imageError;

      // Get public URL for the icon
      const { data: { publicUrl: iconUrl } } = supabaseAdmin
        .storage
        .from('icons')
        .getPublicUrl(imageName);
      
      imageUrl = iconUrl;
    }

    return NextResponse.json({ 
      success: true, 
      url: downloadUrl,
      imageUrl: imageUrl
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Upload failed.' 
    }, { status: 500 });
  }
}
