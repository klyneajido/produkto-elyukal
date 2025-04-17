import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Dimensions,
} from 'react-native';
import { useNavigation, ParamListBase } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import styles from '../assets/style/loginStyle';
import { COLORS } from '../assets/constants/constant';
import InputText from '../components/TextInput';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowLeft, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import LinearGradient from 'react-native-linear-gradient';
import Footer from '../components/Footer';
import FloatingARElement from '../components/Floatingelements';
import SpinningCubeLoader from '../components/SpinningCubeLoader';

const { width } = Dimensions.get('window');

type FloatingElement = {
    type: string;
    initialPosition: {
        x: number;
        y: number;
    };
};

const ForgotPassword: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [floatingElements, setFloatingElements] = useState<FloatingElement[]>([]);
    const [containerSize, setContainerSize] = useState({ width: width, height: 200 });

    useEffect(() => {
        if (containerSize.width > 0 && containerSize.height > 0) {
            const newElements = [
                {
                    type: 'circle',
                    initialPosition: {
                        x: Math.random() * (containerSize.width - 50),
                        y: Math.random() * (containerSize.height - 50),
                    },
                },
                {
                    type: 'square',
                    initialPosition: {
                        x: Math.random() * (containerSize.width - 50),
                        y: Math.random() * (containerSize.height - 50),
                    },
                },
                {
                    type: 'triangle',
                    initialPosition: {
                        x: Math.random() * (containerSize.width - 50),
                        y: Math.random() * (containerSize.height - 50),
                    },
                },
            ];
            setFloatingElements(newElements);
        }
    }, [containerSize]);

    const validateEmail = (email: string) => {
        const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return regex.test(email);
    };

    const handleResetPassword = () => {
        const trimmedEmail = email.trim().toLowerCase();

        if (!trimmedEmail || !validateEmail(trimmedEmail)) {
            setError('Please enter a valid email address.');
            return;
        }

        setIsLoading(true);
        setError('');

        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            navigation.navigate('Login');
            // You might want to show a success message here
        }, 2000);
    };

    const onGradientLayout = (event: any) => {
        const { width, height } = event.nativeEvent.layout;
        setContainerSize({ width, height });
    };

    const renderError = () => {
        if (!error) return null;

        return (
            <View style={styles.modernErrorContainer}>
                <View style={styles.modernErrorContent}>
                    <FontAwesomeIcon 
                        icon={faExclamationTriangle} 
                        size={20} 
                        color="#fff" 
                        style={styles.errorIcon}
                    />
                    <Text style={styles.modernErrorText}>{error}</Text>
                </View>
            </View>
        );
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

                <View style={styles.logoContainer}>
                    <LinearGradient
                        colors={['#6B48FF', '#8E2DE2']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={[styles.gradientContainer, { position: 'relative' }]}
                        onLayout={onGradientLayout}
                    >
                        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                            <FontAwesomeIcon
                                icon={faArrowLeft}
                                color={COLORS.white}
                                size={25}
                            />
                        </TouchableOpacity>
                        {floatingElements.map((element, index) => (
                            <FloatingARElement 
                                key={index} 
                                type={element.type} 
                                initialPosition={element.initialPosition}
                                containerSize={containerSize}
                            />
                        ))}
                        <Text style={styles.text}>Forgot Password</Text>
                        <Text style={styles.subText}>Enter your email to reset your password</Text>
                    </LinearGradient>
                </View>

                <View style={styles.formContainer}>
                    <View style={[styles.inputContainer, { marginBottom: 20 }]}>
                        <InputText
                            labelName="Email"
                            placeholder="Enter your email"
                            placeholderTextColor={COLORS.gray}
                            value={email}
                            onChangeText={(text) => {
                                setEmail(text);
                                setError('');
                            }}
                            error={!!error}
                            errorText={error}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    <TouchableOpacity 
                        style={[
                            styles.loginButton,
                            isLoading && styles.loginButtonDisabled
                        ]} 
                        onPress={handleResetPassword}
                        disabled={isLoading}
                    >
                        <Text style={styles.loginButtonText}>
                            {isLoading ? 'Sending...' : 'Reset Password'}
                        </Text>
                    </TouchableOpacity>

                    <View style={styles.loginContainer}>
                        <Text style={styles.loginText}>Remember your password? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                            <Text style={styles.signupLinkText}>Login</Text>
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

export default ForgotPassword;
