-- IyaLife Platform — Referral Code Generation
-- Run after 001_schema.sql and 002_rls.sql, in the Supabase SQL Editor.
-- Corresponds to BUILD.md Prompt 02.

-- 1. Generate a human-readable, unique referral code.
--    Format: first 3-4 letters of first name (uppercased) + "-" + 4 random digits.
--    Example: ADA-2607, NGOZI-1143, BISI-4421
create or replace function generate_referral_code(p_full_name text)
returns text
language plpgsql
as $$
declare
  first_name  text;
  base_letters text;
  candidate    text;
  attempts     int := 0;
begin
  first_name := split_part(trim(p_full_name), ' ', 1);
  base_letters := upper(regexp_replace(first_name, '[^a-zA-Z]', '', 'g'));

  if length(base_letters) < 3 then
    base_letters := rpad(base_letters, 3, 'X');
  end if;
  base_letters := substring(base_letters from 1 for 4);

  loop
    candidate := base_letters || '-' || lpad(floor(random() * 10000)::text, 4, '0');
    attempts := attempts + 1;

    exit when not exists (select 1 from mothers where referral_code = candidate);
    exit when attempts > 50; -- safety valve; extremely unlikely with 10,000 combinations
  end loop;

  return candidate;
end;
$$;

-- 2. Trigger: on insert into mothers, auto-generate referral_code and
--    member_number (member_number already has a `serial` default — this
--    trigger only fills it in if it somehow arrived null).
create or replace function set_mother_defaults()
returns trigger
language plpgsql
as $$
begin
  if new.referral_code is null or new.referral_code = '' then
    new.referral_code := generate_referral_code(new.full_name);
  end if;

  if new.member_number is null then
    new.member_number := nextval(pg_get_serial_sequence('mothers', 'member_number'));
  end if;

  return new;
end;
$$;

drop trigger if exists trg_set_mother_defaults on mothers;
create trigger trg_set_mother_defaults
  before insert on mothers
  for each row
  execute function set_mother_defaults();

-- 3. Validate a referral code: must exist, and the referrer must be under
--    the 20-direct-referral founding-circle cap.
create or replace function validate_referral_code(p_code text)
returns boolean
language plpgsql
as $$
declare
  v_referrer_id uuid;
  v_referral_count int;
begin
  select id into v_referrer_id
  from mothers
  where referral_code = p_code;

  if v_referrer_id is null then
    return false;
  end if;

  select count(*) into v_referral_count
  from referrals
  where referrer_id = v_referrer_id;

  return v_referral_count < 20;
end;
$$;
