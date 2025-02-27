import { RouteProp, useRoute } from "@react-navigation/native";
import { StyleSheet, Text, View } from "react-native";
import { RootStackParamList } from "../../types/types";
import { useState } from "react";
import { ActivityIndicator } from "react-native-paper";
import { COLORS, FONT_SIZE, FONTS } from "../assets/constants/constant";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";

type AllReviewsRouteProp = RouteProp<RootStackParamList, 'Reviews'>;
const ReviewScreen: React.FC = () => {
    const route = useRoute<AllReviewsRouteProp>();
    const reviews = route.params.reviews;
    const [reviewText, setReviewText] = useState('');
    const [rating, setRating] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    // date format
    const formatDate = (timestamp: string): string => {
        const date = new Date(timestamp);
        return date.toLocaleString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    }
    console.log(reviews)
    return (
        <View>
            {reviews.length > 0 ? (
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
        </View>
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
    }
});
export default ReviewScreen;