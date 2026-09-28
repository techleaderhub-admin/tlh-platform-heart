UPDATE public.profiles
SET phone = CASE
  WHEN phone IS NULL OR BTRIM(phone) = '' THEN NULL
  ELSE '+' || REGEXP_REPLACE(phone, '[^0-9]', '', 'g')
END,
updated_at = now()
WHERE phone IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS profiles_phone_unique_idx
ON public.profiles (phone)
WHERE phone IS NOT NULL;