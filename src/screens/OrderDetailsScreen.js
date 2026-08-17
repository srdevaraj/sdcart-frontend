// src/screens/OrderDetailsScreen.js

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

import { getOrder, cancelOrder } from '../services/orderService';
import { normalizeOrder } from '../services/normalizers';
import { getErrorMessage } from '../services/apiClient';
import { formatPrice, formatDateTime } from '../services/format';

const STATUS_COLORS = {
  PENDING: '#F59E0B',
  CONFIRMED: '#2563EB',
  SHIPPED: '#7C3AED',
  DELIVERED: '#16A34A',
  CANCELLED: '#EF4444',
};

export default function OrderDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { orderPublicId } = route.params || {};

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    getOrder(orderPublicId)
      .then((data) => setOrder(normalizeOrder(data)))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [orderPublicId]);

  const handleCancel = () => {
    Alert.alert(
      'Cancel Order',
      `Are you sure you want to cancel order ${order.orderNumber}?`,
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
              Alert.alert('Order cancelled', 'The order has been cancelled.');
            } catch (err) {
              Alert.alert('Unable to cancel', getErrorMessage(err));
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
      <View style={styles.center}>
        <StatusBar barStyle="dark-content" />
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Loading order...</Text>
      </View>
    );
  }

  if (error || !order) {
    return (
      <View style={styles.center}>
        <StatusBar barStyle="dark-content" />
        <Ionicons name="alert-circle-outline" size={70} color="#CBD5E1" />
        <Text style={styles.errorTitle}>Unable to load order</Text>
        <Text style={styles.errorText}>{error || 'The order could not be found.'}</Text>

        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.9}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const statusColor = STATUS_COLORS[order.status] || '#64748B';

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.heading}>Order Details</Text>
        <Text style={styles.orderNumber}>{order.orderNumber}</Text>
        <Text style={styles.orderDate}>{formatDateTime(order.createdAt)}</Text>

        <View style={[styles.statusBadge, { backgroundColor: `${statusColor}18` }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>
            {order.status}
          </Text>
        </View>
      </View>

      {/* Payment summary */}
      {order.payment && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Payment</Text>

          <View style={styles.row}>
            <Text style={styles.label}>Method</Text>
            <Text style={styles.value}>{order.payment.method || '—'}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Status</Text>
            <Text style={styles.value}>{order.payment.status}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Transaction</Text>
            <Text style={styles.value}>{order.payment.transactionId || '—'}</Text>
          </View>
        </View>
      )}

      {/* Items */}
      <Text style={styles.sectionTitle}>Items</Text>

      {(order.items || []).map((item) => (
        <View key={item.publicId} style={styles.itemCard}>
          {item.productImage ? (
            <Image
              source={{ uri: item.productImage }}
              style={styles.itemImage}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.itemImagePlaceholder}>
              <Ionicons name="image-outline" size={26} color="#CBD5E1" />
            </View>
          )}

          <View style={styles.itemInfo}>
            <Text style={styles.itemName} numberOfLines={2}>
              {item.productName}
            </Text>
            <Text style={styles.itemQty}>Qty: {item.quantity}</Text>
            <Text style={styles.itemPrice}>{formatPrice(item.subtotal)}</Text>
          </View>
        </View>
      ))}

      {/* Totals */}
      <Text style={styles.sectionTitle}>Price Details</Text>

      <View style={styles.priceCard}>
        <View style={styles.row}>
          <Text style={styles.label}>Subtotal</Text>
          <Text style={styles.value}>{formatPrice(order.itemsSubtotal)}</Text>
        </View>

        {Number(order.discountAmount || 0) > 0 && (
          <View style={styles.row}>
            <Text style={styles.label}>Discount</Text>
            <Text style={styles.discountValue}>− {formatPrice(order.discountAmount)}</Text>
          </View>
        )}

        <View style={styles.row}>
          <Text style={styles.label}>Delivery</Text>
          <Text style={styles.value}>{formatPrice(order.shippingFee)}</Text>
        </View>

        {order.couponCode ? (
          <View style={styles.row}>
            <Text style={styles.label}>Coupon</Text>
            <Text style={styles.value}>{order.couponCode}</Text>
          </View>
        ) : null}

        <View style={styles.divider} />

        <View style={styles.row}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{formatPrice(order.totalAmount)}</Text>
        </View>
      </View>

      {/* Shipping */}
      {order.shippingAddress && (
        <>
          <Text style={styles.sectionTitle}>Delivering to</Text>

          <View style={styles.addressCard}>
            <Text style={styles.addressName}>
              {order.shippingAddress.recipientName} · {order.shippingAddress.phone}
            </Text>
            <Text style={styles.addressLine}>
              {order.shippingAddress.line1}
              {order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ''}
            </Text>
            <Text style={styles.addressLine}>
              {order.shippingAddress.city}
              {order.shippingAddress.state ? `, ${order.shippingAddress.state}` : ''}{' '}
              · {order.shippingAddress.postalCode}
            </Text>
          </View>
        </>
      )}

      {/* Actions */}
      {order.status === 'PENDING' && (
        <TouchableOpacity
          style={styles.cancelButton}
          activeOpacity={0.85}
          disabled={cancelling}
          onPress={handleCancel}
        >
          {cancelling ? (
            <ActivityIndicator size="small" color="#EF4444" />
          ) : (
            <>
              <Ionicons name="close-circle-outline" size={20} color="#EF4444" />
              <Text style={styles.cancelText}>Cancel Order</Text>
            </>
          )}
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={styles.shopButton}
        activeOpacity={0.9}
        onPress={() => navigation.navigate('MainTabs', { screen: 'Home' })}
      >
        <Text style={styles.shopButtonText}>Continue Shopping</Text>
      </TouchableOpacity>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  content: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 30,
  },

  loadingText: {
    marginTop: 14,
    fontSize: 15,
    color: '#64748B',
    fontWeight: '600',
  },

  errorTitle: {
    marginTop: 18,
    fontSize: 20,
    fontWeight: '800',
    color: '#1E293B',
  },

  errorText: {
    marginTop: 8,
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
  },

  backButton: {
    marginTop: 22,
    backgroundColor: '#2563EB',
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 24,
  },

  backButtonText: {
    color: '#fff',
    fontWeight: '700',
  },

  header: {
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 20,
  },

  heading: {
    fontSize: 26,
    fontWeight: '800',
    color: '#101828',
  },

  orderNumber: {
    marginTop: 6,
    fontSize: 15,
    fontWeight: '700',
    color: '#2563EB',
  },

  orderDate: {
    marginTop: 3,
    fontSize: 13,
    color: '#667085',
  },

  statusBadge: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
  },

  statusText: {
    fontSize: 13,
    fontWeight: '800',
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 10,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    marginTop: 20,
    marginBottom: 10,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },

  label: {
    fontSize: 13,
    color: '#64748B',
  },

  value: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },

  discountValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#15803D',
  },

  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 8,
  },

  totalLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
  },

  totalValue: {
    fontSize: 19,
    fontWeight: '900',
    color: '#111827',
  },

  itemCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  itemImage: {
    width: 68,
    height: 68,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
  },

  itemImagePlaceholder: {
    width: 68,
    height: 68,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },

  itemInfo: {
    flex: 1,
    marginLeft: 12,
  },

  itemName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    lineHeight: 20,
  },

  itemQty: {
    marginTop: 4,
    fontSize: 12,
    color: '#64748B',
  },

  itemPrice: {
    marginTop: 4,
    fontSize: 15,
    fontWeight: '800',
    color: '#16A34A',
  },

  priceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  addressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  addressName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },

  addressLine: {
    marginTop: 3,
    fontSize: 13,
    color: '#64748B',
    lineHeight: 19,
  },

  cancelButton: {
    marginTop: 24,
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#FECACA',
    backgroundColor: '#FEF2F2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  cancelText: {
    color: '#EF4444',
    fontSize: 15,
    fontWeight: '800',
  },

  shopButton: {
    marginTop: 12,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },

  shopButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },
});
