import React, { useMemo } from 'react';
import { View, Text, Image, StyleSheet, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Listing } from '../types';
import { Palette } from '../constants/colors';
import { useColors } from '../context/ThemeContext';
import { formatDate } from '../utils/format';
import { useApp } from '../context/AppContext';
import { useCurrency } from '../context/CurrencyContext';
import { useAppWidth } from '../constants/layout';

interface Props {
  listing: Listing;
  fullWidth?: boolean;
}

export default function ListingCard({ listing, fullWidth }: Props) {
  const router = useRouter();
  const { favorites, toggleFavorite } = useApp();
  const { format } = useCurrency();
  const isFavorite = favorites.includes(listing.id);
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
        {listing.isUrgent && (
          <View style={styles.urgentBadge}>
            <Text style={styles.urgentText}>URGJENT</Text>
          </View>
        )}
        {listing.isFeatured && !listing.isUrgent && (
          <View style={styles.featuredBadge}>
            <Text style={styles.featuredText}>TOP</Text>
          </View>
        )}
        <Pressable
          style={styles.favoriteButton}
          onPress={(e) => {
            e.stopPropagation?.();
            toggleFavorite(listing.id);
          }}
        >
          <Feather
            name="heart"
            size={18}
            color={isFavorite ? Colors.accent : Colors.white}
          />
        </Pressable>
      </View>
      <View style={styles.info}>
        <Text style={styles.price}>{format(listing.price)}</Text>
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
  price: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 2,
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
