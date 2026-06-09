import React, { useMemo, useState, useRef } from 'react';
import { View, Image, StyleSheet, ScrollView, Text, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Palette } from '../constants/colors';
import { useColors } from '../context/ThemeContext';
import { useAppWidth } from '../constants/layout';

interface Props {
  images: string[];
  aspectRatio?: number;
}

/**
 * Swipeable, paged photo gallery with dot indicators and a "2/5" counter.
 * Falls back gracefully to a single static image when there's only one photo.
 */
export default function ImageCarousel({ images, aspectRatio = 4 / 3 }: Props) {
  const width = useAppWidth();
  const height = width / aspectRatio;
  const Colors = useColors();
  const styles = useMemo(() => createStyles(Colors), [Colors]);
  const [index, setIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / width);
    if (i !== index && i >= 0 && i < images.length) setIndex(i);
  };

  if (images.length <= 1) {
    return (
      <Image
        source={{ uri: images[0] }}
        style={{ width, height, backgroundColor: Colors.gray[200] }}
        resizeMode="cover"
      />
    );
  }

  return (
    <View style={{ width, height }}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        {images.map((uri, i) => (
          <Image
            key={i}
            source={{ uri }}
            style={{ width, height, backgroundColor: Colors.gray[200] }}
            resizeMode="cover"
          />
        ))}
      </ScrollView>

      <View style={styles.counter}>
        <Feather name="camera" size={11} color="#FFFFFF" />
        <Text style={styles.counterText}>{index + 1}/{images.length}</Text>
      </View>

      <View style={styles.dots}>
        {images.map((_, i) => (
          <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
        ))}
      </View>
    </View>
  );
}

const createStyles = (Colors: Palette) => StyleSheet.create({
  counter: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12,
  },
  counterText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  dots: {
    position: 'absolute',
    bottom: 14,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  dotActive: {
    backgroundColor: '#FFFFFF',
    width: 16,
  },
});
