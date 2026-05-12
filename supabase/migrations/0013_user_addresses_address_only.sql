-- 0013_user_addresses_address_only.sql
-- user_addresses를 "주소만 저장" 용도로 단순화:
-- - recipient_name / recipient_phone / memo 를 optional로 변경

ALTER TABLE public.user_addresses
  ALTER COLUMN recipient_name DROP NOT NULL,
  ALTER COLUMN recipient_phone DROP NOT NULL;

-- memo는 원래 nullable이지만, 명시적으로 유지
ALTER TABLE public.user_addresses
  ALTER COLUMN memo DROP NOT NULL;

