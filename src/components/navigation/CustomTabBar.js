// src/components/navigation/CustomTabBar.js
import React, { memo } from 'react';
import { StyleSheet, View, Text, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

import { useTheme } from '../../theme';
import { AnimatedPressable } from '../common/AnimatedPressable';
import { AnimatedBadge } from '../common/AnimatedBadge';
import { useCart } from '../../context/CartContext';

const TAB_CONFIG = {
  Home: {
    label: 'Home',
    activeIcon: 'home',
    inactiveIcon: 'home-outline',
  },
  Products: {
    label: 'Products',
    activeIcon: 'grid',
    inactiveIcon: 'grid-outline',
  },
  Search: {
    label: 'Search',
    activeIcon: 'search',
    inactiveIcon: 'search-outline',
  },
  Cart: {
    label: 'Cart',
    activeIcon: 'cart',
    inactiveIcon: 'cart-outline',
  },
  Account: {
    label: 'Account',
    activeIcon: 'person',
    inactiveIcon: 'person-outline',
  },
};

export const CustomTabBar = memo(({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets();
  const { colors, typography, radius, shadows, isDark } = useTheme();
  const { totalQuantity } = useCart();

  return (
    <View
      style={[
        styles.wrapper,
        {
          paddingBottom: Math.max(insets.bottom, Platform.OS === 'ios' ? 24 : 10),
          backgroundColor: isDark ? '#111827' : '#FFFFFF',
          borderTopColor: isDark ? '#1E293B' : '#E2E8F0',
          ...shadows.lg,
        },
      ]}
    >
      <View style={styles.container}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          const config = TAB_CONFIG[route.name] || {
            label: route.name,
            activeIcon: 'ellipse',
            inactiveIcon: 'ellipse-outline',
          };

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          return (
            <AnimatedPressable
              key={route.key}
              onPress={onPress}
              onLongPress={onLongPress}
              scaleTo={0.9}
              haptic="selection"
              style={styles.tabItem}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel || config.label}
            >
              {/* Active Background Pill */}
              <View
                style={[
                  styles.iconWrap,
                  isFocused && {
                    backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(37, 99, 235, 0.1)',
                    borderRadius: radius.lg,
                  },
                ]}
              >
                <Ionicons
                  name={isFocused ? config.activeIcon : config.inactiveIcon}
                  size={24}
                  color={isFocused ? colors.primary : colors.textMuted}
                />

                {route.name === 'Cart' && (
                  <AnimatedBadge
                    count={totalQuantity}
                    style={styles.badge}
                  />
                )}
              </View>

              <Text
                style={[
                  styles.label,
                  {
                    color: isFocused ? colors.primary : colors.textMuted,
                    fontWeight: isFocused ? typography.weights.bold : typography.weights.medium,
                  },
                ]}
                numberOfLines={1}
              >
                {config.label}
              </Text>
            </AnimatedPressable>
          );
        })}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    borderTopWidth: 1,
    paddingTop: 8,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
  },
  iconWrap: {
    width: 48,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  label: {
    fontSize: 11,
    marginTop: 2,
  },
  badge: {
    position: 'absolute',
    top: -3,
    right: 2,
  },
});
