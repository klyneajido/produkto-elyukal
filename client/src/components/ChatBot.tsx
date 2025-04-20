import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
  PanResponder,
  ActivityIndicator,
  Image,
} from 'react-native';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faClose, faPaperPlane, faChevronDown, faInfoCircle, faXmark, faStar, faStore } from '@fortawesome/free-solid-svg-icons';
import { BASE_URL, RASA_URL } from '../config/config';
import { COLORS, FONT_SIZE, FONTS } from '../assets/constants/constant';
import FastImage from 'react-native-fast-image';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface Message {
  text: string;
  sender: 'user' | 'bot';
  timestamp: number;
  products?: Product[];
  stores?: Store[];
  isTyping?: boolean;
  isError?: boolean;
}

interface Product {
  id: string;
  name: string;
  description?: string;
  category?: string;
  price_min?: number;
  price_max?: number;
  ar_asset_url?: string;
  image_urls?: string[];
  address?: string;
  in_stock?: boolean;
  store_id?: string;
  average_rating?: string;
  total_reviews?: number;
  isLoading?: boolean;
}

interface Store {
  id: string;
  name: string;
  description?: string;
  address?: string;
  town?: string;
  store_image?: string;
  rating?: number;
  type?: string;
  operating_hours?: string;
  phone?: string;
  isLoading?: boolean;
  products?: Product[];
}

const { width, height } = Dimensions.get('window');

const CHAT_BUTTON_SIZE = 70;
const CHAT_BUTTON_RADIUS = CHAT_BUTTON_SIZE / 2;
const BUTTON_POSITION_KEY = 'chatbot_button_position';
const EDGE_PADDING = 10;
const TYPING_DOTS_DURATION = 500;
const API_BASE_URL = BASE_URL;

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>('');
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [typingAnimation] = useState(new Animated.Value(0));
  const [productInfoMap, setProductInfoMap] = useState<{ [name: string]: Product }>({});
  const [storeInfoMap, setStoreInfoMap] = useState<{ [name: string]: Store }>({});
  const [showBetaNotice, setShowBetaNotice] = useState(true);

  const navigation = useNavigation();
  const flatListRef = useRef<FlatList>(null);
  const position = useRef(new Animated.ValueXY({
    x: width - CHAT_BUTTON_SIZE - EDGE_PADDING,
    y: height - 180
  })).current;

  const isDragging = useRef(false);

  useEffect(() => {
    loadButtonPosition();

    const dimensionsListener = Dimensions.addEventListener('change', () => {
      const { width: newWidth, height: newHeight } = Dimensions.get('window');
      const currentPos = getCurrentPosition();

      const newX = Math.min(Math.max(EDGE_PADDING, currentPos.x), newWidth - CHAT_BUTTON_SIZE - EDGE_PADDING);
      const newY = Math.min(Math.max(EDGE_PADDING, currentPos.y), newHeight - CHAT_BUTTON_SIZE - EDGE_PADDING);

      position.setValue({ x: newX, y: newY });
      saveButtonPosition();
    });

    return () => {
      dimensionsListener.remove();
    };
  }, []);

  useEffect(() => {
    const startTypingAnimation = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(typingAnimation, {
            toValue: 1,
            duration: TYPING_DOTS_DURATION,
            useNativeDriver: true,
          }),
          Animated.timing(typingAnimation, {
            toValue: 0,
            duration: TYPING_DOTS_DURATION,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    if (messages.some(msg => msg.isTyping)) {
      startTypingAnimation();
    } else {
      typingAnimation.setValue(0);
    }
  }, [messages, typingAnimation]);

  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.products && lastMessage.products.length > 0) {
      lastMessage.products.forEach(product => {
        if (!productInfoMap[product.name]) {
          setProductInfoMap(prev => ({
            ...prev,
            [product.name]: {
              id: '',
              name: product.name,
              isLoading: true
            }
          }));

          searchProductByName(product.name);
        }
      });
    }
  }, [messages]);

  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.stores && lastMessage.stores.length > 0) {
      lastMessage.stores.forEach(store => {
        if (!storeInfoMap[store.name]) {
          setStoreInfoMap(prev => ({
            ...prev,
            [store.name]: {
              id: '',
              name: store.name,
              isLoading: true
            }
          }));

          searchStoreByName(store.name);
        }
      });
    }
  }, [messages]);

  const loadButtonPosition = async () => {
    try {
      const savedPosition = await AsyncStorage.getItem(BUTTON_POSITION_KEY);
      if (savedPosition) {
        const { x, y } = JSON.parse(savedPosition);
        const validX = Math.min(Math.max(EDGE_PADDING, x), width - CHAT_BUTTON_SIZE - EDGE_PADDING);
        const validY = Math.min(Math.max(EDGE_PADDING, y), height - CHAT_BUTTON_SIZE - EDGE_PADDING);
        position.setValue({ x: validX, y: validY });
      }
    } catch (error) {
      console.log('Error loading button position:', error);
    }
  };

  const getCurrentPosition = () => {
    return {
      x: (position.x as any)._value || width - CHAT_BUTTON_SIZE - EDGE_PADDING,
      y: (position.y as any)._value || height - 180
    };
  };

  const saveButtonPosition = async () => {
    try {
      const currentPos = getCurrentPosition();
      const positionToSave = JSON.stringify(currentPos);
      await AsyncStorage.setItem(BUTTON_POSITION_KEY, positionToSave);
    } catch (error) {
      console.log('Error saving button position:', error);
    }
  };

  const searchProductByName = async (productName: string) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/products/search_products/${encodeURIComponent(productName)}`);
      console.log(`API response for ${productName}:`, JSON.stringify(response.data, null, 2));

      if (response.data && response.data.products && response.data.products.length > 0) {
        const matchedProduct = response.data.products.find(
          (p: Product) => p.name.toLowerCase() === productName.toLowerCase()
        ) || response.data.products[0];

        setProductInfoMap(prev => ({
          ...prev,
          [productName]: {
            ...matchedProduct,
            isLoading: false
          }
        }));
      } else {
        setProductInfoMap(prev => ({
          ...prev,
          [productName]: {
            id: '',
            name: productName,
            isLoading: false
          }
        }));
      }
    } catch (error) {
      console.log(`Error searching for product ${productName}:`, error);
      setProductInfoMap(prev => ({
        ...prev,
        [productName]: {
          id: '',
          name: productName,
          isLoading: false
        }
      }));
    }
  };

  const searchStoreByName = async (storeName: string) => {
    try {
      console.log(`Searching for store: "${storeName}"`);

      // Clean the store name by removing emojis and special characters but preserve parentheses
      const cleanStoreName = storeName
        .replace(/[\u{1F600}-\u{1F64F}]/gu, '') // Remove emojis
        .replace(/[\u{1F300}-\u{1F5FF}]/gu, '') // Remove misc symbols and pictographs
        .replace(/[\u{1F680}-\u{1F6FF}]/gu, '') // Remove transport and map symbols
        .replace(/[\u{2700}-\u{27BF}]/gu, '')   // Remove dingbats
        .replace(/[^\w\s()-]/g, '')             // Remove special characters except ()- and spaces
        .trim();                                // Remove leading/trailing whitespace

      const searchResponse = await axios.get(
        `${BASE_URL}/stores/search_stores/${encodeURIComponent(cleanStoreName)}`,
        {
          headers: {
            'Accept-Encoding': 'application/json',
          }
        }
      );

      return searchResponse.data?.stores?.[0] || null;
    } catch (error) {
      console.error(`Error searching for store "${storeName}":`, error);
      return null;
    }
  };

  const fetchStoreByName = async (storeName: string): Promise<Store | null> => {
    try {
      const response = await axios.get(`${BASE_URL}/stores/fetch_stores`);
      const stores = response.data;

      const matchingStore = stores.find(
        (store: Store) => store.name.toLowerCase() === storeName.toLowerCase()
      );

      if (matchingStore) {
        // Fetch products for this store
        const productsResponse = await axios.get(`${BASE_URL}/products/fetch_products`);
        console.log('ChatBot - Total products fetched:', productsResponse.data.products?.length || 0);
        
        const storeProducts = productsResponse.data.products.filter(
          (product: Product) => product.store_id === (matchingStore.id || matchingStore.store_id)
        );
        console.log('ChatBot - Filtered products for store:', storeProducts.length);

        const storeWithProducts = {
          id: matchingStore.id || matchingStore.store_id,
          name: matchingStore.name,
          description: matchingStore.description,
          store_image: matchingStore.image_url || matchingStore.store_image,
          rating: matchingStore.rating,
          type: matchingStore.type,
          operating_hours: matchingStore.operating_hours,
          phone: matchingStore.phone,
          products: storeProducts,
        };

        console.log('ChatBot - Store object with products:', {
          store_id: storeWithProducts.id,
          name: storeWithProducts.name,
          products_count: storeWithProducts.products.length
        });

        return storeWithProducts;
      }

      const searchResponse = await axios.get(`${BASE_URL}/stores/search_stores/${encodeURIComponent(storeName)}`);
      if (searchResponse.data?.stores?.length > 0) {
        const store = searchResponse.data.stores[0];
        // Fetch products for this store
        const productsResponse = await axios.get(`${BASE_URL}/products/fetch_products`);
        const storeProducts = productsResponse.data.products.filter(
          (product: Product) => product.store_id === (store.id || store.store_id)
        );

        return {
          id: store.id || store.store_id,
          name: store.name,
          description: store.description,
          store_image: store.image_url || store.store_image,
          rating: store.rating,
          type: store.type,
          operating_hours: store.operating_hours,
          phone: store.phone,
          products: storeProducts,
        };
      }

      return null;
    } catch (error) {
      console.error('Error fetching store:', error);
      return null;
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 2 || Math.abs(gestureState.dy) > 2;
      },
      onPanResponderGrant: () => {
        isDragging.current = true;
        const currentPos = getCurrentPosition();
        position.setOffset({
          x: currentPos.x,
          y: currentPos.y
        });
        position.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event(
        [null, { dx: position.x, dy: position.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: (_, gestureState) => {
        position.flattenOffset();

        const currentPos = getCurrentPosition();

        let newX = Math.min(Math.max(EDGE_PADDING, currentPos.x), width - CHAT_BUTTON_SIZE - EDGE_PADDING);
        let newY = Math.min(Math.max(EDGE_PADDING, currentPos.y), height - CHAT_BUTTON_SIZE - EDGE_PADDING);

        const isHorizontalMovement = Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
        if (isHorizontalMovement) {
          newX = newX < width / 2 ? EDGE_PADDING : width - CHAT_BUTTON_SIZE - EDGE_PADDING;
        }

        Animated.spring(position, {
          toValue: { x: newX, y: newY },
          friction: 5,
          tension: 40,
          useNativeDriver: true
        }).start(() => {
          saveButtonPosition();
          setTimeout(() => {
            isDragging.current = false;
          }, 100);
        });
      },
      onPanResponderTerminate: () => {
        position.flattenOffset();
        isDragging.current = false;
      }
    })
  ).current;

  const handleButtonPress = () => {
    if (!isDragging.current) {
      setModalVisible(true);
    }
  };

  useEffect(() => {
    if (modalVisible && messages.length === 0) {
      setMessages([{
        text: '',
        sender: 'bot',
        timestamp: Date.now(),
        isTyping: true
      }]);

      setTimeout(() => {
        setMessages([{
          text: 'Hi there! How can I help you today?',
          sender: 'bot',
          timestamp: Date.now()
        }]);
      }, 2000);
    }
  }, [modalVisible]);

  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const minutesStr = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}:${minutesStr} ${ampm}`;
  };

  const navigateToProductDetails = (product: Product) => {
    setModalVisible(false);
    // @ts-ignore: Navigation params not typed
    navigation.navigate('ProductDetails', { product });
  };

  const navigateToStoreDetails = (store: Store) => {
    console.log('ChatBot - Store object before navigation:', store); // Add full store object logging

    // Ensure we pass the complete store object
    navigation.navigate('StoreDetails', { 
      store: {
        store_id: store.id,
        name: store.name,
        description: store.description || '',
        latitude: 0, // Required by Store interface
        longitude: 0, // Required by Store interface
        rating: store.rating || 0,
        store_image: store.store_image || null,
        type: store.type || null,
        operating_hours: store.operating_hours,
        phone: store.phone
      } 
    });
    
    setModalVisible(false);
  };

  const extractProducts = (message: string): Product[] | undefined => {
    console.log(`Extracting products from message: "${message}"`);
    if (
      message.toLowerCase().includes("products") ||
      message.toLowerCase().includes("we have") ||
      message.toLowerCase().includes("you've got these") ||
      message.toLowerCase().includes("here are") ||
      message.includes(":")
    ) {
      const productListMatch = message.match(/: (.*?)(?:$|\.)/);
      let potentialProducts: string[] = [];

      if (productListMatch && productListMatch[1]) {
        potentialProducts = productListMatch[1]
          .split(',')
          .map((p) => p.trim())
          .filter((p) => p.length > 2 && p.match(/[A-Za-z]/))
          .map((name) => name.trim().replace(/[^A-Za-z\s.]/g, ""))
      } else {
        potentialProducts = message
          .split(/,|and/)
          .map((p) => p.trim())
          .filter((p) => p.length > 2 && p.match(/[A-Za-z]/))
          .map((name) => name.trim().replace(/[^A-Za-z\s.]/g, ""))

      }

      if (potentialProducts.length > 0) {
        const products = potentialProducts.map((name) => ({ name, id: "" }));
        console.log(`Extracted products:`, products);
        return products;
      }
    }
    console.log('No products extracted');
    return undefined;
  };

  const cleanStoreName = (name: string): string => {
    // Remove text in parentheses and trim
    return name.replace(/\s*\([^)]*\)/g, '').trim();
  };

  const extractStores = async (message: string): Promise<Store[]> => {
    try {
      const townMatch = message.match(/stores in ([^:]+):/i);
      const town = townMatch ? townMatch[1].trim() : null;

      if (!town) {
        return [];
      }

      const storeListMatch = message.match(/:[^]*$/);
      if (!storeListMatch) {
        return [];
      }

      const storeNames = storeListMatch[0]
        .substring(1)
        .split(',')
        .map(name => cleanStoreName(name.trim()))
        .filter(name => name.length > 0);

      const mentionedStores: Store[] = [];

      for (const storeName of storeNames) {
        try {
          const searchUrl = `${BASE_URL}/stores/search_stores/${encodeURIComponent(storeName)}`;
          const searchResponse = await axios.get(searchUrl);

          if (searchResponse.data?.stores?.length > 0) {
            const store = searchResponse.data.stores[0];
            
            // Fetch products for this store
            const productsResponse = await axios.get(`${BASE_URL}/products/fetch_products`);
            const storeProducts = productsResponse.data.products.filter(
              (product: Product) => product.store_id === (store.store_id || store.id)
            );
            
            console.log('ChatBot - Found products for store:', {
              store_name: store.name,
              products_count: storeProducts.length
            });

            mentionedStores.push({
              id: store.store_id,
              name: store.name,
              description: store.description,
              store_image: store.store_image || store.image_url,
              rating: store.rating,
              type: store.type,
              operating_hours: store.operating_hours,
              phone: store.phone,
              products: storeProducts // Add the products array here
            });
          } else {
            // Try searching with just the first word of the store name
            const firstWord = storeName.split(' ')[0];
            const fallbackUrl = `${BASE_URL}/stores/search_stores/${encodeURIComponent(firstWord)}`;

            const fallbackResponse = await axios.get(fallbackUrl);
            if (fallbackResponse.data?.stores?.length > 0) {
              const store = fallbackResponse.data.stores[0];
              
              // Fetch products for fallback store
              const productsResponse = await axios.get(`${BASE_URL}/products/fetch_products`);
              const storeProducts = productsResponse.data.products.filter(
                (product: Product) => product.store_id === (store.store_id || store.id)
              );

              console.log('ChatBot - Found products for fallback store:', {
                store_name: store.name,
                products_count: storeProducts.length
              });

              mentionedStores.push({
                id: store.store_id,
                name: store.name,
                description: store.description,
                store_image: store.store_image || store.image_url,
                rating: store.rating,
                type: store.type,
                operating_hours: store.operating_hours,
                phone: store.phone,
                products: storeProducts // Add the products array here
              });
            }
          }
        } catch (error) {
          console.error('Error processing store:', storeName, error);
        }
      }

      return mentionedStores;
    } catch (error) {
      console.error('Error in extractStores:', error);
      return [];
    }
  };


  const sendMessage = async (message: string) => {
    if (!message.trim()) return;

    const userMessage: Message = {
      text: message,
      sender: 'user',
      timestamp: Date.now()
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    setMessages((prev) => [
      ...prev,
      {
        text: '',
        sender: 'bot',
        timestamp: Date.now(),
        isTyping: true
      }
    ]);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1000));

      const response = await axios.post(
        `${RASA_URL}/webhooks/rest/webhook`,
        {
          sender: 'user',
          message: message,
        }
      );

      console.log('Rasa response:', JSON.stringify(response.data, null, 2));

      setMessages((prev) => prev.filter(msg => !msg.isTyping));

      const botResponses = response.data as { text: string }[];
      if (botResponses.length > 0) {
        for (const botMsg of botResponses) {
          const products = extractProducts(botMsg.text);
          const stores = await extractStores(botMsg.text);

          const botMessage: Message = {
            text: botMsg.text,
            sender: 'bot',
            timestamp: Date.now(),
            products,
            stores
          };
          setMessages((prev) => [...prev, botMessage]);
        }
      } else {
        setMessages((prev) => [...prev, {
          text: "I didn't understand that. Could you please rephrase?",
          sender: 'bot',
          timestamp: Date.now()
        }]);
      }
    } catch (error) {
      console.log('Error communicating with Rasa:', error);

      setMessages((prev) => prev.filter(msg => !msg.isTyping));

      setMessages((prev) => [...prev, {
        text: 'Oops! It seems there\'s a server problem. Please try again later or contact support if the issue persists.',
        sender: 'bot',
        timestamp: Date.now(),
        isError: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderTypingAnimation = () => {
    return (
      <View style={styles.typingContainer}>
        <View style={styles.typingDot} />
        <Animated.View
          style={[
            styles.typingDot,
            {
              opacity: typingAnimation.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [0.3, 1, 0.3]
              })
            }
          ]}
        />
        <Animated.View
          style={[
            styles.typingDot,
            {
              opacity: typingAnimation.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [0.3, 0.3, 1]
              })
            }
          ]}
        />
      </View>
    );
  };

  const renderProductCards = (products: Product[]) => {
    if (!products || products.length === 0) {
      return null;
    }

    const availableProducts = products.filter(product => {
      const productInfo = productInfoMap[product.name];
      return productInfo && productInfo.id !== '' && !productInfo.isLoading;
    });

    if (availableProducts.length === 0) {
      const stillLoading = products.some(product => {
        const productInfo = productInfoMap[product.name];
        return productInfo && productInfo.isLoading;
      });

      if (stillLoading) {
        return (
          <View style={styles.loadingProductsContainer}>
            <ActivityIndicator size="small" color={COLORS.white} />
            <Text style={styles.loadingProductsText}>Loading products...</Text>
          </View>
        );
      }

      return null;
    }

    return (
      <View style={styles.productCardsContainer}>
        {availableProducts.map((product, index) => {
          const productInfo = productInfoMap[product.name];

          return (
            <TouchableOpacity
              key={`${product.name}-${index}`}
              style={[
                styles.productCard,
                availableProducts.length === 1 && styles.singleProductCard,
                availableProducts.length === 2 && styles.doubleProductCard,
              ]}
              onPress={() => navigateToProductDetails(productInfo)}
              activeOpacity={0.7}
            >
              <FastImage
                source={productInfo.image_urls?.[0] ? { uri: productInfo.image_urls[0] } : require('../assets/img/placeholder.png')}
                style={styles.productImage}
                resizeMode="cover"
              />
              <Text style={styles.productName} numberOfLines={2}>
                {product.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const StoreCard = React.memo(({ store }: { store: Store }) => {
    console.log('Rendering StoreCard for:', store);

    if (!store || !store.id) {
      console.log('❌ Invalid store data, skipping render');
      return null;
    }

    return (
      <TouchableOpacity
        style={styles.storeCard}
        onPress={() => navigateToStoreDetails(store)}
        activeOpacity={0.7}
      >
        <Image
          source={{
            uri: store.store_image || 'https://via.placeholder.com/50',
          }}
          style={styles.storeImage}
          defaultSource={require('../assets/img/events/culinary-arts.png')}
        />
        <View style={styles.storeInfo}>
          <Text style={styles.storeName} numberOfLines={1}>
            {store.name}
          </Text>
          <View style={styles.storeMetaInfo}>
            <View style={styles.ratingContainer}>
              <FontAwesomeIcon icon={faStar} color="#FDD700" size={12} />
              <Text style={styles.ratingText}>
                {store.rating?.toFixed(1) || '0.0'}
              </Text>
            </View>
            {store.type && (
              <Text style={styles.storeType} numberOfLines={1}>
                {store.type}
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  }, (prevProps, nextProps) => {
    // Implement a proper equality check to prevent unnecessary re-renders
    return prevProps.store.id === nextProps.store.id &&
      prevProps.store.name === nextProps.store.name;
  });


  const renderStoreCards = (stores: Store[]) => {
    console.log('=== RENDERING STORE CARDS ===');
    console.log('Received stores:', stores);

    if (!stores || stores.length === 0) {
      console.log('❌ No stores to render');
      return null;
    }

    const availableStores = stores.filter(store => store && store.id);
    console.log('Filtered valid stores:', availableStores);

    if (availableStores.length === 0) {
      console.log('❌ No valid stores after filtering');
      return null;
    }

    console.log('✅ Rendering store cards for:', availableStores.length, 'stores');
    return (
      <View style={styles.storeCardsContainer}>
        {availableStores.map((store) => (
          <StoreCard
            key={store.id}
            store={store}
          />
        ))}
      </View>
    );
  };
  const renderErrorMessage = (message: string) => {
    return (
      <View style={styles.errorContainer}>
        <FontAwesomeIcon icon={faInfoCircle} color={COLORS.red} size={FONT_SIZE.medium} />
        <Text style={styles.errorText}>{message}</Text>
      </View>
    );
  };

  const Message = React.memo(({
    item,
    index,
    messagesLength,
    productInfoMap,
    storeInfoMap
  }: {
    item: Message;
    index: number;
    messagesLength: number;
    productInfoMap: Record<string, any>;
    storeInfoMap: Record<string, any>;
  }) => {
    const isLastMessage = index === messagesLength - 1;
    const showTime = index === messagesLength - 1 ||
      messages[index + 1]?.sender !== item.sender;

    if (item.isTyping) {
      return (
        <View style={styles.messageWrapper}>
          <View style={styles.botIconContainer}>
            <FastImage
              source={require('../assets/img/elyubot_bg.png')}
              resizeMode='cover'
              style={styles.botIcon}
            />
          </View>
          <View style={[styles.messageContainer, styles.botMessage, styles.typingMessageContainer]}>
            {renderTypingAnimation()}
          </View>
        </View>
      );
    }

    return (
      <View style={styles.messageWrapper}>
        {item.sender === 'bot' && (
          <View style={styles.botIconContainer}>
            <FastImage
              source={require('../assets/img/elyubot_bg.png')}
              resizeMode='cover'
              style={styles.botIcon}
            />
          </View>
        )}
        <View
          style={[
            styles.messageContainer,
            item.sender === 'user' ? styles.userMessage : styles.botMessage,
            isLastMessage && styles.lastMessage,
            item.isError && styles.errorMessageContainer
          ]}
        >
          {item.isError ? (
            renderErrorMessage(item.text)
          ) : (
            <Text style={[
              styles.messageText,
              item.sender === 'user' ? styles.userMessageText : styles.botMessageText
            ]}>
              {item.text}
            </Text>
          )}

          {item.products && item.products.length > 0 && renderProductCards(item.products)}
          {item.stores && item.stores.length > 0 && renderStoreCards(item.stores)}

          {showTime && (
            <Text style={styles.timestamp}>{formatTime(item.timestamp)}</Text>
          )}
        </View>
        {item.sender === 'user' && <View style={styles.userIconSpace} />}
      </View>
    );
  });

  const BetaNotice = () => {
    const fadeAnim = useRef(new Animated.Value(1)).current;

    const handleDismiss = async () => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true
      }).start(async () => {
        try {
          await AsyncStorage.setItem('betaNoticeDismissed', 'true');
          setShowBetaNotice(false);
        } catch (error) {
          console.log('Error saving beta notice status:', error);
        }
      });
    };

    if (!showBetaNotice) return null;

    return (
      <Animated.View style={[styles.betaNoticeContainer, { opacity: fadeAnim }]}>
        <View style={styles.betaNoticeContent}>
          <View style={styles.betaTag}>
            <Text style={styles.betaTagText}>BETA</Text>
          </View>
          <Text style={styles.betaNoticeText}>
            This AI assistant is currently in beta and may have limited knowledge. It works best with simple queries about La Union's local products and stores.
          </Text>
        </View>
        <TouchableOpacity
          onPress={handleDismiss}
          style={styles.dismissButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <FontAwesomeIcon
            icon={faXmark}
            color={COLORS.gray}
            size={16}
          />
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <>
      <Animated.View
        style={[
          styles.floatingButtonContainer,
          {
            transform: [
              { translateX: position.x },
              { translateY: position.y },
            ],
          }
        ]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleButtonPress}
          style={styles.buttonTouchArea}
        >
          <FastImage
            source={require('../assets/vid/elyubot.gif')}
            resizeMode='cover'
            style={styles.elyubot}
          />
        </TouchableOpacity>
      </Animated.View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <FastImage
                source={require('../assets/img/elyubot_thumbs.png')}
                resizeMode='cover'
                style={styles.headerBotIcon}
              />
              <View style={styles.modalTitleContainer}>
                <Text style={styles.modalTitle}>Elyu Bot</Text>
                <Text style={styles.modalSubtitle}>Always here to help</Text>
              </View>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <FontAwesomeIcon icon={faClose} color={COLORS.gray} size={FONT_SIZE.large} />
              </TouchableOpacity>
            </View>

            <BetaNotice />

            <View style={styles.scrollIndicator}>
              <FontAwesomeIcon icon={faChevronDown} color={COLORS.gray} size={FONT_SIZE.small} />
            </View>

            <View style={styles.flatlistContainer}>
              <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={({ item, index }) => (
                  <Message
                    item={item}
                    index={index}
                    messagesLength={messages.length}
                    productInfoMap={productInfoMap}
                    storeInfoMap={storeInfoMap}
                  />
                )}
                keyExtractor={(item, index) => `${item.sender}-${item.timestamp}-${index}`}
                style={styles.messageList}
                contentContainerStyle={styles.messageListContent}
                ListFooterComponent={<View style={styles.messageFooterSpace} />}
                showsVerticalScrollIndicator={false}
                removeClippedSubviews={true}
                maxToRenderPerBatch={10}
                windowSize={10}
                initialNumToRender={10}
              />
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={input}
                onChangeText={setInput}
                placeholder="Type a message..."
                placeholderTextColor={COLORS.gray}
                multiline
                maxLength={500}
              />
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  !input.trim() && styles.sendButtonDisabled
                ]}
                onPress={() => sendMessage(input)}
                disabled={!input.trim() || isLoading}
              >
                <FontAwesomeIcon
                  icon={faPaperPlane}
                  size={FONT_SIZE.medium}
                  color={input.trim() ? COLORS.white : COLORS.lightgray}
                />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  floatingButtonContainer: {
    position: 'absolute',
    width: CHAT_BUTTON_SIZE,
    height: CHAT_BUTTON_SIZE,
    borderRadius: CHAT_BUTTON_RADIUS,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  buttonTouchArea: {
    width: CHAT_BUTTON_SIZE,
    height: CHAT_BUTTON_SIZE,
    borderRadius: CHAT_BUTTON_RADIUS,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  elyubot: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    height: '80%',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingBottom: FONT_SIZE.medium,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: FONT_SIZE.large,
    paddingHorizontal: FONT_SIZE.medium,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.container,
  },
  headerBotIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: FONT_SIZE.medium,
  },
  modalTitleContainer: {
    flex: 1,
  },
  modalTitle: {
    fontSize: FONT_SIZE.large,
    fontFamily: FONTS.bold,
    color: COLORS.black
  },
  modalSubtitle: {
    fontSize: FONT_SIZE.small,
    fontFamily: FONTS.regular,
    color: COLORS.gray,
  },
  closeButton: {
    padding: FONT_SIZE.medium,
  },
  scrollIndicator: {
    alignItems: 'center',
    paddingVertical: FONT_SIZE.extraSmall,
  },
  flatlistContainer: {
    flex: 1,
  },
  messageList: {
    flex: 1,
  },
  messageListContent: {
    paddingHorizontal: FONT_SIZE.medium,
    paddingBottom: FONT_SIZE.large,
  },
  messageFooterSpace: {
    height: FONT_SIZE.xxLarge,
  },
  messageWrapper: {
    flexDirection: 'row',
    marginVertical: FONT_SIZE.small,
    alignItems: 'flex-end',
  },
  botIconContainer: {
    width: 30,
    height: 30,
    marginRight: 8,
  },
  botIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  userIconSpace: {
    width: 30,
    marginLeft: 8,
  },
  messageContainer: {
    maxWidth: '75%',
    padding: FONT_SIZE.medium,
    borderRadius: 18,
    minWidth: 80,
  },
  lastMessage: {
    marginBottom: FONT_SIZE.small,
  },
  userMessage: {
    backgroundColor: COLORS.primary,
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
    marginLeft: 'auto',
  },
  botMessage: {
    backgroundColor: COLORS.highlight,
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
    marginRight: 'auto',
  },
  typingMessageContainer: {
    minHeight: 40,
    justifyContent: 'center',
    paddingHorizontal: FONT_SIZE.large,
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.white,
    marginHorizontal: 2,
  },
  messageText: {
    fontSize: FONT_SIZE.medium,
    fontFamily: FONTS.regular,
    lineHeight: 22,
  },
  userMessageText: {
    color: COLORS.white,
  },
  botMessageText: {
    color: COLORS.white,
  },
  timestamp: {
    fontSize: FONT_SIZE.extraSmall,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 5,
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: FONT_SIZE.medium,
    paddingVertical: FONT_SIZE.small,
    borderTopWidth: 1,
    borderTopColor: COLORS.container,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.container,
    borderRadius: 20,
    paddingHorizontal: FONT_SIZE.medium,
    paddingVertical: FONT_SIZE.small,
    marginRight: FONT_SIZE.medium,
    color: COLORS.black,
    maxHeight: 100,
    minHeight: 45,
    backgroundColor: COLORS.container,
    fontFamily: FONTS.regular,
  },
  sendButton: {
    backgroundColor: COLORS.highlight,
    borderRadius: 22,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.container,
    elevation: 0,
    shadowOpacity: 0,
  },
  productCardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: FONT_SIZE.medium,
    marginBottom: FONT_SIZE.small,
  },
  productCard: {
    width: '31%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    padding: 6,
    marginBottom: 5,
    marginRight: '2%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  loadingProductsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: FONT_SIZE.medium,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 8,
    borderRadius: 8,
  },
  loadingProductsText: {
    color: COLORS.white,
    marginLeft: 8,
    fontSize: FONT_SIZE.small,
    fontFamily: FONTS.regular,
  },
  productImage: {
    width: 40,
    height: 40,
    borderRadius: 5,
    marginBottom: 4,
  },
  productName: {
    fontSize: FONT_SIZE.extraSmall,
    fontFamily: FONTS.medium,
    color: COLORS.white,
    textAlign: 'center',
  },
  errorMessageContainer: {
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  errorText: {
    color: '#991B1B',
    fontSize: 14,
    fontFamily: FONTS.regular,
    lineHeight: 20,
  },
  betaNoticeContainer: {
    backgroundColor: 'rgba(66, 153, 225, 0.1)',
    padding: FONT_SIZE.medium,
    marginHorizontal: FONT_SIZE.medium,
    marginVertical: FONT_SIZE.small,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(66, 153, 225, 0.2)',
    justifyContent: 'space-between',
  },
  betaNoticeContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: FONT_SIZE.small,
  },
  betaTag: {
    backgroundColor: '#4299E1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: FONT_SIZE.small,
  },
  betaTagText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.small,
    fontFamily: FONTS.bold,
  },
  betaNoticeText: {
    flex: 1,
    color: '#2C5282',
    fontSize: FONT_SIZE.small,
    fontFamily: FONTS.regular,
    lineHeight: 18,
  },
  dismissButton: {
    padding: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(66, 153, 225, 0.1)',
  },
  singleProductCard: {
    width: '60%',
    marginRight: 0,
  },
  doubleProductCard: {
    width: '48%',
    marginRight: '2%',
  },
  storeCardsContainer: {
    flexDirection: 'column',
    marginTop: FONT_SIZE.medium,
    marginBottom: FONT_SIZE.small,
  },
  storeCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  productPreview: {
    marginTop: 4,
  },
  productPreviewText: {
    fontSize: FONT_SIZE.small,
    color: COLORS.white,
    opacity: 0.8,
    fontFamily: FONTS.regular,
  },
  storeImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 8,
  },
  storeInfo: {
    flex: 1,
  },
  storeName: {
    fontSize: FONT_SIZE.medium,
    fontFamily: FONTS.medium,
    color: COLORS.white,
    marginBottom: 2,
  },
  storeMetaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  ratingText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.small,
    marginLeft: 4,
    fontFamily: FONTS.medium,
  },
  storeType: {
    color: COLORS.white,
    fontSize: FONT_SIZE.small,
    opacity: 0.8,
    fontFamily: FONTS.regular,
  },
  placeholderImage: {
    backgroundColor: COLORS.lightBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingStoresContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: FONT_SIZE.medium,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 8,
    borderRadius: 8,
  },
  loadingStoresText: {
    color: COLORS.white,
    marginLeft: 8,
    fontSize: FONT_SIZE.small,
    fontFamily: FONTS.regular,
  },
});

export default Chatbot;
