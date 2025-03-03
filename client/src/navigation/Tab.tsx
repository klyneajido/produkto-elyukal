import React, { useState, useRef } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet, TouchableOpacity, Dimensions, Animated } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faHome, faCog, faMap, faBox, faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';
import Home from '../pages/Home';
import Products from '../pages/Products';
import Map from '../pages/Map';
import Settings from '../pages/Settings';

const Tab = createBottomTabNavigator();
const { width } = Dimensions.get('window');

const TabNavigator: React.FC = () => {
  const [isNavVisible, setIsNavVisible] = useState(true);
  const tabBarAnim = useRef(new Animated.Value(0)).current; // Tab bar position
  const toggleAnim = useRef(new Animated.Value(100)).current; // Toggle button position (starts hidden)

  const toggleNavigation = () => {
    const tabBarToValue = isNavVisible ? 100 : 0; // Down to hide, up to show
    const toggleToValue = isNavVisible ? 0 : 100; // Up to show, down to hide

    Animated.parallel([
      Animated.timing(tabBarAnim, {
        toValue: tabBarToValue,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(toggleAnim, {
        toValue: toggleToValue,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => setIsNavVisible(!isNavVisible));
  };

  const tabBarTranslateY = tabBarAnim.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 100], // Slide down to hide
  });

  const toggleTranslateY = toggleAnim.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 100], // Slide down to hide
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
          component={Home}
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
          component={Products}
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
        <Tab.Screen
          options={{
            tabBarIcon: () => (
              <TouchableOpacity
                style={styles.iconContainer}
                onPress={toggleNavigation}
              >
                <FontAwesomeIcon
                  icon={faMinus}
                  size={24}
                  color="#ffa726"
                />
              </TouchableOpacity>
            ),
          }}
          name="Toggle"
          component={View} // Placeholder, not rendered
        />
      </Tab.Navigator>

      <Animated.View
        style={[
          styles.floatingToggleButton,
          { transform: [{ translateY: toggleTranslateY }] },
        ]}
      >
        <TouchableOpacity onPress={toggleNavigation}>
          <FontAwesomeIcon icon={faPlus} size={24} color="#ffa726" />
        </TouchableOpacity>
      </Animated.View>
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
  floatingToggleButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: 'white',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 10,
    elevation: 5,
  },
});

export default TabNavigator;