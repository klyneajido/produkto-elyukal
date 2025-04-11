import React, { useRef, useState, useCallback, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet, Dimensions, Animated, NativeSyntheticEvent, NativeScrollEvent, BackHandler, Text, TouchableOpacity, Modal } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faHome, faCog, faMap, faBox, faCity } from '@fortawesome/free-solid-svg-icons';
import Home from '../pages/Home';
import Products from '../pages/Products';
import Map from '../pages/Map';
import Settings from '../pages/Settings';
import Municipalities from '../pages/Municipality';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS } from '../assets/constants/constant';

const Tab = createBottomTabNavigator();
const { width } = Dimensions.get('window');

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

  const lastScrollY = useRef(0);
  const isScrollingDown = useRef(false);
  const scrollTimer = useRef<NodeJS.Timeout | null>(null);
  const isTouching = useRef(false);
  useEffect(() => {
    return () => {
      if (scrollTimer.current) {
        clearTimeout(scrollTimer.current);
      }
    };
  }, []);

  const showNavbar = useCallback(() => {
    Animated.spring(tabBarTranslate, {
      toValue: 0,
      useNativeDriver: true,
      tension: 80,
      friction: 12,
    }).start(() => setIsNavVisible(true));
  }, [tabBarTranslate]);

  const hideNavbar = useCallback(() => {
    Animated.spring(tabBarTranslate, {
      toValue: 100,
      useNativeDriver: true,
      tension: 80,
      friction: 12,
    }).start(() => setIsNavVisible(false));
  }, [tabBarTranslate]);

  const handleTouchStart = useCallback(() => {
    isTouching.current = true;
    if (scrollTimer.current) {
      clearTimeout(scrollTimer.current);
      scrollTimer.current = null;
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    isTouching.current = false;
    if (scrollTimer.current) {
      clearTimeout(scrollTimer.current);
    }
    scrollTimer.current = setTimeout(() => {
      if (!isNavVisible) {
        showNavbar();
      }
    }, 1500);
  }, [isNavVisible, showNavbar]);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const currentScrollY = event.nativeEvent.contentOffset.y;
      const diff = currentScrollY - lastScrollY.current;
      lastScrollY.current = currentScrollY;

      if (Math.abs(diff) < 3) return;

      const newIsScrollingDown = diff > 0;
      if (newIsScrollingDown && isNavVisible) {
        hideNavbar();
        if (scrollTimer.current) {
          clearTimeout(scrollTimer.current);
          scrollTimer.current = null;
        }
      } else if (!newIsScrollingDown && !isNavVisible) {
        showNavbar();
      }
      isScrollingDown.current = newIsScrollingDown;

      if (!isTouching.current) {
        if (scrollTimer.current) {
          clearTimeout(scrollTimer.current);
        }
        scrollTimer.current = setTimeout(() => {
          if (!isNavVisible) {
            showNavbar();
          }
        }, 1500);
      }
    },
    [isNavVisible, hideNavbar, showNavbar]
  );

  useEffect(() => {
    const backAction = () => {
      const navState = navigation.getState();
      const tabState = navState.routes.find((r) => r.name === 'Tabs')?.state;
      const currentTabRouteName = tabState?.routes[tabState.index || 0]?.name || 'Home';

      console.log('Back button pressed. Current tab route:', currentTabRouteName);
      console.log('Can go back:', navigation.canGoBack());

      if (navigation.canGoBack()) {
        const currentRoute = navState.routes[navState.index];
        const nestedState = currentRoute.state;
        const activeScreen = nestedState && typeof nestedState.index === 'number' 
          ? nestedState.routes[nestedState.index]?.name 
          : undefined;
        navigation.goBack();
        return true;
      }

      if (currentTabRouteName !== 'Home') {
        console.log('Navigating to Home from:', currentTabRouteName);
        navigation.navigate('Home');
        return true;
      }

      console.log('Already on Home, showing exit modal');
      setIsExitModalVisible(true);
      return true;
    };

    console.log('Registering BackHandler listener');
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => {
      console.log('Removing BackHandler listener');
      backHandler.remove();
    };
  }, [navigation]);

  const handleCancelExit = () => {
    setIsExitModalVisible(false);
    console.log('Cancel pressed, staying on Home');
  };

  const handleConfirmExit = () => {
    setIsExitModalVisible(false);
    console.log('Exit pressed, attempting to close app');
    BackHandler.exitApp();
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
              shadowOffset: { width: 0, height: 10 },
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
                  size={24}
                  color={focused ? COLORS.primary : '#bdbdbd'}
                />
              </View>
            ),
          }}
          name="Home"
          children={() => (
            <Home
              onScroll={handleScroll}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              onMomentumScrollEnd={() => {
                if (!isNavVisible) {
                  if (scrollTimer.current) {
                    clearTimeout(scrollTimer.current);
                  }
                  scrollTimer.current = setTimeout(showNavbar, 1500);
                }
              }}
            />
          )}
        />
        <Tab.Screen
          options={{
            headerShown: false,
            tabBarIcon: ({ focused }) => (
              <View style={styles.iconContainer}>
                <FontAwesomeIcon
                  icon={faBox}
                  size={24}
                  color={focused ? COLORS.primary : '#bdbdbd'}
                />
              </View>
            ),
          }}
          name="Products"
          children={({ navigation }) => (
            <Products
              navigation={navigation}
              onScroll={handleScroll}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              onMomentumScrollEnd={() => {
                if (!isNavVisible) {
                  if (scrollTimer.current) {
                    clearTimeout(scrollTimer.current);
                  }
                  scrollTimer.current = setTimeout(showNavbar, 1500);
                }
              }}
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
                  size={24}
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
                  icon={faCity}
                  size={24}
                  color={focused ? COLORS.primary : '#bdbdbd'}
                />
              </View>
            ),
          }}
          name="Municipalities"
          children={() => (
            <Municipalities
              onScroll={handleScroll}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              onMomentumScrollEnd={() => {
                if (!isNavVisible) {
                  if (scrollTimer.current) {
                    clearTimeout(scrollTimer.current);
                  }
                  scrollTimer.current = setTimeout(showNavbar, 1500);
                }
              }}
            />
          )}
        />
        <Tab.Screen
          options={{
            headerShown: false,
            tabBarIcon: ({ focused }) => (
              <View style={styles.iconContainer}>
                <FontAwesomeIcon
                  icon={faCog}
                  size={24}
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