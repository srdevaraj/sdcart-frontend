// src/screens/CategoryModal.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
  ScrollView,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getCategories } from '../services/categoryService';
import { useTheme } from '../theme';
import { AnimatedPressable } from '../components/common/AnimatedPressable';
import { ScreenHeader } from '../components/common/ScreenHeader';
import { useToast } from '../context/ToastContext';

const CATEGORY_PRESETS = [
  {
    keywords: ['electron', 'mobile', 'phone', 'gadget'],
    screen: 'Mobiles',
    icon: 'cellphone',
    iconType: 'mci',
    color: '#2563EB',
  },
  {
    keywords: ['cloth', 'fashion', 'apparel', 'wear'],
    screen: 'Fruits',
    icon: 'tshirt-crew',
    iconType: 'mci',
    color: '#7C3AED',
  },
  {
    keywords: ['home', 'kitchen', 'grocery', 'food'],
    screen: 'Grocery',
    icon: 'cart',
    iconType: 'mci',
    color: '#16A34A',
  },
  {
    keywords: ['sport', 'fit', 'outdoor', 'electric'],
    screen: 'ElectricalsModule',
    icon: 'lightning-bolt',
    iconType: 'mci',
    color: '#EA580C',
  },
];

function presetForCategory(category) {
  const haystack = `${category.name || ''} ${category.slug || ''}`.toLowerCase();
  return (
    CATEGORY_PRESETS.find((preset) =>
      preset.keywords.some((keyword) => haystack.includes(keyword))
    ) || CATEGORY_PRESETS[0]
  );
}

export default function CategoryModal({ navigation }) {
  const insets = useSafeAreaInsets();
  const { colors, typography, radius, shadows, isDark } = useTheme();
  const { showError } = useToast();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCategories()
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => {
        showError('Unable to load categories.');
      })
      .finally(() => setLoading(false));
  }, [showError]);

  const handlePress = (category) => {
    const preset = presetForCategory(category);
    navigation.replace(preset.screen, {
      slug: category.slug,
      title: category.name,
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <ScreenHeader
        title="All Categories"
        subtitle="Explore by department"
        showBack
        showCart={false}
      />

      {loading ? (
        <View style={styles.centerLoading}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading categories...
          </Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: 60 }]}
        >
          {categories.map((category) => {
            const preset = presetForCategory(category);

            return (
              <AnimatedPressable
                key={category.publicId || category.slug}
                onPress={() => handlePress(category)}
                scaleTo={0.98}
                haptic="selection"
                style={[
                  styles.categoryCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    borderRadius: radius.xl,
                    ...shadows.xs,
                  },
                ]}
              >
                <View
                  style={[
                    styles.iconBox,
                    {
                      backgroundColor: `${preset.color}14`,
                      borderRadius: radius.lg,
                    },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={preset.icon}
                    size={26}
                    color={preset.color}
                  />
                </View>

                <View style={styles.textBox}>
                  <Text
                    style={[
                      styles.categoryTitle,
                      { color: colors.text, fontWeight: typography.weights.bold },
                    ]}
                  >
                    {category.name}
                  </Text>
                  <Text style={[styles.categorySubtitle, { color: colors.textMuted }]}>
                    Tap to explore products
                  </Text>
                </View>

                <View
                  style={[
                    styles.arrowCircle,
                    { backgroundColor: colors.surfaceSubtle, borderRadius: radius.full },
                  ]}
                >
                  <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
                </View>
              </AnimatedPressable>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerLoading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  scrollContent: {
    padding: 16,
    gap: 12,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
  },
  iconBox: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBox: {
    flex: 1,
    marginLeft: 14,
  },
  categoryTitle: {
    fontSize: 16,
  },
  categorySubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  arrowCircle: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
