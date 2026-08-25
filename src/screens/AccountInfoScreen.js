// src/screens/AccountInfoScreen.js
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import { getMe } from '../services/userService';
import { getAddresses } from '../services/addressService';
import { getErrorMessage } from '../services/apiClient';
import { useTheme } from '../theme';
import { ScreenHeader } from '../components/common/ScreenHeader';
import { AnimatedPressable } from '../components/common/AnimatedPressable';

export default function AccountInfoScreen({ navigation }) {
  const { colors, typography, radius, shadows, isDark } = useTheme();

  const [user, setUser] = useState(null);
  const [address, setAddress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [userData, addressList] = await Promise.all([
        getMe().catch(() => null),
        getAddresses().catch(() => []),
      ]);

      setUser(userData);
      setAddress(
        Array.isArray(addressList) && addressList.length > 0
          ? addressList.find((a) => a.isDefault) || addressList[0]
          : null
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        <ScreenHeader title="Personal Profile" showBack />
        <View style={styles.centerLoading}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading profile...
          </Text>
        </View>
      </View>
    );
  }

  const fullName =
    user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : user?.name || 'Customer';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <ScreenHeader title="Personal Profile" showBack />

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
        {/* ================= USER INFO CARD ================= */}
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
          <Text style={[styles.cardTitle, { color: colors.text, fontWeight: typography.weights.bold }]}>
            Personal Details
          </Text>

          <View style={styles.infoRow}>
            <Text style={[styles.infoKey, { color: colors.textMuted }]}>Full Name</Text>
            <Text style={[styles.infoVal, { color: colors.text, fontWeight: typography.weights.semibold }]}>
              {fullName}
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />

          <View style={styles.infoRow}>
            <Text style={[styles.infoKey, { color: colors.textMuted }]}>Email Address</Text>
            <Text style={[styles.infoVal, { color: colors.text, fontWeight: typography.weights.semibold }]}>
              {user?.email || '—'}
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />

          <View style={styles.infoRow}>
            <Text style={[styles.infoKey, { color: colors.textMuted }]}>Phone Number</Text>
            <Text style={[styles.infoVal, { color: colors.text, fontWeight: typography.weights.semibold }]}>
              {user?.phone || 'Not provided'}
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />

          <View style={styles.infoRow}>
            <Text style={[styles.infoKey, { color: colors.textMuted }]}>Role</Text>
            <View style={[styles.rolePill, { backgroundColor: colors.primaryMuted, borderRadius: radius.xs }]}>
              <Text style={[styles.roleText, { color: colors.primary, fontWeight: typography.weights.bold }]}>
                {user?.role || 'CUSTOMER'}
              </Text>
            </View>
          </View>
        </View>

        {/* ================= DEFAULT DELIVERY ADDRESS ================= */}
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
          <View style={styles.cardHeaderRow}>
            <Text style={[styles.cardTitle, { color: colors.text, fontWeight: typography.weights.bold }]}>
              Primary Delivery Address
            </Text>

            <AnimatedPressable
              onPress={() => navigation.navigate('DeliveryAddress', { selectMode: false })}
              scaleTo={0.92}
            >
              <Text style={[styles.manageLink, { color: colors.primary, fontWeight: typography.weights.bold }]}>
                Manage
              </Text>
            </AnimatedPressable>
          </View>

          {address ? (
            <View style={styles.addressBox}>
              <Text style={[styles.addressName, { color: colors.text, fontWeight: typography.weights.bold }]}>
                {address.recipientName} · {address.phone}
              </Text>
              <Text style={[styles.addressLine, { color: colors.textSecondary }]}>
                {address.line1}
                {address.line2 ? `, ${address.line2}` : ''}
              </Text>
              <Text style={[styles.addressLine, { color: colors.textSecondary }]}>
                {address.city}
                {address.state ? `, ${address.state}` : ''} · {address.postalCode}
              </Text>
            </View>
          ) : (
            <Text style={[styles.noAddressText, { color: colors.textMuted }]}>
              No default delivery address configured yet.
            </Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerLoading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 14,
    fontSize: 14,
  },
  scrollContent: {
    padding: 16,
  },
  card: {
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
  },
  cardTitle: {
    fontSize: 16,
    marginBottom: 14,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  manageLink: {
    fontSize: 13,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  infoKey: {
    fontSize: 13,
  },
  infoVal: {
    fontSize: 14,
  },
  rolePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  roleText: {
    fontSize: 11,
  },
  divider: {
    height: 1,
  },
  addressBox: {
    paddingTop: 4,
  },
  addressName: {
    fontSize: 14,
    marginBottom: 4,
  },
  addressLine: {
    fontSize: 13,
    lineHeight: 19,
  },
  noAddressText: {
    fontSize: 13,
    fontStyle: 'italic',
  },
});