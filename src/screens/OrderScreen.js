import React, {
  useEffect,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  Ionicons,
  MaterialCommunityIcons,
} from '@expo/vector-icons';

import {
  useAuth,
} from '../context/AuthContext';

import {
  useCart,
} from '../context/CartContext';

import {
  getAddresses,
} from '../services/addressService';

import {
  createOrder,
} from '../services/orderService';

import {
  validateCoupon,
} from '../services/couponService';

import {
  getErrorMessage,
} from '../services/apiClient';

import {
  formatPrice,
} from '../services/format';

// ============================================================
// SCREEN
// ============================================================

export default function OrderScreen({
  navigation,
  route,
}) {

  const { userInfo } = useAuth();
  const {
    cartItems,
    totalAmount,
    reloadCart,
  } = useCart();

  const { addressId } = route.params || {};

  // ==========================================================
  // STATE
  // ==========================================================

  const [address, setAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('CARD');
  const [couponCode, setCouponCode] = useState('');
  const [coupon, setCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [placing, setPlacing] = useState(false);

  // ==========================================================
  // LOAD ADDRESS + CART
  // ==========================================================

  useEffect(() => {
    reloadCart().catch(() => {});
    getAddresses()
      .then((list) => {
        const found = list.find((a) => a.publicId === addressId);
        setAddress(found || list.find((a) => a.isDefault) || list[0] || null);
      })
      .catch(() => {
        Alert.alert('Error', 'Unable to load your delivery address.');
      });
  }, [addressId]);

  // ==========================================================
  // PRICE SUMMARY (estimate — backend is authoritative at order time)
  // ==========================================================

  const subtotal = Number(totalAmount || 0);
  const discount = Number(coupon?.discountAmount || 0);
  const estimatedTotal = Math.max(subtotal - discount, 0);

  // ==========================================================
  // COUPON
  // ==========================================================

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;

    setCouponLoading(true);
    try {
      const result = await validateCoupon(couponCode.trim(), subtotal);
      if (result?.valid) {
        setCoupon(result);
        Alert.alert('Coupon applied', result.message || 'Coupon applied successfully.');
      } else {
        setCoupon(null);
        Alert.alert('Invalid coupon', result?.message || 'This coupon cannot be applied.');
      }
    } catch (error) {
      setCoupon(null);
      Alert.alert('Coupon error', getErrorMessage(error));
    } finally {
      setCouponLoading(false);
    }
  };

  // ==========================================================
  // PLACE ORDER
  // ==========================================================

  const placeOrder = async () => {
    if (!address) {
      Alert.alert('Address required', 'Please select a delivery address.');
      return;
    }

    if (cartItems.length === 0) {
      Alert.alert('Cart empty', 'Your cart is empty.');
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
      Alert.alert('Unable to place order', getErrorMessage(error));
    } finally {
      setPlacing(false);
    }
  };

  // ==========================================================
  // EMPTY CART
  // ==========================================================

  if (cartItems.length === 0 && !placing) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <Ionicons name="cart-outline" size={42} color="#94A3B8" />
          </View>

          <Text style={styles.emptyTitle}>Your cart is empty</Text>

          <Text style={styles.emptyDescription}>
            Add products to your cart before checking out.
          </Text>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate('Products')}
          >
            <Text style={styles.backButtonText}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ==========================================================
  // MAIN UI
  // ==========================================================

  return (
    <SafeAreaView style={styles.safeArea}>

      {/* ====================================================
          HEADER
      ==================================================== */}

      <View style={styles.header}>

        <TouchableOpacity
          style={styles.headerBackButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={23} color="#172337" />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Order Summary</Text>
          <Text style={styles.headerSubtitle}>Review your order</Text>
        </View>

        <View style={styles.secureHeader}>
          <Ionicons name="lock-closed-outline" size={16} color="#15803D" />
        </View>

      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >

        {/* ==================================================
            ORDERING AS
        ================================================== */}

        <View style={styles.infoCard}>

          <View style={styles.infoIcon}>
            <Ionicons name="person-outline" size={20} color="#2874F0" />
          </View>

          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Ordering as</Text>

            <Text style={styles.infoValue} numberOfLines={1}>
              {userInfo?.email || 'Registered customer'}
            </Text>

            {userInfo?.phone ? (
              <Text style={styles.infoSecondary}>{userInfo.phone}</Text>
            ) : null}
          </View>

        </View>

        {/* ==================================================
            DELIVERY ADDRESS
        ================================================== */}

        <View style={styles.section}>

          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Delivery Address</Text>

            <TouchableOpacity
              onPress={() =>
                navigation.navigate('DeliveryAddress', { selectMode: true })
              }
            >
              <Text style={styles.changeText}>Change</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.addressCard}>
            <View style={styles.addressIcon}>
              <MaterialCommunityIcons name="map-marker-radius" size={22} color="#2563EB" />
            </View>

            <View style={styles.addressContent}>
              {address ? (
                <>
                  <Text style={styles.addressName}>
                    {address.recipientName} · {address.phone}
                  </Text>
                  <Text style={styles.addressLine}>
                    {address.line1}
                    {address.line2 ? `, ${address.line2}` : ''}
                  </Text>
                  <Text style={styles.addressLine}>
                    {address.city}
                    {address.state ? `, ${address.state}` : ''} · {address.postalCode}
                  </Text>
                </>
              ) : (
                <Text style={styles.addressName}>No address selected</Text>
              )}
            </View>
          </View>

        </View>

        {/* ==================================================
            ITEMS
        ================================================== */}

        <View style={styles.section}>

          <Text style={styles.sectionTitle}>Items ({cartItems.length})</Text>

          {cartItems.map((item) => (
            <View key={item.id} style={styles.itemCard}>

              <View style={styles.itemImageContainer}>
                {item.imageUrl ? (
                  <Image
                    source={{ uri: item.imageUrl }}
                    style={styles.itemImage}
                    resizeMode="contain"
                  />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <Ionicons name="image-outline" size={30} color="#94A3B8" />
                  </View>
                )}
              </View>

              <View style={styles.itemInfo}>
                <Text style={styles.itemName} numberOfLines={2}>
                  {item.name}
                </Text>

                <View style={styles.itemMeta}>
                  <View style={styles.quantityBadge}>
                    <Text style={styles.quantityText}>Qty: {item.quantity}</Text>
                  </View>

                  <Text style={styles.itemPrice}>
                    {formatPrice(item.price)}
                  </Text>
                </View>
              </View>

            </View>
          ))}

        </View>

        {/* ==================================================
            PAYMENT METHOD
        ================================================== */}

        <View style={styles.section}>

          <Text style={styles.sectionTitle}>Payment Method</Text>

          <View style={styles.paymentCard}>

            {[
              { key: 'CARD', label: 'Credit / Debit Card', icon: 'card-outline' },
              { key: 'PAYPAL', label: 'PayPal', icon: 'logo-paypal' },
              { key: 'CASH_ON_DELIVERY', label: 'Cash on Delivery', icon: 'cash-outline' },
            ].map((method) => (
              <TouchableOpacity
                key={method.key}
                style={styles.paymentRow}
                onPress={() => setPaymentMethod(method.key)}
                activeOpacity={0.8}
              >
                <Ionicons name={method.icon} size={20} color="#334155" />
                <Text style={styles.paymentLabel}>{method.label}</Text>

                <Ionicons
                  name={
                    paymentMethod === method.key
                      ? 'radio-button-on'
                      : 'radio-button-off'
                  }
                  size={22}
                  color={paymentMethod === method.key ? '#2563EB' : '#CBD5E1'}
                />
              </TouchableOpacity>
            ))}

          </View>

        </View>

        {/* ==================================================
            COUPON
        ================================================== */}

        <View style={styles.section}>

          <Text style={styles.sectionTitle}>Coupon</Text>

          <View style={styles.couponCard}>

            <View style={styles.couponInputRow}>
              <TextInput
                style={styles.couponInput}
                placeholder="Enter coupon code"
                placeholderTextColor="#94A3B8"
                value={couponCode}
                onChangeText={(text) => {
                  setCouponCode(text.toUpperCase());
                  setCoupon(null);
                }}
                autoCapitalize="characters"
              />

              <TouchableOpacity
                style={styles.applyButton}
                onPress={applyCoupon}
                disabled={couponLoading || !couponCode.trim()}
                activeOpacity={0.8}
              >
                {couponLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.applyText}>Apply</Text>
                )}
              </TouchableOpacity>
            </View>

            {coupon ? (
              <Text style={styles.couponApplied}>
                ✅ {coupon.code} applied — {formatPrice(coupon.discountAmount)} off
              </Text>
            ) : null}

          </View>

        </View>

        {/* ==================================================
            PRICE DETAILS
        ================================================== */}

        <View style={styles.section}>

          <Text style={styles.sectionTitle}>Price Details</Text>

          <View style={styles.priceCard}>

            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Subtotal</Text>
              <Text style={styles.priceValue}>{formatPrice(subtotal)}</Text>
            </View>

            {coupon ? (
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Coupon discount</Text>
                <Text style={styles.discountValue}>
                  − {formatPrice(discount)}
                </Text>
              </View>
            ) : null}

            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Delivery</Text>
              <Text style={styles.freeText}>Calculated at checkout</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Estimated Total</Text>
              <Text style={styles.totalValue}>{formatPrice(estimatedTotal)}</Text>
            </View>

            <Text style={styles.noteText}>
              Final totals (including delivery and taxes) are confirmed by the
              server when the order is placed.
            </Text>

          </View>

        </View>

        {/* ==================================================
            BENEFITS
        ================================================== */}

        <View style={styles.benefitsCard}>

          <View style={styles.benefitRow}>
            <Ionicons name="shield-checkmark-outline" size={20} color="#15803D" />
            <View style={styles.benefitContent}>
              <Text style={styles.benefitTitle}>Secure Payment</Text>
              <Text style={styles.benefitDescription}>
                Your payment information is protected.
              </Text>
            </View>
          </View>

          <View style={styles.benefitDivider} />

          <View style={styles.benefitRow}>
            <Ionicons name="flash-outline" size={20} color="#F59E0B" />
            <View style={styles.benefitContent}>
              <Text style={styles.benefitTitle}>Fast Checkout</Text>
              <Text style={styles.benefitDescription}>
                Complete your payment securely through our payment gateway.
              </Text>
            </View>
          </View>

        </View>

      </ScrollView>

      {/* ====================================================
          BOTTOM BAR
      ==================================================== */}

      <View style={styles.bottomBar}>

        <View style={styles.bottomPrice}>
          <Text style={styles.bottomLabel}>Estimated Total</Text>
          <Text style={styles.bottomAmount}>{formatPrice(estimatedTotal)}</Text>
        </View>

        <TouchableOpacity
          style={[styles.placeButton, placing && styles.paymentButtonDisabled]}
          onPress={placeOrder}
          disabled={placing}
          activeOpacity={0.85}
        >
          {placing ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.placeButtonText}>Place Order</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            </>
          )}
        </TouchableOpacity>

      </View>

    </SafeAreaView>
  );
}

// ============================================================
// STYLES
// ============================================================

const styles = StyleSheet.create({

  // ==========================================================
  // ROOT
  // ==========================================================

  safeArea: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },

  // ==========================================================
  // HEADER
  // ==========================================================

  header: {
    height: 72,

    flexDirection: 'row',

    alignItems: 'center',

    paddingHorizontal: 16,

    backgroundColor: '#FFFFFF',

    borderBottomWidth: 1,
    marginTop: 50,
    borderBottomColor: '#E2E8F0',
  },

  headerBackButton: {
    width: 42,
    height: 42,

    borderRadius: 21,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: '#F1F5F9',
  },

  headerTitleContainer: {
    flex: 1,

    marginLeft: 12,
  },

  headerTitle: {
    fontSize: 18,

    fontWeight: '800',

    color: '#172337',
  },

  headerSubtitle: {
    marginTop: 2,

    fontSize: 12,

    color: '#64748B',
  },

  secureHeader: {
    width: 38,
    height: 38,

    borderRadius: 19,

    backgroundColor: '#ECFDF3',

    alignItems: 'center',
    justifyContent: 'center',
  },

  // ==========================================================
  // CONTENT
  // ==========================================================

  scrollContent: {
    paddingHorizontal: 14,

    paddingTop: 14,

    paddingBottom: 130,
  },

  // ==========================================================
  // INFO CARD
  // ==========================================================

  infoCard: {
    flexDirection: 'row',

    backgroundColor: '#FFFFFF',

    borderRadius: 12,

    padding: 14,

    borderWidth: 1,

    borderColor: '#E2E8F0',
  },

  infoIcon: {
    width: 42,
    height: 42,

    borderRadius: 21,

    backgroundColor: '#E8F1FF',

    alignItems: 'center',
    justifyContent: 'center',
  },

  infoContent: {
    flex: 1,

    marginLeft: 12,

    justifyContent: 'center',
  },

  infoLabel: {
    fontSize: 11,

    color: '#64748B',

    fontWeight: '600',
  },

  infoValue: {
    marginTop: 2,

    fontSize: 14,

    fontWeight: '700',

    color: '#172337',
  },

  infoSecondary: {
    marginTop: 2,

    fontSize: 12,

    color: '#64748B',
  },

  // ==========================================================
  // SECTION
  // ==========================================================

  section: {
    marginTop: 18,
  },

  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 9,
  },

  sectionTitle: {
    marginBottom: 9,

    fontSize: 17,

    fontWeight: '800',

    color: '#172337',
  },

  changeText: {
    fontSize: 14,

    fontWeight: '700',

    color: '#2563EB',
  },

  // ==========================================================
  // ADDRESS
  // ==========================================================

  addressCard: {
    flexDirection: 'row',

    backgroundColor: '#FFFFFF',

    borderRadius: 12,

    padding: 14,

    borderWidth: 1,

    borderColor: '#E2E8F0',
  },

  addressIcon: {
    width: 44,
    height: 44,

    borderRadius: 22,

    backgroundColor: '#EEF4FF',

    alignItems: 'center',
    justifyContent: 'center',
  },

  addressContent: {
    flex: 1,

    marginLeft: 12,

    justifyContent: 'center',
  },

  addressName: {
    fontSize: 14,

    fontWeight: '700',

    color: '#172337',
  },

  addressLine: {
    marginTop: 2,

    fontSize: 12,

    color: '#64748B',
  },

  // ==========================================================
  // ITEMS
  // ==========================================================

  itemCard: {
    flexDirection: 'row',

    backgroundColor: '#FFFFFF',

    borderRadius: 12,

    padding: 12,

    marginBottom: 10,

    borderWidth: 1,

    borderColor: '#E2E8F0',
  },

  itemImageContainer: {
    width: 78,
    height: 78,

    borderRadius: 10,

    backgroundColor: '#F8FAFC',

    alignItems: 'center',
    justifyContent: 'center',

    overflow: 'hidden',
  },

  itemImage: {
    width: '90%',
    height: '90%',
  },

  imagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  itemInfo: {
    flex: 1,

    marginLeft: 12,

    justifyContent: 'center',
  },

  itemName: {
    fontSize: 14,

    lineHeight: 20,

    fontWeight: '700',

    color: '#172337',
  },

  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    marginTop: 10,
  },

  quantityBadge: {
    paddingHorizontal: 8,

    paddingVertical: 4,

    borderRadius: 6,

    backgroundColor: '#F1F5F9',
  },

  quantityText: {
    fontSize: 11,

    fontWeight: '600',

    color: '#475569',
  },

  itemPrice: {
    fontSize: 15,

    fontWeight: '800',

    color: '#172337',
  },

  // ==========================================================
  // PAYMENT METHOD
  // ==========================================================

  paymentCard: {
    backgroundColor: '#FFFFFF',

    borderRadius: 12,

    paddingHorizontal: 14,

    borderWidth: 1,

    borderColor: '#E2E8F0',
  },

  paymentRow: {
    flexDirection: 'row',

    alignItems: 'center',

    paddingVertical: 14,

    borderBottomWidth: StyleSheet.hairlineWidth,

    borderBottomColor: '#E2E8F0',
  },

  paymentLabel: {
    flex: 1,

    marginLeft: 10,

    fontSize: 14,

    fontWeight: '600',

    color: '#334155',
  },

  // ==========================================================
  // COUPON
  // ==========================================================

  couponCard: {
    backgroundColor: '#FFFFFF',

    borderRadius: 12,

    padding: 14,

    borderWidth: 1,

    borderColor: '#E2E8F0',
  },

  couponInputRow: {
    flexDirection: 'row',

    alignItems: 'center',
  },

  couponInput: {
    flex: 1,

    height: 46,

    borderRadius: 10,

    backgroundColor: '#F8FAFC',

    borderWidth: 1,

    borderColor: '#E2E8F0',

    paddingHorizontal: 14,

    fontSize: 15,

    color: '#111827',
  },

  applyButton: {
    height: 46,

    paddingHorizontal: 20,

    marginLeft: 10,

    borderRadius: 10,

    backgroundColor: '#2563EB',

    alignItems: 'center',
    justifyContent: 'center',
  },

  applyText: {
    color: '#fff',

    fontWeight: '700',

    fontSize: 14,
  },

  couponApplied: {
    marginTop: 10,

    fontSize: 13,

    fontWeight: '700',

    color: '#15803D',
  },

  // ==========================================================
  // PRICE CARD
  // ==========================================================

  priceCard: {
    backgroundColor: '#FFFFFF',

    borderRadius: 12,

    padding: 15,

    borderWidth: 1,

    borderColor: '#E2E8F0',
  },

  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    marginBottom: 13,
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

  freeText: {
    fontSize: 12,

    fontWeight: '800',

    color: '#15803D',
  },

  divider: {
    height: 1,

    backgroundColor: '#E2E8F0',

    marginVertical: 3,

    marginBottom: 14,
  },

  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  totalLabel: {
    fontSize: 15,

    fontWeight: '800',

    color: '#172337',
  },

  totalValue: {
    fontSize: 20,

    fontWeight: '900',

    color: '#172337',
  },

  noteText: {
    marginTop: 10,

    fontSize: 11,

    lineHeight: 16,

    color: '#94A3B8',
  },

  // ==========================================================
  // BENEFITS
  // ==========================================================

  benefitsCard: {
    marginTop: 18,

    backgroundColor: '#FFFFFF',

    borderRadius: 12,

    padding: 15,

    borderWidth: 1,

    borderColor: '#E2E8F0',
  },

  benefitRow: {
    flexDirection: 'row',

    alignItems: 'flex-start',
  },

  benefitContent: {
    flex: 1,

    marginLeft: 11,
  },

  benefitTitle: {
    fontSize: 13,

    fontWeight: '700',

    color: '#172337',
  },

  benefitDescription: {
    marginTop: 3,

    fontSize: 11,

    lineHeight: 17,

    color: '#64748B',
  },

  benefitDivider: {
    height: 1,

    backgroundColor: '#E2E8F0',

    marginVertical: 13,
  },

  // ==========================================================
  // BOTTOM BAR
  // ==========================================================

  bottomBar: {
    position: 'absolute',

    left: 0,

    right: 0,

    bottom: 0,

    backgroundColor: '#FFFFFF',

    borderTopWidth: 1,

    borderTopColor: '#E2E8F0',

    paddingHorizontal: 14,

    paddingTop: 10,

    paddingBottom: 12,

    flexDirection: 'row',

    alignItems: 'center',
  },

  bottomPrice: {
    width: 110,
  },

  bottomLabel: {
    fontSize: 11,

    color: '#64748B',

    fontWeight: '600',
  },

  bottomAmount: {
    marginTop: 2,

    fontSize: 16,

    fontWeight: '900',

    color: '#172337',
  },

  placeButton: {
    flex: 1,

    height: 48,

    borderRadius: 10,

    backgroundColor: '#2563EB',

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'center',

    gap: 8,
  },

  paymentButtonDisabled: {
    opacity: 0.65,
  },

  placeButtonText: {
    fontSize: 14,

    fontWeight: '800',

    color: '#FFFFFF',
  },

  // ==========================================================
  // EMPTY STATE
  // ==========================================================

  emptyContainer: {
    flex: 1,

    alignItems: 'center',

    justifyContent: 'center',

    paddingHorizontal: 30,

    backgroundColor: '#F5F7FA',
  },

  emptyIcon: {
    width: 82,
    height: 82,

    borderRadius: 41,

    backgroundColor: '#EEF2F7',

    alignItems: 'center',
    justifyContent: 'center',

    marginBottom: 18,
  },

  emptyTitle: {
    fontSize: 20,

    fontWeight: '800',

    color: '#172337',

    textAlign: 'center',
  },

  emptyDescription: {
    marginTop: 8,

    fontSize: 14,

    lineHeight: 21,

    color: '#64748B',

    textAlign: 'center',
  },

  backButton: {
    marginTop: 20,

    minHeight: 44,

    paddingHorizontal: 25,

    borderRadius: 10,

    backgroundColor: '#2563EB',

    alignItems: 'center',

    justifyContent: 'center',
  },

  backButtonText: {
    fontSize: 14,

    fontWeight: '700',

    color: '#FFFFFF',
  },

});
