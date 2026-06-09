import React, { useMemo } from 'react';
import { View, TextInput, StyleSheet, Pressable, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Palette } from '../constants/colors';
import { useColors } from '../context/ThemeContext';

interface Props {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onFilterPress?: () => void;
  /** Number of active filters — shown as a small badge on the filter button. */
  filterCount?: number;
  onSubmitEditing?: () => void;
  autoFocus?: boolean;
}

export default function SearchBar({
  value, onChangeText, placeholder, onFilterPress, filterCount = 0, onSubmitEditing, autoFocus,
}: Props) {
  const Colors = useColors();
  const styles = useMemo(() => createStyles(Colors), [Colors]);

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <Feather name="search" size={18} color={Colors.gray[400]} />
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder || 'Kërko në Shitje...'}
          placeholderTextColor={Colors.gray[400]}
          autoFocus={autoFocus}
          returnKeyType="search"
          onSubmitEditing={onSubmitEditing}
        />
        {value.length > 0 && (
          <Pressable onPress={() => onChangeText('')} hitSlop={8}>
            <Feather name="x" size={18} color={Colors.gray[400]} />
          </Pressable>
        )}
      </View>
      {onFilterPress && (
        <Pressable style={styles.filterButton} onPress={onFilterPress}>
          <Feather name="sliders" size={18} color={Colors.white} />
          {filterCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{filterCount}</Text>
            </View>
          )}
        </Pressable>
      )}
    </View>
  );
}

const createStyles = (Colors: Palette) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: Colors.gray[900],
  },
  filterButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: Colors.accent,
    borderRadius: 9,
    minWidth: 17,
    height: 17,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: Colors.surface,
  },
  filterBadgeText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: '700',
  },
});
