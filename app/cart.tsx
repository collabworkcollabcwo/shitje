import React, { useMemo } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Palette } from '../constants/colors';
import { useColors } from '../context/ThemeContext';
import { useCurrency } from '../context/CurrencyContext';
import { useApp } from '../context/AppContext';
import ListingCard from '../components/ListingCard';

export default function CartScreen() {
  const Colors = useColors();
  const styles = useMemo(() => createStyles(Colors), [Colors]);
  const { listings, favorites } = useApp();
  const { format } = useCurrency();

  const items = listings.filter(l => favorites.includes(l.id));
  const total = items.reduce((sum, l) => sum + l.price, 0);

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
            <View style={styles.summary}>
              <View>
                <Text style={styles.summaryCount}>{items.length} artikuj</Text>
                <Text style={styles.summaryLabel}>në shportën tënde</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.summaryTotal}>{format(total)}</Text>
                <Text style={styles.summaryLabel}>vlera totale</Text>
              </View>
            </View>
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
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 12,
    marginTop: 12,
    marginBottom: 14,
    padding: 16,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    shadowColor: Colors.gray[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
  },
  summaryCount: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.secondary,
    letterSpacing: -0.4,
  },
  summaryTotal: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: -0.4,
  },
  summaryLabel: {
    fontSize: 12,
    color: Colors.gray[500],
    marginTop: 1,
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
