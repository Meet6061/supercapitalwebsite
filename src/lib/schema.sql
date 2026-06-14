-- ============================================================
-- SUPER CAPITAL — FULL SCHEMA
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- 1. CLIENTS TABLE
-- One row per investor. Linked to auth.users via user_id.
create table if not exists public.clients (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid unique references auth.users(id) on delete cascade,
  full_name     text not null,
  email         text not null,
  pan           text,
  folio_number  text unique,
  phone         text,
  category      text default 'HNI',        -- HNI | Family Office | Institutional
  kyc_status    text default 'pending',     -- pending | verified | rejected
  status        text default 'active',      -- active | exited | suspended
  notes         text,                       -- admin-only internal notes
  joined_date   date,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- 2. INVESTMENTS TABLE
-- One row per investment tranche per client.
create table if not exists public.investments (
  id              uuid primary key default gen_random_uuid(),
  client_id       uuid not null references public.clients(id) on delete cascade,
  invested_cr     numeric(12,4) not null,
  investment_date date not null,
  units_allotted  numeric(16,6),
  nav_at_entry    numeric(12,4),
  status          text default 'active',   -- active | redeemed | partial
  notes           text,
  created_at      timestamptz default now()
);

-- 3. NAV DATA TABLE
-- Fund-level monthly NAV. Shared across all clients.
create table if not exists public.nav_data (
  id           uuid primary key default gen_random_uuid(),
  date         date not null unique,
  nav          numeric(12,4) not null,
  aum_cr       numeric(12,4),
  uploaded_by  text,
  created_at   timestamptz default now()
);

-- 4. HOLDINGS TABLE
-- Fund-level portfolio snapshot. Shared across all clients.
create table if not exists public.holdings (
  id           uuid primary key default gen_random_uuid(),
  as_of_date   date not null,
  stock_name   text not null,
  isin         text,
  sector       text,
  weight_pct   numeric(6,2),
  avg_cost     numeric(12,2),
  cmp          numeric(12,2),
  pnl_pct      numeric(8,2),
  created_at   timestamptz default now(),
  unique(as_of_date, stock_name)
);

-- 5. CLIENT STATEMENTS TABLE
-- Monthly per-client portfolio snapshot.
-- Admin enters this manually (or via future Excel import).
create table if not exists public.client_statements (
  id              uuid primary key default gen_random_uuid(),
  client_id       uuid not null references public.clients(id) on delete cascade,
  as_of_date      date not null,
  units           numeric(16,6),
  nav             numeric(12,4),
  current_value_cr numeric(12,4),
  invested_cr     numeric(12,4),
  pnl_cr          numeric(12,4),
  pnl_pct         numeric(8,2),
  xirr            numeric(8,2),
  created_at      timestamptz default now(),
  unique(client_id, as_of_date)
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.clients           enable row level security;
alter table public.investments       enable row level security;
alter table public.nav_data          enable row level security;
alter table public.holdings          enable row level security;
alter table public.client_statements enable row level security;

-- CLIENTS: investor sees only their own row; admin sees all
create policy "investor_own_client" on public.clients
  for select using (auth.uid() = user_id);

create policy "admin_all_clients" on public.clients
  for all using (
    exists (
      select 1 from public.clients c
      where c.user_id = auth.uid()
      and (
        (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true
      )
    )
    or (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true
  );

-- INVESTMENTS: investor sees only their own; admin sees all
create policy "investor_own_investments" on public.investments
  for select using (
    client_id in (
      select id from public.clients where user_id = auth.uid()
    )
  );

create policy "admin_all_investments" on public.investments
  for all using (
    (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true
  );

-- NAV DATA: all authenticated users can read
create policy "authenticated_read_nav" on public.nav_data
  for select using (auth.role() = 'authenticated');

create policy "admin_manage_nav" on public.nav_data
  for all using (
    (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true
  );

-- HOLDINGS: all authenticated users can read
create policy "authenticated_read_holdings" on public.holdings
  for select using (auth.role() = 'authenticated');

create policy "admin_manage_holdings" on public.holdings
  for all using (
    (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true
  );

-- CLIENT STATEMENTS: investor sees only their own; admin sees all
create policy "investor_own_statements" on public.client_statements
  for select using (
    client_id in (
      select id from public.clients where user_id = auth.uid()
    )
  );

create policy "admin_all_statements" on public.client_statements
  for all using (
    (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true
  );

-- ============================================================
-- AUTO UPDATE updated_at ON CLIENTS
-- ============================================================
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger clients_updated_at
  before update on public.clients
  for each row execute function update_updated_at();

-- ============================================================
-- SEED: NAV DATA (July 2024 – June 2025)
-- Starting NAV 1000, ending ~1214 (~21.4% annual)
-- ============================================================
insert into public.nav_data (date, nav, aum_cr) values
  ('2024-07-31', 1000.00, 2.50),
  ('2024-08-31', 1028.40, 2.57),
  ('2024-09-30', 1052.10, 2.63),
  ('2024-10-31', 1038.70, 2.60),
  ('2024-11-30', 1071.20, 2.68),
  ('2024-12-31', 1098.50, 2.75),
  ('2025-01-31', 1089.30, 2.72),
  ('2025-02-28', 1118.60, 2.80),
  ('2025-03-31', 1143.90, 2.86),
  ('2025-04-30', 1162.40, 2.91),
  ('2025-05-31', 1188.70, 2.97),
  ('2025-06-30', 1214.20, 3.04)
on conflict (date) do nothing;

-- ============================================================
-- SEED: HOLDINGS (as of June 30 2025)
-- 14 Indian stocks across 6 sectors
-- ============================================================
insert into public.holdings (as_of_date, stock_name, isin, sector, weight_pct, avg_cost, cmp, pnl_pct) values
  ('2025-06-30', 'HDFC Bank',          'INE040A01034', 'Financial Services', 12.50, 1480.00, 1742.00, 17.70),
  ('2025-06-30', 'Bajaj Finance',       'INE296A01024', 'Financial Services', 9.80,  6240.00, 7820.00, 25.32),
  ('2025-06-30', 'Cholamandalam Inv.',  'INE121A01024', 'Financial Services', 7.20,  1020.00, 1348.00, 32.16),
  ('2025-06-30', 'Coforge',             'INE591G01017', 'Technology',         8.40,  4820.00, 6140.00, 27.39),
  ('2025-06-30', 'PB Fintech',          'INE417T01026', 'Technology',         6.10,  1240.00, 1680.00, 35.48),
  ('2025-06-30', 'Tata Consultancy',    'INE467B01029', 'Technology',         5.80,  3680.00, 4120.00, 11.96),
  ('2025-06-30', 'Titan Company',       'INE280A01028', 'Consumer',           8.90,  3240.00, 3840.00, 18.52),
  ('2025-06-30', 'Jyothy Labs',         'INE668F01031', 'Consumer',           5.40,   312.00,  418.00, 33.97),
  ('2025-06-30', 'Zomato',              'INE758T01015', 'Consumer',           6.20,   142.00,  224.00, 57.75),
  ('2025-06-30', 'Deepak Nitrite',      'INE191B01025', 'Chemicals',          7.60,  2140.00, 2680.00, 25.23),
  ('2025-06-30', 'APL Apollo Tubes',    'INE702C01027', 'Industrials',        6.80,  1480.00, 1840.00, 24.32),
  ('2025-06-30', 'NCC Limited',         'INE868B01028', 'Industrials',        5.30,   184.00,  248.00, 34.78),
  ('2025-06-30', 'Tata Motors',         'INE155A01022', 'Automobiles',        7.40,   682.00,  924.00, 35.48),
  ('2025-06-30', 'Delhivery',           'INE148O01028', 'Logistics',          6.60,   384.00,  482.00, 25.52)
on conflict (as_of_date, stock_name) do nothing;
