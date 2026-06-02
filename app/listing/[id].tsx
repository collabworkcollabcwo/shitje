import React, { useMemo } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, Pressable, Linking, Share } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Palette } from '../../constants/colors';
import { useColors } from '../../context/ThemeContext';
import { useApp } from '../../context/AppContext';
import { formatDate } from '../../utils/format';
import { useCurrency } from '../../context/CurrencyContext';
import HeartButton from '../../components/HeartButton';
import { CONDITION_LABELS, CATEGORIES } from '../../constants/categories';

export default function ListingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { listings, currentUser, getUserById } = useApp();
  const Colors = useColors();
  const { format } = useCurrency();
  const styles = useMemo(() => createStyles(Colors), [Colors]);

  const listing = listings.find(l => l.id === id);
  if (!listing) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Shpallja nuk u gjet</Text>
      </View>
    );
  }

  const seller = getUserById(listing.sellerId);
  const isOwner = listing.sellerId === currentUser.id;
  const category = CATEGORIES.find(c => c.id === listing.category);

  const handleShare = async () => {
    await Share.share({
      message: `${listing.title} - ${format(listing.price)} në Shitje\nhttps://shitje.al/listing/${listing.id}`,
    });
  };

  const handleCall = () => {
    if (seller?.phone) {
      Linking.openURL(`tel:${seller.phone}`);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: listing.images[0] }} style={styles.mainImage} />
          <View style={styles.imageOverlay} />
          {listing.isUrgent && (
            <View style={styles.urgentBadge}>
              <Text style={styles.badgeText}>URGJENT</Text>
            </View>
          )}
        </View>

        <View style={styles.content}>
          <View style={styles.priceRow}>
            <Text style={styles.price}>{format(listing.price)}</Text>
            <View style={styles.actions}>
              <HeartButton listingId={listing.id} size={20} style={styles.actionButton} unselectedColor={Colors.gray[600]} />
              <Pressable style={styles.actionButton} onPress={handleShare}>
                <Feather name="share-2" size={20} color={Colors.gray[600]} />
              </Pressable>
            </View>
          </View>

          <Text style={styles.title}>{listing.title}</Text>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Feather name="map-pin" size={14} color={Colors.gray[500]} />
              <Text style={styles.metaText}>{listing.location}</Text>
            </View>
            <View style={styles.metaItem}>
              <Feather name="clock" size={14} color={Colors.gray[500]} />
              <Text style={styles.metaText}>{formatDate(listing.createdAt)}</Text>
            </View>
            <View style={styles.metaItem}>
              <Feather name="eye" size={14} color={Colors.gray[500]} />
              <Text style={styles.metaText}>{listing.views} shikime</Text>
            </View>
          </View>

          <View style={styles.tagsRow}>
            {category && (
              <View style={[styles.tag, { backgroundColor: category.color + '15' }]}>
                <Text style={[styles.tagText, { color: category.color }]}>{category.name}</Text>
              </View>
            )}
            <View style={styles.tag}>
              <Text style={styles.tagText}>{CONDITION_LABELS[listing.condition]}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Përshkrimi</Text>
          <Text style={styles.description}>{listing.description}</Text>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Shitësi</Text>
          <Pressable
            style={styles.sellerCard}
            onPress={() => router.push(`/user/${listing.sellerId}`)}
          >
            <View style={styles.sellerAvatar}>
              <Feather name="user" size={24} color={Colors.white} />
            </View>
            <View style={styles.sellerInfo}>
              <Text style={styles.sellerName}>{listing.sellerName}</Text>
              {seller && (
                <View style={styles.sellerMeta}>
                  <View style={styles.ratingRow}>
                    <Feather name="star" size={13} color={Colors.warning} />
                    <Text style={styles.ratingText}>{seller.rating}</Text>
                    <Text style={styles.reviewCount}>({seller.reviewCount})</Text>
                  </View>
                  <Text style={styles.sellerLocation}>{seller.location}</Text>
                </View>
              )}
            </View>
            <Feather name="chevron-right" size={20} color={Colors.gray[400]} />
          </Pressable>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {!isOwner && (
        <View style={styles.bottomBar}>
          <Pressable style={styles.callButton} onPress={handleCall}>
            <Feather name="phone" size={20} color={Colors.primary} />
            <Text style={styles.callText}>Telefono</Text>
          </Pressable>
          <Pressable
            style={styles.messageButton}
            onPress={() => router.push(`/chat/chat_1`)}
          >
            <Feather name="message-circle" size={20} color={Colors.white} />
            <Text style={styles.messageText}>Shkruaj mesazh</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const createStyles = (Colors: Palette) => StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFoundText: { fontSize: 16, color: Colors.gray[500] },
  imageContainer: { position: 'relative' },
  mainImage: {
    width: '100%',
    aspectRatio: 4 / 3,
    resizeMode: 'cover',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: 'transparent',
  },
  urgentBadge: {
    position: 'absolute',
    top: 100,
    left: 16,
    backgroundColor: Colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  content: {
    padding: 16,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  price: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.primary,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    backgroundColor: Colors.gray[100],
    borderRadius: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.secondary,
    marginBottom: 12,
    lineHeight: 26,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    color: Colors.gray[500],
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
  tag: {
    backgroundColor: Colors.gray[100],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.gray[600],
  },
  divider: {
    height: 1,
    backgroundColor: Colors.gray[200],
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.secondary,
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    color: Colors.gray[700],
    lineHeight: 22,
  },
  sellerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray[50],
    padding: 14,
    borderRadius: 12,
    gap: 12,
  },
  sellerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sellerInfo: {
    flex: 1,
  },
  sellerName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.secondary,
  },
  sellerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.gray[700],
  },
  reviewCount: {
    fontSize: 12,
    color: Colors.gray[400],
  },
  sellerLocation: {
    fontSize: 13,
    color: Colors.gray[500],
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: 10,
    padding: 16,
    paddingBottom: 32,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 8,
  },
  callButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  callText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primary,
  },
  messageButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.primary,
  },
  messageText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.white,
  },
});
