// src/components/common/ShimmerLoader.js
import React, { useEffect, memo } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../theme';

export const ShimmerLoader = memo(({
  width = '100%',
  height = 20,
  borderRadius = 8,
  style,
}) => {
  const { isDark } = useTheme();
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: 1200 }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(progress.value, [0, 1], [-150, 150]);
    return {
      transform: [{ translateX }],
    };
  });

  const baseBg = isDark ? '#1E293B' : '#E2E8F0';
  const shimmerColors = isDark
    ? ['#1E293B', '#334155', '#1E293B']
    : ['#E2E8F0', '#F1F5F9', '#E2E8F0'];

  return (
    <View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: baseBg,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <Animated.View style={[StyleSheet.absoluteFill, animatedStyle]}>
        <LinearGradient
          colors={shimmerColors}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
});

export const ProductCardSkeleton = memo(({ width: cardWidth }) => {
  const { colors, radius } = useTheme();
  return (
    <View
      style={{
        width: cardWidth,
        borderRadius: radius.xl,
        backgroundColor: colors.surface,
        padding: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <ShimmerLoader width="100%" height={150} borderRadius={radius.lg} />
      <View style={{ marginTop: 12 }}>
        <ShimmerLoader width="75%" height={16} borderRadius={radius.xs} />
        <ShimmerLoader width="45%" height={14} borderRadius={radius.xs} style={{ marginTop: 6 }} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
          <ShimmerLoader width="40%" height={20} borderRadius={radius.xs} />
          <ShimmerLoader width={36} height={36} borderRadius={radius.md} />
        </View>
      </View>
    </View>
  );
});
