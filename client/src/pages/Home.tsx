import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  SafeAreaView,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import styles from '../assets/style/homeStyle.js';
import { ParamListBase, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
  faCalendar,
  faMapMarkedAlt,
  faStar,
  faTicketAlt,
  faSliders,
  faClock
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../contextAuth.tsx';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Products from './Products.tsx';

import ProductList from '../components/ProductList.tsx';

const API_BASE_URL = 'http://192.168.100.5:8000';

interface User {
  email: string;
  first_name: string;
  last_name: string;
  profile: string;
}

interface Event {
  id: string;  // Explicitly typed as string for UUID
  title: string;
  date: string;
  start_time: string;
  end_time: string;
  location: string;
  category: string;
  description: string;
  image_url: string;
}

interface Highlight {
  id: string;
  event_id: string;
  title: string;
  description: string;
  icon: string;
}

type RootStackParamList = {
  EventDetails: { eventId: string };
  Login: undefined;
  Products: undefined;
};

const Home: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user } = useAuth();
  const [searchText, setSearchText] = useState<string>('');
  const [events, setEvents] = useState<Event[]>([]);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        navigation.navigate("Login");
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    fetchEvents();
    fetchHighlights();
  }, []);

  const fetchEvents = async () => {
    try {
      console.log('Fetching events from:', `${API_BASE_URL}/events/fetch_events`);
      const response = await fetch(`${API_BASE_URL}/events/fetch_events`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Received events:', data);
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
      Alert.alert('Error', 'Failed to load events. Please try again later.');
    }
  };

  const fetchHighlights = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/highlights/fetch_highlights`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setHighlights(data);
    } catch (error) {
      console.error('Error fetching highlights:', error);
    }
  };

  const categories = [
    { name: 'Handcraft', icon: require('../assets/img/handcraft.png') },
    { name: 'Furniture', icon: require('../assets/img/furniture.jpg') },
    { name: 'Food', icon: require('../assets/img/food.jpg') },
    { name: 'Pottery', icon: require('../assets/img/pottery.jpg') },
  ];

  const stats = [
    { number: '1,200+', label: 'Artisans' },
    { number: '50+', label: 'Communities' },
    { number: '5,000+', label: 'Products' },
  ];

  const locations = [
    "Discover",
    "Rosario",
    "Sto. Tomas",
    "Agoo",
    "Aringay",
    "Caba",
    "Bauang",
    "San Fernando City",
    "San Juan",
    "Bacnotan",
    "Santol",
    "San Gabriel",
    "Bangar",
    "Sudipen"
  ];
  const renderEvents = () => (
    <View style={styles.eventsContainer}>
      <View style={styles.divider} />
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionHeaderTitle}>Upcoming Events</Text>
        <TouchableOpacity>
          <Text style={styles.sectionHeaderLink}>View Calendar</Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: 20 }}
      >
        {events.map((event) => (
          <TouchableOpacity
            key={event.id}
            style={styles.eventCardLarge}
            onPress={() => {
              console.log('Event being navigated to:', {
                id: event.id,
                type: typeof event.id,
                title: event.title
              });
              navigation.navigate('EventDetails', { eventId: event.id });
            }}
          >
            <Image
              source={event.image_url ? { uri: event.image_url } : require('../assets/img/events/pottery.jpg')}
              style={styles.eventImageLarge}
              defaultSource={require('../assets/img/events/culinary-arts.png')}
            />
            <View style={styles.eventOverlay}>
              <Text style={styles.eventCategory}>{event.category}</Text>
            </View>
            <View style={styles.eventDetailsLarge}>
              <View>
                <Text style={styles.eventNameLarge}>{event.title}</Text>
                <Text style={styles.eventDescriptionLarge} numberOfLines={2}>
                  {event.description}
                </Text>
              </View>
              <View style={styles.eventMetaContainer}>
                <View style={styles.eventMetaItem}>
                  <FontAwesomeIcon icon={faCalendar} size={16} color="#666" />
                  <Text style={styles.eventMetaText}>
                    {new Date(event.date).toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.eventMetaItem}>
                  <FontAwesomeIcon icon={faClock} size={16} color="#666" />
                  <Text style={styles.eventMetaText}>
                    {event.start_time && event.end_time
                      ? `${event.start_time.slice(0, 5)} - ${event.end_time.slice(0, 5)}`
                      : 'Time TBA'}
                  </Text>
                </View>
                <View style={styles.eventMetaItem}>
                  <FontAwesomeIcon icon={faMapMarkedAlt} size={16} color="#666" />
                  <Text style={styles.eventMetaText}>{event.location}</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Top Section with Search */}
          <View style={styles.topContainer}>
            <View style={styles.searchBarContainer}>
              <TextInput
                style={styles.searchBar}
                onChangeText={setSearchText}
                value={searchText}
                placeholder="Search products, events, or artisans..."
                placeholderTextColor="#999"
              />
              <TouchableOpacity style={styles.filterButton}>
                <FontAwesomeIcon icon={faSliders} size={22} color="#FFF" />
              </TouchableOpacity>
            </View>

            {/* Categories */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.circleContainer}
            >
              <View style={styles.circleWrapper}>
                {categories.map((category, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.circleSubContainer}
                  >
                    <Image style={styles.image} source={category.icon} />
                    <Text style={styles.text}>{category.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Welcome Section */}
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeTitle}>Discover Local Artistry</Text>
            <Text style={styles.welcomeSubtitle}>
              Explore the rich cultural heritage of La Union through its finest handcrafted products and talented artisans.
            </Text>
          </View>

          {/* Stats Section */}
          <View style={styles.highlightBox}>
            <Text style={styles.highlightTitle}>Our Growing Community</Text>
            <Text style={styles.highlightText}>
              Join our thriving marketplace where tradition meets innovation.
            </Text>
            <View style={styles.statsContainer}>
              {stats.map((stat, index) => (
                <View key={index} style={styles.statItem}>
                  <Text style={styles.statNumber}>{stat.number}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Location Selector */}
          <View style={styles.divider} />
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderTitle}>Explore by Location</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.discoverContainer}
          >
            {locations.map((location, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => setActiveIndex(index)}
                style={[
                  styles.discoverText,
                  activeIndex === index && styles.activeDiscoverText
                ]}
              >
                <Text
                  style={[
                    styles.discoverText,
                    activeIndex === index && { opacity: 1 }
                  ]}
                >
                  {location}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Products Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderTitle}>Popular Products</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Products")}>
              <Text style={styles.sectionHeaderLink}>See All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.productContainer}>
            <ProductList />
          </View>

          {/* Events Section */}
          {renderEvents()}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Home;