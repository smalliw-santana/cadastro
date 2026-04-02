-- Execute this in your Supabase SQL Editor to add the avatar_url column
ALTER TABLE system_users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
