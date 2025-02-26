import { useEffect, useState, useRef } from "react";
import { useAuth } from "../../contextAuth";
import { Review, RootStackParamList } from "../../types/types";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import axios from "axios";
import { BASE_URL } from "../config/config";
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faStar, faCommentSlash } from "@fortawesome/free-solid-svg-icons";
import { COLORS, FONT_SIZE, FONTS } from "../assets/constants/constant";
import { NativeStackNavigationProp } from "@react-navigation/native-stack/lib/typescript/src/types";

type ProductDetailsRouteProp = RouteProp<RootStackParamList, 'ProductDetails'>;

export default function ReviewList() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [loadingReviews, setLoadingReviews] = useState(true);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [reviewText, setReviewText] = useState('');
    const [rating, setRating] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const route = useRoute<ProductDetailsRouteProp>();
    const { product } = route.params;
    const { user } = useAuth();
    const reviewInputRef = useRef<TextInput>(null);

    useEffect(() => {
        const abortController = new AbortController();
        const fetchReviews = async () => {
            try {
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

    const submitReview = async () => {
        if (!user || (user as any).guest) {
            Alert.alert('Login Required', 'Please Log in as a Registered User to submit a Review');
            return;
        }
        if (!reviewText || rating < 1 || rating > 5) {
            Alert.alert('Invalid Input', 'Please provide a review and a rating between 1 and 5.');
            return;
        }
        setSubmitting(true);
        const abortController = new AbortController();
        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }
            console.log('Submitting with token:', token);
            console.log('Payload:', { product_id: product.id, rating, review_text: reviewText });

            const response = await axios.post(
                `${BASE_URL}/reviews/`,
                {
                    product_id: product.id,
                    rating,
                    review_text: reviewText
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    signal: abortController.signal,
                }
            );
            console.log('Response:', response.data);

            const fetchResponse = await axios.get(`${BASE_URL}/reviews/${product.id}`, {
                signal: abortController.signal,
            });
            setReviews(fetchResponse.data);

            setReviewText('');
            setRating(0);
            Alert.alert('Success', 'Review submitted successfully!');
        } catch (error: any) {
            if (error.name === 'AbortError') {
                console.log('Review submission aborted');
            } else {
                console.error('Error submitting review:', error.message, error.response?.data);
                Alert.alert('Error', error.response?.data?.detail || 'Failed to submit review.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    const formatDate = (timestamp: string): string => {
        const date = new Date(timestamp);
        return date.toLocaleString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    }

    const focusReviewInput = () => {
        if (reviewInputRef.current) {
            reviewInputRef.current.focus();
        }
    };

    return (
        <View style={styles.reviewContainer}>
            <View style={styles.topHeader}>
                <Text style={styles.title}>Reviews</Text>
                <TouchableOpacity onPress={() => { navigation.navigate('Reviews', { reviews: reviews }) }}>
                    <Text style={styles.subTitle}>See More</Text>
                </TouchableOpacity>
            </View>
            {loadingReviews ? (
                <ActivityIndicator size="small" color="#FDD700" />
            ) : reviews.length > 0 ? (
                reviews.slice(0, 2).map((review, index) => (
                    <View key={index} style={styles.reviewCard}>
                        <View style={styles.topCardContainer}>
                            <Text style={styles.reviewUsername}>{review.full_name}</Text>
                            <Text style={styles.reviewDate}>{formatDate(review.created_at)}</Text>
                        </View>
                        <View style={styles.starContainer}>
                            {Array.from({ length: Math.floor(review.rating) }).map((_, i) => (
                                <FontAwesomeIcon
                                    key={`${index}-${i}`}
                                    icon={faStar}
                                    size={12}
                                    color="#FDD700"
                                />
                            ))}
                        </View>
                        <Text style={styles.reviewComment}>{review.review_text}</Text>
                    </View>
                ))
            ) : (
                <View style={styles.emptyStateContainer}>
                    <View style={styles.emptyIconContainer}>
                        <FontAwesomeIcon
                            icon={faCommentSlash}
                            size={40}
                            color={COLORS.lightgray}
                        />
                    </View>
                    <Text style={styles.emptyStateTitle}>No Reviews Yet</Text>
                    <Text style={styles.emptyStateMessage}>
                        Be the first to share your thoughts about this product!
                    </Text>
                    {user && !(user as any).guest ? (
                        <TouchableOpacity
                            style={styles.emptyStateButton}
                            onPress={focusReviewInput}
                        >
                            <Text style={styles.emptyStateButtonText}>Write a Review</Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            style={styles.emptyStateButton}
                            onPress={() => navigation.navigate('Login')}
                        >
                            <Text style={styles.emptyStateButtonText}>Login to Review</Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}
            {user && !(user as any).guest && (
                <View style={styles.addReviewContainer}>
                    <Text style={styles.sectionTitle}>Add Your Review</Text>
                    <TextInput
                        ref={reviewInputRef}
                        style={styles.input}
                        placeholder="Write your review here..."
                        value={reviewText}
                        onChangeText={setReviewText}
                        multiline
                    />
                    <View style={styles.ratingContainer}>
                        <Text style={styles.text}>Rating: </Text>
                        <View style={styles.starsRow}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <TouchableOpacity
                                    key={star}
                                    onPress={() => setRating(star)}
                                    style={styles.starButton}
                                >
                                    <FontAwesomeIcon
                                        icon={faStar}
                                        size={24}
                                        color={star <= rating ? '#FDD700' : '#E0E0E0'}
                                    />
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                    <TouchableOpacity
                        onPress={submitReview}
                        disabled={submitting}
                        style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.submitButtonText}>
                            {submitting ? "Submitting..." : "Submit Review"}
                        </Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    reviewContainer: {
        marginBottom: 20,
    },
    topHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 2,
        borderBottomColor: COLORS.secondary,
        paddingBottom: 5,
        marginBottom: 10,
        marginHorizontal: 20,
    },
    sectionTitle: {
        fontSize: FONT_SIZE.large,
        fontFamily: FONTS.bold,
        color: '#333',
        marginHorizontal: 20,
        marginBottom: 10,
    },
    title: {
        fontSize: FONT_SIZE.large,
        fontFamily: FONTS.bold,
        color: '#333',
    },
    subTitle: {
        fontSize: FONT_SIZE.medium,
        fontFamily: FONTS.regular,
        color: COLORS.primary,
    },
    text: {
        color: COLORS.black,
        fontSize: FONT_SIZE.medium,
        fontFamily: FONTS.regular,
    },
    submitButton: {
        marginTop: 15,
        backgroundColor: COLORS.primary,
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 5,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.2)",
        marginHorizontal: 20,
    },
    submitButtonDisabled: {
        backgroundColor: COLORS.lightgray,
        borderColor: "rgba(0, 0, 0, 0.1)",
    },
    submitButtonText: {
        fontSize: 16,
        fontFamily: FONTS.semibold,
        color: "white",
        letterSpacing: 0.5,
        textTransform: "uppercase",
    },
    reviewCard: {
        backgroundColor: '#fefefe',
        padding: 16,
        borderRadius: 8,
        shadowColor: COLORS.black,
        borderLeftColor: COLORS.primary,
        borderLeftWidth: 4,
        marginHorizontal: 20,
        marginBottom: 12,
        borderBottomColor: COLORS.lightgray,
        borderBottomWidth: 1,
        elevation: 2,
    },
    topCardContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    reviewUsername: {
        fontSize: FONT_SIZE.medium,
        fontFamily: FONTS.semibold,
        marginBottom: 2,
        color: COLORS.black,
    },
    reviewDate: {
        fontSize: FONT_SIZE.medium - 2,
        fontFamily: FONTS.regular,
        color: COLORS.gray,
    },
    reviewComment: {
        fontSize: FONT_SIZE.small + 2,
        marginVertical: 8,
        color: COLORS.black,
        lineHeight: 20,
    },
    starContainer: {
        flexDirection: 'row',
        gap: 4,
        marginVertical: 6,
    },
    input: {
        borderWidth: 1,
        borderColor: COLORS.lightgray,
        borderRadius: 8,
        padding: 12,
        marginVertical: 8,
        minHeight: 80,
        color: COLORS.black,
        marginHorizontal: 20,
        fontFamily: FONTS.regular,
        fontSize: FONT_SIZE.medium,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 10,
        marginHorizontal: 20,
    },
    starsRow: {
        flexDirection: 'row',
        marginLeft: 8,
    },
    starButton: {
        padding: 5,
    },
    emptyStateContainer: {
        backgroundColor: '#FAFAFA',
        borderRadius: 12,
        padding: 20,
        marginHorizontal: 20,
        marginVertical: 10,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#EEEEEE',
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    emptyIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#F5F5F5',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#EEEEEE',
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
        marginBottom: 20,
        paddingHorizontal: 10,
        lineHeight: 20,
    },
    emptyStateButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 25,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 3,
    },
    emptyStateButtonText: {
        color: 'white',
        fontFamily: FONTS.semibold,
        fontSize: FONT_SIZE.medium,
    },
    addReviewContainer: {
        marginTop: 20,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        paddingVertical: 15,
        marginHorizontal: 20,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    }
});