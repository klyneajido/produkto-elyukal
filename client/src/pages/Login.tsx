import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
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
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faUser, faLock, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

const LoginScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async () => {
        const trimmedEmail = email.trim().toLowerCase();
        const trimmedPassword = password.trim();

        if (!trimmedEmail || !trimmedPassword) {
            setError('Please enter both email and password.');
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
                setError('');
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
                setError('An error occurred. Please try again later.');
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
                    <Image source={require('../assets/img/logo.png')} style={styles.logo} />
                    <Text style={styles.appTitle}>Produkto Elyukal</Text>
                </View>

                {error ? (
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                ) : null}

                <View style={styles.formContainer}>
                    <View style={styles.inputContainer}>
                        <FontAwesomeIcon icon={faUser} size={20} color="#666" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Email Address"
                            placeholderTextColor="#666"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <FontAwesomeIcon icon={faLock} size={20} color="#666" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Password"
                            placeholderTextColor="#666"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                        />
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                            <FontAwesomeIcon icon={showPassword ? faEye  : faEyeSlash} size={20} color="#666" />
                        </TouchableOpacity>
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
