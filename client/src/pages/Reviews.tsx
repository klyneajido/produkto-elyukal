import React, { useEffect, useRef, useState } from 'react';
import {
  ScrollView, View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Animated, Dimensions,
  Alert
} from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { Review, RootStackParamList } from '../../types/types';
import { ActivityIndicator } from 'react-native-paper';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faStar, faMapMarkerAlt, faArrowLeft, faPencil, faTimes } from '@fortawesome/free-solid-svg-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useAuth } from '../../contextAuth';
import { BASE_URL } from '../config/config';
import { COLORS, FONT_SIZE, FONTS } from '../assets/constants/constant';

type ReviewsRouteProp = RouteProp<RootStackParamList, 'Reviews'>;
const { width, height } = Dimensions.get('window');

const ReviewScreen: React.FC = () => {
  const navigation = useNavigation();
  useEffect(() => {
    console.log('Navigation in ReviewScreen:', navigation);
  }, [navigation]);
  const route = useRoute<ReviewsRouteProp>();
  const { reviews: initialReviews, product } = route.params;
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);

  // Animation values
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const reviewContainerAnim = useRef(new Animated.Value(0)).current;
  const fabAnim = useRef(new Animated.Value(1)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const abortController = new AbortController();
    const fetchReviews = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${BASE_URL}/reviews/${product.id}`, {
          signal: abortController.signal,
        });
        setReviews(response.data);
      } catch (error: any) {
        console.error('Error fetching reviews:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
    return () => abortController.abort();
  }, [product.id]);

  const formatDate = (timestamp: string) => new Date(timestamp).toLocaleDateString('en-GB');

  const submitReview = async () => {
    if (!user || (user as any).guest) return Alert.alert('Login Required', 'Please log in to review.');
    if (!reviewText || rating < 1) return Alert.alert('Invalid Input', 'Add a review and rating.');
    setSubmitting(true);
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.post(`${BASE_URL}/reviews/`, {
        product_id: product.id, rating, review_text: reviewText,
      }, { headers: { Authorization: `Bearer ${token}` } });
      const response = await axios.get(`${BASE_URL}/reviews/${product.id}`);
      setReviews(response.data);
      setReviewText('');
      setRating(0);
      // Alert.alert('Success', 'Review added!!!!!');
      toggleReviewForm(); // Hide the form after successful submission
    } catch (error: any) {
      Alert.alert('Error', 'Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  const animateStar = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.2, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
  };

  const toggleReviewForm = () => {
    if (showReviewForm) {
      // Hide review form
      Animated.parallel([
        Animated.timing(reviewContainerAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fabAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShowReviewForm(false);
      });
    } else {
      // Show review form
      setShowReviewForm(true);
      Animated.parallel([
        Animated.timing(reviewContainerAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fabAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0.5,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  // Calculate transform values for the review container
  const translateY = reviewContainerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [300, 0],
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <FontAwesomeIcon icon={faArrowLeft} size={20} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reviews for {product.name}</Text>
      </View>

      {/* Reviews List */}
      <ScrollView style={styles.scrollContainer}>
        {loading ? (
          <ActivityIndicator size="small" color="#6B48FF" />
        ) : reviews.length > 0 ? (
          reviews.map((review, index) => (
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
          ))
        ) : (
          <Text style={styles.noReviews}>No reviews yet. Be the first!</Text>
        )}
        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Overlay */}
      {showReviewForm && (
        <Animated.View
          style={[
            styles.overlay,
            { opacity: overlayOpacity }
          ]}
          pointerEvents={showReviewForm ? "auto" : "none"}
          onTouchStart={toggleReviewForm}
        />
      )}

      {/* Floating Action Button */}
      {user && !(user as any).guest && (
        <Animated.View
          style={[
            styles.fabContainer,
            {
              transform: [
                { scale: fabAnim }
              ],
              opacity: fabAnim
            }
          ]}
        >
          <TouchableOpacity
            style={styles.fab}
            onPress={toggleReviewForm}
            activeOpacity={0.8}
          >
            <FontAwesomeIcon icon={faPencil} size={24} color={COLORS.white} />
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Review Input Form */}
      {user && !(user as any).guest && showReviewForm && (
        <Animated.View
          style={[
            styles.footer,
            {
              transform: [
                { translateY: translateY }
              ]
            }
          ]}
        >
          <View style={styles.reviewFormHeader}>
            <Text style={styles.ratingLabel}>Rate this product</Text>
            <TouchableOpacity onPress={toggleReviewForm}>
              <FontAwesomeIcon icon={faTimes} size={22} color={COLORS.gray} />
            </TouchableOpacity>
          </View>

          <View style={styles.ratingContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => { setRating(star); animateStar(); }}
                style={styles.starButton}
              >
                <Animated.View style={{ transform: [{ scale: star === rating ? scaleAnim : 1 }] }}>
                  <FontAwesomeIcon
                    icon={faStar}
                    size={28}
                    color={star <= rating ? '#E0A800' : '#E5E7EB'}
                  />
                </Animated.View>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            style={styles.input}
            placeholder="Write your review here..."
            placeholderTextColor={COLORS.lightgray}
            value={reviewText}
            onChangeText={setReviewText}
            multiline
            numberOfLines={3}
            maxLength={200}
          />

          <View style={styles.characterCount}>
            <Text style={styles.characterCountText}>{reviewText.length}/200</Text>
          </View>

          <TouchableOpacity
            style={[
              styles.submitButton,
              (submitting || !reviewText.trim() || rating === 0) && styles.submitButtonDisabled
            ]}
            onPress={submitReview}
            disabled={submitting || !reviewText.trim() || rating === 0}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>Submit Review</Text>
            )}
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.primary,
    elevation: 2,
    borderBottomLeftRadius: 20,
  },
  headerTitle: {
    fontSize: FONT_SIZE.large + 2,
    fontFamily: FONTS.semibold,
    color: COLORS.white,
    marginLeft: 16,
  },
  scrollContainer: {
    padding: 16,
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
  date: {
    marginLeft: 'auto',
    right: 0,
    top: 3,
    position: 'absolute'
  },
  starContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  reviewText: {
    marginTop: 10,
    fontSize: FONT_SIZE.medium,
    fontFamily: FONTS.regular,
    color: COLORS.gray,
  },
  noReviews: {
    textAlign: 'center',
    color: COLORS.gray,
    fontSize: 14,
    padding: 20,
  },
  // Overlay for background dimming
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000',
    zIndex: 1,
  },
  // Floating Action Button
  fabContainer: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    zIndex: 2,
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  // Review Form
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 3,
  },
  reviewFormHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  ratingLabel: {
    fontSize: 16,
    fontFamily: FONTS.semibold,
    color: COLORS.black,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  starButton: {
    padding: 6,
  },
  input: {
    borderColor: COLORS.lightgray,
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.black,
    textAlignVertical: 'top',
    height: 100,
  },
  characterCount: {
    alignItems: 'flex-end',
    marginTop: 8,
    marginBottom: 16,
  },
  characterCountText: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.gray,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.lightgray,
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.large,
    letterSpacing: 0.2,
    fontFamily: FONTS.semibold,
  },
});

export default ReviewScreen;