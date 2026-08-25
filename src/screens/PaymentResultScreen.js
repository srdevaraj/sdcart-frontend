// src/screens/PaymentResultScreen.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getOrder } from '../services/orderService';
import { normalizeOrder } from '../services/normalizers';
import { formatPrice, formatDateTime } from '../services/format';
import { useTheme } from '../theme';
import { AppImage } from '../components/common/AppImage';
import { AnimatedPressable } from '../components/common/AnimatedPressable';
import { Haptics } from '../components/common/Haptics';

export default function PaymentResultScreen({ route, navigation }) {
  const { orderPublicId } = route.params || {};
  const insets = useSafeAreaInsets();
  const { colors, typography, radius, shadows, isDark } = useTheme();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkScale = useSharedValue(0.3);

  useEffect(() => {
    checkScale.value = withSpring(1, { damping: 10, stiffness: 220 });
    Haptics.success();

    if (!orderPublicId) {
      setLoading(false);
      return;
    }

    getOrder(orderPublicId)
      .then((data) => setOrder(normalizeOrder(data)))
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  }, [orderPublicId]);

  const animatedCheckStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
  }));

  if (loading) {
    return (
      <View style={[styles.centerLoading, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Finalizing order details...
        </Text>
      </View>
    );
  }

  const paid = order?.payment?.status === 'COMPLETED' || order?.status === 'CONFIRMED';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
      >
        {/* ================= CELEBRATION HEADER ================= */}
        <LinearGradient
          colors={['#15803D', '#16A34A', '#22C55E']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.headerHero,
            {
              paddingTop: insets.top + 30,
              borderBottomLeftRadius: radius['3xl'],
              borderBottomRightRadius: radius['3xl'],
            },
          ]}
        >
          <Animated.View style={[styles.checkCircle, animatedCheckStyle]}>
            <Ionicons name="checkmark" size={48} color="#FFFFFF" />
          </Animated.View>

          <Text style={[styles.headerTitle, { fontWeight: typography.weights.black }]}>
            {paid ? 'Order Confirmed!' : 'Order Placed'}
          </Text>

          <Text style={styles.headerSubtitle}>
            {order?.orderNumber
              ? `Order ID: ${order.orderNumber}`
              : 'Thank you for shopping with sdCart'}
          </Text>
        </LinearGradient>

        {/* ================= ORDER STATUS CARD ================= */}
        <View
          style={[
            styles.statusCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderRadius: radius.xl,
              ...shadows.md,
            },
          ]}
        >
          <View style={styles.statusRow}>
            <Text style={[styles.statusKey, { color: colors.textMuted }]}>Payment Status</Text>
            <View style={[styles.statusPill, { backgroundColor: colors.successMuted, borderRadius: radius.sm }]}>
              <Text style={[styles.statusVal, { color: colors.success, fontWeight: typography.weights.bold }]}>
                {order?.payment?.status || 'COMPLETED'}
              </Text>
            </View>
          </View>

          <View style={styles.statusRow}>
            <Text style={[styles.statusKey, { color: colors.textMuted }]}>Order Status</Text>
            <Text style={[styles.statusValText, { color: colors.text, fontWeight: typography.weights.bold }]}>
              {order?.status || 'CONFIRMED'}
            </Text>
          </View>

          <View style={styles.statusRow}>
            <Text style={[styles.statusKey, { color: colors.textMuted }]}>Placed On</Text>
            <Text style={[styles.statusValText, { color: colors.textSecondary }]}>
              {formatDateTime(order?.createdAt) || 'Just now'}
            </Text>
          </View>
        </View>

        {/* ================= PURCHASED ITEMS ================= */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text, fontWeight: typography.weights.bold }]}>
            Items Ordered ({order?.items?.length || 0})
          </Text>
        </View>

        {(order?.items || []).map((item) => (
          <View
            key={item.publicId || item.id}
            style={[
              styles.itemCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderRadius: radius.lg,
              },
            ]}
          >
            <View style={[styles.itemThumbWrap, { backgroundColor: colors.surfaceSubtle, borderRadius: radius.md }]}>
              <AppImage source={item.productImage} style={styles.itemThumb} contentFit="contain" />
            </View>

            <View style={styles.itemInfo}>
              <Text style={[styles.itemName, { color: colors.text, fontWeight: typography.weights.semibold }]} numberOfLines={2}>
                {item.productName}
              </Text>
              <View style={styles.itemMeta}>
                <Text style={[styles.itemQty, { color: colors.textMuted }]}>Qty: {item.quantity}</Text>
                <Text style={[styles.itemPrice, { color: colors.primary, fontWeight: typography.weights.bold }]}>
                  {formatPrice(item.subtotal)}
                </Text>
              </View>
            </View>
          </View>
        ))}

        {/* ================= PRICE DETAILS ================= */}
        <View
          style={[
            styles.priceCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderRadius: radius.xl,
              ...shadows.xs,
            },
          ]}
        >
          <Text style={[styles.priceCardTitle, { color: colors.text, fontWeight: typography.weights.bold }]}>
            Payment Summary
          </Text>

          <View style={styles.priceRow}>
            <Text style={[styles.priceKey, { color: colors.textSecondary }]}>Subtotal</Text>
            <Text style={[styles.priceVal, { color: colors.text, fontWeight: typography.weights.semibold }]}>
              {formatPrice(order?.itemsSubtotal)}
            </Text>
          </View>

          {Number(order?.discountAmount || 0) > 0 && (
            <View style={styles.priceRow}>
              <Text style={[styles.priceKey, { color: colors.success }]}>Discount</Text>
              <Text style={[styles.priceVal, { color: colors.success, fontWeight: typography.weights.bold }]}>
                − {formatPrice(order?.discountAmount)}
              </Text>
            </View>
          )}

          <View style={styles.priceRow}>
            <Text style={[styles.priceKey, { color: colors.textSecondary }]}>Delivery Fee</Text>
            <Text style={[styles.priceVal, { color: colors.success, fontWeight: typography.weights.bold }]}>
              FREE
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />

          <View style={styles.priceRow}>
            <Text style={[styles.totalKey, { color: colors.text, fontWeight: typography.weights.black }]}>
              Total Paid
            </Text>
            <Text style={[styles.totalVal, { color: colors.primary, fontWeight: typography.weights.black }]}>
              {formatPrice(order?.totalAmount)}
            </Text>
          </View>
        </View>

        {/* ================= ACTION BUTTONS ================= */}
        <View style={styles.actionButtonsWrap}>
          <AnimatedPressable
            onPress={() => navigation.navigate('Orders')}
            scaleTo={0.96}
            haptic="medium"
            style={[
              styles.primaryBtn,
              {
                backgroundColor: colors.primary,
                borderRadius: radius.xl,
                ...shadows.glowPrimary,
              },
            ]}
          >
            <Ionicons name="receipt-outline" size={18} color="#FFFFFF" />
            <Text style={styles.primaryBtnText}>View My Orders</Text>
          </AnimatedPressable>

          <AnimatedPressable
            onPress={() => navigation.navigate('MainTabs', { screen: 'Home' })}
            scaleTo={0.96}
            haptic="light"
            style={[
              styles.secondaryBtn,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderRadius: radius.xl,
              },
            ]}
          >
            <Text style={[styles.secondaryBtnText, { color: colors.text }]}>
              Continue Shopping
            </Text>
          </AnimatedPressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerLoading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 14,
    fontSize: 14,
  },
  headerHero: {
    alignItems: 'center',
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  checkCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 26,
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    marginTop: 4,
  },
  statusCard: {
    marginHorizontal: 16,
    marginTop: -20,
    padding: 16,
    borderWidth: 1,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  statusKey: {
    fontSize: 13,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusVal: {
    fontSize: 12,
  },
  statusValText: {
    fontSize: 13,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    marginTop: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 12,
    borderWidth: 1,
  },
  itemThumbWrap: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemThumb: {
    width: '85%',
    height: '85%',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontSize: 13,
    lineHeight: 18,
  },
  itemMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  itemQty: {
    fontSize: 12,
  },
  itemPrice: {
    fontSize: 13,
  },
  priceCard: {
    marginHorizontal: 16,
    marginTop: 14,
    padding: 16,
    borderWidth: 1,
  },
  priceCardTitle: {
    fontSize: 15,
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  priceKey: {
    fontSize: 13,
  },
  priceVal: {
    fontSize: 13,
  },
  divider: {
    height: 1,
    marginVertical: 10,
  },
  totalKey: {
    fontSize: 16,
  },
  totalVal: {
    fontSize: 20,
  },
  actionButtonsWrap: {
    paddingHorizontal: 16,
    marginTop: 24,
    gap: 12,
  },
  primaryBtn: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  secondaryBtn: {
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  secondaryBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
