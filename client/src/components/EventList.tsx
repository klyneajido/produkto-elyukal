import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList, Event } from "../../types/types";
import { useEffect, useState } from "react";
import { BASE_URL } from "../config/config";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORS, FONTS } from "../assets/constants/constant";
import { Image } from "react-native-animatable";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faCalendar, faClock, faMapMarkedAlt } from "@fortawesome/free-solid-svg-icons";

const EventList = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [events, setEvents] = useState<Event[]>([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await fetch(`${BASE_URL}/events/fetch_events`)
                if (!response.ok) {
                    console.log('Error', 'Failed to load events.')
                }
                const data = await response.json();
                setEvents(data);
            }
            catch (error) {
                throw new Error('Error fetching Events');
            }
        }
        fetchEvents();
    }, [])

    if (error) {
        return (
            <View>
                <Text>Error in Rendering Events</Text>
            </View>
        );
    }

    const navigateEventDetails =(event:any) =>{
        console.log("Event ID:", event.id);
        console.log("Type of ID:", typeof event.id);
        console.log("Title:", event.title);
        navigation.navigate('EventDetails', {eventId:event.id})
    };

    return (
        <ScrollView
            style={styles.container}
            horizontal
            showsHorizontalScrollIndicator={false}
        >
            {events.map((event) =>
                <TouchableOpacity 
                key={event.id}
                style={styles.eventCardLarge}
                onPress={()=>navigateEventDetails({'id': event.id, 'title': event.title})}
                >
                    <Image
                        source={{ uri: event.image_url }}
                        style={styles.eventImageLarge}
                        defaultSource={require('../assets/img/events/culinary-arts.png')}
                    />
                    <View style={styles.eventOverlay}>
                        <Text style={styles.eventCategory}>{event.category}</Text>
                    </View>
                    <View style={styles.eventDetailsLarge}>
                        <View>
                            <Text style={styles.eventNameLarge} numberOfLines={1} ellipsizeMode="tail">
                                {event.title}
                            </Text>
                            <Text style={styles.eventDescriptionLarge} numberOfLines={2} ellipsizeMode="tail">
                                {event.description}
                            </Text>
                        </View>
                        <View style={styles.eventMetaContainer}>
                            <View style={styles.eventMetaItem}>
                                <FontAwesomeIcon icon={faCalendar} size={16} color="#666" />
                                <Text style={styles.eventMetaText} numberOfLines={1} ellipsizeMode="tail">
                                    {new Date(event.date).toLocaleDateString()}
                                </Text>
                            </View>
                            <View style={styles.eventMetaItem}>
                                <FontAwesomeIcon icon={faClock} size={16} color="#666" />
                                <Text style={styles.eventMetaText} numberOfLines={1} ellipsizeMode="tail">
                                    {event.start_time && event.end_time
                                        ? `${event.start_time.slice(0, 5)} - ${event.end_time.slice(0, 5)}`
                                        : 'Time TBA'}
                                </Text>
                            </View>
                            <View style={styles.eventMetaItem}>
                                <FontAwesomeIcon icon={faMapMarkedAlt} size={16} color="#666" />
                                <Text style={styles.eventMetaText} numberOfLines={1} ellipsizeMode="tail">
                                    {event.location}
                                </Text>
                            </View>
                        </View>
                    </View>
                </TouchableOpacity>
            )}

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
        marginRight: 16,
        marginBottom: 16,
        borderRadius: 20,
        backgroundColor: COLORS.white,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 8,
        overflow: 'hidden',
    },

    eventImageLarge: {
        width: '100%',
        height: 200,
        resizeMode: 'cover',
    },
    eventOverlay: {
        position: 'absolute',
        top: 12,
        left: 12,
        backgroundColor: 'rgba(255, 215, 0, 0.8)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    eventCategory: {
        color: COLORS.white,
        fontSize: 12,
        fontFamily: FONTS.semibold,
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    eventDetailsLarge: {
        padding: 16,
        flex: 1,
        justifyContent: 'space-between',
    },
    eventNameLarge: {
        fontSize: 18,
        fontFamily: FONTS.bold, // Changed to bold for emphasis
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
        flexDirection: 'row',
        alignItems: 'center',
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
    eventButtonLarge: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 25,
        alignSelf: 'center',
        shadowColor: '#000',
        // shadowOffset: { width: 0, height: 4 },
        // shadowOpacity: 0.2,
        // shadowRadius: 6,
        elevation: 6,
    },
    eventButtonTextLarge: {
        color: COLORS.white,
        fontFamily: FONTS.semibold,
        fontSize: 14,

    },
});

export default EventList;