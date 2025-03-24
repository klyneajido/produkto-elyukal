import React, { useState } from 'react';
import {
    View,
    Text,
    ImageBackground,
    TouchableOpacity,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
    Alert,
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

const LoginScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
    const { setUser, loginAsGuest } = useAuth();
    const [email, setEmail] = useState('1@gmail.com'); // Hardcoded for testing
    const [password, setPassword] = useState('123456'); // Hardcoded for testing
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Validation function
    const validateForm = (): boolean => {
        const newErrors: { email?: string; password?: string } = {};

        // Validate email
        if (!email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!emailRegex.test(email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        // Validate password
        if (!password.trim()) {
            newErrors.password = 'Password is required';
        } else if (password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters long';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0; // Return true if no errors
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
            console.error("Login failed:", error.response?.data?.detail || error.message);
            Alert.alert("Login Failed", error.response?.data?.detail || "Invalid credentials");
            return null;
        }
    };

    const getUserProfile = async () => {
        try {
            const token = await AsyncStorage.getItem("token");
            if (!token) {
                console.error('No token found in AsyncStorage!');
                throw new Error('No token found');
            }
            console.log('Fetching user profile with token:', token);
            const response = await axios.get(`${BASE_URL}/auth/profile`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log("User Profile:", response.data);
            return response.data;
        } catch (error: any) {
            console.error("Failed to fetch profile:", error.response?.data?.detail || error.message);
            return null;
        }
    };

    const handleLogin = async () => {
        if (!validateForm()) {
            return; // Stop if validation fails
        }

        const token = await loginUser(email, password);
        if (token) {
            const profile = await getUserProfile();
            if (profile) {
                console.log('Updating user context with profile:', profile);
                setUser(profile);
                navigation.navigate("Tabs");
            }
        }
    };

    const handleGuest = async () => {
        loginAsGuest();
        navigation.navigate("Tabs");
        console.log("Logged in as guest");
    };

    const handleSignup = () => {
        navigation.navigate('Signup');
    };

    const handleForgotPassword = () => {
        navigation.navigate('ForgotPassword');
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                <View style={styles.logoContainer}>
                    <ImageBackground
                        source={require('../assets/img/signup_logo.png')}
                        resizeMode='cover'
                        style={styles.bgImg}>
                        <Text style={styles.text}>KISSABAM!</Text>
                        <Text style={styles.subText}>Sign In & Pick Up Where You Left Off!</Text>
                    </ImageBackground>
                </View>

                <View style={styles.formContainer}>
                    <View style={styles.inputContainer}>
                        <InputText
                            labelName="Email"
                            placeholder="example@gmail.com"
                            placeholderTextColor={COLORS.lightgray}
                            value={email}
                            onChangeText={(text) => {
                                setEmail(text);
                                setErrors((prev) => ({ ...prev, email: undefined })); // Clear error on change
                            }}
                            error={!!errors.email}
                            errorText={errors.email}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <InputText
                            labelName="Password"
                            placeholder="Your password"
                            placeholderTextColor={COLORS.lightgray}
                            value={password}
                            onChangeText={(text) => {
                                setPassword(text);
                                setErrors((prev) => ({ ...prev, password: undefined })); // Clear error on change
                            }}
                            error={!!errors.password}
                            errorText={errors.password}
                            secureTextEntry={true}
                        />
                    </View>

                    <TouchableOpacity style={styles.forgotPasswordContainer} onPress={handleForgotPassword}>
                        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                        <Text style={styles.loginButtonText}>Login</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.continueGuestButton} onPress={handleGuest}>
                        <Text style={styles.continueGuestButtonText}>Continue as Guest</Text>
                    </TouchableOpacity>

                    <View style={styles.loginContainer}>
                        <Text style={styles.loginText}>Don't have an account? </Text>
                        <TouchableOpacity onPress={handleSignup}>
                            <Text style={styles.signupLinkText}>Sign Up</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default LoginScreen;