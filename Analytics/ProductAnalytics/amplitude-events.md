# Amplitude Events — My Insurance Store

All events configured and live in the app, organised by screen. Follow the naming guidelines in `app-events-nomenclature.md` when adding new events.

**Properties on every non-view event:** `screen`, `label`
**Common additional property:** `policy-type` — present on all events fired from a policy context

---

## Auth Screen
**Route:** `/auth`
**File:** `src/app/auth/page.tsx`

| Event | `screen` | `label` | Additional Properties |
|---|---|---|---|
| `view-auth` | — | — | — |
| `continue-clicked` | `auth` | `google-sign-in` | — |
| `continue-clicked` | `auth` | `email-sign-in` | — |
| `continue-clicked` | `auth` | `try-demo-mode` | — |
| `action-completed` | `auth` | `sign-in` | — |
| `error-viewed` | `auth` | `sign-in-failed` | — |

---

## Consent Screen
**Route:** `/consent`
**File:** `src/app/consent/page.tsx`

| Event | `screen` | `label` | Additional Properties |
|---|---|---|---|
| `view-consent` | — | — | — |
| `back-clicked` | `consent` | `back` | — |
| `continue-clicked` | `consent` | `accept-and-continue` | — |
| `action-completed` | `consent` | `sign-in` | — |

---

## Home Screen
**Route:** `/home`
**File:** `src/app/(protected)/home/page.tsx`

| Event | `screen` | `label` | Additional Properties |
|---|---|---|---|
| `view-home` | — | — | `number-of-policies` |
| `view-hamburger-menu` | — | — | — |
| `button-clicked` | `home` | `bento-click` | `bento-type: 'health'` / `'life'` / `'term'` |

---

## Hamburger Menu
**Overlay opened from:** Home Screen
**File:** `src/components/layout/HamburgerMenu.tsx`

| Event | `screen` | `label` | Additional Properties |
|---|---|---|---|
| `option-clicked` | `hamburger-menu` | `my-profile` | — |
| `option-clicked` | `hamburger-menu` | `my-contacts` | — |
| `option-clicked` | `hamburger-menu` | `toggle-appearance` | — |
| `option-clicked` | `hamburger-menu` | `settings` | — |
| `option-clicked` | `hamburger-menu` | `refer-loved-ones` | — |
| `option-clicked` | `hamburger-menu` | `terms-and-conditions` | — |
| `option-clicked` | `hamburger-menu` | `privacy-policy` | — |
| `option-clicked` | `hamburger-menu` | `log-out` | — |
| `action-completed` | `hamburger-menu` | `log-out` | — |
| `button-clicked` | `hamburger-menu` | `close` | — |

---

## Bottom Navigation Bar
**Present on:** Home, My Policies, Shared With Me (and all sub-screens within them)
**File:** `src/components/layout/BottomNav.tsx`

`screen` reflects the screen the user is on when they tap.

| Event | `screen` | `label` | Additional Properties |
|---|---|---|---|
| `option-clicked` | *(current screen)* | `navigation-item-tapped` | `navigation-bar-type: 'home'` / `'my-policies'` / `'share-with-me'` |

---

## My Policies Screen
**Route:** `/policies`
**File:** `src/app/(protected)/policies/page.tsx`

| Event | `screen` | `label` | Additional Properties |
|---|---|---|---|
| `view-my-policies` | — | `0-state` / `non-0-state` | — |
| `back-clicked` | `my-policies` | `back` | — |
| `option-clicked` | `my-policies` | `upload-policy` | — | Header `+` icon, empty-state link, and fixed bottom CTA |
| `option-clicked` | `my-policies` | `all` / `health` / `life` / `term` / `vehicle` / `other` | — | Filter chip tapped |
| `option-clicked` | `my-policies` | `view-policy-details` | `policy-type` |
| `share-clicked` | `my-policies` | `share` | `policy-type` |
| `action-completed` | `upload-policy` | `policy-uploaded` | — | Fires on this screen after redirect from upload |

---

## Upload Policy Screen
**Route:** `/policies/upload`
**File:** `src/app/(protected)/policies/upload/page.tsx`

| Event | `screen` | `label` | Additional Properties |
|---|---|---|---|
| `view-upload-policy` | — | — | — |
| `back-clicked` | `upload-policy` | `back` | `policy-type` (`'not-selected'` if type not yet chosen) |
| `option-clicked` | `upload-policy` | `choose-file` | — | File picker button tapped |
| `option-clicked` | `upload-policy` | `health` / `life` / `term` / `vehicle` / `other` | — | Policy type selection |
| `option-clicked` | `upload-policy` | `manage-policies` | — | Shown on limit-reached screen only |
| `field-entered` | `upload-policy` | `file-selected` | `file-type` | File chosen from device |
| `field-entered` | `upload-policy` | `policy-name` | — | On blur, if value present |
| `continue-clicked` | `upload-policy` | `upload-policy` | `policy-type`, `file-type`, `file-size-kb` |
| `error-viewed` | `upload-policy` | `policy-limit-reached` | — | Fires on mount if already at 10-policy cap |
| `error-viewed` | `upload-policy` | `upload-failed` | — |

---

## Policy Detail Screen
**Route:** `/policies/[id]`
**File:** `src/app/(protected)/policies/[id]/page.tsx`

| Event | `screen` | `label` | Additional Properties |
|---|---|---|---|
| `view-policy-detail` | — | — | `policy-type` |
| `back-clicked` | `policy-detail` | `back` | `policy-type` |
| `button-clicked` | `policy-detail` | `edit-policy-name` | `policy-type` | Pencil icon tapped |
| `button-clicked` | `policy-detail` | `cancel-rename` | `policy-type` |
| `button-clicked` | `policy-detail` | `unshare-policy` | `policy-type` |
| `share-clicked` | `policy-detail` | `share` | `policy-type` | "Share with Family & Friends" link |
| `option-clicked` | `policy-detail` | `add-contacts-to-share` | — | "Add Contacts to Share" link (zero-contacts path) |
| `continue-clicked` | `policy-detail` | `view-document` | `policy-type`, `source: 'my-policy'` |
| `button-clicked` | `policy-detail` | `delete-policy-tapped` | `policy-type` | Opens delete sheet |
| `button-clicked` | `policy-detail` | `delete-policy-cancelled` | `policy-type` |
| `button-clicked` | `policy-detail` | `delete-policy-confirmed` | `policy-type` |
| `action-completed` | `policy-detail` | `rename-policy` | `policy-type` | After successful name save |
| `error-viewed` | `policy-detail` | `policy-not-found` | — |
| `error-viewed` | `policy-detail` | `policy-rename-failed` | `policy-type` |

---

## Share Policy Screen
**Route:** `/policies/[id]/share`
**File:** `src/app/(protected)/policies/[id]/share/page.tsx`

| Event | `screen` | `label` | Additional Properties |
|---|---|---|---|
| `view-share-policy` | — | — | `policy-type` |
| `back-clicked` | `share-policy` | `back` | `policy-type` |
| `back-clicked` | `share-policy` | `cancel` | `policy-type` |
| `option-clicked` | `share-policy` | *(contact's name)* | `policy-type` |
| `option-clicked` | `share-policy` | `add-another-contact` | `policy-type` |
| `option-clicked` | `share-policy` | `add-contact` | `policy-type` | Empty-state "Add Contact" link |
| `continue-clicked` | `share-policy` | `confirm-share` | `policy-type`, `contacts-added` | When new contacts are added |
| `continue-clicked` | `share-policy` | `confirm-unshare` | `policy-type` | When only removing existing shares |
| `action-completed` | `share-policy` | `sharing-completed` | `policy-type` |
| `error-viewed` | `share-policy` | `policy-not-found` | — |

---

## View Policy Document Screen
**Route:** `/policies/[id]/view` and `/other-policies/[id]/view`
**File:** `src/app/(protected)/policies/[id]/view/PolicyViewer.tsx`

| Event | `screen` | `label` | Additional Properties |
|---|---|---|---|
| `view-policy-document` | — | — | `source: 'my-policy'` or `source: 'shared-with-me'` |
| `back-clicked` | `view-policy-document` | `back` | `source` |
| `option-clicked` | `view-policy-document` | `open-in-browser` | `source` |
| `error-viewed` | `view-policy-document` | `document-load-failed` | `source` |

---

## Shared With Me Screen
**Route:** `/other-policies`
**File:** `src/app/(protected)/other-policies/page.tsx`

| Event | `screen` | `label` | Additional Properties |
|---|---|---|---|
| `view-shared-with-me` | — | `0-state` / `non-0-state` | — |
| `back-clicked` | `shared-with-me` | `back` | — |
| `option-clicked` | `shared-with-me` | `view-shared-policy` | `policy-type` |
| `option-clicked` | `shared-with-me` | `refer-loved-ones` | — |

---

## Shared Policy Detail Screen
**Route:** `/other-policies/[id]`
**File:** `src/app/(protected)/other-policies/[id]/page.tsx`

| Event | `screen` | `label` | Additional Properties |
|---|---|---|---|
| `view-shared-policy-detail` | — | — | `policy-type` |
| `back-clicked` | `shared-policy-detail` | `back` | `policy-type` |
| `continue-clicked` | `shared-policy-detail` | `view-document` | `policy-type`, `source: 'shared-with-me'` |
| `button-clicked` | `shared-policy-detail` | `download-policy` | `policy-type` |
| `error-viewed` | `shared-policy-detail` | `policy-not-found` | — |

---

## My Contacts Screen
**Route:** `/contacts`
**Files:** `src/app/(protected)/contacts/page.tsx`, `src/app/(protected)/contacts/ContactsList.tsx`

| Event | `screen` | `label` | Additional Properties |
|---|---|---|---|
| `view-my-contacts` | — | — | — |
| `back-clicked` | `my-contacts` | `back` | — |
| `option-clicked` | `my-contacts` | `add-contact` | — | Header `+` button and empty-state link |
| `option-clicked` | `my-contacts` | `filter-by-contact` | — | Contact filter dropdown changed |
| `button-clicked` | `my-contacts` | `clear-contact-filter` | — | X button to clear filter |
| `option-clicked` | `my-contacts` | `view-contact` | — | Contact card tapped |
| `option-clicked` | `my-contacts` | `view-policy` | `policy-type` | Policy tapped in filtered view |
| `option-clicked` | `my-contacts` | `invite-loved-ones` | — |

---

## Add Contact Screen
**Route:** `/contacts/add`
**File:** `src/app/(protected)/contacts/add/AddContactForm.tsx`

| Event | `screen` | `label` | Additional Properties |
|---|---|---|---|
| `view-add-contact` | — | — | — |
| `back-clicked` | `add-contact` | `back` | — |
| `field-entered` | `add-contact` | `contact-name` | — |
| `field-entered` | `add-contact` | `contact-email` | — |
| `continue-clicked` | `add-contact` | `add-contact` | — |
| `error-viewed` | `add-contact` | `add-contact-failed` | — |

---

## Contact Detail Screen
**Route:** `/contacts/[id]`
**File:** `src/app/(protected)/contacts/[id]/page.tsx`

| Event | `screen` | `label` | Additional Properties |
|---|---|---|---|
| `view-contact-detail` | — | — | — |
| `back-clicked` | `contact-detail` | `back` | — |
| `button-clicked` | `contact-detail` | `manage-sharing` | — | "Manage" link and "Share a policy" empty-state button |
| `option-clicked` | `contact-detail` | `view-policy` | `policy-type` | Shared policy card tapped |
| `option-clicked` | `contact-detail` | `toggle-policy-share` | `policy-type` | Policy toggled in share sheet |
| `button-clicked` | `contact-detail` | `unshare-policy` | `policy-type` | Unshare button in policy row |
| `button-clicked` | `contact-detail` | `remove-contact-tapped` | — | Opens remove confirmation sheet |
| `button-clicked` | `contact-detail` | `remove-contact-cancelled` | — |
| `action-completed` | `contact-detail` | `contact-removed` | — | After deletion completes |
| `error-viewed` | `contact-detail` | `contact-not-found` | — |

---

## My Profile Screen
**Route:** `/profile`
**Files:** `src/app/(protected)/profile/page.tsx`, `src/app/(protected)/profile/ProfileEditor.tsx`

| Event | `screen` | `label` | Additional Properties |
|---|---|---|---|
| `view-my-profile` | — | — | — |
| `back-clicked` | `my-profile` | `back` | — |
| `button-clicked` | `my-profile` | `edit-name` | — | Pencil icon tapped |
| `button-clicked` | `my-profile` | `cancel-edit-name` | — |
| `continue-clicked` | `my-profile` | `save-name` | — | Save form submitted |
| `error-viewed` | `my-profile` | `name-update-failed` | — |

---

## Settings Screen
**Route:** `/settings`
**File:** `src/app/(protected)/settings/page.tsx`

| Event | `screen` | `label` | Additional Properties |
|---|---|---|---|
| `view-settings` | — | — | — |
| `back-clicked` | `settings` | `back` | — |
| `option-clicked` | `settings` | `edit-profile` | — | Edit pencil link (shown when no name set) |
| `option-clicked` | `settings` | `toggle-theme` | `theme` (value being switched *to*) |
| `action-completed` | `settings` | `log-out` | — |
| `button-clicked` | `settings` | `delete-account-tapped` | — | Opens delete sheet |
| `button-clicked` | `settings` | `delete-account-cancelled` | — |
| `action-completed` | `settings` | `account-deleted` | — |
| `error-viewed` | `settings` | `delete-account-failed` | — |

---

## Terms & Conditions Screen
**Route:** `/terms`
**File:** `src/app/terms/page.tsx`

| Event | `screen` | `label` | Additional Properties |
|---|---|---|---|
| `view-terms-and-conditions` | — | — | — |
| `back-clicked` | `terms-and-conditions` | `back` | — |

---

## Privacy Policy Screen
**Route:** `/privacy`
**File:** `src/app/privacy/page.tsx`

| Event | `screen` | `label` | Additional Properties |
|---|---|---|---|
| `view-privacy-policy` | — | — | — |
| `back-clicked` | `privacy-policy` | `back` | — |

---

## User Identification
**File:** `src/components/AmplitudeIdentify.tsx`

Fires once on mount inside the protected layout.

| User Type | `userId` | Properties |
|---|---|---|
| Real user | user's email address | `email`, `name` (if set), `is-demo: false` |
| Demo user | `demo_user` | `is-demo: true` |
