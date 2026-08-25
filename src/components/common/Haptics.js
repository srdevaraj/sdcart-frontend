// src/components/common/Haptics.js
import * as ExpoHaptics from 'expo-haptics';
import { Platform } from 'react-native';

export const Haptics = {
  light: async () => {
    try {
      if (Platform.OS !== 'web') {
        await ExpoHaptics.impactAsync(ExpoHaptics.ImpactFeedbackStyle.Light);
      }
    } catch (e) {}
  },

  medium: async () => {
    try {
      if (Platform.OS !== 'web') {
        await ExpoHaptics.impactAsync(ExpoHaptics.ImpactFeedbackStyle.Medium);
      }
    } catch (e) {}
  },

  heavy: async () => {
    try {
      if (Platform.OS !== 'web') {
        await ExpoHaptics.impactAsync(ExpoHaptics.ImpactFeedbackStyle.Heavy);
      }
    } catch (e) {}
  },

  success: async () => {
    try {
      if (Platform.OS !== 'web') {
        await ExpoHaptics.notificationAsync(ExpoHaptics.NotificationFeedbackType.Success);
      }
    } catch (e) {}
  },

  warning: async () => {
    try {
      if (Platform.OS !== 'web') {
        await ExpoHaptics.notificationAsync(ExpoHaptics.NotificationFeedbackType.Warning);
      }
    } catch (e) {}
  },

  error: async () => {
    try {
      if (Platform.OS !== 'web') {
        await ExpoHaptics.notificationAsync(ExpoHaptics.NotificationFeedbackType.Error);
      }
    } catch (e) {}
  },

  selection: async () => {
    try {
      if (Platform.OS !== 'web') {
        await ExpoHaptics.selectionAsync();
      }
    } catch (e) {}
  },
};
