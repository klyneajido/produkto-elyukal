import React, { useRef, useState, useCallback, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet, Dimensions, Animated, NativeSyntheticEvent, NativeScrollEvent, BackHandler, Text, TouchableOpacity, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS } from '../assets/constants/constant';

import Home from '../pages/Home';
import Products from '../pages/Products';
import Map from '../pages/Map';
import Settings from '../pages/Settings';
import Municipalities from '../pages/Municipality';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faBuilding, faHome, faCube, faMap, faCog } from '@fortawesome/free-solid-svg-icons';

const Tab = createBottomTabNavigator();
const { width } = Dimensions.get('window');

const NAVBAR_TIMER_DELAY = 1500; // Centralized timing constant

const ExitModal: React.FC<{ visible: boolean, onCancel: () => void, onExit: () => void }> = ({ visible, onCancel, onExit }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, fadeAnim]);

  return (
    <Modal transparent visible={visible} animationType="none">
      <View style={styles.modalOverlay}>
        <Animated.View style={[styles.modalContainer, { opacity: fadeAnim }]}>
          <Text style={styles.modalTitle}>Hold On!</Text>
          <Text style={styles.modalMessage}>Are you sure you want to exit the app?</Text>
          <View style={styles.modalButtonContainer}>
            <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={onCancel}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.modalButton, styles.exitButton]} onPress={onExit}>
              <Text style={styles.exitButtonText}>Exit</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const TabNavigator: React.FC = () => {
  const tabBarTranslate = useRef(new Animated.Value(0)).current;
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [isExitModalVisible, setIsExitModalVisible] = useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  // Refs for scroll management
  const lastScrollY = useRef(0);
  const isScrollingDown = useRef(false);
  const scrollTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isTouching = useRef(false);
  
  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (scrollTimerRef.current) {
        clearTimeout(scrollTimerRef.current);
      }
    };
  }, []);

  // Reset the show navbar timer - centralized function
  const resetNavbarTimer = useCallback(() => {
    if (scrollTimerRef.current) {
      clearTimeout(scrollTimerRef.current);
    }
    
    scrollTimerRef.current = setTimeout(() => {
      if (!isNavVisible) {
        showNavbar();
      }
    }, NAVBAR_TIMER_DELAY);
  }, [isNavVisible]);

  const showNavbar = useCallback(() => {
    // Cancel any existing timer when manually showing navbar
    if (scrollTimerRef.current) {
      clearTimeout(scrollTimerRef.current);
      scrollTimerRef.current = null;
    }
    
    // Set the state first to ensure consistent state
    setIsNavVisible(true);
    
    Animated.spring(tabBarTranslate, {
      toValue: 0,
      useNativeDriver: true,
      tension: 80,
      friction: 12,
    }).start();
  }, [tabBarTranslate]);

  const hideNavbar = useCallback(() => {
    // Cancel any existing timer when hiding navbar
    if (scrollTimerRef.current) {
      clearTimeout(scrollTimerRef.current);
      scrollTimerRef.current = null;
    }
    
    // Set the state first to ensure consistent state
    setIsNavVisible(false);
    
    Animated.spring(tabBarTranslate, {
      toValue: 100,
      useNativeDriver: true,
      tension: 80,
      friction: 12,
    }).start();
  }, [tabBarTranslate]);

  const handleTouchStart = useCallback(() => {
    isTouching.current = true;
    
    // Clear any existing timers when user touches screen
    if (scrollTimerRef.current) {
      clearTimeout(scrollTimerRef.current);
      scrollTimerRef.current = null;
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    isTouching.current = false;
    
    // Reset the timer when touch ends to show navbar after delay
    resetNavbarTimer();
  }, [resetNavbarTimer]);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const currentScrollY = event.nativeEvent.contentOffset.y;
      const diff = currentScrollY - lastScrollY.current;
      lastScrollY.current = currentScrollY;

      // Ignore small movements (threshold increased for better stability)
      if (Math.abs(diff) < 5) return;

      const newIsScrollingDown = diff > 0;
      
      // Only hide when actively scrolling down
      if (newIsScrollingDown && isNavVisible) {
        hideNavbar();
      } 
      // Show when scrolling up
      else if (!newIsScrollingDown && !isNavVisible) {
        showNavbar();
      }
      
      isScrollingDown.current = newIsScrollingDown;

      // If user isn't touching (could be momentum scroll), reset timer
      if (!isTouching.current && isScrollingDown.current) {
        resetNavbarTimer();
      }
    },
    [isNavVisible, hideNavbar, showNavbar, resetNavbarTimer]
  );

  const handleMomentumScrollEnd = useCallback(() => {
    // Always reset timer when scroll momentum ends
    resetNavbarTimer();
  }, [resetNavbarTimer]);

  useEffect(() => {
    const backAction = () => {
      const navState = navigation.getState();
      const tabState = navState.routes.find((r) => r.name === 'Tabs')?.state;
      const currentTabRouteName = tabState?.routes[tabState.index || 0]?.name || 'Home';
      
      if (navigation.canGoBack()) {
        navigation.goBack();
        return true;
      }

      if (currentTabRouteName !== 'Home') {
        navigation.navigate('Home');
        return true;
      }

      setIsExitModalVisible(true);
      return true;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [navigation]);

  const handleCancelExit = () => {
    setIsExitModalVisible(false);
  };

  const handleConfirmExit = () => {
    setIsExitModalVisible(false);
    BackHandler.exitApp();
  };

  // Prepare shared props for scrollable screens
  const scrollableScreenProps = {
    onScroll: handleScroll,
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd,
    onMomentumScrollEnd: handleMomentumScrollEnd
  };

  return (
    <View style={styles.container}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarShowLabel: false,
          tabBarStyle: [
            {
              backgroundColor: 'white',
              position: 'absolute',
              bottom: 30,
              marginHorizontal: 20,
              height: 60,
              borderRadius: 30,
              shadowColor: '#000',
              shadowOpacity: 0.1,
              shadowOffset: { width: 0, height: 5 },
              shadowRadius: 10,
              elevation: 5,
              width: width - 40,
              transform: [{ translateY: tabBarTranslate }],
            },
          ],
          tabBarActiveBackgroundColor: 'transparent',
          tabBarInactiveBackgroundColor: 'transparent',
        })}
      >
        <Tab.Screen
          options={{
            headerShown: false,
            tabBarIcon: ({ focused }) => (
              <View style={styles.iconContainer}>
                <FontAwesomeIcon
                  icon={faHome}
                  size={26}
                  color={focused ? COLORS.primary : '#bdbdbd'}
                />
              </View>
            ),
          }}
          name="Home"
          children={() => (
            <Home {...scrollableScreenProps} />
          )}
        />
        <Tab.Screen
          options={{
            headerShown: false,
            tabBarIcon: ({ focused }) => (
              <View style={styles.iconContainer}>
                <FontAwesomeIcon
                  icon={faCube}
                  size={26}
                  color={focused ? COLORS.primary : '#bdbdbd'}
                />
              </View>
            ),
          }}
          name="Products"
          children={({ navigation }) => (
            <Products
              navigation={navigation}
              {...scrollableScreenProps}
            />
          )}
        />
        <Tab.Screen
          options={{
            headerShown: false,
            tabBarIcon: ({ focused }) => (
              <View style={styles.iconContainer}>
                <FontAwesomeIcon
                  icon={faMap}
                  size={26}
                  color={focused ? COLORS.primary : '#bdbdbd'}
                />
              </View>
            ),
          }}
          name="Maps"
          component={Map}
        />
        <Tab.Screen
          options={{
            headerShown: false,
            tabBarIcon: ({ focused }) => (
              <View style={styles.iconContainer}>
                <FontAwesomeIcon
                  icon={faBuilding}
                  size={26}
                  color={focused ? COLORS.primary : '#bdbdbd'}
                />
              </View>
            ),
          }}
          name="Municipalities"
          children={() => (
            <Municipalities {...scrollableScreenProps} />
          )}
        />
        <Tab.Screen
          options={{
            headerShown: false,
            tabBarIcon: ({ focused }) => (
              <View style={styles.iconContainer}>
                <FontAwesomeIcon
                  icon={faCog}
                  size={26}
                  color={focused ? COLORS.primary : '#bdbdbd'}
                />
              </View>
            ),
          }}
          name="Settings"
          component={Settings}
        />
      </Tab.Navigator>
      <ExitModal
        visible={isExitModalVisible}
        onCancel={handleCancelExit}
        onExit={handleConfirmExit}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  iconContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: width * 0.8,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 10,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#e0e0e0',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  exitButton: {
    backgroundColor: '#ffa726',
  },
  exitButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
});

export default TabNavigator;