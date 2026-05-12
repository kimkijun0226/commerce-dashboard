ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS image_url TEXT;

COMMENT ON COLUMN public.users.image_url IS '프로필 이미지 URL 또는 data URL 저장용 (nullable)';

