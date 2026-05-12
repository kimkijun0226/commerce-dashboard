-- ============================================================
-- 0011_user_addresses
-- - 사용자 배송지 주소 여러 개 저장
-- - 최대 10개 제한
-- - 기본 배송지 1개만 유지
-- ============================================================

-- 1) table
create table if not exists public.user_addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text,
  recipient_name text not null,
  recipient_phone text not null,
  address_line1 text not null,
  address_line2 text,
  memo text,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_user_addresses_user_id on public.user_addresses(user_id);

-- 기본 배송지 1개만
create unique index if not exists user_addresses_one_default_per_user
  on public.user_addresses(user_id)
  where is_default;

-- 2) updated_at trigger
create or replace function public.set_updated_at_user_addresses()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_user_addresses_updated_at on public.user_addresses;
create trigger trg_user_addresses_updated_at
before update on public.user_addresses
for each row execute function public.set_updated_at_user_addresses();

-- 3) max 10 addresses per user
create or replace function public.enforce_user_addresses_limit()
returns trigger
language plpgsql
as $$
declare
  cnt int;
begin
  -- insert 시에만 제한(업데이트는 제외)
  if (tg_op = 'INSERT') then
    select count(*) into cnt
    from public.user_addresses
    where user_id = new.user_id;

    if cnt >= 10 then
      raise exception 'USER_ADDRESSES_LIMIT_EXCEEDED';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_user_addresses_limit on public.user_addresses;
create trigger trg_user_addresses_limit
before insert on public.user_addresses
for each row execute function public.enforce_user_addresses_limit();

-- 4) RLS
alter table public.user_addresses enable row level security;

drop policy if exists user_addresses_select_own on public.user_addresses;
create policy user_addresses_select_own
on public.user_addresses
for select
using (user_id = auth.uid());

drop policy if exists user_addresses_insert_own on public.user_addresses;
create policy user_addresses_insert_own
on public.user_addresses
for insert
with check (user_id = auth.uid());

drop policy if exists user_addresses_update_own on public.user_addresses;
create policy user_addresses_update_own
on public.user_addresses
for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists user_addresses_delete_own on public.user_addresses;
create policy user_addresses_delete_own
on public.user_addresses
for delete
using (user_id = auth.uid());

