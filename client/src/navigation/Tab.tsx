import React, { useRef, useState } from 'react';
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
  const scrollY = useRef(new Animated.Value(0)).current; // Tracks scroll position
  const tabBarAnim = useRef(new Animated.Value(0)).current; // Controls tab bar animation
  const [lastScrollY, setLastScrollY] = useState(0); // Tracks previous scroll position
  const [isNavVisible, setIsNavVisible] = useState(true); // Tracks visibility state

  // Listen to scrollY changes to detect direction
  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: true,
      listener: (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const currentScrollY = event.nativeEvent.contentOffset.y;
        const diff = currentScrollY - lastScrollY;

        if (diff > 1 && isNavVisible) {
          // Scrolling down more than 2px, hide navbar
          Animated.timing(tabBarAnim, {
            toValue: 100,
            duration: 100,
            useNativeDriver: true,
          }).start(() => setIsNavVisible(false));
        } else if (diff < -1 && !isNavVisible) {
          // Scrolling up more than 2px, show navbar
          Animated.timing(tabBarAnim, {
            toValue: 0,
            duration: 100,
            useNativeDriver: true,
          }).start(() => setIsNavVisible(true));
        }

        setLastScrollY(currentScrollY);
      },
    }
  );

  const tabBarTranslateY = tabBarAnim.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 100], 
    extrapolate: 'clamp',
  });

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
              transform: [{ translateY: tabBarTranslateY }],
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