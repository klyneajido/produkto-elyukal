import React, { useRef, useState, useCallback } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet, Dimensions, Animated, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faHome, faCog, faMap, faBox } from '@fortawesome/free-solid-svg-icons';
import Home from '../pages/Home';
import Products from '../pages/Products';
import Map from '../pages/Map';
import Settings from '../pages/Settings';

const Tab = createBottomTabNavigator();
const { width } = Dimensions.get('window');

const TabNavigator: React.FC = () => {
  // Use a single Animated.Value for tab bar translation
  const tabBarTranslate = useRef(new Animated.Value(0)).current;
  
  // Track visibility state
  const [isNavVisible, setIsNavVisible] = useState(true);
  
  // Track scroll direction with refs to avoid re-renders
  const lastScrollY = useRef(0);
  const isScrollingDown = useRef(false);
  const scrollTimer = useRef<NodeJS.Timeout | null>(null);
  
  // Throttle scroll handling with useCallback to prevent excessive calculations
  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;
    const diff = currentScrollY - lastScrollY.current;
    
    // Update last scroll position
    lastScrollY.current = currentScrollY;
    
    // Determine scroll direction with sufficient threshold to avoid jitter
    if (Math.abs(diff) < 3) return; // Ignore small movements
    
    const newIsScrollingDown = diff > 0;
    
    // Only trigger animation when direction changes
    if (newIsScrollingDown !== isScrollingDown.current) {
      isScrollingDown.current = newIsScrollingDown;
      
      // Clear any pending timers
      if (scrollTimer.current) {
        clearTimeout(scrollTimer.current);
      }
      
      // Start animation
      if (newIsScrollingDown && isNavVisible) {
        Animated.spring(tabBarTranslate, {
          toValue: 100,
          useNativeDriver: true,
          tension: 80,
          friction: 12
        }).start(() => setIsNavVisible(false));
      } else if (!newIsScrollingDown && !isNavVisible) {
        Animated.spring(tabBarTranslate, {
          toValue: 0,
          useNativeDriver: true,
          tension: 80,
          friction: 12
        }).start(() => setIsNavVisible(true));
      }
    }
    
    // Debounce showing nav when scrolling stops
    if (scrollTimer.current) {
      clearTimeout(scrollTimer.current);
    }
    
    scrollTimer.current = setTimeout(() => {
      if (!isNavVisible) {
        Animated.spring(tabBarTranslate, {
          toValue: 0,
          useNativeDriver: true,
          tension: 80,
          friction: 12
        }).start(() => setIsNavVisible(true));
      }
    }, 500); // Show nav bar after 1.5 seconds of no scrolling
  }, [isNavVisible]);

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
          children={() => <Home onScroll={handleScroll} />}
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
          children={() => <Products onScroll={handleScroll} />}
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
          children={() => <Map/>}
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
          children={() => <Settings/>}
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