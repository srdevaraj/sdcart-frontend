// src/components/common/ScreenHeader.js
import React, { memo } from 'react';
import { StyleSheet, Text, View, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../../theme';
import { AnimatedPressable } from './AnimatedPressable';
import { AnimatedBadge } from './AnimatedBadge';
import { useCart } from '../../context/CartContext';

export const ScreenHeader = memo(({
  title,
  subtitle,
  showBack = false,
  onBack,
  showCart = true,
  rightElement,
  style,
  transparent = false,
}) => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { colors, typography, isDark } = useTheme();
  const { totalQuantity } = useCart();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: Math.max(insets.top, Platform.OS === 'ios' ? 44 : 12) + 8,
          backgroundColor: transparent
            ? 'transparent'
            : isDark
            ? colors.surface
            : colors.surface,
          borderBottomColor: transparent ? 'transparent' : colors.borderLight,
          borderBottomWidth: transparent ? 0 : 1,
        },
        style,
      ]}
    >
      <View style={styles.contentRow}>
        {showBack ? (
          <AnimatedPressable
            onPress={handleBack}
            style={[
              styles.iconButton,
              {
                backgroundColor: isDark ? colors.backgroundSecondary : '#F1F5F9',
              },
            ]}
            haptic="light"
            accessibilityLabel="Go back"
          >
            <Ionicons name="chevron-back" size={22} color={colors.text} />
          </AnimatedPressable>
        ) : null}

        <View style={[styles.titleContainer, !showBack && { marginLeft: 0 }]}>
          {title ? (
            <Text
              style={[
                styles.title,
                { color: colors.text, fontWeight: typography.weights.extrabold },
              ]}
              numberOfLines={1}
            >
              {title}
            </Text>
          ) : null}
          {subtitle ? (
            <Text
              style={[
                styles.subtitle,
                { color: colors.textSecondary },
              ]}
              numberOfLines={1}
            >
              {subtitle}
            </Text>
          ) : null}
        </View>

        <View style={styles.rightContainer}>
          {rightElement}

          {showCart && (
            <AnimatedPressable
              onPress={() => navigation.navigate('Cart')}
              style={[
                styles.iconButton,
                {
                  backgroundColor: isDark ? colors.backgroundSecondary : '#F1F5F9',
                  marginLeft: 8,
                },
              ]}
              haptic="selection"
              accessibilityLabel="View Cart"
            >
              <Ionicons name="cart-outline" size={22} color={colors.text} />
              <AnimatedBadge
                count={totalQuantity}
                style={styles.cartBadge}
              />
            </AnimatedPressable>
          )}
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    zIndex: 10,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 12,
    marginTop: 1,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
  },
});
