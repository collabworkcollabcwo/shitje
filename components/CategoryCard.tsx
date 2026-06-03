import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Category } from '../types';
import { Palette } from '../constants/colors';
import { useColors } from '../context/ThemeContext';

interface Props {
  category: Category;
}

export default function CategoryCard({ category }: Props) {
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
    </Pressable>
  );
}

const createStyles = (Colors: Palette) => StyleSheet.create({
  card: {
    alignItems: 'center',
    width: 82,
    marginRight: 8,
  },
  cardPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.96 }],
  },
  iconContainer: {
    width: 62,
    height: 62,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    // soft coloured glow (converted to box-shadow on web)
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  name: {
    fontSize: 11.5,
    color: Colors.gray[700],
    textAlign: 'center',
    fontWeight: '600',
  },
});
