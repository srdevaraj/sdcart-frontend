// src/screens/DeliveryAddress.js
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, useIsFocused } from '@react-navigation/native';

import {
  getAddresses,
  deleteAddress,
  setDefaultAddress,
} from '../services/addressService';
import { getErrorMessage } from '../services/apiClient';
import { useTheme } from '../theme';
import { AnimatedPressable } from '../components/common/AnimatedPressable';
import { ScreenHeader } from '../components/common/ScreenHeader';
import { useToast } from '../context/ToastContext';

export default function DeliveryAddress() {
  const navigation = useNavigation();
  const route = useRoute();
  const isFocused = useIsFocused();
  const { colors, typography, radius, shadows, isDark } = useTheme();
  const { showSuccess, showError } = useToast();

  const { selectMode = false } = route.params || {};

  const [addresses, setAddresses] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [btnLoadingId, setBtnLoadingId] = useState(null);

  const fetchAddresses = useCallback(async () => {
    try {
      const data = await getAddresses();
      const list = Array.isArray(data) ? data : [];
      setAddresses(list);

      if (selectMode && list.length > 0) {
        setSelectedId((prev) => {
          if (prev) return prev;
          const def = list.find((a) => a.isDefault) || list[0];
          return def ? def.publicId : null;
        });
      }
    } catch (e) {
      showError(getErrorMessage(e));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectMode, showError]);

  useEffect(() => {
    if (isFocused) {
      fetchAddresses();
    }
  }, [isFocused, fetchAddresses]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAddresses();
  };

  const handleDelete = (address) => {
    Alert.alert(
      'Delete Address',
      'Are you sure you want to remove this delivery address?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setBtnLoadingId(address.publicId);
            try {
              await deleteAddress(address.publicId);
              showSuccess('Address removed');
              fetchAddresses();
            } catch (e) {
              showError(getErrorMessage(e));
            } finally {
              setBtnLoadingId(null);
            }
          },
        },
      ]
    );
  };

  const handleSetDefault = async (address) => {
    setBtnLoadingId(address.publicId);
    try {
      await setDefaultAddress(address.publicId);
      showSuccess('Default address updated');
      fetchAddresses();
    } catch (e) {
      showError(getErrorMessage(e));
    } finally {
      setBtnLoadingId(null);
    }
  };

  const handleProceed = () => {
    if (!selectedId) {
      showError('Please select an address');
      return;
    }
    navigation.navigate('OrderScreen', { addressId: selectedId });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <ScreenHeader
        title={selectMode ? 'Select Address' : 'Saved Addresses'}
        subtitle={selectMode ? 'Choose delivery destination' : 'Manage shipping locations'}
        showBack
        rightElement={
          <AnimatedPressable
            onPress={() => navigation.navigate('AddEditAddress')}
            scaleTo={0.92}
            haptic="selection"
            style={[
              styles.addHeaderBtn,
              { backgroundColor: colors.primaryMuted, borderRadius: radius.full },
            ]}
          >
            <Ionicons name="add" size={20} color={colors.primary} />
            <Text style={[styles.addHeaderText, { color: colors.primary, fontWeight: typography.weights.bold }]}>
              Add
            </Text>
          </AnimatedPressable>
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 110 }]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {loading ? (
          <View style={styles.centerLoading}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              Loading addresses...
            </Text>
          </View>
        ) : addresses.length > 0 ? (
          addresses.map((address) => {
            const isSelected = selectedId === address.publicId;
            const isBusy = btnLoadingId === address.publicId;

            return (
              <AnimatedPressable
                key={address.publicId}
                onPress={() => {
                  if (selectMode) {
                    setSelectedId(address.publicId);
                  }
                }}
                scaleTo={0.98}
                haptic="selection"
                style={[
                  styles.addressCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: selectMode && isSelected ? colors.primary : colors.border,
                    borderRadius: radius.xl,
                    borderWidth: selectMode && isSelected ? 2 : 1,
                    ...shadows.xs,
                  },
                ]}
              >
                {/* Header Row */}
                <View style={styles.cardHeaderRow}>
                  <View style={styles.badgeRow}>
                    <View
                      style={[
                        styles.labelBadge,
                        {
                          backgroundColor: address.isDefault ? colors.successMuted : colors.primaryMuted,
                          borderRadius: radius.sm,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.labelBadgeText,
                          {
                            color: address.isDefault ? colors.success : colors.primary,
                            fontWeight: typography.weights.bold,
                          },
                        ]}
                      >
                        {address.isDefault ? 'DEFAULT' : (address.label || 'HOME').toUpperCase()}
                      </Text>
                    </View>
                  </View>

                  {selectMode && (
                    <Ionicons
                      name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                      size={22}
                      color={isSelected ? colors.primary : colors.textMuted}
                    />
                  )}
                </View>

                {/* Details */}
                <Text style={[styles.recipientName, { color: colors.text, fontWeight: typography.weights.bold }]}>
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

                {/* Management Action Buttons */}
                {!selectMode && (
                  <View style={styles.actionButtonsRow}>
                    <AnimatedPressable
                      onPress={() => navigation.navigate('AddEditAddress', { address })}
                      scaleTo={0.92}
                      haptic="selection"
                      style={[styles.actionBtn, { backgroundColor: colors.surfaceSubtle, borderRadius: radius.md }]}
                    >
                      <Ionicons name="create-outline" size={16} color={colors.text} />
                      <Text style={[styles.actionBtnText, { color: colors.text, fontWeight: typography.weights.semibold }]}>
                        Edit
                      </Text>
                    </AnimatedPressable>

                    {!address.isDefault && (
                      <AnimatedPressable
                        onPress={() => handleSetDefault(address)}
                        disabled={isBusy}
                        scaleTo={0.92}
                        haptic="selection"
                        style={[styles.actionBtn, { backgroundColor: colors.surfaceSubtle, borderRadius: radius.md }]}
                      >
                        {isBusy ? (
                          <ActivityIndicator size="small" color={colors.primary} />
                        ) : (
                          <>
                            <Ionicons name="star-outline" size={16} color={colors.primary} />
                            <Text style={[styles.actionBtnText, { color: colors.primary, fontWeight: typography.weights.semibold }]}>
                              Make Default
                            </Text>
                          </>
                        )}
                      </AnimatedPressable>
                    )}

                    <AnimatedPressable
                      onPress={() => handleDelete(address)}
                      disabled={isBusy}
                      scaleTo={0.92}
                      haptic="medium"
                      style={[styles.actionBtn, { backgroundColor: colors.dangerMuted, borderRadius: radius.md }]}
                    >
                      <Ionicons name="trash-outline" size={16} color={colors.danger} />
                      <Text style={[styles.actionBtnText, { color: colors.danger, fontWeight: typography.weights.semibold }]}>
                        Delete
                      </Text>
                    </AnimatedPressable>
                  </View>
                )}
              </AnimatedPressable>
            );
          })
        ) : (
          <View style={styles.emptyContainer}>
            <View style={[styles.emptyCircle, { backgroundColor: colors.surfaceSubtle }]}>
              <MaterialCommunityIcons name="map-marker-off" size={64} color={colors.textMuted} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text, fontWeight: typography.weights.extrabold }]}>
              No Addresses Saved
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              Add your delivery addresses to enjoy seamless and speedy checkouts.
            </Text>
            <AnimatedPressable
              onPress={() => navigation.navigate('AddEditAddress')}
              scaleTo={0.95}
              style={[
                styles.addAddressBtn,
                { backgroundColor: colors.primary, borderRadius: radius.full },
              ]}
              haptic="selection"
            >
              <Ionicons name="add" size={20} color="#FFFFFF" />
              <Text style={styles.addAddressBtnText}>Add New Address</Text>
            </AnimatedPressable>
          </View>
        )}
      </ScrollView>

      {/* Sticky Proceed Button for Checkout Mode */}
      {selectMode && addresses.length > 0 && (
        <View
          style={[
            styles.stickyBottom,
            {
              backgroundColor: colors.surface,
              borderTopColor: colors.border,
              ...shadows.lg,
            },
          ]}
        >
          <AnimatedPressable
            onPress={handleProceed}
            scaleTo={0.96}
            haptic="heavy"
            style={[
              styles.proceedBtn,
              {
                backgroundColor: colors.primary,
                borderRadius: radius.xl,
                ...shadows.glowPrimary,
              },
            ]}
          >
            <Text style={styles.proceedBtnText}>Deliver to This Address</Text>
            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
          </AnimatedPressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  addHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 4,
  },
  addHeaderText: {
    fontSize: 13,
  },
  centerLoading: {
    paddingVertical: 80,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  scrollContent: {
    padding: 16,
  },
  addressCard: {
    padding: 16,
    marginBottom: 14,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  labelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  labelBadgeText: {
    fontSize: 11,
    letterSpacing: 0.4,
  },
  recipientName: {
    fontSize: 15,
    marginBottom: 4,
  },
  addressLine: {
    fontSize: 13,
    lineHeight: 19,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    gap: 5,
  },
  actionBtnText: {
    fontSize: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
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
  addAddressBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingVertical: 14,
    gap: 6,
  },
  addAddressBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  stickyBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
  },
  proceedBtn: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  proceedBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
