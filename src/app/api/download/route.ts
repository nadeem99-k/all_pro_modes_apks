import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const fileUrl = searchParams.get('fileUrl');

  if (!fileUrl) {
    return new NextResponse("File URL required", { status: 400 });
  }

  const fileName = fileUrl.split('/').pop() || 'VIP_Mod.apk';

  try {
    // 1. Attempt to fetch the actual, real Cloudflare R2 or External APK link
    const response = await fetch(fileUrl);
    
    if (response.ok && response.body) {
      // If the link is real and your S3 bucket exists, securely stream the huge byte payload to the user
      return new NextResponse(response.body, {
        headers: {
          'Content-Disposition': `attachment; filename="${fileName}"`,
          'Content-Type': response.headers.get('Content-Type') || 'application/vnd.android.package-archive',
        },
      });
    } else {
      throw new Error("Bucket link not resolving");
    }
  } catch (error) {
    // 2. FALLBACK FOR LOCAL MOCK TESTING
    // Since the generic "vip-bucket.r2.dev" does not exist yet, fetching it fails. 
    // To give you the exact experience of downloading a heavy file without an error,
    // we generate a massive 25 Megabyte binary file purely for UI testing.
    
    const sizeInMB = 25;
    const dummyBuffer = new Uint8Array(sizeInMB * 1024 * 1024); // 25 MB of binary zeroes
    
    return new NextResponse(dummyBuffer, {
      headers: {
        'Content-Disposition': `attachment; filename="MOCK_TEST_${fileName}"`,
        'Content-Type': 'application/vnd.android.package-archive',
        'Content-Length': dummyBuffer.length.toString(),
      },
    });
  }
}
