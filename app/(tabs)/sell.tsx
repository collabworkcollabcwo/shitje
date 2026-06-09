import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Pressable, Image, Switch, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { Palette } from '../../constants/colors';
import { useColors } from '../../context/ThemeContext';
import { useCurrency } from '../../context/CurrencyContext';
import { CATEGORIES, ALBANIAN_CITIES, CONDITION_LABELS } from '../../constants/categories';
import { useApp } from '../../context/AppContext';
import { formatPrice } from '../../utils/format';
import HScroll from '../../components/HScroll';
import { notify } from '../../utils/notify';

type FieldErrors = Partial<Record<'title' | 'price' | 'category' | 'condition' | 'location', string>>;

export default function SellScreen() {
  const router = useRouter();
  const { addListing } = useApp();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [condition, setCondition] = useState('');
  const [location, setLocation] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [errors, setErrors] = useState<FieldErrors>({});
  const { currency, toALL } = useCurrency();
  const Colors = useColors();
  const styles = useMemo(() => createStyles(Colors), [Colors]);

  const clearError = (field: keyof FieldErrors) =>
    setErrors(prev => (prev[field] ? { ...prev, [field]: undefined } : prev));

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

  const priceValue = price ? parseInt(price, 10) : 0;
  const priceInALL = priceValue > 0 ? toALL(priceValue) : 0;

  const handleSubmit = () => {
    const next: FieldErrors = {};
    if (!title.trim()) next.title = 'Shkruaj një titull për shpalljen';
    else if (title.trim().length < 5) next.title = 'Titulli duhet të ketë të paktën 5 shkronja';
    if (!price || priceValue <= 0) next.price = 'Vendos një çmim të vlefshëm';
    if (!category) next.category = 'Zgjidh një kategori';
    if (!condition) next.condition = 'Zgjidh gjendjen e artikullit';
    if (!location) next.location = 'Zgjidh qytetin';

    if (Object.keys(next).length > 0) {
      setErrors(next);
      notify('Plotëso formularin', Object.values(next)[0]);
      return;
    }
    setErrors({});

    const newId = addListing({
      title: title.trim(),
      description: description.trim(),
      price: priceInALL,
      currency: 'ALL',
      images: images.length > 0 ? images : ['https://picsum.photos/seed/new/400/400'],
      category,
      condition: condition as any,
      location,
      isUrgent,
    });

    notify('Sukses!', 'Shpallja juaj u publikua me sukses.', () => {
      setTitle('');
      setDescription('');
      setPrice('');
      setCategory('');
      setCondition('');
      setLocation('');
      setIsUrgent(false);
      setImages([]);
      router.push(`/listing/${newId}`);
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Shpallje e Re</Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={80}
      >
        <ScrollView style={styles.form} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
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
                {index === 0 && (
                  <View style={styles.coverBadge}>
                    <Text style={styles.coverBadgeText}>Kryesore</Text>
                  </View>
                )}
                <Pressable style={styles.removeImage} onPress={() => removeImage(index)}>
                  <Feather name="x" size={14} color={Colors.white} />
                </Pressable>
              </View>
            ))}
          </HScroll>

          <View style={styles.labelRow}>
            <Text style={styles.label}>Titulli *</Text>
            <Text style={styles.charCount}>{title.length}/100</Text>
          </View>
          <TextInput
            style={[styles.input, errors.title && styles.inputError]}
            value={title}
            onChangeText={t => { setTitle(t); clearError('title'); }}
            placeholder="p.sh. iPhone 15 Pro Max 256GB"
            placeholderTextColor={Colors.gray[400]}
            maxLength={100}
          />
          {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}

          <Text style={styles.label}>Çmimi ({currency}) *</Text>
          <View style={styles.priceInput}>
            <TextInput
              style={[styles.input, { flex: 1 }, errors.price && styles.inputError]}
              value={price}
              onChangeText={(t) => { setPrice(t.replace(/[^0-9]/g, '')); clearError('price'); }}
              placeholder="0"
              placeholderTextColor={Colors.gray[400]}
              keyboardType="numeric"
            />
            <Text style={styles.currency}>{currency}</Text>
          </View>
          {errors.price && <Text style={styles.errorText}>{errors.price}</Text>}
          {currency !== 'ALL' && priceInALL > 0 && (
            <Text style={styles.priceHint}>≈ {formatPrice(priceInALL)}</Text>
          )}

          <Text style={styles.label}>Kategoria *</Text>
          <View style={styles.chipGrid}>
            {CATEGORIES.map(cat => (
              <Pressable
                key={cat.id}
                style={[styles.chip, category === cat.id && styles.chipActive, errors.category && styles.chipError]}
                onPress={() => { setCategory(cat.id); clearError('category'); }}
              >
                <MaterialCommunityIcons name={cat.icon as any} size={16} color={category === cat.id ? Colors.primary : Colors.gray[600]} />
                <Text style={[styles.chipText, category === cat.id && styles.chipTextActive]}>
                  {cat.name}
                </Text>
              </Pressable>
            ))}
          </View>
          {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}

          <Text style={styles.label}>Gjendja *</Text>
          <View style={styles.chipGrid}>
            {Object.entries(CONDITION_LABELS).map(([key, label]) => (
              <Pressable
                key={key}
                style={[styles.chip, condition === key && styles.chipActive, errors.condition && styles.chipError]}
                onPress={() => { setCondition(key); clearError('condition'); }}
              >
                <Text style={[styles.chipText, condition === key && styles.chipTextActive]}>
                  {label}
                </Text>
              </Pressable>
            ))}
          </View>
          {errors.condition && <Text style={styles.errorText}>{errors.condition}</Text>}

          <Text style={styles.label}>Vendndodhja *</Text>
          <View style={styles.chipGrid}>
            {ALBANIAN_CITIES.slice(0, 15).map(city => (
              <Pressable
                key={city}
                style={[styles.chip, location === city && styles.chipActive, errors.location && styles.chipError]}
                onPress={() => { setLocation(city); clearError('location'); }}
              >
                <Text style={[styles.chipText, location === city && styles.chipTextActive]}>
                  {city}
                </Text>
              </Pressable>
            ))}
          </View>
          {errors.location && <Text style={styles.errorText}>{errors.location}</Text>}

          <View style={styles.labelRow}>
            <Text style={styles.label}>Përshkrimi</Text>
            <Text style={styles.charCount}>{description.length}/1000</Text>
          </View>
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

          <View style={styles.urgentRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.urgentTitle}>Shpallje urgjente</Text>
              <Text style={styles.urgentHint}>Merr etiketën "URGJENT" dhe bie më shumë në sy</Text>
            </View>
            <Switch
              value={isUrgent}
              onValueChange={setIsUrgent}
              trackColor={{ false: Colors.gray[300], true: Colors.primary }}
              thumbColor={Colors.white}
            />
          </View>

          <Pressable style={styles.submitButton} onPress={handleSubmit}>
            <Feather name="check-circle" size={20} color={Colors.white} />
            <Text style={styles.submitText}>Publiko Shpalljen</Text>
          </Pressable>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
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
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  charCount: {
    fontSize: 11,
    color: Colors.gray[400],
    marginBottom: 8,
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
  inputError: {
    borderColor: Colors.error,
  },
  errorText: {
    fontSize: 12,
    color: Colors.error,
    marginTop: 5,
  },
  priceHint: {
    fontSize: 12,
    color: Colors.gray[500],
    marginTop: 5,
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
  coverBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  coverBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
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
  chipError: {
    borderColor: Colors.error,
  },
  chipText: { fontSize: 13, color: Colors.gray[700] },
  chipTextActive: { color: Colors.primary, fontWeight: '600' },
  urgentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    marginTop: 20,
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
  urgentTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.secondary,
  },
  urgentHint: {
    fontSize: 12,
    color: Colors.gray[500],
    marginTop: 2,
  },
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
