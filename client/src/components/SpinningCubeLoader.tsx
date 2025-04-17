import React, { useEffect } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { COLORS } from '../assets/constants/constant';

interface SpinningCubeLoaderProps {
    size?: number;
    color?: string;
}

const SpinningCubeLoader: React.FC<SpinningCubeLoaderProps> = ({ 
    size = 40,
    color = COLORS.primary 
}) => {
    const spinValue = new Animated.Value(0);

    useEffect(() => {
        const startAnimation = () => {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(spinValue, {
                        toValue: 1,
                        duration: 1200,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        };

        startAnimation();
    }, []);

    const spin = spinValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg']
    });

    const secondSpin = spinValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['360deg', '0deg']
    });

    return (
        <View style={styles.container}>
            <Animated.View
                style={[
                    styles.cube,
                    {
                        width: size,
                        height: size,
                        transform: [
                            { rotate: spin },
                            { rotateX: secondSpin },
                            { rotateY: spin }
                        ],
                        backgroundColor: color,
                    }
                ]}
            />
            <Animated.View
                style={[
                    styles.shadow,
                    {
                        width: size,
                        height: size / 4,
                        transform: [{ scaleX: spinValue.interpolate({
                            inputRange: [0, 0.5, 1],
                            outputRange: [1, 0.5, 1]
                        }) }]
                    }
                ]}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 100,
    },
    cube: {
        backgroundColor: COLORS.primary,
        borderRadius: 6,
    },
    shadow: {
        marginTop: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        borderRadius: 100,
    }
});

export default SpinningCubeLoader;