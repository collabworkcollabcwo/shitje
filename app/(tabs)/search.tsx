import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Pressable, Modal, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Palette } from '../../constants/colors';
import { useColors } from '../../context/ThemeContext';
import { useCurrency } from '../../context/CurrencyContext';
import { CATEGORIES, ALBANIAN_CITIES, CONDITION_LABELS } from '../../constants/categories';
import { useApp } from '../../context/AppContext';
import { SearchFilters } from '../../types';
import ListingCard from '../../components/ListingCard';
import SearchBar from '../../components/SearchBar';
import HScroll from '../../components/HScroll';

const RECENT_KEY = 'shitje.recentSearches';
const MAX_RECENT = 8;

export default function SearchScreen() {
  const { searchQuery, setSearchQuery, filters, setFilters, getFilteredListings } = useApp();
  const [showFilters, setShowFilters] = useState(false);
  const [tempFilters, setTempFilters] = useState(filters);
  const [minPriceText, setMinPriceText] = useState('');
  const [maxPriceText, setMaxPriceText] = useState('');
  const [recent, setRecent] = useState<string[]>([]);
  const results = getFilteredListings();
  const Colors = useColors();
  const { currency, toALL } = useCurrency();
  const styles = useMemo(() => createStyles(Colors), [Colors]);

  const allPerUnit = toALL(1);
  const fromALL = (all: number) => Math.round(all / allPerUnit);

  useEffect(() => {
    AsyncStorage.getItem(RECENT_KEY)
      .then(v => { if (v) setRecent(JSON.parse(v)); })
      .catch(() => {});
  }, []);

  const saveRecent = (q: string) => {
    const query = q.trim();
    if (!query) return;
    setRecent(prev => {
      const next = [query, ...prev.filter(r => r.toLowerCase() !== query.toLowerCase())].slice(0, MAX_RECENT);
      AsyncStorage.setItem(RECENT_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  };

  const clearRecent = () => {
    setRecent([]);
    AsyncStorage.removeItem(RECENT_KEY).catch(() => {});
  };

  // Count active filters (sortBy doesn't count — it always has a value).
  const activeFilterCount =
    (filters.category ? 1 : 0) +
    (filters.location ? 1 : 0) +
    (filters.condition ? 1 : 0) +
    (filters.minPrice !== undefined || filters.maxPrice !== undefined ? 1 : 0);

  const openFilters = () => {
    setTempFilters(filters);
    setMinPriceText(filters.minPrice !== undefined ? String(fromALL(filters.minPrice)) : '');
    setMaxPriceText(filters.maxPrice !== undefined ? String(fromALL(filters.maxPrice)) : '');
    setShowFilters(true);
  };

  const applyFilters = () => {
    const min = minPriceText ? toALL(parseInt(minPriceText, 10)) : undefined;
    const max = maxPriceText ? toALL(parseInt(maxPriceText, 10)) : undefined;
    setFilters({ ...tempFilters, minPrice: min, maxPrice: max });
    setShowFilters(false);
  };

  const resetFilters = () => {
    const reset = { sortBy: 'newest' as const };
    setTempFilters(reset);
    setMinPriceText('');
    setMaxPriceText('');
    setFilters(reset);
    setShowFilters(false);
  };

  const removeFilter = (key: keyof SearchFilters | 'price') => {
    if (key === 'price') {
      setFilters({ ...filters, minPrice: undefined, maxPrice: undefined });
    } else {
      setFilters({ ...filters, [key]: undefined });
    }
  };

  const sortOptions = [
    { value: 'newest', label: 'Më të rejat' },
    { value: 'price_low', label: 'Çmimi: Ulët-Lart' },
    { value: 'price_high', label: 'Çmimi: Lart-Ulët' },
    { value: 'popular', label: 'Më popullore' },
  ] as const;

  // Human-readable chips for the filters currently applied.
  const activeChips: { key: keyof SearchFilters | 'price'; label: string }[] = [];
  if (filters.category) {
    const cat = CATEGORIES.find(c => c.id === filters.category);
    if (cat) activeChips.push({ key: 'category', label: cat.name });
  }
  if (filters.location) activeChips.push({ key: 'location', label: filters.location });
  if (filters.condition) activeChips.push({ key: 'condition', label: CONDITION_LABELS[filters.condition] || filters.condition });
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    const lo = filters.minPrice !== undefined ? fromALL(filters.minPrice) : null;
    const hi = filters.maxPrice !== undefined ? fromALL(filters.maxPrice) : null;
    const label = lo !== null && hi !== null
      ? `${lo}–${hi} ${currency}`
      : lo !== null ? `nga ${lo} ${currency}` : `deri ${hi} ${currency}`;
    activeChips.push({ key: 'price', label });
  }

  const showRecent = !searchQuery.trim() && recent.length > 0 && activeFilterCount === 0;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Kërko</Text>
      </View>

      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        onFilterPress={openFilters}
        filterCount={activeFilterCount}
        onSubmitEditing={() => saveRecent(searchQuery)}
        autoFocus
      />

      <View style={styles.sortRow}>
        <HScroll contentContainerStyle={styles.sortScroll}>
          {sortOptions.map(opt => (
            <Pressable
              key={opt.value}
              style={[styles.sortChip, filters.sortBy === opt.value && styles.sortChipActive]}
              onPress={() => setFilters({ ...filters, sortBy: opt.value })}
            >
              <Text style={[styles.sortChipText, filters.sortBy === opt.value && styles.sortChipTextActive]}>
                {opt.label}
              </Text>
            </Pressable>
          ))}
        </HScroll>
      </View>

      {activeChips.length > 0 && (
        <View style={styles.activeChipsRow}>
          <HScroll contentContainerStyle={styles.sortScroll}>
            {activeChips.map(chip => (
              <Pressable key={chip.key} style={styles.activeChip} onPress={() => removeFilter(chip.key)}>
                <Text style={styles.activeChipText}>{chip.label}</Text>
                <Feather name="x" size={13} color={Colors.primary} />
              </Pressable>
            ))}
            <Pressable style={styles.clearAllChip} onPress={resetFilters}>
              <Text style={styles.clearAllText}>Pastro të gjitha</Text>
            </Pressable>
          </HScroll>
        </View>
      )}

      {showRecent ? (
        <ScrollView keyboardShouldPersistTaps="handled">
          <View style={styles.recentHeader}>
            <Text style={styles.recentTitle}>Kërkimet e fundit</Text>
            <Pressable onPress={clearRecent} hitSlop={8}>
              <Text style={styles.recentClear}>Pastro</Text>
            </Pressable>
          </View>
          <View style={styles.recentList}>
            {recent.map(q => (
              <Pressable key={q} style={styles.recentItem} onPress={() => setSearchQuery(q)}>
                <Feather name="clock" size={15} color={Colors.gray[400]} />
                <Text style={styles.recentText}>{q}</Text>
                <Feather name="arrow-up-left" size={15} color={Colors.gray[400]} />
              </Pressable>
            ))}
          </View>
        </ScrollView>
      ) : (
        <>
          <Text style={styles.resultCount}>{results.length} shpallje</Text>
          <FlatList
            data={results}
            keyExtractor={item => item.id}
            numColumns={2}
            columnWrapperStyle={styles.row}
            contentContainerStyle={styles.list}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => <ListingCard listing={item} />}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Feather name="search" size={48} color={Colors.gray[300]} />
                <Text style={styles.emptyTitle}>Asnjë rezultat</Text>
                <Text style={styles.emptyText}>Provo të ndryshosh filtrat ose fjalën kyçe</Text>
                {activeFilterCount > 0 && (
                  <Pressable style={styles.emptyResetButton} onPress={resetFilters}>
                    <Text style={styles.emptyResetText}>Hiq filtrat</Text>
                  </Pressable>
                )}
              </View>
            }
          />
        </>
      )}

      <Modal visible={showFilters} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowFilters(false)}>
        <SafeAreaView style={styles.modalSafe}>
          <View style={styles.modalHeader}>
            <Pressable onPress={() => setShowFilters(false)} hitSlop={8}>
              <Feather name="x" size={24} color={Colors.secondary} />
            </Pressable>
            <Text style={styles.modalTitle}>Filtrat</Text>
            <Pressable onPress={resetFilters} hitSlop={8}>
              <Text style={styles.resetText}>Pastro</Text>
            </Pressable>
          </View>

          <ScrollView style={styles.modalContent} keyboardShouldPersistTaps="handled">
            <Text style={styles.filterLabel}>Çmimi ({currency})</Text>
            <View style={styles.priceRow}>
              <View style={styles.priceField}>
                <TextInput
                  style={styles.priceInput}
                  value={minPriceText}
                  onChangeText={t => setMinPriceText(t.replace(/[^0-9]/g, ''))}
                  placeholder="Nga"
                  placeholderTextColor={Colors.gray[400]}
                  keyboardType="numeric"
                />
              </View>
              <Text style={styles.priceDash}>—</Text>
              <View style={styles.priceField}>
                <TextInput
                  style={styles.priceInput}
                  value={maxPriceText}
                  onChangeText={t => setMaxPriceText(t.replace(/[^0-9]/g, ''))}
                  placeholder="Deri"
                  placeholderTextColor={Colors.gray[400]}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <Text style={styles.filterLabel}>Kategoria</Text>
            <View style={styles.chipGrid}>
              <Pressable
                style={[styles.chip, !tempFilters.category && styles.chipActive]}
                onPress={() => setTempFilters({ ...tempFilters, category: undefined })}
              >
                <Text style={[styles.chipText, !tempFilters.category && styles.chipTextActive]}>Të gjitha</Text>
              </Pressable>
              {CATEGORIES.map(cat => (
                <Pressable
                  key={cat.id}
                  style={[styles.chip, tempFilters.category === cat.id && styles.chipActive]}
                  onPress={() => setTempFilters({ ...tempFilters, category: cat.id })}
                >
                  <Text style={[styles.chipText, tempFilters.category === cat.id && styles.chipTextActive]}>
                    {cat.name}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.filterLabel}>Qyteti</Text>
            <View style={styles.chipGrid}>
              <Pressable
                style={[styles.chip, !tempFilters.location && styles.chipActive]}
                onPress={() => setTempFilters({ ...tempFilters, location: undefined })}
              >
                <Text style={[styles.chipText, !tempFilters.location && styles.chipTextActive]}>Kudo</Text>
              </Pressable>
              {ALBANIAN_CITIES.slice(0, 15).map(city => (
                <Pressable
                  key={city}
                  style={[styles.chip, tempFilters.location === city && styles.chipActive]}
                  onPress={() => setTempFilters({ ...tempFilters, location: city })}
                >
                  <Text style={[styles.chipText, tempFilters.location === city && styles.chipTextActive]}>
                    {city}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.filterLabel}>Gjendja</Text>
            <View style={styles.chipGrid}>
              <Pressable
                style={[styles.chip, !tempFilters.condition && styles.chipActive]}
                onPress={() => setTempFilters({ ...tempFilters, condition: undefined })}
              >
                <Text style={[styles.chipText, !tempFilters.condition && styles.chipTextActive]}>Të gjitha</Text>
              </Pressable>
              {Object.entries(CONDITION_LABELS).map(([key, label]) => (
                <Pressable
                  key={key}
                  style={[styles.chip, tempFilters.condition === key && styles.chipActive]}
                  onPress={() => setTempFilters({ ...tempFilters, condition: key })}
                >
                  <Text style={[styles.chipText, tempFilters.condition === key && styles.chipTextActive]}>
                    {label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <View style={{ height: 100 }} />
          </ScrollView>

          <View style={styles.modalFooter}>
            <Pressable style={styles.applyButton} onPress={applyFilters}>
              <Text style={styles.applyText}>Apliko filtrat</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const createStyles = (Colors: Palette) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: 16, paddingTop: 12, backgroundColor: Colors.surface },
  title: { fontSize: 26, fontWeight: '800', color: Colors.secondary, letterSpacing: -0.8 },
  sortRow: { paddingVertical: 4 },
  sortScroll: { paddingHorizontal: 12, gap: 8 },
  sortChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
  sortChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  sortChipText: { fontSize: 13, color: Colors.gray[600] },
  sortChipTextActive: { color: Colors.white, fontWeight: '600' },
  activeChipsRow: { paddingBottom: 4 },
  activeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: Colors.primaryLight,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  activeChipText: { fontSize: 13, color: Colors.primary, fontWeight: '600' },
  clearAllChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    justifyContent: 'center',
  },
  clearAllText: { fontSize: 13, color: Colors.gray[500], fontWeight: '600' },
  resultCount: {
    fontSize: 13,
    color: Colors.gray[500],
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  row: { paddingHorizontal: 12, gap: 12 },
  list: { paddingBottom: 20 },
  empty: {
    alignItems: 'center',
    paddingTop: 80,
    gap: 12,
  },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: Colors.gray[600] },
  emptyText: { fontSize: 14, color: Colors.gray[400] },
  emptyResetButton: {
    marginTop: 4,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.primaryLight,
  },
  emptyResetText: { fontSize: 14, color: Colors.primary, fontWeight: '700' },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 6,
  },
  recentTitle: { fontSize: 15, fontWeight: '700', color: Colors.secondary },
  recentClear: { fontSize: 13, color: Colors.primary, fontWeight: '600' },
  recentList: {
    backgroundColor: Colors.surface,
    marginHorizontal: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
  },
  recentText: { flex: 1, fontSize: 14, color: Colors.gray[700] },
  modalSafe: { flex: 1, backgroundColor: Colors.surface },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: Colors.secondary },
  resetText: { fontSize: 14, color: Colors.primary, fontWeight: '600' },
  modalContent: { flex: 1, padding: 16 },
  filterLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.secondary,
    marginBottom: 10,
    marginTop: 20,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  priceField: { flex: 1 },
  priceInput: {
    backgroundColor: Colors.gray[100],
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 15,
    color: Colors.gray[900],
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
  priceDash: { color: Colors.gray[400], fontSize: 15 },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.gray[100],
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
  chipActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  chipText: { fontSize: 13, color: Colors.gray[700] },
  chipTextActive: { color: Colors.primary, fontWeight: '600' },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
  },
  applyButton: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  applyText: { color: Colors.white, fontSize: 16, fontWeight: '800' },
});
