// src/components/common/Toast.js
import React, { useEffect, memo } from 'react';
import { StyleSheet, Text, View, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../../theme';
import { AnimatedPressable } from './AnimatedPressable';

export const Toast = memo(({
  visible,
  message,
  title,
  type = 'info', // 'success' | 'error' | 'warning' | 'info'
  onDismiss,
  duration = 3200,
}) => {
  const { colors, typography, radius, shadows, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(-120);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, { damping: 16, stiffness: 220 });
      opacity.value = withTiming(1, { duration: 180 });

      const timer = setTimeout(() => {
        hide();
      }, duration);

      return () => clearTimeout(timer);
    } else {
      hide();
    }
  }, [visible]);

  const hide = () => {
    'worklet';
    translateY.value = withTiming(-120, { duration: 200 });
    opacity.value = withTiming(0, { duration: 200 }, (finished) => {
      if (finished && onDismiss) {
        runOnJS(onDismiss)();
      }
    });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  if (!visible && opacity.value === 0) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return { name: 'checkmark-circle', color: colors.success };
      case 'error':
        return { name: 'alert-circle', color: colors.danger };
      case 'warning':
        return { name: 'warning', color: colors.warning };
      default:
        return { name: 'information-circle', color: colors.primary };
    }
  };

  const iconInfo = getIcon();

  return (
    <Animated.View
      style={[
        styles.wrapper,
        { top: Math.max(insets.top + 8, 16) },
        animatedStyle,
      ]}
      pointerEvents={visible ? 'auto' : 'none'}
    >
      <AnimatedPressable
        onPress={hide}
        scaleTo={0.97}
        style={[
          styles.toastContainer,
          {
            backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
            borderRadius: radius.xl,
            borderColor: isDark ? colors.border : '#E2E8F0',
            ...shadows.lg,
          },
        ]}
      >
        <View
          style={[
            styles.iconBox,
            { backgroundColor: `${iconInfo.color}15` },
          ]}
        >
          <Ionicons name={iconInfo.name} size={22} color={iconInfo.color} />
        </View>

        <View style={styles.textContainer}>
          {title ? (
            <Text
              style={[
                styles.title,
                { color: colors.text, fontWeight: typography.weights.bold },
              ]}
              numberOfLines={1}
            >
              {title}
            </Text>
          ) : null}
          <Text
            style={[
              styles.message,
              { color: colors.textSecondary },
            ]}
            numberOfLines={2}
          >
            {message}
          </Text>
        </View>

        <Ionicons name="close" size={18} color={colors.textMuted} />
      </AnimatedPressable>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 9999,
    alignItems: 'center',
  },
  toastContainer: {
    width: '100%',
    maxWidth: 440,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 14,
    marginBottom: 2,
  },
  message: {
    fontSize: 13,
    lineHeight: 18,
  },
});
