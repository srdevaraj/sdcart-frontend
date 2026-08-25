// src/screens/Admin.js
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
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
import { useTheme } from '../theme';
import { AnimatedPressable } from '../components/common/AnimatedPressable';
import { ScreenHeader } from '../components/common/ScreenHeader';
import { useToast } from '../context/ToastContext';

const TABS = [
  { key: 'overview', label: 'Overview', icon: 'speedometer-outline' },
  { key: 'products', label: 'Products', icon: 'cube-outline' },
  { key: 'orders', label: 'Orders', icon: 'receipt-outline' },
  { key: 'users', label: 'Users', icon: 'people-outline' },
];

const ORDER_STATUSES = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

export default function Admin() {
  const { isAdmin } = useAuth();
  const { colors, typography, radius, shadows, isDark } = useTheme();
  const { showSuccess, showError } = useToast();

  const [tab, setTab] = useState('overview');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [busy, setBusy] = useState(null);

  const fetchAll = useCallback(async () => {
    try {
      const [p, o, u, pay] = await Promise.all([
        adminListProducts({ size: 25 }).catch(() => ({ content: [] })),
        adminListOrders({ size: 25 }).catch(() => ({ content: [] })),
        adminListUsers({ size: 25 }).catch(() => ({ content: [] })),
        adminListPayments({ size: 25 }).catch(() => ({ content: [] })),
      ]);
      setProducts(p?.content || []);
      setOrders(o?.content || []);
      setUsers(u?.content || []);
      setPayments(pay?.content || []);
    } catch (err) {
      showError(getErrorMessage(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  if (!isAdmin) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        <Ionicons name="shield-outline" size={80} color={colors.textMuted} />
        <Text style={[styles.deniedTitle, { color: colors.text, fontWeight: typography.weights.extrabold }]}>
          Access Denied
        </Text>
        <Text style={[styles.deniedText, { color: colors.textSecondary }]}>
          You do not have permission to view the admin dashboard.
        </Text>
      </View>
    );
  }

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAll();
  };

  const toggleProductStatus = async (product) => {
    const next = product.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      setBusy(`p-${product.publicId}`);
      const updated = await adminUpdateProductStatus(product.publicId, next);
      setProducts((prev) =>
        prev.map((p) => (p.publicId === product.publicId ? updated : p))
      );
      showSuccess(`Product ${next === 'ACTIVE' ? 'activated' : 'deactivated'}`);
    } catch (err) {
      showError(getErrorMessage(err));
    } finally {
      setBusy(null);
    }
  };

  const deleteProduct = (product) => {
    Alert.alert(
      'Deactivate Product',
      `Deactivate "${product.name}"? It will disappear from the catalog.`,
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
              showSuccess('Product removed from catalog');
            } catch (err) {
              showError(getErrorMessage(err));
            } finally {
              setBusy(null);
            }
          },
        },
      ]
    );
  };

  const advanceOrder = async (order, status) => {
    try {
      setBusy(`o-${order.publicId}`);
      const updated = await adminUpdateOrderStatus(order.publicId, status);
      setOrders((prev) =>
        prev.map((o) => (o.publicId === order.publicId ? updated : o))
      );
      showSuccess(`Order status updated to ${status}`);
    } catch (err) {
      showError(getErrorMessage(err));
    } finally {
      setBusy(null);
    }
  };

  const toggleUserActive = async (user) => {
    try {
      setBusy(`u-${user.publicId}`);
      const updated = await adminSetUserActive(user.publicId, !user.active);
      setUsers((prev) =>
        prev.map((u) => (u.publicId === user.publicId ? updated : u))
      );
      showSuccess(`User ${!user.active ? 'enabled' : 'disabled'}`);
    } catch (err) {
      showError(getErrorMessage(err));
    } finally {
      setBusy(null);
    }
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Loading admin dashboard...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <ScreenHeader
        title="Admin Control Center"
        subtitle="System management & analytics"
        showBack
        showCart={false}
      />

      {/* Tabs */}
      <View style={styles.tabRow}>
        {TABS.map((t) => {
          const isActive = tab === t.key;
          return (
            <AnimatedPressable
              key={t.key}
              onPress={() => setTab(t.key)}
              scaleTo={0.92}
              haptic="selection"
              style={[
                styles.tabItem,
                {
                  backgroundColor: isActive ? colors.primary : colors.surface,
                  borderColor: isActive ? colors.primary : colors.border,
                  borderRadius: radius.lg,
                },
              ]}
            >
              <Ionicons
                name={t.icon}
                size={16}
                color={isActive ? '#FFFFFF' : colors.textSecondary}
              />
              <Text
                style={[
                  styles.tabText,
                  {
                    color: isActive ? '#FFFFFF' : colors.text,
                    fontWeight: isActive ? typography.weights.bold : typography.weights.medium,
                  },
                ]}
              >
                {t.label}
              </Text>
            </AnimatedPressable>
          );
        })}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 60 }]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
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
              color={colors.primary}
              onPress={() => setTab('products')}
              colors={colors}
              typography={typography}
              radius={radius}
              shadows={shadows}
            />
            <StatCard
              icon="receipt-outline"
              label="Orders"
              value={orders.length}
              color="#7C3AED"
              onPress={() => setTab('orders')}
              colors={colors}
              typography={typography}
              radius={radius}
              shadows={shadows}
            />
            <StatCard
              icon="people-outline"
              label="Users"
              value={users.length}
              color={colors.success}
              onPress={() => setTab('users')}
              colors={colors}
              typography={typography}
              radius={radius}
              shadows={shadows}
            />
            <StatCard
              icon="card-outline"
              label="Payments"
              value={payments.length}
              color={colors.accent}
              colors={colors}
              typography={typography}
              radius={radius}
              shadows={shadows}
            />
          </View>
        )}

        {/* ================= PRODUCTS ================= */}
        {tab === 'products' && (
          <View>
            <Text style={[styles.sectionHeading, { color: colors.text, fontWeight: typography.weights.bold }]}>
              All Products ({products.length})
            </Text>

            {products.map((product) => (
              <View
                key={product.publicId}
                style={[
                  styles.adminCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    borderRadius: radius.xl,
                    ...shadows.xs,
                  },
                ]}
              >
                <View style={styles.cardInfo}>
                  <Text style={[styles.itemTitle, { color: colors.text, fontWeight: typography.weights.bold }]} numberOfLines={1}>
                    {product.name}
                  </Text>
                  <Text style={[styles.itemSubtitle, { color: colors.textSecondary }]}>
                    {formatPrice(product.price)} · Stock: {product.stockQuantity ?? 0}
                  </Text>
                </View>

                <View
                  style={[
                    styles.statusPill,
                    {
                      backgroundColor: product.status === 'ACTIVE' ? colors.successMuted : colors.dangerMuted,
                      borderRadius: radius.sm,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusPillText,
                      {
                        color: product.status === 'ACTIVE' ? colors.success : colors.danger,
                        fontWeight: typography.weights.bold,
                      },
                    ]}
                  >
                    {product.status}
                  </Text>
                </View>

                <AnimatedPressable
                  onPress={() => toggleProductStatus(product)}
                  disabled={busy === `p-${product.publicId}`}
                  scaleTo={0.9}
                  haptic="medium"
                  style={[styles.iconBtn, { backgroundColor: colors.surfaceSubtle, borderRadius: radius.md }]}
                >
                  {busy === `p-${product.publicId}` ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                  ) : (
                    <Ionicons
                      name={product.status === 'ACTIVE' ? 'eye-off-outline' : 'eye-outline'}
                      size={18}
                      color={colors.primary}
                    />
                  )}
                </AnimatedPressable>

                <AnimatedPressable
                  onPress={() => deleteProduct(product)}
                  disabled={busy === `d-${product.publicId}`}
                  scaleTo={0.9}
                  haptic="heavy"
                  style={[styles.iconBtn, { backgroundColor: colors.dangerMuted, borderRadius: radius.md }]}
                >
                  <Ionicons name="trash-outline" size={18} color={colors.danger} />
                </AnimatedPressable>
              </View>
            ))}
          </View>
        )}

        {/* ================= ORDERS ================= */}
        {tab === 'orders' && (
          <View>
            <Text style={[styles.sectionHeading, { color: colors.text, fontWeight: typography.weights.bold }]}>
              All Orders ({orders.length})
            </Text>

            {orders.map((order) => (
              <View
                key={order.publicId}
                style={[
                  styles.adminCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    borderRadius: radius.xl,
                    ...shadows.xs,
                  },
                ]}
              >
                <View style={styles.cardInfo}>
                  <Text style={[styles.itemTitle, { color: colors.text, fontWeight: typography.weights.bold }]} numberOfLines={1}>
                    #{order.orderNumber}
                  </Text>
                  <Text style={[styles.itemSubtitle, { color: colors.textSecondary }]}>
                    {formatPrice(order.totalAmount)} · {formatDateTime(order.createdAt)}
                  </Text>
                </View>

                <View
                  style={[
                    styles.statusPill,
                    {
                      backgroundColor: order.status === 'CANCELLED' ? colors.dangerMuted : colors.primaryMuted,
                      borderRadius: radius.sm,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusPillText,
                      {
                        color: order.status === 'CANCELLED' ? colors.danger : colors.primary,
                        fontWeight: typography.weights.bold,
                      },
                    ]}
                  >
                    {order.status}
                  </Text>
                </View>

                <AnimatedPressable
                  onPress={() => {
                    const idx = ORDER_STATUSES.indexOf(order.status);
                    const next = ORDER_STATUSES[idx + 1];
                    if (!next || order.status === 'CANCELLED') {
                      Alert.alert('Status', 'No further status advance available.');
                      return;
                    }
                    advanceOrder(order, next);
                  }}
                  disabled={busy === `o-${order.publicId}`}
                  scaleTo={0.9}
                  haptic="selection"
                  style={[styles.iconBtn, { backgroundColor: colors.surfaceSubtle, borderRadius: radius.md }]}
                >
                  {busy === `o-${order.publicId}` ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                  ) : (
                    <Ionicons name="arrow-forward-circle" size={20} color={colors.primary} />
                  )}
                </AnimatedPressable>
              </View>
            ))}
          </View>
        )}

        {/* ================= USERS ================= */}
        {tab === 'users' && (
          <View>
            <Text style={[styles.sectionHeading, { color: colors.text, fontWeight: typography.weights.bold }]}>
              Registered Users ({users.length})
            </Text>

            {users.map((user) => (
              <View
                key={user.publicId}
                style={[
                  styles.adminCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    borderRadius: radius.xl,
                    ...shadows.xs,
                  },
                ]}
              >
                <View style={styles.cardInfo}>
                  <Text style={[styles.itemTitle, { color: colors.text, fontWeight: typography.weights.bold }]} numberOfLines={1}>
                    {user.firstName || ''} {user.lastName || ''}
                  </Text>
                  <Text style={[styles.itemSubtitle, { color: colors.textSecondary }]}>
                    {user.email} · {user.roles?.join(', ') || 'USER'}
                  </Text>
                </View>

                <View
                  style={[
                    styles.statusPill,
                    {
                      backgroundColor: user.active ? colors.successMuted : colors.dangerMuted,
                      borderRadius: radius.sm,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusPillText,
                      {
                        color: user.active ? colors.success : colors.danger,
                        fontWeight: typography.weights.bold,
                      },
                    ]}
                  >
                    {user.active ? 'ACTIVE' : 'DISABLED'}
                  </Text>
                </View>

                <AnimatedPressable
                  onPress={() => toggleUserActive(user)}
                  disabled={busy === `u-${user.publicId}`}
                  scaleTo={0.9}
                  haptic="medium"
                  style={[styles.iconBtn, { backgroundColor: colors.surfaceSubtle, borderRadius: radius.md }]}
                >
                  {busy === `u-${user.publicId}` ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                  ) : (
                    <Ionicons
                      name={user.active ? 'ban-outline' : 'checkmark-circle-outline'}
                      size={18}
                      color={user.active ? colors.danger : colors.success}
                    />
                  )}
                </AnimatedPressable>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function StatCard({ icon, label, value, color, onPress, colors, typography, radius, shadows }) {
  return (
    <AnimatedPressable
      onPress={onPress}
      scaleTo={0.96}
      haptic="selection"
      style={[
        styles.statCard,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderRadius: radius.xl,
          ...shadows.xs,
        },
      ]}
    >
      <View style={[styles.statIconBox, { backgroundColor: `${color}18`, borderRadius: radius.md }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <Text style={[styles.statValue, { color: colors.text, fontWeight: typography.weights.black }]}>
        {value}
      </Text>
      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
        {label}
      </Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  deniedTitle: {
    fontSize: 20,
    marginTop: 16,
    marginBottom: 8,
  },
  deniedText: {
    fontSize: 14,
    textAlign: 'center',
  },
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderWidth: 1,
    gap: 4,
  },
  tabText: {
    fontSize: 12,
  },
  scrollContent: {
    padding: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  statCard: {
    width: '48%',
    padding: 16,
    borderWidth: 1,
  },
  statIconBox: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 24,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  sectionHeading: {
    fontSize: 16,
    marginBottom: 12,
  },
  adminCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    gap: 8,
  },
  cardInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 14,
  },
  itemSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusPillText: {
    fontSize: 11,
  },
  iconBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
