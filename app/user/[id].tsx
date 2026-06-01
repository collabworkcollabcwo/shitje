import React, { useMemo } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Palette } from '../../constants/colors';
import { useColors } from '../../context/ThemeContext';
import { useApp } from '../../context/AppContext';
import { formatDate } from '../../utils/format';
import ListingCard from '../../components/ListingCard';

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getUserById, listings } = useApp();
  const Colors = useColors();
  const styles = useMemo(() => createStyles(Colors), [Colors]);

  const user = getUserById(id || '');
  const userListings = listings.filter(l => l.sellerId === id);

  if (!user) {
    return (
      <View style={styles.notFound}>
        <Text>Përdoruesi nuk u gjet</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: user.name }} />
      <FlatList
        data={userListings}
        keyExtractor={item => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.avatar}>
              <Feather name="user" size={36} color={Colors.white} />
            </View>
            <Text style={styles.name}>{user.name}</Text>
            <View style={styles.locationRow}>
              <Feather name="map-pin" size={13} color={Colors.gray[500]} />
              <Text style={styles.location}>{user.location}</Text>
            </View>
            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <View style={styles.ratingRow}>
                  <Feather name="star" size={16} color={Colors.warning} />
                  <Text style={styles.ratingValue}>{user.rating}</Text>
                </View>
                <Text style={styles.statLabel}>{user.reviewCount} vlerësime</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.stat}>
                <Text style={styles.statValue}>{userListings.length}</Text>
                <Text style={styles.statLabel}>Shpallje</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.stat}>
                <Text style={styles.statValue}>{formatDate(user.joinedAt)}</Text>
                <Text style={styles.statLabel}>Anëtar që nga</Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Shpalljet ({userListings.length})</Text>
          </View>
        }
        renderItem={({ item }) => <ListingCard listing={item} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Nuk ka shpallje</Text>
          </View>
        }
      />
    </>
  );
}

const createStyles = (Colors: Palette) => StyleSheet.create({
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background },
  header: {
    backgroundColor: Colors.surface,
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
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
    width: '100%',
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingValue: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.secondary,
  },
  statValue: {
    fontSize: 16,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.secondary,
    alignSelf: 'flex-start',
    marginTop: 24,
  },
  row: { paddingHorizontal: 12, gap: 12 },
  list: { backgroundColor: Colors.background, paddingBottom: 20 },
  empty: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.gray[500],
  },
});
