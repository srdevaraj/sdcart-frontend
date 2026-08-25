// src/components/common/WishlistButton.js
import React, { useState, memo } from 'react';
import { StyleSheet, ActivityIndicator, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withSpring,
} from 'react-native-reanimated';

import { useWishlist } from '../../context/WishlistContext';
import { useTheme } from '../../theme';
import { AnimatedPressable } from './AnimatedPressable';
import { Haptics } from './Haptics';

export const WishlistButton = memo(({
  productId,
  size = 22,
  containerSize = 36,
  style,
}) => {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { colors, isDark } = useTheme();
  const [busy, setBusy] = useState(false);

  const active = isInWishlist(productId);
  const scale = useSharedValue(1);

  const animatedHeartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handleToggle = async () => {
    if (busy || !productId) return;
    setBusy(true);

    try {
      scale.value = withSequence(
        withSpring(0.7, { damping: 12, stiffness: 350 }),
        withSpring(1.3, { damping: 10, stiffness: 300 }),
        withSpring(1, { damping: 15, stiffness: 250 })
      );

      const result = await toggleWishlist(productId);
      if (result?.success) {
        Haptics.success();
      } else {
        Haptics.error();
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <AnimatedPressable
      onPress={handleToggle}
      disabled={busy}
      scaleTo={0.92}
      haptic="selection"
      style={[
        styles.container,
        {
          width: containerSize,
          height: containerSize,
          borderRadius: containerSize / 2,
          backgroundColor: isDark ? 'rgba(30, 41, 59, 0.85)' : 'rgba(255, 255, 255, 0.92)',
          borderColor: isDark ? colors.border : 'rgba(226, 232, 240, 0.8)',
        },
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={active ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      {busy ? (
        <ActivityIndicator
          size="small"
          color={colors.danger}
        />
      ) : (
        <Animated.View style={animatedHeartStyle}>
          <Ionicons
            name={active ? 'heart' : 'heart-outline'}
            size={size}
            color={active ? colors.danger : colors.textSecondary}
          />
        </Animated.View>
      )}
    </AnimatedPressable>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
});
