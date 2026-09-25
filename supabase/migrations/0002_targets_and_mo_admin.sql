-- Editable targets per MO. NULL means "use the built-in default targets".
alter table public.users add column if not exists targets jsonb;
