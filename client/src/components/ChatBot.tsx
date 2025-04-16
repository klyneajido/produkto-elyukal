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
} from 'react-native';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faClose, faPaperPlane, faChevronDown, faMinimize } from '@fortawesome/free-solid-svg-icons';
import { ipaddress } from '../config/config';
import { COLORS, FONT_SIZE, FONTS } from '../assets/constants/constant';
import FastImage from 'react-native-fast-image';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Message {
  text: string;
  sender: 'user' | 'bot';
  timestamp: number;
}

const { width, height } = Dimensions.get('window');

const CHAT_BUTTON_SIZE = 70;
const CHAT_BUTTON_RADIUS = CHAT_BUTTON_SIZE / 2;
const BUTTON_POSITION_KEY = 'chatbot_button_position';
const EDGE_PADDING = 10;

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>('');
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

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
      setMessages([{
        text: 'Hi there! How can I help you today?',
        sender: 'bot',
        timestamp: Date.now()
      }]);
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

    try {
      const response = await axios.post(
        `http://${ipaddress}:5055/webhooks/rest/webhook`,
        {
          sender: 'user',
          message: message,
        }
      );

      const botResponses = response.data as { text: string }[];
      if (botResponses.length > 0) {
        botResponses.forEach((botMsg) => {
          const botMessage: Message = {
            text: botMsg.text,
            sender: 'bot',
            timestamp: Date.now()
          };
          setMessages((prev) => [...prev, botMessage]);
        });
      } else {
        setMessages((prev) => [...prev, {
          text: "Sorry, I didn't get that!",
          sender: 'bot',
          timestamp: Date.now()
        }]);
      }
    } catch (error) {
      console.log('Error communicating with Rasa:', error);
      setMessages((prev) => [...prev, {
        text: 'Oops, something went wrong!',
        sender: 'bot',
        timestamp: Date.now()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Render individual message
  const renderMessage = ({ item, index }: { item: Message, index: number }) => {
    const isLastMessage = index === messages.length - 1;
    const nextMessage = index < messages.length - 1 ? messages[index + 1] : null;
    const showTime = !nextMessage || nextMessage.sender !== item.sender;

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
          ]}
        >
          <Text style={[
            styles.messageText,
            item.sender === 'user' ? styles.userMessageText : styles.botMessageText
          ]}>
            {item.text}
          </Text>
          {showTime && (
            <Text style={styles.timestamp}>{formatTime(item.timestamp)}</Text>
          )}
        </View>
        {item.sender === 'user' && <View style={styles.userIconSpace} />}
      </View>
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
                <Text style={styles.modalTitle}>Produkto Bot</Text>
                <Text style={styles.modalSubtitle}>Always here to help</Text>
              </View>
              <View style={styles.headerButtons}>
                <TouchableOpacity
                  style={styles.minimizeButton}
                  onPress={() => setModalVisible(false)}
                >
                  <FontAwesomeIcon icon={faMinimize} color={COLORS.gray} size={FONT_SIZE.medium} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setModalVisible(false)}
                >
                  <FontAwesomeIcon icon={faClose} color={COLORS.gray} size={FONT_SIZE.large} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.scrollIndicator}>
              <FontAwesomeIcon icon={faChevronDown} color={COLORS.gray} size={FONT_SIZE.small} />
            </View>

            <View style={styles.flatlistContainer}>
              <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderMessage}
                keyExtractor={(item, index) => `${item.sender}-${index}`}
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

// Updated Styles
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
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  minimizeButton: {
    padding: FONT_SIZE.extraSmall,
    marginRight: FONT_SIZE.small,
  },
  closeButton: {
    padding: FONT_SIZE.extraSmall,
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
});

export default Chatbot;