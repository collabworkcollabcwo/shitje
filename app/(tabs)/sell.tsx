import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Pressable, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { Palette } from '../../constants/colors';
import { useColors } from '../../context/ThemeContext';
import { useCurrency } from '../../context/CurrencyContext';
import { CATEGORIES, ALBANIAN_CITIES, CONDITION_LABELS } from '../../constants/categories';
import { useApp } from '../../context/AppContext';
import HScroll from '../../components/HScroll';
import { notify } from '../../utils/notify';

export default function SellScreen() {
  const router = useRouter();
  const { addListing } = useApp();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [condition, setCondition] = useState('');
  const [location, setLocation] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const { currency, toALL } = useCurrency();
  const Colors = useColors();
  const styles = useMemo(() => createStyles(Colors), [Colors]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 8,
    });

    if (!result.canceled) {
      setImages(prev => [...prev, ...result.assets.map(a => a.uri)].slice(0, 8));
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!title || !price || !category || !condition || !location) {
      notify('Gabim', 'Ju lutem plotësoni të gjitha fushat e detyrueshme.');
      return;
    }

    addListing({
      title,
      description,
      price: toALL(parseInt(price, 10)),
      currency: 'ALL',
      images: images.length > 0 ? images : ['https://picsum.photos/seed/new/400/400'],
      category,
      condition: condition as any,
      location,
    });

    notify('Sukses!', 'Shpallja juaj u publikua me sukses.', () => {
      setTitle('');
      setDescription('');
      setPrice('');
      setCategory('');
      setCondition('');
      setLocation('');
      setImages([]);
      router.push('/(tabs)');
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Shpallje e Re</Text>
      </View>

      <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
        <Text style={styles.label}>Fotot</Text>
        <HScroll style={styles.imageRow}>
          <Pressable style={styles.addImageButton} onPress={pickImage}>
            <Feather name="camera" size={28} color={Colors.primary} />
            <Text style={styles.addImageText}>Shto foto</Text>
            <Text style={styles.imageCount}>{images.length}/8</Text>
          </Pressable>
          {images.map((uri, index) => (
            <View key={index} style={styles.imagePreview}>
              <Image source={{ uri }} style={styles.previewImage} />
              <Pressable style={styles.removeImage} onPress={() => removeImage(index)}>
                <Feather name="x" size={14} color={Colors.white} />
              </Pressable>
            </View>
          ))}
        </HScroll>

        <Text style={styles.label}>Titulli *</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="p.sh. iPhone 15 Pro Max 256GB"
          placeholderTextColor={Colors.gray[400]}
          maxLength={100}
        />

        <Text style={styles.label}>Çmimi ({currency}) *</Text>
        <View style={styles.priceInput}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            value={price}
            onChangeText={(t) => setPrice(t.replace(/[^0-9]/g, ''))}
            placeholder="0"
            placeholderTextColor={Colors.gray[400]}
            keyboardType="numeric"
          />
          <Text style={styles.currency}>{currency}</Text>
        </View>

        <Text style={styles.label}>Kategoria *</Text>
        <View style={styles.chipGrid}>
          {CATEGORIES.map(cat => (
            <Pressable
              key={cat.id}
              style={[styles.chip, category === cat.id && styles.chipActive]}
              onPress={() => setCategory(cat.id)}
            >
              <MaterialCommunityIcons name={cat.icon as any} size={16} color={category === cat.id ? Colors.primary : Colors.gray[600]} />
              <Text style={[styles.chipText, category === cat.id && styles.chipTextActive]}>
                {cat.name}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>Gjendja *</Text>
        <View style={styles.chipGrid}>
          {Object.entries(CONDITION_LABELS).map(([key, label]) => (
            <Pressable
              key={key}
              style={[styles.chip, condition === key && styles.chipActive]}
              onPress={() => setCondition(key)}
            >
              <Text style={[styles.chipText, condition === key && styles.chipTextActive]}>
                {label}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>Vendndodhja *</Text>
        <View style={styles.chipGrid}>
          {ALBANIAN_CITIES.slice(0, 15).map(city => (
            <Pressable
              key={city}
              style={[styles.chip, location === city && styles.chipActive]}
              onPress={() => setLocation(city)}
            >
              <Text style={[styles.chipText, location === city && styles.chipTextActive]}>
                {city}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>Përshkrimi</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Përshkruani artikullin tuaj në detaje..."
          placeholderTextColor={Colors.gray[400]}
          multiline
          numberOfLines={5}
          textAlignVertical="top"
          maxLength={1000}
        />

        <Pressable style={styles.submitButton} onPress={handleSubmit}>
          <Feather name="check-circle" size={20} color={Colors.white} />
          <Text style={styles.submitText}>Publiko Shpalljen</Text>
        </Pressable>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (Colors: Palette) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: Colors.surface,
  },
  title: { fontSize: 24, fontWeight: '700', color: Colors.secondary },
  form: { flex: 1, padding: 16 },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.secondary,
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.gray[900],
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
  textArea: {
    height: 120,
    paddingTop: 12,
  },
  priceInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  currency: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.gray[600],
  },
  imageRow: {
    flexDirection: 'row',
  },
  addImageButton: {
    width: 100,
    height: 100,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    backgroundColor: Colors.primaryLight,
  },
  addImageText: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: '600',
    marginTop: 4,
  },
  imageCount: {
    fontSize: 10,
    color: Colors.gray[400],
    marginTop: 2,
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 12,
    marginRight: 10,
    position: 'relative',
  },
  previewImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
  },
  removeImage: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 10,
    padding: 3,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
  chipActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  chipText: { fontSize: 13, color: Colors.gray[700] },
  chipTextActive: { color: Colors.primary, fontWeight: '600' },
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 24,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
});
