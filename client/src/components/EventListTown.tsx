import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image } from 'react-native';
import axios from 'axios';
import { BASE_URL } from '../config/config.ts';
import { useNavigation } from '@react-navigation/native';
import { StyleSheet } from "react-native";
import { COLORS, FONT_SIZE, FONTS } from "../assets/constants/constant";
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
    faCalendarAlt,
    faClock,
    faMapMarkerAlt,
    faTag
} from '@fortawesome/free-solid-svg-icons';

interface Event {
    id: string;
    title: string;
    date: string;
    start_time: string;
    end_time: string;
    location: string;
    category: string;
    description: string;
    image_url: string;
    entrance_fee: number;
    ticket_availability: boolean;
    town: string;
}

interface EventListProps {
    municipalityId?: string;
}

const EventList: React.FC<EventListProps> = ({ municipalityId }) => {
    const navigation = useNavigation<any>();
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const url = municipalityId
                    ? `${BASE_URL}/events/fetch_events/municipality/${municipalityId}`
                    : `${BASE_URL}/events/fetch_events`;
                const response = await axios.get(url);
                setEvents(response.data || []);
            } catch (error) {
                console.error('Error fetching events:', error);
                setEvents([]);
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, [municipalityId]);

    // Format time from API format to readable format
    const formatTime = (time: string) => {
        if (!time) return '';

        try {
            // Handle different time formats
            let hours, minutes, period;

            if (time.includes(':')) {
                // Format: "HH:MM:SS" or "HH:MM"
                const parts = time.split(':');
                hours = parseInt(parts[0]);
                minutes = parts[1];
                period = hours >= 12 ? 'PM' : 'AM';
                hours = hours % 12 || 12; // Convert to 12-hour format
            } else {
                // Try to handle other formats if needed
                return time;
            }

            return `${hours}:${minutes} ${period}`;
        } catch (e) {
            console.error('Error formatting time:', e);
            return time;
        }
    };

    const renderEvent = ({ item }: { item: Event }) => (
        <TouchableOpacity
            style={styles.eventItem}
            onPress={() => navigation.navigate('EventDetails', { eventId: item.id })}
        >
            {item.image_url ? (
                <Image source={{ uri: item.image_url }} style={styles.eventImage} />
            ) : (
                <View style={styles.eventImagePlaceholder}>
                    <Text style={styles.placeholderText}>No Image</Text>
                </View>
            )}

            {/* Highlight Badge */}
            {item.category && (
                <View style={styles.highlightBadge}>
                    <Text style={styles.highlightText}>{item.category}</Text>
                </View>
            )}

            <View style={styles.eventDetails}>
                <Text style={styles.eventTitle} numberOfLines={1} ellipsizeMode="tail">{item.title}</Text>

                {/* Date and Time */}
                <View style={styles.infoRow}>
                    <FontAwesomeIcon icon={faCalendarAlt} size={12} color={COLORS.secondary} style={styles.icon} />
                    <Text style={styles.infoText}>{item.date}</Text>
                </View>

                {/* Time */}
                {(item.start_time || item.end_time) && (
                    <View style={styles.infoRow}>
                        <FontAwesomeIcon icon={faClock} size={12} color={COLORS.secondary} style={styles.icon} />
                        <Text style={styles.infoText}>
                            {item.start_time ? formatTime(item.start_time) : ''}
                            {item.start_time && item.end_time ? ' - ' : ''}
                            {item.end_time ? formatTime(item.end_time) : ''}
                        </Text>
                    </View>
                )}

                {/* Location/Town */}
                <View style={styles.infoRow}>
                    <FontAwesomeIcon icon={faMapMarkerAlt} size={12} color={COLORS.secondary} style={styles.icon} />
                    <Text style={styles.infoText} numberOfLines={1} ellipsizeMode="tail">
                        {item.location}
                        {item.town ? `, ${item.town}` : ''}
                    </Text>
                </View>

                {/* Ticket info if available */}
                {item.entrance_fee !== undefined && (
                    <View style={styles.ticketInfo}>
                        <Text style={styles.ticketText}>
                            {item.entrance_fee > 0 ? `₱${item.entrance_fee.toFixed(2)}` : 'Free Entry'}
                        </Text>
                        {item.ticket_availability !== undefined && (
                            <View style={[
                                styles.availabilityBadge,
                                item.ticket_availability ? styles.availableBadge : styles.unavailableBadge
                            ]}>
                                <Text style={styles.availabilityText}>
                                    {item.ticket_availability ? 'Available' : 'Sold Out'}
                                </Text>
                            </View>
                        )}
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );

    if (loading) {
        return <Text style={styles.loadingText}>Loading events...</Text>;
    }

    if (!events.length) {
        return (
            <Text style={styles.noEventsText}>
                {municipalityId ? `No events found for this municipality.` : 'No upcoming events.'}
            </Text>
        );
    }

    return (
        <FlatList
            data={events}
            renderItem={renderEvent}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.eventList}
            contentContainerStyle={styles.eventListContent}
        />
    );
};

const styles = StyleSheet.create({
    eventList: {
        paddingHorizontal: 20,
    },
    eventListContent: {
        paddingVertical: 8,
    },
    eventItem: {
        width: 220,
        marginRight: 16,
        backgroundColor: COLORS.white,
        borderRadius: 16,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 4,
        marginBottom: 8,
        position: "relative",
    },
    eventImage: {
        width: "100%",
        height: 120,
        resizeMode: "cover",
    },
    eventImagePlaceholder: {
        width: "100%",
        height: 120,
        backgroundColor: COLORS.lightGray,
        justifyContent: "center",
        alignItems: "center",
    },
    placeholderText: {
        fontFamily: FONTS.medium,
        fontSize: FONT_SIZE.small,
        color: COLORS.black,
        opacity: 0.7,
    },
    highlightBadge: {
        position: "absolute",
        top: 12,
        right: 12,
        backgroundColor: COLORS.secondary,
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    highlightText: {
        fontFamily: FONTS.semibold,
        fontSize: 10,
        color: COLORS.white,
        textTransform: "uppercase",
    },
    eventDetails: {
        padding: 12,
    },
    eventTitle: {
        fontFamily: FONTS.bold,
        fontSize: 16,
        color: COLORS.black,
        marginBottom: 8,
    },
    infoRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 6,
    },
    icon: {
        marginRight: 8,
    },
    infoText: {
        fontFamily: FONTS.regular,
        fontSize: 13,
        color: COLORS.black,
        opacity: 0.8,
        flex: 1,
    },
    ticketInfo: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: "rgba(0,0,0,0.05)",
    },
    ticketText: {
        fontFamily: FONTS.semibold,
        fontSize: 14,
        color: COLORS.secondary,
    },
    availabilityBadge: {
        paddingVertical: 3,
        paddingHorizontal: 8,
        borderRadius: 12,
    },
    availableBadge: {
        backgroundColor: "rgba(46, 204, 113, 0.1)",
    },
    unavailableBadge: {
        backgroundColor: "rgba(231, 76, 60, 0.1)",
    },
    availabilityText: {
        fontFamily: FONTS.medium,
        fontSize: 10,
        color: COLORS.black,
        opacity: 0.7,
    },
    loadingText: {
        fontFamily: FONTS.regular,
        fontSize: FONT_SIZE.medium,
        color: COLORS.black,
        opacity: 0.7,
        textAlign: "center",
        marginVertical: 20,
        marginHorizontal: 20,
    },
    noEventsText: {
        fontFamily: FONTS.regular,
        fontSize: FONT_SIZE.medium,
        color: COLORS.black,
        opacity: 0.7,
        textAlign: "center",
        marginVertical: 20,
        marginHorizontal: 20,
    },
});

export default EventList;