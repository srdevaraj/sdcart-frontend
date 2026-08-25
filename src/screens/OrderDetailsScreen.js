// src/screens/OrderDetailsScreen.js
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

import { getOrder, cancelOrder } from '../services/orderService';
import { normalizeOrder } from '../services/normalizers';
import { getErrorMessage } from '../services/apiClient';
import { formatPrice, formatDateTime } from '../services/format';
import { useTheme } from '../theme';
import { AppImage } from '../components/common/AppImage';
import { AnimatedPressable } from '../components/common/AnimatedPressable';
import { ScreenHeader } from '../components/common/ScreenHeader';
import { useToast } from '../context/ToastContext';

const STATUS_CONFIG = {
  PENDING: { label: 'PENDING', bg: '#FEF3C7', color: '#D97706', icon: 'time-outline' },
  CONFIRMED: { label: 'CONFIRMED', bg: '#DBEAFE', color: '#2563EB', icon: 'checkmark-circle-outline' },
  SHIPPED: { label: 'SHIPPED', bg: '#F3E8FF', color: '#7C3AED', icon: 'airplane-outline' },
  DELIVERED: { label: 'DELIVERED', bg: '#DCFCE7', color: '#16A34A', icon: 'checkmark-done-circle-outline' },
  CANCELLED: { label: 'CANCELLED', bg: '#FEE2E2', color: '#EF4444', icon: 'close-circle-outline' },
};

export default function OrderDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { colors, typography, radius, shadows, isDark } = useTheme();
  const { showSuccess, showError } = useToast();

  const { orderPublicId } = route.params || {};

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  const fetchOrderDetails = useCallback(async () => {
    if (!orderPublicId) return;
    try {
      setLoading(true);
      const data = await getOrder(orderPublicId);
      setOrder(normalizeOrder(data));
    } catch (err) {
      showError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [orderPublicId, showError]);

  useEffect(() => {
    fetchOrderDetails();
  }, [fetchOrderDetails]);

  const handleCancel = () => {
    Alert.alert(
      'Cancel Order',
      `Are you sure you want to cancel order #${order?.orderNumber}?`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              setCancelling(true);
              const updated = await cancelOrder(order.publicId);
              setOrder(normalizeOrder(updated));
              showSuccess('Order cancelled');
            } catch (err) {
              showError(getErrorMessage(err));
            } finally {
              setCancelling(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        <ScreenHeader title="Order Summary" showBack />
        <View style={styles.centerLoading}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading order details...
          </Text>
        </View>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScreenHeader title="Order Summary" showBack />
        <View style={styles.centerLoading}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.textMuted} />
          <Text style={[styles.errorTitle, { color: colors.text, fontWeight: typography.weights.bold }]}>
            Order Not Found
          </Text>
          <AnimatedPressable
            onPress={() => navigation.goBack()}
            style={[styles.backBtn, { backgroundColor: colors.primary, borderRadius: radius.full }]}
          >
            <Text style={styles.backBtnText}>Go Back</Text>
          </AnimatedPressable>
        </View>
      </View>
    );
  }

  const statusInfo = STATUS_CONFIG[order.status] || {
    label: order.status,
    bg: colors.surfaceSubtle,
    color: colors.textSecondary,
    icon: 'information-circle-outline',
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <ScreenHeader
        title={`Order #${order.orderNumber}`}
        subtitle={formatDateTime(order.createdAt)}
        showBack
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 60 }]}
      >
        {/* ================= ORDER STATUS BADGE ================= */}
        <View
          style={[
            styles.statusCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderRadius: radius.xl,
              ...shadows.xs,
            },
          ]}
        >
          <View style={styles.statusHeaderRow}>
            <View>
              <Text style={[styles.statusCardLabel, { color: colors.textMuted }]}>
                Current Status
              </Text>
              <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg, borderRadius: radius.full }]}>
                <Ionicons name={statusInfo.icon} size={14} color={statusInfo.color} />
                <Text style={[styles.statusText, { color: statusInfo.color, fontWeight: typography.weights.bold }]}>
                  {statusInfo.label}
                </Text>
              </View>
            </View>

            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[styles.statusCardLabel, { color: colors.textMuted }]}>
                Total Value
              </Text>
              <Text style={[styles.statusTotalAmount, { color: colors.primary, fontWeight: typography.weights.black }]}>
                {formatPrice(order.totalAmount)}
              </Text>
            </View>
          </View>
        </View>

        {/* ================= ITEMS ================= */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderRadius: radius.xl,
              ...shadows.xs,
            },
          ]}
        >
          <Text style={[styles.cardTitle, { color: colors.text, fontWeight: typography.weights.bold }]}>
            Ordered Items ({order.items?.length || 0})
          </Text>

          {(order.items || []).map((item) => (
            <View key={item.publicId || item.id} style={styles.itemRow}>
              <View style={[styles.itemThumbWrap, { backgroundColor: colors.surfaceSubtle, borderRadius: radius.md }]}>
                <AppImage source={item.productImage} style={styles.itemThumb} contentFit="contain" />
              </View>

              <View style={styles.itemInfo}>
                <Text style={[styles.itemName, { color: colors.text, fontWeight: typography.weights.semibold }]} numberOfLines={2}>
                  {item.productName}
                </Text>
                <View style={styles.itemMeta}>
                  <Text style={[styles.itemQty, { color: colors.textMuted }]}>
                    Qty: {item.quantity}
                  </Text>
                  <Text style={[styles.itemPrice, { color: colors.primary, fontWeight: typography.weights.bold }]}>
                    {formatPrice(item.subtotal)}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* ================= PAYMENT INFO ================= */}
        {order.payment && (
          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderRadius: radius.xl,
                ...shadows.xs,
              },
            ]}
          >
            <Text style={[styles.cardTitle, { color: colors.text, fontWeight: typography.weights.bold }]}>
              Payment Information
            </Text>

            <View style={styles.infoRow}>
              <Text style={[styles.infoKey, { color: colors.textMuted }]}>Method</Text>
              <Text style={[styles.infoVal, { color: colors.text, fontWeight: typography.weights.semibold }]}>
                {order.payment.method || 'Online'}
              </Text>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />

            <View style={styles.infoRow}>
              <Text style={[styles.infoKey, { color: colors.textMuted }]}>Payment Status</Text>
              <Text style={[styles.infoVal, { color: colors.success, fontWeight: typography.weights.bold }]}>
                {order.payment.status}
              </Text>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />

            <View style={styles.infoRow}>
              <Text style={[styles.infoKey, { color: colors.textMuted }]}>Transaction ID</Text>
              <Text style={[styles.infoVal, { color: colors.textSecondary }]}>
                {order.payment.transactionId || '—'}
              </Text>
            </View>
          </View>
        )}

        {/* ================= DELIVERY ADDRESS ================= */}
        {order.shippingAddress && (
          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderRadius: radius.xl,
                ...shadows.xs,
              },
            ]}
          >
            <Text style={[styles.cardTitle, { color: colors.text, fontWeight: typography.weights.bold }]}>
              Shipping Address
            </Text>

            <Text style={[styles.addressName, { color: colors.text, fontWeight: typography.weights.bold }]}>
              {order.shippingAddress.recipientName} · {order.shippingAddress.phone}
            </Text>
            <Text style={[styles.addressDetail, { color: colors.textSecondary }]}>
              {order.shippingAddress.line1}
              {order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ''}
            </Text>
            <Text style={[styles.addressDetail, { color: colors.textSecondary }]}>
              {order.shippingAddress.city}
              {order.shippingAddress.state ? `, ${order.shippingAddress.state}` : ''} · {order.shippingAddress.postalCode}
            </Text>
          </View>
        )}

        {/* ================= INVOICE SUMMARY ================= */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderRadius: radius.xl,
              ...shadows.xs,
            },
          ]}
        >
          <Text style={[styles.cardTitle, { color: colors.text, fontWeight: typography.weights.bold }]}>
            Price Summary
          </Text>

          <View style={styles.infoRow}>
            <Text style={[styles.infoKey, { color: colors.textSecondary }]}>Subtotal</Text>
            <Text style={[styles.infoVal, { color: colors.text, fontWeight: typography.weights.semibold }]}>
              {formatPrice(order.itemsSubtotal)}
            </Text>
          </View>

          {Number(order.discountAmount || 0) > 0 && (
            <View style={styles.infoRow}>
              <Text style={[styles.infoKey, { color: colors.success }]}>Discount</Text>
              <Text style={[styles.infoVal, { color: colors.success, fontWeight: typography.weights.bold }]}>
                − {formatPrice(order.discountAmount)}
              </Text>
            </View>
          )}

          <View style={styles.infoRow}>
            <Text style={[styles.infoKey, { color: colors.textSecondary }]}>Delivery Fee</Text>
            <Text style={[styles.infoVal, { color: colors.success, fontWeight: typography.weights.bold }]}>
              FREE
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />

          <View style={styles.infoRow}>
            <Text style={[styles.totalKey, { color: colors.text, fontWeight: typography.weights.black }]}>
              Total Amount
            </Text>
            <Text style={[styles.totalVal, { color: colors.primary, fontWeight: typography.weights.black }]}>
              {formatPrice(order.totalAmount)}
            </Text>
          </View>
        </View>

        {/* Actions */}
        {order.status === 'PENDING' && (
          <AnimatedPressable
            onPress={handleCancel}
            disabled={cancelling}
            scaleTo={0.96}
            haptic="heavy"
            style={[
              styles.cancelOrderBtn,
              {
                backgroundColor: colors.dangerMuted,
                borderRadius: radius.xl,
              },
            ]}
          >
            {cancelling ? (
              <ActivityIndicator size="small" color={colors.danger} />
            ) : (
              <>
                <Ionicons name="close-circle-outline" size={20} color={colors.danger} />
                <Text style={[styles.cancelOrderText, { color: colors.danger, fontWeight: typography.weights.bold }]}>
                  Cancel This Order
                </Text>
              </>
            )}
          </AnimatedPressable>
        )}
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
    marginTop: 12,
    fontSize: 14,
  },
  errorTitle: {
    fontSize: 18,
    marginTop: 16,
    marginBottom: 20,
  },
  backBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  backBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
  },
  statusCard: {
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
  },
  statusHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusCardLabel: {
    fontSize: 11,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 4,
  },
  statusText: {
    fontSize: 11,
  },
  statusTotalAmount: {
    fontSize: 22,
  },
  card: {
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
  },
  cardTitle: {
    fontSize: 15,
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  itemThumbWrap: {
    width: 48,
    height: 48,
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
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  infoKey: {
    fontSize: 13,
  },
  infoVal: {
    fontSize: 13,
  },
  divider: {
    height: 1,
    marginVertical: 6,
  },
  totalKey: {
    fontSize: 15,
  },
  totalVal: {
    fontSize: 18,
  },
  addressName: {
    fontSize: 14,
    marginBottom: 4,
  },
  addressDetail: {
    fontSize: 13,
    lineHeight: 18,
  },
  cancelOrderBtn: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 6,
  },
  cancelOrderText: {
    fontSize: 15,
  },
});
