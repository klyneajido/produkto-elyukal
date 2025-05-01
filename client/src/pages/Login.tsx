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
    const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
    const [containerSize, setContainerSize] = useState({ width: width, height: 200 });
    const [floatingElements, setFloatingElements] = useState<FloatingElement[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loginTimeout, setLoginTimeout] = useState<NodeJS.Timeout | null>(null);

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
        try {
            setIsLoading(true);
            setErrors({});

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
            let errorMessage = 'Something went wrong. Please try again.';

            if (error.response) {
                if (error.response.status === 401) {
                    errorMessage = 'Invalid email or password';
                } else if (error.response.status === 400) {
                    errorMessage = 'Invalid login details provided';
                } else if (error.response.status >= 500) {
                    errorMessage = 'Server error. Please try again later';
                }
            } else if (error.request) {
                errorMessage = 'Network error. Please check your internet connection';
            }

            setErrors(prev => ({
                ...prev,
                general: errorMessage
            }));
            return null;
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
        } finally {
            setIsLoading(false);
            if (loginTimeout) {
                clearTimeout(loginTimeout);
            }
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
        </ScrollView>
    );
};
export default LoginScreen;
