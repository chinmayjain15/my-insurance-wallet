# Backlog

Items deferred after MVP launch (2026-03-27). Prioritised in order.

---

## 1. Email notification on share
When a user shares a policy with a contact, the contact should receive an email notification.
The app copy already says "they'll receive an email" — but no email is actually sent yet.
**Suggested approach:** Resend or SendGrid via a Supabase Edge Function triggered on insert into `policy_shares`.

---

## 2. Edit policy name / type
Currently a policy cannot be renamed or have its type changed after uploading.
Add an edit option on the Policy Detail page.

---

## 3. Custom domain
The app is currently live at `https://my-insurance-store.vercel.app`.
When ready, connect a custom domain via Vercel → Settings → Domains and update DNS in Google Domains / Squarespace.
Also update `NEXT_PUBLIC_APP_URL` env var in Vercel and the redirect URLs in Supabase.

---

## 4. Google OAuth consent screen verification
Currently Google shows an "unverified app" warning to users signing in via Google SSO.
Need to submit the OAuth consent screen for verification in Google Cloud Console before going public.
**Required:** Privacy policy URL, app homepage URL, app logo.

---
