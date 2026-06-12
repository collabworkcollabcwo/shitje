# Shitje 🇦🇱 — Tregu i Shqipërisë

A complete eBay-style marketplace app for Albania. One React Native codebase that ships as an **Android APK**, an **installable web app (PWA)**, and a **desktop web demo** (rendered inside a phone frame).

**Live:** https://collabworkcollabcwo.github.io/shitje/

## Features

- 🛍️ **Listings** — browse, search, publish (with photos), mark as sold, delete
- 🔎 **Albanian-aware search** — understands "makina", "shpi", "telefoni", slang & suffix forms, category keywords
- 🗂️ **12 categories** with bold colored icons and live listing counts
- 🔐 **Accounts** — register/login with email + password, or one-tap **Google sign-in** (web)
- ❤️ **Cart (Shporta)** — like items with an animated heart, see total value
- 💬 **Chat** — in-app messages with sellers (simulated replies in demo mode)
- 👤 **Seller profiles** — ratings, reviews, member-since, listings, call/message buttons
- 🔔 **Notifications** page with unread badge and deep links
- 💶 **Currency switcher** — EUR (default) / Lekë / USD, converted everywhere
- 🌙 **Light/dark theme** toggle, persisted
- 📖 **Full in-app documentation** (Dokumentacioni) in Albanian
- ☁️ **Optional shared listings** — with a free Supabase backend, everyone sees everyone's listings
- 📱 **PWA** — "Add to Home Screen" installs it like a native app
- 🪟 **In-app dialogs** — no browser popups anywhere

Everything is in **Albanian**.

## Run locally

```bash
npm install
npm run web        # dev server → http://localhost:8081
```

Production web build:

```bash
npx expo export -p web && node scripts/postbuild-web.js
```

## Deploy

Every push to `main` auto-builds and deploys to GitHub Pages via [.github/workflows/deploy.yml](.github/workflows/deploy.yml) (Pages source must be **GitHub Actions**). The base path is derived from the repo name automatically.

## Optional backends (repo → Settings → Secrets and variables → Actions → **Variables**)

| Feature | Variable(s) | Guide |
|---|---|---|
| Real Google sign-in | `GOOGLE_CLIENT_ID` | in-app Dokumentacioni → *Për zhvilluesit* |
| Shared listings + photo uploads | `SUPABASE_URL`, `SUPABASE_ANON_KEY` | in-app Dokumentacioni → *Shpallje të përbashkëta (Cloud)* |

Without these the app still fully works: Google login runs in demo mode and listings stay on-device.

## Android APK

```bash
npx eas-cli login   # free Expo account
npm run apk         # EAS build (preview profile) → downloadable .apk
```

`npm run apk:production` builds an `.aab` for the Play Store.

## Tech

Expo SDK 56 · React Native 0.85 · expo-router · TypeScript · AsyncStorage · Google Identity Services (REST) · Supabase (REST, no SDK) — zero UI libraries, all components hand-built.

## Notes

This is a demo/MVP: accounts are stored per device, chat replies are simulated, and the optional Supabase policies are open (anyone can write). For production you'd move auth server-side and tie database writes to authenticated users.
