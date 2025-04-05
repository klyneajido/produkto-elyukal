import React, { useState } from 'react';
import {
    View,
    Text,
    ImageBackground,
    TouchableOpacity,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
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
    const [email, setEmail] = useState('1@gmail.com');
    const [password, setPassword] = useState('123456');
    const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});

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

    // Get the first error message to display in the banner
    const errorMessage = errors.general || errors.email || errors.password;

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
                        <Text style={styles.text}>Welcome back.</Text>
                        <Text style={styles.subText}>Sign In & Pick Up Where You Left Off!</Text>
                    </ImageBackground>
                </View>

                <View style={styles.formContainer}>
                    {errorMessage && (
                        <View style={styles.errorBanner}>
                            <Text style={styles.errorText}>{errorMessage}</Text>
                        </View>
                    )}

                    <View style={[styles.inputContainer, { marginBottom: 20 }]}>
                        <InputText
                            labelName="Email"
                            placeholder="example@gmail.com"
                            placeholderTextColor={COLORS.lightgray}
                            value={email}
                            onChangeText={(text) => {
                                setEmail(text);
                                setErrors((prev) => ({ ...prev, email: undefined }));
                            }}
                            error={!!errors.email}
                            errorText={""} // Don't show error text here
                            extraStyle={{ marginBottom: 0 }}
                        />
                    </View>

                    <View style={[styles.inputContainer, { marginBottom: 20 }]}>
                        <InputText
                            labelName="Password"
                            placeholder="Your password"
                            placeholderTextColor={COLORS.lightgray}
                            value={password}
                            onChangeText={(text) => {
                                setPassword(text);
                                setErrors((prev) => ({ ...prev, password: undefined }));
                            }}
                            error={!!errors.password}
                            errorText={""} // Don't show error text here
                            secureTextEntry={true}
                            extraStyle={{ marginBottom: 0 }}
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