// src/screens/AddEditAddress.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Switch,
  ActivityIndicator,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

import { createAddress, updateAddress } from '../services/addressService';
import { getErrorMessage } from '../services/apiClient';
import { useTheme } from '../theme';
import { ScreenHeader } from '../components/common/ScreenHeader';
import { AnimatedPressable } from '../components/common/AnimatedPressable';
import { useToast } from '../context/ToastContext';

const LABELS = ['HOME', 'WORK', 'OTHER'];

export default function AddEditAddress() {
  const navigation = useNavigation();
  const route = useRoute();
  const { colors, typography, radius, shadows, isDark } = useTheme();
  const { showSuccess, showError } = useToast();

  const { address } = route.params || {};
  const isEditing = Boolean(address?.publicId);

  const [label, setLabel] = useState(address?.label || 'HOME');
  const [recipientName, setRecipientName] = useState(address?.recipientName || '');
  const [phone, setPhone] = useState(address?.phone || '');
  const [line1, setLine1] = useState(address?.line1 || '');
  const [line2, setLine2] = useState(address?.line2 || '');
  const [city, setCity] = useState(address?.city || '');
  const [state, setState] = useState(address?.state || '');
  const [postalCode, setPostalCode] = useState(address?.postalCode || '');
  const [country, setCountry] = useState(address?.country || 'India');
  const [isDefault, setIsDefault] = useState(Boolean(address?.isDefault));
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!recipientName.trim()) {
      showError('Please enter recipient name');
      return;
    }
    if (!phone.trim()) {
      showError('Please enter contact phone number');
      return;
    }
    if (!line1.trim()) {
      showError('Please enter address line 1');
      return;
    }
    if (!city.trim()) {
      showError('Please enter city');
      return;
    }
    if (!postalCode.trim()) {
      showError('Please enter postal/ZIP code');
      return;
    }

    setSaving(true);
    const payload = {
      label,
      recipientName: recipientName.trim(),
      phone: phone.trim(),
      line1: line1.trim(),
      line2: line2.trim(),
      city: city.trim(),
      state: state.trim(),
      postalCode: postalCode.trim(),
      country: country.trim(),
      isDefault,
    };

    try {
      if (isEditing) {
        await updateAddress(address.publicId, payload);
        showSuccess('Address updated successfully');
      } else {
        await createAddress(payload);
        showSuccess('New address saved');
      }
      navigation.goBack();
    } catch (err) {
      showError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <ScreenHeader
        title={isEditing ? 'Edit Address' : 'Add New Address'}
        subtitle="Delivery destination details"
        showBack
        showCart={false}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: 60 }]}
        >
          {/* Label Type Selector */}
          <View style={styles.formGroup}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary, fontWeight: typography.weights.bold }]}>
              Address Type
            </Text>
            <View style={styles.labelPillRow}>
              {LABELS.map((item) => {
                const isSelected = label === item;
                return (
                  <AnimatedPressable
                    key={item}
                    onPress={() => setLabel(item)}
                    scaleTo={0.94}
                    haptic="selection"
                    style={[
                      styles.labelPill,
                      {
                        backgroundColor: isSelected ? colors.primary : colors.surface,
                        borderColor: isSelected ? colors.primary : colors.border,
                        borderRadius: radius.full,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.labelPillText,
                        {
                          color: isSelected ? '#FFFFFF' : colors.text,
                          fontWeight: isSelected ? typography.weights.bold : typography.weights.medium,
                        },
                      ]}
                    >
                      {item}
                    </Text>
                  </AnimatedPressable>
                );
              })}
            </View>
          </View>

          {/* Recipient Name */}
          <View style={styles.formGroup}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary, fontWeight: typography.weights.bold }]}>
              Recipient Name *
            </Text>
            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  color: colors.text,
                  borderRadius: radius.xl,
                },
              ]}
              placeholder="e.g. Rahul Sharma"
              placeholderTextColor={colors.textMuted}
              value={recipientName}
              onChangeText={setRecipientName}
            />
          </View>

          {/* Phone Number */}
          <View style={styles.formGroup}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary, fontWeight: typography.weights.bold }]}>
              Phone Number *
            </Text>
            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  color: colors.text,
                  borderRadius: radius.xl,
                },
              ]}
              placeholder="e.g. 9876543210"
              placeholderTextColor={colors.textMuted}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </View>

          {/* Address Line 1 */}
          <View style={styles.formGroup}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary, fontWeight: typography.weights.bold }]}>
              Address Line 1 (Flat, House no., Building) *
            </Text>
            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  color: colors.text,
                  borderRadius: radius.xl,
                },
              ]}
              placeholder="e.g. Flat 402, Green Valley Apts"
              placeholderTextColor={colors.textMuted}
              value={line1}
              onChangeText={setLine1}
            />
          </View>

          {/* Address Line 2 */}
          <View style={styles.formGroup}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary, fontWeight: typography.weights.bold }]}>
              Address Line 2 (Street, Area, Landmark)
            </Text>
            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  color: colors.text,
                  borderRadius: radius.xl,
                },
              ]}
              placeholder="e.g. Near City Hospital, MG Road"
              placeholderTextColor={colors.textMuted}
              value={line2}
              onChangeText={setLine2}
            />
          </View>

          {/* City & State Row */}
          <View style={styles.row}>
            <View style={[styles.formGroup, { flex: 1 }]}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary, fontWeight: typography.weights.bold }]}>
                City *
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    color: colors.text,
                    borderRadius: radius.xl,
                  },
                ]}
                placeholder="e.g. Bengaluru"
                placeholderTextColor={colors.textMuted}
                value={city}
                onChangeText={setCity}
              />
            </View>

            <View style={[styles.formGroup, { flex: 1 }]}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary, fontWeight: typography.weights.bold }]}>
                State
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    color: colors.text,
                    borderRadius: radius.xl,
                  },
                ]}
                placeholder="e.g. Karnataka"
                placeholderTextColor={colors.textMuted}
                value={state}
                onChangeText={setState}
              />
            </View>
          </View>

          {/* Postal Code & Country Row */}
          <View style={styles.row}>
            <View style={[styles.formGroup, { flex: 1 }]}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary, fontWeight: typography.weights.bold }]}>
                PIN Code *
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    color: colors.text,
                    borderRadius: radius.xl,
                  },
                ]}
                placeholder="e.g. 560001"
                placeholderTextColor={colors.textMuted}
                value={postalCode}
                onChangeText={setPostalCode}
                keyboardType="numeric"
              />
            </View>

            <View style={[styles.formGroup, { flex: 1 }]}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary, fontWeight: typography.weights.bold }]}>
                Country
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    color: colors.text,
                    borderRadius: radius.xl,
                  },
                ]}
                placeholder="India"
                placeholderTextColor={colors.textMuted}
                value={country}
                onChangeText={setCountry}
              />
            </View>
          </View>

          {/* Default Switch */}
          <View
            style={[
              styles.switchRow,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderRadius: radius.xl,
              },
            ]}
          >
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={[styles.switchTitle, { color: colors.text, fontWeight: typography.weights.semibold }]}>
                Set as Default Address
              </Text>
              <Text style={[styles.switchSub, { color: colors.textMuted }]}>
                Automatically selected for future checkouts
              </Text>
            </View>
            <Switch
              value={isDefault}
              onValueChange={setIsDefault}
              trackColor={{ false: '#CBD5E1', true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          {/* Submit Button */}
          <AnimatedPressable
            onPress={handleSave}
            disabled={saving}
            scaleTo={0.96}
            haptic="heavy"
            style={[
              styles.saveBtn,
              {
                backgroundColor: colors.primary,
                borderRadius: radius.xl,
                ...shadows.glowPrimary,
              },
            ]}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.saveBtnText}>
                {isEditing ? 'Update Address' : 'Save Address'}
              </Text>
            )}
          </AnimatedPressable>
        </ScrollView>
      </KeyboardAvoidingView>
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
  formGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    marginBottom: 6,
    marginLeft: 2,
  },
  labelPillRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 2,
  },
  labelPill: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderWidth: 1,
  },
  labelPillText: {
    fontSize: 13,
  },
  textInput: {
    height: 50,
    paddingHorizontal: 16,
    borderWidth: 1,
    fontSize: 15,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    marginTop: 4,
    marginBottom: 24,
  },
  switchTitle: {
    fontSize: 14,
  },
  switchSub: {
    fontSize: 12,
    marginTop: 2,
  },
  saveBtn: {
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
