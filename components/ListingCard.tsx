import React, { useMemo } from 'react';
import { View, Text, Image, StyleSheet, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Listing } from '../types';
import { Palette } from '../constants/colors';
import { useColors } from '../context/ThemeContext';
import { formatDate } from '../utils/format';
import { CONDITION_LABELS } from '../constants/categories';
import { useCurrency } from '../context/CurrencyContext';
import { useAppWidth } from '../constants/layout';
import HeartButton from './HeartButton';

interface Props {
  listing: Listing;
  fullWidth?: boolean;
}

export default function ListingCard({ listing, fullWidth }: Props) {
  const router = useRouter();
  const { format } = useCurrency();
  const appWidth = useAppWidth();
  const width = fullWidth ? appWidth - 24 : (appWidth - 36) / 2;
  const Colors = useColors();
  const styles = useMemo(() => createStyles(Colors), [Colors]);

  return (
    <Pressable
      style={[styles.card, { width }]}
      onPress={() => router.push(`/listing/${listing.id}`)}
    >
      <View style={styles.imageContainer}>
        <Image source={{ uri: listing.images[0] }} style={[styles.image, { width }]} />
        {listing.isSold && (
          <View style={styles.soldOverlay}>
            <View style={styles.soldBadge}>
              <Text style={styles.soldText}>E SHITUR</Text>
            </View>
          </View>
        )}
        {!listing.isSold && listing.isUrgent && (
          <View style={styles.urgentBadge}>
            <Text style={styles.urgentText}>URGJENT</Text>
          </View>
        )}
        {!listing.isSold && listing.isFeatured && !listing.isUrgent && (
          <View style={styles.featuredBadge}>
            <Text style={styles.featuredText}>TOP</Text>
          </View>
        )}
        {listing.images.length > 1 && (
          <View style={styles.photoCount}>
            <Feather name="camera" size={10} color="#FFFFFF" />
            <Text style={styles.photoCountText}>{listing.images.length}</Text>
          </View>
        )}
        <HeartButton listingId={listing.id} style={styles.favoriteButton} size={18} />
      </View>
      <View style={styles.info}>
        <View style={styles.priceRow}>
          <Text style={styles.price} numberOfLines={1}>{format(listing.price)}</Text>
          <Text style={styles.condition}>{CONDITION_LABELS[listing.condition]}</Text>
        </View>
        <Text style={styles.title} numberOfLines={2}>{listing.title}</Text>
        <View style={styles.meta}>
          <Feather name="map-pin" size={11} color={Colors.gray[500]} />
          <Text style={styles.location}>{listing.location}</Text>
          <Text style={styles.date}>{formatDate(listing.createdAt)}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const createStyles = (Colors: Palette) => StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    height: 150,
    resizeMode: 'cover',
    backgroundColor: Colors.gray[200],
  },
  urgentBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: Colors.accent,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  urgentText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: '700',
  },
  featuredBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  featuredText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: '700',
  },
  soldOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  soldBadge: {
    backgroundColor: Colors.gray[900],
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 6,
  },
  soldText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  photoCount: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  photoCountText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 20,
    padding: 6,
  },
  info: {
    padding: 10,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
    marginBottom: 2,
  },
  price: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primary,
    flexShrink: 1,
  },
  condition: {
    fontSize: 9.5,
    fontWeight: '700',
    color: Colors.gray[500],
    backgroundColor: Colors.gray[100],
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    overflow: 'hidden',
  },
  title: {
    fontSize: 13,
    color: Colors.gray[800],
    marginBottom: 6,
    lineHeight: 18,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  location: {
    fontSize: 11,
    color: Colors.gray[500],
    flex: 1,
  },
  date: {
    fontSize: 10,
    color: Colors.gray[400],
  },
});
