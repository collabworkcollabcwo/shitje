import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Switch, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Palette } from '../constants/colors';
import { useTheme } from '../context/ThemeContext';
import { useCurrency } from '../context/CurrencyContext';
import { CURRENCIES } from '../constants/currencies';
import { useAuth } from '../context/AuthContext';
import { confirmAction } from '../utils/notify';

export default function SettingsScreen() {
  const { colors: Colors, isDark, toggleTheme } = useTheme();
  const styles = useMemo(() => createStyles(Colors), [Colors]);
  const router = useRouter();
  const { currency, setCurrency } = useCurrency();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    confirmAction('Dil nga llogaria', 'A je i sigurt që do të dalësh?', () => {
      logout();
      router.replace('/(tabs)');
    }, 'Dil');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 30 }}>
      {/* Account */}
      <Text style={styles.groupLabel}>LLOGARIA</Text>
      {user ? (
        <View style={styles.card}>
          <View style={styles.accountRow}>
            {user.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.accountAvatarImg} />
            ) : (
              <View style={styles.accountAvatar}>
                <Text style={styles.accountInitial}>{user.name.charAt(0).toUpperCase()}</Text>
              </View>
            )}
            <View style={{ flex: 1 }}>
              <Text style={styles.accountName}>{user.name}</Text>
              <Text style={styles.accountEmail}>{user.email}</Text>
            </View>
            <View style={styles.providerChip}>
              <Feather name={user.provider === 'google' ? 'chrome' : 'mail'} size={11} color={Colors.primary} />
              <Text style={styles.providerText}>{user.provider === 'google' ? 'Google' : 'Email'}</Text>
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.card}>
          <View style={styles.accountRow}>
            <View style={[styles.accountAvatar, { backgroundColor: Colors.gray[200] }]}>
              <Feather name="user" size={22} color={Colors.gray[500]} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.accountName}>Nuk ke hyrë</Text>
              <Text style={styles.accountEmail}>Hyr për të shitur dhe ruajtur preferencat</Text>
            </View>
            <Pressable style={styles.loginButton} onPress={() => router.push('/auth')}>
              <Text style={styles.loginButtonText}>Hyr</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Appearance */}
      <Text style={styles.groupLabel}>PAMJA</Text>
      <View style={styles.card}>
        <View style={styles.row}>
          <View style={[styles.rowIcon, { backgroundColor: '#5C6BC01E' }]}>
            <Feather name={isDark ? 'moon' : 'sun'} size={17} color="#5C6BC0" />
          </View>
          <Text style={styles.rowLabel}>Tema e errët</Text>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: Colors.gray[300], true: Colors.primary }}
            thumbColor={Colors.white}
            ios_backgroundColor={Colors.gray[300]}
          />
        </View>
      </View>

      {/* Currency */}
      <Text style={styles.groupLabel}>MONEDHA</Text>
      <View style={styles.card}>
        <View style={styles.currencyRow}>
          {CURRENCIES.map(c => (
            <Pressable
              key={c.code}
              style={[styles.currencyChip, currency === c.code && styles.currencyChipActive]}
              onPress={() => setCurrency(c.code)}
            >
              <Text style={[styles.currencyChipText, currency === c.code && styles.currencyChipTextActive]}>
                {c.symbol === 'Lekë' ? 'L' : c.symbol} {c.code}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* More */}
      <Text style={styles.groupLabel}>MË SHUMË</Text>
      <View style={styles.card}>
        {[
          { icon: 'bell', color: '#FF6B00', label: 'Njoftimet', route: '/notifications' },
          { icon: 'book-open', color: '#2196F3', label: 'Dokumentacioni', route: '/docs' },
          { icon: 'shield', color: '#4CAF50', label: 'Siguria & Privatësia', route: '/docs?section=siguria' },
          { icon: 'info', color: '#9B59B6', label: 'Rreth Shitje', route: '/docs?section=rreth' },
        ].map((item, i, arr) => (
          <Pressable
            key={item.label}
            style={[styles.row, i < arr.length - 1 && styles.rowBorder]}
            onPress={() => router.push(item.route as any)}
          >
            <View style={[styles.rowIcon, { backgroundColor: item.color + '1E' }]}>
              <Feather name={item.icon as any} size={17} color={item.color} />
            </View>
            <Text style={styles.rowLabel}>{item.label}</Text>
            <Feather name="chevron-right" size={18} color={Colors.gray[400]} />
          </Pressable>
        ))}
      </View>

      {user && (
        <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <Feather name="log-out" size={17} color={Colors.accent} />
          <Text style={styles.logoutText}>Dil nga llogaria</Text>
        </Pressable>
      )}

      <Text style={styles.version}>Shitje v1.2.0 · Bërë me ❤️ për Shqipërinë</Text>
    </ScrollView>
  );
}

const createStyles = (Colors: Palette) => StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  groupLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.gray[400],
    letterSpacing: 0.8,
    marginTop: 18,
    marginBottom: 8,
    marginHorizontal: 18,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    marginHorizontal: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: Colors.gray[100],
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
  },
  accountAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountAvatarImg: { width: 48, height: 48, borderRadius: 24 },
  accountInitial: { fontSize: 20, fontWeight: '800', color: Colors.white },
  accountName: { fontSize: 16, fontWeight: '700', color: Colors.secondary },
  accountEmail: { fontSize: 12.5, color: Colors.gray[500], marginTop: 1 },
  providerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 10,
  },
  providerText: { fontSize: 11, fontWeight: '700', color: Colors.primary },
  loginButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 12,
  },
  loginButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 13,
  },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.gray[100] },
  rowIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: { flex: 1, fontSize: 15, fontWeight: '600', color: Colors.gray[800] },
  currencyRow: { flexDirection: 'row', gap: 8, paddingVertical: 14 },
  currencyChip: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.gray[200],
    alignItems: 'center',
  },
  currencyChipActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  currencyChipText: { fontSize: 13.5, fontWeight: '700', color: Colors.gray[600] },
  currencyChipTextActive: { color: Colors.primary },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 22,
    marginHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: Colors.accent + '12',
    borderRadius: 14,
  },
  logoutText: { fontSize: 15, fontWeight: '700', color: Colors.accent },
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: Colors.gray[400],
    marginTop: 22,
  },
});
