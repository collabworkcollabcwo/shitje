import { Platform } from 'react-native';

export interface GoogleProfile {
  sub: string;
  email: string;
  name: string;
  avatar?: string;
}

/**
 * Google OAuth Web Client ID, baked in at build time.
 * Set it as a GitHub Actions variable (GOOGLE_CLIENT_ID) or in .env as
 * EXPO_PUBLIC_GOOGLE_CLIENT_ID. When absent, the Google button falls back to a
 * demo account so the flow is still usable. Setup steps: Dokumentacioni →
 * "Për zhvilluesit".
 */
export const GOOGLE_CLIENT_ID = (process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '').trim();

/** True when a real Google sign-in is possible (web build + client ID configured). */
export function isGoogleReal(): boolean {
  return Platform.OS === 'web' && GOOGLE_CLIENT_ID.length > 0;
}

let gisLoader: Promise<any> | null = null;

/** Inject Google Identity Services script once and resolve with the `google` global. */
function loadGis(): Promise<any> {
  if (gisLoader) return gisLoader;
  gisLoader = new Promise((resolve, reject) => {
    const g = (globalThis as any).google;
    if (g?.accounts?.oauth2) return resolve(g);
    const doc = (globalThis as any).document;
    if (!doc) return reject(new Error('Google login funksionon vetëm në web.'));
    const script = doc.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.onload = () => {
      const loaded = (globalThis as any).google;
      if (loaded?.accounts?.oauth2) resolve(loaded);
      else reject(new Error('Google Identity Services nuk u ngarkua.'));
    };
    script.onerror = () => {
      gisLoader = null;
      reject(new Error('Nuk u lidhëm dot me Google. Kontrollo internetin.'));
    };
    doc.head.appendChild(script);
  });
  return gisLoader;
}

/**
 * Real Google sign-in (web): opens the Google account popup, then fetches the
 * user's profile. Must be called from a user gesture (button press).
 */
export async function googleSignInWeb(): Promise<GoogleProfile> {
  const google = await loadGis();
  return new Promise<GoogleProfile>((resolve, reject) => {
    let settled = false;
    const done = (fn: () => void) => {
      if (!settled) {
        settled = true;
        fn();
      }
    };
    try {
      const tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: 'openid email profile',
        callback: async (resp: any) => {
          if (resp?.error) {
            return done(() => reject(new Error('Hyrja me Google dështoi (' + resp.error + ').')));
          }
          try {
            const r = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: { Authorization: `Bearer ${resp.access_token}` },
            });
            const p = await r.json();
            if (!p?.email) throw new Error('missing email');
            done(() =>
              resolve({
                sub: String(p.sub || p.email),
                email: String(p.email).toLowerCase(),
                name: p.name || String(p.email).split('@')[0],
                avatar: p.picture || undefined,
              })
            );
          } catch {
            done(() => reject(new Error('Nuk i morëm dot të dhënat e llogarisë Google.')));
          }
        },
        error_callback: () => done(() => reject(new Error('Hyrja me Google u anulua.'))),
      });
      tokenClient.requestAccessToken();
    } catch (e) {
      done(() => reject(e instanceof Error ? e : new Error('Hyrja me Google dështoi.')));
    }
  });
}

/** Demo profile used when no client ID is configured (or on native dev builds). */
export function googleDemoProfile(): GoogleProfile {
  return {
    sub: 'google-demo',
    email: 'perdoruesi.demo@gmail.com',
    name: 'Përdorues Google',
    avatar: undefined,
  };
}
