// src/screens/LoginScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '../context/AuthContext';
import { useTheme } from '../theme';
import { AppImage } from '../components/common/AppImage';
import { AnimatedPressable } from '../components/common/AnimatedPressable';
import { useToast } from '../context/ToastContext';

export default function LoginScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { colors, typography, radius, shadows, isDark } = useTheme();
  const { login } = useAuth();
  const { showSuccess, showError } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim()) {
      showError('Please enter your email');
      return;
    }
    if (!password) {
      showError('Please enter your password');
      return;
    }

    setLoading(true);
    try {
      const result = await login(email.trim(), password);
      if (result?.success) {
        showSuccess('Welcome back!');
      } else {
        showError(result?.message || 'Invalid email or password');
      }
    } catch (e) {
      showError('Unable to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top + 20, paddingBottom: 40 },
          ]}
        >
          {/* Brand Header */}
          <View style={styles.brandHeader}>
            <View
              style={[
                styles.logoWrap,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  ...shadows.sm,
                },
              ]}
            >
              <AppImage
                source={require('../../assets/clogo.png')}
                style={styles.logo}
                contentFit="contain"
              />
            </View>

            <Text style={[styles.welcomeTitle, { color: colors.text, fontWeight: typography.weights.black }]}>
              Welcome Back
            </Text>
            <Text style={[styles.welcomeSubtitle, { color: colors.textSecondary }]}>
              Sign in to manage your orders, wishlist, and cart
            </Text>
          </View>

          {/* Form Card */}
          <View
            style={[
              styles.formCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderRadius: radius['2xl'],
                ...shadows.sm,
              },
            ]}
          >
            {/* Email Field */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary, fontWeight: typography.weights.bold }]}>
                Email Address
              </Text>
              <View
                style={[
                  styles.inputFieldWrap,
                  {
                    backgroundColor: colors.surfaceSubtle,
                    borderColor: colors.border,
                    borderRadius: radius.xl,
                  },
                ]}
              >
                <Ionicons name="mail-outline" size={20} color={colors.textMuted} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="name@example.com"
                  placeholderTextColor={colors.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoComplete="email"
                />
              </View>
            </View>

            {/* Password Field */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary, fontWeight: typography.weights.bold }]}>
                Password
              </Text>
              <View
                style={[
                  styles.inputFieldWrap,
                  {
                    backgroundColor: colors.surfaceSubtle,
                    borderColor: colors.border,
                    borderRadius: radius.xl,
                  },
                ]}
              >
                <Ionicons name="lock-closed-outline" size={20} color={colors.textMuted} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Enter your password"
                  placeholderTextColor={colors.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <AnimatedPressable
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeBtn}
                  scaleTo={0.88}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={colors.textMuted}
                  />
                </AnimatedPressable>
              </View>
            </View>

            {/* Sign In Button */}
            <AnimatedPressable
              onPress={handleLogin}
              disabled={loading}
              scaleTo={0.96}
              haptic="heavy"
              style={[
                styles.submitBtn,
                {
                  backgroundColor: colors.primary,
                  borderRadius: radius.xl,
                  ...shadows.glowPrimary,
                },
              ]}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.submitBtnText}>Sign In</Text>
              )}
            </AnimatedPressable>
          </View>

          {/* Create Account Link */}
          <View style={styles.registerPromptRow}>
            <Text style={[styles.registerPromptText, { color: colors.textSecondary }]}>
              Don't have an account?
            </Text>
            <AnimatedPressable
              onPress={() => navigation.navigate('Register')}
              scaleTo={0.94}
              haptic="selection"
            >
              <Text style={[styles.registerLinkText, { color: colors.primary, fontWeight: typography.weights.bold }]}>
                Create Account
              </Text>
            </AnimatedPressable>
          </View>
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
    paddingHorizontal: 20,
  },
  brandHeader: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoWrap: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    padding: 10,
    marginBottom: 16,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  welcomeTitle: {
    fontSize: 26,
    letterSpacing: -0.3,
  },
  welcomeSubtitle: {
    fontSize: 14,
    marginTop: 6,
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  formCard: {
    padding: 20,
    borderWidth: 1,
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 18,
  },
  inputLabel: {
    fontSize: 13,
    marginBottom: 6,
    marginLeft: 2,
  },
  inputFieldWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    paddingHorizontal: 14,
    borderWidth: 1,
    gap: 10,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 15,
  },
  eyeBtn: {
    padding: 6,
  },
  submitBtn: {
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  registerPromptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  registerPromptText: {
    fontSize: 14,
  },
  registerLinkText: {
    fontSize: 14,
  },
});
