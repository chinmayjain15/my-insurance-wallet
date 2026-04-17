# Email Policy Auto-Import — Implementation Plan

## Feature Goal
Reduce friction for users by automatically finding and importing insurance policy documents from their Gmail inbox, instead of requiring manual uploads.

## Status Legend
- `[ ]` Not started
- `[~]` In progress
- `[x]` Done
- `[!]` Blocked / needs decision

---

## Phase 1 — Foundation

- [x] **Spike: Verify Supabase surfaces Gmail OAuth tokens**
  Confirmed `provider_token` and `provider_refresh_token` are both present after Google OAuth.

- [x] **DB schema — Add `source` column to `policies` table**
  Values: `'upload'` (default) | `'email'`. Migration run in Supabase.

- [x] **DB schema — Create `gmail_tokens` table**
  Stores `user_id`, `access_token`, `refresh_token`, `granted_at`, `last_scanned_at`. Migration run in Supabase.

---

## Phase 2 — Consent & Token Capture

- [x] **Consent page — Add Gmail opt-in section**
  Optional card on `/consent` page. User can toggle "Enable email scanning". Clearly states read-only access.

- [x] **Auth flow — Request Gmail scope on opt-in**
  If opted in: saves consent → triggers second Google OAuth with `gmail.readonly` scope → redirects to `/auth/callback?gmail=true`.

- [x] **Auth callback — Store Gmail tokens**
  Detects `?gmail=true`, extracts `provider_token` + `provider_refresh_token`, upserts into `gmail_tokens` table.

- [x] **End-to-end test — Consent + token storage**
  Sign in → consent page → opt in → Google OAuth → `/home`. Verify `gmail_tokens` row exists in Supabase.

---

## Phase 3 — Gmail Scanner

- [x] **Gmail API — Fetch candidate emails**
  `src/lib/gmail/api.ts` — `refreshGmailAccessToken` + `searchGmailMessages`. Queries `has:attachment filename:pdf newer_than:365d`, returns up to 100 message IDs.

- [x] **Gmail API — Filter to non-personal senders**
  `src/lib/gmail/classifier.ts` — `isPersonalSender`. Blocks gmail.com, yahoo.com, hotmail.com, outlook.com, icloud.com, protonmail.com, rediffmail.com, and more.

- [x] **Policy identification — Classify emails**
  `src/lib/gmail/classifier.ts` — `classifyByHeuristics`. Matches sender domain + subject/filename keywords across Health, Life, Term, and Vehicle signal lists.

- [x] **Policy identification — LLM fallback (if needed)**
  `src/lib/gmail/classifier.ts` — `classifyWithLLM`. Calls `claude-haiku-4-5-20251001` when heuristics return null. Falls back to `Other` gracefully if `ANTHROPIC_API_KEY` is absent.

- [x] **Attachment download + storage**
  `src/lib/gmail/scanner.ts` + `src/lib/actions/gmail.ts` — `scanGmailForPolicies` + `triggerGmailScan`. Downloads PDF bytes, uploads to Supabase Storage, inserts `policies` row with `source: 'email'`, updates `last_scanned_at`, deduplicates by filename.

---

## Phase 4 — Import Review UI

- [x] **Import review screen**
  `/import-review` page. Shows all pending candidates from `gmail_scan_candidates` with checkboxes. Header shows count + select-all toggle. Each row shows filename, type badge, sender, date.

- [x] **Import confirmation action**
  `importSelected(ids)` in `src/lib/actions/gmail-import.ts`. Downloads PDFs on confirm, uploads to Supabase Storage, creates `policies` rows with `source: 'email'`, deletes confirmed candidates.

- [x] **Skip / defer option**
  "Skip for now" button calls `dismissAll()` — deletes all pending candidates and redirects to `/home`. Candidates persist in DB until dismissed, so user can return to `/import-review` any time.

---

## Phase 5 — Policies Page UI

- [x] **Source badge on policy cards**
  Email-imported policies show a small "From email" badge (mail icon + text) next to the type chip. Upload policies show nothing extra.

- [x] **Settings — "Scan again" option**
  New "Email Import" section in Settings with a "Scan email again" row. Triggers `triggerGmailScan`, then redirects to `/import-review` if candidates are found, or shows "No new policies found" inline.

---

## Phase 6 — Edge Cases & Hardening

- [x] **Token refresh logic**
  Already implemented from Phase 3 — every scan and import call starts with `refreshGmailAccessToken(refresh_token)`.

- [x] **Password-protected PDFs**
  `src/lib/gmail/pdf-utils.ts` — `isPdfPasswordProtected` checks for `/Encrypt` in the first 16 KB. `importSelected` skips these and returns a `passwordProtected` count. The import success screen surfaces the count to the user.

- [x] **Duplicate detection**
  `gmail_message_id` column added to `policies` (migration: `supabase/add_gmail_message_id.sql`). `triggerGmailScan` filters out already-imported message IDs before adding to candidates. `importSelected` checks both `gmail_message_id` and `file_name`, and stores `gmail_message_id` on successful import.

- [x] **Revoke / disconnect Gmail**
  `src/lib/actions/gmail-disconnect.ts` — revokes token with Google, deletes `gmail_tokens` row and pending candidates. "Email Import" section in Settings now has "Scan email again" + "Disconnect Gmail" with a confirmation sheet.

---

## Current Status
**All phases complete.** Full email auto-import feature shipped.
