// src/components/common/AnimatedPressable.js
import React, { memo } from 'react';
import { Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Haptics } from './Haptics';

const AnimatedPressableComponent = Animated.createAnimatedComponent(Pressable);

export const AnimatedPressable = memo(({
  children,
  style,
  onPress,
  scaleTo = 0.96,
  opacityTo = 0.9,
  haptic = 'light', // 'light' | 'medium' | 'selection' | 'none'
  disabled = false,
  ...props
}) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    'worklet';
    if (disabled) return;
    scale.value = withSpring(scaleTo, { damping: 15, stiffness: 350 });
    opacity.value = withSpring(opacityTo, { damping: 15, stiffness: 350 });
  };

  const handlePressOut = () => {
    'worklet';
    scale.value = withSpring(1, { damping: 18, stiffness: 280 });
    opacity.value = withSpring(1, { damping: 18, stiffness: 280 });
  };

  const handlePress = (e) => {
    if (disabled) return;
    if (haptic && haptic !== 'none' && Haptics[haptic]) {
      Haptics[haptic]();
    }
    onPress?.(e);
  };

  return (
    <AnimatedPressableComponent
      {...props}
      disabled={disabled}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      style={[style, animatedStyle]}
    >
      {children}
    </AnimatedPressableComponent>
  );
});
