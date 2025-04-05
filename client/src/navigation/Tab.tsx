import React, { useRef, useState, useCallback, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet, Dimensions, Animated, NativeSyntheticEvent, NativeScrollEvent, BackHandler, Alert } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faHome, faCog, faMap, faBox, faCity } from '@fortawesome/free-solid-svg-icons';
import Home from '../pages/Home';
import Products from '../pages/Products';
import Map from '../pages/Map';
import Settings from '../pages/Settings';
import Municipalities from '../pages/Municipality';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

const Tab = createBottomTabNavigator();
const { width } = Dimensions.get('window');

const TabNavigator: React.FC = () => {
  const tabBarTranslate = useRef(new Animated.Value(0)).current;
  const [isNavVisible, setIsNavVisible] = useState(true);
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  const lastScrollY = useRef(0);
  const isScrollingDown = useRef(false);
  const scrollTimer = useRef<NodeJS.Timeout | null>(null);
  const isTouching = useRef(false);
  
  console.log("TabNavigator - Mounted");
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

      // If there's a previous screen in the stack (e.g., ProductDetails), go back to it
      if (navigation.canGoBack()) {
        const currentRoute = navState.routes[navState.index];
        const nestedState = currentRoute.state;
        // Type guard for nestedState.index
        const activeScreen = nestedState && typeof nestedState.index === 'number' 
          ? nestedState.routes[nestedState.index]?.name 
          : undefined;
        console.log('Current active screen:', activeScreen || 'Unknown');
        console.log('Going back to previous screen');
        navigation.goBack();
        return true; // Prevent default back behavior
      }

      // If on a top-level tab screen other than Home, navigate to Home
      if (currentTabRouteName !== 'Home') {
        console.log('Navigating to Home from:', currentTabRouteName);
        navigation.navigate('Home');
        return true; // Prevent default back behavior
      }

      // If on Home and no previous screen, show exit alert
      console.log('Already on Home, showing exit alert');
      Alert.alert(
        'Hold on!',
        'Do you want to exit the app?',
        [
          { text: 'Cancel', style: 'cancel', onPress: () => console.log('Cancel pressed, staying on Home') },
          { 
            text: 'Exit', 
            onPress: () => {
              console.log('Exit pressed, attempting to close app');
              BackHandler.exitApp();
            }
          },
        ],
        { cancelable: false }
      );
      return true; // Prevent default back behavior
    };

    console.log('Registering BackHandler listener');
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => {
      console.log('Removing BackHandler listener');
      backHandler.remove();
    };
  }, [navigation]);

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
                  color={focused ? '#ffa726' : '#bdbdbd'}
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
                  color={focused ? '#ffa726' : '#bdbdbd'}
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
                  color={focused ? '#ffa726' : '#bdbdbd'}
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
                  color={focused ? '#ffa726' : '#bdbdbd'}
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
                  color={focused ? '#ffa726' : '#bdbdbd'}
                />
              </View>
            ),
          }}
          name="Settings"
          component={Settings}
        />
      </Tab.Navigator>
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
});

export default TabNavigator;