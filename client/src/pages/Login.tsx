import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Dimensions,
    Image,
    Modal,
} from 'react-native';
import { ParamListBase, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import axios from 'axios';
import styles from '../assets/style/loginStyle';
import InputText from '../components/TextInput.tsx';
import { COLORS } from '../assets/constants/constant';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from '../../contextAuth.tsx';
import { BASE_URL } from '../config/config.ts';
import LinearGradient from 'react-native-linear-gradient';
import Footer from '../components/Footer.tsx';
import FloatingARElement from '../components/Floatingelements.tsx';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { faGoogle } from '@fortawesome/free-brands-svg-icons'; // ✅ Correct

import SpinningCubeLoader from '../components/SpinningCubeLoader';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { supabase } from '../../supabaseClient.ts';
import { FONT_SIZE, FONTS } from '../assets/constants/constant';

const { width, height } = Dimensions.get('window');
type FloatingElement = {
    type: string;
    initialPosition: {
        x: number;
        y: number;
    };
};

const LoginScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
    const { setUser, loginAsGuest } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string; verificationCode?: string }>({});
    const [containerSize, setContainerSize] = useState({ width: width, height: 200 });
    const [floatingElements, setFloatingElements] = useState<FloatingElement[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loginTimeout, setLoginTimeout] = useState<NodeJS.Timeout | null>(null);
    const [showTermsModal, setShowTermsModal] = useState(false);
    const [showResendVerification, setShowResendVerification] = useState(false);
    const [showVerificationModal, setShowVerificationModal] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');
    const [verificationEmail, setVerificationEmail] = useState('');
    const [verificationAttempts, setVerificationAttempts] = useState(0);
    const [resendDisabled, setResendDisabled] = useState(false);
    const [resendCountdown, setResendCountdown] = useState(0);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const validateForm = (): boolean => {
        const newErrors: { email?: string; password?: string; general?: string } = {};

        if (!email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!emailRegex.test(email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (!password.trim()) {
            newErrors.password = 'Password is required';
        } else if (password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters long';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    useEffect(() => {
        // Try with a completely different configuration
        GoogleSignin.configure({
            // Use ONLY the Web client ID
            webClientId: process.env.WEB_CLIENT_ID || '',
            // Try without any additional options
            scopes: ['email', 'profile']
        });
    }, []);

    const handleGoogleSignIn = async () => {
        setShowTermsModal(true);
    };

    const proceedWithGoogleSignIn = async () => {
        setShowTermsModal(false);
        setIsLoading(true);
        setErrors({});

        try {
            // Check Play Services
            await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

            // Sign out any existing user to ensure clean state
            try {
                await GoogleSignin.signOut();
            } catch (e) {
                console.log("Google Signout:", e);
            }

            // Get Google user info
            const userInfo = await GoogleSignin.signIn();

            // Get tokens explicitly
            const tokens = await GoogleSignin.getTokens();

            if (!tokens.idToken) {
                throw new Error("No ID token received from Google");
            }

            // Sign in with Supabase using the Google token
            const { data, error } = await supabase.auth.signInWithIdToken({
                provider: 'google',
                token: tokens.idToken,
            });

            if (error) {
                throw error;
            }

            // Set user in context and store session
            if (data.user) {
                setUser(data.user);

                if (data.session) {
                    await AsyncStorage.setItem("token", data.session.access_token);
                }

                // Navigate to main app
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'Tabs' }],
                });
            }
        } catch (error: unknown) {
            console.error("Google Sign In Error:", error);

            // Type guard for Google Sign In errors
            if (error && typeof error === 'object' && 'code' in error) {
                const googleError = error as { code: string; message?: string };

                if (googleError.code === statusCodes.SIGN_IN_CANCELLED) {
                    setErrors(prev => ({ ...prev, general: 'Sign-in was cancelled' }));
                } else if (googleError.code === statusCodes.IN_PROGRESS) {
                    setErrors(prev => ({ ...prev, general: 'Sign-in is already in progress' }));
                } else if (googleError.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
                    setErrors(prev => ({ ...prev, general: 'Play services not available or outdated' }));
                } else {
                    setErrors(prev => ({
                        ...prev,
                        general: `Google Sign In failed: ${googleError.message || 'Unknown error'}`
                    }));
                }
            } else {
                // Handle generic errors
                const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                setErrors(prev => ({
                    ...prev,
                    general: `Sign in failed: ${errorMessage}`
                }));
            }
        } finally {
            setIsLoading(false);
        }
    };

    const loginUser = async (email: string, password: string) => {
        try {
            console.log('Attempting to login with:', { email, password });
            const response = await axios.post(`${BASE_URL}/auth/login`, { email, password });
            const { access_token } = response.data;
            await AsyncStorage.setItem("token", access_token);
            console.log("Token saved in AsyncStorage:", access_token);
            return access_token;
        } catch (error: any) {
            console.log("Login error:", error.response?.status, error.response?.data);

            // Check specifically for the 403 verification error
            if (error.response && error.response.status === 403 &&
                error.response.data?.detail?.includes("Email not verified")) {

                console.log("Unverified account detected, showing verification modal");

                // Set verification email for the modal
                setVerificationEmail(email);

                // Show verification modal
                setShowVerificationModal(true);

                setErrors(prev => ({
                    ...prev,
                    general: "Please verify your email before logging in. A new verification code has been sent to your email."
                }));

                // Throw a specific error to be caught by the calling function
                throw new Error("EMAIL_NOT_VERIFIED");
            }

            // Handle other errors
            let errorMessage = 'Something went wrong. Please try again.';

            if (error.response) {
                if (error.response.status === 401) {
                    errorMessage = 'Invalid email or password';
                } else if (error.response.status === 400) {
                    errorMessage = error.response.data?.detail || 'Invalid login details provided';
                } else if (error.response.status >= 500) {
                    errorMessage = 'Server error. Please try again later';
                } else {
                    errorMessage = error.response.data?.detail || errorMessage;
                }
            } else if (error.request) {
                errorMessage = 'Network error. Please check your internet connection';
            }

            setErrors(prev => ({
                ...prev,
                general: errorMessage
            }));

            throw error;
        }
    };

    const getUserProfile = async () => {
        try {
            const token = await AsyncStorage.getItem("token");
            if (!token) {
                setErrors(prev => ({
                    ...prev,
                    general: 'Authentication error. Please try logging in again'
                }));
                throw new Error('No token found');
            }
            const response = await axios.get(`${BASE_URL}/auth/profile`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error: any) {
            setErrors(prev => ({
                ...prev,
                general: 'Failed to load profile. Please try again'
            }));
            return null;
        }
    };

    const handleLogin = async () => {
        setErrors({});

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        // Set a timeout for 15 seconds
        const timeout = setTimeout(() => {
            setIsLoading(false);
            setErrors(prev => ({
                ...prev,
                general: 'Login is taking longer than expected. Please check your connection and try again.'
            }));
        }, 15000);

        setLoginTimeout(timeout);

        try {
            const token = await loginUser(email, password);
            if (token) {
                const profile = await getUserProfile();
                if (profile) {
                    setUser(profile);
                    navigation.reset({
                        index: 0,
                        routes: [{ name: 'Tabs' }],
                    });
                }
            }
        } catch (error: any) {
            console.log("Login error in handleLogin:", error);

            // Special case for unverified email - already handled in loginUser
            if (error.message === "EMAIL_NOT_VERIFIED") {
                console.log("Unverified email error caught in handleLogin");
                // The verification modal is already shown in loginUser
            }
            // Other errors are already handled in loginUser
        } finally {
            if (loginTimeout) {
                clearTimeout(loginTimeout);
            }
            setIsLoading(false);
        }
    };

    const handleGuest = async () => {
        loginAsGuest();
        navigation.reset({
            index: 0,
            routes: [{ name: 'Tabs' }],
        });
        console.log("LoginScreen - Navigated to Tabs with reset");
    };

    const handleSignup = () => {
        navigation.navigate('Signup');
    };

    const handleForgotPassword = () => {
        navigation.navigate('ForgotPassword');
    };

    const errorMessage = errors.general || errors.email || errors.password;

    const onGradientLayout = (event) => {
        const { width, height } = event.nativeEvent.layout;
        setContainerSize({ width, height });
    };

    useEffect(() => {
        if (containerSize.width > 0 && containerSize.height > 0) {
            const newElements: FloatingElement[] = [
                { type: 'eye', initialPosition: { x: -containerSize.width * 0.6, y: -containerSize.height * 0.6 } },
                { type: 'wave', initialPosition: { x: containerSize.width * 0.6, y: -containerSize.height * 0.6 } },
                { type: 'box', initialPosition: { x: 0, y: containerSize.height * 0.6 } },
                { type: 'hologram', initialPosition: { x: -containerSize.width * 0.6, y: containerSize.height * 0.6 } },
                { type: 'palm', initialPosition: { x: containerSize.width * 0.6, y: containerSize.height * 0.6 } },
                { type: 'star', initialPosition: { x: -containerSize.width * 0.6, y: 0 } },
                { type: 'eye', initialPosition: { x: containerSize.width * 0.6, y: 0 } },
            ];
            setFloatingElements(newElements);
        }
    }, [containerSize]);

    const renderError = () => {
        if (!errorMessage) return null;

        return (
            <View style={styles.modernErrorContainer}>
                <View style={styles.modernErrorContent}>
                    <FontAwesomeIcon
                        icon={faExclamationTriangle}
                        size={20}
                        color="#fff"
                        style={styles.errorIcon}
                    />
                    <Text style={styles.modernErrorText}>{errorMessage}</Text>
                </View>
            </View>
        );
    };

    // Add this new function for testing
    const testGoogleSignIn = async () => {
        try {
            console.log("=== TESTING GOOGLE SIGN IN ===");
            console.log("1. Checking if user is already signed in");

            // First sign out to ensure clean state
            try {
                await GoogleSignin.signOut();
                console.log("2. Signed out any existing user");
            } catch (e) {
                console.log("2. No user was signed in or error signing out:", e);
            }

            // Check Play Services with more detailed error handling
            try {
                await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
                console.log("3. Play Services check passed");
            } catch (e) {
                console.log("3. Play Services check failed:", e);
                throw e;
            }

            // Try to get available user info
            try {
                const userInfo = await GoogleSignin.signIn();
                console.log("4. Sign in successful:", userInfo);

                // If we get here, we can try to get the token
                const tokens = await GoogleSignin.getTokens();
                console.log("5. Got tokens:", tokens);

                // Now try Supabase
                if (tokens.idToken) {
                    console.log("6. Attempting Supabase sign in with token");
                    const { data, error } = await supabase.auth.signInWithIdToken({
                        provider: 'google',
                        token: tokens.idToken,
                    });

                    if (error) {
                        console.log("7. Supabase auth error:", error);
                    } else {
                        console.log("7. Supabase auth successful:", data);
                        // Success! Now you can navigate
                    }
                }
            } catch (e) {
                console.log("4. Sign in failed:", e);
                throw e;
            }
        } catch (error) {
            console.error("TEST FAILED:", error);
            console.log("Error details:", {
                code: error && typeof error === 'object' && 'code' in error ? (error as any).code : undefined,
                message: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined
            });
        }
    };

    const navigateToTerms = () => {
        // Close any open modals before navigating
        setShowTermsModal(false);
        navigation.navigate("TermsAndConditions" as never);
    };

    const navigateToPrivacy = () => {
        // Close any open modals before navigating
        setShowTermsModal(false);
        navigation.navigate("PrivacyPolicy" as never);
    };

    const TermsAgreementModal = () => (
        <Modal
            transparent
            visible={showTermsModal}
            animationType="fade"
            statusBarTranslucent
        >
            <View style={styles.modalBackground}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Terms & Privacy</Text>
                    </View>

                    <Text style={styles.modalDescription}>
                        By continuing with Google Sign-In, you agree to our Terms and Conditions and Privacy Policy.
                    </Text>

                    <View style={styles.modalLinks}>
                        <TouchableOpacity onPress={navigateToTerms}>
                            <Text style={styles.modalLink}>Terms and Conditions</Text>
                        </TouchableOpacity>
                        <Text style={styles.modalDot}>•</Text>
                        <TouchableOpacity onPress={navigateToPrivacy}>
                            <Text style={styles.modalLink}>Privacy Policy</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.modalActions}>
                        <TouchableOpacity
                            style={styles.modalCancelButton}
                            onPress={() => setShowTermsModal(false)}
                        >
                            <Text style={styles.modalCancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.modalAgreeButton}
                            onPress={proceedWithGoogleSignIn}
                        >
                            <Text style={styles.modalAgreeButtonText}>Agree & Continue</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );

    // Add this useEffect to ensure modals are closed when component unmounts
    useEffect(() => {
        return () => {
            setShowTermsModal(false);
        };
    }, []);

    const handleResendVerification = async () => {
        if (!email.trim()) {
            setErrors(prev => ({
                ...prev,
                email: "Please enter your email address"
            }));
            return;
        }

        setIsLoading(true);
        try {
            const { error } = await supabase.auth.resend({
                type: 'signup',
                email: email.trim().toLowerCase(),
            });

            if (error) throw error;

            // Show success message
            setErrors(prev => ({
                ...prev,
                general: "Verification email resent! Please check your inbox."
            }));
            setShowResendVerification(false);
        } catch (error: any) {
            setErrors(prev => ({
                ...prev,
                general: `Failed to resend: ${error.message}`
            }));
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyEmail = async () => {
        if (!verificationCode.trim()) {
            setErrors(prev => ({
                ...prev,
                verificationCode: "Please enter the verification code"
            }));
            return;
        }

        setIsLoading(true);
        try {
            const response = await axios.post(
                `${BASE_URL}/auth/verify-email`,
                {
                    email: verificationEmail,
                    code: verificationCode,
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.status === 200) {
                // Store the token from verification response
                const { access_token } = response.data;
                await AsyncStorage.setItem("token", access_token);

                // Close modal and navigate to main app
                setShowVerificationModal(false);
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'Tabs' }],
                });
            } else {
                throw new Error(
                    response.data?.detail || "Unexpected error during verification."
                );
            }
        } catch (error: any) {
            setVerificationAttempts(prev => prev + 1);

            if (error.response) {
                const errorMessage = error.response?.data?.detail || "Invalid verification code";
                setErrors((prev) => ({
                    ...prev,
                    verificationCode: errorMessage,
                }));
            } else {
                setErrors((prev) => ({
                    ...prev,
                    verificationCode: "Network error. Please try again.",
                }));
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendCode = async () => {
        setIsLoading(true);
        try {
            const response = await axios.post(
                `${BASE_URL}/auth/resend-verification`,
                { email: verificationEmail },
                {
                    headers: {
                        "Content-Type": "application/json",
                    }
                }
            );

            if (response.status === 200) {
                setErrors({});
                setVerificationCode("");
                setVerificationAttempts(0);

                // Disable resend button for 60 seconds
                setResendDisabled(true);
                setResendCountdown(60);

                const countdownInterval = setInterval(() => {
                    setResendCountdown(prev => {
                        if (prev <= 1) {
                            clearInterval(countdownInterval);
                            setResendDisabled(false);
                            return 0;
                        }
                        return prev - 1;
                    });
                }, 1000);
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.detail || "Failed to resend verification code";
            setErrors(prev => ({
                ...prev,
                general: error.response ? errorMessage : "Network error. Please try again."
            }));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                {renderError()}

                {isLoading && (
                    <View style={styles.loadingOverlay}>
                        <SpinningCubeLoader size={25} />

                    </View>
                )}

                <View style={styles.upperContainer}>
                    <LinearGradient
                        colors={['#6B48FF', '#8E2DE2']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={[styles.gradientContainer, { position: 'relative' }]}
                        onLayout={onGradientLayout}
                    >
                        {floatingElements.map((element, index) => (
                            <FloatingARElement
                                key={index}
                                type={element.type}
                                initialPosition={element.initialPosition}
                                containerSize={containerSize}
                            />
                        ))}
                        <Text style={styles.miniText}>Welcome to</Text>
                        <Text style={styles.text}>Produkto Elyukal</Text>
                        <Text style={styles.subText}>Sign In & Pick Up Where You Left Off!</Text>
                    </LinearGradient>
                </View>

                <View style={styles.formContainer}>

                    <View style={[styles.inputContainer, { marginBottom: 20 }]}>
                        <InputText
                            labelName="Email"
                            placeholder="example@gmail.com"
                            placeholderTextColor={COLORS.gray}
                            value={email}
                            onChangeText={(text) => {
                                setEmail(text);
                                setErrors((prev) => ({ ...prev, email: undefined }));
                            }}
                            error={!!errors.email}
                            errorText={errors.email}
                            extraStyle={{ marginBottom: 0 }}
                        />
                    </View>

                    <View style={[styles.inputContainer, { marginBottom: 20 }]}>
                        <InputText
                            labelName="Password"
                            placeholder="Your password"
                            placeholderTextColor={COLORS.gray}
                            value={password}
                            onChangeText={(text) => {
                                setPassword(text);
                                setErrors((prev) => ({ ...prev, password: undefined }));
                            }}
                            error={!!errors.password}
                            errorText={errors.password}
                            secureTextEntry={true}
                            extraStyle={{ marginBottom: 0 }}
                        />
                    </View>

                    <TouchableOpacity style={styles.forgotPasswordContainer} onPress={handleForgotPassword}>
                        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.loginButton,
                            isLoading && styles.loginButtonDisabled
                        ]}
                        onPress={handleLogin}
                        disabled={isLoading}
                    >
                        <Text style={styles.loginButtonText}>
                            {isLoading ? 'Signing in...' : 'Login'}
                        </Text>
                    </TouchableOpacity>
                    {showResendVerification && (
                        <TouchableOpacity
                            style={styles.resendButton}
                            onPress={handleResendVerification}
                        >
                            <Text style={styles.resendButtonText}>Resend Verification Email</Text>
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity
                        style={[
                            styles.loginGoogleButton,

                        ]}
                        onPress={handleGoogleSignIn}
                        disabled={isLoading}
                    >
                        <FontAwesomeIcon
                            icon={faGoogle}
                            size={20}
                            color={COLORS.white}
                            style={styles.googleIcon}
                        />
                        <Text style={styles.loginGoogleButtonText}>Sign in with Google</Text>
                    </TouchableOpacity>

                    <Text style={styles.orText}>
                        or
                    </Text>

                    <TouchableOpacity style={styles.continueGuestButton} onPress={handleGuest}>
                        <Text style={styles.continueGuestButtonText}>Continue as Guest</Text>
                    </TouchableOpacity>

                    <View style={styles.loginContainer}>
                        <Text style={styles.loginText}>Don't have an account? </Text>
                        <TouchableOpacity onPress={handleSignup}>
                            <Text style={styles.signupLinkText}>Sign Up</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.footerContainer}>
                        <Footer />
                    </View>
                </View>
            </KeyboardAvoidingView>
            <TermsAgreementModal />
            {/* Verification Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={showVerificationModal}
                onRequestClose={() => setShowVerificationModal(false)}
            >
                <View style={styles.verificationModalContainer}>
                    <View style={styles.verificationModalContent}>
                        <Text style={styles.verificationModalTitle}>Email Verification</Text>
                        <Text style={styles.verificationModalText}>
                            Please enter the verification code sent to your email.
                        </Text>

                        <InputText
                            labelName="Verification Code"
                            placeholder="Enter verification code..."
                            placeholderTextColor={COLORS.gray}
                            value={verificationCode}
                            onChangeText={setVerificationCode}
                            keyboardType="number-pad"
                            maxLength={6}
                        />


                        {errors.verificationCode && (
                            <Text style={styles.verificationErrorText}>{errors.verificationCode}</Text>
                        )}

                        <View style={styles.verificationButtonRow}>
                            <TouchableOpacity
                                style={[styles.verificationButton, styles.verifyButton]}
                                onPress={handleVerifyEmail}
                                disabled={isLoading}
                            >
                                <Text style={styles.verificationButtonText}>
                                    {isLoading ? 'Verifying...' : 'Verify'}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.verificationButton,
                                    styles.resendButton,
                                    resendDisabled && styles.disabledButton
                                ]}
                                onPress={handleResendCode}
                                disabled={resendDisabled || isLoading}
                            >
                                <Text style={styles.verificationButtonText}>
                                    {resendDisabled
                                        ? `Resend (${resendCountdown}s)`
                                        : 'Resend Code'}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            style={[styles.verificationButton, styles.cancelVerificationButton]}
                            onPress={() => setShowVerificationModal(false)}
                        >
                            <Text style={[styles.verificationButtonText, { color: COLORS.gray }]}>
                                Cancel
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
};
export default LoginScreen;
