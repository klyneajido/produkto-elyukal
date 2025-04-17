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
  Pressable,
} from 'react-native';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faClose, faPaperPlane, faChevronDown, faInfoCircle, faShoppingBag, faXmark } from '@fortawesome/free-solid-svg-icons';
import { ipaddress } from '../config/config';
import { COLORS, FONT_SIZE, FONTS } from '../assets/constants/constant';
import FastImage from 'react-native-fast-image';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
interface Message {
  text: string;
  sender: 'user' | 'bot';
  timestamp: number;
  products?: Product[];
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

const { width, height } = Dimensions.get('window');

const CHAT_BUTTON_SIZE = 70;
const CHAT_BUTTON_RADIUS = CHAT_BUTTON_SIZE / 2;
const BUTTON_POSITION_KEY = 'chatbot_button_position';
const EDGE_PADDING = 10;
const TYPING_DOTS_DURATION = 500;
const API_BASE_URL = `http://${ipaddress}:8000`; // FastAPI server URL

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>('');
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [typingAnimation] = useState(new Animated.Value(0));
  const [productInfoMap, setProductInfoMap] = useState<{ [name: string]: Product }>({});
  const [showBetaNotice, setShowBetaNotice] = useState(true);
  
  const navigation = useNavigation();
  const flatListRef = useRef<FlatList>(null);
  const position = useRef(new Animated.ValueXY({ 
    x: width - CHAT_BUTTON_SIZE - EDGE_PADDING, 
    y: height - 180 
  })).current;
  
  const isDragging = useRef(false);

  // Load saved position on mount and handle orientation changes
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

  // Typing animation
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

  // Fetch product info when products are detected
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.products && lastMessage.products.length > 0) {
      lastMessage.products.forEach(product => {
        if (!productInfoMap[product.name]) {
          // Set initial loading state
          setProductInfoMap(prev => ({
            ...prev,
            [product.name]: {
              id: '',
              name: product.name,
              isLoading: true
            }
          }));
          
          // Search for product in database
          searchProductByName(product.name);
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
        // Prioritize exact match, fallback to first result
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
        // No match found
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

  // Add welcome message when chat is opened
  useEffect(() => {
    if (modalVisible && messages.length === 0) {
      // Add typing indicator
      setMessages([{
        text: '',
        sender: 'bot',
        timestamp: Date.now(),
        isTyping: true
      }]);

      // After 2 seconds, replace typing indicator with welcome message
      setTimeout(() => {
        setMessages([{
          text: 'Hi there! How can I help you today?',
          sender: 'bot',
          timestamp: Date.now()
        }]);
      }, 2000);
    }
  }, [modalVisible]);

  // Scroll to the latest message
  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  // Format timestamp
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

  // Navigate to product details
  const navigateToProductDetails = (product: Product) => {
    setModalVisible(false);
    // @ts-ignore: Navigation params not typed
    navigation.navigate('ProductDetails', { product });
  };

  const extractProducts = (message: string): Product[] | undefined => {
    console.log(`Extracting products from message: "${message}"`);
    // Check if message likely contains product listings
    if (
      message.toLowerCase().includes("products") ||
      message.toLowerCase().includes("we have") ||
      message.toLowerCase().includes("you've got these") ||
      message.toLowerCase().includes("here are") ||
      message.includes(":") // Look for colon-separated lists
    ) {
      // Extract the product list after a colon or similar marker
      const productListMatch = message.match(/: (.*?)(?:$|\.)/);
      let potentialProducts: string[] = [];

      if (productListMatch && productListMatch[1]) {
        // Split by commas, clean up each product name
        potentialProducts = productListMatch[1]
          .split(',')
          .map((p) => p.trim())
          .filter((p) => p.length > 2 && p.match(/[A-Za-z]/)) // Ensure valid name
          .map((name) => name.replace(/[^A-Za-z\s]/g, "")); // Clean special characters
      } else {
        // Fallback: Split by commas or "and" if no colon
        potentialProducts = message
          .split(/,|and/)
          .map((p) => p.trim())
          .filter((p) => p.length > 2 && p.match(/[A-Za-z]/))
          .map((name) => name.replace(/[^A-Za-z\s]/g, ""));
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

  // Send message to Rasa server
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

    // Add typing indicator
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
      // Delay to show typing animation (2-3 seconds)
      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1000));
      
      const response = await axios.post(
        `http://${ipaddress}:5055/webhooks/rest/webhook`,
        {
          sender: 'user',
          message: message,
        }
      );

      console.log('Rasa response:', JSON.stringify(response.data, null, 2));

      // Remove typing indicator
      setMessages((prev) => prev.filter(msg => !msg.isTyping));

      const botResponses = response.data as { text: string }[];
      if (botResponses.length > 0) {
        botResponses.forEach((botMsg) => {
          // Check if response contains products
          const products = extractProducts(botMsg.text);
          
          const botMessage: Message = {
            text: botMsg.text,
            sender: 'bot',
            timestamp: Date.now(),
            products
          };
          setMessages((prev) => [...prev, botMessage]);
        });
      } else {
        setMessages((prev) => [...prev, {
          text: "I didn't understand that. Could you please rephrase?",
          sender: 'bot',
          timestamp: Date.now()
        }]);
      }
    } catch (error) {
      console.log('Error communicating with Rasa:', error);
      
      // Remove typing indicator
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

  // Render typing animation
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
    return (
      <View style={styles.productCardsContainer}>
        {products.map((product, index) => {
          const productInfo = productInfoMap[product.name] || { id: '', isLoading: true };
          const isLoading = productInfo.isLoading;
          const hasValidId = productInfo.id !== '';

          return (
            <TouchableOpacity
              key={`${product.name}-${index}`} // Ensure unique key
              style={[styles.productCard, !hasValidId && !isLoading && styles.productCardDisabled]}
              onPress={() => {
                if (!isLoading && hasValidId) {
                  navigateToProductDetails(productInfo);
                }
              }}
              activeOpacity={0.7}
              disabled={isLoading || !hasValidId}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <FastImage
                  source={productInfo.image_urls?.[0] ? { uri: productInfo.image_urls[0] } : require('../assets/img/placeholder.png')}
                  style={styles.productImage}
                  resizeMode="cover"
                />
              )}
              <Text style={styles.productName} numberOfLines={2}>
                {product.name}
              </Text>
              {!hasValidId && !isLoading && (
                <Text style={styles.productNotFoundText}>Not available</Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };  

  // Render error message with improved styling
  const renderErrorMessage = (message: string) => {
    return (
      <View style={styles.errorContainer}>
        <FontAwesomeIcon icon={faInfoCircle} color={COLORS.red} size={FONT_SIZE.medium} />
        <Text style={styles.errorText}>{message}</Text>
      </View>
    );
  };

  // Render individual message
  const renderMessage = ({ item, index }: { item: Message, index: number }) => {
    const isLastMessage = index === messages.length - 1;
    const nextMessage = index < messages.length - 1 ? messages[index + 1] : null;
    const showTime = !nextMessage || nextMessage.sender !== item.sender;

    // Handle typing animation
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
          
          {showTime && (
            <Text style={styles.timestamp}>{formatTime(item.timestamp)}</Text>
          )}
        </View>
        {item.sender === 'user' && <View style={styles.userIconSpace} />}
      </View>
    );
  };

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
      {/* Draggable Floating Chat Button */}
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

      {/* Chat Modal */}
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
                renderItem={renderMessage}
                keyExtractor={(item, index) => `${item.sender}-${item.timestamp}-${index}`} // Ensure unique keys
                style={styles.messageList}
                contentContainerStyle={styles.messageListContent}
                ListFooterComponent={<View style={styles.messageFooterSpace} />}
                showsVerticalScrollIndicator={false}
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

// Styles remain unchanged
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
    justifyContent: 'space-between',
    marginTop: FONT_SIZE.medium,
    marginBottom: FONT_SIZE.small,
  },
  productCard: {
    width: '31%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    padding: 6,
    marginBottom: 5,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  productCardDisabled: {
    opacity: 0.6,
    backgroundColor: COLORS.gray,
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
  productNotFoundText: {
    fontSize: FONT_SIZE.extraSmall,
    fontFamily: FONTS.regular,
    color: COLORS.red,
    marginTop: 4,
  },
  errorMessageContainer: {
    backgroundColor: 'rgba(255, 200, 200, 0.9)',
    borderLeftWidth: 3,
    borderLeftColor: COLORS.red,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorText: {
    fontSize: FONT_SIZE.medium,
    fontFamily: FONTS.regular,
    color: COLORS.darkGray,
    marginLeft: 8,
    flex: 1,
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
});

export default Chatbot;
