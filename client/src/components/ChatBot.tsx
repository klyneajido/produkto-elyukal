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
} from 'react-native';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faClose, faRobot, faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { ipaddress } from '../config/config';
import { COLORS, FONT_SIZE, FONTS } from '../assets/constants/constant';

interface Message {
  text: string;
  sender: 'user' | 'bot';
}

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>('');
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const flatListRef = useRef<FlatList>(null);

  // Add welcome message when chat is opened
  useEffect(() => {
    if (modalVisible && messages.length === 0) {
      setMessages([{ text: 'Hi there! How can I help you today?', sender: 'bot' }]);
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

  // Send message to Rasa server
  const sendMessage = async (message: string) => {
    if (!message.trim()) return;

    const userMessage: Message = { text: message, sender: 'user' };
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
          const botMessage: Message = { text: botMsg.text, sender: 'bot' };
          setMessages((prev) => [...prev, botMessage]);
        });
      } else {
        setMessages((prev) => [...prev, { text: "Sorry, I didn't get that!", sender: 'bot' }]);
      }
    } catch (error) {
      console.error('Error communicating with Rasa:', error);
      setMessages((prev) => [...prev, { text: 'Oops, something went wrong!', sender: 'bot' }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Render individual message
  const renderMessage = ({ item, index }: { item: Message, index: number }) => {
    const isLastMessage = index === messages.length - 1;
    
    return (
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
      </View>
    );
  };

  return (
    <>
      {/* Floating Chat Button */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => setModalVisible(true)}
      >
        <FontAwesomeIcon icon={faRobot} size={FONT_SIZE.large} color={COLORS.white} />
      </TouchableOpacity>

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
              <Text style={styles.modalTitle}>Chat with Produkto Bot</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <FontAwesomeIcon icon={faClose} color={COLORS.alert} size={FONT_SIZE.large} />
              </TouchableOpacity>
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

// Styles
const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 60,
    height: 60,
    backgroundColor: COLORS.secondary,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  flatlistContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    height: '70%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: FONT_SIZE.medium,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: FONT_SIZE.medium,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.container,
    marginBottom: FONT_SIZE.extraSmall,
  },
  modalTitle: {
    fontSize: FONT_SIZE.large,
    fontFamily: FONTS.bold,
    color: COLORS.black
  },
  closeButton: {
    padding: FONT_SIZE.extraSmall,
  },
  messageList: {
    flex: 1,
  },
  messageListContent: {
    paddingHorizontal: FONT_SIZE.medium,
    paddingBottom: FONT_SIZE.medium,
  },
  messageFooterSpace: {
    height: FONT_SIZE.xxLarge,  // Extra space at the bottom of message list
  },
  messageContainer: {
    maxWidth: '80%',
    padding: FONT_SIZE.medium,
    borderRadius: FONT_SIZE.medium,
    marginVertical: FONT_SIZE.small,
  },
  lastMessage: {
    marginBottom: FONT_SIZE.xxLarge,  // Extra margin for last message
  },
  userMessage: {
    backgroundColor: COLORS.primary,
    alignSelf: 'flex-end',
    borderBottomRightRadius: FONT_SIZE.extraSmall,
  },
  botMessage: {
    backgroundColor: COLORS.highlight,
    alignSelf: 'flex-start',
    borderBottomLeftRadius: FONT_SIZE.extraSmall,
  },
  messageText: {
    fontSize: FONT_SIZE.medium,
    fontFamily: FONTS.regular,
  },
  userMessageText: {
    color: COLORS.white,
  },
  botMessageText: {
    color: COLORS.white,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: FONT_SIZE.medium,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightgray,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.lightgray,
    borderRadius: 8,
    paddingHorizontal: FONT_SIZE.medium,
    paddingVertical: FONT_SIZE.small,
    marginRight: FONT_SIZE.medium,
    color: COLORS.black,
    maxHeight: 100,
    minHeight: 40,
  },
  sendButton: {
    backgroundColor: COLORS.highlight,
    borderRadius: 8,
    width: 45,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.container,
  },
});

export default Chatbot;