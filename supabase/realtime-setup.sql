-- ============================================================
-- CampaignForge — Supabase Realtime Setup
-- ============================================================
-- Run this script in your Supabase project's SQL Editor
-- (https://app.supabase.com → SQL Editor)
--
-- This enables Supabase Realtime for chat messages and configures
-- permissive RLS policies so the anon key can subscribe to changes.
--
-- Note: CampaignForge uses its own JWT auth (not Supabase Auth).
-- Write operations go through authenticated API routes (Prisma).
-- Realtime only needs read access via the anon key.
-- ============================================================

-- 1. Enable REPLICA IDENTITY FULL on chat_messages
--    Required so Realtime broadcasts the full row (including room_id)
--    instead of just the primary key.
ALTER TABLE chat_messages REPLICA IDENTITY FULL;
ALTER TABLE chat_rooms REPLICA IDENTITY FULL;

-- 2. Enable Row Level Security (required for Realtime to work)
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;

-- 3. Permissive SELECT policy for Realtime subscriptions
--    The anon key is used client-side for Realtime only.
--    Actual authorization (room type, membership) is enforced
--    in the API routes before messages are created.
CREATE POLICY "realtime_select_chat_messages"
  ON chat_messages FOR SELECT
  USING (true);

CREATE POLICY "realtime_select_chat_rooms"
  ON chat_rooms FOR SELECT
  USING (true);

-- 4. Add the tables to the Supabase Realtime publication
--    (Only needed if you're managing the publication manually)
-- ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
-- ALTER PUBLICATION supabase_realtime ADD TABLE chat_rooms;
--
-- In most Supabase projects, supabase_realtime already covers all tables.
-- Uncomment the above lines only if you have a custom publication setup.

-- ============================================================
-- Prisma schema migration: ChannelType
-- ============================================================
-- If you've added channelType to your schema and need to migrate:
--
-- CREATE TYPE "ChannelType" AS ENUM ('TEXT', 'VOICE');
-- ALTER TABLE chat_rooms ADD COLUMN channel_type "ChannelType" NOT NULL DEFAULT 'TEXT';
--
-- Or use: npx prisma db push
-- ============================================================
