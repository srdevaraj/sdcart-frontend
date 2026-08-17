import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../services/apiClient';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing Information', 'Please enter your email and password.');
      return;
    }

    setLoading(true);

    try {
      await login(email, password);
      // The navigator swaps to MainTabs automatically once userInfo is set.
    } catch (error) {
      Alert.alert('Login Failed', getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo */}
          <View style={styles.logoContainer}>
            <View style={styles.logoGlow}>
              <Image source={require('../../assets/clogo.png')} style={styles.logo} />
            </View>
          </View>

          {/* Heading */}
          <View style={styles.header}>
            <Text style={styles.title}>Welcome Back 👋</Text>

            <Text style={styles.subtitle}>Sign in to continue shopping with sdCart</Text>
          </View>

          {/* Login Card */}
          <View style={styles.card}>
            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>

              <View style={styles.inputWrapper}>
                <Text style={styles.inputIcon}>✉</Text>

                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor="#94A3B8"
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                  editable={!loading}
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>

              <View style={styles.inputWrapper}>
                <Text style={styles.inputIcon}>🔒</Text>

                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  editable={!loading}
                />

                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  activeOpacity={0.7}
                >
                  <Text style={styles.eyeIcon}>{showPassword ? '◉' : '◌'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.loginButton, loading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <View style={styles.loadingContent}>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text style={styles.loginButtonText}>Signing in...</Text>
                </View>
              ) : (
                <View style={styles.buttonContent}>
                  <Text style={styles.loginButtonText}>Sign In</Text>
                  <Text style={styles.arrow}>→</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Register */}
          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Don't have an account?</Text>

            <TouchableOpacity
              onPress={() => navigation.navigate('Register')}
              disabled={loading}
              activeOpacity={0.7}
            >
              <Text style={styles.registerLink}>Create Account</Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <Text style={styles.footer}>
            © {new Date().getFullYear()} sdCart. All rights reserved.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  keyboardView: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },

  /* ==================== LOGO ==================== */

  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },

  logoGlow: {
    width: 105,
    height: 105,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',

    shadowColor: '#0F172A',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.08,
    shadowRadius: 18,

    elevation: 6,
  },

  logo: {
    width: 82,
    height: 82,
    resizeMode: 'contain',
  },

  /* ==================== HEADER ==================== */

  header: {
    alignItems: 'center',
    marginBottom: 28,
  },

  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.6,
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: '#64748B',
    textAlign: 'center',
    paddingHorizontal: 20,
  },

  /* ==================== CARD ==================== */

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 22,

    shadowColor: '#0F172A',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.08,
    shadowRadius: 25,

    elevation: 7,

    borderWidth: 1,
    borderColor: '#F1F5F9',
  },

  /* ==================== INPUT ==================== */

  inputGroup: {
    marginBottom: 20,
  },

  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
  },

  inputWrapper: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',

    backgroundColor: '#F8FAFC',

    borderWidth: 1,
    borderColor: '#E2E8F0',

    borderRadius: 15,

    paddingHorizontal: 14,
  },

  inputIcon: {
    fontSize: 18,
    width: 28,
    color: '#64748B',
  },

  input: {
    flex: 1,
    height: '100%',

    fontSize: 15,
    color: '#0F172A',

    paddingHorizontal: 6,
  },

  eyeButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },

  eyeIcon: {
    fontSize: 20,
    color: '#64748B',
  },

  /* ==================== BUTTON ==================== */

  loginButton: {
    height: 56,
    borderRadius: 15,

    backgroundColor: '#2563EB',

    alignItems: 'center',
    justifyContent: 'center',

    marginTop: 4,

    shadowColor: '#2563EB',
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.22,
    shadowRadius: 12,

    elevation: 5,
  },

  loginButtonDisabled: {
    opacity: 0.75,
  },

  buttonContent: {
    width: '100%',
    paddingHorizontal: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.2,
  },

  arrow: {
    position: 'absolute',
    right: 22,

    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '400',
  },

  /* ==================== REGISTER ==================== */

  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',

    marginTop: 26,
  },

  registerText: {
    fontSize: 14,
    color: '#64748B',
  },

  registerLink: {
    marginLeft: 5,

    fontSize: 14,
    fontWeight: '800',

    color: '#2563EB',
  },

  /* ==================== FOOTER ==================== */

  footer: {
    textAlign: 'center',

    marginTop: 28,

    fontSize: 12,
    color: '#94A3B8',
  },
});
