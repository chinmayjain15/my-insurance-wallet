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

- [ ] **Gmail API — Fetch candidate emails**
  Server action that uses the stored refresh token to get a fresh access token, then queries Gmail API for emails from the last 12 months that have PDF attachments (`has:attachment filename:pdf`).

- [ ] **Gmail API — Filter to non-personal senders**
  Exclude emails from individual Gmail/Yahoo/Hotmail addresses. Keep emails from business domains.

- [ ] **Policy identification — Classify emails**
  For each candidate email, check subject + sender + attachment name against known insurer signals (keywords, domain list). Determine policy type: Health / Life / Term / Vehicle / Other.

- [ ] **Policy identification — LLM fallback (if needed)**
  If heuristics are insufficient, pass email metadata to Claude API for classification.

- [ ] **Attachment download + storage**
  Download PDF attachments via Gmail API. Upload to Supabase Storage under the user's folder. Create `policies` row with `source: 'email'`.

---

## Phase 4 — Import Review UI

- [ ] **Import review screen**
  After Gmail scan completes, show a list of found policies: "We found X policies in your email. Review and import."  Each item shows policy name, type, sender, date. User can confirm or dismiss each one.

- [ ] **Import confirmation action**
  Server action to finalize selected policies into the `policies` table.

- [ ] **Skip / defer option**
  User can skip the review and import later from Settings.

---

## Phase 5 — Policies Page UI

- [ ] **Source badge on policy cards**
  Show a small "From email" or "Uploaded" tag on each policy card in the `/policies` list.

- [ ] **Settings — "Scan again" option**
  Allow users to re-trigger an email scan from the Settings page (in case new policies arrived after initial scan).

---

## Phase 6 — Edge Cases & Hardening

- [ ] **Token refresh logic**
  Access token expires in 1 hour. Implement refresh using the stored `refresh_token` before each Gmail API call.

- [ ] **Password-protected PDFs**
  Detect and flag password-protected PDFs rather than silently failing to import them.

- [ ] **Duplicate detection**
  Before importing, check if a policy with the same file name or Gmail message ID already exists for the user.

- [ ] **Revoke / disconnect Gmail**
  Allow users to disconnect Gmail access from Settings. Deletes the `gmail_tokens` row and revokes the token with Google.

---

## Current Status
**Phase 2 complete.** Ready to start Phase 3 — Gmail scanner.
