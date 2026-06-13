import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Linking, Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import { Palette } from '../../constants/colors';
import { useColors } from '../../context/ThemeContext';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useReviews } from '../../context/ReviewsContext';
import { formatDate, formatMonthYear } from '../../utils/format';
import { notify } from '../../utils/notify';
import ListingCard from '../../components/ListingCard';

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getUserById, listings, currentUser, chats } = useApp();
  const { user: authUser } = useAuth();
  const { getReviews, getSummary, addReview } = useReviews();
  const Colors = useColors();
  const styles = useMemo(() => createStyles(Colors), [Colors]);

  const [showReview, setShowReview] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const user = getUserById(id || '');
  const userListings = listings.filter(l => l.sellerId === id);
  const reviews = user ? getReviews(user.id) : [];
  const summary = user ? getSummary(user) : { count: 0, average: 0 };

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

  const openReview = () => {
    if (!authUser) {
      notify('Hyr për të vlerësuar', 'Krijo një llogari ose hyr për të lënë një vlerësim.', () =>
        router.push('/auth')
      );
      return;
    }
    setRating(0);
    setComment('');
    setShowReview(true);
  };

  const submitReview = () => {
    if (rating < 1) {
      notify('Zgjidh vlerësimin', 'Prek yjet për të dhënë një notë nga 1 deri në 5.');
      return;
    }
    addReview({
      userId: user.id,
      reviewerName: authUser!.name,
      rating,
      comment: comment.trim() || 'Pa koment.',
    });
    setShowReview(false);
    notify('Faleminderit! ⭐', 'Vlerësimi yt u shtua me sukses.');
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
                    <Text style={styles.ratingValue}>{summary.average || user.rating}</Text>
                  </View>
                  <Text style={styles.statLabel}>{summary.count} vlerësime</Text>
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

            <View style={styles.reviewsSection}>
              <View style={styles.reviewsHeader}>
                <Text style={styles.reviewsTitle}>Vlerësimet ({summary.count})</Text>
                {!isOwnProfile && (
                  <Pressable style={styles.addReviewBtn} onPress={openReview} hitSlop={6}>
                    <Feather name="edit-3" size={14} color={Colors.primary} />
                    <Text style={styles.addReviewText}>Shkruaj vlerësim</Text>
                  </Pressable>
                )}
              </View>

              {reviews.length > 0 ? (
                reviews.map((r, idx) => (
                  <View key={r.id} style={[styles.reviewCard, idx === reviews.length - 1 && styles.reviewCardLast]}>
                    <View style={styles.reviewTop}>
                      <View style={styles.reviewAvatar}>
                        <Text style={styles.reviewAvatarText}>{r.reviewerName.charAt(0).toUpperCase()}</Text>
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
                ))
              ) : (
                <Text style={styles.noReviews}>
                  Ende pa vlerësime.{!isOwnProfile ? ' Bëhu i pari që e vlerëson!' : ''}
                </Text>
              )}
            </View>

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

      {/* Write-a-review modal */}
      <Modal visible={showReview} transparent animationType="fade" onRequestClose={() => setShowReview(false)}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <Pressable style={styles.modalOverlay} onPress={() => setShowReview(false)}>
            <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation && e.stopPropagation()}>
              <Text style={styles.modalTitle}>Vlerëso {user.name}</Text>
              <Text style={styles.modalSubtitle}>Sa i kënaqur ishe me këtë shitës?</Text>

              <View style={styles.starPicker}>
                {[1, 2, 3, 4, 5].map(i => (
                  <Pressable key={i} onPress={() => setRating(i)} hitSlop={6}>
                    <Ionicons
                      name={i <= rating ? 'star' : 'star-outline'}
                      size={38}
                      color={i <= rating ? Colors.warning : Colors.gray[300]}
                      style={{ marginHorizontal: 3 }}
                    />
                  </Pressable>
                ))}
              </View>

              <TextInput
                style={styles.commentInput}
                value={comment}
                onChangeText={setComment}
                placeholder="Shkruaj përvojën tënde (opsionale)…"
                placeholderTextColor={Colors.gray[400]}
                multiline
                maxLength={300}
                textAlignVertical="top"
              />

              <View style={styles.modalButtons}>
                <Pressable style={styles.modalCancel} onPress={() => setShowReview(false)}>
                  <Text style={styles.modalCancelText}>Anulo</Text>
                </Pressable>
                <Pressable style={styles.modalSubmit} onPress={submitReview}>
                  <Text style={styles.modalSubmitText}>Dërgo vlerësimin</Text>
                </Pressable>
              </View>
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>
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
    paddingBottom: 6,
    marginBottom: 12,
  },
  reviewsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  reviewsTitle: { fontSize: 17, fontWeight: '700', color: Colors.secondary },
  addReviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 20,
  },
  addReviewText: { fontSize: 12.5, fontWeight: '700', color: Colors.primary },
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
  noReviews: { fontSize: 13.5, color: Colors.gray[500], paddingVertical: 10, lineHeight: 19 },
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
  // review modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 26,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 16,
  },
  modalTitle: { fontSize: 19, fontWeight: '800', color: Colors.secondary, textAlign: 'center', letterSpacing: -0.3 },
  modalSubtitle: { fontSize: 13.5, color: Colors.gray[500], textAlign: 'center', marginTop: 5 },
  starPicker: { flexDirection: 'row', justifyContent: 'center', marginVertical: 18 },
  commentInput: {
    minHeight: 88,
    backgroundColor: Colors.gray[50],
    borderWidth: 1.5,
    borderColor: Colors.gray[200],
    borderRadius: 14,
    padding: 13,
    fontSize: 14.5,
    color: Colors.gray[900],
  },
  modalButtons: { flexDirection: 'row', gap: 10, marginTop: 16 },
  modalCancel: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelText: { fontSize: 15, fontWeight: '700', color: Colors.gray[700] },
  modalSubmit: {
    flex: 1.5,
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSubmitText: { fontSize: 15, fontWeight: '800', color: '#FFFFFF' },
});
