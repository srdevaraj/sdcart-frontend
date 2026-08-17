import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { getOrder } from '../services/orderService';
import { normalizeOrder } from '../services/normalizers';
import { getErrorMessage } from '../services/apiClient';
import { formatPrice, formatDateTime } from '../services/format';

/**
 * Order confirmation screen. The payment result was already verified by the
 * backend; here we fetch the full order to display the authoritative state.
 */
export default function PaymentResultScreen({ route, navigation }) {
  const { orderPublicId } = route.params || {};

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderPublicId) {
      setLoading(false);
      return;
    }

    getOrder(orderPublicId)
      .then((data) => setOrder(normalizeOrder(data)))
      .catch(() => {
        // Fall back to a minimal confirmation even if the order fetch fails.
        setOrder(null);
      })
      .finally(() => setLoading(false));
  }, [orderPublicId]);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loaderText}>Loading your order...</Text>
      </View>
    );
  }

  const paid =
    order?.payment?.status === 'COMPLETED' || order?.status === 'CONFIRMED';

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >
      {/* Success header */}
      <LinearGradient
        colors={['#16A34A', '#15803D']}
        style={styles.header}
      >
        <View style={styles.checkCircle}>
          <Ionicons name="checkmark" size={44} color="#FFFFFF" />
        </View>

        <Text style={styles.headerTitle}>
          {paid ? 'Order Confirmed!' : 'Order Placed'}
        </Text>

        <Text style={styles.headerSubtitle}>
          {order?.orderNumber
            ? `Order ${order.orderNumber}`
            : 'Your order has been placed successfully'}
        </Text>
      </LinearGradient>

      {/* Order status card */}
      <View style={styles.statusCard}>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Payment</Text>
          <Text
            style={[
              styles.statusValue,
              { color: paid ? '#16A34A' : '#F59E0B' },
            ]}
          >
            {order?.payment?.status || 'PROCESSED'}
          </Text>
        </View>

        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Order Status</Text>
          <Text style={styles.statusValue}>
            {order?.status || 'PENDING'}
          </Text>
        </View>

        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Placed on</Text>
          <Text style={styles.statusValue}>
            {formatDateTime(order?.createdAt) || 'Just now'}
          </Text>
        </View>

        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Payment ID</Text>
          <Text style={styles.statusValue}>
            {order?.payment?.transactionId || '—'}
          </Text>
        </View>
      </View>

      {/* Items */}
      <Text style={styles.sectionTitle}>Items</Text>

      {(order?.items || []).map((item) => (
        <View key={item.publicId} style={styles.itemCard}>
          {item.productImage ? (
            <Image
              source={{ uri: item.productImage }}
              style={styles.itemImage}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.itemImagePlaceholder}>
              <Ionicons name="image-outline" size={28} color="#CBD5E1" />
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
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Subtotal</Text>
          <Text style={styles.priceValue}>{formatPrice(order?.itemsSubtotal)}</Text>
        </View>

        {Number(order?.discountAmount || 0) > 0 && (
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Discount</Text>
            <Text style={styles.discountValue}>
              − {formatPrice(order?.discountAmount)}
            </Text>
          </View>
        )}

        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Delivery</Text>
          <Text style={styles.priceValue}>{formatPrice(order?.shippingFee)}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total Paid</Text>
          <Text style={styles.totalValue}>{formatPrice(order?.totalAmount)}</Text>
        </View>
      </View>

      {/* Shipping address */}
      {order?.shippingAddress ? (
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
      ) : null}

      {/* Actions */}
      <TouchableOpacity
        style={styles.primaryButton}
        activeOpacity={0.9}
        onPress={() =>
          navigation.navigate('Orders')
        }
      >
        <Ionicons name="cube-outline" size={20} color="#FFFFFF" />
        <Text style={styles.primaryButtonText}>View My Orders</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryButton}
        activeOpacity={0.9}
        onPress={() =>
          navigation.navigate('MainTabs', { screen: 'Home' })
        }
      >
        <Text style={styles.secondaryButtonText}>Continue Shopping</Text>
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
    paddingBottom: 30,
  },

  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },

  loaderText: {
    marginTop: 14,
    fontSize: 15,
    color: '#64748B',
    fontWeight: '600',
  },

  header: {
    alignItems: 'center',
    paddingTop: 70,
    paddingBottom: 45,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },

  checkCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },

  headerTitle: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '900',
  },

  headerSubtitle: {
    color: '#DCFCE7',
    fontSize: 14,
    marginTop: 6,
  },

  statusCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: -22,
    borderRadius: 18,
    padding: 18,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },

  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 7,
  },

  statusLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },

  statusValue: {
    fontSize: 13,
    color: '#111827',
    fontWeight: '800',
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
    marginHorizontal: 16,
    marginTop: 22,
    marginBottom: 10,
  },

  itemCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
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
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  priceLabel: {
    fontSize: 13,
    color: '#64748B',
  },

  priceValue: {
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

  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  totalLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
  },

  totalValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#111827',
  },

  addressCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
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

  primaryButton: {
    marginTop: 26,
    marginHorizontal: 16,
    height: 54,
    borderRadius: 15,
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },

  secondaryButton: {
    marginTop: 12,
    marginHorizontal: 16,
    height: 54,
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },

  secondaryButtonText: {
    color: '#334155',
    fontSize: 15,
    fontWeight: '700',
  },
});
