// src/screens/Cart.js
import React, { useState, useCallback, useMemo, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  RefreshControl,
  ActivityIndicator,
  StatusBar,
  Platform,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useCart } from '../context/CartContext';
import { useTheme } from '../theme';
import { formatPrice } from '../services/format';
import { AppImage } from '../components/common/AppImage';
import { AnimatedPressable } from '../components/common/AnimatedPressable';
import { ScreenHeader } from '../components/common/ScreenHeader';
import { useToast } from '../context/ToastContext';

export default function Cart() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { colors, typography, radius, shadows, isDark } = useTheme();
  const {
    cartItems,
    removeFromCart,
    reloadCart,
    updateQuantity,
    totalAmount,
    totalQuantity,
    loading: cartLoading,
  } = useCart();
  const { showSuccess, showError } = useToast();

  const [refreshing, setRefreshing] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [busyItemMap, setBusyItemMap] = useState({});

  useFocusEffect(
    useCallback(() => {
      reloadCart().catch(() => {});
    }, [reloadCart])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await reloadCart();
    } finally {
      setRefreshing(false);
    }
  };

  const handleQtyChange = async (itemId, currentQty, delta) => {
    const nextQty = currentQty + delta;
    if (nextQty < 1) {
      handleRemoveItem(itemId);
      return;
    }

    setBusyItemMap((prev) => ({ ...prev, [itemId]: true }));
    try {
      const result = await updateQuantity(itemId, nextQty);
      if (!result?.success) {
        showError(result?.message || 'Unable to update quantity');
      }
    } catch (e) {
      showError('Quantity update failed');
    } finally {
      setBusyItemMap((prev) => ({ ...prev, [itemId]: false }));
    }
  };

  const handleRemoveItem = (itemId) => {
    Alert.alert(
      'Remove Item',
      'Are you sure you want to remove this item from your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            setBusyItemMap((prev) => ({ ...prev, [itemId]: true }));
            try {
              const result = await removeFromCart(itemId);
              if (result?.success) {
                showSuccess('Item removed from cart');
              } else {
                showError(result?.message || 'Failed to remove item');
              }
            } finally {
              setBusyItemMap((prev) => ({ ...prev, [itemId]: false }));
            }
          },
        },
      ]
    );
  };

  const toggleSelectItem = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleDeleteSelected = () => {
    if (selectedItems.length === 0) return;

    Alert.alert(
      'Delete Selected',
      `Remove ${selectedItems.length} items from your cart?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            for (const id of selectedItems) {
              await removeFromCart(id);
            }
            setSelectedItems([]);
            setEditMode(false);
            showSuccess('Selected items removed');
          },
        },
      ]
    );
  };

  const handleProceedCheckout = () => {
    if (!cartItems || cartItems.length === 0) {
      showError('Please add items to cart before proceeding');
      return;
    }
    navigation.navigate('DeliveryAddress', { selectMode: true });
  };

  const renderCartItem = useCallback(
    ({ item }) => {
      const isBusy = busyItemMap[item.id];
      const isSelected = selectedItems.includes(item.id);
      const itemPrice = Number(item.price || 0);
      const quantity = item.quantity || 1;
      const subtotal = itemPrice * quantity;

      return (
        <View
          style={[
            styles.itemCard,
            {
              backgroundColor: colors.surface,
              borderColor: isSelected ? colors.primary : colors.border,
              borderRadius: radius.xl,
              ...shadows.xs,
            },
          ]}
        >
          {editMode && (
            <AnimatedPressable
              onPress={() => toggleSelectItem(item.id)}
              style={styles.selectCheckbox}
              haptic="selection"
            >
              <Ionicons
                name={isSelected ? 'checkbox' : 'square-outline'}
                size={22}
                color={isSelected ? colors.primary : colors.textMuted}
              />
            </AnimatedPressable>
          )}

          <AnimatedPressable
            onPress={() => {
              if (item.productId) {
                navigation.navigate('SelectedProduct', { id: item.productId });
              }
            }}
            style={[
              styles.itemImageWrap,
              {
                backgroundColor: colors.surfaceSubtle,
                borderRadius: radius.lg,
              },
            ]}
          >
            <AppImage
              source={item.imageUrl}
              style={styles.itemImage}
              contentFit="contain"
            />
          </AnimatedPressable>

          <View style={styles.itemDetails}>
            <Text
              style={[
                styles.itemTitle,
                { color: colors.text, fontWeight: typography.weights.bold },
              ]}
              numberOfLines={2}
            >
              {item.name}
            </Text>

            <Text
              style={[
                styles.itemPriceText,
                { color: colors.primary, fontWeight: typography.weights.black },
              ]}
            >
              {formatPrice(subtotal)}
            </Text>

            {/* Quantity Stepper */}
            <View style={styles.actionRow}>
              <View
                style={[
                  styles.stepperWrap,
                  {
                    backgroundColor: isDark ? colors.backgroundSecondary : '#F1F5F9',
                    borderRadius: radius.full,
                  },
                ]}
              >
                <AnimatedPressable
                  onPress={() => handleQtyChange(item.id, quantity, -1)}
                  disabled={isBusy}
                  scaleTo={0.88}
                  haptic="medium"
                  style={styles.stepBtn}
                  accessibilityLabel="Decrease quantity"
                >
                  <Ionicons
                    name={quantity === 1 ? 'trash-outline' : 'remove'}
                    size={16}
                    color={quantity === 1 ? colors.danger : colors.text}
                  />
                </AnimatedPressable>

                <View style={styles.qtyDisplay}>
                  {isBusy ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                  ) : (
                    <Text
                      style={[
                        styles.qtyText,
                        { color: colors.text, fontWeight: typography.weights.bold },
                      ]}
                    >
                      {quantity}
                    </Text>
                  )}
                </View>

                <AnimatedPressable
                  onPress={() => handleQtyChange(item.id, quantity, 1)}
                  disabled={isBusy}
                  scaleTo={0.88}
                  haptic="medium"
                  style={styles.stepBtn}
                  accessibilityLabel="Increase quantity"
                >
                  <Ionicons name="add" size={16} color={colors.text} />
                </AnimatedPressable>
              </View>

              {!editMode && (
                <AnimatedPressable
                  onPress={() => handleRemoveItem(item.id)}
                  style={styles.trashBtn}
                  haptic="light"
                  accessibilityLabel="Delete item"
                >
                  <Ionicons name="trash-outline" size={18} color={colors.danger} />
                </AnimatedPressable>
              )}
            </View>
          </View>
        </View>
      );
    },
    [busyItemMap, selectedItems, editMode, colors, typography, radius, shadows, isDark, navigation]
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <ScreenHeader
        title="My Shopping Cart"
        subtitle={`${totalQuantity} items · ${formatPrice(totalAmount)}`}
        showCart={false}
        rightElement={
          cartItems.length > 0 ? (
            <AnimatedPressable
              onPress={() => {
                if (editMode) {
                  setSelectedItems([]);
                }
                setEditMode(!editMode);
              }}
              style={styles.editToggleBtn}
              haptic="selection"
            >
              <Text
                style={[
                  styles.editToggleText,
                  { color: colors.primary, fontWeight: typography.weights.bold },
                ]}
              >
                {editMode ? 'Done' : 'Edit'}
              </Text>
            </AnimatedPressable>
          ) : null
        }
      />

      {/* Cart Content */}
      <FlatList
        data={cartItems}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderCartItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.listContent, { paddingBottom: 150 }]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={[styles.emptyCircle, { backgroundColor: colors.surfaceSubtle }]}>
              <MaterialCommunityIcons name="cart-off" size={64} color={colors.textMuted} />
            </View>
            <Text
              style={[
                styles.emptyTitle,
                { color: colors.text, fontWeight: typography.weights.extrabold },
              ]}
            >
              Your Cart is Empty
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              Looks like you haven't added anything to your cart yet.
            </Text>
            <AnimatedPressable
              onPress={() => navigation.navigate('Products')}
              scaleTo={0.95}
              style={[
                styles.shopNowBtn,
                { backgroundColor: colors.primary, borderRadius: radius.full },
              ]}
              haptic="selection"
            >
              <Text style={styles.shopNowText}>Start Shopping</Text>
            </AnimatedPressable>
          </View>
        }
        ListFooterComponent={
          cartItems.length > 0 ? (
            <View
              style={[
                styles.summaryCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderRadius: radius.xl,
                },
              ]}
            >
              <Text
                style={[
                  styles.summaryTitle,
                  { color: colors.text, fontWeight: typography.weights.bold },
                ]}
              >
                Order Summary
              </Text>

              <View style={styles.summaryRow}>
                <Text style={[styles.summaryKey, { color: colors.textSecondary }]}>
                  Items Subtotal ({totalQuantity})
                </Text>
                <Text style={[styles.summaryVal, { color: colors.text, fontWeight: typography.weights.semibold }]}>
                  {formatPrice(totalAmount)}
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={[styles.summaryKey, { color: colors.textSecondary }]}>
                  Estimated Shipping
                </Text>
                <Text style={[styles.freeDeliveryText, { color: colors.success, fontWeight: typography.weights.bold }]}>
                  FREE
                </Text>
              </View>

              <View style={[styles.summaryDivider, { backgroundColor: colors.borderLight }]} />

              <View style={styles.totalRow}>
                <Text style={[styles.totalKey, { color: colors.text, fontWeight: typography.weights.extrabold }]}>
                  Total Amount
                </Text>
                <Text style={[styles.totalVal, { color: colors.primary, fontWeight: typography.weights.black }]}>
                  {formatPrice(totalAmount)}
                </Text>
              </View>
            </View>
          ) : null
        }
      />

      {/* Sticky Bottom Bar */}
      {cartItems.length > 0 && (
        <View
          style={[
            styles.bottomSticky,
            {
              paddingBottom: Math.max(insets.bottom, Platform.OS === 'ios' ? 20 : 12),
              backgroundColor: colors.surface,
              borderTopColor: colors.border,
              ...shadows.lg,
            },
          ]}
        >
          {editMode ? (
            <AnimatedPressable
              onPress={handleDeleteSelected}
              disabled={selectedItems.length === 0}
              scaleTo={0.96}
              haptic="heavy"
              style={[
                styles.deleteSelectedBtn,
                {
                  backgroundColor: selectedItems.length > 0 ? colors.danger : colors.border,
                  borderRadius: radius.xl,
                },
              ]}
            >
              <Ionicons name="trash" size={18} color="#FFFFFF" />
              <Text style={styles.deleteSelectedText}>
                Delete Selected ({selectedItems.length})
              </Text>
            </AnimatedPressable>
          ) : (
            <View style={styles.checkoutBarInner}>
              <View>
                <Text style={[styles.checkoutTotalLabel, { color: colors.textMuted }]}>
                  Total Price
                </Text>
                <Text style={[styles.checkoutTotalAmount, { color: colors.text, fontWeight: typography.weights.black }]}>
                  {formatPrice(totalAmount)}
                </Text>
              </View>

              <AnimatedPressable
                onPress={handleProceedCheckout}
                scaleTo={0.96}
                haptic="heavy"
                style={[
                  styles.checkoutBtn,
                  {
                    backgroundColor: colors.primary,
                    borderRadius: radius.xl,
                    ...shadows.glowPrimary,
                  },
                ]}
              >
                <Text style={styles.checkoutBtnText}>Checkout</Text>
                <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
              </AnimatedPressable>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  editToggleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  editToggleText: {
    fontSize: 14,
  },
  listContent: {
    padding: 16,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  selectCheckbox: {
    marginRight: 10,
  },
  itemImageWrap: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemImage: {
    width: '85%',
    height: '85%',
  },
  itemDetails: {
    flex: 1,
    marginLeft: 14,
  },
  itemTitle: {
    fontSize: 14,
    lineHeight: 19,
  },
  itemPriceText: {
    fontSize: 16,
    marginTop: 4,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  stepperWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  stepBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyDisplay: {
    minWidth: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyText: {
    fontSize: 14,
  },
  trashBtn: {
    padding: 6,
  },
  summaryCard: {
    padding: 18,
    marginTop: 8,
    borderWidth: 1,
  },
  summaryTitle: {
    fontSize: 16,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  summaryKey: {
    fontSize: 13,
  },
  summaryVal: {
    fontSize: 13,
  },
  freeDeliveryText: {
    fontSize: 13,
  },
  summaryDivider: {
    height: 1,
    marginVertical: 10,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
  },
  totalKey: {
    fontSize: 16,
  },
  totalVal: {
    fontSize: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
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
  shopNowBtn: {
    paddingHorizontal: 32,
    paddingVertical: 14,
  },
  shopNowText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  bottomSticky: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  checkoutBarInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  checkoutTotalLabel: {
    fontSize: 11,
    textTransform: 'uppercase',
  },
  checkoutTotalAmount: {
    fontSize: 22,
  },
  checkoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingVertical: 14,
    gap: 8,
  },
  checkoutBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  deleteSelectedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  deleteSelectedText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
