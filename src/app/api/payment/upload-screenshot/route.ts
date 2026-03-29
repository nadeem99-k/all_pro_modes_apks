import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(req: Request) {
  try {
    const data = await req.formData();
    const file: File | null = data.get('file') as unknown as File;
    
    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create public/uploads/screenshots directory
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'screenshots');
    try { 
      await mkdir(uploadDir, { recursive: true }); 
    } catch (e) {}

    // Save the screenshot locally
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = join(uploadDir, fileName);
    await writeFile(filePath, buffer);

    // Provide the absolute local route back
    return NextResponse.json({ 
      success: true, 
      url: `/uploads/screenshots/${encodeURIComponent(fileName)}`
    });
  } catch (error) {
    console.error("Screenshot Upload error:", error);
    return NextResponse.json({ success: false, error: 'Upload structurally failed.' }, { status: 500 });
  }
}
