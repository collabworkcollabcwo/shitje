import React, { useRef } from 'react';
import { Animated, Easing, Platform, Pressable, StyleProp, ViewStyle, GestureResponderEvent } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { useColors } from '../context/ThemeContext';

// react-native-web doesn't support the native animation driver.
const USE_NATIVE = Platform.OS !== 'web';

interface Props {
  listingId: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
  /** Outline colour when not favourited (defaults to white, for use over photos). */
  unselectedColor?: string;
}

/**
 * Favourite button: an outline heart that fills red and "pops" with a spring
 * bounce when liked — and gently scales back when un-liked.
 */
export default function HeartButton({ listingId, size = 18, style, unselectedColor }: Props) {
  const Colors = useColors();
  const { favorites, toggleFavorite } = useApp();
  const isFavorite = favorites.includes(listingId);
  const scale = useRef(new Animated.Value(1)).current;

  const handlePress = (e: GestureResponderEvent) => {
    e.stopPropagation?.();
    const willLike = !isFavorite;
    toggleFavorite(listingId);
    scale.stopAnimation();
    if (willLike) {
      // pop up past full size, then spring back with a little bounce
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.4,
          duration: 130,
          easing: Easing.out(Easing.quad),
          useNativeDriver: USE_NATIVE,
        }),
        Animated.spring(scale, {
          toValue: 1,
          friction: 3,
          tension: 130,
          useNativeDriver: USE_NATIVE,
        }),
      ]).start();
    } else {
      Animated.timing(scale, { toValue: 1, duration: 100, useNativeDriver: USE_NATIVE }).start();
    }
  };

  return (
    <Pressable style={style} onPress={handlePress} hitSlop={8}>
      <Animated.View style={{ transform: [{ scale }] }}>
        <Ionicons
          name={isFavorite ? 'heart' : 'heart-outline'}
          size={size}
          color={isFavorite ? Colors.accent : unselectedColor || Colors.white}
        />
      </Animated.View>
    </Pressable>
  );
}
