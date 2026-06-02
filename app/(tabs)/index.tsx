import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Palette } from '../../constants/colors';
import { useTheme } from '../../context/ThemeContext';
import { useCurrency } from '../../context/CurrencyContext';
import { CURRENCIES } from '../../constants/currencies';
import { CATEGORIES } from '../../constants/categories';
import { useApp } from '../../context/AppContext';
import ListingCard from '../../components/ListingCard';
import CategoryCard from '../../components/CategoryCard';
import SearchBar from '../../components/SearchBar';
import HScroll from '../../components/HScroll';
import { notify } from '../../utils/notify';

export default function HomeScreen() {
  const router = useRouter();
  const { listings, searchQuery, setSearchQuery } = useApp();
  const { colors: Colors, isDark, toggleTheme } = useTheme();
  const { currency, setCurrency } = useCurrency();
  const [showCurrency, setShowCurrency] = useState(false);
  const styles = useMemo(() => createStyles(Colors), [Colors]);

  const featuredListings = listings.filter(l => l.isFeatured);
  const recentListings = listings
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.logo}>Shitje</Text>
          <Text style={styles.tagline}>Tregu i Shqipërisë</Text>
        </View>
        <View style={styles.headerActions}>
          <Pressable style={styles.currencyChip} onPress={() => setShowCurrency(true)} hitSlop={8}>
            <Text style={styles.currencyChipText}>{currency}</Text>
          </Pressable>
          <Pressable style={styles.iconButton} onPress={toggleTheme} hitSlop={8}>
            <Feather name={isDark ? 'sun' : 'moon'} size={22} color={Colors.secondary} />
          </Pressable>
          <Pressable
            style={styles.notifButton}
            onPress={() => notify('Njoftime', 'S’ke njoftime të reja për momentin.')}
          >
            <Feather name="bell" size={22} color={Colors.secondary} />
            <View style={styles.notifDot} />
          </Pressable>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <SearchBar
          value={searchQuery}
          onChangeText={(text) => {
            setSearchQuery(text);
            if (text.length > 0) router.push('/(tabs)/search');
          }}
          placeholder="Çfarë po kërkon sot?"
        />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Kategoritë</Text>
          <HScroll contentContainerStyle={styles.categoriesRow}>
            {CATEGORIES.map(cat => (
              <CategoryCard key={cat.id} category={cat} />
            ))}
          </HScroll>
        </View>

        {featuredListings.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Te veçanta</Text>
              <Feather name="star" size={16} color={Colors.primary} />
            </View>
            <HScroll contentContainerStyle={{ paddingHorizontal: 12 }}>
              {featuredListings.map(item => (
                <View key={item.id} style={{ marginRight: 12 }}>
                  <ListingCard listing={item} />
                </View>
              ))}
            </HScroll>
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Shpalljet e fundit</Text>
            <Pressable onPress={() => router.push('/(tabs)/search')}>
              <Text style={styles.seeAll}>Shiko të gjitha</Text>
            </Pressable>
          </View>
          <View style={styles.grid}>
            {recentListings.map(listing => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </View>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      <Modal visible={showCurrency} transparent animationType="fade" onRequestClose={() => setShowCurrency(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowCurrency(false)}>
          <Pressable style={styles.currencySheet} onPress={(e) => e.stopPropagation && e.stopPropagation()}>
            <Text style={styles.currencyTitle}>Zgjidh monedhën</Text>
            {CURRENCIES.map(c => (
              <Pressable
                key={c.code}
                style={[styles.currencyOption, currency === c.code && styles.currencyOptionActive]}
                onPress={() => { setCurrency(c.code); setShowCurrency(false); }}
              >
                <Text style={styles.currencySymbol}>{c.symbol === 'Lekë' ? 'L' : c.symbol}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.currencyName}>{c.name}</Text>
                  <Text style={styles.currencyCode}>{c.code}</Text>
                </View>
                {currency === c.code && <Feather name="check" size={18} color={Colors.primary} />}
              </Pressable>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const createStyles = (Colors: Palette) => StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
    backgroundColor: Colors.surface,
  },
  logo: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 12,
    color: Colors.gray[500],
    marginTop: -2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
  },
  currencyChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.gray[300],
    marginRight: 2,
  },
  currencyChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.secondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  currencySheet: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
  },
  currencyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.secondary,
    marginBottom: 8,
  },
  currencyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  currencyOptionActive: {
    backgroundColor: Colors.primaryLight,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.secondary,
    width: 28,
    textAlign: 'center',
  },
  currencyName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.gray[800],
  },
  currencyCode: {
    fontSize: 12,
    color: Colors.gray[500],
  },
  notifButton: {
    position: 'relative',
    padding: 8,
  },
  notifDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.accent,
  },
  section: {
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.secondary,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  seeAll: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  categoriesRow: {
    paddingHorizontal: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    gap: 12,
  },
});
