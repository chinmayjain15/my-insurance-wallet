# App Events Nomenclature

Guidelines for naming product analytics events consistently across the app.

---

## General Rules

- **No spaces** in event names. Use hyphens (`-`) to separate words.
  - ✅ `continue-clicked`
  - ❌ `continue clicked`

---

## Event Types

### 1. Screen Views — `view-<screen-name>`

Fired every time a screen is rendered.

| Pattern | Example |
|---|---|
| `view-<screen-name>` | `view-home`, `view-upload-policy` |

---

### 2. Button & Interaction Events

#### `continue-clicked`
User taps something that navigates them **forward** to the next screen.
- Typical in multi-step flows (onboarding, upload flows, etc.)
- **Required properties:** `screen`, `label`

#### `back-clicked`
User taps something that takes them **back** to a previous screen.
- **Required properties:** `screen`, `label`

#### `option-clicked`
User selects **one option from multiple choices**.
- Use when: hamburger menu items, contact selection, radio-style choices
- **Required properties:** `screen`, `label` (describe which option was selected)

#### `button-clicked`
A button that doesn't fit any of the above categories.
- **Required properties:** `screen`, `label` (describe what the button does)

#### `field-entered`
User enters a value into any input field.
- **Required properties:** `screen`, `label` (describe which field)

#### `error-viewed`
An error is shown to the user — form validation failure, resource not found, load failure, etc.
- **Required properties:** `screen`, `label` (describe the specific error type)

#### `share-clicked`
User taps a share CTA to share a policy or content.
- **Required properties:** `screen`, `label`

---

## App-Specific Events

### Home Screen View — `view-home`
Home page is rendered.
- **Required properties:** `screen` (always `home`), `number-of-policies` (integer: count of policies user has added)

### Bento Click Action — `button-clicked`
User taps a Bento card/component.
- **Label:** `bento-click`
- **Required properties:** `screen`, `bento-type` (values: `health`, `life`, `term`)

### Bottom Navigation Bar — `option-clicked`
User taps an item in the bottom navigation bar.
- **Label:** `navigation-item-tapped`
- **Required properties:** `screen`, `navigation-bar-type` (values: `home`, `my-policies`, `share-with-me`)

---

## Required Properties Summary

| Event | `screen` | `label` | Custom Properties |
|---|---|---|---|
| `continue-clicked` | ✅ | ✅ | — |
| `back-clicked` | ✅ | ✅ | — |
| `option-clicked` | ✅ | ✅ (the selected option) | — |
| `button-clicked` | ✅ | ✅ (what the button does) | — |
| `field-entered` | ✅ | ✅ (which field) | — |
| `error-viewed` | ✅ | ✅ (error type/message) | — |
| `share-clicked` | ✅ | ✅ (describe the share action) | — |
| **App-Specific:** |
| `view-home` | ✅ | — | `number-of-policies` |
| `button-clicked` (Bento) | ✅ | `bento-click` | `bento-type` |
| `option-clicked` (Bottom Nav) | ✅ | `navigation-item-tapped` | `navigation-bar-type` |

---

## Examples

| Scenario | Event | `screen` | `label` | Custom Properties |
|---|---|---|---|---|
| User moves from step 1 → step 2 in onboarding | `continue-clicked` | `onboarding-step-1` | `next` | — |
| User taps back arrow on policy details | `back-clicked` | `policy-details` | `back` | — |
| User selects a contact from a list | `option-clicked` | `share-policy` | `John Doe` | — |
| User picks an item from the hamburger menu | `option-clicked` | `home` | `settings` | — |
| User types in the policy name field | `field-entered` | `upload-policy` | `policy-name` | — |
| Form validation fails on login | `error-viewed` | `auth` | `invalid-email` | — |
| User taps share CTA on policy details | `share-clicked` | `policy-details` | `share` | — |
| User taps share CTA on my policies page | `share-clicked` | `my-policies` | `share` | — |
| **App-Specific Examples:** |
| Home page loads | `view-home` | `home` | — | `number-of-policies: 3` |
| User taps a health Bento card | `button-clicked` | `home` | `bento-click` | `bento-type: health` |
| User taps a term Bento card | `button-clicked` | `home` | `bento-click` | `bento-type: term` |
| User taps "My Policies" in bottom nav | `option-clicked` | `home` | `navigation-item-tapped` | `navigation-bar-type: my-policies` |
| User taps "Share with Me" in bottom nav | `option-clicked` | `home` | `navigation-item-tapped` | `navigation-bar-type: share-with-me` |
