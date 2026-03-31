const { createClient } = require('@supabase/supabase-js');

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixStoragePolicies() {
  const buckets = ['apks', 'icons'];
  
  for (const bucket of buckets) {
    console.log(`\nFixing "${bucket}" bucket...`);

    // Update bucket to be public with 500MB limit
    const { error: updateError } = await supabaseAdmin.storage.updateBucket(bucket, {
      public: true,
      fileSizeLimit: 524288000 // 500MB
    });
    if (updateError) {
      console.log(`  Update warning: ${updateError.message}`);
    } else {
      console.log(`  ✅ Bucket updated: public=true, fileSizeLimit=500MB`);
    }

    // Check current bucket info
    const { data: info } = await supabaseAdmin.storage.getBucket(bucket);
    console.log(`  📦 Actual bucket config:`, JSON.stringify(info, null, 2));
  }
}

fixStoragePolicies();
