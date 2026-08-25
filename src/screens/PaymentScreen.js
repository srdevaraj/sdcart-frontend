// src/screens/PaymentScreen.js
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
} from 'react-native-reanimated';

import { payOrder } from '../services/paymentService';
import { getErrorMessage } from '../services/apiClient';
import { useTheme } from '../theme';
import { AppImage } from '../components/common/AppImage';
import { useToast } from '../context/ToastContext';

export default function PaymentScreen({ route, navigation }) {
  const { orderPublicId } = route.params || {};
  const { colors, typography, radius, shadows } = useTheme();
  const { showError } = useToast();
  const attempted = useRef(false);

  const [phase, setPhase] = useState('processing'); // 'processing' | 'success' | 'failed'
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 800 }),
        withTiming(1, { duration: 800 })
      ),
      -1,
      true
    );
  }, []);

  const animatedPulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  useEffect(() => {
    if (attempted.current || !orderPublicId) return;
    attempted.current = true;

    const process = async () => {
      try {
        const payment = await payOrder(orderPublicId);
        setPhase('success');
        navigation.replace('PaymentResult', {
          orderPublicId,
          payment,
        });
      } catch (error) {
        setPhase('failed');
        showError(getErrorMessage(error));
        setTimeout(() => {
          navigation.goBack();
        }, 1200);
      }
    };

    process();
  }, [orderPublicId, navigation, showError]);

  return (
    <LinearGradient
      colors={['#0F172A', '#1E3A8A', '#2563EB']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Animated Glowing Logo */}
      <Animated.View style={[styles.logoWrap, animatedPulseStyle]}>
        <AppImage
          source={require('../../assets/clogo.png')}
          style={styles.logo}
          contentFit="contain"
        />
      </Animated.View>

      <View style={styles.spinnerWrap}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>

      <Text style={[styles.title, { fontWeight: typography.weights.black }]}>
        Processing Payment
      </Text>

      <View style={styles.secureRow}>
        <Ionicons name="shield-checkmark" size={16} color="#4ADE80" />
        <Text style={styles.subtitle}>
          Securely connecting to payment gateway...
        </Text>
      </View>

      <View style={styles.disclaimerBox}>
        <Text style={styles.disclaimerText}>
          Please do not close the app or press back while we confirm your transaction.
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  logoWrap: {
    width: 96,
    height: 96,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    marginBottom: 28,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  spinnerWrap: {
    marginBottom: 16,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    letterSpacing: -0.3,
  },
  secureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 6,
  },
  subtitle: {
    color: '#CBD5E1',
    fontSize: 13,
  },
  disclaimerBox: {
    marginTop: 40,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    maxWidth: 320,
  },
  disclaimerText: {
    color: '#94A3B8',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
});
