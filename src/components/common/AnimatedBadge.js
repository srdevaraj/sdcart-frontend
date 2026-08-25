// src/components/common/AnimatedBadge.js
import React, { useEffect, memo } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withSpring,
} from 'react-native-reanimated';
import { useTheme } from '../../theme';

export const AnimatedBadge = memo(({
  count,
  max = 99,
  size = 18,
  color,
  textColor,
  style,
}) => {
  const { colors, typography } = useTheme();
  const scale = useSharedValue(1);

  useEffect(() => {
    if (count > 0) {
      scale.value = withSequence(
        withSpring(1.35, { damping: 10, stiffness: 350 }),
        withSpring(1, { damping: 14, stiffness: 250 })
      );
    }
  }, [count]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  if (!count || count <= 0) return null;

  const displayCount = count > max ? `${max}+` : count;
  const badgeColor = color || colors.danger;
  const badgeTextColor = textColor || colors.textInverse;

  return (
    <Animated.View
      style={[
        styles.badge,
        {
          minWidth: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: badgeColor,
          paddingHorizontal: count > 9 ? 4 : 0,
        },
        style,
        animatedStyle,
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            fontSize: size * 0.58,
            color: badgeTextColor,
            fontWeight: typography.weights.bold,
          },
        ]}
      >
        {displayCount}
      </Text>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    textAlign: 'center',
  },
});
