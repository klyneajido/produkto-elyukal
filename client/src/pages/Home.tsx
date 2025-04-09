import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  SafeAreaView,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  RefreshControl,
  Animated,
  BackHandler,
  Dimensions
} from 'react-native';
import styles from '../assets/style/homeStyle.js';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';

import {
  faSearch,
} from '@fortawesome/free-solid-svg-icons';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList, TabProps } from '../../types/types.ts';
import PopularProducts from '../components/PopularList.tsx';
import Chatbot from '../components/ChatBot.tsx';
import { useAuth } from '../../contextAuth.tsx';
import Footer from '../components/Footer.tsx';

const { width } = Dimensions.get('window');

const Home: React.FC<TabProps> = ({ onScroll }) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [searchText, setSearchText] = useState<string>('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem("token");
      console.log("Home - User:", user, "Token:", token); // Add logging
      if (!token && !user) { // Check user instead of just token
        console.log("Home - No token and no user, navigating to Login");
        navigation.navigate("Login");
      }
    };
    checkAuth();
  }, [navigation, user]);

  //categories
  const categories = [
    { name: 'Handcraft', image: require('../assets/img/handcraft.png'), count: '50+', screen: 'Products' },
    { name: 'Furniture', image: require('../assets/img/furniture.jpg'), count: '30+', screen: 'Products' },
    { name: 'Food', image: require('../assets/img/food.jpg'), count: '20+', screen: 'Products' },
    { name: 'Pottery', image: require('../assets/img/pottery.jpg'), count: '15+', screen: 'Products' },
  ];

  const handleCategoryPress = (screen: string, categoryName: string) => {
    navigation.navigate(screen, { category: categoryName });
  }

  const onScrollEnd = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / (width * 0.9));
    setActiveIndex(index);
  }

  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (activeIndex + 1) % categories.length;
      scrollRef.current?.scrollTo({ x: nextIndex * width * 0.9, animated: true });
      setActiveIndex(nextIndex);
    }, 3000);
    return () => clearInterval(interval);
  }, [activeIndex]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log("Page refreshed!");
    } catch (error) {
      console.error("Refresh failed:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const stats = [
    { number: '1', label: 'City' },
    { number: '19', label: 'Municipalities' },
    { number: '45+', label: 'Local Stores' },
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
      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#0000ff"]}
            tintColor="#0000ff"
          />
        }
      >
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
                placeholder="Search here..."
                placeholderTextColor="#888"
              />
            </View>
          </View>
          {/* Categories */}
          <View style={styles.carouselContainer}>
            <ScrollView
              ref={scrollRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={onScrollEnd}
              style={styles.carouselScroll}
            >
              {categories.map((category, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleCategoryPress(category.screen, category.name)}
                  style={styles.carouselItem}
                >
                  <Image
                    source={category.image}
                    style={styles.carouselImage}
                  />
                  <View style={styles.carouselOverlay}>
                    <Text style={styles.carouselTitle}>{category.name}</Text>
                    <Text style={styles.carouselSubtitle}>
                      Explore {category.count} Items
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View style={styles.paginationDots}>
              {categories.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    { backgroundColor: index === activeIndex ? '#ffa726' : '#ccc' },
                  ]}
                />
              ))}
            </View>
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

          {/* Enhanced Product Promotion */}
          <View style={styles.divider} />
          <View style={styles.enhancedPromo}>
            <View style={styles.promoPattern}>
              {/* Decorative elements */}
              <View style={[styles.patternCircle, styles.patternCircle1]} />
              <View style={[styles.patternCircle, styles.patternCircle2]} />
              <View style={[styles.patternCircle, styles.patternCircle3]} />
            </View>

            <View style={styles.promoTextContainer}>
              <Text style={styles.promoTagline}>LOCALLY CRAFTED</Text>
              <Text style={styles.promoHeadline}>Support Local Products</Text>
              <Text style={styles.promoSubtext}>
                Empowering La Union's skilled artisans and preserving generations of craftsmanship.
              </Text>

              <View style={styles.promoStats}>
                <View style={styles.promoStatItem}>
                  <Text style={styles.promoStatNumber}>85%</Text>
                  <Text style={styles.promoStatLabel}>Hidden local gems</Text>
                </View>
                <View style={styles.promoStatItem}>
                  <Text style={styles.promoStatNumber}>12+</Text>
                  <Text style={styles.promoStatLabel}>Unique traditions</Text>
                </View>
              </View>
            </View>

            <View style={styles.promoImageContainer}>
              <Image
                source={require('../assets/img/feature4.png')}
                style={styles.promoMainImage}
              />
              <View style={styles.imageBadge}>
                <Text style={styles.imageBadgeText}>100% Local</Text>
              </View>
            </View>
          </View>



          {/* Products Section */}
          <View style={styles.divider} />
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderTitle}>Popular Products</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Products")}>
              <Text style={styles.sectionHeaderLink}>See All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.productContainer}>
            <PopularProducts />
          </View>
        </View>
        {/* Footer Section */}
        <View style={styles.footerContainer}>
          <Footer/>
        </View>
      </Animated.ScrollView>
      <Chatbot />
    </SafeAreaView>
  );
};

export default Home;