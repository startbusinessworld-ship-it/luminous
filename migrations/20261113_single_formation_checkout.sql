-- Apply only AFTER inspecting production schema and reconciling legacy payments.
-- Depends on 20261020_payment_gate.sql. This draft has not been applied to production.
begin;
create table public.formation_orders (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null unique references auth.users(id),
 email text not null,
 details jsonb not null,
 state text not null default 'checkout_open' check(state in ('checkout_open','paid','review_required')),
 attempt_key uuid not null default gen_random_uuid(),
 attempt_started_at timestamptz not null default now(),
 stripe_session_id text unique,
 paid_at timestamptz,
 created_at timestamptz not null default now()
);
alter table public.formation_orders enable row level security;
revoke all on public.formation_orders from public, anon, authenticated;
grant select on public.formation_orders to authenticated;
grant all on public.formation_orders to service_role;
create policy formation_order_own_read on public.formation_orders for select to authenticated using (user_id=(select auth.uid()));

-- Immutable snapshot per attempt: concurrent requests use identical Stripe parameters.
create function public.reserve_formation_checkout(p_user_id uuid,p_email text,p_details jsonb)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare o public.formation_orders;
begin
 if auth.role() is distinct from 'service_role' then raise exception 'Forbidden' using errcode='42501'; end if;
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_user_id::text,0));
 if exists(select 1 from public.payment_receipts where user_id=p_user_id and product_type='creation') then return jsonb_build_object('state','paid'); end if;
 select * into o from public.formation_orders where user_id=p_user_id;
 if found then return to_jsonb(o); end if;
 if exists(select 1 from public.dossiers where user_id=p_user_id) then return jsonb_build_object('state','review_required'); end if;
 if length(trim(p_details->>'company_name')) not between 1 and 120 or length(trim(p_details->>'business_activity')) not between 1 and 2000 or length(trim(p_details->>'country')) not between 1 and 100 or not (p_details ?& array['company_name','business_activity','country']) then raise exception 'Incomplete project'; end if;
 insert into public.formation_orders(user_id,email,details) values(p_user_id,p_email,p_details) returning * into o;
 return to_jsonb(o);
end;$$;
create function public.attach_formation_checkout(p_user_id uuid,p_attempt_key uuid,p_session_id text)
returns void language plpgsql security invoker set search_path='' as $$
declare o public.formation_orders;
begin
 if auth.role() is distinct from 'service_role' then raise exception 'Forbidden' using errcode='42501'; end if;
 select * into o from public.formation_orders where user_id=p_user_id for update;
 if not found or o.attempt_key<>p_attempt_key or (o.stripe_session_id is not null and o.stripe_session_id<>p_session_id) then raise exception 'Checkout mismatch'; end if;
 update public.formation_orders set stripe_session_id=p_session_id where user_id=p_user_id;
end;$$;
-- Called only after Stripe explicitly confirms the previous session expired unpaid.
create function public.reset_expired_formation_checkout(p_user_id uuid,p_session_id text,p_attempt_key uuid)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare o public.formation_orders;
begin
 if auth.role() is distinct from 'service_role' then raise exception 'Forbidden' using errcode='42501'; end if;
 select * into o from public.formation_orders where user_id=p_user_id for update;
 if not found then raise exception 'Unknown order'; end if;
 if o.state='checkout_open' and o.attempt_key=p_attempt_key and o.stripe_session_id=p_session_id then
  update public.formation_orders set attempt_key=gen_random_uuid(), attempt_started_at=now(), stripe_session_id=null where user_id=p_user_id returning * into o;
 end if;
 return to_jsonb(o);
end;$$;
create function public.complete_formation_order(p_user_id uuid,p_attempt_key uuid,p_session_id text,p_amount integer)
returns void language plpgsql security invoker set search_path='' as $$
declare o public.formation_orders;
begin
 if auth.role() is distinct from 'service_role' then raise exception 'Forbidden' using errcode='42501'; end if;
 select * into o from public.formation_orders where user_id=p_user_id for update;
 if not found or o.attempt_key<>p_attempt_key or (o.stripe_session_id is not null and o.stripe_session_id<>p_session_id) or p_amount<>149000 then raise exception 'Payment mismatch'; end if;
 perform public.record_verified_payment(p_session_id,p_user_id,'creation',p_amount);
 update public.formation_orders set state='paid',paid_at=coalesce(paid_at,now()),stripe_session_id=p_session_id where user_id=p_user_id;
 update public.dossiers set company_name=coalesce(nullif(company_name,''),o.details->>'company_name'),business_activity=coalesce(nullif(business_activity,''),o.details->>'business_activity') where user_id=p_user_id;
end;$$;
revoke all on function public.reserve_formation_checkout(uuid,text,jsonb),public.attach_formation_checkout(uuid,uuid,text),public.reset_expired_formation_checkout(uuid,text,uuid),public.complete_formation_order(uuid,uuid,text,integer) from public,anon,authenticated;
grant execute on function public.reserve_formation_checkout(uuid,text,jsonb),public.attach_formation_checkout(uuid,uuid,text),public.reset_expired_formation_checkout(uuid,text,uuid),public.complete_formation_order(uuid,uuid,text,integer) to service_role;

-- Preserve existing delivery policies but make payment + ownership mandatory for clients.
alter table public.official_documents enable row level security;
create policy official_docs_payment_and_owner on public.official_documents as restrictive for select to authenticated
 using ((user_id=(select auth.uid()) and public.has_formation_payment()) or (select auth.jwt())->'app_metadata'->>'role'='admin');
create policy official_docs_no_anonymous on public.official_documents as restrictive for all to anon using(false) with check(false);
create policy official_docs_admin_write on public.official_documents as restrictive for insert to authenticated with check((select auth.jwt())->'app_metadata'->>'role'='admin');
create policy official_docs_admin_update on public.official_documents as restrictive for update to authenticated using((select auth.jwt())->'app_metadata'->>'role'='admin') with check((select auth.jwt())->'app_metadata'->>'role'='admin');
create policy official_docs_admin_delete on public.official_documents as restrictive for delete to authenticated using((select auth.jwt())->'app_metadata'->>'role'='admin');
commit;
