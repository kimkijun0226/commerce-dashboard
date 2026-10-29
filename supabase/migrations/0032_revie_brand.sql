-- Preserve campaign assets and destinations; replace the previous default wordmark.
update public.store_settings
set logo_url='/brand/revie-logo.svg',updated_at=now()
where logo_url is null or logo_url='/brand/oveon-logo.svg';
