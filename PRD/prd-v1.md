# MyInsuranceWallet — Product Requirements Document (V1)

**Version:** 1.1
**Status:** Draft
**Last Updated:** March 2026
**Authors:** Chinmay Jain

---

## 1. Overview & Purpose

MyInsuranceWallet is a lightweight, mobile-first web application that allows individuals in India to store their insurance policies in one place and share them with trusted family members or friends. The product is built around a single insight: the people who most need access to your insurance policies are often not you — they are the people acting on your behalf during a crisis. The purpose of V1 is to validate this core value proposition with real users, before any monetisation or advanced features are introduced.

---

## 2. Problem Statement

### The Core Problem
In India, insurance policies are typically stored across multiple disconnected places — insurer portals, email inboxes, physical folders, or WhatsApp chats. When a policyholder faces a sudden hospitalisation, critical illness, or death, the people who need to act on those policies — a spouse, parent, or child — often cannot find them in time, or do not even know they exist.

### Why This Happens
- Policies are purchased individually across different insurers with separate logins
- There is no single, shared repository purpose-built for insurance documents
- Existing tools (DigiLocker, Google Drive, email) are either too generic, not shareable in a structured way, or require the policyholder to be the one accessing them
- Most policyholders do not proactively communicate policy details to their dependents

### The Cost of This Gap
- Claims go unfiled because dependents are unaware of policies
- Families face financial hardship at an already difficult time
- A simple operational problem (document access) compounds an already painful situation

---

## 3. Goals & Non-Goals

### Goals — V1
- Allow a user to create an account and upload their insurance policies
- Allow policies to be organised by type (health, life, term, vehicle, other)
- Allow a user to add trusted contacts who can view and download shared policies
- Notify a contact via SMS when a policy is shared with them
- Allow a trusted contact to log in and access policies shared with them
- Capture explicit user consent at sign-up in compliance with applicable regulations
- Deliver the experience as a mobile-first web application (no native app)

### Non-Goals — V1
- No automatic extraction of policies from email or insurer portals
- No AI-generated policy summaries or coverage analysis
- No renewal reminders or other notification types beyond share alerts
- No monetisation features of any kind
- No marketplace or insurer integrations
- No support for document types beyond insurance policies
- No data retention policy (deferred)Here's a bio screenshot. 

---

## 4. Target Users

### Primary User — The Policyholder
**Who they are:** An earning adult in India, aged 28–55, who holds one or more insurance policies (health, life, term, vehicle). They may be the sole or primary earner in their family. They are reasonably comfortable with smartphones but are not necessarily tech-savvy.

**Their concern:** *"If something happens to me, will my family know what policies I have and how to use them?"*

**What they need:** A simple way to upload, organise, and share their policies without it feeling like a chore.

### Secondary User — The Trusted Contact
**Who they are:** A spouse, parent, adult child, or close friend designated by the policyholder. They may be less digitally comfortable than the policyholder. They will receive an SMS when something is shared with them, which may be their first touchpoint with the product.

**Their concern:** *"In a crisis, where do I find the policy and what do I do with it?"*

**What they need:** Frictionless access to exactly what has been shared with them — including the ability to download the document if needed.

---

## 5. User Stories / Key Flows

### Policyholder Flows

**US-01 — Sign Up**
As a new user, I want to sign up using my phone number so that I don't need to remember a separate email/password.

**US-02 — Consent at Sign Up**
As a new user, I want to be shown what data the app collects and how it is used, and provide my explicit consent before proceeding, so that I know my information is handled transparently.

**US-03 — Upload a Policy**
As a policyholder, I want to upload a policy document (PDF or image) and tag it by type so that it is organised and easy to find.

**US-04 — View My Policies**
As a policyholder, I want to see all my uploaded policies in one place, grouped by type.

**US-05 — Add a Trusted Contact**
As a policyholder, I want to add a trusted contact using their phone number so that they can access specific policies I choose to share.

**US-06 — Share a Policy**
As a policyholder, I want to select which policies a specific contact can see, so that I have control over what is shared with whom. When I share, the contact receives an SMS letting them know.

**US-07 — Revoke Access**
As a policyholder, I want to remove a contact or revoke access to a specific policy so that I stay in control if circumstances change.

**US-08 — Delete a Policy**
As a policyholder, I want to delete a policy I have uploaded so that outdated or incorrect documents don't persist.

**US-09 — Delete My Account**
As a policyholder, I want to delete my account knowing that all my uploaded documents and all access granted to my contacts will be permanently removed.

### Trusted Contact Flows

**US-10 — Receive Share Notification**
As a trusted contact, I want to receive an SMS when someone shares a policy with me, so that I am aware it is there before I ever need it.

**US-11 — Sign Up as a Contact**
As a trusted contact, I want to sign up using my phone number (the same one the policyholder used) so that I can access what has been shared with me.

**US-12 — View Shared Policies**
As a trusted contact, I want to see the policies that have been shared with me, clearly showing the name of the person who shared them.

**US-13 — View and Download a Policy Document**
As a trusted contact, I want to open a policy document in-app and also download it to my device, so that I can act on it when needed even without internet access.

---

## 6. Feature Scope — V1

### In Scope

| Feature | Description |
|---|---|
| Phone number authentication | OTP-based sign up and login via SMS |
| Explicit consent at sign-up | User reviews and accepts data usage terms before account creation |
| Policy upload | Upload PDF or image files, tag by policy type; max 10 policies per user |
| Policy organisation | View policies grouped by type (health, life, term, vehicle, other) |
| Trusted contacts | Add contacts by phone number |
| Policy sharing | Select which policies are visible to which contacts |
| Share SMS notification | Contact receives an SMS when a policy is shared with them |
| Access revocation | Remove a contact or unshare a specific policy |
| Account deletion | Deleting an account removes all documents and all contact access |
| Contact view | Shared policies visible to a contact when they log in, with policyholder's name shown |
| Document viewer | In-app viewing of uploaded policy documents |
| Document download | Contacts can download shared policy documents to their device |
| Mobile-first UI | Fully responsive, optimised for phone browsers |

### Out of Scope — V1

| Feature | Deferred To |
|---|---|
| Email extraction of policies | Phase 2 |
| AI-powered policy summaries | Phase 2 |
| Renewal reminders / notifications | Phase 2 |
| Multi-language support | Phase 2 |
| Data retention / inactivity policy | Phase 2 |
| Native iOS / Android app | Phase 3 |
| Marketplace / insurer integrations | Phase 3 |
| Family document wallet (non-insurance) | Phase 3 |

---

## 7. Functional Requirements

### Authentication
- FR-01: Users must sign up and log in using a phone number + OTP (SMS-based)
- FR-02: OTP must expire within 5 minutes of generation
- FR-03: A user account is uniquely identified by their phone number
- FR-04: Sessions must persist across browser closes (stay logged in)

### Consent
- FR-05: At sign-up, users must be shown a consent screen explaining what data is collected, how it is stored, and who can access it
- FR-06: Users must explicitly accept the consent terms (a checkbox or equivalent action) before their account is created
- FR-07: Consent acceptance must be recorded with a timestamp against the user's account

### Policy Management
- FR-08: Users can upload files in PDF, JPG, or PNG format
- FR-09: Maximum file size per upload: 10 MB
- FR-10: A user can upload a maximum of 10 policies in V1
- FR-11: The app must clearly indicate how many of the 10 policy slots have been used
- FR-12: Each policy must be assigned one of the following types at upload: Health, Life, Term, Vehicle, Other
- FR-13: Users can rename a policy after upload
- FR-14: Users can delete a policy they have uploaded
- FR-15: Deleted policies must be removed from all contacts' views immediately and permanently

### Trusted Contacts
- FR-16: A user can add a contact using their phone number
- FR-17: A contact does not need to be a registered user at the time of being added
- FR-18: A user can remove a contact at any time, which immediately revokes all access that contact had to any shared policy

### Sharing
- FR-19: Sharing is per-policy, per-contact — a user selects specific policies to share with a specific contact
- FR-20: A contact can only access policies explicitly shared with them
- FR-21: A user can unshare a specific policy from a specific contact without removing the contact entirely
- FR-22: When a policy is shared with a contact, an SMS is sent to the contact's phone number informing them that a policy has been shared with them on MyInsuranceWallet
- FR-23: Contacts can both view policy documents in-app and download them to their device

### Contact View
- FR-24: When a contact logs in, they see a list of policies shared with them, grouped by the policyholder who shared them
- FR-25: Each policy entry displays the policy type, policy name, and the full name of the policyholder who shared it

### Account Deletion
- FR-26: A policyholder can permanently delete their account from within the app
- FR-27: On account deletion, all uploaded policy documents are permanently deleted from storage
- FR-28: On account deletion, all access previously granted to contacts is immediately revoked — contacts will no longer see any policies from the deleted account

---

## 8. Non-Functional Requirements

### Security & Privacy
- NFR-01: All uploaded documents must be stored encrypted at rest
- NFR-02: All data transmission must be over HTTPS
- NFR-03: A user's policies must never be accessible to anyone they have not explicitly shared with
- NFR-04: Phone numbers must not be exposed or visible to other users anywhere in the UI
- NFR-05: The product must have a clear, plain-language privacy policy accessible before and after sign-up
- NFR-06: Consent records must be stored securely and must not be deletable by the user (for compliance purposes)

### Performance
- NFR-07: The app must load within 3 seconds on a standard 4G mobile connection
- NFR-08: Policy documents must open within 5 seconds of being tapped

### Reliability
- NFR-09: Uploaded documents must not be lost — storage must have redundancy
- NFR-10: Target uptime of 99% in V1

### Usability
- NFR-11: The app must be fully functional on mobile browsers (Chrome on Android, Safari on iOS)
- NFR-12: Core flows (upload, share, view, download) must be completable without any instructions or onboarding prompts

---

## 9. Future Phases

These are acknowledged directions, not commitments. They will be scoped separately when the time comes.

**Phase 2**
- Email integration — connect Gmail/Outlook to auto-extract insurance policy documents
- Policy summaries — plain-language AI-generated breakdown of coverage, inclusions, exclusions
- Renewal reminders — notify users before a policy lapses
- Data retention policy — define behaviour for inactive accounts
- Increase or remove the 10-policy limit based on observed usage and storage costs

**Phase 3**
- Native mobile apps (iOS and Android)
- Family document wallet — extend to other critical documents beyond insurance
- Insurer marketplace — browse and compare policies from within the app
- Financial literacy layer — credit reports, bank statements, consolidated financial health view

---

## 10. Open Questions

All open questions from V1.0 have been resolved. New questions arising during build will be tracked here.

| # | Question | Owner | Status |
|---|---|---|---|
| OQ-08 | What exactly should the SMS to contacts say when a policy is shared? | Product | Open |
| OQ-09 | What should the consent screen say in detail — scope of data collection, storage, sharing? | Product / Legal | Open |

---

*This PRD covers V1 scope only. Sections will be updated as decisions are made.*
