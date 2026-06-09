import React, { useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Linking, Share } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Palette } from '../../constants/colors';
import { useColors } from '../../context/ThemeContext';
import { useApp } from '../../context/AppContext';
import { formatDate } from '../../utils/format';
import { useCurrency } from '../../context/CurrencyContext';
import { notify, confirmAction } from '../../utils/notify';
import HeartButton from '../../components/HeartButton';
import ImageCarousel from '../../components/ImageCarousel';
import ListingCard from '../../components/ListingCard';
import HScroll from '../../components/HScroll';
import { CONDITION_LABELS, CATEGORIES } from '../../constants/categories';

export default function ListingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const {
    listings, currentUser, getUserById, getSimilarListings,
    getOrCreateChat, registerView, toggleSold, deleteListing,
  } = useApp();
  const Colors = useColors();
  const { format } = useCurrency();
  const styles = useMemo(() => createStyles(Colors), [Colors]);

  const listing = listings.find(l => l.id === id);

  useEffect(() => {
    if (listing && listing.sellerId !== currentUser.id) {
      registerView(listing.id);
    }
  }, [listing?.id]);

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
  const similar = getSimilarListings(listing, 6);

  const handleShare = async () => {
    await Share.share({
      message: `${listing.title} - ${format(listing.price)} në Shitje\nhttps://shitje.al/listing/${listing.id}`,
    });
  };

  const handleCall = () => {
    if (seller?.phone) {
      Linking.openURL(`tel:${seller.phone.replace(/\s/g, '')}`);
    } else {
      notify('Pa numër', 'Ky shitës nuk ka publikuar numër telefoni.');
    }
  };

  const handleMessage = () => {
    const chatId = getOrCreateChat(listing);
    router.push(`/chat/${chatId}`);
  };

  const handleToggleSold = () => {
    if (listing.isSold) {
      toggleSold(listing.id);
      return;
    }
    confirmAction(
      'Shëno si të shitur',
      'Shpallja do të fshihet nga kërkimi dhe do të shfaqet si e shitur. Vazhdon?',
      () => toggleSold(listing.id),
      'Po, u shit'
    );
  };

  const handleDelete = () => {
    confirmAction(
      'Fshi shpalljen',
      'Ky veprim nuk kthehet mbrapsht. Je i sigurt?',
      () => {
        deleteListing(listing.id);
        router.back();
      },
      'Fshi'
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <ImageCarousel images={listing.images} />
          {listing.isSold && (
            <View style={styles.soldBadge}>
              <Text style={styles.badgeText}>E SHITUR</Text>
            </View>
          )}
          {!listing.isSold && listing.isUrgent && (
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
              <Pressable
                style={[styles.tag, { backgroundColor: category.color + '15' }]}
                onPress={() => router.push(`/category/${category.id}`)}
              >
                <Text style={[styles.tagText, { color: category.color }]}>{category.name}</Text>
              </Pressable>
            )}
            {listing.subcategory && (
              <View style={styles.tag}>
                <Text style={styles.tagText}>{listing.subcategory}</Text>
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
              <Text style={styles.sellerInitial}>{listing.sellerName.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={styles.sellerInfo}>
              <View style={styles.sellerNameRow}>
                <Text style={styles.sellerName}>{listing.sellerName}</Text>
                {seller && seller.rating >= 4.5 && (
                  <View style={styles.verifiedBadge}>
                    <Feather name="check" size={9} color={Colors.white} />
                  </View>
                )}
              </View>
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

          {isOwner && (
            <>
              <View style={styles.divider} />
              <Text style={styles.sectionTitle}>Menaxho shpalljen</Text>
              <View style={styles.ownerRow}>
                <Pressable
                  style={[styles.ownerButton, listing.isSold && styles.ownerButtonActive]}
                  onPress={handleToggleSold}
                >
                  <Feather
                    name={listing.isSold ? 'rotate-ccw' : 'check-circle'}
                    size={17}
                    color={listing.isSold ? Colors.white : Colors.success}
                  />
                  <Text style={[styles.ownerButtonText, { color: listing.isSold ? Colors.white : Colors.success }]}>
                    {listing.isSold ? 'Rikthe në shitje' : 'Shëno si të shitur'}
                  </Text>
                </Pressable>
                <Pressable style={styles.deleteButton} onPress={handleDelete}>
                  <Feather name="trash-2" size={17} color={Colors.error} />
                  <Text style={[styles.ownerButtonText, { color: Colors.error }]}>Fshi</Text>
                </Pressable>
              </View>
            </>
          )}
        </View>

        {similar.length > 0 && (
          <View style={styles.similarSection}>
            <Text style={[styles.sectionTitle, { paddingHorizontal: 16 }]}>Shpallje të ngjashme</Text>
            <HScroll contentContainerStyle={{ paddingHorizontal: 12, paddingTop: 4 }}>
              {similar.map(item => (
                <View key={item.id} style={{ marginRight: 12 }}>
                  <ListingCard listing={item} />
                </View>
              ))}
            </HScroll>
          </View>
        )}

        <View style={{ height: isOwner ? 24 : 100 }} />
      </ScrollView>

      {!isOwner && (
        <View style={styles.bottomBar}>
          <Pressable style={styles.callButton} onPress={handleCall}>
            <Feather name="phone" size={20} color={Colors.primary} />
            <Text style={styles.callText}>Telefono</Text>
          </Pressable>
          <Pressable style={styles.messageButton} onPress={handleMessage}>
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
  urgentBadge: {
    position: 'absolute',
    top: 100,
    left: 16,
    backgroundColor: Colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
  },
  soldBadge: {
    position: 'absolute',
    top: 100,
    left: 16,
    backgroundColor: Colors.gray[800],
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
    fontSize: 30,
    fontWeight: '900',
    color: Colors.primary,
    letterSpacing: -0.8,
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
    fontSize: 21,
    fontWeight: '700',
    color: Colors.secondary,
    letterSpacing: -0.4,
    marginBottom: 12,
    lineHeight: 27,
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
    flexWrap: 'wrap',
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
    fontSize: 17,
    fontWeight: '800',
    color: Colors.secondary,
    letterSpacing: -0.4,
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
    borderRadius: 18,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.gray[100],
  },
  sellerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sellerInitial: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.white,
  },
  sellerInfo: {
    flex: 1,
  },
  sellerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sellerName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.secondary,
  },
  verifiedBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.info,
    alignItems: 'center',
    justifyContent: 'center',
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
  ownerRow: {
    flexDirection: 'row',
    gap: 10,
  },
  ownerButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.success,
  },
  ownerButtonActive: {
    backgroundColor: Colors.success,
  },
  deleteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.error,
  },
  ownerButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  similarSection: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 8,
    borderTopColor: Colors.gray[100],
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
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    shadowColor: Colors.gray[900],
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 14,
  },
  callButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
    borderRadius: 16,
    backgroundColor: Colors.primaryLight,
  },
  callText: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.primary,
  },
  messageButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  messageText: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.white,
  },
});
