// src/screens/Admin.js
//
// Admin dashboard. All data comes from the /api/v1/admin/* endpoints; the
// backend enforces the ADMIN role on every request (defense in depth: this
// screen also hides itself from non-admins).

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  StatusBar,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { useAuth } from '../context/AuthContext';
import {
  adminListProducts,
  adminUpdateProductStatus,
  adminDeleteProduct,
  adminListOrders,
  adminUpdateOrderStatus,
  adminListUsers,
  adminSetUserActive,
  adminListPayments,
} from '../services/adminService';
import { getErrorMessage } from '../services/apiClient';
import { formatPrice, formatDateTime } from '../services/format';

const TABS = [
  { key: 'overview', label: 'Overview', icon: 'speedometer-outline' },
  { key: 'products', label: 'Products', icon: 'cube-outline' },
  { key: 'orders', label: 'Orders', icon: 'receipt-outline' },
  { key: 'users', label: 'Users', icon: 'people-outline' },
];

const ORDER_STATUSES = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

export default function Admin() {
  const { isAdmin } = useAuth();

  const [tab, setTab] = useState('overview');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Data
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [payments, setPayments] = useState([]);

  // Busy flags
  const [busy, setBusy] = useState(null);

  const fetchAll = useCallback(async () => {
    try {
      const [p, o, u, pay] = await Promise.all([
        adminListProducts({ size: 20 }),
        adminListOrders({ size: 20 }),
        adminListUsers({ size: 20 }),
        adminListPayments({ size: 20 }),
      ]);
      setProducts(p?.content || []);
      setOrders(o?.content || []);
      setUsers(u?.content || []);
      setPayments(pay?.content || []);
    } catch (err) {
      Alert.alert('Error', getErrorMessage(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  if (!isAdmin) {
    return (
      <View style={styles.center}>
        <StatusBar barStyle="dark-content" />
        <Ionicons name="shield-outline" size={80} color="#CBD5E1" />
        <Text style={styles.deniedTitle}>Access Denied</Text>
        <Text style={styles.deniedText}>
          You do not have permission to view the admin dashboard.
        </Text>
      </View>
    );
  }

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAll();
  };

  // ---------------- Product actions ----------------

  const toggleProductStatus = async (product) => {
    const next = product.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      setBusy(`p-${product.publicId}`);
      const updated = await adminUpdateProductStatus(product.publicId, next);
      setProducts((prev) =>
        prev.map((p) => (p.publicId === product.publicId ? updated : p))
      );
    } catch (err) {
      Alert.alert('Error', getErrorMessage(err));
    } finally {
      setBusy(null);
    }
  };

  const deleteProduct = (product) => {
    Alert.alert(
      'Deactivate Product',
      `Deactivate "${product.name}"? It will disappear from the store catalog.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Deactivate',
          style: 'destructive',
          onPress: async () => {
            try {
              setBusy(`d-${product.publicId}`);
              await adminDeleteProduct(product.publicId);
              setProducts((prev) =>
                prev.filter((p) => p.publicId !== product.publicId)
              );
            } catch (err) {
              Alert.alert('Error', getErrorMessage(err));
            } finally {
              setBusy(null);
            }
          },
        },
      ]
    );
  };

  // ---------------- Order actions ----------------

  const advanceOrder = async (order, status) => {
    try {
      setBusy(`o-${order.publicId}`);
      const updated = await adminUpdateOrderStatus(order.publicId, status);
      setOrders((prev) =>
        prev.map((o) => (o.publicId === order.publicId ? updated : o))
      );
    } catch (err) {
      Alert.alert('Error', getErrorMessage(err));
    } finally {
      setBusy(null);
    }
  };

  // ---------------- User actions ----------------

  const toggleUserActive = async (user) => {
    try {
      setBusy(`u-${user.publicId}`);
      const updated = await adminSetUserActive(user.publicId, !user.active);
      setUsers((prev) =>
        prev.map((u) => (u.publicId === user.publicId ? updated : u))
      );
    } catch (err) {
      Alert.alert('Error', getErrorMessage(err));
    } finally {
      setBusy(null);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <StatusBar barStyle="dark-content" />
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1E3A8A" />

      {/* Header */}
      <LinearGradient
        colors={['#1E3A8A', '#2563EB']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Admin Dashboard</Text>
        <Text style={styles.headerSubtitle}>
          Manage products, orders and users
        </Text>
      </LinearGradient>

      {/* Tabs */}
      <View style={styles.tabs}>
        {TABS.map((t) => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tab, tab === t.key && styles.tabActive]}
            onPress={() => setTab(t.key)}
            activeOpacity={0.85}
          >
            <Ionicons
              name={t.icon}
              size={16}
              color={tab === t.key ? '#FFFFFF' : '#64748B'}
            />
            <Text style={[styles.tabText, tab === t.key && styles.tabTextActive]}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#2563EB"
          />
        }
      >
        {/* ================= OVERVIEW ================= */}
        {tab === 'overview' && (
          <View style={styles.statsGrid}>
            <StatCard
              icon="cube-outline"
              label="Products"
              value={products.length}
              color="#2563EB"
              onPress={() => setTab('products')}
            />
            <StatCard
              icon="receipt-outline"
              label="Orders"
              value={orders.length}
              color="#7C3AED"
              onPress={() => setTab('orders')}
            />
            <StatCard
              icon="people-outline"
              label="Users"
              value={users.length}
              color="#16A34A"
              onPress={() => setTab('users')}
            />
            <StatCard
              icon="card-outline"
              label="Payments"
              value={payments.length}
              color="#EA580C"
            />
          </View>
        )}

        {/* ================= PRODUCTS ================= */}
        {tab === 'products' && (
          <>
            <Text style={styles.sectionLabel}>Products ({products.length})</Text>
            {products.length === 0 ? (
              <EmptyState text="No products found" />
            ) : (
              products.map((product) => (
                <View key={product.publicId} style={styles.rowCard}>
                  <View style={styles.rowInfo}>
                    <Text style={styles.rowTitle} numberOfLines={1}>
                      {product.name}
                    </Text>
                    <Text style={styles.rowSubtitle}>
                      {formatPrice(product.price)} · Stock {product.stockQuantity}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.statusPill,
                      {
                        backgroundColor:
                          product.status === 'ACTIVE' ? '#DCFCE7' : '#FEF2F2',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusPillText,
                        {
                          color:
                            product.status === 'ACTIVE' ? '#15803D' : '#B91C1C',
                        },
                      ]}
                    >
                      {product.status}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.smallButton}
                    disabled={busy === `p-${product.publicId}`}
                    onPress={() => toggleProductStatus(product)}
                  >
                    {busy === `p-${product.publicId}` ? (
                      <ActivityIndicator size="small" color="#2563EB" />
                    ) : (
                      <Ionicons
                        name={product.status === 'ACTIVE' ? 'eye-off-outline' : 'eye-outline'}
                        size={18}
                        color="#2563EB"
                      />
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.smallButton}
                    disabled={busy === `d-${product.publicId}`}
                    onPress={() => deleteProduct(product)}
                  >
                    <Ionicons name="trash-outline" size={18} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </>
        )}

        {/* ================= ORDERS ================= */}
        {tab === 'orders' && (
          <>
            <Text style={styles.sectionLabel}>Orders ({orders.length})</Text>
            {orders.length === 0 ? (
              <EmptyState text="No orders found" />
            ) : (
              orders.map((order) => (
                <View key={order.publicId} style={styles.rowCard}>
                  <View style={styles.rowInfo}>
                    <Text style={styles.rowTitle} numberOfLines={1}>
                      {order.orderNumber}
                    </Text>
                    <Text style={styles.rowSubtitle}>
                      {formatPrice(order.totalAmount)} ·{' '}
                      {formatDateTime(order.createdAt)}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.statusPill,
                      {
                        backgroundColor:
                          order.status === 'CANCELLED' ? '#FEF2F2' : '#DBEAFE',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusPillText,
                        {
                          color:
                            order.status === 'CANCELLED' ? '#B91C1C' : '#1D4ED8',
                        },
                      ]}
                    >
                      {order.status}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.smallButton}
                    disabled={busy === `o-${order.publicId}`}
                    onPress={() => {
                      // Quick status advance through the allowed transitions.
                      const orderStatuses = ORDER_STATUSES;
                      const idx = orderStatuses.indexOf(order.status);
                      const next = orderStatuses[idx + 1];
                      if (!next || order.status === 'CANCELLED') {
                        Alert.alert(
                          'Status',
                          'No further status transition is available for this order.'
                        );
                        return;
                      }
                      advanceOrder(order, next);
                    }}
                  >
                    {busy === `o-${order.publicId}` ? (
                      <ActivityIndicator size="small" color="#7C3AED" />
                    ) : (
                      <Ionicons name="arrow-forward-circle-outline" size={20} color="#7C3AED" />
                    )}
                  </TouchableOpacity>
                </View>
              ))
            )}
          </>
        )}

        {/* ================= USERS ================= */}
        {tab === 'users' && (
          <>
            <Text style={styles.sectionLabel}>Users ({users.length})</Text>
            {users.length === 0 ? (
              <EmptyState text="No users found" />
            ) : (
              users.map((user) => (
                <View key={user.publicId} style={styles.rowCard}>
                  <View style={styles.rowInfo}>
                    <Text style={styles.rowTitle} numberOfLines={1}>
                      {user.firstName} {user.lastName}
                    </Text>
                    <Text style={styles.rowSubtitle}>
                      {user.email} · {user.roles?.join(', ')}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.statusPill,
                      { backgroundColor: user.active ? '#DCFCE7' : '#FEF2F2' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusPillText,
                        { color: user.active ? '#15803D' : '#B91C1C' },
                      ]}
                    >
                      {user.active ? 'ACTIVE' : 'DISABLED'}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.smallButton}
                    disabled={busy === `u-${user.publicId}`}
                    onPress={() => toggleUserActive(user)}
                  >
                    {busy === `u-${user.publicId}` ? (
                      <ActivityIndicator size="small" color="#16A34A" />
                    ) : (
                      <Ionicons
                        name={user.active ? 'ban-outline' : 'checkmark-circle-outline'}
                        size={20}
                        color="#16A34A"
                      />
                    )}
                  </TouchableOpacity>
                </View>
              ))
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

function StatCard({ icon, label, value, color, onPress }) {
  return (
    <TouchableOpacity
      style={styles.statCard}
      activeOpacity={0.85}
      onPress={onPress}
    >
      <View style={[styles.statIcon, { backgroundColor: `${color}18` }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

function EmptyState({ text }) {
  return (
    <View style={styles.emptyBox}>
      <Ionicons name="file-tray-outline" size={40} color="#CBD5E1" />
      <Text style={styles.emptyText}>{text}</Text>
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
    paddingHorizontal: 30,
  },

  loadingText: {
    marginTop: 14,
    fontSize: 15,
    color: '#64748B',
    fontWeight: '600',
  },

  deniedTitle: {
    marginTop: 18,
    fontSize: 22,
    fontWeight: '800',
    color: '#1E293B',
  },

  deniedText: {
    marginTop: 8,
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 23,
  },

  header: {
    paddingTop: 55,
    paddingBottom: 22,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },

  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '900',
  },

  headerSubtitle: {
    color: '#DBEAFE',
    fontSize: 14,
    marginTop: 5,
  },

  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },

  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    marginHorizontal: 3,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 5,
  },

  tabActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },

  tabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },

  tabTextActive: {
    color: '#FFFFFF',
  },

  content: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  statCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  statValue: {
    fontSize: 26,
    fontWeight: '900',
    color: '#101828',
  },

  statLabel: {
    marginTop: 2,
    fontSize: 13,
    color: '#667085',
    fontWeight: '600',
  },

  sectionLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: '#101828',
    marginVertical: 12,
  },

  rowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  rowInfo: {
    flex: 1,
    marginRight: 8,
  },

  rowTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },

  rowSubtitle: {
    marginTop: 3,
    fontSize: 12,
    color: '#667085',
  },

  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    marginRight: 6,
  },

  statusPillText: {
    fontSize: 11,
    fontWeight: '800',
  },

  smallButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },

  emptyBox: {
    alignItems: 'center',
    paddingVertical: 40,
  },

  emptyText: {
    marginTop: 10,
    fontSize: 14,
    color: '#94A3B8',
  },
});
