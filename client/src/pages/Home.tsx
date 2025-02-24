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
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { BASE_URL } from '../config/config.ts';
import {
  faSearch,
 
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../contextAuth.tsx';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ProductList from '../components/ProductList.tsx';
import { RootStackParamList, Event, Highlight } from '../../types/types.ts';
import EventList from '../components/EventList.tsx';

const Home: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  // const { user } = useAuth();
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
    fetchHighlights();
  }, []);

  const fetchHighlights = async () => {
    try {
      const response = await fetch(`${BASE_URL}/highlights/fetch_highlights`);
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


  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Top Section with Search */}
          <View style={styles.topContainer}>
            <View style={styles.searchBarContainer}>
              <FontAwesomeIcon
                icon={faSearch}
                size={16}
                color="#888"
                style={styles.searchIcon}
              />
              <TextInput
                style={styles.searchBar}
                onChangeText={setSearchText}
                value={searchText}
                placeholder="Explore your deepest darkest desires >;)"
                placeholderTextColor="#888"
              />
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
          <View style={styles.eventsContainer}>
            <View style={styles.divider} />
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionHeaderTitle}>Upcoming Events</Text>
              <TouchableOpacity onPress={() => navigation.navigate('EventDetails', { eventId: 'someEventId' })}>
                <Text style={styles.sectionHeaderLink}>View Calendar</Text>
              </TouchableOpacity>
            </View>
            {EventList()}
            </View>
         
          </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Home;