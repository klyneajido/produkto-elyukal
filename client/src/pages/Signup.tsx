import React, { useState } from 'react';
import { View, Text, ImageBackground, TouchableOpacity, SafeAreaView, Image, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { useNavigation, ParamListBase } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import auth from '@react-native-firebase/auth';
import axios from 'axios';
import styles from '../assets/style/signupStyle';
import { COLORS } from '../assets/constants/constant'
import InputText from "../components/TextInput";
import { faArrowAltCircleLeft, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';

const SignupScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(false);

    const handleSignup = async () => {
        if (password !== confirmPassword) {
            Alert.alert("Passwords do not match!");
            return;
        }

        setIsLoading(true); // Set loading state to true during signup

        try {
            // Create user in Firebase Authentication
            const userCredential = await auth().createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;

            // Get Firebase ID token
            const idToken = await user.getIdToken();

            // Send token + user data to FastAPI
            const response = await axios.post('http://192.168.1.24:8000/register', {
                first_name: firstName,
                last_name: lastName,
                email: email,
                firebase_uid: user.uid,
            }, {
                headers: {
                    'Authorization': `Bearer ${idToken}`, // Attach Firebase token
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 200) {
                Alert.alert('Success', 'Registration successful!');
                navigation.navigate('Login'); // Redirect to login screen
            } else {
                throw new Error(response.data?.detail || 'Unexpected error during registration.');
            }

        } catch (error: any) {
            console.error('Signup Error:', error);

            // Improved error handling with specific messages based on error type
            if (error.code === 'auth/email-already-in-use') {
                Alert.alert('Error', 'This email address is already in use.');
            } else if (error.response) {
                // Handle errors from the FastAPI backend
                const errorMessage = error.response?.data?.detail || 'Error during registration';
                Alert.alert('Error', errorMessage);
            } else if (error.request) {
                // Network or connection issues
                Alert.alert('Error', 'Network Error. Please check your internet connection.');
            } else {
                // Unexpected errors
                Alert.alert('Error', `Unexpected error: ${error.message}`);
            }
        } finally {
            setIsLoading(false); // Set loading state to false after the process completes
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
                <ScrollView contentContainerStyle={styles.scrollContainer}>
                    <View style={styles.logoContainer}>
                        <ImageBackground
                        source={require('../assets/img/signup_logo.png')}
                        resizeMode='cover'
                        style={styles.bgImg}>
                        <TouchableOpacity
                        onPress={() => navigation.navigate('Login')}>
                        <FontAwesomeIcon
                        icon={faArrowLeft}
                        color={COLORS.white}
                        size={25}/>
                        </TouchableOpacity>
                        <Text style={styles.text}>Sign up</Text>
                        <Text style={styles.subText}>
                        & discover the hidden gems of La union!
                        </Text>
                        </ImageBackground>

                    </View>

                    <View style={styles.formContainer}>

                        <InputText
                            labelName="First Name"
                            placeholder="Enter first name..."
                            placeholderTextColor={COLORS.gray}
                            value={firstName}
                            onChangeText={setFirstName}
                            error={error && !firstName}
                            errorText="First Name is required"
                        />
                        <InputText
                            labelName="Last Name"
                            placeholder="Enter last name..."
                            placeholderTextColor={COLORS.gray}
                            value={lastName}
                            onChangeText={setLastName}
                            error={error && !lastName}
                            errorText="Last Name is required"
                        />
                        <InputText
                            labelName="Email"
                            placeholder="Enter email..."
                            placeholderTextColor={COLORS.gray}
                            value={email}
                            onChangeText={setEmail}
                            error={error && !email}
                            errorText="Email is required"
                        />
                        <InputText
                            labelName="Password"
                            placeholder="Password"
                            placeholderTextColor={COLORS.gray}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            error={error && !password}
                            errorText="Password is required"
                        />

                        <InputText
                            labelName="Re-enter Password"
                            placeholder="Re-enter password"
                            placeholderTextColor={COLORS.gray}
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry
                            error={error && !password}
                            errorText="Password is required"
                        />

                        <TouchableOpacity
                            style={styles.signupButton}
                            onPress={handleSignup}
                            disabled={isLoading} // Disable button while loading
                        >
                            <Text style={styles.signupButtonText}>{isLoading ? 'Signing Up...' : 'Sign Up'}</Text>
                        </TouchableOpacity>

                        <View style={styles.loginContainer}>
                            <Text style={styles.loginText}>Already have an account? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                                <Text style={styles.loginLinkText}>Login</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default SignupScreen;
