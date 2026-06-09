import React, { useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Linking } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import { Palette } from '../../constants/colors';
import { useColors } from '../../context/ThemeContext';
import { useApp } from '../../context/AppContext';
import { formatDate, formatMonthYear } from '../../utils/format';
import { MOCK_REVIEWS } from '../../data/mock';
import ListingCard from '../../components/ListingCard';

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getUserById, listings, currentUser, chats } = useApp();
  const Colors = useColors();
  const styles = useMemo(() => createStyles(Colors), [Colors]);

  const user = getUserById(id || '');
  const userListings = listings.filter(l => l.sellerId === id);
  const reviews = MOCK_REVIEWS.filter(r => r.userId === id);

  if (!user) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Përdoruesi nuk u gjet</Text>
      </View>
    );
  }

  const isOwnProfile = user.id === currentUser.id;

  const handleCall = () => {
    if (user.phone) Linking.openURL(`tel:${user.phone.replace(/\s/g, '')}`);
  };
  const handleMessage = () => {
    const chat = chats.find(c => c.participants.includes(user.id));
    if (chat) router.push(`/chat/${chat.id}`);
    else router.push('/(tabs)/messages');
  };

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
          <View>
            <View style={styles.header}>
              <View style={styles.avatar}>
                <Text style={styles.avatarInitial}>{user.name.charAt(0).toUpperCase()}</Text>
              </View>
              <Text style={styles.name}>{user.name}</Text>
              <View style={styles.locationRow}>
                <Feather name="map-pin" size={13} color={Colors.gray[500]} />
                <Text style={styles.location}>{user.location}</Text>
              </View>

              <View style={styles.statsRow}>
                <View style={styles.stat}>
                  <View style={styles.ratingRow}>
                    <Ionicons name="star" size={15} color={Colors.warning} />
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
                  <Text style={styles.statValue}>{formatMonthYear(user.joinedAt)}</Text>
                  <Text style={styles.statLabel}>Anëtar që nga</Text>
                </View>
              </View>

              {!isOwnProfile && (
                <View style={styles.contactRow}>
                  <Pressable style={styles.callButton} onPress={handleCall}>
                    <Feather name="phone" size={17} color={Colors.primary} />
                    <Text style={styles.callText}>Telefono</Text>
                  </Pressable>
                  <Pressable style={styles.messageButton} onPress={handleMessage}>
                    <Feather name="message-circle" size={17} color={Colors.white} />
                    <Text style={styles.messageText}>Mesazh</Text>
                  </Pressable>
                </View>
              )}
            </View>

            {reviews.length > 0 && (
              <View style={styles.reviewsSection}>
                <Text style={styles.reviewsTitle}>Vlerësimet ({user.reviewCount})</Text>
                {reviews.map((r, idx) => (
                  <View key={r.id} style={[styles.reviewCard, idx === reviews.length - 1 && styles.reviewCardLast]}>
                    <View style={styles.reviewTop}>
                      <View style={styles.reviewAvatar}>
                        <Text style={styles.reviewAvatarText}>{r.reviewerName.charAt(0)}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.reviewName}>{r.reviewerName}</Text>
                        <View style={styles.starsRow}>
                          {[1, 2, 3, 4, 5].map(i => (
                            <Ionicons
                              key={i}
                              name={i <= r.rating ? 'star' : 'star-outline'}
                              size={12}
                              color={Colors.warning}
                            />
                          ))}
                        </View>
                      </View>
                      <Text style={styles.reviewDate}>{formatDate(r.date)}</Text>
                    </View>
                    <Text style={styles.reviewComment}>{r.comment}</Text>
                  </View>
                ))}
              </View>
            )}

            <Text style={styles.listingsTitle}>Shpalljet ({userListings.length})</Text>
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
  notFoundText: { fontSize: 16, color: Colors.gray[500] },
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
  avatarInitial: { fontSize: 32, fontWeight: '700', color: Colors.white },
  name: { fontSize: 22, fontWeight: '700', color: Colors.secondary },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  location: { fontSize: 14, color: Colors.gray[500] },
  statsRow: { flexDirection: 'row', alignItems: 'center', marginTop: 20, width: '100%' },
  stat: { flex: 1, alignItems: 'center' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingValue: { fontSize: 20, fontWeight: '700', color: Colors.secondary },
  statValue: { fontSize: 16, fontWeight: '700', color: Colors.secondary },
  statLabel: { fontSize: 12, color: Colors.gray[500], marginTop: 2 },
  statDivider: { width: 1, height: 30, backgroundColor: Colors.gray[200] },
  contactRow: { flexDirection: 'row', gap: 10, marginTop: 20, width: '100%' },
  callButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  callText: { fontSize: 15, fontWeight: '700', color: Colors.primary },
  messageButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.primary,
  },
  messageText: { fontSize: 15, fontWeight: '700', color: Colors.white },
  reviewsSection: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,
    marginBottom: 12,
  },
  reviewsTitle: { fontSize: 17, fontWeight: '700', color: Colors.secondary, marginBottom: 8 },
  reviewCard: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
  },
  reviewCardLast: { borderBottomWidth: 0 },
  reviewTop: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 },
  reviewAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewAvatarText: { fontSize: 15, fontWeight: '700', color: Colors.primary },
  reviewName: { fontSize: 14, fontWeight: '600', color: Colors.secondary },
  starsRow: { flexDirection: 'row', gap: 1, marginTop: 2 },
  reviewDate: { fontSize: 11, color: Colors.gray[400] },
  reviewComment: { fontSize: 13, color: Colors.gray[700], lineHeight: 18 },
  listingsTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.secondary,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  row: { paddingHorizontal: 12, gap: 12 },
  list: { backgroundColor: Colors.background, paddingBottom: 20 },
  empty: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { fontSize: 14, color: Colors.gray[500] },
});
