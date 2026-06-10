import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Palette } from '../../constants/colors';
import { useColors } from '../../context/ThemeContext';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { formatMonthYear } from '../../utils/format';
import { confirmAction } from '../../utils/notify';
import ListingCard from '../../components/ListingCard';
import AuthPanel from '../../components/AuthPanel';

export default function ProfileScreen() {
  const router = useRouter();
  const { currentUser, listings, favorites } = useApp();
  const { user: authUser, logout } = useAuth();
  const Colors = useColors();
  const styles = useMemo(() => createStyles(Colors), [Colors]);

  // Not signed in → the profile tab IS the login screen.
  if (!authUser) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <AuthPanel />
      </SafeAreaView>
    );
  }

  const myListings = listings.filter(l => l.sellerId === currentUser.id);
  const favoriteListings = listings.filter(l => favorites.includes(l.id));
  const soldCount = myListings.filter(l => l.isSold).length;

  const menuItems = [
    { icon: 'settings', color: '#5C6BC0', label: 'Cilësimet', onPress: () => router.push('/settings') },
    { icon: 'bell', color: '#FF6B00', label: 'Njoftimet', onPress: () => router.push('/notifications') },
    { icon: 'shield', color: '#4CAF50', label: 'Privatësia & Siguria', onPress: () => router.push('/docs?section=siguria') },
    { icon: 'help-circle', color: '#2196F3', label: 'Ndihmë & Dokumentacion', onPress: () => router.push('/docs') },
    { icon: 'info', color: '#9B59B6', label: 'Rreth Shitje', onPress: () => router.push('/docs?section=rreth') },
  ];

  const handleLogout = () => {
    confirmAction('Dil nga llogaria', 'A je i sigurt që do të dalësh?', () => logout(), 'Dil');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarRing}>
              {authUser.avatar ? (
                <Image source={{ uri: authUser.avatar }} style={styles.avatarImg} />
              ) : (
                <View style={styles.avatar}>
                  <Text style={styles.avatarInitial}>{authUser.name.charAt(0).toUpperCase()}</Text>
                </View>
              )}
            </View>
          </View>
          <Text style={styles.name}>{authUser.name}</Text>
          <View style={styles.emailRow}>
            <Feather name={authUser.provider === 'google' ? 'chrome' : 'mail'} size={12} color={Colors.gray[500]} />
            <Text style={styles.email}>{authUser.email}</Text>
          </View>
          <Text style={styles.memberSince}>Anëtar që nga {formatMonthYear(authUser.joinedAt)}</Text>

          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{myListings.length}</Text>
              <Text style={styles.statLabel}>Shpallje</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>{soldCount}</Text>
              <Text style={styles.statLabel}>Të shitura</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>{favoriteListings.length}</Text>
              <Text style={styles.statLabel}>Të preferuara</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shpalljet e mia</Text>
          {myListings.length > 0 ? (
            <View style={styles.grid}>
              {myListings.map(l => (
                <ListingCard key={l.id} listing={l} />
              ))}
            </View>
          ) : (
            <View style={styles.emptySection}>
              <Feather name="package" size={32} color={Colors.gray[300]} />
              <Text style={styles.emptyText}>Nuk ke shpallje ende</Text>
              <Pressable
                style={styles.sellButton}
                onPress={() => router.push('/(tabs)/sell')}
              >
                <Feather name="plus" size={16} color={Colors.white} />
                <Text style={styles.sellButtonText}>Krijo shpalljen e parë</Text>
              </Pressable>
            </View>
          )}
        </View>

        {favoriteListings.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Të preferuarat</Text>
            <View style={styles.grid}>
              {favoriteListings.map(l => (
                <ListingCard key={l.id} listing={l} />
              ))}
            </View>
          </View>
        )}

        <View style={styles.menu}>
          {menuItems.map((item, index) => (
            <Pressable
              key={index}
              style={[styles.menuItem, index < menuItems.length - 1 && styles.menuItemBorder]}
              onPress={item.onPress}
            >
              <View style={[styles.menuIcon, { backgroundColor: item.color + '1E' }]}>
                <Feather name={item.icon as any} size={16} color={item.color} />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Feather name="chevron-right" size={18} color={Colors.gray[400]} />
            </Pressable>
          ))}
        </View>

        <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <Feather name="log-out" size={18} color={Colors.accent} />
          <Text style={styles.logoutText}>Dil nga llogaria</Text>
        </Pressable>

        <Text style={styles.version}>Shitje v1.1.0</Text>
        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (Colors: Palette) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  profileHeader: {
    backgroundColor: Colors.surface,
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  avatarContainer: {
    marginBottom: 12,
  },
  avatarRing: {
    padding: 4,
    borderRadius: 50,
    borderWidth: 2.5,
    borderColor: Colors.primary,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  avatarImg: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarInitial: {
    fontSize: 34,
    fontWeight: '800',
    color: Colors.white,
  },
  name: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.secondary,
    letterSpacing: -0.5,
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 4,
  },
  email: {
    fontSize: 13.5,
    color: Colors.gray[500],
  },
  memberSince: {
    fontSize: 12.5,
    color: Colors.gray[400],
    marginTop: 3,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginHorizontal: 16,
    paddingVertical: 14,
    paddingHorizontal: 8,
    backgroundColor: Colors.gray[50],
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.gray[100],
    alignSelf: 'stretch',
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.secondary,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.gray[500],
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: Colors.gray[200],
  },
  section: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.secondary,
    letterSpacing: -0.5,
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  emptySection: {
    alignItems: 'center',
    paddingVertical: 26,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.gray[500],
    marginBottom: 6,
  },
  sellButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 22,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  sellButtonText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 14,
  },
  menu: {
    marginTop: 20,
    backgroundColor: Colors.surface,
    borderRadius: 18,
    marginHorizontal: 16,
    paddingHorizontal: 14,
    overflow: 'hidden',
    shadowColor: Colors.gray[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    gap: 12,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
  },
  menuIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: Colors.gray[700],
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
    marginHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: Colors.accent + '12',
    borderRadius: 14,
  },
  logoutText: {
    fontSize: 15,
    color: Colors.accent,
    fontWeight: '700',
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: Colors.gray[400],
    marginTop: 16,
  },
});
