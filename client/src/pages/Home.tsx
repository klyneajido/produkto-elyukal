import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  SafeAreaView,
  Image,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Dimensions,
  ActivityIndicator,
  Alert,
  Animated,
  RefreshControl,
} from 'react-native';
import styles from '../assets/style/homeStyle.js';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
  faSearch,
  faExclamationTriangle,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList, TabProps, Product, Municipality } from '../../types/types.ts';
import PopularProducts from '../components/PopularList.tsx';
import Chatbot from '../components/ChatBot.tsx';
import { useAuth } from '../../contextAuth.tsx';
import Footer from '../components/Footer.tsx';
import axios from 'axios';
import { BASE_URL } from '../config/config.ts';
import { COLORS } from '../assets/constants/constant.ts';

const { width } = Dimensions.get('window');

type Category = {
  name: string;
  image: any;
  count: string;
  screen: keyof RootStackParamList;
};

// Define SearchResult as a generic type
interface SearchResult<T> {
  item: T;
  distance: number;
  isSubstring: boolean;
}

// Define the result type for navigation
type NavigationSearchResult = {
  id: string;
  name: string;
  type: 'municipality' | 'product';
  screen: keyof RootStackParamList;
  params: any;
};

// Define error state interface
interface ErrorState {
  visible: boolean;
  message: string;
  type: 'network' | 'auth' | 'search' | 'general';
}

const Home: React.FC<TabProps> = ({ onScroll }) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [searchText, setSearchText] = useState<string>('');
  const [inputText, setInputText] = useState<string>(''); // For debouncing
  const [activeIndex, setActiveIndex] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [searchResults, setSearchResults] = useState<NavigationSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<ErrorState>({ 
    visible: false, 
    message: '', 
    type: 'general' 
  });
  const { user } = useAuth();
  const scrollRef = useRef<ScrollView>(null);
  
  // Cache for search results to improve performance
  const [searchCache, setSearchCache] = useState<{[key: string]: NavigationSearchResult[]}>({});

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        console.log("Home - User:", user, "Token:", token);
        if (!token && !user) {
          console.log("Home - No token and no user, navigating to Login");
          navigation.navigate("Login");
        }
      } catch (error) {
        console.log("Authentication check error:", error);
        setError({
          visible: true,
          message: "Failed to validate your session. Please try logging in again.",
          type: 'auth'
        });
      }
    };
    checkAuth();
  }, [navigation, user]);

  // Categories (unchanged)
  const categories: Category[] = [
    { name: 'Handicrafts', image: require('../assets/img/handicrafts.jpg'), count: '50+', screen: 'Products' },
    { name: 'Food Products', image: require('../assets/img/food_products.png'), count: '40+', screen: 'Products' },
    { name: 'Textiles', image: require('../assets/img/textiles.jpg'), count: '30+', screen: 'Products' },
    { name: 'Souvenirs', image: require('../assets/img/souvenirs.jpg'), count: '25+', screen: 'Products' },
    { name: 'Agricultural Products', image: require('../assets/img/agricultural_products.jpg'), count: '20+', screen: 'Products' },
    { name: 'Beverages', image: require('../assets/img/beverages.jpg'), count: '15+', screen: 'Products' },
    { name: 'Clothing', image: require('../assets/img/clothing.jpg'), count: '35+', screen: 'Products' },
    { name: 'Accessories', image: require('../assets/img/accessories.jpg'), count: '45+', screen: 'Products' },
  ];

  // Fuzzy search function optimized
  const fuzzySearch = useCallback(<T,>(
    query: string,
    items: T[],
    getFields: (item: T) => string[],
    maxDistanceRatio: number = 0.4
  ): SearchResult<T>[] => {
    if (!query.trim()) return [];
    
    const lowerQuery = query.toLowerCase().trim();
    
    // Fast path for short queries - only exact matches
    if (lowerQuery.length < 3) {
      return items
        .map(item => {
          const fields = getFields(item)
            .filter(field => field !== null && field !== undefined)
            .map(field => field.toLowerCase().trim());
          
          const isSubstring = fields.some(field => field && field.startsWith(lowerQuery));
          
          return isSubstring 
            ? { item, distance: 0, isSubstring }
            : null;
        })
        .filter((result): result is { item: T; distance: number; isSubstring: true } => result !== null);
    }
    
    // Levenshtein distance calculation for longer queries
    const levenshteinDistance = (s1: string, s2: string): number => {
      if (s1.length === 0) return s2.length;
      if (s2.length === 0) return s1.length;
      
      // Early return if strings are too different in length
      const lengthDiff = Math.abs(s1.length - s2.length);
      if (lengthDiff > s1.length * maxDistanceRatio) {
        return Infinity;
      }
      
      const m = s1.length;
      const n = s2.length;
      const matrix = Array(m + 1)
        .fill(null)
        .map(() => Array(n + 1).fill(0));

      for (let i = 0; i <= m; i++) matrix[i][0] = i;
      for (let j = 0; j <= n; j++) matrix[0][j] = j;

      for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
          const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
          matrix[i][j] = Math.min(
            matrix[i - 1][j] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j - 1] + cost
          );
        }
      }
      return matrix[m][n];
    };

    // Limit the number of items we process to prevent UI freezing
    const maxItemsToProcess = 200;
    const itemsToProcess = items.length > maxItemsToProcess ? 
      items.slice(0, maxItemsToProcess) : items;

    const results: SearchResult<T>[] = [];
    
    itemsToProcess.forEach((item) => {
      const fields = getFields(item)
        .filter((field) => field !== null && field !== undefined)
        .map((field) => field.toLowerCase().trim());

      let bestDistance = Infinity;
      let isSubstring = false;

      // Check each field for matches
      for (const field of fields) {
        if (!field) continue;
        
        // First check if it's a substring for fast matching
        if (field.includes(lowerQuery)) {
          isSubstring = true;
          bestDistance = 0;
          break;
        }
        
        // Only calculate distance if necessary and if the field isn't too long
        if (field.length <= 50) {
          const distance = levenshteinDistance(lowerQuery, field);
          const maxLength = Math.max(lowerQuery.length, field.length);
          const normalizedDistance = maxLength ? distance / maxLength : 1;
          
          if (normalizedDistance < bestDistance) {
            bestDistance = normalizedDistance;
          }
        }
      }

      if (isSubstring || bestDistance <= maxDistanceRatio) {
        results.push({ item, distance: bestDistance, isSubstring });
      }
    });

    // Sort results - exact matches first, then by distance
    results.sort((a, b) => {
      if (a.isSubstring && !b.isSubstring) return -1;
      if (!a.isSubstring && b.isSubstring) return 1;
      return a.distance - b.distance;
    });

    // Limit results to prevent UI issues
    return results.slice(0, 15);
  }, []);

  // Improved debounce search input with cleanup
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchText(inputText);
    }, 500);

    return () => clearTimeout(handler);
  }, [inputText]);

  // Clear error after a timeout
  useEffect(() => {
    if (error.visible) {
      const timeout = setTimeout(() => {
        setError(prev => ({ ...prev, visible: false }));
      }, 5000);
      
      return () => clearTimeout(timeout);
    }
  }, [error.visible]);

  // Optimized search handler with caching
  const handleSearch = useCallback(async (text: string) => {
    // Clear search if empty text
    if (text.trim() === '') {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    
    // Check cache first
    const cacheKey = text.toLowerCase().trim();
    if (searchCache[cacheKey]) {
      setSearchResults(searchCache[cacheKey]);
      setIsSearching(false);
      return;
    }
    
    let results: NavigationSearchResult[] = [];
    let hasError = false;

    try {
      // Fetch municipalities
      const munResponse = await axios.get(`${BASE_URL}/municipalities/fetch_municipalities`, {
        timeout: 5000 // Add reasonable timeout
      });
      const municipalities: Municipality[] = munResponse.data || [];

      // Search municipalities
      const filteredMunicipalities = municipalities
        .filter(mun => mun.name.toLowerCase().includes(text.toLowerCase()))
        .map(mun => ({
          id: mun.id.toString(),
          name: mun.name,
          type: 'municipality' as const,
          screen: 'MunicipalityDetail' as keyof RootStackParamList,
          params: { id: mun.id, name: mun.name, image_url: mun.image_url },
        }));

      results.push(...filteredMunicipalities);
    } catch (error) {
      console.log('Municipality search error:', error);
      hasError = true;
      
      // More specific error handling
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        let errorMessage = 'Failed to search municipalities';
        
        if (!error.response) {
          setError({
            visible: true,
            message: 'Network error. Please check your connection and try again.',
            type: 'network'
          });
        } else if (status === 500) {
          setError({
            visible: true,
            message: 'Our servers are experiencing issues. Please try again later.',
            type: 'general'
          });
        } else if (status === 401 || status === 403) {
          setError({
            visible: true,
            message: 'You need to log in again to continue.',
            type: 'auth'
          });
        } else {
          setError({
            visible: true,
            message: errorMessage,
            type: 'search'
          });
        }
      } else {
        setError({
          visible: true,
          message: 'An unexpected error occurred. Please try again.',
          type: 'general'
        });
      }
    }

    try {
      // Fetch products with timeout
      const prodResponse = await axios.get(`${BASE_URL}/products/fetch_products`, {
        timeout: 5000
      });
      const products: Product[] = prodResponse.data.products || [];

      // Search products with optimized fuzzy search
      const productSearchResults = fuzzySearch<Product>(
        text,
        products,
        (product) => [
          product.name || '',
          product.stores?.name || '',
          product.stores?.town || '',
        ],
        0.4
      );

      const filteredProducts = productSearchResults.map(result => ({
        id: result.item.id.toString(),
        name: result.item.name,
        type: 'product' as const,
        screen: 'ProductDetails' as keyof RootStackParamList,
        params: { product: result.item },
      }));

      results.push(...filteredProducts);
    } catch (error) {
      console.log('Product search error:', error);
      hasError = true;
      
      if (!(error as { visible?: boolean })?.visible) {
        if (axios.isAxiosError(error)) {
          if (!error.response) {
            setError({
              visible: true,
              message: 'Network error. Please check your connection and try again.',
              type: 'network'
            });
          } else if (error.response.status === 500) {
            setError({
              visible: true,
              message: 'Our servers are experiencing issues. Please try again later.',
              type: 'general'
            });
          } else {
            setError({
              visible: true,
              message: 'Failed to search products. Please try again later.',
              type: 'search'
            });
          }
        } else {
          setError({
            visible: true,
            message: 'An unexpected error occurred. Please try again.',
            type: 'general'
          });
        }
      }
    }

    // Only cache successful results
    if (!hasError) {
      // Update cache with new results
      setSearchCache(prev => ({
        ...prev,
        [cacheKey]: results
      }));
    }
    
    setSearchResults(results);
    setIsSearching(false);
  }, [fuzzySearch, searchCache]);

  useEffect(() => {
    handleSearch(searchText);
  }, [searchText, handleSearch]);

  const handleSearchResultPress = useCallback((result: NavigationSearchResult) => {
    navigation.navigate(result.screen, result.params);
    setSearchText('');
    setInputText('');
    setSearchResults([]);
  }, [navigation]);

  const handleCategoryPress = useCallback((
    screen: keyof RootStackParamList,
    categoryName: string
  ) => {
    navigation.navigate(screen, { category: categoryName } as any);
  }, [navigation]);

  const onScrollEnd = useCallback((event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const itemWidth = width * 0.9 + 10;
    const index = Math.round(contentOffsetX / itemWidth);
    setActiveIndex(index);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % categories.length;
        scrollRef.current?.scrollTo({
          x: nextIndex * (width * 0.9 + 10),
          animated: true,
        });
        return nextIndex;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [categories.length]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Clear search cache on refresh for fresh data
      setSearchCache({});
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log("Page refreshed!");
    } catch (error) {
      console.log("Refresh failed:", error);
      setError({
        visible: true,
        message: "Couldn't refresh the content. Please try again.",
        type: 'network'
      });
    } finally {
      setRefreshing(false);
    }
  }, []);

  const dismissError = useCallback(() => {
    setError({ visible: false, message: '', type: 'general' });
  }, []);

  const stats = [
    { number: '1', label: 'City' },
    { number: '19', label: 'Municipalities' },
    { number: '45+', label: 'Local Stores' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topContainer}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Welcome to Produkto Elyu-kal!</Text>
          <Text style={styles.headerSubtitle}>Explore the best of La Union</Text>
        </View>
        <View style={styles.searchBarContainer}>
          <FontAwesomeIcon
            icon={faSearch}
            size={16}
            color="#888"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchBar}
            onChangeText={setInputText}
            value={inputText}
            placeholder="Search towns or products..."
            placeholderTextColor="#888"
          />
        </View>
      </View>
      
      {/* Error Banner */}
      {error.visible && (
        <View style={[
          styles.errorContainer, 
          error.type === 'network' ? styles.errorNetwork :
          error.type === 'auth' ? styles.errorAuth :
          error.type === 'search' ? styles.errorSearch :
          styles.errorGeneral
        ]}>
          <View style={styles.errorContent}>
            <FontAwesomeIcon
              icon={faExclamationTriangle}
              size={18}
              color="#FFF"
              style={styles.errorIcon}
            />
            <Text style={styles.errorText}>{error.message}</Text>
          </View>
          <TouchableOpacity onPress={dismissError} style={styles.errorDismiss}>
            <FontAwesomeIcon icon={faTimes} size={16} color="#FFF" />
          </TouchableOpacity>
        </View>
      )}
      
      {/* Search Loading Indicator */}
      {isSearching && (
        <View style={styles.searchResultsContainer}>
          <ActivityIndicator size="small" color={COLORS.primary} style={styles.searchResultLoader} />
          <Text style={styles.searchResultText}>Searching...</Text>
        </View>
      )}
      
      {/* Search Results */}
      {searchResults.length > 0 && !isSearching && (
        <View style={styles.searchResultsContainer}>
          <FlatList
            data={searchResults}
            keyExtractor={(item, index) => `${item.id}-${index}`}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.searchResultItem}
                onPress={() => handleSearchResultPress(item)}
              >
                <Text style={styles.searchResultText}>
                  {item.name} <Text style={styles.searchResultType}>({item.type})</Text>
                </Text>
              </TouchableOpacity>
            )}
            style={styles.searchResultsList}
            initialNumToRender={5}
            maxToRenderPerBatch={10}
            windowSize={5}
            removeClippedSubviews={true}
          />
        </View>
      )}
      
      {/* No Results Message */}
      {inputText.trim().length > 0 && searchResults.length === 0 && !isSearching && (
        <View style={styles.searchResultsContainer}>
          <Text style={styles.noResultsText}>
            No results found for "{inputText}"
          </Text>
        </View>
      )}
      
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
          {/* Categories */}
          <View style={styles.carouselContainer}>
            <ScrollView
              ref={scrollRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={onScrollEnd}
              style={styles.carouselScroll}
              contentContainerStyle={{
                paddingHorizontal: (width - width * 0.9) / 2,
              }}
              snapToInterval={width * 0.9 + 10}
              snapToAlignment="center"
              decelerationRate="fast"
            >
              {categories.map((category, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleCategoryPress(category.screen, category.name)}
                  style={styles.carouselItem}
                >
                  <Image source={category.image} style={styles.carouselImage} />
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
          {/* Stats Section */}
          <View style={styles.highlightBox}>
            <Text style={styles.highlightTitle}>Discover Local Artistry</Text>
            <Text style={styles.highlightText}>
              Explore the rich cultural heritage of La Union through its finest handcrafted products and talented artisans.
            </Text>
            <View style={styles.statsContainer}>
              {stats.map((stat, index) => (
                <View key={index} style={styles.statItem}>
                  <Text style={styles.statNumber}>{stat.number}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </View>
              ))}
            </View>
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.exploreButton} onPress={() => navigation.navigate("Tabs", { screen: "Maps" })}>
                <Text style={styles.exploreText}>Explore Now</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.enhancedPromo}>
            <View style={styles.promoPattern}>
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
          <Footer />
        </View>
      </Animated.ScrollView>
      <Chatbot />
    </SafeAreaView>
  );
};

export default Home;
