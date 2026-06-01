import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Palette } from '../../constants/colors';
import { useColors } from '../../context/ThemeContext';
import { useApp } from '../../context/AppContext';
import { formatDate } from '../../utils/format';
import { notify, confirmAction } from '../../utils/notify';
import ListingCard from '../../components/ListingCard';

export default function ProfileScreen() {
  const router = useRouter();
  const { currentUser, listings, favorites } = useApp();
  const myListings = listings.filter(l => l.sellerId === currentUser.id);
  const favoriteListings = listings.filter(l => favorites.includes(l.id));
  const Colors = useColors();
  const styles = useMemo(() => createStyles(Colors), [Colors]);

  const menuItems = [
    { icon: 'settings', label: 'Cilësimet', onPress: () => notify('Cilësimet', 'Së shpejti.') },
    { icon: 'shield', label: 'Privatësia & Siguria', onPress: () => notify('Privatësia & Siguria', 'Së shpejti.') },
    { icon: 'help-circle', label: 'Ndihmë', onPress: () => notify('Ndihmë', 'Na kontakto në support@shitje.al') },
    { icon: 'info', label: 'Rreth Shitje', onPress: () => notify('Rreth Shitje', 'Shitje v1.0.0\nTregu i Shqipërisë.') },
  ];

  const handleLogout = () => {
    confirmAction('Dil nga llogaria', 'A je i sigurt që do të dalësh?', () => {}, 'Dil');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Feather name="user" size={36} color={Colors.white} />
            </View>
          </View>
          <Text style={styles.name}>{currentUser.name}</Text>
          <View style={styles.locationRow}>
            <Feather name="map-pin" size={13} color={Colors.gray[500]} />
            <Text style={styles.location}>{currentUser.location}</Text>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{currentUser.rating}</Text>
              <View style={styles.starRow}>
                {[1, 2, 3, 4, 5].map(i => (
                  <Feather
                    key={i}
                    name="star"
                    size={12}
                    color={i <= Math.floor(currentUser.rating) ? Colors.warning : Colors.gray[300]}
                  />
                ))}
              </View>
              <Text style={styles.statLabel}>{currentUser.reviewCount} vlerësime</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>{myListings.length}</Text>
              <Text style={styles.statLabel}>Shpallje</Text>
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
              <Text style={styles.emptyText}>Nuk keni shpallje ende</Text>
              <Pressable
                style={styles.sellButton}
                onPress={() => router.push('/(tabs)/sell')}
              >
                <Feather name="plus" size={16} color={Colors.white} />
                <Text style={styles.sellButtonText}>Krijo shpallje</Text>
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
            <Pressable key={index} style={styles.menuItem} onPress={item.onPress}>
              <Feather name={item.icon as any} size={20} color={Colors.gray[600]} />
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Feather name="chevron-right" size={18} color={Colors.gray[400]} />
            </Pressable>
          ))}
        </View>

        <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <Feather name="log-out" size={18} color={Colors.accent} />
          <Text style={styles.logoutText}>Dil nga llogaria</Text>
        </Pressable>

        <Text style={styles.version}>Shitje v1.0.0</Text>
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
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.secondary,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  location: {
    fontSize: 14,
    color: Colors.gray[500],
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 16,
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
  starRow: {
    flexDirection: 'row',
    gap: 1,
    marginVertical: 2,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.gray[500],
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
    fontSize: 18,
    fontWeight: '700',
    color: Colors.secondary,
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  emptySection: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: Colors.surface,
    borderRadius: 12,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.gray[500],
    marginBottom: 12,
  },
  sellButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  sellButtonText: {
    color: Colors.white,
    fontWeight: '600',
    fontSize: 14,
  },
  menu: {
    marginTop: 20,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    marginHorizontal: 16,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
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
    backgroundColor: Colors.surface,
    borderRadius: 12,
  },
  logoutText: {
    fontSize: 15,
    color: Colors.accent,
    fontWeight: '600',
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: Colors.gray[400],
    marginTop: 16,
  },
});
