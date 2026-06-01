import React from 'react';
import { Platform, StyleSheet, View, useWindowDimensions } from 'react-native';
import { Colors } from '../constants/colors';
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

  // Native (APK / iOS) or a narrow browser (real phone): no frame.
  if (Platform.OS !== 'web' || width < PHONE_BREAKPOINT) {
    return <View style={styles.fill}>{children}</View>;
  }

  // Wide browser: draw a phone mockup, scaled to fit the window height.
  const deviceHeight = Math.min(PHONE_HEIGHT, height - 40);

  return (
    <View style={styles.backdrop}>
      <View style={[styles.device, { width: PHONE_WIDTH, height: deviceHeight }]}>
        <View style={styles.screen}>{children}</View>
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
    backgroundColor: '#15151F',
    padding: 20,
  },
  device: {
    backgroundColor: '#0A0A0C',
    borderRadius: 46,
    padding: PHONE_FRAME_PADDING,
    // Soft floating shadow (works on web).
    boxShadow: '0 30px 70px rgba(0,0,0,0.45)',
  } as any,
  screen: {
    flex: 1,
    borderRadius: 34,
    overflow: 'hidden',
    backgroundColor: Colors.background,
  },
});
