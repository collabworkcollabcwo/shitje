import { Platform, useWindowDimensions } from 'react-native';

// Phone-frame dimensions used by <PhoneFrame> on the web build.
export const PHONE_FRAME_WIDTH = 414;
export const PHONE_FRAME_PADDING = 12;
export const PHONE_BREAKPOINT = 600;
// The app's usable screen width inside the device frame.
export const PHONE_CONTENT_WIDTH = PHONE_FRAME_WIDTH - PHONE_FRAME_PADDING * 2; // 390

/**
 * Width the app is actually rendered at — frame-aware on web.
 *
 * On a wide browser the app lives inside the fixed-width phone frame, so layout
 * math must use the frame width (not `window.innerWidth`, which would make cards
 * overflow). On phones / narrow browsers it's just the window width.
 */
export function useAppWidth(): number {
  const { width } = useWindowDimensions();
  if (Platform.OS === 'web' && width >= PHONE_BREAKPOINT) return PHONE_CONTENT_WIDTH;
  return width;
}
