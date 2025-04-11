import { useEffect, useState, useRef } from "react";
import { useAuth } from "../../contextAuth";
import { Review, RootStackParamList } from "../../types/types";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import axios from "axios";
import { BASE_URL } from "../config/config";
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faStar, faCommentSlash } from "@fortawesome/free-solid-svg-icons";
import { COLORS, FONT_SIZE, FONTS } from "../assets/constants/constant";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Image } from "react-native-animatable";
import LinearGradient from "react-native-linear-gradient";

type ProductDetailsRouteProp = RouteProp<RootStackParamList, 'ProductDetails'>;
interface ReviewListProps{
    refreshKey:number;
}

export default function ReviewList() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [loadingReviews, setLoadingReviews] = useState(true);
    const [reviews, setReviews] = useState<Review[]>([]);
    const route = useRoute<ProductDetailsRouteProp>();
    const { product } = route.params;
    const { user } = useAuth();

    useEffect(() => {
        const abortController = new AbortController();
        const fetchReviews = async () => {
            try {
                setLoadingReviews(true);
                const response = await axios.get(`${BASE_URL}/reviews/${product.id}`, {
                    signal: abortController.signal,
                });
                setReviews(response.data);
            } catch (error: any) {
                if (error.name === 'AbortError') {
                    console.log('Review fetch aborted');
                } else {
                    console.error('Error fetching reviews:', error.message, error.response?.data);
                }
            } finally {
                setLoadingReviews(false);
            }
        };
        fetchReviews();
        return () => abortController.abort();
    }, [product.id]);

    const formatDate = (timestamp: string): string => {
        const date = new Date(timestamp);
        return date.toLocaleString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    return (
        <View style={styles.reviewContainer}>
            <View style={styles.header}>
                <Text style={styles.title}>Customer Reviews</Text>
                <TouchableOpacity
                    onPress={() => navigation.navigate('Reviews', { reviews, product })}
                    style={styles.seeMoreButton}
                >
                    <Text style={styles.seeMoreText}>See All</Text>
                </TouchableOpacity>
            </View>

            {loadingReviews ? (
                <ActivityIndicator size="small" color={COLORS.primary} style={styles.loading} />
            ) : reviews.length > 0 ? (
                <View style={styles.referencesListWrapper}>
                <View style={styles.referencesList}>
                    {reviews.slice(0, 3).map((review, index) => (
                        <View key={index} style={styles.reviewCard}>
                            <View style={styles.reviewHeader}>
                                <Image source={require('../assets/img/avatartion.png')} style={styles.avatar} />
                                <View>
                                    <Text style={styles.reviewUsername}>{review.full_name}</Text>
                                    <View style={styles.starContainer}>
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <FontAwesomeIcon
                                                key={i}
                                                icon={faStar}
                                                size={14}
                                                color={i < review.rating ? '#E0A800' : '#E5E7EB'}
                                            />
                                        ))}
                                    </View>
                                </View>
                                <View style={styles.date}>
                                    <Text style={styles.reviewDate}>{formatDate(review.created_at)}</Text>
                                </View>
                            </View>
                            <Text style={styles.reviewText} numberOfLines={2}>{review.review_text}</Text>
                        </View>
                    ))}
                </View>
                <LinearGradient
                   colors={['rgba(243, 244, 246, 0.5)', 'rgba(255, 255, 255, 1)']}// Adjust to match background
                    style={styles.gradientOverlay}
                />
            </View>
            ) : (
                <View style={styles.emptyStateContainer}>
                    <FontAwesomeIcon
                        icon={faCommentSlash}
                        size={40}
                        color={COLORS.lightgray}
                        style={styles.emptyIcon}
                    />
                    <Text style={styles.emptyStateTitle}>No Reviews Available</Text>
                    <Text style={styles.emptyStateMessage}>
                        There are no customer reviews for this product yet.
                    </Text>
                    {user && !(user as any).guest && (
                        <TouchableOpacity
                            style={styles.emptyStateButton}
                            onPress={() => navigation.navigate('Reviews', { reviews, product })}
                        >
                            <Text style={styles.emptyStateButtonText}>Add First Review</Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    reviewContainer: {
    
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: FONT_SIZE.large,
        fontFamily: FONTS.bold,
        color: COLORS.black,
    },
    seeMoreButton: {
        paddingVertical: 4,
        paddingHorizontal: 12,
    },
    seeMoreText: {
        fontSize: FONT_SIZE.medium,
        fontFamily: FONTS.medium,
        color: COLORS.primary,
    },
    loading: {
        marginVertical: 20,
    },
    referencesListWrapper: {
        position: 'relative',
        maxHeight: 400, // Adjust based on desired visible reviews (e.g., ~2-3 cards)
        overflow: 'hidden',
    },
    referencesList: {
        paddingBottom: 20, // Add padding to prevent gradient from cutting off content abruptly
    },
    gradientOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height:80, // Height of the fade effect
    },
    reviewCard: {
        backgroundColor: COLORS.container,
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
        minHeight: 120,
    },
    reviewHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        marginRight: 8,
    },
    reviewUsername: {
        fontSize: 16,
        fontFamily: FONTS.semibold,
        color: COLORS.black,
    },
    reviewDate: {
        fontSize: 12,
        fontFamily: FONTS.regular,
        color: COLORS.gray,
    },
    reviewText: {
        marginTop: 10,
        fontSize: FONT_SIZE.medium,
        fontFamily: FONTS.regular,
        color: COLORS.gray,
    },
    date: {
        marginLeft: 'auto',
        right: 0,
        top: 3,
        position: 'absolute',
    },
    starContainer: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    emptyStateContainer: {
        alignItems: 'center',
        paddingVertical: 24,
        paddingHorizontal: 16,
        backgroundColor: '#F8F8F8',
        borderRadius: 12,
        marginVertical: 8,
        borderWidth: 1,
        borderColor: '#EEEEEE',
    },
    emptyIcon: {
        marginBottom: 16,
    },
    emptyStateTitle: {
        fontSize: FONT_SIZE.large,
        fontFamily: FONTS.bold,
        color: COLORS.black,
        marginBottom: 8,
    },
    emptyStateMessage: {
        fontSize: FONT_SIZE.medium,
        fontFamily: FONTS.regular,
        color: COLORS.gray,
        textAlign: 'center',
        marginBottom: 16,
    },
    emptyStateButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
        elevation: 2,
    },
    emptyStateButtonText: {
        color: COLORS.white,
        fontSize: FONT_SIZE.medium,
        fontFamily: FONTS.semibold,
    },
});
