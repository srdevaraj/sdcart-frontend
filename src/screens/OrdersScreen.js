// src/screens/OrdersScreen.js

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused, useNavigation } from '@react-navigation/native';

import { getMyOrders, cancelOrder } from '../services/orderService';
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

export default function OrdersScreen() {
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);
  const [error, setError] = useState(null);

  const fetchOrders = useCallback(async () => {
    try {
      setError(null);
      const page = await getMyOrders({ page: 0, size: 20 });
      setOrders((page?.content || []).map(normalizeOrder));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

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
      `Are you sure you want to cancel order ${order.orderNumber}?`,
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
              Alert.alert('Order cancelled', 'The order has been cancelled.');
            } catch (err) {
              Alert.alert('Unable to cancel', getErrorMessage(err));
            } finally {
              setCancellingId(null);
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
        <Text style={styles.loadingText}>Loading your orders...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      <FlatList
        data={orders}
        keyExtractor={(item) => item.publicId}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#2563EB"
          />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.heading}>My Orders</Text>
            <Text style={styles.subHeading}>
              {orders.length} {orders.length === 1 ? 'order' : 'orders'}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.92}
            onPress={() =>
              navigation.navigate('OrderDetails', { orderPublicId: item.publicId })
            }
          >
            <View style={styles.cardTop}>
              <View>
                <Text style={styles.orderNumber}>{item.orderNumber}</Text>
                <Text style={styles.orderDate}>{formatDateTime(item.createdAt)}</Text>
              </View>

              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: `${STATUS_COLORS[item.status] || '#64748B'}18` },
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    { color: STATUS_COLORS[item.status] || '#64748B' },
                  ]}
                >
                  {item.status}
                </Text>
              </View>
            </View>

            <View style={styles.cardDivider} />

            <View style={styles.cardMiddle}>
              <Text style={styles.itemCount}>
                {item.items?.length || 0} item{(item.items?.length || 0) === 1 ? '' : 's'}
              </Text>

              <Text style={styles.total}>{formatPrice(item.totalAmount)}</Text>
            </View>

            <View style={styles.cardActions}>
              {item.status === 'PENDING' && (
                <TouchableOpacity
                  style={styles.cancelButton}
                  activeOpacity={0.85}
                  disabled={cancellingId === item.publicId}
                  onPress={() => handleCancel(item)}
                >
                  {cancellingId === item.publicId ? (
                    <ActivityIndicator size="small" color="#EF4444" />
                  ) : (
                    <Text style={styles.cancelText}>Cancel Order</Text>
                  )}
                </TouchableOpacity>
              )}

              <View style={styles.viewButton}>
                <Text style={styles.viewText}>View Details</Text>
                <Ionicons name="chevron-forward" size={16} color="#2563EB" />
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
              <Ionicons name="cube-outline" size={70} color="#CBD5E1" />
            </View>

            <Text style={styles.emptyTitle}>No orders yet</Text>

            <Text style={styles.emptySubtitle}>
              When you place an order, it will show up here.
            </Text>

            <TouchableOpacity
              style={styles.shopButton}
              activeOpacity={0.9}
              onPress={() => navigation.navigate('Products')}
            >
              <Text style={styles.shopButtonText}>Start Shopping</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },

  loadingText: {
    marginTop: 14,
    fontSize: 15,
    color: '#64748B',
    fontWeight: '600',
  },

  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },

  header: {
    paddingTop: 18,
    paddingBottom: 16,
  },

  heading: {
    fontSize: 26,
    fontWeight: '800',
    color: '#101828',
  },

  subHeading: {
    marginTop: 4,
    fontSize: 13,
    color: '#667085',
    fontWeight: '500',
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },

  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  orderNumber: {
    fontSize: 16,
    fontWeight: '800',
    color: '#101828',
  },

  orderDate: {
    marginTop: 3,
    fontSize: 12,
    color: '#667085',
  },

  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },

  statusText: {
    fontSize: 12,
    fontWeight: '800',
  },

  cardDivider: {
    height: 1,
    backgroundColor: '#EAECF0',
    marginVertical: 12,
  },

  cardMiddle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  itemCount: {
    fontSize: 13,
    color: '#667085',
  },

  total: {
    fontSize: 18,
    fontWeight: '900',
    color: '#101828',
  },

  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },

  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: '#FEF2F2',
    minWidth: 110,
    alignItems: 'center',
  },

  cancelText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '700',
  },

  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  viewText: {
    color: '#2563EB',
    fontSize: 13,
    fontWeight: '700',
  },

  emptyContainer: {
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 30,
  },

  emptyIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyTitle: {
    marginTop: 22,
    fontSize: 22,
    fontWeight: '800',
    color: '#1E293B',
  },

  emptySubtitle: {
    marginTop: 10,
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 23,
  },

  shopButton: {
    marginTop: 26,
    backgroundColor: '#2563EB',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 28,
  },

  shopButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
});
