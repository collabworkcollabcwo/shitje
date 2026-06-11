import { Listing } from '../types';

/**
 * Shared-listings backend (Supabase, via its plain REST API — no SDK needed).
 *
 * When EXPO_PUBLIC_SUPABASE_URL + EXPO_PUBLIC_SUPABASE_ANON_KEY are set at
 * build time, published listings sync to a shared database so EVERY user sees
 * them. Without them the app stays local-only (listings live on the device).
 * Setup steps: in-app Dokumentacioni → "Shpallje të përbashkëta (Cloud)".
 *
 * Schema (one table + one public storage bucket):
 *   create table public.listings (
 *     id text primary key,
 *     data jsonb not null,
 *     created_at timestamptz default now()
 *   );
 */
const CLOUD_URL = (process.env.EXPO_PUBLIC_SUPABASE_URL || '').trim().replace(/\/+$/, '');
const CLOUD_KEY = (process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '').trim();

export function cloudEnabled(): boolean {
  return CLOUD_URL.length > 0 && CLOUD_KEY.length > 0;
}

const jsonHeaders = () => ({
  apikey: CLOUD_KEY,
  Authorization: `Bearer ${CLOUD_KEY}`,
  'Content-Type': 'application/json',
});

/**
 * Coerce an untrusted cloud document into a safe Listing, or return null if it's
 * too broken to show. Cloud data is external — a malformed row must never crash
 * the app (e.g. a missing `images` array would break ListingCard).
 */
function sanitizeListing(raw: any): Listing | null {
  if (!raw || typeof raw !== 'object') return null;
  if (typeof raw.id !== 'string' || typeof raw.title !== 'string') return null;
  const images = Array.isArray(raw.images) && raw.images.length
    ? raw.images.filter((u: any) => typeof u === 'string' && u)
    : [`https://picsum.photos/seed/${raw.id}/600/600`];
  return {
    ...raw,
    id: raw.id,
    title: raw.title,
    description: typeof raw.description === 'string' ? raw.description : '',
    price: typeof raw.price === 'number' ? raw.price : 0,
    currency: raw.currency || 'ALL',
    images: images.length ? images : [`https://picsum.photos/seed/${raw.id}/600/600`],
    category: typeof raw.category === 'string' ? raw.category : 'te_tjera',
    condition: raw.condition || 'i_perdorur',
    location: typeof raw.location === 'string' ? raw.location : 'Shqipëri',
    sellerId: typeof raw.sellerId === 'string' ? raw.sellerId : 'unknown',
    sellerName: typeof raw.sellerName === 'string' ? raw.sellerName : 'Përdorues',
    createdAt: typeof raw.createdAt === 'string' ? raw.createdAt : new Date().toISOString(),
    views: typeof raw.views === 'number' ? raw.views : 0,
  } as Listing;
}

/** All shared listings, newest first. Throws on network/server errors. */
export async function fetchCloudListings(): Promise<Listing[]> {
  if (!cloudEnabled()) return [];
  const r = await fetch(
    `${CLOUD_URL}/rest/v1/listings?select=id,data&order=created_at.desc&limit=300`,
    { headers: jsonHeaders() }
  );
  if (!r.ok) throw new Error(`cloud fetch failed (${r.status})`);
  const rows: { id: string; data: any }[] = await r.json();
  return rows
    .map(row => sanitizeListing(row?.data))
    .filter((l): l is Listing => l !== null);
}

/** Insert or update one listing document. */
export async function upsertCloudListing(listing: Listing): Promise<void> {
  if (!cloudEnabled()) return;
  await fetch(`${CLOUD_URL}/rest/v1/listings?on_conflict=id`, {
    method: 'POST',
    headers: { ...jsonHeaders(), Prefer: 'resolution=merge-duplicates' },
    body: JSON.stringify([{ id: listing.id, data: listing }]),
  });
}

export async function deleteCloudListing(id: string): Promise<void> {
  if (!cloudEnabled()) return;
  await fetch(`${CLOUD_URL}/rest/v1/listings?id=eq.${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: jsonHeaders(),
  });
}

/**
 * Upload a locally-picked photo to the public `listings` bucket and return its
 * permanent URL — local blob:/file: URIs only exist on the seller's device, so
 * without this other users couldn't see the photos. Returns null on failure.
 */
export async function uploadCloudImage(localUri: string, name: string): Promise<string | null> {
  if (!cloudEnabled()) return null;
  try {
    const blob = await (await fetch(localUri)).blob();
    const path = `public/${name}`;
    const r = await fetch(`${CLOUD_URL}/storage/v1/object/listings/${path}`, {
      method: 'POST',
      headers: {
        apikey: CLOUD_KEY,
        Authorization: `Bearer ${CLOUD_KEY}`,
        'Content-Type': blob.type || 'image/jpeg',
        'x-upsert': 'true',
      },
      body: blob,
    });
    if (!r.ok) return null;
    return `${CLOUD_URL}/storage/v1/object/public/listings/${path}`;
  } catch {
    return null;
  }
}
