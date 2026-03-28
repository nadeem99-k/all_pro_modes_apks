import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(req: Request) {
  try {
    const data = await req.formData();
    const file: File | null = data.get('file') as unknown as File;
    const image: File | null = data.get('image') as unknown as File;
    
    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create public/uploads directory if it doesn't automatically exist
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    try { 
      await mkdir(uploadDir, { recursive: true }); 
    } catch (e) {}

    // Save the literal exact APK file locally so we can serve it perfectly
    const filePath = join(uploadDir, file.name);
    await writeFile(filePath, buffer);

    let imageUrl = null;
    if (image) {
      const imageBytes = await image.arrayBuffer();
      const imageBuffer = Buffer.from(imageBytes);
      const imagePath = join(uploadDir, image.name);
      await writeFile(imagePath, imageBuffer);
      imageUrl = `/uploads/${encodeURIComponent(image.name)}`;
    }

    // Provide the absolute local route back to Supabase
    return NextResponse.json({ 
      success: true, 
      url: `/uploads/${encodeURIComponent(file.name)}`,
      imageUrl: imageUrl
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ success: false, error: 'Upload structurally failed.' }, { status: 500 });
  }
}
