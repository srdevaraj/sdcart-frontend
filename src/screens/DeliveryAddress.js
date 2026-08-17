// src/screens/DeliveryAddress.js

import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  Image,
  Animated,
  RefreshControl,
  StatusBar,
} from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, useIsFocused } from '@react-navigation/native';

import {
  getAddresses,
  deleteAddress,
  setDefaultAddress,
} from '../services/addressService';
import { getErrorMessage } from '../services/apiClient';

const DeliveryAddress = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const isFocused = useIsFocused();

  // When selectMode is true the screen acts as the checkout address picker.
  const { selectMode = false } = route.params || {};

  const [addresses, setAddresses] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [btnLoading, setBtnLoading] = useState(null);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  const startAnimation = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 450,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Fetch Addresses
  const fetchAddresses = async () => {
    try {
      setLoading(true);

      const data = await getAddresses();
      setAddresses(data);

      // Default to the user's default address in select mode.
      if (selectMode && !selectedId) {
        const defaultAddress = data.find((a) => a.isDefault) || data[0];
        if (defaultAddress) setSelectedId(defaultAddress.publicId);
      }

      startAnimation();
    } catch (error) {
      Alert.alert('Oops!', getErrorMessage(error));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      fetchAddresses();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFocused, selectMode]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAddresses();
  };

  // Delete Address
  const handleDelete = async (address) => {
    try {
      setBtnLoading(address.publicId);

      await deleteAddress(address.publicId);

      Alert.alert('Success', 'Address deleted successfully.');
      fetchAddresses();
    } catch (error) {
      Alert.alert('Error', getErrorMessage(error));
    } finally {
      setBtnLoading(null);
    }
  };

  const confirmDelete = (address) => {
    Alert.alert(
      'Delete Address',
      'Are you sure you want to remove this delivery address?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => handleDelete(address) },
      ]
    );
  };

  const handleSetDefault = async (address) => {
    try {
      setBtnLoading(address.publicId);
      await setDefaultAddress(address.publicId);
      fetchAddresses();
    } catch (error) {
      Alert.alert('Error', getErrorMessage(error));
    } finally {
      setBtnLoading(null);
    }
  };

  // Checkout: continue with the selected address
  const handleProceed = () => {
    if (!selectedId) {
      Alert.alert('Select Address', 'Please choose a delivery address.');
      return;
    }
    navigation.navigate('OrderScreen', { addressId: selectedId });
  };

  // Premium Loader
  if (loading) {
    return (
      <LinearGradient
        colors={['#2563EB', '#4F46E5']}
        style={styles.loaderContainer}
      >
        <StatusBar barStyle="light-content" backgroundColor="#2563EB" />

        <Image
          source={require('../../assets/clogo.png')}
          style={styles.loaderLogo}
        />

        <ActivityIndicator size="large" color="#FFFFFF" />

        <Text style={styles.loadingTitle}>Loading Address</Text>

        <Text style={styles.loadingSubtitle}>
          Please wait while we fetch your saved addresses...
        </Text>
      </LinearGradient>
    );
  }

  return (
    <>
      <StatusBar backgroundColor="#2563EB" barStyle="light-content" />

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#2563EB"
          />
        }
      >
        {/* Header */}
        <LinearGradient
          colors={['#2563EB', '#4F46E5']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <Image
            source={require('../../assets/clogo.png')}
            style={styles.logo}
          />

          <Text style={styles.headerTitle}>
            {selectMode ? 'Choose Address' : 'Delivery Address'}
          </Text>

          <Text style={styles.headerSubtitle}>
            {selectMode
              ? 'Select the address for this order'
              : 'Manage your saved delivery locations'}
          </Text>
        </LinearGradient>

        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          {addresses.length > 0 ? (
            addresses.map((address) => {
              const isSelected = selectedId === address.publicId;

              return (
                <TouchableOpacity
                  key={address.publicId}
                  activeOpacity={0.95}
                  style={[
                    styles.addressCard,
                    selectMode && isSelected && styles.selectedCard,
                  ]}
                  onPress={() => {
                    if (selectMode) {
                      setSelectedId(address.publicId);
                    }
                  }}
                >
                  <View style={styles.cardTopRow}>
                    <View style={styles.badge}>
                      <MaterialCommunityIcons
                        name="check-decagram"
                        size={16}
                        color="#fff"
                      />
                      <Text style={styles.badgeText}>
                        {address.isDefault ? 'DEFAULT' : address.label.toUpperCase()}
                      </Text>
                    </View>

                    {selectMode && (
                      <MaterialCommunityIcons
                        name={
                          isSelected
                            ? 'radiobox-marked'
                            : 'radiobox-blank'
                        }
                        size={24}
                        color={isSelected ? '#2563EB' : '#CBD5E1'}
                      />
                    )}
                  </View>

                  <View style={styles.row}>
                    <View style={styles.iconBox}>
                      <MaterialCommunityIcons
                        name="account"
                        size={26}
                        color="#2563EB"
                      />
                    </View>

                    <View style={styles.content}>
                      <Text style={styles.label}>Receiver</Text>
                      <Text style={styles.value}>{address.recipientName}</Text>
                    </View>
                  </View>

                  <View style={styles.divider} />

                  <View style={styles.row}>
                    <View style={styles.iconBox}>
                      <MaterialCommunityIcons
                        name="phone"
                        size={24}
                        color="#16A34A"
                      />
                    </View>

                    <View style={styles.content}>
                      <Text style={styles.label}>Contact Number</Text>
                      <Text style={styles.value}>{address.phone}</Text>
                    </View>
                  </View>

                  <View style={styles.divider} />

                  <View style={styles.row}>
                    <View style={styles.iconBox}>
                      <MaterialCommunityIcons
                        name="map-marker-radius"
                        size={25}
                        color="#EF4444"
                      />
                    </View>

                    <View style={styles.content}>
                      <Text style={styles.label}>Delivery Address</Text>
                      <Text style={styles.value}>
                        {address.line1}
                        {address.line2 ? `, ${address.line2}` : ''}
                      </Text>
                      <Text style={styles.secondaryText}>
                        {address.city}
                        {address.state ? `, ${address.state}` : ''}
                      </Text>
                      <Text style={styles.secondaryText}>
                        {address.postalCode} · {address.country}
                      </Text>
                    </View>
                  </View>

                  {/* Action Buttons (manage mode only) */}
                  {!selectMode && (
                    <View style={styles.actionRow}>
                      <TouchableOpacity
                        activeOpacity={0.9}
                        style={styles.editBtn}
                        onPress={() =>
                          navigation.navigate('AddEditAddress', { address })
                        }
                      >
                        <MaterialCommunityIcons
                          name="pencil-outline"
                          size={20}
                          color="#fff"
                        />
                        <Text style={styles.actionText}>Edit</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        activeOpacity={0.9}
                        style={styles.defaultBtn}
                        disabled={btnLoading === address.publicId}
                        onPress={() => handleSetDefault(address)}
                      >
                        {btnLoading === address.publicId ? (
                          <ActivityIndicator color="#fff" />
                        ) : (
                          <>
                            <MaterialCommunityIcons
                              name="star-outline"
                              size={20}
                              color="#fff"
                            />
                            <Text style={styles.actionText}>
                              {address.isDefault ? 'Default' : 'Set Default'}
                            </Text>
                          </>
                        )}
                      </TouchableOpacity>

                      <TouchableOpacity
                        activeOpacity={0.9}
                        style={styles.deleteBtn}
                        onPress={() => confirmDelete(address)}
                      >
                        <MaterialCommunityIcons
                          name="delete-outline"
                          size={20}
                          color="#fff"
                        />
                        <Text style={styles.actionText}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })
          ) : (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyCircle}>
                <MaterialCommunityIcons
                  name="map-marker-off-outline"
                  size={70}
                  color="#CBD5E1"
                />
              </View>

              <Text style={styles.emptyTitle}>No Address Found</Text>

              <Text style={styles.emptyDescription}>
                Save your delivery address to enjoy faster checkout and
                hassle-free deliveries.
              </Text>

              <TouchableOpacity
                style={styles.addBtn}
                activeOpacity={0.9}
                onPress={() => navigation.navigate('AddEditAddress')}
              >
                <MaterialCommunityIcons
                  name="plus-circle"
                  size={22}
                  color="#fff"
                />

                <Text style={styles.addText}>Add New Address</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Add-new (manage mode) */}
          {!selectMode && addresses.length > 0 && (
            <TouchableOpacity
              style={[styles.addBtn, styles.addBtnFull]}
              activeOpacity={0.9}
              onPress={() => navigation.navigate('AddEditAddress')}
            >
              <MaterialCommunityIcons name="plus-circle" size={22} color="#fff" />
              <Text style={styles.addText}>Add New Address</Text>
            </TouchableOpacity>
          )}

          {/* Checkout CTA (select mode) */}
          {selectMode && addresses.length > 0 && (
            <TouchableOpacity
              style={styles.proceedBtn}
              activeOpacity={0.9}
              onPress={handleProceed}
            >
              <MaterialCommunityIcons name="arrow-right" size={22} color="#fff" />
              <Text style={styles.proceedText}>Proceed to Checkout</Text>
            </TouchableOpacity>
          )}

          <View style={{ height: 40 }} />
        </Animated.View>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7FC',
  },

  /* ---------------- Loader ---------------- */

  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },

  loaderLogo: {
    width: 95,
    height: 95,
    borderRadius: 24,
    marginBottom: 25,
    backgroundColor: '#fff',
  },

  loadingTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    marginTop: 20,
  },

  loadingSubtitle: {
    color: '#E5E7EB',
    textAlign: 'center',
    marginTop: 8,
    fontSize: 15,
    lineHeight: 24,
  },

  /* ---------------- Header ---------------- */

  header: {
    paddingTop: 55,
    paddingBottom: 90,
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
    alignItems: 'center',
  },

  logo: {
    width: 95,
    height: 95,
    borderRadius: 24,
    backgroundColor: '#fff',
    marginBottom: 16,
  },

  headerTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },

  headerSubtitle: {
    color: '#DBEAFE',
    marginTop: 8,
    fontSize: 15,
  },

  /* ---------------- Card ---------------- */

  addressCard: {
    marginHorizontal: 20,
    marginTop: 18,
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 22,

    elevation: 10,

    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 6,
    },
  },

  selectedCard: {
    borderWidth: 2,
    borderColor: '#2563EB',
  },

  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },

  badge: {
    alignSelf: 'flex-start',

    flexDirection: 'row',
    alignItems: 'center',

    backgroundColor: '#16A34A',

    paddingHorizontal: 12,
    paddingVertical: 6,

    borderRadius: 25,
  },

  badgeText: {
    color: '#fff',
    fontWeight: '700',
    marginLeft: 6,
    fontSize: 11,
    letterSpacing: 0.6,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
  },

  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: '#EEF4FF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  content: {
    flex: 1,
    marginLeft: 15,
  },

  label: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  value: {
    fontSize: 17,
    color: '#111827',
    marginTop: 3,
    fontWeight: '700',
    lineHeight: 25,
  },

  secondaryText: {
    color: '#64748B',
    marginTop: 3,
    fontSize: 15,
    lineHeight: 22,
  },

  divider: {
    height: 1,
    backgroundColor: '#EEF2F7',
    marginVertical: 14,
    marginLeft: 63,
  },

  /* ---------------- Buttons ---------------- */

  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
  },

  editBtn: {
    flex: 1,
    height: 48,
    backgroundColor: '#2563EB',
    marginRight: 8,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  defaultBtn: {
    flex: 1,
    height: 48,
    backgroundColor: '#16A34A',
    marginRight: 8,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  deleteBtn: {
    flex: 1,
    height: 48,
    backgroundColor: '#EF4444',
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  actionText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 6,
  },

  /* ---------------- Add / Proceed ---------------- */

  addBtn: {
    marginTop: 28,
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingVertical: 15,
    borderRadius: 30,
    alignSelf: 'center',
  },

  addBtnFull: {
    alignSelf: 'stretch',
    marginHorizontal: 20,
  },

  addText: {
    color: '#fff',
    marginLeft: 10,
    fontSize: 16,
    fontWeight: '700',
  },

  proceedBtn: {
    marginHorizontal: 20,
    marginTop: 24,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  proceedText: {
    color: '#fff',
    marginLeft: 10,
    fontSize: 16,
    fontWeight: '800',
  },

  /* ---------------- Empty State ---------------- */

  emptyContainer: {
    marginHorizontal: 25,
    marginTop: 50,

    backgroundColor: '#fff',

    borderRadius: 25,

    alignItems: 'center',

    paddingVertical: 40,
    paddingHorizontal: 25,

    elevation: 8,

    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 5,
    },
  },

  emptyCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,

    backgroundColor: '#F8FAFC',

    justifyContent: 'center',
    alignItems: 'center',

    marginBottom: 22,
  },

  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
  },

  emptyDescription: {
    marginTop: 12,
    textAlign: 'center',
    color: '#64748B',
    fontSize: 15,
    lineHeight: 24,
  },
});

export default DeliveryAddress;
