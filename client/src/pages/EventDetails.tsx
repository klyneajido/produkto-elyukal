import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  Image,
  TouchableOpacity,
  Share,
  ActivityIndicator,
  Alert,
  Animated
} from 'react-native';
import { ParamListBase, useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
  faArrowLeft,
  faShare,
  faCalendar,
  faClock,
  faMapMarkerAlt,
  faPeopleGroup,
  faHeart,
  faMusic,
  faUtensils,
  faHandshake,
  faTheaterMasks,
  faPalette,
  faShoppingBag,
  faGamepad,
  IconDefinition
} from '@fortawesome/free-solid-svg-icons';
import styles from '../assets/style/eventDetailsStyle';
import { COLORS } from '../assets/constants/constant';
import { BASE_URL } from '../config/config';
import { Event, Highlight, RootStackParamList } from '../../types/types';

const getIconByName = (iconName: string): IconDefinition => {
  const iconMap: { [key: string]: IconDefinition } = {
    'music': faMusic,
    'food': faUtensils,
    'culture': faPeopleGroup,
    'handshake': faHandshake,
    'theater': faTheaterMasks,
    'art': faPalette,
    'shopping': faShoppingBag,
    'entertainment': faGamepad,
  };
  return iconMap[iconName.toLowerCase()] || faPeopleGroup;
};

const formatTime = (time: string | null): string => {
  if (!time) return '';
  return time.slice(0, 5);
};

const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch (error) {
    console.error('Date formatting error:', error);
    return dateString;
  }
};

const EventDetails: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const route = useRoute<RouteProp<RootStackParamList, 'EventDetails'>>();
  const eventId = route.params?.eventId;

  const [event, setEvent] = useState<Event | null>(null);
  const [eventHighlights, setEventHighlights] = useState<Highlight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);

  
  useEffect(() => {
    const loadEventData = async () => {
      if (!eventId) {
        setError('No event ID provided');
        setIsLoading(false);
        return;
      }

      try {
        const eventsResponse = await fetch(`${BASE_URL}/events/fetch_events`);
        if (!eventsResponse.ok) {
          throw new Error(`Failed to load events (Status: ${eventsResponse.status})`);
        }
        const eventsData = await eventsResponse.json();
        const foundEvent = eventsData.find((e: Event) => e.id === eventId);
        if (!foundEvent) {
          throw new Error('Event not found');
        }
        setEvent(foundEvent);

        try {
          const highlightsUrl = `${BASE_URL}/highlights/fetch_highlights?event_id=${eventId}`;
          const highlightsResponse = await fetch(highlightsUrl);
          if (highlightsResponse.ok) {
            const highlightsData = await highlightsResponse.json();
            setEventHighlights(highlightsData);
          }
        } catch (highlightError) {
          console.warn('Error loading highlights:', highlightError);
          setEventHighlights([]);
        }
      } catch (error) {
        console.error('Error loading event data:', error);
        setError(error instanceof Error ? error.message : 'Failed to load event');
        Alert.alert('Error', 'Unable to load event details. Please check your connection and try again.', [{ text: 'OK' }]);
      } finally {
        setIsLoading(false);
      }
    };

    loadEventData();
  }, [eventId]);

  const handleShare = async () => {
    if (!event) return;
    try {
      await Share.share({
        message: `Join me at ${event.title} - A cultural festival at ${event.location} on ${formatDate(event.date)}!`,
      });
    } catch (error) {
      console.error('Share error:', error);
      Alert.alert('Error', 'Failed to share event');
    }
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  if (error) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: 'red', marginBottom: 10 }}>{error}</Text>
        <TouchableOpacity
          style={{ marginTop: 20, padding: 10, backgroundColor: COLORS.primary, borderRadius: 5 }}
          onPress={() => navigation.goBack()}
        >
          <Text style={{ color: 'white' }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!event) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text>Event not found</Text>
        <TouchableOpacity
          style={{ marginTop: 20, padding: 10, backgroundColor: COLORS.primary, borderRadius: 5 }}
          onPress={() => navigation.goBack()}
        >
          <Text style={{ color: 'white' }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const startTime = formatTime(event.start_time);
  const endTime = formatTime(event.end_time);
  const timeDisplay = startTime && endTime ? `${startTime} - ${endTime}` : 'Time TBA';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <Image
            source={event.image_url ? { uri: event.image_url } : require('../assets/img/events/culinary-arts.png')}
            style={styles.headerImage}
            defaultSource={require('../assets/img/events/craft-fair.jpg')}
          />
          <View style={styles.overlay} />
          <View style={styles.navbar}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.navButton}>
              <FontAwesomeIcon icon={faArrowLeft} size={20} color="#fff" />
            </TouchableOpacity>
            <View style={styles.navRight}>
              <TouchableOpacity style={styles.navButton} onPress={handleShare}>
                <FontAwesomeIcon icon={faShare} size={20} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.navButton} onPress={toggleFavorite}>
                <FontAwesomeIcon icon={faHeart} size={20} color={isFavorite ? COLORS.secondary : "#fff"} />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{event.category}</Text>
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>{event.title}</Text>

          <View style={styles.keyInfo}>
            <View style={styles.infoItem}>
              <FontAwesomeIcon icon={faCalendar} size={20} color={COLORS.primary} />
              <Text style={styles.infoText}>{formatDate(event.date)}</Text>
            </View>
            <View style={styles.infoItem}>
              <FontAwesomeIcon icon={faClock} size={20} color={COLORS.primary} />
              <Text style={styles.infoText}>{timeDisplay}</Text>
            </View>
            <View style={styles.infoItem}>
              <FontAwesomeIcon icon={faMapMarkerAlt} size={20} color={COLORS.primary} />
              <Text style={styles.infoText}>{event.location}</Text>
            </View>
          </View>

          {/* Updated Highlights Section */}
          <View style={styles.highlightsSection}>
            <Text style={styles.sectionTitle}>Festival Highlights</Text>
            {eventHighlights.length > 0 ? (
              <View style={styles.highlightsGrid}>
                {eventHighlights.map((highlight) => (
                  <View key={highlight.id} style={styles.highlightCard}>
                    <FontAwesomeIcon
                      icon={getIconByName(highlight.icon)}
                      size={24}
                      color={COLORS.primary}
                    />
                    <Text style={styles.highlightTitle}>{highlight.title}</Text>
                    <Text style={styles.highlightDescription}>{highlight.description}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.emptyHighlightsContainer}>
                <View style={styles.emptyIconContainer}>
                  <FontAwesomeIcon icon={faPeopleGroup} size={24} color={COLORS.primary} />
                </View>
                <Text style={styles.emptyHighlightsText}>Stay tuned for exciting festival highlights!</Text>
              </View>
            )}
          </View>

          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>About the Festival</Text>
            <Text style={styles.descriptionText}>{event.description}</Text>
          </View>

          <View style={styles.communitySection}>
            <Text style={styles.sectionTitle}>Join the Community</Text>
            <TouchableOpacity style={styles.communityButton} onPress={() => {}}>
              <FontAwesomeIcon icon={faPeopleGroup} size={20} color="#fff" />
              <Text style={styles.communityButtonText}>Join Festival Group</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default EventDetails;