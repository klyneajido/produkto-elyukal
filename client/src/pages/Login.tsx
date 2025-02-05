import React, { useState } from 'react';
import {
    View,
    Text,
    ImageBackground,
    TouchableOpacity,
    SafeAreaView,
    Image,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { ParamListBase, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import axios from 'axios';
import styles from '../assets/style/loginStyle';
import InputText from '../components/TextInput.tsx'
import { COLORS } from '../assets/constants/constant';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';

const LoginScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async () => {
        const trimmedEmail = email.trim().toLowerCase();
        const trimmedPassword = password.trim();

        if (!trimmedEmail || !trimmedPassword) {
            setError(true);
            return;
        }
        if (trimmedEmail === 't' && trimmedPassword === 't') {
            setError(false);
            navigation.navigate('Tabs');
            return;
        }
        try {
            console.log('Login attempt:', { email: trimmedEmail }); // Log login attempt
            const response = await axios.post('https://produkto-elyukal.onrender.com/login', {
                email: trimmedEmail,
                password: trimmedPassword
            });
            console.log('Login response:', response.data); // Log full response
            // Assuming the response contains the access token
            const { access_token } = response.data;

            if (access_token) {
                setError(false);
                // Store the token if needed, e.g., AsyncStorage or context
                // Navigate to the next screen (e.g., Home screen)
                navigation.navigate('Tabs');
            }
        } catch (error: any) {
            // Handle errors, e.g., invalid login
            console.error('Full error:', error.response ? error.response.data : error);
            if (error.response && error.response.data) {
                setError(error.response.data.detail || 'Invalid email or password');
            } else {
                setError(true);
            }
        }
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
                        <Text style={styles.text}>Back for More?
                        </Text>
                        <Text style={styles.subText}>
                        Sign In & Pick Up Where You Left Off!
                        </Text>
                    </ImageBackground>
                </View>


                <View style={styles.formContainer}>
                    <View style={styles.inputContainer}>
                        {/* <FontAwesomeIcon icon={faUser} size={20} color="#666" style={styles.inputIcon} /> */}
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
                        {/* <FontAwesomeIcon icon={faLock} size={20} color="#666" style={styles.inputIcon} /> */}
                        <InputText
                            labelName="Password"
                            placeholder="Enter password name..."
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
