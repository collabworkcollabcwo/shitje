import { Platform } from 'react-native';

// Picked photos on web are `blob:` URLs that the browser revokes on reload —
// so published listings lose their images. To make photos persist (and show
// for the seller) WITHOUT any backend yet, we downscale + re-encode them to a
// compact self-contained `data:` URI. When the Supabase cloud is enabled these
// get uploaded to real URLs (utils/cloud.ts); until then the data URI is what
// keeps the image visible.

const MAX_DIM = 1000;   // longest edge after downscale
const QUALITY = 0.55;   // JPEG quality — small enough for local storage

/**
 * Returns a persistent image URI for a freshly-picked photo.
 * - web: a downscaled JPEG `data:` URI (survives reload, no backend).
 * - native: the original `file://` URI already persists locally, so unchanged.
 */
export async function toPersistentImage(uri: string): Promise<string> {
  if (Platform.OS !== 'web') return uri;
  if (uri.startsWith('data:')) return uri;
  try {
    const out = await downscaleWeb(uri);
    return out || uri;
  } catch {
    return uri;
  }
}

function downscaleWeb(uri: string): Promise<string | null> {
  return new Promise(resolve => {
    const doc: any = (globalThis as any).document;
    const ImageCtor: any = (globalThis as any).Image;
    if (!doc || !ImageCtor) return resolve(null);

    const img = new ImageCtor();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      let width = img.naturalWidth || img.width;
      let height = img.naturalHeight || img.height;
      if (!width || !height) return resolve(null);
      if (width > MAX_DIM || height > MAX_DIM) {
        const scale = MAX_DIM / Math.max(width, height);
        width = Math.round(width * scale);
        height = Math.round(height * scale);
      }
      try {
        const canvas = doc.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(null);
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', QUALITY));
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = uri;
  });
}
