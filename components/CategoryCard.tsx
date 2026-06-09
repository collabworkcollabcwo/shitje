import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Category } from '../types';
import { Palette } from '../constants/colors';
import { useColors } from '../context/ThemeContext';

interface Props {
  category: Category;
  /** Number of active listings — shown as a tiny label under the name. */
  count?: number;
}

export default function CategoryCard({ category, count }: Props) {
  const router = useRouter();
  const Colors = useColors();
  const styles = useMemo(() => createStyles(Colors), [Colors]);

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={() => router.push(`/category/${category.id}`)}
    >
      <View style={[styles.iconContainer, { backgroundColor: category.color, shadowColor: category.color }]}>
        <MaterialCommunityIcons name={category.icon as any} size={28} color="#FFFFFF" />
      </View>
      <Text style={styles.name} numberOfLines={1}>{category.name}</Text>
      {count !== undefined && count > 0 && (
        <Text style={styles.count}>{count} shpallje</Text>
      )}
    </Pressable>
  );
}

const createStyles = (Colors: Palette) => StyleSheet.create({
  card: {
    alignItems: 'center',
    width: 84,
    marginRight: 8,
  },
  cardPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.94 }],
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 9,
    // soft coloured glow (converted to box-shadow on web)
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 7,
  },
  name: {
    fontSize: 11.5,
    color: Colors.gray[700],
    textAlign: 'center',
    fontWeight: '700',
    letterSpacing: -0.1,
  },
  count: {
    fontSize: 10,
    color: Colors.gray[400],
    fontWeight: '600',
    marginTop: 1,
  },
});
