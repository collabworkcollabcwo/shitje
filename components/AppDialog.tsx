import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Palette } from '../constants/colors';
import { useColors } from '../context/ThemeContext';
import { registerDialogPresenter, DialogRequest, DialogButton } from '../utils/notify';

const USE_NATIVE = Platform.OS !== 'web';

/** Pick an icon + colour from the dialog title so common dialogs read at a glance. */
function iconFor(title: string, Colors: Palette): { name: string; color: string } {
  const t = title.toLowerCase();
  if (t.includes('sukses') || t.includes('kopjua') || t.includes('mirë se erdhe')) {
    return { name: 'check-circle', color: Colors.success };
  }
  if (t.includes('gabim') || t.includes('plotëso') || t.includes('pa numër')) {
    return { name: 'alert-circle', color: Colors.accent };
  }
  if (t.includes('dil') || t.includes('fshi') || t.includes('hiq')) {
    return { name: 'alert-triangle', color: Colors.warning };
  }
  return { name: 'info', color: Colors.primary };
}

/**
 * Renders notify()/confirmAction() requests as an in-app dialog — an overlay
 * inside the app (and inside the phone frame on desktop web), never a browser
 * popup. Mounted once in the root layout.
 */
export default function DialogHost() {
  const Colors = useColors();
  const styles = useMemo(() => createStyles(Colors), [Colors]);
  const [request, setRequest] = useState<DialogRequest | null>(null);
  const scale = useRef(new Animated.Value(0.9)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    registerDialogPresenter(setRequest);
    return () => registerDialogPresenter(null);
  }, []);

  useEffect(() => {
    if (request) {
      scale.setValue(0.9);
      opacity.setValue(0);
      Animated.parallel([
        Animated.spring(scale, { toValue: 1, friction: 7, tension: 120, useNativeDriver: USE_NATIVE }),
        Animated.timing(opacity, { toValue: 1, duration: 150, useNativeDriver: USE_NATIVE }),
      ]).start();
    }
  }, [request]);

  if (!request) return null;

  const close = (button?: DialogButton) => {
    setRequest(null);
    button?.onPress?.();
  };

  const icon = iconFor(request.title, Colors);
  const isRow = request.buttons.length === 2;

  return (
    <Animated.View style={[styles.backdrop, { opacity }]}>
      <Pressable style={StyleSheet.absoluteFill} onPress={() => close()} />
      <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
        <View style={[styles.iconWrap, { backgroundColor: icon.color + '1A' }]}>
          <Feather name={icon.name as any} size={26} color={icon.color} />
        </View>
        <Text style={styles.title}>{request.title}</Text>
        {!!request.message && <Text style={styles.message}>{request.message}</Text>}
        <View style={[styles.buttons, isRow ? styles.buttonsRow : null]}>
          {request.buttons.map((b, i) => {
            const style = b.style || 'primary';
            return (
              <Pressable
                key={i}
                style={({ pressed }) => [
                  styles.button,
                  isRow && { flex: 1 },
                  style === 'primary' && styles.buttonPrimary,
                  style === 'destructive' && styles.buttonDestructive,
                  style === 'cancel' && styles.buttonCancel,
                  pressed && { opacity: 0.85 },
                ]}
                onPress={() => close(b)}
              >
                <Text
                  style={[
                    styles.buttonText,
                    style === 'cancel' ? styles.buttonTextCancel : styles.buttonTextOnColor,
                  ]}
                >
                  {b.text}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const createStyles = (Colors: Palette) => StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
    zIndex: 1000,
    elevation: 1000,
  },
  card: {
    width: '100%',
    maxWidth: 330,
    backgroundColor: Colors.surface,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 16,
  },
  iconWrap: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 13,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.secondary,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  message: {
    fontSize: 14,
    color: Colors.gray[500],
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 7,
  },
  buttons: {
    alignSelf: 'stretch',
    marginTop: 18,
    gap: 8,
  },
  buttonsRow: {
    flexDirection: 'row',
  },
  button: {
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  buttonPrimary: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonDestructive: {
    backgroundColor: Colors.accent,
  },
  buttonCancel: {
    backgroundColor: Colors.gray[100],
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  buttonTextOnColor: {
    color: '#FFFFFF',
  },
  buttonTextCancel: {
    color: Colors.gray[700],
  },
});
