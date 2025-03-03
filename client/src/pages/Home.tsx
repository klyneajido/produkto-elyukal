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
  Modal,
  RefreshControl,
  Animated
} from 'react-native';
import styles from '../assets/style/homeStyle.js';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';

import {
  faSearch,
} from '@fortawesome/free-solid-svg-icons';

import AsyncStorage from '@react-native-async-storage/async-storage';
import ProductList from '../components/ProductList.tsx';
import { RootStackParamList, TabProps } from '../../types/types.ts';
import EventList from '../components/EventList.tsx';
import PopularProducts from '../components/PopularList.tsx';

const Home: React.FC<TabProps> = ({ onScroll }) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  // const { user } = useAuth();
  const [searchText, setSearchText] = useState<string>('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        navigation.navigate("Login");
      }
    };
    checkAuth();
  }, []);
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

          {/* Events Section */}
          <View style={styles.eventsContainer}>
            <View style={styles.divider} />
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionHeaderTitle}>Upcoming Events</Text>
              <TouchableOpacity onPress={() => setShowCalendar(true)}>
                <Text style={styles.sectionHeaderLink}>View Calendar</Text>
              </TouchableOpacity>
            </View>
            <EventList />
          </View>

        </View>
        {/* Footer Section */}
        <View style={styles.footerContainer}>
          <View style={styles.footerTop}>
            <Image
              source={require('../assets/img/logo.png')}
              style={styles.footerLogo}
              resizeMode="contain"
            />
            <Text style={styles.footerTagline}>Connecting You to La Union's Local Products</Text>
          </View>

          <View style={styles.footerDivider} />

          <View style={styles.footerLinks}>
            <TouchableOpacity style={styles.footerLinkItem}>
              <Text style={styles.footerLinkText}>About Us</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.footerLinkItem}>
              <Text style={styles.footerLinkText}>Contact</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.footerLinkItem}>
              <Text style={styles.footerLinkText}>Terms</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.footerLinkItem}>
              <Text style={styles.footerLinkText}>Privacy</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.socialLinks}>
            <TouchableOpacity style={styles.socialIcon}>
              <Image
                style={styles.image}
                source={require('../assets/img/facebook-icon.png')}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialIcon}>
              <Image
                style={styles.image}
                source={require('../assets/img/instagram-icon.png')}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialIcon}>
              <Image
                style={styles.image}
                source={require('../assets/img/twitter-icon.png')}
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.copyright}>© 2025 Produkto Elyukal.</Text>
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
};

export default Home;