// src/theme/motion.js
import { Easing } from 'react-native-reanimated';

export const springPresets = {
  // Snappy for buttons, micro-interactions, toggles
  snappy: {
    damping: 18,
    stiffness: 260,
    mass: 0.7,
  },
  // Bouncy for count badges, celebratory pops, like hearts
  bouncy: {
    damping: 12,
    stiffness: 220,
    mass: 0.6,
  },
  // Gentle for modals, sheets, card expansions
  gentle: {
    damping: 24,
    stiffness: 180,
    mass: 1,
  },
  // Subtle for tab switching and list reveals
  subtle: {
    damping: 20,
    stiffness: 200,
    mass: 0.8,
  },
};

export const timingPresets = {
  fast: {
    duration: 150,
    easing: Easing.bezier(0.25, 0.1, 0.25, 1),
  },
  normal: {
    duration: 250,
    easing: Easing.bezier(0.2, 0, 0, 1),
  },
  smooth: {
    duration: 350,
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  },
  shimmer: {
    duration: 1200,
    easing: Easing.linear,
  },
};
