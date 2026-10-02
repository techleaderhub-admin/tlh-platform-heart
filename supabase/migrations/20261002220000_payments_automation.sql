-- Payment catalog, idempotency and membership automation.
create table if not exists public.payment_products (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  price numeric(12,2) not null check (price >= 0),
  currency text not null default 'INR',
  membership_level public.membership_level,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists payment_products_active_idx on public.payment_products(is_active);

alter table public.payments add column if not exists product_id uuid references public.payment_products(id) on delete set null;
alter table public.payments add column if not exists metadata jsonb not null default '{}'::jsonb;

create unique index if not exists payments_external_transaction_unique_idx
on public.payments(external_transaction_id)
where external_transaction_id is not null;

create table if not exists public.payment_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  provider_event_id text not null,
  payment_id uuid references public.payments(id) on delete set null,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'received' check (status in ('received','processed','failed')),
  error_message text,
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  unique(provider, provider_event_id)
);

create or replace function public.touch_payment_products_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists payment_products_updated_at on public.payment_products;
create trigger payment_products_updated_at
before update on public.payment_products
for each row execute function public.touch_payment_products_updated_at();

create or replace function public.apply_successful_payment_membership()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  target_level public.membership_level;
  current_level public.membership_level;
begin
  if new.status not in ('paid','completed','success') or new.product_id is null then
    return new;
  end if;

  select membership_level into target_level
  from public.payment_products
  where id = new.product_id and is_active = true;

  if target_level is null or target_level = 'free' then
    return new;
  end if;

  select level into current_level
  from public.student_memberships
  where student_id = new.student_id
  for update;

  if current_level is null then
    insert into public.student_memberships(student_id, level, assigned_by, note)
    values (new.student_id, target_level, null, 'Automated from successful payment ' || new.id::text);
  elsif public.membership_level_rank(target_level) > public.membership_level_rank(current_level) then
    update public.student_memberships
    set level = target_level,
        is_active = true,
        assigned_by = null,
        note = 'Automated from successful payment ' || new.id::text,
        updated_at = now()
    where student_id = new.student_id;
  end if;

  return new;
end;
$$;

drop trigger if exists payments_membership_automation on public.payments;
create trigger payments_membership_automation
after insert or update of status, product_id on public.payments
for each row execute function public.apply_successful_payment_membership();

alter table public.payment_products enable row level security;
drop policy if exists payment_products_admin_manage on public.payment_products;
create policy payment_products_admin_manage
on public.payment_products for all to authenticated
using (public.has_role(auth.uid(),'admin'::public.app_role))
with check (public.has_role(auth.uid(),'admin'::public.app_role));

alter table public.payment_events enable row level security;
drop policy if exists payment_events_admin_manage on public.payment_events;
create policy payment_events_admin_manage
on public.payment_events for all to authenticated
using (public.has_role(auth.uid(),'admin'::public.app_role))
with check (public.has_role(auth.uid(),'admin'::public.app_role));

create or replace function public.record_payment_event(
  p_provider text,
  p_provider_event_id text,
  p_event_type text,
  p_payload jsonb,
  p_payment_id uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare event_id uuid;
begin
  insert into public.payment_events(provider, provider_event_id, event_type, payload, payment_id)
  values (p_provider, p_provider_event_id, p_event_type, coalesce(p_payload,'{}'::jsonb), p_payment_id)
  on conflict (provider, provider_event_id) do update
    set payment_id = coalesce(excluded.payment_id, payment_events.payment_id),
        event_type = excluded.event_type,
        payload = excluded.payload
  returning id into event_id;
  return event_id;
end;
$$;

revoke execute on function public.record_payment_event(text,text,text,jsonb,uuid) from public;
grant execute on function public.record_payment_event(text,text,text,jsonb,uuid) to authenticated;
