import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
 Image,
 StyleSheet,
 ActivityIndicator,
 ScrollView,
 TouchableOpacity,
 Dimensions,
 Alert,
 StatusBar,
 Animated,
} from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { getProductById } from '../services/productService';
import { normalizeProduct } from '../services/normalizers';
import { discountPercent, formatPrice } from '../services/format';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

import clogo from '../../assets/clogo.png';

const { width } = Dimensions.get('window');

const IMAGE_HEIGHT = 360;

export default function SelectedProduct({
    route,
    navigation,
}) {

    const { id } = route.params;

    const [product, setProduct] = useState(null);

    const [loading, setLoading] = useState(true);

    const [adding, setAdding] =
    useState(false);

    const [readMore, setReadMore] =
    useState(false);

    const fade =
    useRef(new Animated.Value(0)).current;

    const translate =
    useRef(new Animated.Value(25)).current;

    const { addToCart } = useCart();
    const { isInWishlist, toggleWishlist } = useWishlist();

    useEffect(() => {

        fetchProduct();

        Animated.parallel([

            Animated.timing(fade,{
                toValue:1,
                duration:500,
                useNativeDriver:true
            }),

            Animated.timing(translate,{
                toValue:0,
                duration:500,
                useNativeDriver:true
            })

        ]).start();

    },[]);

    const fetchProduct = async()=>{

        try{

            const data =
            await getProductById(id);

            setProduct(
                normalizeProduct(data)
            );

        }catch(e){

            Alert.alert(
                'Error',
                'Unable to load product.'
            );

        }finally{

            setLoading(false);

        }

    };

    const handleAddToCart = async () => {

      if (!product || !product.id) {

          Alert.alert(
              "Error",
              "Product information is missing."
          );

          return;
      }

      try {

          setAdding(true);

          console.log("Adding Product:", product);
          console.log("Product ID:", product.id);

          const result =
          await addToCart(
              product.id,
              1
          );

          if(!result.success){

              Alert.alert(
                  "Error",
                  result.message
              );

              return;

          }

          Alert.alert(
              "Success",
              "Product added to cart."
          );

      } catch (err) {

          console.log(
              "Add To Cart Error:",
              err.response?.data || err.message
          );

          Alert.alert(
              "Error",
              err.response?.data?.message ||
              "Failed to add product."
          );

      } finally {

          setAdding(false);

      }

    };

    if(loading){

        return(

            <View style={styles.loaderContainer}>

                <StatusBar
                backgroundColor="#2563EB"
                barStyle="light-content"
                />

                <Image
                source={clogo}
                style={styles.loaderLogo}
                />

                <ActivityIndicator
                size="large"
                color="#2563EB"
                />

                <Text style={styles.loaderText}>
                    Loading Product...
                </Text>

            </View>

        );

    }

    if(!product){

        return(

            <View style={styles.loaderContainer}>

                <MaterialCommunityIcons
                name="package-variant-remove"
                size={90}
                color="#CBD5E1"
                />

                <Text style={styles.emptyTitle}>
                    Product Not Found
                </Text>

            </View>

        );

    }

    return(

    <View style={styles.container}>

        <StatusBar
        backgroundColor="#2563EB"
        barStyle="light-content"
        />

        <Animated.ScrollView

        showsVerticalScrollIndicator={false}

        contentContainerStyle={{
            paddingBottom:120
        }}

        style={{
            opacity:fade,
            transform:[
                {
                    translateY:translate
                }
            ]
        }}

        >
                {/* ================= HERO IMAGE ================= */}

        <View style={styles.imageContainer}>

            <Image
                source={
                    product.imageUrl
                        ? { uri: product.imageUrl }
                        : clogo
                }
                style={styles.productImage}
                resizeMode="contain"
            />

            {/* Discount Badge */}

            {discountPercent(product) > 0 && (
                <LinearGradient
                    colors={['#EF4444', '#DC2626']}
                    style={styles.discountBadge}
                >
                    <Text style={styles.discountText}>
                        {discountPercent(product)}% OFF
                    </Text>
                </LinearGradient>
            )}

            {/* Wishlist */}

            <TouchableOpacity
                activeOpacity={0.9}
                style={styles.favoriteButton}
                onPress={async () => {
                    const result =
                    await toggleWishlist(product.id);

                    if(!result.success){
                        Alert.alert(
                            'Wishlist',
                            result.message
                        );
                    }
                }}
            >

                <MaterialCommunityIcons
                    name={
                        isInWishlist(product.id)
                            ? 'heart'
                            : 'heart-outline'
                    }
                    size={26}
                    color="#EF4444"
                />

            </TouchableOpacity>

        </View>

        {/* ================= PRODUCT DETAILS ================= */}

        <View style={styles.detailsCard}>

            <Text style={styles.brand}>
                {product.brand || 'sdCart'}
            </Text>

            <Text style={styles.productName}>
                {product.name}
            </Text>

            {/* Rating */}

            <View style={styles.ratingRow}>

                <MaterialCommunityIcons
                    name="star"
                    size={18}
                    color="#FBBF24"
                />

                <Text style={styles.ratingText}>
                    {product.rating || '4.5'}
                </Text>

                <Text style={styles.reviewText}>
                    ({product.reviewCount || 0} Reviews)
                </Text>

            </View>

            {/* Price */}

            <View style={styles.priceRow}>

                <Text style={styles.price}>
                    {formatPrice(product.price)}
                </Text>

                {product.actualPrice ? (
                    <Text style={styles.oldPrice}>
                        {formatPrice(product.actualPrice)}
                    </Text>
                ) : null}

                {discountPercent(product) > 0 && (
                    <View style={styles.saveBadge}>
                        <Text style={styles.saveText}>
                            Save {discountPercent(product)}%
                        </Text>
                    </View>
                )}

            </View>

            {/* Availability */}

            <View style={styles.stockRow}>

                <MaterialCommunityIcons
                    name="check-decagram"
                    size={18}
                    color="#16A34A"
                />

                <Text style={styles.stockText}>
                    {product.stock > 0
                        ? `In Stock (${product.stock})`
                        : 'Out of Stock'}
                </Text>

            </View>

        </View>

        {/* ================= DELIVERY CARD ================= */}

        <View style={styles.deliveryCard}>

            <View style={styles.deliveryItem}>

                <MaterialCommunityIcons
                    name="truck-fast"
                    size={26}
                    color="#2563EB"
                />

                <View style={{ marginLeft: 12 }}>

                    <Text style={styles.deliveryTitle}>
                        Free Delivery
                    </Text>

                    <Text style={styles.deliverySubtitle}>
                        Delivery within 2–4 days
                    </Text>

                </View>

            </View>

            <View style={styles.deliveryDivider} />

            <View style={styles.deliveryItem}>

                <MaterialCommunityIcons
                    name="shield-check"
                    size={26}
                    color="#16A34A"
                />

                <View style={{ marginLeft: 12 }}>

                    <Text style={styles.deliveryTitle}>
                        Secure Payment
                    </Text>

                    <Text style={styles.deliverySubtitle}>
                        100% Safe Checkout
                    </Text>

                </View>

            </View>

            <View style={styles.deliveryDivider} />

            <View style={styles.deliveryItem}>

                <MaterialCommunityIcons
                    name="backup-restore"
                    size={26}
                    color="#F59E0B"
                />

                <View style={{ marginLeft: 12 }}>

                    <Text style={styles.deliveryTitle}>
                        Easy Returns
                    </Text>

                    <Text style={styles.deliverySubtitle}>
                        7 Days Replacement
                    </Text>

                </View>

            </View>

        </View>
                {/* ================= DESCRIPTION ================= */}

        <View style={styles.infoCard}>

            <View style={styles.cardHeader}>

                <MaterialCommunityIcons
                    name="text-box-outline"
                    size={24}
                    color="#2563EB"
                />

                <Text style={styles.cardTitle}>
                    Product Description
                </Text>

            </View>

            <Text
                style={styles.description}
                numberOfLines={readMore ? undefined : 4}
            >
                {product.description ||
                    'No description available for this product.'}
            </Text>

            {product.description &&
                product.description.length > 180 && (

                <TouchableOpacity
                    onPress={() =>
                        setReadMore(!readMore)
                    }
                >

                    <Text style={styles.readMore}>

                        {readMore
                            ? 'Read Less'
                            : 'Read More'}

                    </Text>

                </TouchableOpacity>

            )}

        </View>

        {/* ================= SPECIFICATIONS ================= */}

        <View style={styles.infoCard}>

            <View style={styles.cardHeader}>

                <MaterialCommunityIcons
                    name="clipboard-list-outline"
                    size={24}
                    color="#2563EB"
                />

                <Text style={styles.cardTitle}>
                    Specifications
                </Text>

            </View>

            <View style={styles.specRow}>

                <Text style={styles.specLabel}>
                    Category
                </Text>

                <Text style={styles.specValue}>
                    {product.categoryName || 'General'}
                </Text>

            </View>

            <View style={styles.specDivider} />

            <View style={styles.specRow}>

                <Text style={styles.specLabel}>
                    Brand
                </Text>

                <Text style={styles.specValue}>
                    {product.brand || 'sdCart'}
                </Text>

            </View>

            {(product.specifications || []).map((spec, index) => (
                <React.Fragment key={`${spec.name}-${index}`}>
                    <View style={styles.specDivider} />

                    <View style={styles.specRow}>

                        <Text style={styles.specLabel}>
                            {spec.name}
                        </Text>

                        <Text style={styles.specValue}>
                            {spec.value}
                        </Text>

                    </View>
                </React.Fragment>
            ))}

            <View style={styles.specDivider} />

            <View style={styles.specRow}>

                <Text style={styles.specLabel}>
                    Stock
                </Text>

                <Text
                    style={[
                        styles.specValue,
                        {
                            color:
                                product.stock > 0
                                    ? '#16A34A'
                                    : '#EF4444',
                        },
                    ]}
                >
                    {product.stock > 0
                        ? `${product.stock} Available`
                        : 'Out of Stock'}
                </Text>

            </View>

        </View>

        {/* ================= SELLER CARD ================= */}

        <View style={styles.sellerCard}>

            <View style={styles.sellerTop}>

                <MaterialCommunityIcons
                    name="storefront-outline"
                    size={42}
                    color="#2563EB"
                />

                <View
                    style={{
                        marginLeft: 15,
                        flex: 1,
                    }}
                >

                    <Text style={styles.sellerName}>
                        {product.seller || 'sdCart Official'}
                    </Text>

                    <Text style={styles.sellerRating}>
                        ⭐ 4.9 Seller Rating
                    </Text>

                </View>

            </View>

            <View style={styles.sellerFeatures}>

                <View style={styles.featureBox}>

                    <MaterialCommunityIcons
                        name="shield-check"
                        size={24}
                        color="#16A34A"
                    />

                    <Text style={styles.featureText}>
                        Trusted Seller
                    </Text>

                </View>

                <View style={styles.featureBox}>

                    <MaterialCommunityIcons
                        name="truck-fast"
                        size={24}
                        color="#2563EB"
                    />

                    <Text style={styles.featureText}>
                        Fast Shipping
                    </Text>

                </View>

                <View style={styles.featureBox}>

                    <MaterialCommunityIcons
                        name="cash-refund"
                        size={24}
                        color="#F59E0B"
                    />

                    <Text style={styles.featureText}>
                        Easy Returns
                    </Text>

                </View>

            </View>

        </View>
                {/* ================= BOTTOM SPACING ================= */}

        <View style={{ height: 30 }} />

        </Animated.ScrollView>

        {/* ================= STICKY BOTTOM BAR ================= */}

        <View style={styles.bottomBar}>

            {/* Add to Cart */}

            <TouchableOpacity
                activeOpacity={0.9}
                style={styles.cartBtn}
                disabled={adding}
                onPress={handleAddToCart}
            >

                {adding ? (

                    <ActivityIndicator
                        color="#FFFFFF"
                    />

                ) : (

                    <>

                        <MaterialCommunityIcons
                            name="cart-plus"
                            size={22}
                            color="#FFFFFF"
                        />

                        <Text style={styles.bottomButtonText}>
                            Add to Cart
                        </Text>

                    </>

                )}

            </TouchableOpacity>

            {/* Buy Now */}

            <TouchableOpacity
                activeOpacity={0.9}
                style={styles.buyBtn}
                onPress={async () => {

                    if(!product?.id) return;

                    const result =
                    await addToCart(
                        product.id,
                        1
                    );

                    if(!result.success){

                        Alert.alert(
                            'Error',
                            result.message
                        );

                        return;

                    }

                    // Orders are created from the cart by the backend, so
                    // Buy Now adds the item and continues to checkout.
                    navigation.navigate(
                        'DeliveryAddress',
                        {
                            selectMode: true,
                        }
                    );
                }}
            >

                <MaterialCommunityIcons
                    name="lightning-bolt"
                    size={22}
                    color="#FFFFFF"
                />

                <Text style={styles.bottomButtonText}>
                    Buy Now
                </Text>

            </TouchableOpacity>

        </View>

    </View>

    );

}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  /* ---------------- LOADER ---------------- */

  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 25,
  },

  loaderLogo: {
    width: 90,
    height: 90,
    marginBottom: 25,
    resizeMode: 'contain',
  },

  loaderText: {
    marginTop: 18,
    fontSize: 16,
    color: '#64748B',
    fontWeight: '600',
    letterSpacing: 0.3,
  },

  emptyTitle: {
    marginTop: 18,
    fontSize: 22,
    fontWeight: '700',
    color: '#334155',
  },

  /* ---------------- HERO IMAGE ---------------- */

  imageContainer: {
    width: '100%',
    height: IMAGE_HEIGHT,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 6,
    },
  },

  productImage: {
    width: width * 0.78,
    height: IMAGE_HEIGHT - 45,
  },

  discountBadge: {
    position: 'absolute',
    top: 22,
    left: 18,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    elevation: 5,
  },

  discountText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  favoriteButton: {
    position: 'absolute',
    top: 18,
    right: 18,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  /* ---------------- PRODUCT DETAILS ---------------- */

  detailsCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 18,
    borderRadius: 18,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },
  },

  brand: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },

  productName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 32,
    marginBottom: 14,
  },

  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },

  ratingText: {
    marginLeft: 6,
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },

  reviewText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#64748B',
  },

  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 18,
  },

  price: {
    fontSize: 30,
    fontWeight: '800',
    color: '#16A34A',
  },

  oldPrice: {
    marginLeft: 12,
    fontSize: 18,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },

  saveBadge: {
    marginLeft: 12,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },

  saveText: {
    color: '#15803D',
    fontWeight: '700',
    fontSize: 12,
  },

  stockRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  stockText: {
    marginLeft: 8,
    color: '#16A34A',
    fontSize: 15,
    fontWeight: '700',
  },

  /* ---------------- DELIVERY ---------------- */

  deliveryCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 18,
    borderRadius: 18,
    paddingVertical: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  deliveryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 16,
  },

  deliveryDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 18,
  },

  deliveryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },

  deliverySubtitle: {
    marginTop: 3,
    fontSize: 13,
    color: '#64748B',
  },

  /* ---------------- INFO CARDS ---------------- */

  infoCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 18,
    borderRadius: 18,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },

  cardTitle: {
    marginLeft: 10,
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },

  description: {
    fontSize: 15,
    lineHeight: 25,
    color: '#475569',
  },

  readMore: {
    marginTop: 12,
    color: '#2563EB',
    fontWeight: '700',
    fontSize: 15,
  },

  /* ---------------- SPECIFICATIONS ---------------- */

  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },

  specLabel: {
    fontSize: 15,
    color: '#64748B',
    fontWeight: '600',
  },

  specValue: {
    fontSize: 15,
    color: '#0F172A',
    fontWeight: '700',
    textAlign: 'right',
    maxWidth: '55%',
  },

  specDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
  },

  /* ---------------- SELLER ---------------- */

  sellerCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 18,
    borderRadius: 18,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  sellerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 22,
  },

  sellerName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },

  sellerRating: {
    marginTop: 5,
    fontSize: 14,
    color: '#64748B',
  },

  sellerFeatures: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  featureBox: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    marginHorizontal: 5,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  featureText: {
    marginTop: 10,
    fontSize: 12,
    textAlign: 'center',
    color: '#475569',
    fontWeight: '700',
  },

  /* ---------------- BOTTOM BAR ---------------- */

  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    elevation: 15,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: -3,
    },
  },

  cartBtn: {
    flex: 1,
    height: 56,
    borderRadius: 14,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    marginRight: 8,
    elevation: 3,
  },

  buyBtn: {
    flex: 1,
    height: 56,
    borderRadius: 14,
    backgroundColor: '#16A34A',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    marginLeft: 8,
    elevation: 3,
  },

  bottomButtonText: {
    marginLeft: 8,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
});