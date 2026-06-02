import React, { useMemo } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Palette } from '../constants/colors';
import { useColors } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import ListingCard from '../components/ListingCard';

export default function CartScreen() {
  const Colors = useColors();
  const styles = useMemo(() => createStyles(Colors), [Colors]);
  const { listings, favorites } = useApp();

  const items = listings.filter(l => favorites.includes(l.id));

  return (
    <View style={styles.container}>
      {items.length > 0 ? (
        <FlatList
          data={items}
          keyExtractor={item => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <Text style={styles.count}>{items.length} artikuj në shportë</Text>
          }
          renderItem={({ item }) => <ListingCard listing={item} />}
        />
      ) : (
        <View style={styles.empty}>
          <Feather name="shopping-bag" size={56} color={Colors.gray[300]} />
          <Text style={styles.emptyTitle}>Shporta është bosh</Text>
          <Text style={styles.emptyText}>
            Shto artikuj duke prekur zemrën ♥ në shpalljet që të pëlqejnë.
          </Text>
        </View>
      )}
    </View>
  );
}

const createStyles = (Colors: Palette) => StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  count: {
    fontSize: 13,
    color: Colors.gray[500],
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  row: { paddingHorizontal: 12, gap: 12 },
  list: { paddingBottom: 20 },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 12,
  },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: Colors.gray[600] },
  emptyText: {
    fontSize: 14,
    color: Colors.gray[500],
    textAlign: 'center',
    lineHeight: 20,
  },
});
