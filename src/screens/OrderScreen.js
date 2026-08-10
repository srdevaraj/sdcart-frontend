import React, {
  useContext,
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
  TouchableOpacity,
  View,
} from 'react-native';

import axios from 'axios';

import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  Ionicons,
} from '@expo/vector-icons';

import {
  AuthContext,
} from '../context/AuthContext';


// ============================================================
// CONSTANTS
// ============================================================

const BASE_URL =
  'https://sdcart-backend-1.onrender.com';


// ============================================================
// SCREEN
// ============================================================

export default function OrderScreen({
  navigation,
  route,
}) {

  // ==========================================================
  // PRODUCT
  // ==========================================================

  const { product } =
    route.params || {};

  const { userInfo } =
    useContext(AuthContext);

  // ==========================================================
  // STATE
  // ==========================================================

  const [loading, setLoading] =
    useState(false);


  // ==========================================================
  // PRICE
  // ==========================================================

  const productPrice =
    Number(product?.price || 0);

  const quantity = 1;

  const itemTotal =
    productPrice * quantity;

  const deliveryCharge = 0;

  const totalAmount =
    itemTotal + deliveryCharge;


  // ==========================================================
  // PRODUCT IMAGE
  // ==========================================================

  const getProductImage = () => {

    if (
      product?.imageUrl &&
      typeof product.imageUrl === 'string' &&
      product.imageUrl.trim().length > 0
    ) {
      return {
        uri: product.imageUrl,
      };
    }

    return null;
  };


  // ==========================================================
  // CREATE PAYMENT ORDER
  // ==========================================================

  const createOrder = async () => {

    if (!product?.id) {

      Alert.alert(
        'Product unavailable',
        'This product is no longer available.'
      );

      return;
    }


    if (productPrice <= 0) {

      Alert.alert(
        'Invalid amount',
        'The product price is not valid.'
      );

      return;
    }


    setLoading(true);

    try {

      // ------------------------------------------------------
      // GET JWT TOKEN
      // ------------------------------------------------------

      const token =
        await AsyncStorage.getItem(
          'userToken'
        );


      if (
        !token ||
        token === 'null' ||
        token === 'undefined'
      ) {

        Alert.alert(
          'Login required',
          'Please login before continuing to payment.',
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'Login',
              onPress: () =>
                navigation.navigate(
                  'Login'
                ),
            },
          ]
        );

        return;
      }


      // ------------------------------------------------------
      // CREATE RAZORPAY ORDER
      // ------------------------------------------------------

      const response =
        await axios.post(

          `${BASE_URL}/api/payment/create-order?amount=${totalAmount}`,

          {},

          {
            headers: {
              Authorization:
                `Bearer ${token}`,

              Accept:
                'application/json',
            },
          }

        );


      const {
        id: orderId,
      } = response?.data || {};


      if (!orderId) {

        throw new Error(
          'Payment order ID was not returned.'
        );
      }


      // ------------------------------------------------------
      // NAVIGATE TO PAYMENT
      // ------------------------------------------------------

      navigation.navigate(
        'Payment',
        {
          orderId,

          amount:
            totalAmount,

          product,

          user: {
            email:
              userInfo?.email,

            mobile:
              userInfo?.mobile,
          },
        }
      );

    } catch (error) {

      console.error(
        'Create order error:',
        error?.response?.data ||
        error?.message
      );


      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Unable to create your order. Please try again.';


      Alert.alert(
        'Unable to continue',
        message
      );

    } finally {

      setLoading(false);

    }
  };


  // ==========================================================
  // INVALID PRODUCT
  // ==========================================================

  if (!product) {

    return (
      <SafeAreaView
        style={styles.safeArea}
      >

        <View
          style={styles.emptyContainer}
        >

          <View
            style={styles.emptyIcon}
          >

            <Ionicons
              name="alert-circle-outline"
              size={42}
              color="#DC2626"
            />

          </View>


          <Text
            style={styles.emptyTitle}
          >
            Product unavailable
          </Text>


          <Text
            style={styles.emptyDescription}
          >
            We couldn't find the product
            you are trying to order.
          </Text>


          <TouchableOpacity
            style={styles.backButton}
            onPress={() =>
              navigation.goBack()
            }
          >

            <Text
              style={styles.backButtonText}
            >
              Go Back
            </Text>

          </TouchableOpacity>

        </View>

      </SafeAreaView>
    );
  }


  // ==========================================================
  // MAIN UI
  // ==========================================================

  return (

    <SafeAreaView
      style={styles.safeArea}
    >

      {/* ====================================================
          HEADER
      ==================================================== */}

      <View
        style={styles.header}
      >

        <TouchableOpacity
          style={styles.headerBackButton}
          onPress={() =>
            navigation.goBack()
          }
          activeOpacity={0.7}
        >

          <Ionicons
            name="arrow-back"
            size={23}
            color="#172337"
          />

        </TouchableOpacity>


        <View
          style={styles.headerTitleContainer}
        >

          <Text
            style={styles.headerTitle}
          >
            Order Summary
          </Text>

          <Text
            style={styles.headerSubtitle}
          >
            Review your order
          </Text>

        </View>


        <View
          style={styles.secureHeader}
        >

          <Ionicons
            name="lock-closed-outline"
            size={16}
            color="#15803D"
          />

        </View>

      </View>


      {/* ====================================================
          CONTENT
      ==================================================== */}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.scrollContent
        }
      >

        {/* ==================================================
            DELIVERY / ACCOUNT
        ================================================== */}

        <View
          style={styles.infoCard}
        >

          <View
            style={styles.infoIcon}
          >

            <Ionicons
              name="person-outline"
              size={20}
              color="#2874F0"
            />

          </View>


          <View
            style={styles.infoContent}
          >

            <Text
              style={styles.infoLabel}
            >
              Ordering as
            </Text>


            <Text
              style={styles.infoValue}
              numberOfLines={1}
            >
              {userInfo?.email ||
                'Registered customer'}
            </Text>


            {userInfo?.mobile ? (

              <Text
                style={styles.infoSecondary}
              >
                {userInfo.mobile}
              </Text>

            ) : null}

          </View>

        </View>


        {/* ==================================================
            PRODUCT CARD
        ================================================== */}

        <View
          style={styles.section}
        >

          <Text
            style={styles.sectionTitle}
          >
            Product Details
          </Text>


          <View
            style={styles.productCard}
          >

            {/* Product Image */}

            <View
              style={styles.imageContainer}
            >

              {getProductImage() ? (

                <Image
                  source={
                    getProductImage()
                  }
                  style={styles.productImage}
                  resizeMode="contain"
                />

              ) : (

                <View
                  style={
                    styles.imagePlaceholder
                  }
                >

                  <Ionicons
                    name="image-outline"
                    size={42}
                    color="#94A3B8"
                  />

                </View>

              )}

            </View>


            {/* Product Information */}

            <View
              style={styles.productInfo}
            >

              <Text
                style={styles.productName}
                numberOfLines={3}
              >
                {product.name ||
                  'Unnamed Product'}
              </Text>


              <View
                style={styles.productMeta}
              >

                <View
                  style={styles.quantityBadge}
                >

                  <Text
                    style={
                      styles.quantityText
                    }
                  >
                    Qty: {quantity}
                  </Text>

                </View>


                <Text
                  style={styles.productPrice}
                >
                  ₹
                  {productPrice.toLocaleString(
                    'en-IN'
                  )}
                </Text>

              </View>


              <View
                style={styles.assuredRow}
              >

                <Ionicons
                  name="shield-checkmark"
                  size={14}
                  color="#2874F0"
                />

                <Text
                  style={
                    styles.assuredText
                  }
                >
                  sdCart Assured
                </Text>

              </View>

            </View>

          </View>

        </View>


        {/* ==================================================
            PRICE DETAILS
        ================================================== */}

        <View
          style={styles.section}
        >

          <Text
            style={styles.sectionTitle}
          >
            Price Details
          </Text>


          <View
            style={styles.priceCard}
          >

            {/* Item Price */}

            <View
              style={styles.priceRow}
            >

              <Text
                style={styles.priceLabel}
              >
                Item price
              </Text>

              <Text
                style={styles.priceValue}
              >
                ₹
                {itemTotal.toLocaleString(
                  'en-IN'
                )}
              </Text>

            </View>


            {/* Quantity */}

            <View
              style={styles.priceRow}
            >

              <Text
                style={styles.priceLabel}
              >
                Quantity
              </Text>

              <Text
                style={styles.priceValue}
              >
                {quantity}
              </Text>

            </View>


            {/* Delivery */}

            <View
              style={styles.priceRow}
            >

              <Text
                style={styles.priceLabel}
              >
                Delivery
              </Text>

              <Text
                style={styles.freeText}
              >
                FREE
              </Text>

            </View>


            <View
              style={styles.divider}
            />


            {/* Total */}

            <View
              style={styles.totalRow}
            >

              <Text
                style={styles.totalLabel}
              >
                Total Amount
              </Text>

              <Text
                style={styles.totalValue}
              >
                ₹
                {totalAmount.toLocaleString(
                  'en-IN'
                )}
              </Text>

            </View>

          </View>

        </View>


        {/* ==================================================
            BENEFITS
        ================================================== */}

        <View
          style={styles.benefitsCard}
        >

          <View
            style={styles.benefitRow}
          >

            <Ionicons
              name="shield-checkmark-outline"
              size={20}
              color="#15803D"
            />

            <View
              style={styles.benefitContent}
            >

              <Text
                style={styles.benefitTitle}
              >
                Secure Payment
              </Text>

              <Text
                style={styles.benefitDescription}
              >
                Your payment information is protected.
              </Text>

            </View>

          </View>


          <View
            style={styles.benefitDivider}
          />


          <View
            style={styles.benefitRow}
          >

            <Ionicons
              name="flash-outline"
              size={20}
              color="#F59E0B"
            />

            <View
              style={styles.benefitContent}
            >

              <Text
                style={styles.benefitTitle}
              >
                Fast Checkout
              </Text>

              <Text
                style={styles.benefitDescription}
              >
                Complete your payment securely through our payment gateway.
              </Text>

            </View>

          </View>

        </View>

      </ScrollView>


      {/* ====================================================
          BOTTOM CHECKOUT BAR
      ==================================================== */}

      <View
        style={styles.bottomBar}
      >

        <View
          style={styles.bottomPrice}
        >

          <Text
            style={styles.bottomLabel}
          >
            Total
          </Text>

          <Text
            style={styles.bottomAmount}
          >
            ₹
            {totalAmount.toLocaleString(
              'en-IN'
            )}
          </Text>

        </View>


        <TouchableOpacity
          style={[
            styles.paymentButton,
            loading &&
              styles.paymentButtonDisabled,
          ]}
          onPress={createOrder}
          disabled={loading}
          activeOpacity={0.85}
        >

          {loading ? (

            <ActivityIndicator
              size="small"
              color="#FFFFFF"
            />

          ) : (

            <>
              <Text
                style={
                  styles.paymentButtonText
                }
              >
                Proceed to Payment
              </Text>

              <Ionicons
                name="arrow-forward"
                size={18}
                color="#FFFFFF"
              />
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
    marginTop:50,
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
  // ACCOUNT CARD
  // ==========================================================

  infoCard: {
    flexDirection: 'row',

    backgroundColor: '#FFFFFF',

    borderRadius: 10,

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

  sectionTitle: {
    marginBottom: 9,

    fontSize: 17,

    fontWeight: '800',

    color: '#172337',
  },


  // ==========================================================
  // PRODUCT CARD
  // ==========================================================

  productCard: {
    flexDirection: 'row',

    backgroundColor: '#FFFFFF',

    borderRadius: 10,

    padding: 12,

    borderWidth: 1,

    borderColor: '#E2E8F0',
  },

  imageContainer: {
    width: 105,
    height: 120,

    borderRadius: 8,

    backgroundColor: '#F8FAFC',

    alignItems: 'center',
    justifyContent: 'center',
  },

  productImage: {
    width: '90%',
    height: '90%',
  },

  imagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  productInfo: {
    flex: 1,

    marginLeft: 13,

    paddingVertical: 2,
  },

  productName: {
    fontSize: 15,

    lineHeight: 21,

    fontWeight: '700',

    color: '#172337',
  },

  productMeta: {
    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'space-between',

    marginTop: 12,
  },

  quantityBadge: {
    paddingHorizontal: 8,

    paddingVertical: 4,

    borderRadius: 5,

    backgroundColor: '#F1F5F9',
  },

  quantityText: {
    fontSize: 11,

    fontWeight: '600',

    color: '#475569',
  },

  productPrice: {
    fontSize: 17,

    fontWeight: '800',

    color: '#172337',
  },

  assuredRow: {
    flexDirection: 'row',

    alignItems: 'center',

    marginTop: 11,
  },

  assuredText: {
    marginLeft: 5,

    fontSize: 11,

    fontWeight: '600',

    color: '#2874F0',
  },


  // ==========================================================
  // PRICE CARD
  // ==========================================================

  priceCard: {
    backgroundColor: '#FFFFFF',

    borderRadius: 10,

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


  // ==========================================================
  // BENEFITS
  // ==========================================================

  benefitsCard: {
    marginTop: 18,

    backgroundColor: '#FFFFFF',

    borderRadius: 10,

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
    width: 95,
  },

  bottomLabel: {
    fontSize: 11,

    color: '#64748B',

    fontWeight: '600',
  },

  bottomAmount: {
    marginTop: 2,

    fontSize: 17,

    fontWeight: '900',

    color: '#172337',
  },

  paymentButton: {
    flex: 1,

    height: 48,

    borderRadius: 7,

    backgroundColor: '#FF9F00',

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'center',

    gap: 8,
  },

  paymentButtonDisabled: {
    opacity: 0.65,
  },

  paymentButtonText: {
    fontSize: 13,

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

    backgroundColor: '#FEE2E2',

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

    borderRadius: 7,

    backgroundColor: '#2874F0',

    alignItems: 'center',

    justifyContent: 'center',
  },

  backButtonText: {
    fontSize: 14,

    fontWeight: '700',

    color: '#FFFFFF',
  },

});