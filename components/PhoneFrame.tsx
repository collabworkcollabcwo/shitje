import React from 'react';
import { Platform, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useColors } from '../context/ThemeContext';
import { PHONE_FRAME_WIDTH, PHONE_FRAME_PADDING, PHONE_BREAKPOINT } from '../constants/layout';

const PHONE_WIDTH = PHONE_FRAME_WIDTH;
const PHONE_HEIGHT = 896;

/**
 * Wraps the app so that on a wide web browser it appears inside a centered
 * phone-shaped device (so you can "see the phone version" on the website),
 * while on actual phones and the native APK it fills the whole screen.
 */
export default function PhoneFrame({ children }: { children: React.ReactNode }) {
  const { width, height } = useWindowDimensions();
  const colors = useColors();

  // Native (APK / iOS) or a narrow browser (real phone): no frame.
  if (Platform.OS !== 'web' || width < PHONE_BREAKPOINT) {
    return <View style={styles.fill}>{children}</View>;
  }

  // Wide browser: draw a phone mockup, scaled to fit the window height.
  const deviceHeight = Math.min(PHONE_HEIGHT, height - 40);

  return (
    <View style={styles.backdrop}>
      <View style={[styles.device, { width: PHONE_WIDTH, height: deviceHeight }]}>
        <View style={[styles.screen, { backgroundColor: colors.background }]}>{children}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0D0E18',
    // Subtle brand glow behind the device (web-only component, CSS is safe).
    backgroundImage:
      'radial-gradient(ellipse 70% 60% at 50% 40%, rgba(255,85,0,0.16), transparent 70%), radial-gradient(ellipse 50% 40% at 80% 90%, rgba(255,45,85,0.08), transparent 70%)',
    padding: 20,
  } as any,
  device: {
    backgroundColor: '#08080A',
    borderRadius: 46,
    padding: PHONE_FRAME_PADDING,
    // Floating shadow + a hair of orange glow + metallic edge highlight.
    boxShadow:
      '0 40px 90px rgba(0,0,0,0.6), 0 0 80px rgba(255,85,0,0.12), inset 0 0 0 1.5px rgba(255,255,255,0.08)',
  } as any,
  screen: {
    flex: 1,
    borderRadius: 34,
    overflow: 'hidden',
  },
});
