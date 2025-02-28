import { RouteProp, useRoute } from "@react-navigation/native";
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Review, RootStackParamList } from "../../types/types";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator } from "react-native-paper";
import { COLORS, FONT_SIZE, FONTS } from "../assets/constants/constant";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useAuth } from "../../contextAuth";
import { BASE_URL } from "../config/config";

// Correct route type for 'Reviews'
type ReviewsRouteProp = RouteProp<RootStackParamList, 'Reviews'>;

const ReviewScreen: React.FC = () => {
  const reviewInputRef = useRef<TextInput>(null);
  const route = useRoute<ReviewsRouteProp>();
  const { reviews: initialReviews, product } = route.params; // Destructure both reviews and product
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialReviews.length > 0) {
      setLoading(false);
      setError(null);
      return;
    }
    // Optionally fetch reviews if none provided
    const abortController = new AbortController();
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${BASE_URL}/reviews/${product.id}`, {
          signal: abortController.signal,
        });
        setReviews(response.data);
        setError(null);
      } catch (error: any) {
        if (error.name === 'AbortError') {
          console.log('Review fetch aborted');
        } else {
          console.error('Error fetching reviews:', error.message, error.response?.data);
          setError('Failed to load reviews');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
    return () => abortController.abort();
  }, [initialReviews, product.id]);

  const formatDate = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const submitReview = async () => {
    if (!user || (user as any).guest) {
      Alert.alert('Login Required', 'Please Log in as a Registered User to submit a Review');
      return;
    }
    if (!reviewText || rating < 1 || rating > 5) {
      Alert.alert('Invalid Input', 'Please provide a review and a rating between 1 and 5.');
      return;
    }
    if (!product || !product.id) {
      Alert.alert('Error', 'Product information is missing. Cannot submit review.');
      return;
    }
    setSubmitting(true);
    const abortController = new AbortController();
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      await axios.post(
        `${BASE_URL}/reviews/`,
        {
          product_id: product.id, // Now uses the actual product ID
          rating,
          review_text: reviewText,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          signal: abortController.signal,
        }
      );
      // Fetch updated reviews
      const fetchResponse = await axios.get(`${BASE_URL}/reviews/${product.id}`, {
        signal: abortController.signal,
      });
      setReviews(fetchResponse.data);
      setReviewText('');
      setRating(0);
      setError(null);
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
    <ScrollView>
      {loading ? (
        <ActivityIndicator size="small" color="#FDD700" />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : reviews.length > 0 ? (
        reviews.map((review, index) => (
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
        <Text style={styles.noReviewsText}>No reviews available</Text>
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
    </ScrollView>
  );
};

const styles = StyleSheet.create({
    reviewContainer: {

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
    },
    submitButton: {
        marginTop: 10,
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
        marginHorizontal: 20,
    },
    submitButtonText: {
        fontSize: 16,
        fontFamily: FONTS.semibold,
        color: "white",
        letterSpacing: 0.5,
        textTransform: "uppercase",
        marginHorizontal: 20,
    },
    reviewCard: {
        backgroundColor: '#fefefe',
        padding: 16,
        borderRadius: 8,
        shadowColor: COLORS.black,
        borderLeftColor: COLORS.primary,
        borderLeftWidth: 4,
        marginHorizontal: 5,
        borderBottomColor: COLORS.lightgray,
        borderBottomWidth: 1
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
    },
    starContainer: {
        flexDirection: 'row',
        gap: 4,
    },
    noReviewsText: {
        textAlign: 'center',
        color: COLORS.gray,
        marginTop: 16,
        marginHorizontal: 20,
    },

    input: {
        borderWidth: 1,
        borderColor: COLORS.lightgray,
        borderRadius: 4,
        padding: 8,
        marginVertical: 8,
        minHeight: 60,
        color: COLORS.black,
        marginHorizontal: 20,
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
    errorText: {
        textAlign: 'center',
        color: COLORS.red,
        marginTop: 16,
        marginHorizontal: 20,
        fontSize: FONT_SIZE.medium,
      },
});
export default ReviewScreen;