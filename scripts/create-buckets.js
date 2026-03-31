
const { createClient } = require('@supabase/supabase-js');

async function setupBuckets() {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  console.log('Checking and creating Supabase Storage buckets...');
  
  const bucketsToCreate = ['apks', 'icons'];
  
  for (const bucket of bucketsToCreate) {
    console.log(`Creating bucket: "${bucket}"...`);
    const { data, error } = await supabaseAdmin.storage.createBucket(bucket, {
      public: true,
      allowedMimeTypes: bucket === 'apks' ? ['application/vnd.android.package-archive'] : ['image/*'],
      fileSizeLimit: bucket === 'apks' ? 524288000 : 10485760 // 500MB for APKs, 10MB for icons
    });
    
    if (error) {
      if (error.message.includes('already exists') || error.message.includes('multiple items')) {
        console.log(`Bucket "${bucket}" already exists. Ensuring it is public.`);
        await supabaseAdmin.storage.updateBucket(bucket, { 
          public: true,
          allowedMimeTypes: bucket === 'apks' ? ['application/vnd.android.package-archive'] : ['image/*'],
          fileSizeLimit: bucket === 'apks' ? 524288000 : 10485760 // 500MB for APKs, 10MB for icons
        });
      } else {
        console.error(`Error with bucket "${bucket}":`, error.message);
      }
    } else {
      console.log(`Bucket "${bucket}" created successfully!`);
    }
  }
  
  console.log('Storage setup complete!');
}

setupBuckets();
