-- Review live schema and assign a real administrator before applying.
-- Backfill existing paid clients from verified Stripe sessions, NOT dossier status.
begin;
create table if not exists public.payment_receipts (
 stripe_session_id text primary key,
 user_id uuid not null references auth.users(id),
 product_type text not null check(product_type in ('creation','renewal')),
 amount integer not null,
 verified_at timestamptz not null default now(),
 check ((product_type='creation' and amount=149000) or (product_type='renewal' and amount=99000))
);
alter table public.payment_receipts enable row level security;
revoke all on public.payment_receipts from public,anon,authenticated;
grant select on public.payment_receipts to authenticated;
grant all on public.payment_receipts to service_role;
create policy receipts_own_read on public.payment_receipts for select to authenticated using (user_id=auth.uid());

create or replace function public.has_formation_payment() returns boolean
language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.payment_receipts where user_id=auth.uid() and product_type='creation');
$$;
revoke all on function public.has_formation_payment() from public,anon;
grant execute on function public.has_formation_payment() to authenticated;

-- Fails rather than silently merging duplicate dossiers; inspect those first.
create unique index if not exists dossiers_one_per_user on public.dossiers(user_id);
create or replace function public.record_verified_payment(p_session_id text,p_user_id uuid,p_product_type text,p_amount integer)
returns void language plpgsql security definer set search_path='' as $$
begin
 if auth.role() is distinct from 'service_role' then raise exception 'Forbidden' using errcode='42501'; end if;
 -- Serialise retries for a user, including different payment sessions.
 perform 1 from auth.users where id=p_user_id for update;
 if not found then raise exception 'Unknown account'; end if;
 if exists(select 1 from public.payment_receipts where stripe_session_id=p_session_id and (user_id<>p_user_id or product_type<>p_product_type or amount<>p_amount)) then raise exception 'Payment identity mismatch'; end if;
 insert into public.payment_receipts(stripe_session_id,user_id,product_type,amount)
 values(p_session_id,p_user_id,p_product_type,p_amount) on conflict(stripe_session_id) do nothing;
 if p_product_type='creation' then
  insert into public.dossiers(user_id,status) values(p_user_id,'payment_confirmed')
  on conflict(user_id) do update set status='payment_confirmed',updated_at=now()
  where public.dossiers.status='pending';
 end if;
end;$$;
revoke all on function public.record_verified_payment(text,uuid,text,integer) from public,anon,authenticated;
grant execute on function public.record_verified_payment(text,uuid,text,integer) to service_role;

-- Replace permissive policies; PostgreSQL ORs permissive policies together.
do $$ declare p record; begin
 for p in select tablename,policyname from pg_policies where schemaname='public' and tablename in ('dossiers','documents') loop
  execute format('drop policy %I on public.%I',p.policyname,p.tablename);
 end loop;
end $$;
alter table public.dossiers enable row level security;
alter table public.documents enable row level security;
create policy dossiers_read on public.dossiers for select to authenticated using (user_id=auth.uid() or auth.jwt()->'app_metadata'->>'role'='admin');
create policy dossiers_client_update on public.dossiers for update to authenticated using (user_id=auth.uid() and public.has_formation_payment()) with check(user_id=auth.uid() and public.has_formation_payment());
create policy dossiers_admin on public.dossiers for all to authenticated using(auth.jwt()->'app_metadata'->>'role'='admin') with check(auth.jwt()->'app_metadata'->>'role'='admin');
create policy documents_read on public.documents for select to authenticated using(user_id=auth.uid() and public.has_formation_payment());
create policy documents_client_insert on public.documents for insert to authenticated with check(
 user_id=auth.uid() and public.has_formation_payment() and status='received'
 and type in ('passport','selfie','address_proof')
 and exists(select 1 from public.dossiers d where d.id=dossier_id and d.user_id=auth.uid())
);
create policy documents_admin on public.documents for all to authenticated using(auth.jwt()->'app_metadata'->>'role'='admin') with check(auth.jwt()->'app_metadata'->>'role'='admin');

-- A client can submit their names/activity, never grant themselves payment or advance processing.
create or replace function public.guard_client_dossier_update() returns trigger
language plpgsql set search_path='' as $$
begin
 if auth.role()='service_role' or auth.jwt()->'app_metadata'->>'role'='admin' then return new; end if;
 if auth.uid() is null or auth.uid()<>old.user_id or not public.has_formation_payment() then raise exception 'Payment required' using errcode='42501'; end if;
 if (to_jsonb(new)-array['company_name','company_name_2','company_name_3','business_activity','status','updated_at']) is distinct from
    (to_jsonb(old)-array['company_name','company_name_2','company_name_3','business_activity','status','updated_at']) then raise exception 'Protected dossier fields' using errcode='42501'; end if;
 if old.status not in ('payment_confirmed','docs_submitted') or new.status<>'docs_submitted' then raise exception 'Invalid client status change' using errcode='42501'; end if;
 return new;
end;$$;
revoke all on function public.guard_client_dossier_update() from public,anon,authenticated;
create trigger guard_client_dossier_update before update on public.dossiers for each row execute function public.guard_client_dossier_update();
commit;
