import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  Image,
  StatusBar,
} from 'react-native';

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getMe } from '../services/userService';
import { getAddresses } from '../services/addressService';
import { getErrorMessage } from '../services/apiClient';

export default function AccountInfoScreen() {
  const [user, setUser] = useState(null);
  const [address, setAddress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setError(null);

      const [userData, addressList] = await Promise.all([
        getMe(),
        getAddresses(),
      ]);

      setUser(userData);
      setAddress(
        Array.isArray(addressList) && addressList.length > 0
          ? addressList.find((a) => a.isDefault) || addressList[0]
          : null
      );
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
  };

  if (loading) {
    return (
      <LinearGradient
        colors={['#0F2027', '#203A43', '#2C5364']}
        style={styles.loaderContainer}
      >
        <ActivityIndicator size="large" color="#fff" />

        <Text style={styles.loadingText}>
          Loading your account...
        </Text>
      </LinearGradient>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <MaterialCommunityIcons
          name="alert-circle-outline"
          size={70}
          color="#ef4444"
        />

        <Text style={styles.errorTitle}>
          Oops!
        </Text>

        <Text style={styles.errorText}>
          {error}
        </Text>
      </View>
    );
  }

  return (
    <>
      <StatusBar
        backgroundColor="#2563eb"
        barStyle="light-content"
      />

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
      >
        {/* Premium Header */}

        <LinearGradient
          colors={['#2563eb', '#4f46e5']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <Image
            source={require('../../assets/clogo.png')}
            style={styles.logo}
          />

          <Text style={styles.headerTitle}>
            My Account
          </Text>

          <Text style={styles.headerSubtitle}>
            Manage your personal information
          </Text>
        </LinearGradient>

        {/* Profile Card */}

        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <MaterialCommunityIcons
              name="account"
              size={55}
              color="#2563eb"
            />
          </View>

          <Text style={styles.userName}>
            {user?.firstName} {user?.lastName}
          </Text>

          <Text style={styles.userEmail}>
            {user?.email}
          </Text>
        </View>
                  {/* Account Information */}

        <View style={styles.card}>

          <View style={styles.cardHeader}>
            <MaterialCommunityIcons
              name="account-circle"
              size={24}
              color="#2563eb"
            />

            <Text style={styles.cardTitle}>
              Account Information
            </Text>
          </View>

          <View style={styles.infoRow}>
            <MaterialCommunityIcons
              name="account-outline"
              size={22}
              color="#6b7280"
            />

            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>
                Full Name
              </Text>

              <Text style={styles.infoValue}>
                {user?.firstName} {user?.lastName}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <MaterialCommunityIcons
              name="email-outline"
              size={22}
              color="#6b7280"
            />

            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>
                Email
              </Text>

              <Text style={styles.infoValue}>
                {user?.email}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <MaterialCommunityIcons
              name="phone-outline"
              size={22}
              color="#6b7280"
            />

            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>
                Mobile Number
              </Text>

              <Text style={styles.infoValue}>
                {user?.phone || '-'}
              </Text>
            </View>
          </View>

        </View>

        {/* Delivery Address */}

        <View style={styles.card}>

          <View style={styles.cardHeader}>
            <MaterialCommunityIcons
              name="map-marker-radius"
              size={24}
              color="#16a34a"
            />

            <Text style={styles.cardTitle}>
              Delivery Address
            </Text>
          </View>

          {address ? (
            <>

              <View style={styles.infoRow}>
                <MaterialCommunityIcons
                  name="account"
                  size={22}
                  color="#6b7280"
                />

                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>
                    Receiver
                  </Text>

                  <Text style={styles.infoValue}>
                    {address.recipientName}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.infoRow}>
                <MaterialCommunityIcons
                  name="phone"
                  size={22}
                  color="#6b7280"
                />

                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>
                    Contact Number
                  </Text>

                  <Text style={styles.infoValue}>
                    {address.phone}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.infoRow}>
                <MaterialCommunityIcons
                  name="home-city-outline"
                  size={22}
                  color="#6b7280"
                />

                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>
                    Address
                  </Text>

                  <Text style={styles.infoValue}>
                    {address.line1}
                    {address.line2
                      ? `, ${address.line2}`
                      : ''}
                  </Text>
                </View>
              </View>
                            <View style={styles.divider} />

              <View style={styles.infoRow}>
                <MaterialCommunityIcons
                  name="city-variant-outline"
                  size={22}
                  color="#6b7280"
                />

                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>
                    City
                  </Text>

                  <Text style={styles.infoValue}>
                    {address.city}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.infoRow}>
                <MaterialCommunityIcons
                  name="map-outline"
                  size={22}
                  color="#6b7280"
                />

                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>
                    State
                  </Text>

                  <Text style={styles.infoValue}>
                    {address.state}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.infoRow}>
                <MaterialCommunityIcons
                  name="map-marker"
                  size={22}
                  color="#6b7280"
                />

                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>
                    Pincode
                  </Text>

                  <Text style={styles.infoValue}>
                    {address.postalCode}
                  </Text>
                </View>
              </View>
            </>
          ) : (
            <View style={styles.emptyCard}>
              <MaterialCommunityIcons
                name="map-marker-off-outline"
                size={55}
                color="#cbd5e1"
              />

              <Text style={styles.emptyTitle}>
                No Address Found
              </Text>

              <Text style={styles.emptyText}>
                You haven't added a delivery address yet.
              </Text>
            </View>
          )}
        </View>

        <View style={{ height: 35 }} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#f4f7fc',
  },

  header: {
    paddingTop: 55,
    paddingBottom: 80,
    alignItems: 'center',
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
  },

  logo: {
    width: 95,
    height: 95,
    borderRadius: 25,
    backgroundColor: '#fff',
    marginBottom: 15,
  },

  headerTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },

  headerSubtitle: {
    color: '#dbeafe',
    fontSize: 15,
    marginTop: 6,
  },

  profileCard: {
    marginHorizontal: 20,
    marginTop: -45,
    backgroundColor: '#fff',
    borderRadius: 22,
    alignItems: 'center',
    paddingVertical: 25,
    paddingHorizontal: 20,
    elevation: 10,

    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 5,
    },
  },

  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#eef4ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },

  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },

  userEmail: {
    fontSize: 15,
    color: '#6b7280',
    marginTop: 5,
  },
    card: {
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    elevation: 6,

    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 4,
    },
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },

  cardTitle: {
    marginLeft: 10,
    fontSize: 19,
    fontWeight: '700',
    color: '#1e293b',
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
  },

  infoContent: {
    flex: 1,
    marginLeft: 14,
  },

  infoLabel: {
    fontSize: 13,
    color: '#94a3b8',
    marginBottom: 3,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  infoValue: {
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '600',
    lineHeight: 24,
  },

  divider: {
    height: 1,
    backgroundColor: '#edf2f7',
    marginVertical: 10,
    marginLeft: 36,
  },

  emptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 35,
    paddingHorizontal: 20,
  },

  emptyTitle: {
    marginTop: 15,
    fontSize: 18,
    fontWeight: '700',
    color: '#475569',
  },

  emptyText: {
    marginTop: 8,
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: 15,
    lineHeight: 22,
  },

  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    marginTop: 18,
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },

  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 30,
  },

  errorTitle: {
    marginTop: 15,
    fontSize: 24,
    fontWeight: '700',
    color: '#ef4444',
  },

  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
  },
    shadowLight: {
    shadowColor: '#2563eb',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 6,
    },
  },

  badge: {
    backgroundColor: '#2563eb',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 10,
  },

  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  footerSpacing: {
    height: 40,
  },

});