// Login.tsx
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ImageBackground,
    TouchableOpacity,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
    Alert
} from 'react-native';
import { ParamListBase, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import axios from 'axios';
import styles from '../assets/style/loginStyle';
import InputText from '../components/TextInput.tsx';
import { COLORS } from '../assets/constants/constant';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from '../../contextAuth.tsx';

const LoginScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
    const { setUser, user } = useAuth();  // Get the user context
    const [email, setEmail] = useState('1@gmail.com'); //hardcoded
    const [password, setPassword] = useState('123456'); // hardcoded
    const [error, setError] = useState(false);

    // Function to log in the user
    const loginUser = async (email: string, password: string) => {
        try {
            console.log('Attempting to login with:', { email, password });
            const response = await axios.post('http://192.168.1.24:8000/auth/login', { email, password });

            const { access_token } = response.data;
            await AsyncStorage.setItem("token", access_token);
            
            // Debugging: Log the token that is saved
            console.log("Token saved in AsyncStorage:", access_token);

            return access_token;  // Return the access token for further use
        } catch (error: any) {
            console.error("Login failed:", error.response?.data?.detail || error.message);
            Alert.alert("Login Failed", error.response?.data?.detail || "Invalid credentials");
            return null;
        }
    };

    // Function to get the user's profile after login
    const getUserProfile = async () => {
        try {
            const token = await AsyncStorage.getItem("token");

            if (!token) {
                console.error('No token found in AsyncStorage!');
                throw new Error('No token found');
            }

            console.log('Fetching user profile with token:', token);

            const response = await axios.get("http://192.168.1.24:8000/auth/profile", {
                headers: { Authorization: `Bearer ${token}` },
            });

            console.log("User Profile:", response.data);
            return response.data;
        } catch (error: any) {
            console.error("Failed to fetch profile:", error.response?.data?.detail || error.message);
            return null;
        }
    };

    // Handle login flow
    const handleLogin = async () => {
        const token = await loginUser(email, password);
        if (token) {
            // Now fetch user profile and update context
            const profile = await getUserProfile();
            if (profile) {
                console.log('Updating user context with profile:', profile);
                setUser(profile);  // This updates the user context
                navigation.navigate("Tabs");  // Navigate to the next screen
            }
        }
    };

    const handleSignup = () => {
        navigation.navigate('Signup');
    };

    const handleForgotPassword = () => {
        navigation.navigate('ForgotPassword');
    };

    // useEffect(() => {
    //     const checkAuthStatus = async () => {
    //         const token = await AsyncStorage.getItem("token");
    //         if (token) {
    //           try {
    //             // Validate token via your backend
    //             const response = await axios.get("http://192.168.1.24:8000/auth/validate", {
    //               headers: { Authorization: `Bearer ${token}` },
    //             });
    //             if (response.data.valid) {
    //               const profile = await getUserProfile();
    //               setUser(profile);
    //               navigation.navigate("Tabs");
    //             }
    //           } catch (error) {
    //             await AsyncStorage.removeItem("token");
    //             navigation.navigate("Login");
    //           }
    //         } else {
    //           navigation.navigate("Login");
    //         }
    //       };
    //     if (!user) {
    //         checkAuthStatus();
    //     }
    // }, [setUser, navigation, user]);
    

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
                        <Text style={styles.text}>Back for More?</Text>
                        <Text style={styles.subText}>Sign In & Pick Up Where You Left Off!</Text>
                    </ImageBackground>
                </View>

                <View style={styles.formContainer}>
                    <View style={styles.inputContainer}>
                        <InputText
                            labelName="Email"
                            placeholder="Enter email..."
                            placeholderTextColor={COLORS.gray}
                            value={email}
                            onChangeText={setEmail}
                            error={error && !email}
                            errorText="Email is required"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <InputText
                            labelName="Password"
                            placeholder="Enter password..."
                            placeholderTextColor={COLORS.gray}
                            value={password}
                            onChangeText={setPassword}
                            error={error && !password}
                            errorText="Password is required"
                        />
                    </View>

                    <TouchableOpacity style={styles.forgotPasswordContainer} onPress={handleForgotPassword}>
                        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                        <Text style={styles.loginButtonText}>Login</Text>
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
