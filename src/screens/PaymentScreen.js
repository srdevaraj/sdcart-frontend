import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Image,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { payOrder } from '../services/paymentService';
import { getErrorMessage } from '../services/apiClient';

/**
 * Processes payment for the just-created order. Payment verification and
 * idempotency live on the backend (POST /api/v1/payments/orders/{id}/pay);
 * this screen only displays progress and the backend-confirmed result.
 */
export default function PaymentScreen({ route, navigation }) {
  const { orderPublicId } = route.params || {};
  const attempted = useRef(false);

  const [phase, setPhase] = useState('processing');

  useEffect(() => {
    if (attempted.current || !orderPublicId) {
      return;
    }
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
        Alert.alert(
          'Payment Failed',
          getErrorMessage(error),
          [{ text: 'Back', onPress: () => navigation.goBack() }]
        );
      }
    };

    process();
  }, [orderPublicId, navigation]);

  return (
    <LinearGradient
      colors={['#141E30', '#243B55']}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" />

      <Image
        source={require('../../assets/clogo.png')}
        style={styles.logo}
      />

      <View style={styles.spinnerWrap}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>

      <Text style={styles.title}>Processing Payment</Text>

      <View style={styles.secureRow}>
        <Ionicons name="lock-closed" size={14} color="#94A3B8" />
        <Text style={styles.subtitle}>
          Please wait while we securely confirm your payment...
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
    paddingHorizontal: 30,
  },

  logo: {
    width: 90,
    height: 90,
    borderRadius: 24,
    backgroundColor: '#fff',
    marginBottom: 30,
  },

  spinnerWrap: {
    marginBottom: 20,
  },

  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
  },

  secureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    maxWidth: 260,
  },

  subtitle: {
    color: '#94A3B8',
    fontSize: 13,
    lineHeight: 19,
    marginLeft: 6,
    textAlign: 'center',
  },
});
