// src/screens/AccountScreen.js
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  StatusBar,
  Switch,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../theme';
import { AnimatedPressable } from '../components/common/AnimatedPressable';
import { ScreenHeader } from '../components/common/ScreenHeader';
import { useToast } from '../context/ToastContext';

export default function AccountScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { colors, typography, radius, shadows, isDark, toggleTheme } = useTheme();
  const { userInfo, logout, refreshUserInfo, isAdmin } = useAuth();
  const { wishlistItems } = useWishlist();
  const { totalQuantity } = useCart();
  const { showSuccess, showError } = useToast();

  const [refreshing, setRefreshing] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshUserInfo?.();
    } finally {
      setRefreshing(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out of sdCart?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          setLoggingOut(true);
          try {
            await logout();
            showSuccess('Signed out successfully');
          } catch (e) {
            showError('Unable to sign out');
          } finally {
            setLoggingOut(false);
          }
        },
      },
    ]);
  };

  const getInitials = (name, email) => {
    if (name) {
      const parts = name.trim().split(' ');
      if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      return name.slice(0, 2).toUpperCase();
    }
    if (email) return email.slice(0, 2).toUpperCase();
    return 'SD';
  };

  const displayName =
    userInfo?.name ||
    (userInfo?.firstName && userInfo?.lastName
      ? `${userInfo.firstName} ${userInfo.lastName}`
      : userInfo?.email?.split('@')[0] || 'sdCart Member');

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <ScreenHeader title="Account & Settings" showCart={false} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 }]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* ================= USER PROFILE CARD ================= */}
        <View
          style={[
            styles.profileCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderRadius: radius['2xl'],
              ...shadows.sm,
            },
          ]}
        >
          <View style={[styles.avatarBox, { backgroundColor: colors.primary }]}>
            <Text style={[styles.avatarText, { fontWeight: typography.weights.black }]}>
              {getInitials(userInfo?.name, userInfo?.email)}
            </Text>
          </View>

          <View style={styles.profileDetails}>
            <View style={styles.nameRow}>
              <Text
                style={[
                  styles.profileName,
                  { color: colors.text, fontWeight: typography.weights.extrabold },
                ]}
                numberOfLines={1}
              >
                {displayName}
              </Text>
              {isAdmin && (
                <View style={[styles.adminPill, { backgroundColor: colors.accentMuted }]}>
                  <Text style={[styles.adminPillText, { color: colors.accent, fontWeight: typography.weights.bold }]}>
                    ADMIN
                  </Text>
                </View>
              )}
            </View>

            <Text style={[styles.profileEmail, { color: colors.textSecondary }]} numberOfLines={1}>
              {userInfo?.email || 'Logged in user'}
            </Text>

            {userInfo?.phone ? (
              <Text style={[styles.profilePhone, { color: colors.textMuted }]}>
                {userInfo.phone}
              </Text>
            ) : null}
          </View>
        </View>

        {/* ================= QUICK STAT CARDS ================= */}
        <View style={styles.statsRow}>
          <AnimatedPressable
            onPress={() => navigation.navigate('Orders')}
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
            <View style={[styles.statIconCircle, { backgroundColor: colors.primaryMuted }]}>
              <Ionicons name="receipt" size={22} color={colors.primary} />
            </View>
            <Text style={[styles.statTitle, { color: colors.text, fontWeight: typography.weights.bold }]}>
              My Orders
            </Text>
            <Text style={[styles.statSub, { color: colors.textMuted }]}>
              Track & history
            </Text>
          </AnimatedPressable>

          <AnimatedPressable
            onPress={() => navigation.navigate('Wishlist')}
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
            <View style={[styles.statIconCircle, { backgroundColor: colors.dangerMuted }]}>
              <Ionicons name="heart" size={22} color={colors.danger} />
            </View>
            <Text style={[styles.statTitle, { color: colors.text, fontWeight: typography.weights.bold }]}>
              Wishlist
            </Text>
            <Text style={[styles.statSub, { color: colors.textMuted }]}>
              {wishlistItems.length} saved
            </Text>
          </AnimatedPressable>
        </View>

        {/* ================= MENU GROUP 1: ACCOUNT & ORDERS ================= */}
        <View style={styles.menuGroup}>
          <Text style={[styles.groupLabel, { color: colors.textMuted, fontWeight: typography.weights.bold }]}>
            ACCOUNT SETTINGS
          </Text>

          <View
            style={[
              styles.menuCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderRadius: radius.xl,
              },
            ]}
          >
            <AnimatedPressable
              onPress={() => navigation.navigate('AccountInfo')}
              scaleTo={0.98}
              haptic="selection"
              style={styles.menuItem}
            >
              <View style={[styles.menuIconWrap, { backgroundColor: colors.primaryMuted }]}>
                <Ionicons name="person-outline" size={20} color={colors.primary} />
              </View>
              <View style={styles.menuTextWrap}>
                <Text style={[styles.menuTitle, { color: colors.text, fontWeight: typography.weights.semibold }]}>
                  Personal Profile
                </Text>
                <Text style={[styles.menuSubtitle, { color: colors.textSecondary }]}>
                  View account info & email
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </AnimatedPressable>

            <View style={[styles.menuDivider, { backgroundColor: colors.borderLight }]} />

            <AnimatedPressable
              onPress={() => navigation.navigate('DeliveryAddress', { selectMode: false })}
              scaleTo={0.98}
              haptic="selection"
              style={styles.menuItem}
            >
              <View style={[styles.menuIconWrap, { backgroundColor: colors.successMuted }]}>
                <MaterialCommunityIcons name="map-marker-outline" size={20} color={colors.success} />
              </View>
              <View style={styles.menuTextWrap}>
                <Text style={[styles.menuTitle, { color: colors.text, fontWeight: typography.weights.semibold }]}>
                  Delivery Addresses
                </Text>
                <Text style={[styles.menuSubtitle, { color: colors.textSecondary }]}>
                  Manage shipping locations
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </AnimatedPressable>

            {isAdmin && (
              <>
                <View style={[styles.menuDivider, { backgroundColor: colors.borderLight }]} />
                <AnimatedPressable
                  onPress={() => navigation.navigate('Admin')}
                  scaleTo={0.98}
                  haptic="selection"
                  style={styles.menuItem}
                >
                  <View style={[styles.menuIconWrap, { backgroundColor: colors.accentMuted }]}>
                    <MaterialCommunityIcons name="shield-account" size={20} color={colors.accent} />
                  </View>
                  <View style={styles.menuTextWrap}>
                    <Text style={[styles.menuTitle, { color: colors.text, fontWeight: typography.weights.semibold }]}>
                      Admin Dashboard
                    </Text>
                    <Text style={[styles.menuSubtitle, { color: colors.textSecondary }]}>
                      Products & catalog management
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                </AnimatedPressable>
              </>
            )}
          </View>
        </View>

        {/* ================= MENU GROUP 2: PREFERENCES ================= */}
        <View style={styles.menuGroup}>
          <Text style={[styles.groupLabel, { color: colors.textMuted, fontWeight: typography.weights.bold }]}>
            APP PREFERENCES
          </Text>

          <View
            style={[
              styles.menuCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderRadius: radius.xl,
              },
            ]}
          >
            <View style={styles.menuItem}>
              <View style={[styles.menuIconWrap, { backgroundColor: isDark ? '#334155' : '#F1F5F9' }]}>
                <Ionicons name={isDark ? 'moon' : 'sunny'} size={20} color={isDark ? '#FBBF24' : '#F59E0B'} />
              </View>
              <View style={styles.menuTextWrap}>
                <Text style={[styles.menuTitle, { color: colors.text, fontWeight: typography.weights.semibold }]}>
                  Dark Mode
                </Text>
                <Text style={[styles.menuSubtitle, { color: colors.textSecondary }]}>
                  {isDark ? 'Dark theme active' : 'Light theme active'}
                </Text>
              </View>
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: '#CBD5E1', true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </View>

        {/* ================= LOGOUT BUTTON ================= */}
        <AnimatedPressable
          onPress={handleLogout}
          disabled={loggingOut}
          scaleTo={0.96}
          haptic="medium"
          style={[
            styles.logoutButton,
            {
              backgroundColor: colors.dangerMuted,
              borderColor: isDark ? 'transparent' : '#FECACA',
              borderRadius: radius.xl,
            },
          ]}
        >
          <Ionicons name="log-out-outline" size={20} color={colors.danger} />
          <Text style={[styles.logoutText, { color: colors.danger, fontWeight: typography.weights.bold }]}>
            {loggingOut ? 'Signing out...' : 'Sign Out'}
          </Text>
        </AnimatedPressable>

        {/* App Version Info */}
        <Text style={[styles.versionText, { color: colors.textMuted }]}>
          sdCart Mobile · Version 1.0.0 (2026 Edition)
        </Text>
      </ScrollView>
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
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  avatarBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 22,
  },
  profileDetails: {
    flex: 1,
    marginLeft: 14,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  profileName: {
    fontSize: 17,
    flexShrink: 1,
  },
  adminPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  adminPillText: {
    fontSize: 9,
  },
  profileEmail: {
    fontSize: 13,
    marginTop: 2,
  },
  profilePhone: {
    fontSize: 12,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderWidth: 1,
  },
  statIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  statTitle: {
    fontSize: 14,
  },
  statSub: {
    fontSize: 12,
    marginTop: 2,
  },
  menuGroup: {
    marginBottom: 20,
  },
  groupLabel: {
    fontSize: 11,
    letterSpacing: 0.6,
    marginBottom: 8,
    marginLeft: 4,
  },
  menuCard: {
    borderWidth: 1,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  menuIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTextWrap: {
    flex: 1,
    marginLeft: 12,
  },
  menuTitle: {
    fontSize: 14,
  },
  menuSubtitle: {
    fontSize: 12,
    marginTop: 1,
  },
  menuDivider: {
    height: 1,
    marginLeft: 64,
  },
  logoutButton: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    marginTop: 8,
  },
  logoutText: {
    fontSize: 15,
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    marginTop: 20,
  },
});