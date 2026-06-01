import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
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
      style={styles.card}
      onPress={() => router.push(`/category/${category.id}`)}
    >
      <View style={[styles.iconContainer, { backgroundColor: category.color + '22' }]}>
        <Feather name={category.icon as any} size={22} color={category.color} />
      </View>
      <Text style={styles.name} numberOfLines={1}>{category.name}</Text>
    </Pressable>
  );
}

const createStyles = (Colors: Palette) => StyleSheet.create({
  card: {
    alignItems: 'center',
    width: 78,
    marginRight: 6,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  name: {
    fontSize: 11,
    color: Colors.gray[700],
    textAlign: 'center',
    fontWeight: '500',
  },
});
