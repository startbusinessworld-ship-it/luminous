-- =====================================================
-- LUMINOUS — Supabase Database Setup
-- Run this in Supabase > SQL Editor > New query
-- =====================================================

-- 1. PROFILES (extends auth.users)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text,
  full_name text,
  country text,
  type text default 'client',
  created_at timestamptz default now()
);

-- 2. DOSSIERS (company files)
create table if not exists public.dossiers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  company_name text,
  status text default 'pending',
  order_date timestamptz default now(),
  notes text,
  updated_at timestamptz default now()
);

-- 3. DOCUMENTS
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  dossier_id uuid references public.dossiers(id),
  name text,
  type text,
  file_name text,
  file_size int,
  file_data text,
  status text default 'received',
  uploaded_at timestamptz default now()
);

-- 4. AFFILIATES
create table if not exists public.affiliates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade unique,
  referral_code text unique,
  commission_rate int default 149,
  total_earned int default 0,
  pending_payout int default 0,
  paid_out int default 0,
  created_at timestamptz default now()
);

-- 5. REFERRALS
create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  affiliate_id uuid references public.affiliates(id),
  referred_email text,
  referred_user_id uuid references public.profiles(id),
  status text default 'pending',
  commission int default 149,
  created_at timestamptz default now()
);

-- 6. NOTIFICATIONS (admin only)
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  type text,
  title text,
  message text,
  user_id uuid references public.profiles(id),
  read boolean default false,
  created_at timestamptz default now()
);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================
alter table public.profiles enable row level security;
alter table public.dossiers enable row level security;
alter table public.documents enable row level security;
alter table public.affiliates enable row level security;
alter table public.referrals enable row level security;
alter table public.notifications enable row level security;

-- Profiles
create policy "profiles_select" on public.profiles for select using (auth.uid() = id);
create policy "profiles_insert" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update" on public.profiles for update using (auth.uid() = id);

-- Dossiers
create policy "dossiers_select" on public.dossiers for select using (auth.uid() = user_id);
create policy "dossiers_insert" on public.dossiers for insert with check (auth.uid() = user_id);

-- Documents
create policy "documents_select" on public.documents for select using (auth.uid() = user_id);
create policy "documents_insert" on public.documents for insert with check (auth.uid() = user_id);

-- Affiliates
create policy "affiliates_select" on public.affiliates for select using (auth.uid() = user_id);
create policy "affiliates_insert" on public.affiliates for insert with check (auth.uid() = user_id);

-- Referrals
create policy "referrals_select" on public.referrals for select using (
  affiliate_id in (select id from public.affiliates where user_id = auth.uid())
);
create policy "referrals_insert" on public.referrals for insert with check (true);

-- Notifications: anyone can insert, admin reads via anon key with service role
create policy "notifications_insert" on public.notifications for insert with check (true);
create policy "notifications_select" on public.notifications for select using (true);
create policy "notifications_update" on public.notifications for update using (true);

-- =====================================================
-- ADMIN: disable RLS for admin queries via service role
-- (The admin panel uses the anon key so needs these policies)
-- =====================================================

-- Allow admin to read all profiles
create policy "admin_profiles_select" on public.profiles for select using (true);

-- Allow admin to read/update all dossiers
create policy "admin_dossiers_select" on public.dossiers for select using (true);
create policy "admin_dossiers_update" on public.dossiers for update using (true);

-- Allow admin to read/update all documents
create policy "admin_documents_select" on public.documents for select using (true);
create policy "admin_documents_update" on public.documents for update using (true);

-- Allow admin to read/update all affiliates
create policy "admin_affiliates_select" on public.affiliates for select using (true);
create policy "admin_affiliates_update" on public.affiliates for update using (true);

-- Allow admin to read/update all referrals
create policy "admin_referrals_select" on public.referrals for select using (true);
create policy "admin_referrals_update" on public.referrals for update using (true);

-- =====================================================
-- Done! Your Luminous database is ready.
-- =====================================================
