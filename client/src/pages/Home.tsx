import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  SafeAreaView,
  Image,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import styles from '../assets/style/homeStyle.js';
import { ParamListBase, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'; 
import { faCalendar, faMapMarkedAlt, faStar, faTicketAlt, faSliders, faClock } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../contextAuth.tsx';
import AsyncStorage from '@react-native-async-storage/async-storage';

import ProductList from '../components/ProductList.tsx';

interface User {
  email: string,
  first_name: string,
  last_name: string,
  profile: string,
}
const Home: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const { user } = useAuth();
  const [searchText, setSearchText] = useState<string>('');

  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        navigation.navigate("Login");
      }
    };
    checkAuth();
  }, []);

  const [activeIndex, setActiveIndex] = useState(0);
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

  const events = [
    {
      id: 1,
      name: 'Craft Fair Extravaganza',
      description: 'Annual showcase of local artisan crafts and handmade goods',
      location: 'Bacnotan Town Center',
      date: 'May 15, 2024',
      time: '10:00 AM - 6:00 PM',
      image: require('../assets/img/events/craft-fair.jpg'),
      category: 'Handcraft'
    },
    {
      id: 2,
      name: 'Culinary Arts Festival',
      description: 'Celebrating local cuisine with cooking demos and tastings',
      location: 'San Fernando Plaza',
      date: 'June 20, 2024',
      time: '12:00 PM - 9:00 PM',
      image: require('../assets/img/events/culinary-arts.png'),
      category: 'Food'
    },
    {
      id: 3,
      name: 'Pottery Master Class',
      description: 'Hands-on workshop with renowned local ceramic artists',
      location: 'Aringay Community Hall',
      date: 'July 5, 2024',
      time: '2:00 PM - 5:00 PM',
      image: require('../assets/img/events/pottery.jpg'),
      category: 'Pottery'
    }
  ];


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
                    onPress={() => {/* Handle category selection */}}
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
              Explore the rich cultural heritage of La Union through its finest handcrafted products and talented artisans. Each piece tells a unique story of tradition and innovation.
            </Text>
          </View>

          {/* Stats Section */}
          <View style={styles.highlightBox}>
            <Text style={styles.highlightTitle}>Our Growing Community</Text>
            <Text style={styles.highlightText}>
              Join our thriving marketplace where tradition meets innovation. We connect local artisans with global audiences, preserving cultural heritage while fostering economic growth.
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

          {/* Featured Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderTitle}>Featured Collections</Text>
            <TouchableOpacity>
              <Text style={styles.sectionHeaderLink}>View All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.featuredContainer}>
            <View style={styles.square1}>
              <Image style={styles.featureImage} source={require('../assets/img/final.jpg')} />
            </View>
            <View style={styles.squaresContainer}>
              <View style={styles.squares}>
                <View style={styles.square2}>
                  <Image style={styles.featureImage} source={require('../assets/img/feature2.png')} />
                </View>
              </View>
              <View style={styles.squares}>
                <View style={styles.square3}>
                  <Image style={styles.featureImage} source={require('../assets/img/feature3.png')} />
                </View>
                <View style={styles.square3}>
                  <Image style={styles.featureImage} source={require('../assets/img/feature4.png')} />
                </View>
              </View>
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
            <TouchableOpacity>
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
                  onPress={() => navigation.navigate('EventDetails', { event })}
                >
                  <Image source={event.image} style={styles.eventImageLarge} />
                  <View style={styles.eventOverlay}>
                    <Text style={styles.eventCategory}>{event.category}</Text>
                  </View>
                  <View style={styles.eventDetailsLarge}>
                    <View>
                      <Text style={styles.eventNameLarge}>{event.name}</Text>
                      <Text style={styles.eventDescriptionLarge} numberOfLines={2}>
                        {event.description}
                      </Text>
                    </View>
                    <View style={styles.eventMetaContainer}>
                      <View style={styles.eventMetaItem}>
                        <FontAwesomeIcon icon={faCalendar} size={16} color="#666" />
                        <Text style={styles.eventMetaText}>{event.date}</Text>
                      </View>
                      <View style={styles.eventMetaItem}>
                        <FontAwesomeIcon icon={faClock} size={16} color="#666" />
                        <Text style={styles.eventMetaText}>{event.time}</Text>
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
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Home;
