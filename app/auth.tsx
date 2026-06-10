import React, { useMemo } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AuthPanel from '../components/AuthPanel';
import { Palette } from '../constants/colors';
import { useColors } from '../context/ThemeContext';

export default function AuthScreen() {
  const router = useRouter();
  const Colors = useColors();
  const styles = useMemo(() => createStyles(Colors), [Colors]);

  const close = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      <AuthPanel onSuccess={close} onSkip={close} />
      <Pressable style={styles.closeButton} onPress={close} hitSlop={10}>
        <Feather name="x" size={20} color="#FFFFFF" />
      </Pressable>
    </View>
  );
}

const createStyles = (Colors: Palette) => StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  closeButton: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
