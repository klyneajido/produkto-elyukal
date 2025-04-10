import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    ScrollView,
    Animated,
    Easing,
    Dimensions,
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
    const [email, setEmail] = useState('1@gmail.com');
    const [password, setPassword] = useState('123456');
    const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
    const [containerSize, setContainerSize] = useState({ width: width, height: 200 });
    const [floatingElements, setFloatingElements] = useState<FloatingElement[]>([])

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

    const errorMessage = errors.general || errors.email || errors.password;

    const onGradientLayout = (event) => {
        const { width, height } = event.nativeEvent.layout;
        console.log('Gradient Container Size:', { width, height });
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

    return (
        <ScrollView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                <View style={styles.logoContainer}>
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
                        <Text style={styles.text}>Welcome back.</Text>
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
                    <View style={styles.footerContainer}>
                        <Footer/>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </ScrollView>
    );
};
export default LoginScreen;