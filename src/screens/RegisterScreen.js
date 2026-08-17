import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    ActivityIndicator,
    Alert,
} from 'react-native';

import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../services/apiClient';

export default function RegisterScreen({ navigation }) {

    // ============================================================
    // STEP
    // ============================================================

    const [step, setStep] = useState(1);

    // ============================================================
    // FORM DATA
    // ============================================================

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');

    const [email, setEmail] = useState('');
    const [mobile, setMobile] = useState('');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // ============================================================
    // UI STATES
    // ============================================================

    const [loading, setLoading] = useState(false);

    const { register } = useAuth();

    // ============================================================
    // VALIDATION - STEP 1
    // ============================================================

    const validateStep1 = () => {

        if (!firstName.trim()) {
            Alert.alert('Required', 'Please enter your first name.');
            return false;
        }

        if (!lastName.trim()) {
            Alert.alert('Required', 'Please enter your last name.');
            return false;
        }

        return true;
    };

    // ============================================================
    // VALIDATION - STEP 2
    // ============================================================

    const validateStep2 = () => {

        const emailRegex = /^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$/;

        if (!email.trim()) {
            Alert.alert('Required', 'Please enter your email address.');
            return false;
        }

        if (!emailRegex.test(email.trim())) {
            Alert.alert('Invalid Email', 'Please enter a valid email address.');
            return false;
        }

        if (!mobile.trim()) {
            Alert.alert('Required', 'Please enter your mobile number.');
            return false;
        }

        const mobileRegex = /^[0-9]{10}$/;

        if (!mobileRegex.test(mobile.trim())) {
            Alert.alert('Invalid Mobile', 'Please enter a valid 10-digit mobile number.');
            return false;
        }

        return true;
    };

    // ============================================================
    // VALIDATION - STEP 3
    // ============================================================

    const validateStep3 = () => {

        if (!password) {
            Alert.alert('Required', 'Please enter a password.');
            return false;
        }

        // Backend requires at least 8 characters (RegisterRequest).
        if (password.length < 8) {
            Alert.alert('Weak Password', 'Password must contain at least 8 characters.');
            return false;
        }

        if (!confirmPassword) {
            Alert.alert('Required', 'Please confirm your password.');
            return false;
        }

        if (password !== confirmPassword) {
            Alert.alert('Password Mismatch', 'Passwords do not match.');
            return false;
        }

        return true;
    };

    // ============================================================
    // NEXT STEP
    // ============================================================

    const handleNext = () => {

        if (step === 1) {

            if (!validateStep1()) {
                return;
            }

            setStep(2);
            return;
        }

        if (step === 2) {

            if (!validateStep2()) {
                return;
            }

            setStep(3);
            return;
        }

        if (step === 3) {

            if (!validateStep3()) {
                return;
            }

            registerUser();
        }
    };

    // ============================================================
    // REGISTER USER
    // ============================================================

    const registerUser = async () => {

        if (loading) {
            return;
        }

        try {

            setLoading(true);

            // Matches the backend RegisterRequest contract:
            // { firstName, lastName, email, password, phone }
            await register({
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                email: email.trim().toLowerCase(),
                password,
                phone: mobile.trim(),
            });

            // Registration returns a token pair, so the user is logged in and
            // the navigator switches to the main tabs automatically.
            Alert.alert(
                'Registration Successful',
                'Welcome to sdCart! Your account has been created.',
                [
                    {
                        text: 'Continue Shopping',
                    },
                ]
            );

        } catch (error) {

            Alert.alert('Registration Failed', getErrorMessage(error));

        } finally {

            setLoading(false);
        }
    };

    // ============================================================
    // PREVIOUS STEP
    // ============================================================

    const handleBack = () => {

        if (loading) {
            return;
        }

        if (step > 1) {
            setStep(step - 1);
        } else {
            navigation.goBack();
        }
    };

    // ============================================================
    // STEP TITLE
    // ============================================================

    const getStepTitle = () => {

        switch (step) {

            case 1:
                return 'Personal Information';

            case 2:
                return 'Contact Information';

            case 3:
                return 'Create Password';

            default:
                return 'Create Account';
        }
    };

    // ============================================================
    // RENDER
    // ============================================================

    return (
        <SafeAreaView style={styles.safeArea}>

            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >

                <ScrollView
                    contentContainerStyle={styles.scrollContainer}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >

                    {/* HEADER */}

                    <View style={styles.header}>

                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={handleBack}
                            disabled={loading}
                        >

                            <Text style={styles.backIcon}>‹</Text>

                        </TouchableOpacity>

                        <View style={styles.headerTextContainer}>

                            <Text style={styles.title}>
                                Create Account
                            </Text>

                            <Text style={styles.subtitle}>
                                Join sdCart and start shopping
                            </Text>

                        </View>

                    </View>

                    {/* PROGRESS */}

                    <View style={styles.progressContainer}>

                        {[1, 2, 3].map((item) => (

                            <React.Fragment key={item}>

                                <View
                                    style={[
                                        styles.progressStep,
                                        item <= step && styles.progressStepActive,
                                    ]}
                                >

                                    <Text
                                        style={[
                                            styles.progressNumber,
                                            item <= step && styles.progressNumberActive,
                                        ]}
                                    >
                                        {item}
                                    </Text>

                                </View>

                                {item !== 3 && (

                                    <View
                                        style={[
                                            styles.progressLine,
                                            item < step && styles.progressLineActive,
                                        ]}
                                    />

                                )}

                            </React.Fragment>

                        ))}

                    </View>

                    {/* STEP COUNTER */}

                    <Text style={styles.stepCounter}>
                        Step {step} of 3
                    </Text>

                    <Text style={styles.sectionTitle}>
                        {getStepTitle()}
                    </Text>

                    {/* ================================================= */}
                    {/* STEP 1 */}
                    {/* ================================================= */}

                    {step === 1 && (

                        <View>

                            <InputField
                                label="First Name"
                                value={firstName}
                                onChangeText={setFirstName}
                                placeholder="Enter your first name"
                            />

                            <InputField
                                label="Last Name"
                                value={lastName}
                                onChangeText={setLastName}
                                placeholder="Enter your last name"
                            />

                        </View>
                    )}

                    {/* ================================================= */}
                    {/* STEP 2 */}
                    {/* ================================================= */}

                    {step === 2 && (

                        <View>

                            <InputField
                                label="Email Address"
                                value={email}
                                onChangeText={setEmail}
                                placeholder="example@gmail.com"
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />

                            <InputField
                                label="Mobile Number"
                                value={mobile}
                                onChangeText={setMobile}
                                placeholder="10-digit mobile number"
                                keyboardType="phone-pad"
                                maxLength={10}
                            />

                        </View>
                    )}

                    {/* ================================================= */}
                    {/* STEP 3 */}
                    {/* ================================================= */}

                    {step === 3 && (

                        <View>

                            <InputField
                                label="Password"
                                value={password}
                                onChangeText={setPassword}
                                placeholder="Create a password"
                                secureTextEntry
                            />

                            <InputField
                                label="Confirm Password"
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                placeholder="Re-enter your password"
                                secureTextEntry
                            />

                            <View style={styles.passwordInfo}>

                                <Text style={styles.passwordInfoTitle}>
                                    Password requirements
                                </Text>

                                <Text style={styles.passwordInfoText}>
                                    • At least 8 characters
                                </Text>

                                <Text style={styles.passwordInfoText}>
                                    • Passwords must match
                                </Text>

                            </View>

                        </View>
                    )}

                    {/* ACTION BUTTON */}

                    <TouchableOpacity
                        style={[
                            styles.primaryButton,
                            loading && styles.primaryButtonDisabled,
                        ]}
                        onPress={handleNext}
                        disabled={loading}
                        activeOpacity={0.8}
                    >

                        {loading ? (

                            <View style={styles.loadingContainer}>

                                <ActivityIndicator
                                    size="small"
                                    color="#ffffff"
                                />

                                <Text style={styles.buttonText}>
                                    Creating Account...
                                </Text>

                            </View>

                        ) : (

                            <Text style={styles.buttonText}>
                                {step === 3 ? 'Create Account' : 'Continue'}
                            </Text>

                        )}

                    </TouchableOpacity>

                    {/* LOGIN */}

                    <View style={styles.loginContainer}>

                        <Text style={styles.loginText}>
                            Already have an account?
                        </Text>

                        <TouchableOpacity
                            onPress={() => navigation.navigate('Login')}
                            disabled={loading}
                        >

                            <Text style={styles.loginLink}>
                                Login
                            </Text>

                        </TouchableOpacity>

                    </View>

                </ScrollView>

            </KeyboardAvoidingView>

        </SafeAreaView>
    );
}

// ================================================================
// INPUT COMPONENT
// ================================================================

function InputField({
    label,
    value,
    onChangeText,
    placeholder,
    secureTextEntry = false,
    keyboardType = 'default',
    autoCapitalize = 'sentences',
    maxLength,
}) {

    return (

        <View style={styles.inputContainer}>

            <Text style={styles.inputLabel}>
                {label}
            </Text>

            <TextInput
                style={styles.input}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor="#9CA3AF"
                secureTextEntry={secureTextEntry}
                keyboardType={keyboardType}
                autoCapitalize={autoCapitalize}
                autoCorrect={false}
                maxLength={maxLength}
            />

        </View>
    );
}

// ================================================================
// STYLES
// ================================================================

const styles = StyleSheet.create({

    safeArea: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },

    container: {
        flex: 1,
    },

    scrollContainer: {
        flexGrow: 1,
        paddingHorizontal: 22,
        paddingTop: 20,
        paddingBottom: 35,
    },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 25,
        marginTop: 100,
    },

    backButton: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 5,
        shadowOffset: {
            width: 0,
            height: 2,
        },
    },

    backIcon: {
        fontSize: 32,
        lineHeight: 34,
        color: '#111827',
        fontWeight: '300',
    },

    headerTextContainer: {
        flex: 1,
    },

    title: {
        fontSize: 27,
        fontWeight: '800',
        color: '#111827',
    },

    subtitle: {
        marginTop: 4,
        fontSize: 14,
        color: '#6B7280',
    },

    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },

    progressStep: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#E5E7EB',
        alignItems: 'center',
        justifyContent: 'center',
    },

    progressStepActive: {
        backgroundColor: '#2563EB',
    },

    progressNumber: {
        fontSize: 14,
        fontWeight: '700',
        color: '#6B7280',
    },

    progressNumberActive: {
        color: '#FFFFFF',
    },

    progressLine: {
        flex: 1,
        height: 3,
        backgroundColor: '#E5E7EB',
        marginHorizontal: 6,
    },

    progressLineActive: {
        backgroundColor: '#2563EB',
    },

    stepCounter: {
        fontSize: 13,
        fontWeight: '600',
        color: '#6B7280',
        marginTop: 5,
    },

    sectionTitle: {
        fontSize: 21,
        fontWeight: '800',
        color: '#111827',
        marginTop: 8,
        marginBottom: 22,
    },

    inputContainer: {
        marginBottom: 18,
    },

    inputLabel: {
        fontSize: 14,
        fontWeight: '700',
        color: '#374151',
        marginBottom: 8,
    },

    input: {
        height: 54,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 14,
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 16,
        fontSize: 15,
        color: '#111827',
    },

    passwordInfo: {
        backgroundColor: '#EFF6FF',
        borderRadius: 14,
        padding: 16,
        marginTop: 2,
        marginBottom: 10,
    },

    passwordInfoTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1E40AF',
        marginBottom: 7,
    },

    passwordInfoText: {
        fontSize: 13,
        color: '#475569',
        marginTop: 3,
    },

    primaryButton: {
        height: 56,
        borderRadius: 15,
        backgroundColor: '#2563EB',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 18,
        elevation: 3,
        shadowColor: '#2563EB',
        shadowOpacity: 0.2,
        shadowRadius: 8,
        shadowOffset: {
            width: 0,
            height: 4,
        },
    },

    primaryButtonDisabled: {
        opacity: 0.7,
    },

    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '800',
    },

    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },

    loginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 25,
    },

    loginText: {
        fontSize: 14,
        color: '#6B7280',
    },

    loginLink: {
        fontSize: 14,
        fontWeight: '800',
        color: '#2563EB',
        marginLeft: 5,
    },
});
