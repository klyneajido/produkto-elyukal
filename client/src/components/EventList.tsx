import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList, Event } from "../../types/types";
import { useEffect, useState } from "react";
import { BASE_URL } from "../config/config.ts";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { COLORS, FONT_SIZE, FONTS } from "../assets/constants/constant";
import { Image } from "react-native-animatable";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
    faCalendar,
    faClock,
    faMapMarkedAlt,
    faRedo, // Icon for refresh
} from "@fortawesome/free-solid-svg-icons";

const formatDate = (dateString :string) =>{
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
          month: 'numeric',
          day: 'numeric',
          year:'numeric',
        });
      } catch (error) {
        console.error('Date formatting error:', error);
        return dateString;
      }
}
const formatTime = (time: string | null): string => {
    if (!time) {
      return "Invalid Time";
    }
    try {
      let [hours, minutes] = time.split(":").map(Number);
      let period = hours >= 12 ? "PM" : "AM";
      hours = hours % 12 || 12;
      return `${hours}:${minutes.toString().padStart(2, "0")} ${period}`;
    } catch (error) {
      console.error('Time formatting error:', error);
      return time;
    }
  };

const EventList = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>("");

    // Function to fetch events, reusable for initial load and refresh
    const fetchEvents = async () => {
        try {
            setLoading(true);
            setError(""); // Clear previous error
            const response = await fetch(`${BASE_URL}/events/fetch_events`);
            if (!response.ok) {
                throw new Error(`Failed to load events: ${response.statusText}`);
            }
            const data = await response.json();
            setEvents(data);
            // console.log("Events fetched:", data);
        } catch (error: any) {
            setError(error.message || "Error fetching events");
            console.error("Fetch error:", error);
        } finally {
            setLoading(false);
        }
    };

    // Initial fetch on mount
    useEffect(() => {
        fetchEvents();
    }, []);

    // Handle refresh button press
    const handleRefresh = () => {
        fetchEvents();
    };

    // Loading state with refresh option
    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading events...</Text>
                <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
                    <FontAwesomeIcon icon={faRedo} size={20} color={COLORS.white} />
                    <Text style={styles.refreshButtonText}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // Error state with refresh option
    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
                    <FontAwesomeIcon icon={faRedo} size={20} color={COLORS.white} />
                    <Text style={styles.refreshButtonText}>Refresh</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // No events case with refresh option
    if (events.length === 0) {
        return (
            <View style={styles.noEventsContainer}>
                <Text style={styles.noEventsText}>No upcoming events available.</Text>
                <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
                    <FontAwesomeIcon icon={faRedo} size={20} color={COLORS.white} />
                    <Text style={styles.refreshButtonText}>Refresh</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const navigateEventDetails = (event: Event) => {
        console.log("Event ID:", event.id);
        console.log("Type of ID:", typeof event.id);
        console.log("Title:", event.title);
        navigation.navigate("EventDetails", { eventId: event.id });
    };

    return (
        <ScrollView
            style={styles.container}
            horizontal
            showsHorizontalScrollIndicator={false}
        >
            {events.map((event) => (
                <TouchableOpacity
                    key={event.id}
                    style={styles.eventCardLarge}
                    onPress={() => navigateEventDetails(event)}
                >
                    <Image
                        source={{ uri: event.image_url }}
                        style={styles.eventImageLarge}
                        defaultSource={require("../assets/img/events/culinary-arts.png")}
                    />
                    <View style={styles.eventOverlay}>
                        <Text style={styles.eventCategory}>{event.category}</Text>
                    </View>
                    <View style={styles.eventDetailsLarge}>
                        <View>
                            <Text
                                style={styles.eventNameLarge}
                                numberOfLines={1}
                                ellipsizeMode="tail"
                            >
                                {event.title}
                            </Text>
                            <Text
                                style={styles.eventDescriptionLarge}
                                numberOfLines={2}
                                ellipsizeMode="tail"
                            >
                                {event.description}
                            </Text>
                        </View>
                        <View style={styles.eventMetaContainer}>
                            <View style={styles.eventMetaItem}>
                                <FontAwesomeIcon icon={faCalendar} size={16} color={COLORS.gold} />
                                <Text
                                    style={styles.eventMetaText}
                                    numberOfLines={1}
                                    ellipsizeMode="tail"
                                >
                                    {formatDate(event.date)}
                                </Text>
                            </View>
                            <View style={styles.eventMetaItem}>
                                <FontAwesomeIcon icon={faClock} size={16} color={COLORS.gold} />
                                <Text
                                    style={styles.eventMetaText}
                                    numberOfLines={1}
                                    ellipsizeMode="tail"
                                >
                                    {formatTime(event.start_time)} - {formatTime(event.end_time)}
                                </Text>
                            </View>
                            <View style={styles.eventMetaItem}>
                                <FontAwesomeIcon icon={faMapMarkedAlt} size={16} color={COLORS.gold} />
                                <Text
                                    style={styles.eventMetaText}
                                    numberOfLines={1}
                                    ellipsizeMode="tail"
                                >
                                    {event.location}
                                </Text>
                            </View>
                        </View>
                    </View>
                </TouchableOpacity>
            ))}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: COLORS.white,
    },
    eventCardLarge: {
        width: 280,
        height: 400,
        marginRight: 20,
        marginBottom: 16,
        borderRadius: 20,
        backgroundColor: COLORS.white,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 8,
        overflow: "hidden",
    },
    eventImageLarge: {
        width: "100%",
        height: 200,
        resizeMode: "cover",
    },
    eventOverlay: {
        position: "absolute",
        top: 12,
        left: 12,
        backgroundColor: "rgba(255, 215, 0, 0.8)",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    eventCategory: {
        color: COLORS.white,
        fontSize: FONT_SIZE.small,
        fontFamily: FONTS.bold,
        textTransform:'uppercase',
        letterSpacing: 0.2,
    },
    eventDetailsLarge: {
        padding: 16,
        flex: 1,
        justifyContent: "space-between",
    },
    eventNameLarge: {
        fontSize: 18,
        fontFamily: FONTS.bold,
        color: COLORS.black,
        marginBottom: 8,
    },
    eventDescriptionLarge: {
        fontSize: 13,
        fontFamily: FONTS.regular,
        color: COLORS.black,
        opacity: 0.8,
        lineHeight: 18,
    },
    eventMetaContainer: {
        marginTop: 12,
        gap: 3,
    },
    eventMetaItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 3,
        padding: 6,
        borderRadius: 10,
    },
    eventMetaText: {
        fontSize: 12,
        fontFamily: FONTS.regular,
        color: COLORS.black,
        opacity: 0.9,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 16,
        backgroundColor: COLORS.white,
    },
    loadingText: {
        fontSize: 16,
        fontFamily: FONTS.regular,
        color: COLORS.black,
        marginBottom: 16,
    },
    errorContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 16,
        backgroundColor: COLORS.white,
    },
    errorText: {
        fontSize: 16,
        fontFamily: FONTS.regular,
        color: COLORS.red, // Assuming COLORS.red exists
        textAlign: "center",
        marginBottom: 16,
    },
    noEventsContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 16,
        backgroundColor: COLORS.white,
    },
    noEventsText: {
        fontSize: 16,
        fontFamily: FONTS.regular,
        color: COLORS.black,
        textAlign: "center",
        opacity: 0.7,
        marginBottom: 16,
    },
    refreshButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: COLORS.primary,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 25,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 4,
    },
    refreshButtonText: {
        color: COLORS.white,
        fontFamily: FONTS.semibold,
        fontSize: 14,
        marginLeft: 8,
    },
});

export default EventList;