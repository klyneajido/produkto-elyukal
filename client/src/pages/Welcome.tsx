import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    Animated,
    StyleSheet,
    Dimensions,
    ActivityIndicator,
    Image,
    TouchableOpacity,
    Easing
} from 'react-native';
import { ParamListBase, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';
import { FONT_SIZE, FONTS, COLORS } from '../assets/constants/constant';
import Footer from '../components/Footer';

const { width, height } = Dimensions.get('window');

const Welcome = () => {
    const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();

    // Animations
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.95)).current;
    const floatAnim = useRef(new Animated.Value(0)).current;
    const titleFadeAnim = useRef(new Animated.Value(0)).current;
    const subtitleFadeAnim = useRef(new Animated.Value(0)).current;
    const [showButtons, setShowButtons] = useState(false);
    const buttonsOpacity = useRef(new Animated.Value(0)).current;
    const buttonsTranslateY = useRef(new Animated.Value(50)).current;
    const contentPositionY = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Logo and text animation sequence
        Animated.sequence([
            // First fade in and scale the logo
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    friction: 8,
                    tension: 40,
                    useNativeDriver: true,
                }),
            ]),
            // Then fade in the title and subtitle together
            Animated.parallel([
                Animated.timing(titleFadeAnim, {
                    toValue: 1,
                    duration: 600,
                    useNativeDriver: true,
                }),
                Animated.timing(subtitleFadeAnim, {
                    toValue: 1,
                    duration: 600,
                    useNativeDriver: true,
                }),
            ]),
            // Move content upward before showing buttons
            Animated.timing(contentPositionY, {
                toValue: -50, // Move up by 50 units
                duration: 500,
                useNativeDriver: true,
            }),
        ]).start(() => {
            // Show buttons after all main animations complete
            setTimeout(() => {
                setShowButtons(true);
                Animated.parallel([
                    Animated.timing(buttonsOpacity, {
                        toValue: 1,
                        duration: 500,
                        useNativeDriver: true,
                    }),
                    Animated.spring(buttonsTranslateY, {
                        toValue: 0,
                        friction: 8,
                        tension: 40,
                        useNativeDriver: true,
                    }),
                ]).start();
            }, 100); // Minimal delay after moving up
        });

        // Floating animation for logo
        Animated.loop(
            Animated.sequence([
                Animated.timing(floatAnim, {
                    toValue: -10,
                    duration: 1200,
                    useNativeDriver: true,
                }),
                Animated.timing(floatAnim, {
                    toValue: 0,
                    duration: 1200,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, [fadeAnim, scaleAnim, floatAnim, titleFadeAnim, subtitleFadeAnim, contentPositionY, buttonsOpacity, buttonsTranslateY]);

    const handleLogin = () => {
        navigation.navigate('Login');
    };

    const handleSignup = () => {
        navigation.navigate('Signup');
    };

    return (
        <LinearGradient
            colors={['#6B48FF', '#8E2DE2']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.container}
        >
            <Animated.View
                style={[
                    styles.contentContainer,
                    {
                        opacity: fadeAnim,
                        transform: [
                            { scale: scaleAnim },
                            { translateY: contentPositionY }
                        ],
                    },
                ]}
            >
                <Animated.View
                    style={[
                        styles.logoContainer,
                        {
                            transform: [{ translateY: floatAnim }]
                        }
                    ]}
                >
                    <Image
                        source={require('../assets/img/logo_plain.png')}
                        style={styles.logo}
                    />
                </Animated.View>

                <Animated.Text style={[styles.appTitle, { opacity: titleFadeAnim }]}>
                    Produkto Elyukal
                </Animated.Text>
                <Animated.Text style={[styles.subtitle, { opacity: subtitleFadeAnim }]}>
                    Explore, Discover, Experience
                </Animated.Text>
            </Animated.View>
            {showButtons && (
                <Animated.View 
                    style={[
                        styles.buttonsContainer,
                        {
                            opacity: buttonsOpacity,
                            transform: [{ translateY: buttonsTranslateY }],
                        }
                    ]}
                >
                    <TouchableOpacity
                        style={styles.loginButton}
                        onPress={handleLogin}
                    >
                        <Text style={styles.loginButtonText}>
                            Login
                        </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                        style={styles.signupButton}
                        onPress={handleSignup}
                    >
                        <Text style={styles.signupButtonText}>
                            Sign Up
                        </Text>
                    </TouchableOpacity>
                </Animated.View>
            )}

            <View style={styles.footerContainer}>
                <Footer lightMode={true} />
            </View>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    contentContainer: {
        alignItems: 'center',
        padding: 20,
        position: 'absolute',
        top: '30%', // Position it at 30% from the top
    },
    logoContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 30,
    },
    logo: {
        width: 80,
        height: 80,
        borderRadius: 35,
    },
    appTitle: {
        fontFamily: 'Eurostile', 
        fontSize: FONT_SIZE.xxxLarge,
        color: '#FFFFFF',
        letterSpacing: 1,
        marginBottom: 8,
    },
    subtitle: {
        fontFamily: FONTS.light,
        fontSize: FONT_SIZE.medium+1,
        color: 'rgba(255, 255, 255, 0.8)',
        letterSpacing: 0.5,
    },
    buttonsContainer: {
        position: 'absolute',
        bottom: '25%', // Position it at 25% from the bottom
        width: '100%',
        alignItems: 'center',
    },
    loginButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 10,
        marginBottom: 15,
        width: '80%',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    loginButtonText: {
        color: COLORS.white,
        fontSize: 18,
        fontFamily: FONTS.bold,
    },
    signupButton: {
        backgroundColor: 'transparent',
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: COLORS.secondary,
        width: '80%',
        alignItems: 'center',
    },
    signupButtonText: {
        color: COLORS.secondary,
        fontSize: 18,
        fontFamily: FONTS.bold,
    },
    footerContainer: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
    },
});

export default Welcome;
