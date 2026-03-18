# Design Requirements — MyInsuranceWallet
### Version 1.0 · March 2026

This document defines structural and visual direction for the MyInsuranceWallet mobile-first web application. It is intended to be used as a design brief — specific color values, spacing units, and pixel sizes are out of scope here.

---

## A. Look and Feel

The app should feel calm, trustworthy, and modern. It is handling sensitive personal documents, so the design must inspire confidence — not feel casual or lightweight.

**Aesthetic direction:**
- Clean and uncluttered — generous spacing, content breathes, nothing feels packed or rushed
- Modern and premium — closer in feel to apps like Notion or Linear than a typical utility or fintech app
- Easy on the eyes — the UI should be comfortable to use under stress; avoid harsh contrasts or visually loud elements
- Consistent visual language — as users move between screens (Home → My Policies → Contacts → Shared With Me), layout structure, component style, and interaction patterns must feel continuous, not disjointed

**Typography:**
- Simple, clean fonts — nothing decorative or heavy
- Conservative sizing — body text should be compact and readable on a phone screen; headings clear but not domineering
- Clear hierarchy — readable difference between headings, supporting text, and metadata, but the contrast between them should be subtle, not dramatic

**Color usage:**
- Use muted and soft tones for UI elements — labels, tags, type badges, active states, and section indicators
- Vivid or saturated colors should be used sparingly — only for important status signals (e.g., access revoked, upload error)
- Highlights, selected states, and interactive elements should use soft, restrained tones that draw the eye without jarring it

**Continuity across screens:**
- The bottom navigation bar and top header are identical across all main screens — the shell never changes
- Screen layouts follow a consistent internal pattern: screen title at top, primary action accessible from the top or a floating button, content below
- Component types (cards, modals, input fields, action sheets) look and behave the same regardless of which screen they appear on

---

## B. Theme

- **Dark mode is the default** — the primary designed and shipped experience
- Light mode should be supported as a secondary option
- Theme preference is saved per user and persists across sessions
- A system/auto option should follow the user's OS-level theme preference
- Theme toggle is accessible from Settings
- All screens, components, modals, empty states, and loading states must be designed for dark mode first

---

## 1. Design Principles

1. **Calm over clever** — this app may be opened in stressful moments; clarity and simplicity always win over feature cleverness
2. **Trust through restraint** — the design should signal security and reliability; avoid anything that feels rushed, cluttered, or playful
3. **Mobile first, mobile only** — every decision is made for a phone screen; desktop is not a consideration for V1
4. **The contact is a first-class user** — the trusted contact's experience (viewing and downloading shared policies) must be as polished as the policyholder's
5. **One thing at a time** — each screen has one primary action; avoid screens that ask the user to do multiple things simultaneously

---

## 2. User Personas & Context of Use

### The Policyholder
Sets up the app at home, on their phone, in a calm moment. Uploads policies, organises them, adds family members. Likely does this once and revisits occasionally to add new policies or update contacts. Needs the setup flow to feel quick and not overwhelming.

### The Trusted Contact
May open the app for the first time in a hospital corridor or during a family crisis. Likely less tech-comfortable than the policyholder. Has arrived via an SMS link. Needs to get from "just received an SMS" to "viewing the policy document" with as few steps as possible. Confusion or friction here is costly.

---

## 3. Information Architecture

```
MyInsuranceWallet
│
├── Onboarding
│   ├── Welcome / Sign Up
│   ├── OTP Verification
│   └── Consent Screen
│
├── Main App (Policyholder)
│   ├── Home
│   ├── My Policies
│   │   ├── Policy List (grouped by type)
│   │   ├── Upload Policy
│   │   └── Policy Detail
│   ├── Contacts
│   │   ├── Contact List
│   │   ├── Add Contact
│   │   └── Contact Detail (manage sharing per contact)
│   └── Settings
│       ├── Profile
│       ├── Theme
│       └── Delete Account
│
└── Main App (Trusted Contact)
    ├── Home (Shared With Me)
    │   └── Grouped by policyholder
    └── Policy Viewer
        └── View + Download
```

---

## 4. Key User Flows

### Flow 1 — New User Sign Up
1. Welcome screen → Enter phone number
2. OTP verification screen → Enter OTP
3. Consent screen → Review terms → Accept
4. Home screen (empty state, first-time)

### Flow 2 — Upload a Policy
1. Home or My Policies → Tap "Upload Policy"
2. Select file (PDF / JPG / PNG) from device
3. Name the policy + select type (Health / Life / Term / Vehicle / Other)
4. Confirm → Policy appears in list

### Flow 3 — Add a Contact and Share a Policy
1. Contacts → Tap "Add Contact"
2. Enter contact's name + phone number → Save
3. Contact card appears → Tap "Share a Policy"
4. Select one or more policies from list → Confirm
5. SMS is sent to contact

### Flow 4 — Revoke Access
1. Contacts → Select contact
2. View shared policies list → Tap "Unshare" on a policy
   or
   Tap "Remove Contact" to revoke all access at once
3. Confirmation prompt → Confirm

### Flow 5 — Trusted Contact First Use
1. Receives SMS → Taps link → Lands on welcome/sign up screen
2. Enters phone number → OTP verification
3. Consent screen → Accept
4. Home screen shows policies shared with them, grouped by sharer's name

### Flow 6 — View and Download a Policy (Contact)
1. Shared With Me → Tap a policy card
2. Policy opens in in-app document viewer
3. Tap "Download" → File saves to device

### Flow 7 — Delete Account
1. Settings → Delete Account
2. Warning screen explains: all policies will be deleted, all contact access will be revoked
3. Confirm with OTP → Account permanently deleted

---

## 5. Screen Inventory

**Priority 1 — Core flows, must be designed first:**
1. Welcome / Sign Up screen
2. OTP Verification screen
3. Consent screen
4. Home — Policyholder (empty state + populated state)
5. My Policies — Policy list
6. Upload Policy screen
7. Policy Detail screen (policyholder view)
8. Contacts — Contact list
9. Add Contact screen
10. Contact Detail — manage sharing

**Priority 2:**
11. Home — Trusted Contact (Shared With Me)
12. Policy Viewer screen (contact view, with download)
13. Settings screen
14. Delete Account confirmation screen

**Priority 3:**
15. Error states (upload failed, OTP expired, no internet)
16. Empty states (no policies yet, no contacts yet, nothing shared with me)

---

## 6. Component Inventory

**Navigation:**
- Bottom navigation bar (4 items: Home, My Policies, Contacts, Settings)
- Top header bar (screen title + optional action icon)

**Cards:**
- Policy card — type badge, policy name, sharing indicator
- Contact card — name, number of shared policies
- Shared-by card — policyholder name with list of their shared policies beneath

**Inputs:**
- Phone number input field
- OTP input (4 or 6 digit boxes)
- Text input (for policy name, contact name)
- File picker trigger button

**Selection:**
- Policy type selector (chip/tab group: Health, Life, Term, Vehicle, Other)
- Policy multi-select list (for sharing flow)

**Actions:**
- Primary button (full width, used for main CTA per screen)
- Secondary / ghost button
- Destructive button (for delete, revoke actions)
- Floating action button (for Upload on My Policies screen)
- Icon button (used in headers and list rows)

**Feedback:**
- Toast / snackbar (for success and error messages)
- Confirmation modal / action sheet (for destructive actions)
- Loading spinner / skeleton states
- Empty state block (icon + heading + supporting text + optional CTA)

**Document Viewer:**
- Full-screen PDF / image viewer
- Download button (persistent, accessible from viewer)
- Close / back control

---

## 7. Navigation & Layout

**Global shell:**
- Persistent bottom navigation bar with 4 items: Home, My Policies, Contacts, Settings
- Persistent top header showing screen title and a contextual action (e.g., edit, add) where applicable
- No sidebar — this is a mobile-only experience

**Navigation patterns:**
- Bottom nav for top-level sections
- Back arrow in header for all drill-down screens
- Action sheets (bottom sheet modals) for contextual actions within a screen — avoid full-screen modals for simple choices
- Destructive actions always require a confirmation step before executing

**Layout pattern per screen:**
- Screen title in header
- Primary CTA either as a floating action button (lists) or a full-width button at the bottom of the screen (forms)
- Content scrolls vertically; header and bottom nav are fixed

---

## 8. Interaction & Behaviour

**States every list and content area must handle:**
- Loading state — skeleton cards
- Empty state — icon + message + CTA
- Populated state — the actual content
- Error state — message + retry option

**Key interaction details:**
- Uploading a policy: show progress indicator during upload; show success confirmation on completion
- Sharing a policy: after confirming share, show a brief success state ("SMS sent to [contact name]")
- Deleting a policy or removing a contact: always show a bottom sheet confirmation before executing; action is irreversible
- OTP screen: auto-advance when all digits are entered; show resend option after 30 seconds
- Document viewer: opens full screen; pinch-to-zoom supported for images; scroll for PDFs
- Download: tapping download triggers the native device save behaviour; show a brief confirmation toast

**Consent screen behaviour:**
- User must scroll to the bottom before the accept button becomes active
- Accept is a deliberate tap, not a pre-checked checkbox

---

## 9. Accessibility Requirements

- Minimum tap target size: 44x44pt for all interactive elements
- Text contrast must meet WCAG AA standard in both dark and light themes
- Font sizes must remain legible without requiring the user to zoom — body text no smaller than 14sp
- All icon-only buttons must have accessible labels
- Errors must be communicated in text, not color alone

---

## 10. Constraints & Platform Considerations

- **Mobile web only** — no native app in V1; must work on Chrome (Android) and Safari (iOS) without any installation
- **Contact picker not used** — contacts are added manually by phone number; no access to device contacts is requested
- **File upload on mobile web** — uses the native file picker; supports PDF, JPG, PNG; no drag-and-drop
- **No push notifications** — the only proactive communication is SMS; no in-app notification system in V1
- **Offline behaviour** — the app does not need to function offline; a clear "no internet" error state is sufficient
- **iOS Safari quirks** — bottom navigation bar must account for iOS safe area / home indicator; input fields must not be obscured by the keyboard
- **Session persistence** — users stay logged in across browser closes; they should not be asked to re-authenticate on every visit

---

*This document is a structural brief for design. Use it as a prompt to generate screen designs in Figma. Exact color tokens, spacing values, and type scales to be defined in the Figma file itself.*
