import { useEffect, useState } from "react";
import { useAuth } from "../../contextAuth";
import { Review, RootStackParamList } from "../../types/types";
import { RouteProp, useRoute } from "@react-navigation/native";
import axios from "axios";
import { BASE_URL } from "../config/config";
import { ActivityIndicator, Alert, Button, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import { COLORS, FONTS } from "../assets/constants/constant";

type ProductDetailsRouteProp = RouteProp<RootStackParamList, 'ProductDetails'>;

export default function ReviewList() {
    const [loadingReviews, setLoadingReviews] = useState(true);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [reviewText, setReviewText] = useState('');
    const [rating, setRating] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const route = useRoute<ProductDetailsRouteProp>();
    const { product } = route.params;
    const { user } = useAuth();

    useEffect(() => {
        const abortController = new AbortController();
        const fetchReviews = async () => {
            try {
                const response = await axios.get(`${BASE_URL}/reviews/${product.id}`, {
                    signal: abortController.signal,
                });
                console.log(response.data);
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
    return (
        <View>
            <Text style={styles.sectionTitle}>Reviews</Text>
            {loadingReviews ? (
                <ActivityIndicator size="small" color="#FDD700" />
            ) : reviews.length > 0 ? (
                reviews.map((review, index) => (
                    <View key={index} style={styles.reviewCard}>
                        <Text style={styles.reviewUsername}>{review.full_name}</Text>
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
                <Text>No reviews yet.</Text>
            )}
            {user && !(user as any).guest && (
                <View style={{ marginVertical: 16 }}>
                    <Text style={styles.sectionTitle}>Add Your Review</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Write your review here..."
                        value={reviewText}
                        onChangeText={setReviewText}
                        multiline
                    />
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 8 }}>
                        <Text style={styles.text}>Rating: </Text>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <TouchableOpacity key={star} onPress={() => setRating(star)}>
                                <FontAwesomeIcon
                                    icon={faStar}
                                    size={20}
                                    color={star <= rating ? '#FDD700' : '#ccc'}
                                />
                            </TouchableOpacity>
                        ))}
                    </View>
                    <TouchableOpacity
                        onPress={submitReview}
                        disabled={submitting}
                        style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
                        activeOpacity={0.8} // Subtle press feedback
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
    sectionTitle: {
        fontSize: 20,
        fontFamily: FONTS.bold,
        color: '#333',
        marginBottom: 10,
        borderBottomWidth: 2,
        borderBottomColor: COLORS.secondary,
        paddingBottom: 5,
    },
    text: {
        color: COLORS.black,
    },
    submitButton: {
        marginTop:10,
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
        marginVertical: 8,
        borderRadius: 8,
        shadowColor: COLORS.black,
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
        borderLeftColor: COLORS.primary,
        borderLeftWidth: 4,
        elevation: 3
    },
    reviewUsername: {
        fontSize: 16,
        fontFamily: FONTS.bold,
        marginBottom:2,
        color: COLORS.black,
    },
    reviewComment: {
        fontSize: 14,
        marginBottom: 8,
        color: COLORS.black,
    },
    starContainer: {
        flexDirection: 'row',
        gap: 4,
    },
    noReviews: {
        textAlign: 'center',
        color: COLORS.gray,
        marginTop: 16,
    },
    input: {
        borderWidth: 1,
        borderColor: COLORS.lightgray,
        borderRadius: 4,
        padding: 8,
        marginVertical: 8,
        minHeight: 60,
        color: COLORS.black,
    }
});