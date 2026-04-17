-- =============================================================
-- MyInsuranceWallet — Database Schema
-- Paste this entire file into Supabase SQL Editor and run it.
-- =============================================================

-- Enable pgcrypto for gen_random_bytes (access tokens)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- =============================================================
-- TABLES
-- =============================================================

-- Users
-- One row per policyholder. Email is the unique identifier.
CREATE TABLE IF NOT EXISTS public.users (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email            TEXT        UNIQUE NOT NULL,
  name             TEXT,
  consent_given    BOOLEAN     NOT NULL DEFAULT FALSE,
  consent_given_at TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Policies
-- Each policy belongs to one user. File is stored in Supabase Storage.
-- source: 'upload' = manually uploaded by user, 'email' = auto-imported from Gmail
CREATE TABLE IF NOT EXISTS public.policies (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name            TEXT        NOT NULL,
  type            TEXT        NOT NULL CHECK (type IN ('Health', 'Life', 'Term', 'Vehicle', 'Other')),
  file_url        TEXT,
  file_name       TEXT        NOT NULL,
  file_size_bytes INTEGER,
  source          TEXT        NOT NULL DEFAULT 'upload' CHECK (source IN ('upload', 'email')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Gmail Tokens
-- Stores Google OAuth tokens for users who granted Gmail read access.
-- Used to call Gmail API server-side to scan for insurance policy emails.
CREATE TABLE IF NOT EXISTS public.gmail_tokens (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID        NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  access_token        TEXT        NOT NULL,
  refresh_token       TEXT        NOT NULL,
  granted_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_scanned_at     TIMESTAMPTZ
);

-- Contacts
-- Trusted contacts added by a user. Email must be unique per owner.
CREATE TABLE IF NOT EXISTS public.contacts (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id   UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name       TEXT        NOT NULL,
  email      TEXT        NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (owner_id, email)
);

-- Policy Shares
-- Links a policy to a contact with a unique access token for the share link.
CREATE TABLE IF NOT EXISTS public.policy_shares (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_id    UUID        NOT NULL REFERENCES public.policies(id) ON DELETE CASCADE,
  contact_id   UUID        NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  access_token TEXT        UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (policy_id, contact_id)
);


-- =============================================================
-- INDEXES
-- =============================================================

CREATE INDEX IF NOT EXISTS idx_policies_user_id      ON public.policies(user_id);
CREATE INDEX IF NOT EXISTS idx_gmail_tokens_user_id  ON public.gmail_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_contacts_owner_id     ON public.contacts(owner_id);
CREATE INDEX IF NOT EXISTS idx_policy_shares_policy  ON public.policy_shares(policy_id);
CREATE INDEX IF NOT EXISTS idx_policy_shares_contact ON public.policy_shares(contact_id);
CREATE INDEX IF NOT EXISTS idx_policy_shares_token   ON public.policy_shares(access_token);


-- =============================================================
-- ROW LEVEL SECURITY
-- =============================================================
-- RLS is enabled on all tables.
-- In staging, the server uses the service_role key which bypasses RLS.
-- These policies will enforce access correctly once Supabase Google OAuth is wired up.

ALTER TABLE public.users         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policies      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policy_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gmail_tokens  ENABLE ROW LEVEL SECURITY;

-- Users: can only read and update their own row
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (auth.uid()::text = id::text);

-- Policies: owner has full access
CREATE POLICY "policies_select_own" ON public.policies
  FOR SELECT USING (
    user_id IN (SELECT id FROM public.users WHERE auth.uid()::text = id::text)
  );

CREATE POLICY "policies_insert_own" ON public.policies
  FOR INSERT WITH CHECK (
    user_id IN (SELECT id FROM public.users WHERE auth.uid()::text = id::text)
  );

CREATE POLICY "policies_update_own" ON public.policies
  FOR UPDATE USING (
    user_id IN (SELECT id FROM public.users WHERE auth.uid()::text = id::text)
  );

CREATE POLICY "policies_delete_own" ON public.policies
  FOR DELETE USING (
    user_id IN (SELECT id FROM public.users WHERE auth.uid()::text = id::text)
  );

-- Gmail Tokens: only the owning user can access their own tokens
-- (service_role key used server-side bypasses these for scanning)
CREATE POLICY "gmail_tokens_select_own" ON public.gmail_tokens
  FOR SELECT USING (
    user_id IN (SELECT id FROM public.users WHERE auth.uid()::text = id::text)
  );

CREATE POLICY "gmail_tokens_insert_own" ON public.gmail_tokens
  FOR INSERT WITH CHECK (
    user_id IN (SELECT id FROM public.users WHERE auth.uid()::text = id::text)
  );

CREATE POLICY "gmail_tokens_update_own" ON public.gmail_tokens
  FOR UPDATE USING (
    user_id IN (SELECT id FROM public.users WHERE auth.uid()::text = id::text)
  );

CREATE POLICY "gmail_tokens_delete_own" ON public.gmail_tokens
  FOR DELETE USING (
    user_id IN (SELECT id FROM public.users WHERE auth.uid()::text = id::text)
  );

-- Contacts: owner has full access
CREATE POLICY "contacts_select_own" ON public.contacts
  FOR SELECT USING (
    owner_id IN (SELECT id FROM public.users WHERE auth.uid()::text = id::text)
  );

CREATE POLICY "contacts_insert_own" ON public.contacts
  FOR INSERT WITH CHECK (
    owner_id IN (SELECT id FROM public.users WHERE auth.uid()::text = id::text)
  );

CREATE POLICY "contacts_delete_own" ON public.contacts
  FOR DELETE USING (
    owner_id IN (SELECT id FROM public.users WHERE auth.uid()::text = id::text)
  );

-- Policy Shares: policy owner has full access
CREATE POLICY "policy_shares_select_own" ON public.policy_shares
  FOR SELECT USING (
    policy_id IN (
      SELECT p.id FROM public.policies p
      JOIN public.users u ON u.id = p.user_id
      WHERE auth.uid()::text = u.id::text
    )
  );

CREATE POLICY "policy_shares_insert_own" ON public.policy_shares
  FOR INSERT WITH CHECK (
    policy_id IN (
      SELECT p.id FROM public.policies p
      JOIN public.users u ON u.id = p.user_id
      WHERE auth.uid()::text = u.id::text
    )
  );

CREATE POLICY "policy_shares_delete_own" ON public.policy_shares
  FOR DELETE USING (
    policy_id IN (
      SELECT p.id FROM public.policies p
      JOIN public.users u ON u.id = p.user_id
      WHERE auth.uid()::text = u.id::text
    )
  );


-- =============================================================
-- STORAGE BUCKET
-- =============================================================
-- Run this section separately if the SQL editor doesn't support it,
-- or create the bucket manually in Storage > New Bucket.

INSERT INTO storage.buckets (id, name, public)
VALUES ('policies', 'policies', false)
ON CONFLICT (id) DO NOTHING;

-- Only the file owner can upload / read / delete their own files
CREATE POLICY "storage_upload_own" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'policies' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "storage_read_own" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'policies' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "storage_delete_own" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'policies' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
