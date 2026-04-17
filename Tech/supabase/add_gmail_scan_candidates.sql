-- Run this in the Supabase SQL Editor to add the gmail_scan_candidates table.
-- This table holds policy candidates found during a Gmail scan, pending user review.

create table if not exists gmail_scan_candidates (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid not null references users(id) on delete cascade,
  message_id           text not null,
  subject              text not null default '',
  sender_email         text not null default '',
  sent_date            text not null default '',
  policy_type          text not null,
  attachment_filename  text not null,
  attachment_id        text not null,
  attachment_size_bytes int not null default 0,
  scanned_at           timestamptz not null default now(),
  unique(user_id, message_id, attachment_id)
);
