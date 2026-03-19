-- Add user_id and resource to system_logs if they don't exist
ALTER TABLE public.system_logs ADD COLUMN IF NOT EXISTS user_id VARCHAR(255);
ALTER TABLE public.system_logs ADD COLUMN IF NOT EXISTS resource VARCHAR(255) DEFAULT 'Sistema';

-- Make user_id nullable if it was NOT NULL
ALTER TABLE public.system_logs ALTER COLUMN user_id DROP NOT NULL;
