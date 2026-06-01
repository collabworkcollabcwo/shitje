import React, { useMemo } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Palette } from '../../constants/colors';
import { useColors } from '../../context/ThemeContext';
import { CATEGORIES } from '../../constants/categories';
import { useApp } from '../../context/AppContext';
import ListingCard from '../../components/ListingCard';

export default function CategoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getListingsByCategory } = useApp();
  const Colors = useColors();
  const styles = useMemo(() => createStyles(Colors), [Colors]);

  const category = CATEGORIES.find(c => c.id === id);
  const listings = getListingsByCategory(id || '');

  if (!category) {
    return (
      <View style={styles.notFound}>
        <Text>Kategoria nuk u gjet</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: category.name }} />
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={[styles.iconBg, { backgroundColor: category.color + '22' }]}>
            <Feather name={category.icon as any} size={28} color={category.color} />
          </View>
          <Text style={styles.title}>{category.name}</Text>
          <Text style={styles.count}>{listings.length} shpallje</Text>
        </View>

        <FlatList
          data={listings}
          keyExtractor={item => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => <ListingCard listing={item} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Feather name="inbox" size={48} color={Colors.gray[300]} />
              <Text style={styles.emptyTitle}>Asnjë shpallje</Text>
              <Text style={styles.emptyText}>Nuk ka shpallje në këtë kategori për momentin</Text>
            </View>
          }
        />
      </View>
    </>
  );
}

const createStyles = (Colors: Palette) => StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  iconBg: {
    width: 60,
    height: 60,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.secondary,
  },
  count: {
    fontSize: 13,
    color: Colors.gray[500],
    marginTop: 4,
  },
  row: { paddingHorizontal: 12, gap: 12 },
  list: { paddingTop: 12, paddingBottom: 20 },
  empty: {
    alignItems: 'center',
    paddingTop: 60,
    gap: 12,
  },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: Colors.gray[600] },
  emptyText: { fontSize: 14, color: Colors.gray[400], textAlign: 'center', paddingHorizontal: 40 },
});
