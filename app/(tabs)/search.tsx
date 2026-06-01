import React, { useState, useMemo } from 'react';
import { View, Text, FlatList, StyleSheet, Pressable, Modal, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Palette } from '../../constants/colors';
import { useColors } from '../../context/ThemeContext';
import { CATEGORIES, ALBANIAN_CITIES, CONDITION_LABELS } from '../../constants/categories';
import { useApp } from '../../context/AppContext';
import ListingCard from '../../components/ListingCard';
import SearchBar from '../../components/SearchBar';
import HScroll from '../../components/HScroll';

export default function SearchScreen() {
  const { searchQuery, setSearchQuery, filters, setFilters, getFilteredListings } = useApp();
  const [showFilters, setShowFilters] = useState(false);
  const [tempFilters, setTempFilters] = useState(filters);
  const results = getFilteredListings();
  const Colors = useColors();
  const styles = useMemo(() => createStyles(Colors), [Colors]);

  const applyFilters = () => {
    setFilters(tempFilters);
    setShowFilters(false);
  };

  const resetFilters = () => {
    const reset = { sortBy: 'newest' as const };
    setTempFilters(reset);
    setFilters(reset);
    setShowFilters(false);
  };

  const sortOptions = [
    { value: 'newest', label: 'Më të rejat' },
    { value: 'price_low', label: 'Çmimi: Ulët-Lart' },
    { value: 'price_high', label: 'Çmimi: Lart-Ulët' },
    { value: 'popular', label: 'Më popullore' },
  ] as const;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Kërko</Text>
      </View>

      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        onFilterPress={() => {
          setTempFilters(filters);
          setShowFilters(true);
        }}
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

      <Text style={styles.resultCount}>{results.length} shpallje</Text>

      <FlatList
        data={results}
        keyExtractor={item => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => <ListingCard listing={item} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="search" size={48} color={Colors.gray[300]} />
            <Text style={styles.emptyTitle}>Asnjë rezultat</Text>
            <Text style={styles.emptyText}>Provo të ndryshosh filtrat ose fjalën kyçe</Text>
          </View>
        }
      />

      <Modal visible={showFilters} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalSafe}>
          <View style={styles.modalHeader}>
            <Pressable onPress={() => setShowFilters(false)}>
              <Feather name="x" size={24} color={Colors.secondary} />
            </Pressable>
            <Text style={styles.modalTitle}>Filtrat</Text>
            <Pressable onPress={resetFilters}>
              <Text style={styles.resetText}>Pastro</Text>
            </Pressable>
          </View>

          <ScrollView style={styles.modalContent}>
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
  title: { fontSize: 24, fontWeight: '700', color: Colors.secondary },
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
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  applyText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
});
