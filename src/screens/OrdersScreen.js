// src/screens/OrdersScreen.js
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Alert,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused, useNavigation } from '@react-navigation/native';

import { getMyOrders, cancelOrder } from '../services/orderService';
import { normalizeOrder } from '../services/normalizers';
import { getErrorMessage } from '../services/apiClient';
import { formatPrice, formatDateTime } from '../services/format';
import { useTheme } from '../theme';
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

export default function OrdersScreen() {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const { colors, typography, radius, shadows, isDark } = useTheme();
  const { showSuccess, showError } = useToast();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);

  const fetchOrders = useCallback(async () => {
    try {
      const page = await getMyOrders({ page: 0, size: 25 });
      setOrders((page?.content || []).map(normalizeOrder));
    } catch (err) {
      showError(getErrorMessage(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [showError]);

  useEffect(() => {
    if (isFocused) {
      fetchOrders();
    }
  }, [isFocused, fetchOrders]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
  };

  const handleCancel = (order) => {
    Alert.alert(
      'Cancel Order',
      `Are you sure you want to cancel order #${order.orderNumber}?`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              setCancellingId(order.publicId);
              const updated = await cancelOrder(order.publicId);
              setOrders((prev) =>
                prev.map((o) =>
                  o.publicId === order.publicId ? normalizeOrder(updated) : o
                )
              );
              showSuccess('Order cancelled successfully');
            } catch (err) {
              showError(getErrorMessage(err));
            } finally {
              setCancellingId(null);
            }
          },
        },
      ]
    );
  };

  const renderOrderItem = useCallback(
    ({ item }) => {
      const statusInfo = STATUS_CONFIG[item.status] || {
        label: item.status,
        bg: colors.surfaceSubtle,
        color: colors.textSecondary,
        icon: 'information-circle-outline',
      };
      const isCancelling = cancellingId === item.publicId;

      return (
        <AnimatedPressable
          onPress={() => navigation.navigate('OrderDetails', { orderPublicId: item.publicId })}
          scaleTo={0.98}
          haptic="selection"
          style={[
            styles.orderCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderRadius: radius.xl,
              ...shadows.xs,
            },
          ]}
        >
          {/* Card Top: Order Number & Status */}
          <View style={styles.cardTop}>
            <View>
              <Text style={[styles.orderNumber, { color: colors.text, fontWeight: typography.weights.extrabold }]}>
                Order #{item.orderNumber}
              </Text>
              <Text style={[styles.orderDate, { color: colors.textMuted }]}>
                {formatDateTime(item.createdAt)}
              </Text>
            </View>

            <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg, borderRadius: radius.full }]}>
              <Ionicons name={statusInfo.icon} size={13} color={statusInfo.color} />
              <Text style={[styles.statusText, { color: statusInfo.color, fontWeight: typography.weights.bold }]}>
                {statusInfo.label}
              </Text>
            </View>
          </View>

          <View style={[styles.cardDivider, { backgroundColor: colors.borderLight }]} />

          {/* Card Middle: Items Count & Total */}
          <View style={styles.cardMiddle}>
            <Text style={[styles.itemCountText, { color: colors.textSecondary }]}>
              {item.items?.length || 0} item{(item.items?.length || 0) === 1 ? '' : 's'}
            </Text>
            <Text style={[styles.totalAmountText, { color: colors.primary, fontWeight: typography.weights.black }]}>
              {formatPrice(item.totalAmount)}
            </Text>
          </View>

          {/* Card Actions */}
          <View style={styles.cardActions}>
            {item.status === 'PENDING' ? (
              <AnimatedPressable
                onPress={() => handleCancel(item)}
                disabled={isCancelling}
                scaleTo={0.92}
                haptic="medium"
                style={[
                  styles.cancelBtn,
                  {
                    backgroundColor: colors.dangerMuted,
                    borderRadius: radius.md,
                  },
                ]}
              >
                {isCancelling ? (
                  <ActivityIndicator size="small" color={colors.danger} />
                ) : (
                  <Text style={[styles.cancelBtnText, { color: colors.danger, fontWeight: typography.weights.bold }]}>
                    Cancel Order
                  </Text>
                )}
              </AnimatedPressable>
            ) : <View />}

            <View style={styles.viewDetailsRow}>
              <Text style={[styles.viewDetailsText, { color: colors.primary, fontWeight: typography.weights.bold }]}>
                View Details
              </Text>
              <Ionicons name="chevron-forward" size={16} color={colors.primary} />
            </View>
          </View>
        </AnimatedPressable>
      );
    },
    [cancellingId, colors, typography, radius, shadows, navigation]
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <ScreenHeader
        title="My Orders"
        subtitle={`${orders.length} orders placed`}
        showBack
      />

      <FlatList
        data={orders}
        keyExtractor={(item) => String(item.publicId || item.id || Math.random())}
        renderItem={renderOrderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.listContent, { paddingBottom: 60 }]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <View style={[styles.emptyCircle, { backgroundColor: colors.surfaceSubtle }]}>
                <Ionicons name="cube-outline" size={64} color={colors.textMuted} />
              </View>
              <Text
                style={[
                  styles.emptyTitle,
                  { color: colors.text, fontWeight: typography.weights.extrabold },
                ]}
              >
                No Orders Yet
              </Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                Once you place an order, track your shipments and view order receipts here.
              </Text>
              <AnimatedPressable
                onPress={() => navigation.navigate('Products')}
                scaleTo={0.95}
                style={[
                  styles.shopBtn,
                  { backgroundColor: colors.primary, borderRadius: radius.full },
                ]}
                haptic="selection"
              >
                <Text style={styles.shopBtnText}>Start Shopping</Text>
              </AnimatedPressable>
            </View>
          ) : (
            <View style={styles.centerLoading}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                Loading your orders...
              </Text>
            </View>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerLoading: {
    paddingVertical: 80,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  listContent: {
    padding: 16,
  },
  orderCard: {
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  orderNumber: {
    fontSize: 15,
  },
  orderDate: {
    fontSize: 12,
    marginTop: 3,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 4,
  },
  statusText: {
    fontSize: 11,
    letterSpacing: 0.3,
  },
  cardDivider: {
    height: 1,
    marginVertical: 12,
  },
  cardMiddle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemCountText: {
    fontSize: 13,
  },
  totalAmountText: {
    fontSize: 18,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
  },
  cancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  cancelBtnText: {
    fontSize: 12,
  },
  viewDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 'auto',
  },
  viewDetailsText: {
    fontSize: 13,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 24,
  },
  emptyCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 22,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  shopBtn: {
    paddingHorizontal: 32,
    paddingVertical: 14,
  },
  shopBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
