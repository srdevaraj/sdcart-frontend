// src/screens/OrderScreen.js
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  StatusBar,
  Platform,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { getAddresses } from '../services/addressService';
import { createOrder } from '../services/orderService';
import { validateCoupon } from '../services/couponService';
import { getErrorMessage } from '../services/apiClient';
import { formatPrice } from '../services/format';
import { useTheme } from '../theme';
import { AppImage } from '../components/common/AppImage';
import { AnimatedPressable } from '../components/common/AnimatedPressable';
import { ScreenHeader } from '../components/common/ScreenHeader';
import { useToast } from '../context/ToastContext';

export default function OrderScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { colors, typography, radius, shadows, isDark } = useTheme();
  const { userInfo } = useAuth();
  const { cartItems, totalAmount, reloadCart } = useCart();
  const { showSuccess, showError } = useToast();

  const { addressId } = route.params || {};

  const [address, setAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('CARD');
  const [couponCode, setCouponCode] = useState('');
  const [coupon, setCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    reloadCart().catch(() => {});
    getAddresses()
      .then((list) => {
        if (Array.isArray(list) && list.length > 0) {
          const found = list.find((a) => a.publicId === addressId);
          setAddress(found || list.find((a) => a.isDefault) || list[0]);
        }
      })
      .catch(() => {
        showError('Unable to load your delivery address.');
      });
  }, [addressId, reloadCart, showError]);

  const subtotal = Number(totalAmount || 0);
  const discount = Number(coupon?.discountAmount || 0);
  const estimatedTotal = Math.max(subtotal - discount, 0);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;

    setCouponLoading(true);
    try {
      const result = await validateCoupon(couponCode.trim(), subtotal);
      if (result?.valid) {
        setCoupon(result);
        showSuccess(`Coupon ${result.code} applied! Save ${formatPrice(result.discountAmount)}`);
      } else {
        setCoupon(null);
        showError(result?.message || 'Invalid or expired coupon');
      }
    } catch (error) {
      setCoupon(null);
      showError(getErrorMessage(error));
    } finally {
      setCouponLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!address) {
      showError('Please select a delivery address');
      return;
    }

    if (cartItems.length === 0) {
      showError('Your cart is empty');
      return;
    }

    if (placing) return;
    setPlacing(true);

    try {
      const order = await createOrder({
        addressId: address.publicId,
        paymentMethod,
        couponCode: coupon ? coupon.code : undefined,
      });

      navigation.replace('Payment', {
        orderPublicId: order.publicId,
      });
    } catch (error) {
      showError(getErrorMessage(error));
      setPlacing(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <ScreenHeader
        title="Checkout & Review"
        subtitle="Step 2 of 2 · Secure Order"
        showBack
        showCart={false}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 140 }]}
      >
        {/* ================= DELIVERY ADDRESS ================= */}
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
          <View style={styles.cardTopRow}>
            <View style={styles.cardHeadingWrap}>
              <MaterialCommunityIcons name="map-marker-radius" size={20} color={colors.primary} />
              <Text style={[styles.cardTitle, { color: colors.text, fontWeight: typography.weights.bold }]}>
                Delivery Address
              </Text>
            </View>

            <AnimatedPressable
              onPress={() => navigation.navigate('DeliveryAddress', { selectMode: true })}
              scaleTo={0.92}
              haptic="selection"
            >
              <Text style={[styles.changeLink, { color: colors.primary, fontWeight: typography.weights.bold }]}>
                Change
              </Text>
            </AnimatedPressable>
          </View>

          {address ? (
            <View style={styles.addressBox}>
              <Text style={[styles.addressName, { color: colors.text, fontWeight: typography.weights.bold }]}>
                {address.recipientName} · {address.phone}
              </Text>
              <Text style={[styles.addressDetail, { color: colors.textSecondary }]}>
                {address.line1}
                {address.line2 ? `, ${address.line2}` : ''}
              </Text>
              <Text style={[styles.addressDetail, { color: colors.textSecondary }]}>
                {address.city}
                {address.state ? `, ${address.state}` : ''} · {address.postalCode}
              </Text>
            </View>
          ) : (
            <AnimatedPressable
              onPress={() => navigation.navigate('DeliveryAddress', { selectMode: true })}
              style={[styles.addAddressPrompt, { backgroundColor: colors.surfaceSubtle, borderRadius: radius.md }]}
            >
              <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
              <Text style={[styles.addAddressText, { color: colors.primary, fontWeight: typography.weights.bold }]}>
                Select or add a delivery address
              </Text>
            </AnimatedPressable>
          )}
        </View>

        {/* ================= ORDER ITEMS ================= */}
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
          <View style={styles.cardHeadingWrap}>
            <Ionicons name="cart-outline" size={20} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.text, fontWeight: typography.weights.bold }]}>
              Items in Order ({cartItems.length})
            </Text>
          </View>

          {cartItems.map((item) => (
            <View key={item.id} style={styles.orderItemRow}>
              <View style={[styles.itemThumbWrap, { backgroundColor: colors.surfaceSubtle, borderRadius: radius.md }]}>
                <AppImage source={item.imageUrl} style={styles.itemThumb} contentFit="contain" />
              </View>

              <View style={styles.orderItemInfo}>
                <Text style={[styles.orderItemTitle, { color: colors.text, fontWeight: typography.weights.semibold }]} numberOfLines={2}>
                  {item.name}
                </Text>
                <View style={styles.orderItemMeta}>
                  <Text style={[styles.orderItemQty, { color: colors.textMuted }]}>
                    Qty: {item.quantity}
                  </Text>
                  <Text style={[styles.orderItemPrice, { color: colors.primary, fontWeight: typography.weights.bold }]}>
                    {formatPrice(Number(item.price || 0) * (item.quantity || 1))}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* ================= PAYMENT METHOD ================= */}
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
          <View style={styles.cardHeadingWrap}>
            <Ionicons name="card-outline" size={20} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.text, fontWeight: typography.weights.bold }]}>
              Payment Option
            </Text>
          </View>

          {[
            { key: 'CARD', label: 'Online Card / UPI Gateway', icon: 'card-outline', sub: 'Instant & secure checkout' },
            { key: 'PAYPAL', label: 'PayPal', icon: 'logo-paypal', sub: 'International payment' },
            { key: 'CASH_ON_DELIVERY', label: 'Cash on Delivery', icon: 'cash-outline', sub: 'Pay when delivered' },
          ].map((method) => {
            const isSelected = paymentMethod === method.key;
            return (
              <AnimatedPressable
                key={method.key}
                onPress={() => setPaymentMethod(method.key)}
                scaleTo={0.98}
                haptic="selection"
                style={[
                  styles.paymentOption,
                  {
                    backgroundColor: isSelected
                      ? isDark
                        ? 'rgba(59, 130, 246, 0.12)'
                        : 'rgba(37, 99, 235, 0.06)'
                      : 'transparent',
                    borderColor: isSelected ? colors.primary : colors.borderLight,
                    borderRadius: radius.lg,
                  },
                ]}
              >
                <View style={[styles.paymentIconWrap, { backgroundColor: isSelected ? colors.primaryMuted : colors.surfaceSubtle }]}>
                  <Ionicons name={method.icon} size={20} color={isSelected ? colors.primary : colors.textSecondary} />
                </View>

                <View style={styles.paymentTextWrap}>
                  <Text style={[styles.paymentLabel, { color: colors.text, fontWeight: isSelected ? typography.weights.bold : typography.weights.medium }]}>
                    {method.label}
                  </Text>
                  <Text style={[styles.paymentSub, { color: colors.textMuted }]}>
                    {method.sub}
                  </Text>
                </View>

                <Ionicons
                  name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                  size={22}
                  color={isSelected ? colors.primary : colors.textMuted}
                />
              </AnimatedPressable>
            );
          })}
        </View>

        {/* ================= COUPON PROMO ================= */}
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
          <View style={styles.cardHeadingWrap}>
            <Ionicons name="pricetag-outline" size={20} color={colors.accent} />
            <Text style={[styles.cardTitle, { color: colors.text, fontWeight: typography.weights.bold }]}>
              Apply Coupon
            </Text>
          </View>

          <View style={styles.couponInputWrap}>
            <TextInput
              style={[
                styles.couponInput,
                {
                  backgroundColor: colors.surfaceSubtle,
                  borderColor: colors.border,
                  color: colors.text,
                  borderRadius: radius.lg,
                },
              ]}
              placeholder="Enter promo code"
              placeholderTextColor={colors.textMuted}
              value={couponCode}
              onChangeText={(t) => {
                setCouponCode(t.toUpperCase());
                setCoupon(null);
              }}
              autoCapitalize="characters"
            />

            <AnimatedPressable
              onPress={handleApplyCoupon}
              disabled={couponLoading || !couponCode.trim()}
              scaleTo={0.92}
              haptic="medium"
              style={[
                styles.couponApplyBtn,
                {
                  backgroundColor: colors.primary,
                  borderRadius: radius.lg,
                  opacity: couponCode.trim() ? 1 : 0.6,
                },
              ]}
            >
              {couponLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.couponApplyText}>Apply</Text>
              )}
            </AnimatedPressable>
          </View>

          {coupon && (
            <View style={[styles.couponSuccessPill, { backgroundColor: colors.successMuted, borderRadius: radius.md }]}>
              <Ionicons name="checkmark-circle" size={16} color={colors.success} />
              <Text style={[styles.couponSuccessText, { color: colors.success, fontWeight: typography.weights.bold }]}>
                {coupon.code} applied · {formatPrice(coupon.discountAmount)} discount
              </Text>
            </View>
          )}
        </View>

        {/* ================= PRICE DETAILS ================= */}
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
          <Text style={[styles.cardTitle, { color: colors.text, fontWeight: typography.weights.bold, marginBottom: 12 }]}>
            Price Summary
          </Text>

          <View style={styles.summaryRow}>
            <Text style={[styles.summaryKey, { color: colors.textSecondary }]}>Subtotal</Text>
            <Text style={[styles.summaryVal, { color: colors.text, fontWeight: typography.weights.semibold }]}>
              {formatPrice(subtotal)}
            </Text>
          </View>

          {coupon && (
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryKey, { color: colors.success }]}>Coupon Discount</Text>
              <Text style={[styles.summaryVal, { color: colors.success, fontWeight: typography.weights.bold }]}>
                − {formatPrice(discount)}
              </Text>
            </View>
          )}

          <View style={styles.summaryRow}>
            <Text style={[styles.summaryKey, { color: colors.textSecondary }]}>Delivery Charges</Text>
            <Text style={[styles.summaryVal, { color: colors.success, fontWeight: typography.weights.bold }]}>
              FREE
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />

          <View style={styles.summaryRow}>
            <Text style={[styles.totalKey, { color: colors.text, fontWeight: typography.weights.black }]}>
              Estimated Total
            </Text>
            <Text style={[styles.totalVal, { color: colors.primary, fontWeight: typography.weights.black }]}>
              {formatPrice(estimatedTotal)}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* ================= STICKY PLACE ORDER BAR ================= */}
      <View
        style={[
          styles.stickyBottom,
          {
            paddingBottom: Math.max(insets.bottom, Platform.OS === 'ios' ? 20 : 12),
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
            ...shadows.lg,
          },
        ]}
      >
        <View>
          <Text style={[styles.bottomTotalLabel, { color: colors.textMuted }]}>
            To Pay
          </Text>
          <Text style={[styles.bottomTotalAmount, { color: colors.text, fontWeight: typography.weights.black }]}>
            {formatPrice(estimatedTotal)}
          </Text>
        </View>

        <AnimatedPressable
          onPress={handlePlaceOrder}
          disabled={placing}
          scaleTo={0.95}
          haptic="heavy"
          style={[
            styles.placeOrderBtn,
            {
              backgroundColor: colors.accent,
              borderRadius: radius.xl,
              ...shadows.glowAccent,
            },
          ]}
        >
          {placing ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.placeOrderBtnText}>Place Order</Text>
              <Ionicons name="lock-closed" size={16} color="#FFFFFF" />
            </>
          )}
        </AnimatedPressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  card: {
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardHeadingWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 15,
  },
  changeLink: {
    fontSize: 13,
  },
  addressBox: {
    paddingTop: 2,
  },
  addressName: {
    fontSize: 14,
    marginBottom: 4,
  },
  addressDetail: {
    fontSize: 13,
    lineHeight: 18,
  },
  addAddressPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    gap: 8,
  },
  addAddressText: {
    fontSize: 14,
  },
  orderItemRow: {
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
  orderItemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  orderItemTitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  orderItemMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  orderItemQty: {
    fontSize: 12,
  },
  orderItemPrice: {
    fontSize: 13,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
  },
  paymentIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentTextWrap: {
    flex: 1,
    marginLeft: 12,
  },
  paymentLabel: {
    fontSize: 14,
  },
  paymentSub: {
    fontSize: 11,
    marginTop: 1,
  },
  couponInputWrap: {
    flexDirection: 'row',
    gap: 10,
  },
  couponInput: {
    flex: 1,
    height: 46,
    paddingHorizontal: 14,
    borderWidth: 1,
    fontSize: 14,
  },
  couponApplyBtn: {
    paddingHorizontal: 20,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  couponApplyText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  couponSuccessPill: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    marginTop: 10,
    gap: 6,
  },
  couponSuccessText: {
    fontSize: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  summaryKey: {
    fontSize: 13,
  },
  summaryVal: {
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
  stickyBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  bottomTotalLabel: {
    fontSize: 11,
    textTransform: 'uppercase',
  },
  bottomTotalAmount: {
    fontSize: 22,
  },
  placeOrderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingVertical: 14,
    gap: 8,
  },
  placeOrderBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
