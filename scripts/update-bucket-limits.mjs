const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const FIFTY_MB = 52428800;

async function updateBucket(bucket) {
  const res = await fetch(`${SUPABASE_URL}/storage/v1/bucket/${bucket}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
      'apikey': SERVICE_KEY
    },
    body: JSON.stringify({
      id: bucket, name: bucket, public: true,
      file_size_limit: FIFTY_MB,
      allowed_mime_types: null
    })
  });
  const json = await res.json();
  console.log(`[${bucket}] ${res.status} → ${json.message || json.error || JSON.stringify(json)}`);
}

async function main() {
  console.log('Setting both buckets to 50MB (Supabase free tier max)...');
  await updateBucket('apks');
  await updateBucket('icons');
  console.log('Done.');
}

main().catch(console.error);
