-- FIX: Corrected and Idempotent SQL for Premium Mod APK Platform

-- 1. APKs Table Policies
DROP POLICY IF EXISTS "Enable insert for all users" ON public.apks;
DROP POLICY IF EXISTS "Enable update for all users" ON public.apks;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.apks;

CREATE POLICY "Enable insert for all users" ON public.apks FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON public.apks FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Enable delete for all users" ON public.apks FOR DELETE USING (true);

-- 2. Visitors Table
CREATE TABLE IF NOT EXISTS public.visitors (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  path text NOT NULL,
  user_agent text,
  ip_hash text,
  referrer text,
  user_email text
);

ALTER TABLE public.visitors ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anonymous inserts" ON public.visitors;
CREATE POLICY "Allow anonymous inserts" ON public.visitors FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public select" ON public.visitors;
CREATE POLICY "Allow public select" ON public.visitors FOR SELECT USING (true);

-- 3. Support Ticket System
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  email text,
  status text DEFAULT 'open'
);

ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anonymous inserts for support" ON public.support_tickets;
CREATE POLICY "Allow anonymous inserts for support" ON public.support_tickets FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow all for admin on support" ON public.support_tickets;
CREATE POLICY "Allow all for admin on support" ON public.support_tickets FOR SELECT USING (true);

-- 4. Mod Request System
CREATE TABLE IF NOT EXISTS public.mod_requests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  app_name text NOT NULL,
  store_link text,
  features_wanted text,
  status text DEFAULT 'pending'
);

ALTER TABLE public.mod_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anonymous inserts for requests" ON public.mod_requests;
CREATE POLICY "Allow anonymous inserts for requests" ON public.mod_requests FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow all for admin on requests" ON public.mod_requests;
CREATE POLICY "Allow all for admin on requests" ON public.mod_requests FOR SELECT USING (true);

-- 5. System Activity Log
CREATE TABLE IF NOT EXISTS public.system_activity (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  action text NOT NULL,
  target text NOT NULL,
  type text NOT NULL
);

ALTER TABLE public.system_activity ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read for activity" ON public.system_activity;
CREATE POLICY "Allow public read for activity" ON public.system_activity FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow service inserts for activity" ON public.system_activity;
CREATE POLICY "Allow service inserts for activity" ON public.system_activity FOR INSERT WITH CHECK (true);

-- 6. Site Settings & Maintenance Mode
CREATE TABLE IF NOT EXISTS public.site_settings (
  id text PRIMARY KEY,
  value jsonb
);

INSERT INTO public.site_settings (id, value) 
VALUES ('maintenance_mode', '{"enabled": false, "message": "Site is currently undergoing scheduled maintenance. Please check back soon!"}')
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read for settings" ON public.site_settings;
CREATE POLICY "Allow public read for settings" ON public.site_settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow all for admin on settings" ON public.site_settings;
CREATE POLICY "Allow all for admin on settings" ON public.site_settings FOR ALL USING (true);

-- 7. Add Image URL to APKs Table
ALTER TABLE public.apks ADD COLUMN IF NOT EXISTS image_url text;
