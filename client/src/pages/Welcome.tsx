import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    Animated,
    StyleSheet,
    Dimensions,
    ActivityIndicator,
    Image
} from 'react-native';
import { ParamListBase, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';
import { FONT_SIZE, FONTS } from '../assets/constants/constant';

const { width, height } = Dimensions.get('window');

const Welcome = () => {
    const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();

    // Simplified animations
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.95)).current;

    useEffect(() => {
        // Animation sequence
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 8,
                useNativeDriver: true,
            }),
        ]).start();

        // Navigate to Login screen after delay
        const navigationTimeout = setTimeout(() => {
            navigation.replace('Login');
        }, 2000);

        // Cleanup timeout on unmount
        return () => clearTimeout(navigationTimeout);
    }, [fadeAnim, scaleAnim, navigation]);

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
                        transform: [{ scale: scaleAnim }],
                    },
                ]}
            >
                {/* Circular logo container */}
                <View style={styles.logoContainer}>
                    <Image
                        source={require('../assets/img/logo_plain.png')}
                        style={styles.logo}
                    />
                </View>

                <Text style={styles.appTitle}>Produkto Elyukal</Text>
                <Text style={styles.subtitle}>Explore, Discover, Experience</Text>

                <View style={styles.loaderContainer}>
                    <ActivityIndicator
                        size="large"
                        color="#FFFFFF"
                    />
                </View>
            </Animated.View>
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
    },
    logoContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 30,
    },
    logo: {
        width: 70,
        height: 70,
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
        fontSize: FONT_SIZE.large,
        color: 'rgba(255, 255, 255, 0.9)',
        letterSpacing: 0.5,
    },
    loaderContainer: {
        marginTop: 40,
    },
});

export default Welcome;