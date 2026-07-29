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

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useIsFocused } from '@react-navigation/native';

const API_URL = 'https://sdcart-backend-1.onrender.com';

const DeliveryAddress = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  const [address, setAddress] = useState(null);
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

  // Fetch Address
  const fetchAddress = async () => {
    try {
      setLoading(true);

      const token = await AsyncStorage.getItem('userToken');

      const response = await axios.get(
        `${API_URL}/api/address`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (Array.isArray(response.data)) {
        setAddress(response.data.length > 0 ? response.data[0] : null);
      } else {
        setAddress(response.data || null);
      }

      startAnimation();
    } catch (error) {
      console.log(error);

      Alert.alert(
        'Oops!',
        'Unable to load your delivery address.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      fetchAddress();
    }
  }, [isFocused]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAddress();
  };

  // Delete Address
  const handleDelete = async () => {
    try {
      setBtnLoading('delete');

      const token = await AsyncStorage.getItem('userToken');

      await axios.delete(
        `${API_URL}/api/address/${address.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Alert.alert(
        'Success',
        'Address deleted successfully.'
      );

      fetchAddress();
    } catch (error) {
      console.log(error);

      Alert.alert(
        'Error',
        'Failed to delete address.'
      );
    } finally {
      setBtnLoading(null);
    }
  };

  const confirmDelete = () => {
    Alert.alert(
      'Delete Address',
      'Are you sure you want to remove this delivery address?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: handleDelete,
        },
      ]
    );
  };

  // Premium Loader
  if (loading) {
    return (
      <LinearGradient
        colors={['#2563EB', '#4F46E5']}
        style={styles.loaderContainer}
      >
        <StatusBar
          barStyle="light-content"
          backgroundColor="#2563EB"
        />

        <Image
          source={require('../../assets/clogo.png')}
          style={styles.loaderLogo}
        />

        <ActivityIndicator
          size="large"
          color="#FFFFFF"
        />

        <Text style={styles.loadingTitle}>
          Loading Address
        </Text>

        <Text style={styles.loadingSubtitle}>
          Please wait while we fetch your saved address...
        </Text>
      </LinearGradient>
    );
  }

  return (
    <>
      <StatusBar
        backgroundColor="#2563EB"
        barStyle="light-content"
      />

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
            Delivery Address
          </Text>

          <Text style={styles.headerSubtitle}>
            Manage your saved delivery location
          </Text>
        </LinearGradient>

        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [
              {
                translateY: slideAnim,
              },
            ],
          }}
        >
                  {address ? (
            <>
              <View style={styles.addressCard}>

                <View style={styles.badge}>
                  <MaterialCommunityIcons
                    name="check-decagram"
                    size={16}
                    color="#fff"
                  />
                  <Text style={styles.badgeText}>
                    DEFAULT ADDRESS
                  </Text>
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
                    <Text style={styles.label}>
                      Receiver
                    </Text>

                    <Text style={styles.value}>
                      {address.fullName}
                    </Text>
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
                    <Text style={styles.label}>
                      Contact Number
                    </Text>

                    <Text style={styles.value}>
                      {address.mobileNumber}
                    </Text>

                    {address.altMobileNumber ? (
                      <Text style={styles.secondaryText}>
                        Alternate : {address.altMobileNumber}
                      </Text>
                    ) : null}

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

                    <Text style={styles.label}>
                      Delivery Address
                    </Text>

                    <Text style={styles.value}>
                      {address.addressLine1}
                      {address.addressLine2
                        ? `, ${address.addressLine2}`
                        : ''}
                    </Text>

                    <Text style={styles.secondaryText}>
                      {address.city}, {address.state}
                    </Text>

                    <Text style={styles.secondaryText}>
                      {address.pincode}
                    </Text>

                  </View>

                </View>

                {address.landmark ? (
                  <>
                    <View style={styles.divider} />

                    <View style={styles.row}>

                      <View style={styles.iconBox}>
                        <MaterialCommunityIcons
                          name="map-marker-star"
                          size={24}
                          color="#F59E0B"
                        />
                      </View>

                      <View style={styles.content}>
                        <Text style={styles.label}>
                          Landmark
                        </Text>

                        <Text style={styles.value}>
                          {address.landmark}
                        </Text>
                      </View>

                    </View>
                  </>
                ) : null}

              </View>

              {/* Action Buttons */}

              <View style={styles.actionRow}>

                <TouchableOpacity
                  activeOpacity={0.9}
                  style={styles.editBtn}
                  disabled={btnLoading === 'update'}
                  onPress={() =>
                    navigation.navigate(
                      'AddEditAddress',
                      { address }
                    )
                  }
                >

                  {btnLoading === 'update' ? (
                    <ActivityIndicator
                      color="#fff"
                    />
                  ) : (
                    <>
                      <MaterialCommunityIcons
                        name="pencil-outline"
                        size={22}
                        color="#fff"
                      />

                      <Text style={styles.actionText}>
                        Edit
                      </Text>
                    </>
                  )}

                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.9}
                  style={styles.deleteBtn}
                  disabled={btnLoading === 'delete'}
                  onPress={confirmDelete}
                >

                  {btnLoading === 'delete' ? (
                    <ActivityIndicator
                      color="#fff"
                    />
                  ) : (
                    <>
                      <MaterialCommunityIcons
                        name="delete-outline"
                        size={22}
                        color="#fff"
                      />

                      <Text style={styles.actionText}>
                        Delete
                      </Text>
                    </>
                  )}

                </TouchableOpacity>

              </View>
            </>
          ) : (

            <View style={styles.emptyContainer}>

              <View style={styles.emptyCircle}>
                <MaterialCommunityIcons
                  name="map-marker-off-outline"
                  size={70}
                  color="#CBD5E1"
                />
              </View>

              <Text style={styles.emptyTitle}>
                No Address Found
              </Text>

              <Text style={styles.emptyDescription}>
                Save your delivery address to enjoy
                faster checkout and hassle-free
                deliveries.
              </Text>

              <TouchableOpacity
                style={styles.addBtn}
                activeOpacity={0.9}
                onPress={() =>
                  navigation.navigate('AddEditAddress')
                }
              >

                <MaterialCommunityIcons
                  name="plus-circle"
                  size={22}
                  color="#fff"
                />

                <Text style={styles.addText}>
                  Add New Address
                </Text>

              </TouchableOpacity>

            </View>

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
    marginTop: -45,
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

  badge: {
    alignSelf: 'flex-start',

    flexDirection: 'row',
    alignItems: 'center',

    backgroundColor: '#16A34A',

    paddingHorizontal: 12,
    paddingVertical: 6,

    borderRadius: 25,
    marginBottom: 18,
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
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 10,
  },

  editBtn: {
    flex: 1,

    height: 56,

    backgroundColor: '#2563EB',

    marginRight: 8,

    borderRadius: 16,

    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',

    elevation: 6,

    shadowColor: '#2563EB',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },
  },

  deleteBtn: {
    flex: 1,

    height: 56,

    backgroundColor: '#EF4444',

    marginLeft: 8,

    borderRadius: 16,

    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',

    elevation: 6,

    shadowColor: '#EF4444',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },
  },

  actionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
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
    shadowOpacity: 0.10,
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

  addBtn: {
    marginTop: 28,

    backgroundColor: '#2563EB',

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'center',

    paddingHorizontal: 28,
    paddingVertical: 15,

    borderRadius: 30,

    elevation: 6,

    shadowColor: '#2563EB',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },
  },

  addText: {
    color: '#fff',
    marginLeft: 10,
    fontSize: 16,
    fontWeight: '700',
  },

});
export default DeliveryAddress;