-- Run this in the Supabase SQL Editor.
-- Adds gmail_message_id to policies so re-scans don't re-surface already-imported emails.

alter table policies add column if not exists gmail_message_id text;
