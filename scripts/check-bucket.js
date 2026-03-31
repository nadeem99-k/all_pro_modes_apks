const { createClient } = require('@supabase/supabase-js');
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
supabaseAdmin.storage.getBucket('apks').then(({ data, error }) => {
  console.log('Bucket Info:', data);
});
