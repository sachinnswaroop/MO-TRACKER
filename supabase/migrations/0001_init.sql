-- MO-TRACKER: initial schema
-- Replaces users.json / mo_activity.json local-file storage with Postgres tables.
-- targets.json is intentionally NOT migrated: MONTHLY_TARGETS is hardcoded in app.py
-- and targets.json was never read/written by the app.

create table if not exists public.users (
    user_id text primary key,
    password text not null,
    role text not null,
    name text,
    mo_name text,
    cac text
);

create table if not exists public.tour_plans (
    id bigserial primary key,
    user_id text not null references public.users(user_id),
    mo_name text,
    date text not null,
    category text not null,
    plan text,
    created_at timestamptz not null default now(),
    unique (user_id, date, category)
);

create table if not exists public.tour_reports (
    id bigserial primary key,
    user_id text not null references public.users(user_id),
    date text not null,
    home_loan_no integer not null default 0,
    home_loan_amt numeric not null default 0,
    vehicle_loan_no integer not null default 0,
    vehicle_loan_amt numeric not null default 0,
    other_retail_no integer not null default 0,
    other_retail_amt numeric not null default 0,
    builder_tieup integer not null default 0,
    dealer_tieup integer not null default 0,
    deposits_no integer not null default 0,
    deposits_amt numeric not null default 0,
    third_party_no integer not null default 0,
    third_party_amt numeric not null default 0,
    unique (user_id, date)
);

create table if not exists public.co_reports (
    id bigserial primary key,
    user_id text not null references public.users(user_id),
    date text not null,
    lms text not null default 'No',
    google_form text not null default 'No',
    unique (user_id, date)
);

-- Single-row pointer to the currently active uploaded lead report in Storage
-- (replaces "pick the most recently modified file in uploads/" logic).
create table if not exists public.current_upload (
    id smallint primary key default 1,
    filename text not null,
    storage_path text not null,
    last_updated timestamptz not null default now(),
    constraint current_upload_singleton check (id = 1)
);

-- Storage bucket for uploaded Excel lead reports (replaces local uploads/ folder).
-- Private: only the server (service_role key) reads/writes it.
insert into storage.buckets (id, name, public)
values ('uploads', 'uploads', false)
on conflict (id) do nothing;

-- RLS stays enabled with no policies: this app is accessed only via the
-- FastAPI backend using the service_role key, which bypasses RLS entirely.
alter table public.users enable row level security;
alter table public.tour_plans enable row level security;
alter table public.tour_reports enable row level security;
alter table public.co_reports enable row level security;
alter table public.current_upload enable row level security;
