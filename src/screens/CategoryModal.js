import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { getCategories } from '../services/categoryService';

// Screen mapping shared with HomeScreen. Each backend category is routed to
// one of the existing category screens with its real slug + name.
const CATEGORY_PRESETS = [
  {
    keywords: ['electron', 'mobile', 'phone', 'gadget'],
    screen: 'Mobiles',
    icon: 'cellphone',
  },
  {
    keywords: ['cloth', 'fashion', 'apparel', 'wear'],
    screen: 'Fruits',
    icon: 'tshirt-crew',
  },
  {
    keywords: ['home', 'kitchen', 'grocery', 'food'],
    screen: 'Grocery',
    icon: 'cart',
  },
  {
    keywords: ['sport', 'fit', 'outdoor'],
    screen: 'ElectricalsModule',
    icon: 'dumbbell',
  },
];

function presetForCategory(category) {
  const haystack = `${category.name} ${category.slug}`.toLowerCase();
  return (
    CATEGORY_PRESETS.find((preset) =>
      preset.keywords.some((keyword) => haystack.includes(keyword))
    ) || CATEGORY_PRESETS[0]
  );
}

export default function CategoryModal({ navigation }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCategories()
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => {
        Alert.alert('Error', 'Unable to load categories.');
      })
      .finally(() => setLoading(false));
  }, []);

  const handlePress = (category) => {
    const preset = presetForCategory(category);
    navigation.replace(preset.screen, {
      slug: category.slug,
      title: category.name,
    });
  };

  if (loading) {
    return (
      <View style={styles.modalContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <View style={styles.modalContainer}>
      <Text style={styles.heading}>Shop by Category</Text>

      {categories.map((category) => {
        const preset = presetForCategory(category);

        return (
          <Pressable
            key={category.publicId}
            style={styles.button}
            onPress={() => handlePress(category)}
          >
            <Ionicons name={preset.icon} size={20} color="#2563EB" />
            <Text style={styles.text}>{category.name}</Text>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },

  heading: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 22,
  },

  button: {
    padding: 16,
    backgroundColor: '#F8FAFC',
    marginVertical: 8,
    borderRadius: 16,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  text: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 12,
    flex: 1,
  },
});
