import React, { useMemo, useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, Pressable, ScrollView,
  ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Palette } from '../constants/colors';
import { useColors } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { notify } from '../utils/notify';

type Mode = 'login' | 'register';

interface Props {
  /** Called after a successful login/registration. */
  onSuccess?: () => void;
  /** When set, shows a "Vazhdo si vizitor" link that calls this. */
  onSkip?: () => void;
}

export default function AuthPanel({ onSuccess, onSkip }: Props) {
  const Colors = useColors();
  const styles = useMemo(() => createStyles(Colors), [Colors]);
  const router = useRouter();
  const { login, register, signInWithGoogle, googleIsReal } = useAuth();

  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState<'form' | 'google' | null>(null);

  const switchMode = (next: Mode) => {
    setMode(next);
    setError('');
  };

  const handleSubmit = async () => {
    if (busy) return;
    setError('');
    setBusy('form');
    const result = mode === 'login'
      ? await login(email, password)
      : await register(name, email, password);
    setBusy(null);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    if (mode === 'register') {
      notify('Mirë se erdhe! 🎉', 'Llogaria u krijua me sukses.');
    }
    onSuccess?.();
  };

  const handleGoogle = async () => {
    if (busy) return;
    setError('');
    setBusy('google');
    const result = await signInWithGoogle();
    setBusy(null);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    if (result.demo) {
      notify(
        'Hyrje me Google (Demo)',
        'U fute me një llogari demonstrimi. Për Google të vërtetë duhet konfiguruar Client ID — shih Dokumentacionin → "Për zhvilluesit".'
      );
    }
    onSuccess?.();
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Brand hero */}
        <View style={styles.hero}>
          <View style={styles.heroCircleBig} />
          <View style={styles.heroCircleSmall} />
          <View style={styles.heroCircleTiny} />
          <Text style={styles.heroLogo}>
            Shitje<Text style={styles.heroLogoDot}>.</Text>
          </Text>
          <Text style={styles.heroTagline}>Tregu i Shqipërisë</Text>
          <Text style={styles.heroTitle}>
            {mode === 'login' ? 'Mirë se u ktheve! 👋' : 'Krijo llogarinë tënde ✨'}
          </Text>
          <Text style={styles.heroSubtitle}>
            {mode === 'login'
              ? 'Hyr për të shitur, blerë dhe biseduar me shitësit.'
              : 'Falas, në më pak se një minutë.'}
          </Text>
        </View>

        {/* Floating card */}
        <View style={styles.card}>
          <View style={styles.segment}>
            <Pressable
              style={[styles.segmentItem, mode === 'login' && styles.segmentItemActive]}
              onPress={() => switchMode('login')}
            >
              <Text style={[styles.segmentText, mode === 'login' && styles.segmentTextActive]}>Hyr</Text>
            </Pressable>
            <Pressable
              style={[styles.segmentItem, mode === 'register' && styles.segmentItemActive]}
              onPress={() => switchMode('register')}
            >
              <Text style={[styles.segmentText, mode === 'register' && styles.segmentTextActive]}>Regjistrohu</Text>
            </Pressable>
          </View>

          {mode === 'register' && (
            <View style={styles.inputWrap}>
              <Feather name="user" size={17} color={Colors.gray[400]} />
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Emri yt"
                placeholderTextColor={Colors.gray[400]}
                autoCapitalize="words"
                autoComplete="name"
              />
            </View>
          )}

          <View style={styles.inputWrap}>
            <Feather name="mail" size={17} color={Colors.gray[400]} />
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Email"
              placeholderTextColor={Colors.gray[400]}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
            />
          </View>

          <View style={styles.inputWrap}>
            <Feather name="lock" size={17} color={Colors.gray[400]} />
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Fjalëkalimi"
              placeholderTextColor={Colors.gray[400]}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              onSubmitEditing={handleSubmit}
            />
            <Pressable onPress={() => setShowPassword(v => !v)} hitSlop={8}>
              <Feather name={showPassword ? 'eye-off' : 'eye'} size={17} color={Colors.gray[400]} />
            </Pressable>
          </View>

          {!!error && (
            <View style={styles.errorRow}>
              <Feather name="alert-circle" size={14} color={Colors.accent} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <Pressable
            style={({ pressed }) => [styles.submitButton, pressed && styles.pressed, busy === 'form' && styles.submitBusy]}
            onPress={handleSubmit}
            disabled={busy !== null}
          >
            {busy === 'form' ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Text style={styles.submitText}>{mode === 'login' ? 'Hyr' : 'Krijo llogarinë'}</Text>
                <Feather name="arrow-right" size={18} color="#FFFFFF" />
              </>
            )}
          </Pressable>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>ose vazhdo me</Text>
            <View style={styles.dividerLine} />
          </View>

          <Pressable
            style={({ pressed }) => [styles.googleButton, pressed && styles.pressed]}
            onPress={handleGoogle}
            disabled={busy !== null}
          >
            {busy === 'google' ? (
              <ActivityIndicator color={Colors.gray[600]} size="small" />
            ) : (
              <>
                <MaterialCommunityIcons name="google" size={19} color="#4285F4" />
                <Text style={styles.googleText}>Vazhdo me Google</Text>
                {!googleIsReal && <Text style={styles.googleDemoTag}>demo</Text>}
              </>
            )}
          </Pressable>

          {onSkip && (
            <Pressable style={styles.guestLink} onPress={onSkip} hitSlop={8}>
              <Text style={styles.guestText}>Vazhdo si vizitor</Text>
              <Feather name="chevron-right" size={15} color={Colors.gray[500]} />
            </Pressable>
          )}

          <Text style={styles.legal}>
            Duke vazhduar, pranon{' '}
            <Text style={styles.legalLink} onPress={() => router.push('/docs?section=siguria')}>
              Kushtet e Përdorimit & Privatësinë
            </Text>
            .
          </Text>
        </View>

        <View style={{ height: 28 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const createStyles = (Colors: Palette) => StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { flexGrow: 1 },
  hero: {
    backgroundColor: Colors.primary,
    paddingTop: 54,
    paddingBottom: 52,
    paddingHorizontal: 24,
    overflow: 'hidden',
  },
  heroCircleBig: {
    position: 'absolute',
    top: -70,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  heroCircleSmall: {
    position: 'absolute',
    bottom: -30,
    right: 60,
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  heroCircleTiny: {
    position: 'absolute',
    top: 40,
    left: -28,
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  heroLogo: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -1.4,
  },
  heroLogoDot: { color: '#FFD9B8' },
  heroTagline: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.85)',
    marginTop: -2,
  },
  heroTitle: {
    fontSize: 23,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    marginTop: 22,
  },
  heroSubtitle: {
    fontSize: 13.5,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 5,
    lineHeight: 19,
  },
  card: {
    marginHorizontal: 16,
    marginTop: -26,
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  segment: {
    flexDirection: 'row',
    backgroundColor: Colors.gray[100],
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
  },
  segmentItem: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 11,
    alignItems: 'center',
  },
  segmentItemActive: {
    backgroundColor: Colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.gray[500],
  },
  segmentTextActive: { color: Colors.secondary },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.gray[50],
    borderWidth: 1.5,
    borderColor: Colors.gray[200],
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 50,
    marginBottom: 11,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: Colors.gray[900],
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    backgroundColor: Colors.accent + '14',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginBottom: 11,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    color: Colors.accent,
    fontWeight: '600',
    lineHeight: 17,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: 14,
    height: 52,
    marginTop: 2,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  submitBusy: { opacity: 0.85 },
  submitText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  pressed: { opacity: 0.88, transform: [{ scale: 0.99 }] },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 15,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.gray[200] },
  dividerText: { fontSize: 12, color: Colors.gray[400], fontWeight: '600' },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.gray[200],
    borderRadius: 14,
    height: 50,
  },
  googleText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.gray[800],
  },
  googleDemoTag: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.gray[400],
    backgroundColor: Colors.gray[100],
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    overflow: 'hidden',
    textTransform: 'uppercase',
  },
  guestLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    marginTop: 14,
  },
  guestText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: Colors.gray[500],
  },
  legal: {
    marginTop: 14,
    fontSize: 11.5,
    color: Colors.gray[400],
    textAlign: 'center',
    lineHeight: 16,
  },
  legalLink: {
    color: Colors.primary,
    fontWeight: '600',
  },
});
