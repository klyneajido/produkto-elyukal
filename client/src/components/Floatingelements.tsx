import { StyleSheet, View, Animated, Easing, ViewStyle } from 'react-native';
import React, { useRef, useEffect } from 'react';
import Svg, { Path } from 'react-native-svg';

const FloatingARElement = ({ type, initialPosition, containerSize }: {
    type: string;
    initialPosition: { x: number; y: number };
    containerSize: { width: number; height: number };
}) => {
    const translateX = useRef(new Animated.Value(initialPosition.x)).current;
    const translateY = useRef(new Animated.Value(initialPosition.y)).current;
    const rotate = useRef(new Animated.Value(0)).current;
    const scale = useRef(new Animated.Value(0)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const animatePosition = () => {
            // Determine the starting side and calculate the opposite side
            let targetX, targetY;
            if (initialPosition.x < 0) targetX = containerSize.width * 0.6; // Left to right
            else if (initialPosition.x > 0) targetX = -containerSize.width * 0.6; // Right to left
            else targetX = (Math.random() - 0.5) * containerSize.width * 1.2; // Center, random x

            if (initialPosition.y < 0) targetY = containerSize.height * 0.6; // Top to bottom
            else if (initialPosition.y > 0) targetY = -containerSize.height * 0.6; // Bottom to top
            else targetY = (Math.random() - 0.5) * containerSize.height * 1.2; // Center, random y

            const baseDuration = 8000 + Math.random() * 4000; // 8-12 seconds

            // Entrance animation
            Animated.parallel([
                Animated.timing(scale, {
                    toValue: 1,
                    duration: 1500,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 0.9,
                    duration: 1500,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                }),
            ]).start(() => {
                // Move to opposite side
                Animated.parallel([
                    Animated.timing(translateX, {
                        toValue: targetX,
                        duration: baseDuration,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                    Animated.timing(translateY, {
                        toValue: targetY,
                        duration: baseDuration,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                    Animated.timing(rotate, {
                        toValue: Math.random() * 2,
                        duration: baseDuration,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                    Animated.sequence([
                        Animated.timing(scale, {
                            toValue: 1.2,
                            duration: baseDuration / 2,
                            easing: Easing.inOut(Easing.ease),
                            useNativeDriver: true,
                        }),
                        Animated.timing(scale, {
                            toValue: 0.3,
                            duration: baseDuration / 2,
                            easing: Easing.in(Easing.ease),
                            useNativeDriver: true,
                        }),
                    ]),
                    Animated.timing(opacity, {
                        toValue: 0,
                        duration: 2000,
                        delay: baseDuration - 2000,
                        easing: Easing.in(Easing.cubic),
                        useNativeDriver: true,
                    }),
                ]).start(() => {
                    // Reset to the original starting position
                    translateX.setValue(initialPosition.x);
                    translateY.setValue(initialPosition.y);
                    scale.setValue(0);
                    opacity.setValue(0);
                    animatePosition(); // Restart
                });
            });
        };
        animatePosition();
    }, [containerSize, initialPosition]); // Add initialPosition to dependencies

    const spin = rotate.interpolate({
        inputRange: [0, 1, 2],
        outputRange: ['0deg', '180deg', '360deg'],
    });

    const renderElement = () => {
        const commonStyle: Animated.WithAnimatedObject<ViewStyle> = {
            transform: [
                { translateX },
                { translateY },
                { rotate: spin },
                { scale },
            ],
            opacity,
            position: 'absolute',
        };

        let svgContent;
        switch (type) {
            case 'eye':
                svgContent = (
                    <Svg width="30" height="30" viewBox="0 0 24 24" fill="none">
                        <Path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M11.9944 15.5C13.9274 15.5 15.4944 13.933 15.4944 12C15.4944 10.067 13.9274 8.5 11.9944 8.5C10.0614 8.5 8.49439 10.067 8.49439 12C8.49439 13.933 10.0614 15.5 11.9944 15.5ZM11.9944 13.4944C11.1691 13.4944 10.5 12.8253 10.5 12C10.5 11.1747 11.1691 10.5056 11.9944 10.5056C12.8197 10.5056 13.4888 11.1747 13.4888 12C13.4888 12.8253 12.8197 13.4944 11.9944 13.4944Z"
                            fill="rgba(255, 255, 255, 0.3)" 
                        />
                        <Path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M12 5C7.18879 5 3.9167 7.60905 2.1893 9.47978C0.857392 10.9222 0.857393 13.0778 2.1893 14.5202C3.9167 16.391 7.18879 19 12 19C16.8112 19 20.0833 16.391 21.8107 14.5202C23.1426 13.0778 23.1426 10.9222 21.8107 9.47978C20.0833 7.60905 16.8112 5 12 5ZM3.65868 10.8366C5.18832 9.18002 7.9669 7 12 7C16.0331 7 18.8117 9.18002 20.3413 10.8366C20.9657 11.5128 20.9657 12.4872 20.3413 13.1634C18.8117 14.82 16.0331 17 12 17C7.9669 17 5.18832 14.82 3.65868 13.1634C3.03426 12.4872 3.03426 11.5128 3.65868 10.8366Z"
                            fill="rgba(255, 255, 255, 0.3)"
                        />
                    </Svg>
                );
                break;
            case 'wave':
                svgContent = (
                    <Svg width="44" height="44" viewBox="0 0 400 400" fill="none">
                        <Path
                            d="M54.1283 283.001C52.8319 269.74 61.6674 256.236 66.8345 244.212C101.013 164.722 175.226 108.737 272.532 113.255C369.839 117.773 347.821 179.071 332.874 185.404C316.115 192.505 311.264 167.423 297.932 172.739C288.462 176.515 297.063 191.448 275.696 194.111C267.743 195.105 262.071 180.79 253.46 179.071C246.965 177.779 243.466 190.944 235.196 190.944C228.342 190.944 226.77 180.144 220.104 177.491C214.951 175.433 210.584 191.737 202.636 193.323C192.462 195.348 185.132 161.883 163.038 191.242"
                            stroke="rgba(255, 255, 255, 0.3)"
                            strokeWidth="1"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        <Path
                            d="M248.772 191.721C201.419 236.2 219.137 281.053 309.587 287.981"
                            stroke="rgba(255, 255, 255, 0.3)"
                            strokeWidth="1"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </Svg>
                );
                break;
            case 'box':
                svgContent = (
                    <Svg width="30" height="30" viewBox="0 0 24 24" fill="none">
                       
                        <Path
                            d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
                            stroke="rgba(255, 255, 255, 0.3)"
                            strokeWidth="2"
                            strokeLinecap="round"
                        />
                        <Path
                            d="M12 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"
                            stroke="rgba(255, 255, 255, 0.3)"
                            strokeWidth="2"
                            strokeLinecap="round"
                        />
                    </Svg>
                );
                break;
            case 'hologram':
                svgContent = (
                    <Svg width="50" height="50" viewBox="0 0 24 24" fill="none">
                    <Path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M11.7899 6.0463C11.9232 5.98457 12.0768 5.98457 12.2101 6.0463L17.2101 8.36209C17.3869 8.44395 17.5 8.62101 17.5 8.81579V14.6053C17.5 14.7837 17.4049 14.9486 17.2505 15.038L12.2505 17.9327C12.0956 18.0224 11.9044 18.0224 11.7495 17.9327L6.74948 15.038C6.59507 14.9486 6.5 14.7837 6.5 14.6053V8.81579C6.5 8.62101 6.61312 8.44395 6.78987 8.36209L11.7899 6.0463ZM7.5 9.62608L11.5 11.6331V16.6328L7.5 14.317V9.62608ZM12.5 16.6328L16.5 14.317V9.62608L12.5 11.6331V16.6328ZM12 10.7652L15.8492 8.83381L12 7.05103L8.15082 8.83381L12 10.7652Z"
                        fill="rgba(255, 255, 255, 0.3)"
                    />
                    <Path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M2.5 3C2.5 2.72386 2.72386 2.5 3 2.5H6C6.27614 2.5 6.5 2.72386 6.5 3C6.5 3.27614 6.27614 3.5 6 3.5H3.5V6C3.5 6.27614 3.27614 6.5 3 6.5C2.72386 6.5 2.5 6.27614 2.5 6V3Z"
                        fill="rgba(255, 255, 255, 0.3)"
                    />
                    <Path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M21 2.5C21.2761 2.5 21.5 2.72386 21.5 3V6C21.5 6.27614 21.2761 6.5 21 6.5C20.7239 6.5 20.5 6.27614 20.5 6V3.5L18 3.5C17.7239 3.5 17.5 3.27614 17.5 3C17.5 2.72386 17.7239 2.5 18 2.5L21 2.5Z"
                        fill="rgba(255, 255, 255, 0.3)"
                    />
                    <Path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M3 21.5C2.72386 21.5 2.5 21.2761 2.5 21L2.5 18C2.5 17.7239 2.72386 17.5 3 17.5C3.27614 17.5 3.5 17.7239 3.5 18L3.5 20.5H6C6.27614 20.5 6.5 20.7239 6.5 21C6.5 21.2761 6.27614 21.5 6 21.5H3Z"
                        fill="rgba(255, 255, 255, 0.3)"
                    />
                    <Path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M21.5 21C21.5 21.2761 21.2761 21.5 21 21.5H18C17.7239 21.5 17.5 21.2761 17.5 21C17.5 20.7239 17.7239 20.5 18 20.5H20.5V18C20.5 17.7239 20.7239 17.5 21 17.5C21.2761 17.5 21.5 17.7239 21.5 18V21Z"
                        fill="rgba(255, 255, 255, 0.3)"
                    />
                </Svg>
                );
                break;
            case 'palm':
                svgContent = (
                    <Svg width="50" height="50" viewBox="0 0 294.104 294.104" fill="none">
                    <Path
                        d="M15.532,86.092c-10.438,10.1-4.993,16.839,8.964,12.847c33.113-9.469,90.229-22.697,116.227-10.264 c0,0-76.033,60.254-64.573,179.413c1.387,14.457,12.227,26.015,22.665,26.015c10.443,0,17.383-11.71,17.351-26.238 c-0.065-32.836,5.493-94.025,38.802-169.329c0,0,24.775,32.558,32.221,68.086c2.981,14.212,8.523,16.203,12.385,2.197 c4.226-15.382,5.564-36.578-6.804-58.791c0,0,47.304,25.645,78.116,58.698c9.905,10.622,15.795,8.833,11.933-5.167 c-8.121-29.393-32.069-75.016-102.657-88.591c0,0,27.179-13.244,60.14-11.933c14.511,0.571,19.282-6.233,6.358-12.863 c-15.724-8.077-42.582-13.489-86.22-0.941c0,0-21.027-51.269-88.961-49.169c-14.511,0.451-15.142,7.571-2.094,13.929 c22.534,10.981,53.673,28.68,59.83,45.101C129.224,59.093,59.207,43.82,15.532,86.092z"
                        fill="rgba(255, 255, 255, 0.3)"
                    />
                </Svg>
                );
                break;
            case 'star':
                svgContent = (
                    <Svg width="50" height="50" viewBox="0 0 24 24" fill="none">
                       
                        <Path
                            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                            stroke="rgba(255, 255, 255, 0.3)"
                            strokeWidth="2"
                            strokeLinecap="round"
                        />
                    </Svg>
                );
                break;
            case 'map-pin':
                svgContent = (
                    <Svg width="50" height="50" viewBox="0 0 24 24" fill="none">
                        <Path
                            d="M17.5777 4.43152L15.5777 3.38197C13.8221 2.46066 12.9443 2 12 2C11.0557 2 10.1779 2.46066 8.42229 3.38197L8.10057 3.5508L17.0236 8.64967L21.0403 6.64132C20.3941 5.90949 19.3515 5.36234 17.5777 4.43152Z"
                            fill="rgba(255, 255, 255, 0.8)" 
                        />
                        <Path
                            d="M21.7484 7.96434L17.75 9.96353V13C17.75 13.4142 17.4142 13.75 17 13.75C16.5858 13.75 16.25 13.4142 16.25 13V10.7135L12.75 12.4635V21.904C13.4679 21.7252 14.2848 21.2965 15.5777 20.618L17.5777 19.5685C19.7294 18.4393 20.8052 17.8748 21.4026 16.8603C22 15.8458 22 14.5833 22 12.0585V11.9415C22 10.0489 22 8.86557 21.7484 7.96434Z"
                            fill="rgba(255, 255, 255, 0.8)"
                        />
                        <Path
                            d="M11.25 21.904V12.4635L2.25164 7.96434C2 8.86557 2 10.0489 2 11.9415V12.0585C2 14.5833 2 15.8458 2.5974 16.8603C3.19479 17.8748 4.27062 18.4393 6.42228 19.5685L8.42229 20.618C9.71524 21.2965 10.5321 21.7252 11.25 21.904Z"
                            fill="rgba(255, 255, 255, 0.8)"
                        />
                        <Path
                            d="M2.95969 6.64132L12 11.1615L15.4112 9.4559L6.52456 4.37785L6.42229 4.43152C4.64855 5.36234 3.6059 5.90949 2.95969 6.64132Z"
                            fill="rgba(255, 255, 255, 0.8)"
                        />
                    </Svg>
                )
                break;
            default:
                svgContent = (
                    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <Path
                            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                            stroke="rgba(255, 255, 255, 0.8)"
                            strokeWidth="2"
                            strokeLinecap="round"
                        />
                    </Svg>
                );
        }

        return (
            <Animated.View style={[styles.baseShape, commonStyle]}>
                {svgContent}
            </Animated.View>
        );
    };

    return renderElement();
};

const styles = StyleSheet.create({
    baseShape: {
        width: 50,
        height: 50,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        top: '50%',
        left: '50%',
        marginTop: -20,
        marginLeft: -20,
    },
});

export default FloatingARElement;